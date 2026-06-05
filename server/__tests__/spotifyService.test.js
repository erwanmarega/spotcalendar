import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  computeSmartReleases,
  computeMissedReleases,
} from '../services/spotifyService.js';

vi.mock('axios');

function makeArtist(id, name) {
  return { id, name };
}

function makeRelease(id, artistId, artistName, name, date, albumType = 'album') {
  return {
    id,
    name,
    album_type: albumType,
    release_date: date,
    images: [{ url: `https://img.test/${id}` }],
    external_urls: { spotify: `https://open.spotify.com/album/${id}` },
    artists: [{ id: artistId, name: artistName }],
  };
}

const today = new Date().toISOString().split('T')[0];

describe('computeSmartReleases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retourne uniquement les sorties des artistes suivis ou en top, triées par date décroissante', async () => {
    const artistA = makeArtist('a1', 'Artist A');
    const artistB = makeArtist('b1', 'Artist B');

    axios.get.mockImplementation((url) => {
      if (url.includes('/me/following'))
        return Promise.resolve({ data: { artists: { items: [artistA], next: null } } });
      if (url.includes('short_term'))
        return Promise.resolve({ data: { items: [artistB] } });
      if (url.includes('medium_term'))
        return Promise.resolve({ data: { items: [] } });
      if (url.includes('/browse/new-releases'))
        return Promise.resolve({
          data: {
            albums: {
              items: [
                makeRelease('r1', 'a1', 'Artist A', 'Album A', '2025-01-15'),
                makeRelease('r2', 'b1', 'Artist B', 'Single B', '2025-02-01'),
                makeRelease('r3', 'u1', 'Unknown',  'Album X',  '2025-03-01'),
              ],
            },
          },
        });
      return Promise.resolve({ data: {} });
    });

    const results = await computeSmartReleases('fake-token');

    expect(results).toHaveLength(2);
    expect(results[0].artiste).toBe('Artist B');
    expect(results[1].artiste).toBe('Artist A');
    expect(results[0].date > results[1].date).toBe(true);
  });

  it('assigne source "followed" si artiste uniquement suivi', async () => {
    const artist = makeArtist('a1', 'Artist A');
    const release = makeRelease('r1', 'a1', 'Artist A', 'Album', '2025-01-01');

    axios.get.mockImplementation((url) => {
      if (url.includes('/me/following'))
        return Promise.resolve({ data: { artists: { items: [artist], next: null } } });
      if (url.includes('/me/top/artists'))
        return Promise.resolve({ data: { items: [] } });
      if (url.includes('/browse/new-releases'))
        return Promise.resolve({ data: { albums: { items: [release] } } });
      return Promise.resolve({ data: {} });
    });

    const results = await computeSmartReleases('fake-token');
    expect(results[0].source).toBe('followed');
  });

  it('assigne source "both" si artiste suivi ET en top', async () => {
    const artist = makeArtist('a1', 'Artist A');
    const release = makeRelease('r1', 'a1', 'Artist A', 'Album', '2025-01-01');

    axios.get.mockImplementation((url) => {
      if (url.includes('/me/following'))
        return Promise.resolve({ data: { artists: { items: [artist], next: null } } });
      if (url.includes('/me/top/artists'))
        return Promise.resolve({ data: { items: [artist] } });
      if (url.includes('/browse/new-releases'))
        return Promise.resolve({ data: { albums: { items: [release] } } });
      return Promise.resolve({ data: {} });
    });

    const results = await computeSmartReleases('fake-token');
    expect(results[0].source).toBe('both');
  });

  it('retourne une liste vide si aucune nouvelle sortie ne correspond', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/me/following'))
        return Promise.resolve({ data: { artists: { items: [], next: null } } });
      if (url.includes('/me/top/artists'))
        return Promise.resolve({ data: { items: [] } });
      if (url.includes('/browse/new-releases'))
        return Promise.resolve({ data: { albums: { items: [makeRelease('r1', 'u1', 'Unknown', 'Album', '2025-01-01')] } } });
      return Promise.resolve({ data: {} });
    });

    const results = await computeSmartReleases('fake-token');
    expect(results).toHaveLength(0);
  });

  it('inclut les champs attendus dans chaque résultat', async () => {
    const artist = makeArtist('a1', 'Artist A');
    const release = makeRelease('r1', 'a1', 'Artist A', 'My Album', '2025-06-01', 'single');

    axios.get.mockImplementation((url) => {
      if (url.includes('/me/following'))
        return Promise.resolve({ data: { artists: { items: [artist], next: null } } });
      if (url.includes('/me/top/artists'))
        return Promise.resolve({ data: { items: [] } });
      if (url.includes('/browse/new-releases'))
        return Promise.resolve({ data: { albums: { items: [release] } } });
      return Promise.resolve({ data: {} });
    });

    const results = await computeSmartReleases('fake-token');
    expect(results[0]).toMatchObject({
      albumId: 'r1',
      artiste: 'Artist A',
      titre: 'My Album',
      type: 'single',
      date: '2025-06-01',
      source: 'followed',
    });
    expect(results[0].image).toBeDefined();
    expect(results[0].lienSpotify).toBeDefined();
  });
});

describe('computeMissedReleases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exclut les artistes récemment écoutés', async () => {
    const listenedArtist = makeArtist('a1', 'Listened Artist');
    const missedArtist = makeArtist('a2', 'Missed Artist');

    axios.get.mockImplementation((url) => {
      if (url.includes('/me/following'))
        return Promise.resolve({ data: { artists: { items: [listenedArtist, missedArtist], next: null } } });
      if (url.includes('/me/player/recently-played'))
        return Promise.resolve({ data: { items: [{ track: { artists: [{ id: 'a1' }] } }] } });
      if (url.includes('/artists/a2/albums'))
        return Promise.resolve({ data: { items: [makeRelease('r1', 'a2', 'Missed Artist', 'New Album', today)] } });
      return Promise.resolve({ data: { items: [] } });
    });

    const results = await computeMissedReleases('fake-token');
    expect(results).toHaveLength(1);
    expect(results[0].artiste).toBe('Missed Artist');
  });

  it('retourne une liste vide si tous les artistes ont été récemment écoutés', async () => {
    const artist = makeArtist('a1', 'Artist A');

    axios.get.mockImplementation((url) => {
      if (url.includes('/me/following'))
        return Promise.resolve({ data: { artists: { items: [artist], next: null } } });
      if (url.includes('/me/player/recently-played'))
        return Promise.resolve({ data: { items: [{ track: { artists: [{ id: 'a1' }] } }] } });
      return Promise.resolve({ data: { items: [] } });
    });

    const results = await computeMissedReleases('fake-token');
    expect(results).toHaveLength(0);
  });

  it('ignore les sorties plus vieilles que 30 jours', async () => {
    const missedArtist = makeArtist('a1', 'Missed Artist');
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 31);
    const oldDateStr = oldDate.toISOString().split('T')[0];

    axios.get.mockImplementation((url) => {
      if (url.includes('/me/following'))
        return Promise.resolve({ data: { artists: { items: [missedArtist], next: null } } });
      if (url.includes('/me/player/recently-played'))
        return Promise.resolve({ data: { items: [] } });
      if (url.includes('/artists/a1/albums'))
        return Promise.resolve({ data: { items: [makeRelease('r1', 'a1', 'Missed Artist', 'Old Album', oldDateStr)] } });
      return Promise.resolve({ data: { items: [] } });
    });

    const results = await computeMissedReleases('fake-token');
    expect(results).toHaveLength(0);
  });

  it('trie les résultats par date décroissante', async () => {
    const artist = makeArtist('a1', 'Artist A');

    axios.get.mockImplementation((url) => {
      if (url.includes('/me/following'))
        return Promise.resolve({ data: { artists: { items: [artist], next: null } } });
      if (url.includes('/me/player/recently-played'))
        return Promise.resolve({ data: { items: [] } });
      if (url.includes('/artists/a1/albums'))
        return Promise.resolve({
          data: {
            items: [
              makeRelease('r1', 'a1', 'Artist A', 'Older', '2025-01-01'),
              makeRelease('r2', 'a1', 'Artist A', 'Newer', today),
            ],
          },
        });
      return Promise.resolve({ data: { items: [] } });
    });

    const results = await computeMissedReleases('fake-token');
    expect(results[0].titre).toBe('Newer');
    expect(results[1].titre).toBe('Older');
  });
});
