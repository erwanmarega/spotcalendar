const cron = require('node-cron');
const db = require('../db');
const { refreshSpotifyToken, computeMissedReleases } = require('../services/spotifyService');
const { sendMissedReleasesEmail, generateUnsubscribeToken } = require('../services/emailService');

cron.schedule('0 9 * * 1', async () => {
  console.log('[CRON] Démarrage envoi emails hebdomadaires...');

  const users = db.prepare('SELECT * FROM users WHERE email_notifications = 1').all();
  console.log(`[CRON] ${users.length} utilisateur(s) avec notifications activées`);

  for (const user of users) {
    try {
      const accessToken = await refreshSpotifyToken(user.refresh_token);
      const releases = await computeMissedReleases(accessToken);

      if (releases.length > 0) {
        const token = generateUnsubscribeToken(user.user_id);
        const unsubscribeUrl = `${process.env.SERVER_URL}/api/unsubscribe/${token}`;
        await sendMissedReleasesEmail(user.email, releases, unsubscribeUrl);
        console.log(`[CRON] Email envoyé à ${user.email} (${releases.length} sorties)`);
      } else {
        console.log(`[CRON] Aucune sortie pour ${user.email}`);
      }

      db.prepare('UPDATE users SET last_email_sent = ? WHERE user_id = ?')
        .run(new Date().toISOString(), user.user_id);
    } catch (e) {
      console.error(`[CRON] Erreur pour ${user.email}:`, e.message);
    }
  }

  console.log('[CRON] Emails hebdomadaires terminés');
});
