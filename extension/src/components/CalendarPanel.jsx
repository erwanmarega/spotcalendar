import { useState, useEffect } from "react";
import {
  getAccessToken,
  getFollowedArtists,
  getArtistAlbums,
} from "../api/spotify";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

function formatType(type) {
  return (
    { album: "Album", single: "Single", compilation: "Compilation" }[type] ||
    type
  );
}

function isoDate(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function CalendarPanel({ onLogout }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [releasesByDate, setReleasesByDate] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setReleasesByDate({});

    const afterDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;

    (async () => {
      try {
        const token = await getAccessToken();
        const artists = await getFollowedArtists(token);

        const byDate = {};
        const CHUNK = 5;

        for (let i = 0; i < artists.length; i += CHUNK) {
          if (cancelled) return;
          const batch = artists.slice(i, i + CHUNK);
          const results = await Promise.all(
            batch.map((a) =>
              getArtistAlbums(token, a.id, afterDate).then((albums) =>
                albums.map((album) => ({
                  ...album,
                  artiste: a.name,
                  artisteImage: a.images?.[1]?.url || a.images?.[0]?.url,
                }))
              )
            )
          );

          results.flat().forEach((r) => {
            const d = new Date(r.date);
            if (d.getFullYear() !== year || d.getMonth() !== month) return;
            if (!byDate[r.date]) byDate[r.date] = [];
            if (!byDate[r.date].find((x) => x.id === r.id))
              byDate[r.date].push(r);
          });

          if (!cancelled) setReleasesByDate({ ...byDate });
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [year, month]);

  const prevMonth = () => {
    setSelectedDay(null);
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    setSelectedDay(null);
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else setMonth((m) => m + 1);
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = (() => {
    const d = new Date(year, month, 1).getDay();
    return d === 0 ? 6 : d - 1;
  })();
  const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7;
  const today = now.toISOString().split("T")[0];
  const selectedReleases = selectedDay ? releasesByDate[selectedDay] || [] : [];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#121212]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#282828] flex-shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#2a2a2a] text-white transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <span className="text-white font-bold text-sm w-36 text-center">
            {MONTHS[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#2a2a2a] text-white transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
        <button
          onClick={onLogout}
          className="text-[#9a9a9a] hover:text-white text-xs transition-colors"
        >
          Déconnexion
        </button>
      </div>

      <div className="px-3 pt-3 pb-1 flex-shrink-0">
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] text-[#9a9a9a] font-bold py-1"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px">
          {Array.from({ length: totalCells }, (_, i) => {
            const dayNum = i - firstDow + 1;
            if (dayNum < 1 || dayNum > daysInMonth) return <div key={i} />;

            const dateStr = isoDate(year, month, dayNum);
            const releases = releasesByDate[dateStr] || [];
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDay;

            return (
              <button
                key={i}
                onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                className={`relative flex flex-col items-center py-1.5 rounded-lg transition-colors min-h-[44px] ${
                  isSelected ? "bg-[#1DB954]/20" : "hover:bg-[#2a2a2a]"
                }`}
              >
                <span
                  className={
                    isToday
                      ? "bg-[#1DB954] text-black w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold"
                      : `text-xs font-bold ${
                          isSelected ? "text-[#1DB954]" : "text-white"
                        }`
                  }
                >
                  {dayNum}
                </span>
                {releases.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center max-w-[32px]">
                    {releases.slice(0, 3).map((_, ri) => (
                      <span
                        key={ri}
                        className="w-1 h-1 rounded-full bg-[#1DB954]"
                      />
                    ))}
                    {releases.length > 3 && (
                      <span className="text-[8px] text-[#1DB954] font-bold leading-none">
                        +{releases.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {loading && (
        <div className="px-4 py-2 flex-shrink-0">
          <div className="h-0.5 bg-[#282828] rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-[#1DB954] rounded-full animate-pulse" />
          </div>
          <p className="text-[#9a9a9a] text-[11px] mt-1.5 text-center">
            Chargement des sorties…
          </p>
        </div>
      )}

      {error && (
        <div className="mx-4 my-2 p-3 bg-[#2a1010] border border-red-900/50 rounded-xl flex-shrink-0">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 py-2">
        {selectedDay ? (
          <>
            <p className="text-[#9a9a9a] text-xs font-bold mb-2 px-1">
              {selectedReleases.length === 0
                ? "Aucune sortie ce jour"
                : `${selectedReleases.length} sortie${
                    selectedReleases.length > 1 ? "s" : ""
                  }`}
            </p>
            <div className="space-y-2">
              {selectedReleases.map((r, i) => (
                <a
                  key={i}
                  href={r.lienSpotify}
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = r.lienSpotify;
                  }}
                  className="flex gap-3 p-2 rounded-lg bg-[#181818] hover:bg-[#282828] transition-colors group"
                >
                  {r.image ? (
                    <img
                      src={r.image}
                      alt={r.titre}
                      className="w-12 h-12 rounded-md object-contain flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-[#282828] rounded-md flex items-center justify-center text-[#9a9a9a] flex-shrink-0 text-lg">
                      ♪
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1DB954] text-xs font-bold truncate">
                      {r.artiste}
                    </p>
                    <p className="text-white text-sm font-medium truncate">
                      {r.titre}
                    </p>
                    <p className="text-[#9a9a9a] text-[11px]">
                      {formatType(r.type)}
                    </p>
                  </div>
                  <svg
                    className="w-4 h-4 text-[#9a9a9a] group-hover:text-white flex-shrink-0 self-center transition-colors"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                  </svg>
                </a>
              ))}
            </div>
          </>
        ) : (
          !loading && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <svg
                className="w-8 h-8 mb-2 text-[#9a9a9a] opacity-40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <p className="text-[#9a9a9a] text-xs">
                Clique sur un jour pour voir les sorties
              </p>
            </div>
          )
        )}
      </div>

      <div className="border-t border-[#282828] px-4 py-2 flex items-center justify-center gap-2 flex-shrink-0">
        <svg
          className="w-3 h-3 flex-shrink-0"
          viewBox="0 0 24 24"
          fill="#1DB954"
        >
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
        <span className="text-[#9a9a9a] text-[10px]">
          Contenu fourni par Spotify
        </span>
      </div>
    </div>
  );
}
