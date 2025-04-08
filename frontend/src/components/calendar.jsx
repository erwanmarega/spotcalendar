import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/my-calendar.png";
import profileIcon from "../assets/profile-icon.avif";
import dayjs from "dayjs";
import "dayjs/locale/fr";

import { FaCalendarAlt, FaHistory, FaUserFriends } from "react-icons/fa"; 

dayjs.locale("fr");

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [activeTab, setActiveTab] = useState("events");
  const [artists, setArtists] = useState([]);
  const [events, setEvents] = useState([]);
  const [pastReleases, setPastReleases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [artistReleases, setArtistReleases] = useState([]);
  const [allArtistReleases, setAllArtistReleases] = useState([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedFilterArtist, setSelectedFilterArtist] = useState("");
  const today = dayjs();
  const navigate = useNavigate();

  const daysOfWeek = ["Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam.", "Dim."];

  const startOfMonth = currentMonth.startOf("month");
  const endOfMonth = currentMonth.endOf("month");
  const daysInMonth = endOfMonth.date();
  const startDay = startOfMonth.day();

  const prevMonth = () => setCurrentMonth(currentMonth.subtract(1, "month"));
  const nextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));
  const goToToday = () => setCurrentMonth(today);

  const generateDays = () => {
    let days = [];
    for (let i = 1 - (startDay === 0 ? 6 : startDay - 1); i <= daysInMonth; i++) {
      days.push(i > 0 ? i : "");
    }
    return days;
  };

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      navigate("/");
      return null;
    }

    try {
      const response = await fetch("http://localhost:3000/api/refresh-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur HTTP : ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      localStorage.setItem("access_token", data.access_token);
      const expiresAt = Date.now() + data.expires_in * 1000;
      localStorage.setItem("expires_at", expiresAt.toString());
      return data.access_token;
    } catch (error) {
      localStorage.clear();
      navigate("/");
      return null;
    }
  };

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);

    let accessToken = localStorage.getItem("access_token");
    const expiresAt = localStorage.getItem("expires_at");
    const tokenType = localStorage.getItem("token_type") || "Bearer";

    if (!accessToken || !expiresAt || Date.now() >= parseInt(expiresAt)) {
      accessToken = await refreshToken();
      if (!accessToken) {
        setError("Échec du rafraîchissement du token. Veuillez vous reconnecter.");
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `${tokenType} ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur HTTP : ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      setUser(data);
    } catch (error) {
      setError("Impossible de récupérer les informations de l'utilisateur. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const fetchArtists = async () => {
    setLoading(true);
    setError(null);

    let accessToken = localStorage.getItem("access_token");
    const expiresAt = localStorage.getItem("expires_at");
    const tokenType = localStorage.getItem("token_type") || "Bearer";

    if (!accessToken || !expiresAt || Date.now() >= parseInt(expiresAt)) {
      accessToken = await refreshToken();
      if (!accessToken) {
        setError("Échec du rafraîchissement du token. Veuillez vous reconnecter.");
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch("https://api.spotify.com/v1/me/following?type=artist&limit=50", {
        headers: {
          Authorization: `${tokenType} ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur HTTP : ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      setArtists(data.artists.items);
    } catch (error) {
      setError("Impossible de récupérer les artistes suivis. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);

    let accessToken = localStorage.getItem("access_token");
    const expiresAt = localStorage.getItem("expires_at");
    const tokenType = localStorage.getItem("token_type") || "Bearer";

    if (!accessToken || !expiresAt || Date.now() >= parseInt(expiresAt)) {
      accessToken = await refreshToken();
      if (!accessToken) {
        setError("Échec du rafraîchissement du token. Veuillez vous reconnecter.");
        setLoading(false);
        return;
      }
    }

    const newEvents = [];
    const pastEvents = [];

    for (const artist of artists) {
      try {
        let allReleases = [];
        let url = `https://api.spotify.com/v1/artists/${artist.id}/albums?include_groups=album,single,compilation,appears_on&limit=50&market=FR`;

        while (url) {
          const response = await fetch(url, {
            headers: {
              Authorization: `${tokenType} ${accessToken}`,
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur HTTP : ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          allReleases = [...allReleases, ...data.items];
          url = data.next;
        }

        allReleases.forEach((album) => {
          const releaseDate = dayjs(album.release_date);
          const eventData = {
            date: releaseDate,
            title: `${album.name} - ${artist.name}`,
            type: album.album_type,
            spotifyUrl: album.external_urls.spotify,
          };

          if (releaseDate.isAfter(today)) {
            newEvents.push(eventData);
          } else if (releaseDate.isAfter(today.subtract(6, "month"))) {
            pastEvents.push(eventData);
          }
        });
      } catch (error) {
      }
    }

    setEvents(newEvents);
    setPastReleases(pastEvents);
    setLoading(false);
  };

  const fetchArtistReleases = async (artistId) => {
    setLoading(true);
    setError(null);

    let accessToken = localStorage.getItem("access_token");
    const expiresAt = localStorage.getItem("expires_at");
    const tokenType = localStorage.getItem("token_type") || "Bearer";

    if (!accessToken || !expiresAt || Date.now() >= parseInt(expiresAt)) {
      accessToken = await refreshToken();
      if (!accessToken) {
        setError("Échec du rafraîchissement du token. Veuillez vous reconnecter.");
        setLoading(false);
        return;
      }
    }

    try {
      let allReleases = [];
      let url = `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single,compilation,appears_on&limit=50&market=FR`;

      while (url) {
        const response = await fetch(url, {
          headers: {
            Authorization: `${tokenType} ${accessToken}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erreur HTTP : ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        allReleases = [...allReleases, ...data.items];
        url = data.next;
      }

      const formattedReleases = allReleases.map((item) => ({
        date: dayjs(item.release_date),
        title: item.name,
        type: item.album_type,
      }));

      setAllArtistReleases(formattedReleases);

      const currentDate = new Date("2025-04-06");
      const futureReleases = formattedReleases.filter((item) => {
        const releaseDate = new Date(item.date);
        return releaseDate > currentDate;
      });

      setArtistReleases(futureReleases);
    } catch (error) {
      setError("Impossible de récupérer les sorties de l'artiste. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchArtists();
  }, []);

  useEffect(() => {
    if (artists.length > 0) {
      fetchEvents();
    }
  }, [artists]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const filterReleases = (releases) => {
    let filteredReleases = [...releases];

    if (searchQuery) {
      filteredReleases = filteredReleases.filter((release) =>
        release.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedType) {
      filteredReleases = filteredReleases.filter((release) => release.type === selectedType);
    }

    if (selectedFilterArtist) {
      filteredReleases = filteredReleases.filter((release) =>
        release.title.toLowerCase().includes(selectedFilterArtist.toLowerCase())
      );
    }

    return filteredReleases.sort((a, b) => b.date - a.date);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,#1a1a1a_0%,#121212_100%)] text-white flex">
      <aside className="w-1/4 trueGray-900 p-4 rounded-2xl shadow-md border border-white-400 h-screen flex flex-col">
        <div className="flex items-center gap-2 text-lg font-bold mb-4">
          <img src={logo} alt="Logo" className="w-10 h-10" />
        </div>

        <input
          type="text"
          placeholder="Rechercher..."
          className="w-full p-2 mb-4 bg-gray-700 rounded text-white border border-gray-600"
        />

        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <button
                className={`w-full flex items-center gap-2 p-2 rounded ${
                  activeTab === "events" ? "bg-gray-700 text-green-400" : "text-gray-400 hover:bg-gray-800"
                }`}
                onClick={() => setActiveTab("events")}
              >
                <FaCalendarAlt className="text-lg" />
                Événements
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center gap-2 p-2 rounded ${
                  activeTab === "history" ? "bg-gray-700 text-green-400" : "text-gray-400 hover:bg-gray-800"
                }`}
                onClick={() => setActiveTab("history")}
              >
                <FaHistory className="text-lg" />
                Historique
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center gap-2 p-2 rounded ${
                  activeTab === "artists" ? "bg-gray-700 text-green-400" : "text-gray-400 hover:bg-gray-800"
                }`}
                onClick={() => setActiveTab("artists")}
              >
                <FaUserFriends className="text-lg" />
                Artistes
              </button>
            </li>
          </ul>
        </nav>

        <div className="flex-1 overflow-y-auto">
          {activeTab === "events" && (
            <div>
              <h2 className="text-green-400 mt-4">Vos prochains évènements</h2>
              <input
                type="text"
                placeholder="Rechercher un événement..."
                className="w-full p-2 mt-2 bg-gray-700 rounded text-white border border-gray-600"
              />
              {loading ? (
                <p className="text-gray-400 mt-4">Chargement...</p>
              ) : error ? (
                <p className="text-red-500 mt-4">{error}</p>
              ) : (
                <ul className="mt-4 space-y-2 text-sm">
                  {events.length > 0 ? (
                    events.map((event, i) => (
                      <li key={i} className="border-b border-gray-600 pb-1">
                        {event.date.format("DD/MM")} - {event.title}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-400">Aucun événement à venir.</li>
                  )}
                </ul>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div>
              <h2 className="text-green-400 mt-4">Historique des sorties (6 derniers mois)</h2>
              <div className="mt-2 flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Rechercher une sortie..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600"
                />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600"
                >
                  <option value="">Tous les types</option>
                  <option value="album">Albums</option>
                  <option value="single">Singles</option>
                  <option value="compilation">Compilations</option>
                  <option value="appears_on">Apparitions</option>
                </select>
                <select
                  value={selectedFilterArtist}
                  onChange={(e) => setSelectedFilterArtist(e.target.value)}
                  className="w-full p-2 bg-gray-700 rounded text-white border border-gray-400"
                >
                  <option value="">Tous les artistes</option>
                  {artists.map((artist) => (
                    <option key={artist.id} value={artist.name}>
                      {artist.name}
                    </option>
                  ))}
                </select>
              </div>
              {loading ? (
                <p className="text-gray-400 mt-4">Chargement...</p>
              ) : error ? (
                <p className="text-red-500 mt-4">{error}</p>
              ) : (
                <ul className="mt-4 space-y-2 text-sm">
                  {filterReleases(pastReleases).length > 0 ? (
                    filterReleases(pastReleases).map((release, i) => (
                      <li key={i} className="border-b border-gray-600 pb-1">
                        <a
                          href={release.spotifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-green-400"
                        >
                          {release.date.format("DD/MM/YYYY")} - {release.title} ({release.type})
                        </a>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-400">Aucune sortie correspondant aux critères.</li>
                  )}
                </ul>
              )}
            </div>
          )}

          {activeTab === "artists" && (
            <div>
              <h2 className="text-green-400 mt-4">Artistes suivis</h2>
              {loading ? (
                <p className="text-gray-400 mt-4">Chargement...</p>
              ) : error ? (
                <p className="text-red-500 mt-4">{error}</p>
              ) : (
                <div>
                  <ul className="mt-4 space-y-2 text-sm">
                    {artists.length > 0 ? (
                      artists.map((artist) => (
                        <li key={artist.id} className="border-b border-gray-600 pb-1">
                          <button
                            onClick={() => {
                              setSelectedArtist(artist);
                              fetchArtistReleases(artist.id);
                            }}
                            className="text-left w-full hover:text-green-400"
                          >
                            {artist.name}
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-400">Aucun artiste suivi.</li>
                    )}
                  </ul>

                  {selectedArtist && (
                    <div className="mt-4">
                      <h3 className="text-green-400">
                        Prochaines sorties de {selectedArtist.name}
                      </h3>
                      {loading ? (
                        <p className="text-gray-400 mt-2">Chargement...</p>
                      ) : error ? (
                        <p className="text-red-500 mt-2">{error}</p>
                      ) : artistReleases.length > 0 ? (
                        <ul className="mt-2 space-y-2 text-sm">
                          {artistReleases.map((release, i) => (
                            <li key={i} className="border-b border-gray-600 pb-1">
                              {release.title} - Sortie prévue le :{" "}
                              {release.date.format("DD/MM/YYYY")} ({release.type})
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-400 mt-2">
                          Aucune sortie future pour cet artiste.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-gray-600">
          <div className="flex items-center gap-2">
            <img
              src={user && user.images && user.images.length > 0 ? user.images[0].url : profileIcon}
              alt="Profil"
              className="w-8 h-8 rounded-full border border-gray-400 cursor-pointer"
            />
            {user ? (
              <span className="text-gray-400 text-sm">{user.display_name}</span>
            ) : (
              <span className="text-gray-400 text-sm">Chargement...</span>
            )}
            <button onClick={handleLogout} className="text-gray-400 text-sm hover:text-white ml-auto">
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      <main className="fixed top-0 right-0 w-3/4 h-screen trueGray-900 p-6 rounded-2xl shadow-md border border-white-400 overflow-hidden">
        <div className="flex justify-between items-center mb-4 text-white">
          <button onClick={prevMonth} className="text-xl px-2">◀</button>
          <h1 className="text-3xl font-bold">{currentMonth.format("MMMM YYYY")}</h1>
          <button onClick={nextMonth} className="text-xl px-2">▶</button>
        </div>
        <div className="flex justify-center mb-4">
          <button onClick={goToToday} className="bg-green-500 text-black px-4 py-2 rounded">Today</button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {daysOfWeek.map((day) => (
            <div key={day} className="p-2 text-gray-300 font-bold">{day}</div>
          ))}

          {generateDays().map((day, index) => {
            const isToday =
              day === today.date() &&
              currentMonth.month() === today.month() &&
              currentMonth.year() === today.year();

            const futureEvents = events.filter(
              (event) =>
                event.date.date() === day &&
                event.date.month() === currentMonth.month() &&
                event.date.year() === currentMonth.year()
            );

            const artistEvents = selectedArtist
              ? allArtistReleases.filter(
                  (release) =>
                    release.date.date() === day &&
                    release.date.month() === currentMonth.month() &&
                    release.date.year() === currentMonth.year()
                )
              : [];

            const dayEvents = [...futureEvents];
            if (selectedArtist) {
              artistEvents.forEach((release) => {
                if (!dayEvents.some((event) => event.title === release.title)) {
                  dayEvents.push(release);
                }
              });
            }

            return (
              <div
                key={index}
                className={`p-4 border rounded-md text-lg ${
                  day ? "border-gray-700" : "bg-transparent"
                } 
                ${
                  dayEvents.length > 0
                    ? futureEvents.length > 0
                      ? "bg-green-500 text-black font-bold cursor-pointer"
                      : "bg-orange-500 text-black font-bold cursor-pointer"
                    : ""
                } 
                ${isToday ? "border-2 border-green-500" : ""}`}
                onClick={() => {
                  if (day && dayEvents.length > 0) {
                    setSelectedDateEvents(dayEvents);
                    setShowPopup(true);
                  }
                }}
              >
                {day}
                {dayEvents.length > 0 && (
                  <div className="text-xs mt-1">
                    {dayEvents.map((event, i) => (
                      <div key={i}>{event.title}</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-black p-6 rounded-lg shadow-lg border border-gray-600 max-w-md w-full">
            <h3 className="text-green-400 text-lg font-bold mb-4">
              Sorties le {selectedDateEvents[0].date.format("DD/MM/YYYY")}
            </h3>

            {selectedDateEvents.some((event) => event.date.isAfter(today)) && (
              <div>
                <h4 className="text-green-400 font-semibold mb-2">Sorties futures</h4>
                {selectedDateEvents.some(
                  (event) => event.type === "album" && event.date.isAfter(today)
                ) && (
                  <div className="mb-4">
                    <h5 className="text-white font-medium">Albums</h5>
                    <ul className="space-y-2 text-sm">
                      {selectedDateEvents
                        .filter(
                          (event) => event.type === "album" && event.date.isAfter(today)
                        )
                        .map((event, i) => (
                          <li key={i} className="border-b border-gray-600 pb-1">
                            {event.title}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {selectedDateEvents.some(
                  (event) => event.type === "single" && event.date.isAfter(today)
                ) && (
                  <div className="mb-4">
                    <h5 className="text-white font-medium">Sons/Singles</h5>
                    <ul className="space-y-2 text-sm">
                      {selectedDateEvents
                        .filter(
                          (event) => event.type === "single" && event.date.isAfter(today)
                        )
                        .map((event, i) => (
                          <li key={i} className="border-b border-gray-600 pb-1">
                            {event.title}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {selectedDateEvents.some(
                  (event) =>
                    (event.type === "compilation" || event.type === "appears_on") &&
                    event.date.isAfter(today)
                ) && (
                  <div className="mb-4">
                    <h5 className="text-white font-medium">Autres (Compilations/Feats)</h5>
                    <ul className="space-y-2 text-sm">
                      {selectedDateEvents
                        .filter(
                          (event) =>
                            (event.type === "compilation" || event.type === "appears_on") &&
                            event.date.isAfter(today)
                        )
                        .map((event, i) => (
                          <li key={i} className="border-b border-gray-600 pb-1">
                            {event.title}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {selectedDateEvents.some((event) => !event.date.isAfter(today)) && (
              <div>
                <h4 className="text-orange-400 font-semibold mb-2">Sorties anciennes</h4>
                {selectedDateEvents.some(
                  (event) => event.type === "album" && !event.date.isAfter(today)
                ) && (
                  <div className="mb-4">
                    <h5 className="text-white font-medium">Albums</h5>
                    <ul className="space-y-2 text-sm">
                      {selectedDateEvents
                        .filter(
                          (event) => event.type === "album" && !event.date.isAfter(today)
                        )
                        .map((event, i) => (
                          <li key={i} className="border-b border-gray-600 pb-1">
                            {event.title}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {selectedDateEvents.some(
                  (event) => event.type === "single" && !event.date.isAfter(today)
                ) && (
                  <div className="mb-4">
                    <h5 className="text-white font-medium">Sons/Singles</h5>
                    <ul className="space-y-2 text-sm">
                      {selectedDateEvents
                        .filter(
                          (event) => event.type === "single" && !event.date.isAfter(today)
                        )
                        .map((event, i) => (
                          <li key={i} className="border-b border-gray-600 pb-1">
                            {event.title}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {selectedDateEvents.some(
                  (event) =>
                    (event.type === "compilation" || event.type === "appears_on") &&
                    !event.date.isAfter(today)
                ) && (
                  <div className="mb-4">
                    <h5 className="text-white font-medium">Autres (Compilations/Feats)</h5>
                    <ul className="space-y-2 text-sm">
                      {selectedDateEvents
                        .filter(
                          (event) =>
                            (event.type === "compilation" || event.type === "appears_on") &&
                            !event.date.isAfter(today)
                        )
                        .map((event, i) => (
                          <li key={i} className="border-b border-gray-600 pb-1">
                            {event.title}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setShowPopup(false)}
              className="mt-4 bg-green-500 text-black px-4 py-2 rounded hover:bg-green-600"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;