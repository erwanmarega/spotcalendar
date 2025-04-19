const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = "http://localhost:5173/callback";

app.get("/", (req, res) => {
  res.json({ message: "Bienvenue sur l'API de l'application spotify !" });
});

app.post("/api/token", async (req, res) => {
  console.log("Requête reçue pour /api/token, req.body :", req.body);
  const { code } = req.body;

  if (!code) {
    console.log("Erreur : Aucun code fourni dans la requête");
    return res.status(400).json({ error: "Aucun code fourni dans la requête" });
  }

  try {
    console.log("Backend : Configuration de la requête à Spotify");
    console.log("Client ID :", clientId || "MISSING");
    console.log("Client Secret :", clientSecret ? "[HIDDEN]" : "MISSING");
    console.log("Redirect URI :", redirectUri);
    console.log("Code reçu :", code);

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

    console.log("Backend : Réponse de Spotify :", response.data);

    res.cookie("access_token", response.data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: response.data.expires_in * 1000
    });
    res.cookie("refresh_token", response.data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000
    });
    res.cookie("expires_at", (Date.now() + response.data.expires_in * 1000).toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: response.data.expires_in * 1000
    });
    res.cookie("token_type", response.data.token_type || "Bearer", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: response.data.expires_in * 1000
    });

    res.json({ message: "Tokens stockés dans les cookies" });
  } catch (error) {
    console.error("Backend : Erreur complète lors de l'échange du code :", error);
    console.error("Backend : Données de l'erreur :", error.response?.data);
    console.error("Backend : Statut HTTP :", error.response?.status);
    console.error("Backend : Message d'erreur :", error.message);
    res.status(500).json({ error: "Échec de l'échange du code contre le jeton", details: error.response?.data });
  }
});

app.post("/api/refresh-token", async (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  console.log("Backend : Requête POST /api/refresh-token reçue avec refresh_token :", refreshToken);

  if (!refreshToken) {
    console.log("Erreur : Aucun refresh_token fourni");
    return res.status(400).json({ error: "Aucun refresh_token fourni" });
  }

  try {
    console.log("Backend : Envoi de la requête à Spotify pour rafraîchir le token");
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

    console.log("Backend : Réponse de Spotify :", response.data);

    res.cookie("access_token", response.data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: response.data.expires_in * 1000
    });
    res.cookie("expires_at", (Date.now() + response.data.expires_in * 1000).toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: response.data.expires_in * 1000
    });
    res.cookie("token_type", response.data.token_type || "Bearer", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
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
    console.error("Backend : Erreur complète lors du rafraîchissement du jeton :", error);
    console.error("Backend : Données de l'erreur :", error.response?.data);
    console.error("Backend : Statut HTTP :", error.response?.status);
    console.error("Backend : Message d'erreur :", error.message);
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

app.get("/api/spotify/*", async (req, res) => {
  const accessToken = req.cookies.access_token;
  if (!accessToken) {
    console.log("Erreur : Aucun token d'accès trouvé dans les cookies");
    return res.status(401).json({ error: "Aucun token d'accès" });
  }

  try {
    const spotifyUrl = `https://api.spotify.com/v1${req.url.replace("/api/spotify", "")}`;
    const response = await axios({
      method: "get",
      url: spotifyUrl,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
      res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: "Échec de la requête Spotify", details: error.response?.data });
  }
});

app.listen(3000, () => {
  console.log("Serveur démarré sur le port 3000");
});