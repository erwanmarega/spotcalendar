const axios = require('axios');

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

async function refreshSpotifyToken(refreshToken) {
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
  return response.data.access_token;
}

async function fetchAllFollowedArtists(accessToken) {
  let artists = [];
  let url = 'https://api.spotify.com/v1/me/following?type=artist&limit=50';
  while (url) {
    const { data } = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    artists = [...artists, ...data.artists.items];
    url = data.artists.next || null;
  }
  return artists;
}

async function fetchRecentArtistIds(accessToken) {
  const { data } = await axios.get(
    'https://api.spotify.com/v1/me/player/recently-played?limit=50',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return new Set(
    data.items.flatMap((item) => item.track.artists.map((a) => a.id))
  );
}

async function fetchRecentReleasesForArtist(accessToken, artistId, since) {
  const { data } = await axios.get(
    `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&limit=10&market=FR`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return data.items.filter((item) => item.release_date >= since);
}

async function computeMissedReleases(accessToken) {
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const sinceStr = since.toISOString().split('T')[0];

  const [followedArtists, recentArtistIds] = await Promise.all([
    fetchAllFollowedArtists(accessToken),
    fetchRecentArtistIds(accessToken),
  ]);

  const missedArtists = followedArtists.filter((a) => !recentArtistIds.has(a.id));

  const releases = [];
  for (const artist of missedArtists) {
    try {
      const artistReleases = await fetchRecentReleasesForArtist(accessToken, artist.id, sinceStr);
      for (const release of artistReleases) {
        releases.push({
          artiste: artist.name,
          titre: release.name,
          type: release.album_type,
          date: release.release_date,
          image: release.images?.[0]?.url || '',
          lienSpotify: release.external_urls.spotify,
        });
      }
    } catch (e) {}
  }

  releases.sort((a, b) => b.date.localeCompare(a.date));
  return releases;
}

module.exports = {
  refreshSpotifyToken,
  fetchAllFollowedArtists,
  fetchRecentArtistIds,
  fetchRecentReleasesForArtist,
  computeMissedReleases,
};
