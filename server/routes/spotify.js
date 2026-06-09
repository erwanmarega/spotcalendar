const express = require('express');
const axios = require('axios');
const { computeMissedReleases, computeSmartReleases, fetchDemoArtistImages } = require('../services/spotifyService');

const router = express.Router();

const DEMO_ARTIST_NAMES = ['Drake', 'Taylor Swift', 'The Weeknd', 'Daft Punk', 'Rosalía', 'Stromae', 'Billie Eilish', 'Kendrick Lamar'];
let demoCache = null;
let demoCacheTime = 0;
const DEMO_CACHE_TTL = 6 * 60 * 60 * 1000;

router.get('/demo-data', async (req, res) => {
  try {
    if (demoCache && Date.now() - demoCacheTime < DEMO_CACHE_TTL) {
      return res.json(demoCache);
    }
    const artists = await fetchDemoArtistImages(DEMO_ARTIST_NAMES);
    demoCache = { artists };
    demoCacheTime = Date.now();
    res.json(demoCache);
  } catch (error) {
    console.error('Erreur demo-data :', error.message);
    res.status(500).json({ error: 'Impossible de récupérer les données démo' });
  }
});

const ALLOWED_SPOTIFY_PATHS = [
  /^me$/,
  /^me\/following$/,
  /^me\/player\/recently-played$/,
  /^me\/top\/artists$/,
  /^me\/playlists$/,
  /^artists$/,
  /^artists\/[A-Za-z0-9]+\/albums$/,
  /^playlists\/[A-Za-z0-9]+\/tracks$/,
];

router.get('/spotify/:path(*)', async (req, res) => {
  const accessToken = req.cookies.access_token;
  if (!accessToken) {
    return res.status(401).json({ error: "Aucun token d'accès" });
  }

  const cleanPath = req.params.path.replace(/\/+$/, '');
  if (!ALLOWED_SPOTIFY_PATHS.some((re) => re.test(cleanPath))) {
    return res.status(403).json({ error: 'Endpoint Spotify non autorisé' });
  }

  try {
    const queryString = req.url.includes('?') ? `?${req.url.split('?')[1]}` : '';
    const spotifyUrl = `https://api.spotify.com/v1/${cleanPath}${queryString}`;
    const response = await axios.get(spotifyUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Erreur lors de la requête Spotify :', error.response?.data);
    res.status(error.response?.status || 500).json({ error: 'Échec de la requête Spotify' });
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
