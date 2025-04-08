const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = "http://localhost:5173/callback";

app.post("/api/token", async (req, res) => {
  const { code } = req.body;
  console.log("Backend : Requête POST /api/token reçue avec code :", code);

  try {
    console.log("Backend : Envoi de la requête à Spotify pour échanger le code");
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
    res.json(response.data);
  } catch (error) {
    console.error("Backend : Erreur lors de l'échange du code contre le jeton :", error.response?.data || error.message);
    res.status(500).json({ error: "Échec de l'échange du code contre le jeton" });
  }
});

app.post("/api/refresh-token", async (req, res) => {
  const { refresh_token } = req.body;
  console.log("Backend : Requête POST /api/refresh-token reçue avec refresh_token :", refresh_token);

  try {
    console.log("Backend : Envoi de la requête à Spotify pour rafraîchir le token");
    const response = await axios({
      method: "post",
      url: "https://accounts.spotify.com/api/token",
      data: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token,
        client_id: clientId,
        client_secret: clientSecret,
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    console.log("Backend : Réponse de Spotify :", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Backend : Erreur lors du rafraîchissement du jeton :", error.response?.data || error.message);
    res.status(500).json({ error: "Échec du rafraîchissement du jeton" });
  }
});

app.listen(3000, () => {
  console.log("Serveur démarré sur le port 3000");
});