const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cookieParser = require("cookie-parser");
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});

const db = require("./db");
const { sendMissedReleasesEmail, generateUnsubscribeToken, getUserIdFromToken } = require("./emailService");
const { computeMissedReleases } = require("./cronJob");

const app = express();

const allowedOrigins = process.env.NODE_ENV === "production"
  ? [process.env.VERCEL_URL, "https://spotcalendar.vercel.app"].filter(Boolean)
  : ["http://localhost:5173", "http://127.0.0.1:5173", "http://127.0.0.1:3000"];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origine non autorisée par CORS: ${origin}`));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;
if (!redirectUri) {
  throw new Error("REDIRECT_URI is not defined in .env file");
}

app.get("/", (req, res) => {
  res.json({ message: "Bienvenue sur l'API de l'application Spotify !" });
});

app.post("/api/token", async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Aucun code fourni dans la requête" });
  }

  try {
    const response = await axios({
      method: "post",
      url: "https://accounts.spotify.com/api/token",
      data: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    res.cookie("access_token", response.data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: response.data.expires_in * 1000
    });
    res.cookie("refresh_token", response.data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000
    });
    res.cookie("expires_at", (Date.now() + response.data.expires_in * 1000).toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: response.data.expires_in * 1000
    });
    res.cookie("token_type", response.data.token_type || "Bearer", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: response.data.expires_in * 1000
    });

    try {
      const meResponse = await axios.get("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${response.data.access_token}` },
      });
      const { id, email } = meResponse.data;
      if (id && email) {
        db.prepare(`
          INSERT INTO users (user_id, email, refresh_token)
          VALUES (?, ?, ?)
          ON CONFLICT(user_id) DO UPDATE SET
            email = excluded.email,
            refresh_token = excluded.refresh_token
        `).run(id, email, response.data.refresh_token);
      }
    } catch (dbErr) {
      console.error("Erreur lors de la persistance de l'utilisateur :", dbErr.message);
    }

    res.json({ message: "Tokens stockés dans les cookies" });
  } catch (error) {
    console.error("Erreur lors de l'échange du code :", error);
    console.error("Données de l'erreur :", error.response?.data);
    console.error("Statut HTTP :", error.response?.status);
    res.status(500).json({ error: "Échec de l'échange du code contre le jeton", details: error.response?.data });
  }
});

app.post("/api/refresh-token", async (req, res) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    return res.status(400).json({ error: "Aucun refresh_token fourni" });
  }

  try {
    const response = await axios({
      method: "post",
      url: "https://accounts.spotify.com/api/token",
      data: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    res.cookie("access_token", response.data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: response.data.expires_in * 1000
    });
    res.cookie("expires_at", (Date.now() + response.data.expires_in * 1000).toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: response.data.expires_in * 1000
    });
    res.cookie("token_type", response.data.token_type || "Bearer", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: response.data.expires_in * 1000
    });
    if (response.data.refresh_token) {
      res.cookie("refresh_token", response.data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000
      });
    }

    res.json({ message: "Tokens rafraîchis" });
  } catch (error) {
    console.error("Erreur lors du rafraîchissement du jeton :", error);
    console.error("Données de l'erreur :", error.response?.data);
    console.error("Statut HTTP :", error.response?.status);
    res.status(500).json({ error: "Échec du rafraîchissement du jeton", details: error.response?.data });
  }
});

app.get("/api/check-tokens", (req, res) => {
  res.json({
    access_token_exists: !!req.cookies.access_token,
    refresh_token_exists: !!req.cookies.refresh_token,
    expires_at: req.cookies.expires_at || null,
    token_type: req.cookies.token_type || null,
  });
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.clearCookie("expires_at");
  res.clearCookie("token_type");
  res.json({ message: "Déconnexion réussie, cookies supprimés" });
});

app.get("/api/spotify/:path(*)", async (req, res) => {
  const accessToken = req.cookies.access_token;
  console.log("Access Token:", accessToken);
  if (!accessToken) {
    return res.status(401).json({ error: "Aucun token d'accès" });
  }

  try {
    const queryString = req.url.includes("?") ? `?${req.url.split("?")[1]}` : "";
    const spotifyUrl = `https://api.spotify.com/v1/${req.params.path}${queryString}`;
    console.log("Spotify URL:", spotifyUrl); 
    const response = await axios({
      method: "get",
      url: spotifyUrl,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Erreur lors de la requête Spotify :", error);
    console.error("Données de l'erreur :", error.response?.data);
    console.error("Statut HTTP :", error.response?.status);
    res.status(error.response?.status || 500).json({ error: "Échec de la requête Spotify", details: error.response?.data });
  }
});

app.get("/api/missed-releases", async (req, res) => {
  const accessToken = req.cookies.access_token;
  if (!accessToken) {
    return res.status(401).json({ error: "Aucun token d'accès" });
  }

  try {
    const releases = await computeMissedReleases(accessToken);
    res.json(releases);
  } catch (error) {
    console.error("Erreur missed-releases :", error.message);
    res.status(error.response?.status || 500).json({ error: "Erreur lors du calcul des sorties manquées" });
  }
});

app.get("/api/email-preferences", async (req, res) => {
  const accessToken = req.cookies.access_token;
  if (!accessToken) {
    return res.status(401).json({ error: "Aucun token d'accès" });
  }

  try {
    const meResponse = await axios.get("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const user = db.prepare("SELECT email_notifications FROM users WHERE user_id = ?").get(meResponse.data.id);
    res.json({ enabled: user ? Boolean(user.email_notifications) : false });
  } catch (error) {
    console.error("Erreur email-preferences GET :", error.message);
    res.status(500).json({ error: "Erreur lors de la récupération des préférences" });
  }
});

app.post("/api/email-preferences", async (req, res) => {
  const accessToken = req.cookies.access_token;
  if (!accessToken) {
    return res.status(401).json({ error: "Aucun token d'accès" });
  }

  const { enabled } = req.body;
  if (typeof enabled !== "boolean") {
    return res.status(400).json({ error: "Le champ 'enabled' doit être un booléen" });
  }

  try {
    const meResponse = await axios.get("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    db.prepare("UPDATE users SET email_notifications = ? WHERE user_id = ?")
      .run(enabled ? 1 : 0, meResponse.data.id);
    res.json({ enabled });
  } catch (error) {
    console.error("Erreur email-preferences POST :", error.message);
    res.status(500).json({ error: "Erreur lors de la mise à jour des préférences" });
  }
});

app.get("/api/test-email", async (req, res) => {
  const accessToken = req.cookies.access_token;
  if (!accessToken) {
    return res.status(401).json({ error: "Aucun token d'accès" });
  }

  try {
    const meResponse = await axios.get("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const user = db.prepare("SELECT * FROM users WHERE user_id = ?").get(meResponse.data.id);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé en base" });
    }

    const releases = await computeMissedReleases(accessToken);
    if (releases.length === 0) {
      return res.json({ message: "Aucune sortie manquée, email non envoyé" });
    }

    const token = generateUnsubscribeToken(user.user_id);
    const unsubscribeUrl = `${process.env.SERVER_URL}/api/unsubscribe/${token}`;
    await sendMissedReleasesEmail(user.email, releases, unsubscribeUrl);
    res.json({ message: `Email de test envoyé à ${user.email} avec ${releases.length} sorties` });
  } catch (error) {
    console.error("Erreur test-email :", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/unsubscribe/:token", (req, res) => {
  const userId = getUserIdFromToken(req.params.token);

  if (!userId) {
    return res.status(400).send(`
      <!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Lien invalide</title></head>
      <body style="margin:0;background:#121212;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;">
        <div style="text-align:center;color:#fff;">
          <p style="font-size:48px;margin:0">❌</p>
          <h1 style="font-size:22px;margin:16px 0 8px">Lien invalide</h1>
          <p style="color:#B3B3B3;font-size:14px">Ce lien de désinscription est incorrect ou a expiré.</p>
        </div>
      </body></html>
    `);
  }

  db.prepare("UPDATE users SET email_notifications = 0 WHERE user_id = ?").run(userId);

  res.send(`
    <!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Désinscription confirmée</title></head>
    <body style="margin:0;background:#121212;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;">
      <div style="text-align:center;color:#fff;">
        <p style="font-size:48px;margin:0">✅</p>
        <h1 style="font-size:22px;margin:16px 0 8px">Tu es désinscrit</h1>
        <p style="color:#B3B3B3;font-size:14px">Tu ne recevras plus les emails hebdomadaires de SpotCalendar.</p>
        <p style="color:#535353;font-size:12px;margin-top:24px">Tu peux te réabonner à tout moment depuis l'application.</p>
      </div>
    </body></html>
  `);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});

module.exports = app;