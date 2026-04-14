const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SCOPES = 'user-follow-read user-read-private';

function generateVerifier(length = 128) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, b => chars[b % chars.length]).join('');
}

async function generateChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function login() {
  const verifier = generateVerifier();
  const challenge = await generateChallenge(verifier);
  const redirectUri = chrome.identity.getRedirectURL();

  await chrome.storage.local.set({ pkce_verifier: verifier });

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: redirectUri,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    show_dialog: 'true',
  });

  let responseUrl;
  try {
    responseUrl = await chrome.identity.launchWebAuthFlow({
      url: `https://accounts.spotify.com/authorize?${params}`,
      interactive: true,
    });
  } catch {
    throw new Error('AUTH_CANCELLED');
  }

  const code = new URL(responseUrl).searchParams.get('code');
  if (!code) throw new Error('AUTH_CANCELLED');

  const { pkce_verifier } = await chrome.storage.local.get('pkce_verifier');

  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: CLIENT_ID,
      code_verifier: pkce_verifier,
    }),
  });

  if (!tokenRes.ok) throw new Error('TOKEN_ERROR');

  const tokens = await tokenRes.json();
  await chrome.storage.local.set({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: Date.now() + tokens.expires_in * 1000,
  });
}

console.log('[Spotcalendar] Background service worker started');
console.log('[Spotcalendar] Redirect URL:', chrome.identity.getRedirectURL());

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('[Spotcalendar] Message received:', message.type);
  if (message.type === 'LOGIN') {
    login()
      .then(() => sendResponse({ success: true }))
      .catch(e => {
        console.error('[Spotcalendar] Login error:', e);
        sendResponse({ success: false, error: e.message });
      });
    return true;
  }
});
