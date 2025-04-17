import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../assets/my-calendar.png";
import iconeProfil from "../assets/profile-icon.avif";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { FaChartPie, FaHistory, FaUserFriends } from "react-icons/fa";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);
dayjs.locale("fr");

const Calendar = () => {
  const [moisActuel, setMoisActuel] = useState(dayjs());
  const [ongletActif, setOngletActif] = useState("artists");
  const [artistes, setArtistes] = useState([]);
  const [donneesGenres, setDonneesGenres] = useState({ labels: [], datasets: [] });
  const [typeGraphique, setTypeGraphique] = useState("pie");
  const [chargement, setChargement] = useState(false);
  const [msgErreur, setMsgErreur] = useState(null);
  const [artisteChoisi, setArtisteChoisi] = useState(null);
  const [sortiesArtiste, setSortiesArtiste] = useState([]);
  const [toutesSorties, setToutesSorties] = useState([]);
  const [evenementsSelectionnes, setEvenementsSelectionnes] = useState([]);
  const [afficherPopup, setAfficherPopup] = useState(false);
  const [utilisateur, setUtilisateur] = useState(null);
  const [filtreType, setFiltreType] = useState("tous");
  const [filtrePeriode, setFiltrePeriode] = useState(6);
  const [rechercheArtiste, setRechercheArtiste] = useState("");
  const [filtreGenre, setFiltreGenre] = useState("tous");
  const [genresDisponibles, setGenresDisponibles] = useState([]);
  const [triHistorique, setTriHistorique] = useState("date-desc");

  const aujourdHui = dayjs();
  const navigate = useNavigate();
  const joursSemaine = ["Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam.", "Dim."];
  const debutMois = moisActuel.startOf("month");
  const finMois = moisActuel.endOf("month");
  const joursDansMois = finMois.date();
  const jourDebut = debutMois.day();

  const moisPrecedent = () => setMoisActuel(moisActuel.subtract(1, "month"));
  const moisSuivant = () => setMoisActuel(moisActuel.add(1, "month"));
  const allerAujourdHui = () => setMoisActuel(aujourdHui);

  const genererJours = () => {
    const jours = [];
    for (let i = 1 - (jourDebut === 0 ? 6 : jourDebut - 1); i <= joursDansMois; i++) {
      jours.push(i > 0 ? i : "");
    }
    return jours;
  };

  const rafraichirToken = async () => {
    const refreshTok = localStorage.getItem("refresh_token");
    if (!refreshTok) {
      navigate("/");
      return null;
    }

    try {
      const res = await fetch("http://localhost:3000/api/refresh-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshTok }),
      });

      if (!res.ok) {
        throw new Error(`Erreur HTTP : ${res.status} - ${await res.text()}`);
      }

      const data = await res.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("expires_at", (Date.now() + data.expires_in * 1000).toString());
      return data.access_token;
    } catch (e) {
      console.error("Échec du rafraîchissement du token :", e);
      localStorage.clear();
      navigate("/");
      return null;
    }
  };

  const fetchAvecAuth = async (url, options = {}) => {
    setChargement(true);
    setMsgErreur(null);

    let tok = localStorage.getItem("access_token");
    const expires = localStorage.getItem("expires_at");
    const tokType = localStorage.getItem("token_type") || "Bearer";

    if (!tok || !expires || Date.now() >= parseInt(expires)) {
      tok = await rafraichirToken();
      if (!tok) {
        setMsgErreur("Échec du rafraîchissement du token, veuillez vous reconnecter");
        setChargement(false);
        return null;
      }
    }

    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `${tokType} ${tok}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Erreur HTTP : ${res.status} - ${await res.text()}`);
      }

      const data = await res.json();
      return data;
    } catch (e) {
      setMsgErreur(e.message || "Une erreur est survenue, veuillez réessayer");
      console.error("Erreur lors de la requête :", e);
      return null;
    } finally {
      setChargement(false);
    }
  };

  const recupererProfilUtilisateur = async () => {
    const data = await fetchAvecAuth("https://api.spotify.com/v1/me");
    if (data) setUtilisateur(data);
  };

  const recupererArtistes = async () => {
    const data = await fetchAvecAuth("https://api.spotify.com/v1/me/following?type=artist&limit=50");
    if (data) {
      setArtistes(data.artists.items);
      const genres = [...new Set(data.artists.items.flatMap(artist => artist.genres))].sort();
      setGenresDisponibles(genres);
    }
  };

  const recupererChansonsRecentes = async () => {
    const data = await fetchAvecAuth("https://api.spotify.com/v1/me/player/recently-played?limit=50");
    if (!data) return;

    const chansons = data.items.map(item => item.track).filter(track => track);
    if (chansons.length === 0) {
      setMsgErreur("Aucune chanson récemment écoutée, écoutez de la musique pour voir des données");
      return;
    }

    const idsArtistes = [...new Set(chansons.flatMap(chanson => chanson.artists.map(artiste => artiste.id)))];
    if (idsArtistes.length === 0) {
      setMsgErreur("Aucun artiste trouvé dans les chansons récemment écoutées");
      return;
    }

    const donneesArtistes = await fetchAvecAuth(`https://api.spotify.com/v1/artists?ids=${idsArtistes.join(",")}`);
    if (!donneesArtistes) return;

    const artistesAvecGenres = donneesArtistes.artists;
    const compteGenres = {};
    artistesAvecGenres.forEach(artiste => {
      if (artiste && artiste.genres && artiste.genres.length > 0) {
        artiste.genres.forEach(genre => {
          compteGenres[genre] = (compteGenres[genre] || 0) + 1;
        });
      }
    });

    if (Object.keys(compteGenres).length === 0) {
      setMsgErreur("Aucun genre trouvé pour les artistes des chansons récemment écoutées");
      return;
    }

    const genresTries = Object.entries(compteGenres).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const etiquettes = genresTries.map(([genre]) => genre);
    const nombres = genresTries.map(([, count]) => count);
    const couleurs = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#66FF66", "#FF66CC", "#66CCCC", "#FF9933"];

    setDonneesGenres({
      labels: etiquettes,
      datasets: [{
        label: "Nombre d'artistes",
        data: nombres,
        backgroundColor: etiquettes.map((_, index) => couleurs[index % couleurs.length]),
        borderColor: "#000",
        borderWidth: 1,
      }],
    });
  };

  const recupererPlaylistEnBoucle = async () => {
    let playlists = [];
    let url = "https://api.spotify.com/v1/me/playlists?limit=50";

    while (url) {
      const data = await fetchAvecAuth(url);
      if (!data) return;
      playlists = [...playlists, ...data.items];
      url = data.next;
    }

    const playlistEnBoucle = playlists.find(playlist => playlist.name === "En Boucle" || playlist.name === "On Repeat");
    if (!playlistEnBoucle) {
      console.warn("Playlist 'En Boucle' non trouvée, utilisation des chansons récemment écoutées à la place");
      await recupererChansonsRecentes();
      return;
    }

    const donneesChansons = await fetchAvecAuth(`https://api.spotify.com/v1/playlists/${playlistEnBoucle.id}/tracks?limit=50`);
    if (!donneesChansons) return;

    const chansons = donneesChansons.items.map(item => item.track).filter(track => track);
    if (chansons.length === 0) {
      console.warn("Playlist 'En Boucle' vide, utilisation des chansons récemment écoutées à la place");
      await recupererChansonsRecentes();
      return;
    }

    const idsArtistes = [...new Set(chansons.flatMap(chanson => chanson.artists.map(artiste => artiste.id)))];
    if (idsArtistes.length === 0) {
      console.warn("Aucun artiste trouvé dans la playlist 'En Boucle', utilisation des chansons récemment écoutées à la place");
      await recupererChansonsRecentes();
      return;
    }

    const donneesArtistes = await fetchAvecAuth(`https://api.spotify.com/v1/artists?ids=${idsArtistes.join(",")}`);
    if (!donneesArtistes) return;

    const artistesAvecGenres = donneesArtistes.artists;
    const compteGenres = {};
    artistesAvecGenres.forEach(artiste => {
      if (artiste && artiste.genres && artiste.genres.length > 0) {
        artiste.genres.forEach(genre => {
          compteGenres[genre] = (compteGenres[genre] || 0) + 1;
        });
      }
    });

    if (Object.keys(compteGenres).length === 0) {
      console.warn("Aucun genre trouvé pour les artistes de la playlist 'En Boucle', utilisation des chansons récemment écoutées à la place");
      await recupererChansonsRecentes();
      return;
    }

    const genresTries = Object.entries(compteGenres).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const etiquettes = genresTries.map(([genre]) => genre);
    const nombres = genresTries.map(([, count]) => count);
    const couleurs = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#66FF66", "#FF66CC", "#66CCCC", "#FF9933"];

    setDonneesGenres({
      labels: etiquettes,
      datasets: [{
        label: "Nombre d'artistes",
        data: nombres,
        backgroundColor: etiquettes.map((_, index) => couleurs[index % couleurs.length]),
        borderColor: "#000",
        borderWidth: 1,
      }],
    });
  };

  const recupererSortiesArtiste = async (idArtiste) => {
    let toutesSorties = [];
    let url = `https://api.spotify.com/v1/artists/${idArtiste}/albums?include_groups=album,single,compilation,appears_on&limit=50&market=FR`;

    while (url) {
      const data = await fetchAvecAuth(url);
      if (!data) return;
      toutesSorties = [...toutesSorties, ...data.items];
      url = data.next;
    }

    const sortiesFormatees = toutesSorties.map(item => ({
      date: dayjs(item.release_date),
      titre: item.name,
      type: item.album_type,
      lienSpotify: item.external_urls.spotify,
      image: item.images[0]?.url || iconeProfil,
    }));

    setToutesSorties(sortiesFormatees);
    const dateActuelle = new Date("2025-04-06");
    const sortiesFutures = sortiesFormatees.filter(item => new Date(item.date) > dateActuelle);
    setSortiesArtiste(sortiesFutures);
  };

  useEffect(() => {
    recupererProfilUtilisateur();
    recupererArtistes();
    recupererPlaylistEnBoucle();
  }, []);

  const deconnexion = () => {
    toast.info("Déconnexion en cours... 👋", {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "dark",
    });
    setTimeout(() => {
      localStorage.clear();
      navigate("/");
    }, 2000);
  };

  const handleSpotifyLinkClick = (titre) => {
    toast.success(`Redirection vers Spotify 🎧 : ${titre}`, {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "dark",
    });
  };

  const artistesFiltres = artistes.filter(artiste =>
    artiste.name.toLowerCase().includes(rechercheArtiste.toLowerCase()) &&
    (filtreGenre === "tous" || artiste.genres.includes(filtreGenre))
  );

  const sortiesFiltreesEtTriees = toutesSorties
    .filter(sortie => {
      const periodeAvant = aujourdHui.subtract(filtrePeriode, "month");
      const dansPeriode = sortie.date.isAfter(periodeAvant) && sortie.date.isBefore(aujourdHui);
      const typeMatch =
        filtreType === "tous" ||
        (filtreType === "album" && sortie.type === "album") ||
        (filtreType === "single" && sortie.type === "single") ||
        (filtreType === "compilation" && sortie.type === "compilation") ||
        (filtreType === "appears_on" && sortie.type === "appears_on");
      return dansPeriode && typeMatch;
    })
    .sort((a, b) => {
      if (triHistorique === "date-desc") return b.date - a.date;
      if (triHistorique === "date-asc") return a.date - b.date;
      if (triHistorique === "title-asc") return a.titre.localeCompare(b.titre);
      if (triHistorique === "title-desc") return b.titre.localeCompare(a.titre);
      return 0;
    });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,#1a1a1a_0%,#121212_100%)] text-white flex">
      <aside className="w-1/4 trueGray-900 p-4 rounded-2xl shadow-md border border-gray-400 h-screen flex flex-col">
        <div className="flex items-center gap-2 text-lg font-bold mb-4">
          <img src={logo} alt="Logo" className="w-10 h-10" />
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Rechercher un artiste..."
            value={rechercheArtiste}
            onChange={(e) => setRechercheArtiste(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Rechercher un artiste"
          />
          <select
            value={filtreGenre}
            onChange={(e) => setFiltreGenre(e.target.value)}
            className="w-full mt-2 p-2 bg-gray-700 rounded text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Filtrer par genre"
          >
            <option value="tous">Tous les genres</option>
            {genresDisponibles.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>

        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <button
                className={`w-full flex items-center gap-2 p-2 rounded ${ongletActif === "artists" ? "bg-gray-700 text-green-400" : "text-gray-400 hover:bg-gray-800"}`}
                onClick={() => setOngletActif("artists")}
                aria-label="Voir les artistes suivis"
              >
                <FaUserFriends className="text-lg" /> Artistes
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center gap-2 p-2 rounded ${ongletActif === "history" ? "bg-gray-700 text-green-400" : "text-gray-400 hover:bg-gray-800"}`}
                onClick={() => setOngletActif("history")}
                aria-label="Voir l'historique des sorties"
              >
                <FaHistory className="text-lg" /> Historique
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center gap-2 p-2 rounded ${ongletActif === "genres" ? "bg-gray-700 text-green-400" : "text-gray-400 hover:bg-gray-800"}`}
                onClick={() => setOngletActif("genres")}
                aria-label="Voir les genres les plus écoutés"
              >
                <FaChartPie className="text-lg" /> Genres
              </button>
            </li>
          </ul>
        </nav>

        <div className="flex-1 overflow-y-auto">
          {ongletActif === "artists" && (
            <div>
              <h2 className="text-green-400 mt-4 text-lg font-semibold">Artistes suivis</h2>
              {chargement ? (
                <div className="mt-4 space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center gap-4 p-3 bg-gray-800 rounded-lg">
                      <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : msgErreur ? (
                <p className="text-red-500 mt-4">{msgErreur}</p>
              ) : (
                <div>
                  <ul className="mt-4 space-y-4">
                    {artistesFiltres.length > 0 ? (
                      artistesFiltres.map(artiste => (
                        <li
                          key={artiste.id}
                          className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all duration-200 cursor-pointer"
                          onClick={() => {
                            setArtisteChoisi(artiste);
                            recupererSortiesArtiste(artiste.id);
                          }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              setArtisteChoisi(artiste);
                              recupererSortiesArtiste(artiste.id);
                            }
                          }}
                          aria-label={`Voir les sorties de ${artiste.name}`}
                        >
                          <img
                            src={artiste.images?.[0]?.url || iconeProfil}
                            alt={`Photo de ${artiste.name}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="text-white font-medium">{artiste.name}</h3>
                            <p className="text-gray-400 text-sm">
                              {artiste.genres?.length > 0 ? artiste.genres.join(", ") : "Aucun genre"}
                            </p>
                            <div className="mt-1">
                              <span className="text-gray-500 text-xs">Popularité: </span>
                              <div className="w-24 bg-gray-600 rounded-full h-1.5 inline-block">
                                <div
                                  className="bg-green-500 h-1.5 rounded-full"
                                  style={{ width: `${artiste.popularity}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))
                    ) : (
                      <p className="text-gray-400 mt-4">Aucun artiste correspondant aux critères.</p>
                    )}
                  </ul>

                  {artisteChoisi && (
                    <div className="mt-6">
                      <h3 className="text-green-400 text-lg font-semibold">Prochaines sorties de {artisteChoisi.name}</h3>
                      {chargement ? (
                        <div className="mt-4 space-y-4">
                          {[...Array(2)].map((_, i) => (
                            <div key={i} className="animate-pulse flex items-center gap-4 p-3 bg-gray-800 rounded-lg">
                              <div className="w-10 h-10 bg-gray-700 rounded"></div>
                              <div className="flex-1">
                                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : msgErreur ? (
                        <p className="text-red-500 mt-2">{msgErreur}</p>
                      ) : sortiesArtiste.length > 0 ? (
                        <ul className="mt-4 space-y-4">
                          {sortiesArtiste.map((sortie, i) => (
                            <li
                              key={i}
                              className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg"
                            >
                              <img
                                src={sortie.image}
                                alt={`Couverture de ${sortie.titre}`}
                                className="w-10 h-10 rounded object-cover"
                              />
                              <div>
                                <a
                                  href={sortie.lienSpotify}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-400 hover:underline"
                                  onClick={() => handleSpotifyLinkClick(sortie.titre)}
                                >
                                  {sortie.titre}
                                </a>
                                <p className="text-gray-400 text-sm">
                                  Sortie prévue: {sortie.date.format("DD/MM/YYYY")} ({sortie.type})
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-400 mt-2">Aucune sortie future pour cet artiste.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {ongletActif === "history" && (
            <div>
              <h2 className="text-green-400 mt-4 text-lg font-semibold">Historique des sorties</h2>
              {artisteChoisi ? (
                <div className="mt-4">
                  <h3 className="text-green-400 text-base font-medium">Sorties de {artisteChoisi.name}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <select
                      value={filtreType}
                      onChange={(e) => setFiltreType(e.target.value)}
                      className="p-2 bg-gray-700 rounded text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                      aria-label="Filtrer par type de sortie"
                    >
                      <option value="tous">Tous les types</option>
                      <option value="album">Albums</option>
                      <option value="single">Singles</option>
                      <option value="compilation">Compilations</option>
                      <option value="appears_on">Feats</option>
                    </select>
                    <select
                      value={filtrePeriode}
                      onChange={(e) => setFiltrePeriode(Number(e.target.value))}
                      className="p-2 bg-gray-700 rounded text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                      aria-label="Filtrer par période"
                    >
                      <option value={1}>1 mois</option>
                      <option value={3}>3 mois</option>
                      <option value={6}>6 mois</option>
                      <option value={12}>12 mois</option>
                    </select>
                    <select
                      value={triHistorique}
                      onChange={(e) => setTriHistorique(e.target.value)}
                      className="p-2 bg-gray-700 rounded text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                      aria-label="Trier les sorties"
                    >
                      <option value="date-desc">Date (récent d'abord)</option>
                      <option value="date-asc">Date (ancien d'abord)</option>
                      <option value="title-asc">Titre (A-Z)</option>
                      <option value="title-desc">Titre (Z-A)</option>
                    </select>
                  </div>
                  {chargement ? (
                    <div className="mt-4 space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse flex items-center gap-4 p-3 bg-gray-800 rounded-lg">
                          <div className="w-12 h-12 bg-gray-700 rounded"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : msgErreur ? (
                    <p className="text-red-500 mt-2">{msgErreur}</p>
                  ) : sortiesFiltreesEtTriees.length > 0 ? (
                    <ul className="mt-4 space-y-4">
                      {sortiesFiltreesEtTriees.map((sortie, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all duration-200"
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              handleSpotifyLinkClick(sortie.titre);
                              window.open(sortie.lienSpotify, "_blank", "noopener,noreferrer");
                            }
                          }}
                          aria-label={`Ouvrir ${sortie.titre} sur Spotify`}
                        >
                          <img
                            src={sortie.image}
                            alt={`Couverture de ${sortie.titre}`}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div className="flex-1">
                            <a
                              href={sortie.lienSpotify}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 hover:underline font-medium"
                              onClick={() => handleSpotifyLinkClick(sortie.titre)}
                            >
                              {sortie.titre}
                            </a>
                            <p className="text-gray-400 text-sm">
                              Sortie le : {sortie.date.format("DD/MM/YYYY")} ({sortie.type})
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 mt-2">Aucune sortie dans cette période avec ces filtres.</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 mt-4">Veuillez sélectionner un artiste pour voir son historique.</p>
              )}
            </div>
          )}

          {ongletActif === "genres" && (
            <div>
              <h2 className="text-green-400 mt-4">Genres les plus écoutés (En Boucle)</h2>
              {donneesGenres.labels.length >= 3 && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-600 shadow-md">
                  <h3 className="text-white font-semibold mb-2 text-sm">🎧 Top 3 genres :</h3>
                  <ol className="list-decimal list-inside text-green-400 text-sm space-y-1">
                    <li>{donneesGenres.labels[0]}</li>
                    <li>{donneesGenres.labels[1]}</li>
                    <li>{donneesGenres.labels[2]}</li>
                  </ol>
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setTypeGraphique("pie")}
                  className={`p-2 rounded ${typeGraphique === "pie" ? "bg-green-500 text-black" : "bg-gray-700 text-white"}`}
                >
                  Graphique en secteurs
                </button>
                <button
                  onClick={() => setTypeGraphique("bar")}
                  className={`p-2 rounded ${typeGraphique === "bar" ? "bg-green-500 text-black" : "bg-gray-700 text-white"}`}
                >
                  Histogramme
                </button>
              </div>
              {chargement ? (
                <p className="text-gray-400 mt-4">Chargement...</p>
              ) : msgErreur ? (
                <p className="text-red-500 mt-4">{msgErreur}</p>
              ) : donneesGenres.labels.length > 0 ? (
                <div className="mt-4">
                  {typeGraphique === "pie" ? (
                    <Pie
                      data={donneesGenres}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: "bottom", labels: { color: "white" } },
                        },
                      }}
                    />
                  ) : (
                    <Bar
                      data={donneesGenres}
                      options={{
                        responsive: true,
                        scales: {
                          x: { ticks: { color: "white" } },
                          y: { beginAtZero: true, ticks: { color: "white", stepSize: 1 } },
                        },
                        plugins: { legend: { display: false } },
                      }}
                    />
                  )}
                </div>
              ) : (
                <p className="text-gray-400 mt-4">Aucun genre disponible pour la playlist 'En Boucle'.</p>
              )}
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-gray-600">
          <div className="flex items-center gap-2">
            <img
              src={utilisateur && utilisateur.images && utilisateur.images.length > 0 ? utilisateur.images[0].url : iconeProfil}
              alt="Profil"
              className="w-8 h-8 rounded-full border border-gray-400 cursor-pointer"
            />
            {utilisateur ? <span className="text-gray-400 text-sm">{utilisateur.display_name}</span> : <span className="text-gray-400 text-sm">Chargement...</span>}
            <button
              onClick={deconnexion}
              className="text-gray-400 text-sm hover:text-white ml-auto"
              aria-label="Se déconnecter"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      <main className="fixed top-0 right-0 w-3/4 h-screen trueGray-900 p-6 rounded-2xl shadow-md border border-gray-400 overflow-hidden">
        <div className="flex justify-between items-center mb-4 text-white">
          <button onClick={moisPrecedent} className="text-xl px-2" aria-label="Mois précédent">◀</button>
          <h1 className="text-3xl font-bold">{moisActuel.format("MMMM YYYY")}</h1>
          <button onClick={moisSuivant} className="text-xl px-2" aria-label="Mois suivant">▶</button>
        </div>
        <div className="flex justify-center mb-4">
          <button
            onClick={allerAujourdHui}
            className="bg-green-500 text-black px-4 py-2 rounded"
            aria-label="Aller à aujourd'hui"
          >
            Aujourd'hui
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {joursSemaine.map(jour => (
            <div key={jour} className="p-2 text-gray-300 font-bold">{jour}</div>
          ))}
          {genererJours().map((jour, index) => {
            const estAujourdHui = jour === aujourdHui.date() && moisActuel.month() === aujourdHui.month() && moisActuel.year() === aujourdHui.year();
            const evenementsArtiste = artisteChoisi ? toutesSorties.filter(sortie => sortie.date.date() === jour && sortie.date.month() === moisActuel.month() && sortie.date.year() === moisActuel.year()) : [];
            const evenementsJour = [...evenementsArtiste];

            return (
              <div
                key={index}
                className={`p-4 border rounded-md text-lg ${jour ? "border-gray-700" : "bg-transparent"} ${evenementsJour.length > 0 ? evenementsJour.some(event => event.date.isAfter(aujourdHui)) ? "bg-green-500 text-black font-bold cursor-pointer" : "bg-green-500 text-black font-bold cursor-pointer" : ""} ${estAujourdHui ? "border-2 border-green-500" : ""}`}
                onClick={() => {
                  if (jour && evenementsJour.length > 0) {
                    setEvenementsSelectionnes(evenementsJour);
                    setAfficherPopup(true);
                  }
                }}
                role={evenementsJour.length > 0 ? "button" : undefined}
                tabIndex={evenementsJour.length > 0 ? 0 : undefined}
                onKeyDown={(e) => {
                  if (evenementsJour.length > 0 && (e.key === "Enter" || e.key === " ")) {
                    setEvenementsSelectionnes(evenementsJour);
                    setAfficherPopup(true);
                  }
                }}
                aria-label={jour ? `Jour ${jour} du mois` : "Jour vide"}
              >
                {jour}
                {evenementsJour.length > 0 && (
                  <div className="text-xs mt-1">
                    {evenementsJour.map((event, i) => (
                      <div key={i}>
                        <a
                          href={event.lienSpotify}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-black hover:underline"
                          onClick={() => handleSpotifyLinkClick(event.titre)}
                        >
                          {event.titre}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {afficherPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-black p-6 rounded-lg shadow-lg border border-gray-600 max-w-md w-full">
            <h3 className="text-green-400 text-lg font-bold mb-4">
              Sorties le {evenementsSelectionnes[0].date.format("DD/MM/YYYY")}
            </h3>
            {evenementsSelectionnes.some(event => event.date.isAfter(aujourdHui)) && (
              <div>
                <h4 className="text-green-400 font-semibold mb-2">Sorties futures</h4>
                {evenementsSelectionnes.some(event => event.type === "album" && event.date.isAfter(aujourdHui)) && (
                  <div className="mb-4">
                    <h5 className="text-white font-medium">Albums</h5>
                    <ul className="space-y-2 text-sm">
                      {evenementsSelectionnes
                        .filter(event => event.type === "album" && event.date.isAfter(aujourdHui))
                        .map((event, i) => (
                          <li key={i} className="border-b border-gray-600 pb-1">
                            <a
                              href={event.lienSpotify}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 hover:underline"
                              onClick={() => handleSpotifyLinkClick(event.titre)}
                            >
                              {event.titre}
                            </a>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
                {evenementsSelectionnes.some(event => event.type === "single" && event.date.isAfter(aujourdHui)) && (
                  <div className="mb-4">
                    <h5 className="text-white font-medium">Sons/Singles</h5>
                    <ul className="space-y-2 text-sm">
                      {evenementsSelectionnes
                        .filter(event => event.type === "single" && event.date.isAfter(aujourdHui))
                        .map((event, i) => (
                          <li key={i} className="border-b border-gray-600 pb-1">
                            <a
                              href={event.lienSpotify}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 hover:underline"
                              onClick={() => handleSpotifyLinkClick(event.titre)}
                            >
                              {event.titre}
                            </a>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
                {evenementsSelectionnes.some(event => (event.type === "compilation" || event.type === "appears_on") && event.date.isAfter(aujourdHui)) && (
                  <div className="mb-4">
                    <h5 className="text-white font-medium">Autres (Compilations/Feats)</h5>
                    <ul className="space-y-2 text-sm">
                      {evenementsSelectionnes
                        .filter(event => (event.type === "compilation" || event.type === "appears_on") && event.date.isAfter(aujourdHui))
                        .map((event, i) => (
                          <li key={i} className="border-b border-gray-600 pb-1">
                            <a
                              href={event.lienSpotify}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 hover:underline"
                              onClick={() => handleSpotifyLinkClick(event.titre)}
                            >
                              {event.titre}
                            </a>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {evenementsSelectionnes.some(event => !event.date.isAfter(aujourdHui)) && (
              <div>
                <h4 className="text-orange-400 font-semibold mb-2">Sorties anciennes</h4>
                {evenementsSelectionnes.some(event => event.type === "album" && !event.date.isAfter(aujourdHui)) && (
                  <div className="mb-4">
                    <h5 className="text-white font-medium">Albums</h5>
                    <ul className="space-y-2 text-sm">
                      {evenementsSelectionnes
                        .filter(event => event.type === "album" && !event.date.isAfter(aujourdHui))
                        .map((event, i) => (
                          <li key={i} className="border-b border-gray-600 pb-1">
                            <a
                              href={event.lienSpotify}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 hover:underline"
                              onClick={() => handleSpotifyLinkClick(event.titre)}
                            >
                              {event.titre}
                            </a>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
                {evenementsSelectionnes.some(event => event.type === "single" && !event.date.isAfter(aujourdHui)) && (
                  <div className="mb-4">
                    <h5 className="text-white font-medium">Sons/Singles</h5>
                    <ul className="space-y-2 text-sm">
                      {evenementsSelectionnes
                        .filter(event => event.type === "single" && !event.date.isAfter(aujourdHui))
                        .map((event, i) => (
                          <li key={i} className="border-b border-gray-600 pb-1">
                            <a
                              href={event.lienSpotify}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 hover:underline"
                              onClick={() => handleSpotifyLinkClick(event.titre)}
                            >
                              {event.titre}
                            </a>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
                {evenementsSelectionnes.some(event => (event.type === "compilation" || event.type === "appears_on") && !event.date.isAfter(aujourdHui)) && (
                  <div className="mb-4">
                    <h5 className="text-white font-medium">Autres (Compilations/Feats)</h5>
                    <ul className="space-y-2 text-sm">
                      {evenementsSelectionnes
                        .filter(event => (event.type === "compilation" || event.type === "appears_on") && !event.date.isAfter(aujourdHui))
                        .map((event, i) => (
                          <li key={i} className="border-b border-gray-600 pb-1">
                            <a
                              href={event.lienSpotify}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 hover:underline"
                              onClick={() => handleSpotifyLinkClick(event.titre)}
                            >
                              {event.titre}
                            </a>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => setAfficherPopup(false)}
              className="mt-4 bg-green-500 text-black px-4 py-2 rounded hover:bg-green-600"
              aria-label="Fermer la popup"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastClassName="bg-gray-800 text-white border border-gray-600 rounded-lg shadow-lg"
        progressClassName="bg-green-500"
      />
    </div>
  );
};

export default Calendar;