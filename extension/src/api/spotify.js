const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const BASE = 'https://api.spotify.com/v1';

async function set(data) {
  return new Promise(resolve => chrome.storage.local.set(data, resolve));
}

async function get(keys) {
  return new Promise(resolve => chrome.storage.local.get(keys, resolve));
}

async function refreshAccessToken(refreshToken) {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
    }),
  });
  if (!res.ok) throw new Error('REFRESH_FAILED');
  const tokens = await res.json();
  await set({
    access_token: tokens.access_token,
    expires_at: Date.now() + tokens.expires_in * 1000,
    ...(tokens.refresh_token && { refresh_token: tokens.refresh_token }),
  });
  return tokens.access_token;
}

export async function getAccessToken() {
  const data = await get(['access_token', 'expires_at', 'refresh_token']);
  if (data.access_token && data.expires_at && Date.now() < data.expires_at - 60_000) {
    return data.access_token;
  }
  if (data.refresh_token) {
    return refreshAccessToken(data.refresh_token);
  }
  throw new Error('NOT_AUTHENTICATED');
}

export async function getFollowedArtists(token) {
  const artists = [];
  let url = `${BASE}/me/following?type=artist&limit=50`;
  while (url && artists.length < 150) {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error('API_ERROR');
    const data = await res.json();
    artists.push(...data.artists.items);
    url = data.artists.next;
  }
  return artists;
}

export async function getArtistAlbums(token, artistId, afterDate) {
  const res = await fetch(
    `${BASE}/artists/${artistId}/albums?include_groups=album,single&market=FR&limit=10`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.items
    .filter(a => a.release_date >= afterDate)
    .map(a => ({
      id: a.id,
      titre: a.name,
      type: a.album_type,
      date: a.release_date,
      image: a.images?.[1]?.url || a.images?.[0]?.url,
      lienSpotify: a.external_urls?.spotify,
    }));
}
