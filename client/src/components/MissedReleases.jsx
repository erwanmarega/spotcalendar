import { useState, useEffect } from "react";
import { getMissedReleases } from "../api";

function formatType(type) {
  const types = {
    album: "Album",
    single: "Single",
    compilation: "Compilation",
    appears_on: "Feat",
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

const SkeletonCard = () => (
  <div className="animate-pulse bg-[#181818] rounded-xl p-4 flex gap-4">
    <div className="w-16 h-16 bg-[#282828] rounded-lg flex-shrink-0" />
    <div className="flex-1 space-y-2 pt-1">
      <div className="h-3.5 bg-[#282828] rounded w-1/2" />
      <div className="h-3 bg-[#282828] rounded w-3/4" />
      <div className="h-2.5 bg-[#282828] rounded w-1/3" />
    </div>
  </div>
);

const MissedReleases = () => {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getMissedReleases()
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
  }, []);

  return (
    <div className="px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">
          Tu as peut-être raté...
        </h1>
        <p className="text-sm text-[#B3B3B3]">
          Des artistes que tu suis ont sorti de la musique ces 30 derniers
          jours.
        </p>
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
      ) : releases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4">✅</div>
          <p className="text-white font-bold text-lg mb-1">
            Vous êtes à jour !
          </p>
          <p className="text-[#B3B3B3] text-sm">
            Tous les artistes que vous suivez ont été écoutés récemment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {releases.map((release, i) => (
            <div
              key={i}
              className="bg-[#181818] hover:bg-[#282828] transition-colors rounded-xl p-4 flex gap-4 group"
            >
              <div className="flex-shrink-0">
                {release.image ? (
                  <img
                    src={release.image}
                    alt={release.titre}
                    className="w-16 h-16 rounded-lg object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-16 h-16 bg-[#282828] rounded-lg flex items-center justify-center text-[#727272] text-xl">
                    ♪
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[#1DB954] text-xs font-bold truncate mb-0.5">
                  {release.artiste}
                </p>
                <p className="text-white text-sm font-medium truncate mb-0.5">
                  {release.titre}
                </p>
                <p className="text-[#727272] text-[11px] mb-2">
                  {formatType(release.type)} · {formatDate(release.date)}
                </p>
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
          ))}
        </div>
      )}
    </div>
  );
};

export default MissedReleases;
