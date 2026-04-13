const express = require('express');
const axios = require('axios');
const { computeMissedReleases, computeSmartReleases } = require('../services/spotifyService');

const router = express.Router();

router.get('/spotify/:path(*)', async (req, res) => {
  const accessToken = req.cookies.access_token;
  if (!accessToken) {
    return res.status(401).json({ error: "Aucun token d'accès" });
  }

  try {
    const queryString = req.url.includes('?') ? `?${req.url.split('?')[1]}` : '';
    const spotifyUrl = `https://api.spotify.com/v1/${req.params.path}${queryString}`;
    const response = await axios.get(spotifyUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Erreur lors de la requête Spotify :', error.response?.data);
    res.status(error.response?.status || 500).json({ error: 'Échec de la requête Spotify', details: error.response?.data });
  }
});

router.get('/missed-releases', async (req, res) => {
  const accessToken = req.cookies.access_token;
  if (!accessToken) {
    return res.status(401).json({ error: "Aucun token d'accès" });
  }

  try {
    const releases = await computeMissedReleases(accessToken);
    res.json(releases);
  } catch (error) {
    console.error('Erreur missed-releases :', error.message);
    res.status(error.response?.status || 500).json({ error: 'Erreur lors du calcul des sorties manquées' });
  }
});

router.get('/smart-releases', async (req, res) => {
  const accessToken = req.cookies.access_token;
  if (!accessToken) {
    return res.status(401).json({ error: "Aucun token d'accès" });
  }

  try {
    const releases = await computeSmartReleases(accessToken);
    res.json(releases);
  } catch (error) {
    console.error('Erreur smart-releases :', error.message);
    res.status(error.response?.status || 500).json({ error: 'Erreur lors du calcul des smart releases' });
  }
});

module.exports = router;
