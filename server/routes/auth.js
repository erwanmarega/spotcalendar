const express = require('express');
const axios = require('axios');
const db = require('../db');

const router = express.Router();

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;

function setCookies(res, data) {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieOpts = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
  };

  res.cookie('access_token', data.access_token, { ...cookieOpts, maxAge: data.expires_in * 1000 });
  res.cookie('expires_at', (Date.now() + data.expires_in * 1000).toString(), { ...cookieOpts, maxAge: data.expires_in * 1000 });
  res.cookie('token_type', data.token_type || 'Bearer', { ...cookieOpts, maxAge: data.expires_in * 1000 });
}

router.post('/token', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Aucun code fourni dans la requête' });
  }

  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    setCookies(res, response.data);

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('refresh_token', response.data.refresh_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    try {
      const meResponse = await axios.get('https://api.spotify.com/v1/me', {
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

    res.json({ message: 'Tokens stockés dans les cookies' });
  } catch (error) {
    console.error("Erreur lors de l'échange du code :", error.response?.data);
    res.status(500).json({ error: "Échec de l'échange du code contre le jeton", details: error.response?.data });
  }
});

router.post('/refresh-token', async (req, res) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Aucun refresh_token fourni' });
  }

  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    setCookies(res, response.data);

    if (response.data.refresh_token) {
      res.cookie('refresh_token', response.data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    }

    res.json({ message: 'Tokens rafraîchis' });
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du jeton :', error.response?.data);
    res.status(500).json({ error: 'Échec du rafraîchissement du jeton', details: error.response?.data });
  }
});

router.get('/check-tokens', (req, res) => {
  res.json({
    access_token_exists: !!req.cookies.access_token,
    refresh_token_exists: !!req.cookies.refresh_token,
    expires_at: req.cookies.expires_at || null,
    token_type: req.cookies.token_type || null,
  });
});

router.post('/logout', (req, res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.clearCookie('expires_at');
  res.clearCookie('token_type');
  res.json({ message: 'Déconnexion réussie, cookies supprimés' });
});

module.exports = router;
