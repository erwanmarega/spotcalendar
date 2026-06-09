const { Resend } = require('resend');
const crypto = require('crypto');

let resendClient = null;
function getResend() {
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

function generateUnsubscribeToken(userId) {
  const sig = crypto.createHmac('sha256', process.env.UNSUBSCRIBE_SECRET).update(userId).digest('hex');
  return Buffer.from(`${userId}:${sig}`).toString('base64url');
}

function getUserIdFromToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const colonIndex = decoded.lastIndexOf(':');
    const userId = decoded.slice(0, colonIndex);
    const sig = Buffer.from(decoded.slice(colonIndex + 1), 'hex');
    const expected = crypto.createHmac('sha256', process.env.UNSUBSCRIBE_SECRET).update(userId).digest();
    if (sig.length !== expected.length || !crypto.timingSafeEqual(sig, expected)) return null;
    return userId;
  } catch {
    return null;
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeHttpsUrl(value, fallback = '') {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return fallback;
    return escapeHtml(url.href);
  } catch {
    return fallback;
  }
}

function formatReleaseType(type) {
  const types = { album: 'Album', single: 'Single', compilation: 'Compilation', appears_on: 'Feat' };
  return types[type] || type;
}

function generateEmailHTML(releases, unsubscribeUrl) {
  const releaseCards = releases.map((release) => {
    const lienSpotify = safeHttpsUrl(release.lienSpotify);
    const image = safeHttpsUrl(release.image);
    return `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #282828;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="64" style="vertical-align: top; padding-right: 16px;">
              <a href="${lienSpotify}" target="_blank" style="text-decoration: none;">
                <img src="${image}" alt="${escapeHtml(release.titre)}" width="64" height="64"
                  style="border-radius: 6px; display: block; object-fit: cover;" />
              </a>
            </td>
            <td style="vertical-align: top;">
              <p style="margin: 0 0 4px; font-size: 14px; font-weight: 700; color: #ffffff;">
                ${escapeHtml(release.artiste)}
              </p>
              <p style="margin: 0 0 4px; font-size: 13px; color: #B3B3B3;">
                ${escapeHtml(release.titre)}
              </p>
              <p style="margin: 0 0 8px; font-size: 11px; color: #727272;">
                ${escapeHtml(formatReleaseType(release.type))} · ${escapeHtml(release.date)}
              </p>
              <a href="${lienSpotify}" target="_blank"
                style="display: inline-block; background-color: #1DB954; color: #000000;
                  font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 20px;
                  text-decoration: none;">
                Ouvrir dans Spotify
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tu as peut-être raté...</title>
</head>
<body style="margin: 0; padding: 0; background-color: #121212; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #121212;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table width="100%" style="max-width: 560px;" cellpadding="0" cellspacing="0" border="0">

          <tr>
            <td style="padding-bottom: 32px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #ffffff;">
                Tu as peut-être raté...
              </p>
              <p style="margin: 0; font-size: 14px; color: #B3B3B3;">
                Des artistes que tu suis ont sorti de la musique récemment.
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color: #181818; border-radius: 12px; padding: 8px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                ${releaseCards}
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding-top: 32px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 11px; color: #535353;">
                Tu reçois cet email car tu as activé les notifications hebdomadaires sur SpotCalendar.
              </p>
              <a href="${escapeHtml(unsubscribeUrl)}" style="font-size: 11px; color: #727272; text-decoration: underline;">
                Se désabonner
              </a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

async function sendMissedReleasesEmail(userEmail, releases, unsubscribeUrl) {
  const html = generateEmailHTML(releases, unsubscribeUrl);

  const { data, error } = await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
    to: userEmail,
    subject: `Tu as peut-être raté ${releases.length} sortie${releases.length > 1 ? 's' : ''} cette semaine`,
    html,
    headers: {
      'List-Unsubscribe': `<${unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  });

  if (error) {
    throw new Error(`Resend error: ${JSON.stringify(error)}`);
  }

  return data;
}

module.exports = { sendMissedReleasesEmail, generateUnsubscribeToken, getUserIdFromToken };
