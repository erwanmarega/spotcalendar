import { useState, useEffect } from "react";
import { getSmartReleases } from "../api";

function formatType(type) {
  const types = {
    album: "Album",
    single: "Single",
    compilation: "Compilation",
  };
  return types[type] || type;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const SOURCE_BADGE = {
  followed: {
    label: "Suivi",
    className: "bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/30",
  },
  top: {
    label: "Top écouté",
    className: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  },
  both: {
    label: "Suivi · Top écouté",
    className: "bg-yellow-400/20 text-yellow-300 border border-yellow-400/30",
  },
};

const DEMO_RELEASES = [
  { albumId: "sd1", artiste: "Drake", titre: "Certified Lover Boy II", type: "album", date: "2026-04-02", source: "followed", image: "https://placehold.co/300x300/8B5CF6/ffffff?text=DR", lienSpotify: "#" },
  { albumId: "sd2", artiste: "Taylor Swift", titre: "The Tortured Poets Vol. 2", type: "album", date: "2026-04-05", source: "both", image: "https://placehold.co/300x300/EC4899/ffffff?text=TS", lienSpotify: "#" },
  { albumId: "sd3", artiste: "The Weeknd", titre: "Midnight Sun", type: "single", date: "2026-04-10", source: "top", image: "https://placehold.co/300x300/EF4444/ffffff?text=TW", lienSpotify: "#" },
  { albumId: "sd4", artiste: "Daft Punk", titre: "Random Access Memories II", type: "album", date: "2026-04-14", source: "both", image: "https://placehold.co/300x300/F59E0B/ffffff?text=DP", lienSpotify: "#" },
  { albumId: "sd5", artiste: "Rosalía", titre: "MOTOMAMI 2", type: "album", date: "2026-04-18", source: "followed", image: "https://placehold.co/300x300/10B981/ffffff?text=RO", lienSpotify: "#" },
  { albumId: "sd6", artiste: "Billie Eilish", titre: "HIT ME HARD AND SOFT 2", type: "album", date: "2026-04-25", source: "top", image: "https://placehold.co/300x300/84CC16/ffffff?text=BE", lienSpotify: "#" },
  { albumId: "sd7", artiste: "Kendrick Lamar", titre: "GNX Deluxe", type: "album", date: "2026-04-28", source: "followed", image: "https://placehold.co/300x300/F97316/ffffff?text=KL", lienSpotify: "#" },
];

const SkeletonCard = () => (
  <div className="animate-pulse bg-[#181818] rounded-xl p-4 flex gap-4">
    <div className="w-16 h-16 bg-[#282828] rounded-lg flex-shrink-0" />
    <div className="flex-1 space-y-2 pt-1">
      <div className="h-3 bg-[#282828] rounded w-1/4" />
      <div className="h-3.5 bg-[#282828] rounded w-1/2" />
      <div className="h-3 bg-[#282828] rounded w-3/4" />
      <div className="h-2.5 bg-[#282828] rounded w-1/3" />
    </div>
  </div>
);


const SmartReleases = ({ isDemo = false }) => {
  const [releases, setReleases] = useState(isDemo ? DEMO_RELEASES : []);
  const [loading, setLoading] = useState(!isDemo);
  const [error, setError] = useState(null);
  const [filtre, setFiltre] = useState("tous");

  useEffect(() => {
    if (isDemo) {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
      fetch(`${API_BASE_URL}/api/demo-data`)
        .then((r) => r.json())
        .then((data) => {
          if (!data.artists) return;
          const imageMap = Object.fromEntries(
            data.artists.filter((a) => a.image).map((a) => [a.name, a.image])
          );
          setReleases((prev) =>
            prev.map((r) => ({ ...r, image: imageMap[r.artiste] || r.image }))
          );
        })
        .catch(() => {});
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    getSmartReleases()
      .then((data) => {
        if (!cancelled) setReleases(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || "Une erreur est survenue.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isDemo]);

  const releasesFiltrees =
    filtre === "tous" ? releases : releases.filter((r) => r.source === filtre);

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Découvertes</h1>
        <p className="text-sm text-[#B3B3B3]">
          Nouvelles sorties de tes artistes suivis et de ceux que tu écoutes en
          boucle.
        </p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { id: "tous", label: "Tous" },
          { id: "followed", label: "Suivis" },
          { id: "top", label: "Top écoutés" },
          { id: "both", label: "Les deux" },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFiltre(id)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
              filtre === id
                ? "bg-white text-black"
                : "bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]"
            }`}
          >
            {label}
            {id !== "tous" && !loading && (
              <span className="ml-1.5 opacity-60">
                {releases.filter((r) => r.source === id).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 bg-[#2a1010] border border-red-900/50 rounded-xl">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      ) : releasesFiltrees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4">🎵</div>
          <p className="text-white font-bold text-lg mb-1">Rien pour le moment</p>
          <p className="text-[#B3B3B3] text-sm">
            Aucune nouvelle sortie trouvée pour cette catégorie.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {releasesFiltrees.map((release, i) => {
            const badge = SOURCE_BADGE[release.source];
            return (
              <div
                key={i}
                className="bg-[#181818] hover:bg-[#282828] transition-colors rounded-xl p-4 flex gap-4 group"
              >
                <div className="flex-shrink-0">
                  {release.image ? (
                    <img
                      src={release.image}
                      alt={release.titre}
                      className="w-16 h-16 rounded-lg object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-[#282828] rounded-lg flex items-center justify-center text-[#727272] text-xl">
                      ♪
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[#1DB954] text-xs font-bold truncate">
                      {release.artiste}
                    </p>
                    <span
                      className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-white text-sm font-medium truncate mb-0.5">
                    {release.titre}
                  </p>
                  <p className="text-[#727272] text-[11px] mb-2">
                    {formatType(release.type)} · {formatDate(release.date)}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={release.lienSpotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-[#1DB954] hover:bg-[#1ed760] text-black text-[11px] font-bold px-3 py-1 rounded-full transition-colors"
                    >
                      Ouvrir dans Spotify
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SmartReleases;
