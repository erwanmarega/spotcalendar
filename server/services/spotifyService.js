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

async function fetchTopArtists(accessToken, timeRange) {
  const { data } = await axios.get(
    `https://api.spotify.com/v1/me/top/artists?limit=50&time_range=${timeRange}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return data.items;
}

async function fetchNewReleases(accessToken) {
  let releases = [];
  const pages = [0, 50];
  for (const offset of pages) {
    const { data } = await axios.get(
      `https://api.spotify.com/v1/browse/new-releases?limit=50&offset=${offset}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    releases = [...releases, ...data.albums.items];
  }
  return releases;
}

async function computeSmartReleases(accessToken) {
  const [followedArtists, topShort, topMedium, newReleases] = await Promise.all([
    fetchAllFollowedArtists(accessToken),
    fetchTopArtists(accessToken, 'short_term'),
    fetchTopArtists(accessToken, 'medium_term'),
    fetchNewReleases(accessToken),
  ]);

  const followedIds = new Set(followedArtists.map((a) => a.id));
  const topIds = new Set([...topShort, ...topMedium].map((a) => a.id));

  const allRelevantIds = new Set([...followedIds, ...topIds]);

  const results = [];
  for (const release of newReleases) {
    const matchedArtist = release.artists.find((a) => allRelevantIds.has(a.id));
    if (!matchedArtist) continue;

    const isFollowed = followedIds.has(matchedArtist.id);
    const isTop = topIds.has(matchedArtist.id);

    results.push({
      albumId: release.id,
      artiste: matchedArtist.name,
      titre: release.name,
      type: release.album_type,
      date: release.release_date,
      image: release.images?.[0]?.url || '',
      lienSpotify: release.external_urls.spotify,
      source: isFollowed && isTop ? 'both' : isFollowed ? 'followed' : 'top',
    });
  }

  results.sort((a, b) => b.date.localeCompare(a.date));
  return results;
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

async function getClientCredentialsToken() {
  const response = await axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    data: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return response.data.access_token;
}

async function fetchDemoArtistImages(names) {
  const token = await getClientCredentialsToken();
  const results = await Promise.all(
    names.map(async (name) => {
      const { data } = await axios.get(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(name)}&type=artist&limit=1`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const artist = data.artists.items[0];
      return {
        name,
        image: artist?.images?.[0]?.url || null,
        genres: artist?.genres || [],
      };
    })
  );
  return results;
}

module.exports = {
  refreshSpotifyToken,
  fetchAllFollowedArtists,
  fetchRecentArtistIds,
  fetchRecentReleasesForArtist,
  computeMissedReleases,
  computeSmartReleases,
  fetchDemoArtistImages,
};
