const express = require('express');
const axios = require('axios');
const db = require('../db');
const { sendMissedReleasesEmail, generateUnsubscribeToken, getUserIdFromToken } = require('../services/emailService');
const { computeMissedReleases } = require('../services/spotifyService');

const router = express.Router();

router.get('/email-preferences', async (req, res) => {
  const accessToken = req.cookies.access_token;
  if (!accessToken) {
    return res.status(401).json({ error: "Aucun token d'accès" });
  }

  try {
    const meResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const user = db.prepare('SELECT email_notifications FROM users WHERE user_id = ?').get(meResponse.data.id);
    res.json({ enabled: user ? Boolean(user.email_notifications) : false });
  } catch (error) {
    console.error('Erreur email-preferences GET :', error.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des préférences' });
  }
});

router.post('/email-preferences', async (req, res) => {
  const accessToken = req.cookies.access_token;
  if (!accessToken) {
    return res.status(401).json({ error: "Aucun token d'accès" });
  }

  const { enabled } = req.body;
  if (typeof enabled !== 'boolean') {
    return res.status(400).json({ error: "Le champ 'enabled' doit être un booléen" });
  }

  try {
    const meResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    db.prepare('UPDATE users SET email_notifications = ? WHERE user_id = ?').run(enabled ? 1 : 0, meResponse.data.id);
    res.json({ enabled });
  } catch (error) {
    console.error('Erreur email-preferences POST :', error.message);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des préférences' });
  }
});

router.get('/test-email', async (req, res) => {
  const accessToken = req.cookies.access_token;
  if (!accessToken) {
    return res.status(401).json({ error: "Aucun token d'accès" });
  }

  try {
    const meResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const user = db.prepare('SELECT * FROM users WHERE user_id = ?').get(meResponse.data.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé en base' });
    }

    const releases = await computeMissedReleases(accessToken);
    if (releases.length === 0) {
      return res.json({ message: 'Aucune sortie manquée, email non envoyé' });
    }

    const token = generateUnsubscribeToken(user.user_id);
    const unsubscribeUrl = `${process.env.SERVER_URL}/api/unsubscribe/${token}`;
    await sendMissedReleasesEmail(user.email, releases, unsubscribeUrl);
    res.json({ message: `Email de test envoyé à ${user.email} avec ${releases.length} sorties` });
  } catch (error) {
    console.error('Erreur test-email :', error.message);
    res.status(500).json({ error: error.message });
  }
});

function invalidLinkPage(res) {
  return res.status(400).send(`
    <!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Lien invalide</title></head>
    <body style="margin:0;background:#121212;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;">
      <div style="text-align:center;color:#fff;">
        <h1 style="font-size:22px;margin:16px 0 8px">Lien invalide</h1>
        <p style="color:#B3B3B3;font-size:14px">Ce lien de désinscription est incorrect ou a expiré.</p>
      </div>
    </body></html>
  `);
}

router.get('/unsubscribe/:token', (req, res) => {
  const userId = getUserIdFromToken(req.params.token);

  if (!userId) {
    return invalidLinkPage(res);
  }

  res.send(`
    <!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Se désabonner</title></head>
    <body style="margin:0;background:#121212;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;">
      <div style="text-align:center;color:#fff;">
        <h1 style="font-size:22px;margin:16px 0 8px">Se désabonner ?</h1>
        <p style="color:#B3B3B3;font-size:14px">Tu ne recevras plus les emails hebdomadaires de SpotCalendar.</p>
        <form method="POST" action="/api/unsubscribe/${encodeURIComponent(req.params.token)}" style="margin-top:24px;">
          <button type="submit" style="background:#1DB954;color:#000;border:none;font-size:14px;font-weight:700;padding:10px 28px;border-radius:24px;cursor:pointer;">
            Confirmer la désinscription
          </button>
        </form>
      </div>
    </body></html>
  `);
});

router.post('/unsubscribe/:token', (req, res) => {
  const userId = getUserIdFromToken(req.params.token);

  if (!userId) {
    return invalidLinkPage(res);
  }

  db.prepare('UPDATE users SET email_notifications = 0 WHERE user_id = ?').run(userId);

  res.send(`
    <!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Désinscription confirmée</title></head>
    <body style="margin:0;background:#121212;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;">
      <div style="text-align:center;color:#fff;">
        <h1 style="font-size:22px;margin:16px 0 8px">Tu es désinscrit</h1>
        <p style="color:#B3B3B3;font-size:14px">Tu ne recevras plus les emails hebdomadaires de SpotCalendar.</p>
        <p style="color:#535353;font-size:12px;margin-top:24px">Tu peux te réabonner à tout moment depuis l'application.</p>
      </div>
    </body></html>
  `);
});

module.exports = router;
