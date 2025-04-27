import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../assets/my-calendar.png";
import iconeProfil from "../assets/profile-icon.avif";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { FaChartPie, FaHistory, FaUserFriends, FaBars, FaTimes } from "react-icons/fa";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { checkTokens, refreshToken, logout, fetchSpotifyData } from "../api";

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
  const [sidebarOuverte, setSidebarOuverte] = useState(false);

  const aujourdHui = dayjs();
  const navigate = useNavigate();
  const joursSemaine = ["Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam.", "Dim."];
  const debutMois = moisActuel.startOf("month");
  const finMois = moisActuel.endOf("month");
  const joursDansMois = finMois.date();
  const jourDebut = debutMois.day();

  const moisPrecedent = useCallback(() => setMoisActuel(moisActuel.subtract(1, "month")), [moisActuel]);
  const moisSuivant = useCallback(() => setMoisActuel(moisActuel.add(1, "month")), [moisActuel]);
  const allerAujourdHui = useCallback(() => setMoisActuel(aujourdHui), []);

  const genererJours = useMemo(() => {
    const jours = [];
    for (let i = 1 - (jourDebut === 0 ? 6 : jourDebut - 1); i <= joursDansMois; i++) {
      jours.push(i > 0 ? i : "");
    }
    return jours;
  }, [jourDebut, joursDansMois]);

  const getAuthTokens = async () => {
    try {
      const tokens = await checkTokens();
      return tokens;
    } catch (e) {
      throw e;
    }
  };

  const rafraichirToken = async () => {
    const tokens = await getAuthTokens();
    if (!tokens?.refresh_token_exists) {
      throw new Error("Aucun refresh_token disponible");
    }

    try {
      await refreshToken();
      return true;
    } catch (e) {
      throw e;
    }
  };

  const fetchAvecAuth = async (path, options = {}) => {
    setChargement(true);
    setMsgErreur(null);

    try {
      const tokens = await getAuthTokens();
      if (!tokens?.access_token_exists || !tokens?.expires_at || Date.now() >= parseInt(tokens.expires_at)) {
        await rafraichirToken();
      }

      const cleanPath = path.replace(/^\/+|\/+$/g, '');
      const data = await fetchSpotifyData(cleanPath, options);
      return data;
    } catch (e) {
      if (e.message.includes("404")) {
        setMsgErreur("Ressource non trouvée. Vérifiez votre requête ou essayez plus tard.");
      } else {
        setMsgErreur(e.message || "Une erreur est survenue. Veuillez réessayer.");
      }
      return null;
    } finally {
      setChargement(false);
    }
  };

  const recupererProfilUtilisateur = useCallback(async () => {
    const data = await fetchAvecAuth("me");
    if (data) setUtilisateur(data);
  }, []);

  const recupererArtistes = useCallback(async () => {
    const data = await fetchAvecAuth("me/following?type=artist&limit=50");
    if (data) {
      setArtistes(data.artists.items);
      setGenresDisponibles([...new Set(data.artists.items.flatMap(artist => artist.genres))].sort());
    }
  }, []);

  const recupererChansonsRecentes = useCallback(async () => {
    const data = await fetchAvecAuth("me/player/recently-played?limit=50");
    if (!data) return;

    const chansons = data.items.map(item => item.track).filter(track => track);
    if (chansons.length === 0) {
      setMsgErreur("Aucune chanson récente. Écoutez de la musique pour voir des données.");
      return;
    }

    const idsArtistes = [...new Set(chansons.flatMap(chanson => chanson.artists.map(artiste => artiste.id)))];
    const artisteData = [];
    
    for (let i = 0; i < idsArtistes.length; i += 50) {
      const batch = idsArtistes.slice(i, i + 50);
      const donneesArtistes = await fetchAvecAuth(`artists?ids=${batch.join(",")}`);
      if (donneesArtistes) {
        artisteData.push(...donneesArtistes.artists);
      }
    }

    if (!artisteData.length) return;

    const compteGenres = {};
    artisteData.forEach(artiste => {
      if (artiste?.genres?.length) {
        artiste.genres.forEach(genre => {
          compteGenres[genre] = (compteGenres[genre] || 0) + 1;
        });
      }
    });

    if (!Object.keys(compteGenres).length) {
      setMsgErreur("Aucun genre trouvé pour les artistes récents.");
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
  }, []);

  const recupererPlaylistEnBoucle = useCallback(async () => {
    let playlists = [];
    let url = "me/playlists?limit=50";

    while (url) {
      const data = await fetchAvecAuth(url);
      if (!data) return;
      playlists = [...playlists, ...data.items];
      url = data.next ? data.next.replace('https://api.spotify.com/v1', '') : null;
    }

    const playlistEnBoucle = playlists.find(p => p.name === "En Boucle" || p.name === "On Repeat");
    if (!playlistEnBoucle) {
      await recupererChansonsRecentes();
      return;
    }

    const donneesChansons = await fetchAvecAuth(`playlists/${playlistEnBoucle.id}/tracks?limit=50`);
    if (!donneesChansons) return;

    const chansons = donneesChansons.items.map(item => item.track).filter(track => track);
    if (!chansons.length) {
      await recupererChansonsRecentes();
      return;
    }

    const idsArtistes = [...new Set(chansons.flatMap(chanson => chanson.artists.map(artiste => artiste.id)))];
    const artisteData = [];

    for (let i = 0; i < idsArtistes.length; i += 50) {
      const batch = idsArtistes.slice(i, i + 50);
      const donneesArtistes = await fetchAvecAuth(`artists?ids=${batch.join(",")}`);
      if (donneesArtistes) {
        artisteData.push(...donneesArtistes.artists);
      }
    }

    if (!artisteData.length) return;

    const compteGenres = {};
    artisteData.forEach(artiste => {
      if (artiste?.genres?.length) {
        artiste.genres.forEach(genre => {
          compteGenres[genre] = (compteGenres[genre] || 0) + 1;
        });
      }
    });

    if (!Object.keys(compteGenres).length) {
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
  }, [recupererChansonsRecentes]);

  const recupererSortiesArtiste = useCallback(async (idArtiste) => {
    let toutesSorties = [];
    let url = `artists/${idArtiste}/albums?include_groups=album,single,compilation,appears_on&limit=50&market=FR`;

    while (url) {
      const data = await fetchAvecAuth(url);
      if (!data) {
        setMsgErreur("Aucune donnée disponible pour cet artiste.");
        return;
      }
      toutesSorties = [...toutesSorties, ...data.items];
      url = data.next ? data.next.replace('https://api.spotify.com/v1', '') : null;
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
    setSortiesArtiste(sortiesFormatees.filter(item => new Date(item.date) > dateActuelle));
  }, []);

  useEffect(() => {
    recupererProfilUtilisateur();
    recupererArtistes();
    recupererPlaylistEnBoucle();
  }, [recupererProfilUtilisateur, recupererArtistes, recupererPlaylistEnBoucle]);

  const deconnexion = useCallback(() => {
    toast.info("Déconnexion en cours... 👋", {
      position: "bottom-right",
      autoClose: 2000,
      theme: "dark",
    });
    setTimeout(async () => {
      try {
        await logout();
      } catch (e) {
      } finally {
        navigate("/login", { replace: true }); 
      }
    }, 2000);
  }, [navigate]);

  const handleSpotifyLinkClick = useCallback((titre) => {
    toast.success(`Redirection vers Spotify 🎧 : ${titre}`, {
      position: "bottom-right",
      autoClose: 3000,
      theme: "dark",
    });
  }, []);

  const artistesFiltres = useMemo(() => 
    artistes.filter(artiste =>
      artiste.name.toLowerCase().includes(rechercheArtiste.toLowerCase()) &&
      (filtreGenre === "tous" || artiste.genres.includes(filtreGenre))
    ), [artistes, rechercheArtiste, filtreGenre]);

  const sortiesFiltreesEtTriees = useMemo(() => 
    toutesSorties
      .filter(sortie => {
        const periodeAvant = aujourdHui.subtract(filtrePeriode, "month");
        const dansPeriode = sortie.date.isAfter(periodeAvant) && sortie.date.isBefore(aujourdHui);
        const typeMatch =
          filtreType === "tous" ||
          (filtreType === sortie.type);
        return dansPeriode && typeMatch;
      })
      .sort((a, b) => {
        if (triHistorique === "date-desc") return b.date - a.date;
        if (triHistorique === "date-asc") return a.date - b.date;
        if (triHistorique === "title-asc") return a.titre.localeCompare(b.titre);
        if (triHistorique === "title-desc") return b.titre.localeCompare(b.titre);
        return 0;
      }), [toutesSorties, filtrePeriode, filtreType, triHistorique, aujourdHui]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,#1a1a1a_0%,#121212_100%)] text-white flex flex-col md:flex-row">
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-700 rounded-full"
        onClick={() => setSidebarOuverte(!sidebarOuverte)}
        aria-label={sidebarOuverte ? "Fermer le menu" : "Ouvrir le menu"}
      >
        {sidebarOuverte ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      <aside
        className={`fixed md:static top-0 left-0 h-full w-3/4 md:w-1/4 bg-black p-6 transform transition-transform duration-300 ease-in-out ${
          sidebarOuverte ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 z-40 flex flex-col md:h-screen`}
      >
        <div className="flex items-center gap-3 mb-6 md:sticky md:top-0 md:z-10 md:bg-black">
          <img src={logo} alt="Logo" className="w-12 h-12" />
          <h1 className="text-xl font-bold">Mon Calendrier</h1>
        </div>

        <div className="mb-6 space-y-4 md:sticky md:top-[80px] md:z-10 md:bg-black">
          <input
            type="text"
            placeholder="Rechercher un artiste..."
            value={rechercheArtiste}
            onChange={(e) => setRechercheArtiste(e.target.value)}
            className="w-full p-3 bg-black rounded-lg text-white border border-gray-600 focus:ring-2 focus:ring-green-500"
            aria-label="Rechercher un artiste"
          />
          <select
            value={filtreGenre}
            onChange={(e) => setFiltreGenre(e.target.value)}
            className="w-full p-3 bg-black rounded-lg text-white border border-gray-600 focus:ring-2 focus:ring-green-500"
            aria-label="Filtrer par genre"
          >
            <option value="tous">Tous les genres</option>
            {genresDisponibles.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>

        <nav className="mb-6 md:sticky md:top-[200px] md:z-10 md:bg-black">
          <ul className="space-y-3">
            {[
              { id: "artists", label: "Artistes", icon: FaUserFriends },
              { id: "history", label: "Historique", icon: FaHistory },
              { id: "genres", label: "Genres", icon: FaChartPie },
            ].map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <button
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-lg ${
                    ongletActif === id ? "bg-green-500 text-black" : "text-gray-300 hover:bg-gray-700"
                  } transition-colors duration-200`}
                  onClick={() => setOngletActif(id)}
                  aria-label={`Voir ${label.toLowerCase()}`}
                >
                  <Icon className="text-xl" /> {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex-1 overflow-y-auto mt-6 md:max-h-[calc(100vh-400px)] md:min-h-[200px]">
          {ongletActif === "artists" && (
            <div>
              <h2 className="text-green-400 text-xl font-semibold mb-4">Artistes suivis</h2>
              {chargement ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center gap-4 p-3 bg-gray-700 rounded-lg">
                      <div className="w-12 h-12 bg-gray-600 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : msgErreur ? (
                <p className="text-red-500">{msgErreur}</p>
              ) : (
                <div>
                  <ul className="space-y-4">
                    {artistesFiltres.length ? (
                      artistesFiltres.map(artiste => (
                        <li
                          key={artiste.id}
                          className="flex items-center gap-4 p-3 bg-black rounded-lg hover:bg-gray-600 cursor-pointer transition-all duration-200"
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
                            loading="lazy"
                          />
                          <div className="flex-1">
                            <h3 className="text-white font-medium">{artiste.name}</h3>
                            <p className="text-gray-400 text-sm">
                              {artiste.genres?.length ? artiste.genres.join(", ") : "Aucun genre"}
                            </p>
                            <div className="mt-2">
                              <span className="text-gray-500 text-xs">Popularité: </span>
                              <div className="w-24 bg-gray-600 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${artiste.popularity}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))
                    ) : (
                      <p className="text-gray-400">Aucun artiste trouvé.</p>
                    )}
                  </ul>

                  {artisteChoisi && (
                    <div className="mt-6">
                      <h3 className="text-green-400 text-xl font-semibold">Prochaines sorties de {artisteChoisi.name}</h3>
                      {chargement ? (
                        <div className="mt-4 space-y-4">
                          {[...Array(2)].map((_, i) => (
                            <div key={i} className="animate-pulse flex items-center gap-4 p-3 bg-gray-700">
                              <div className="w-10 h-10 bg-gray-600 rounded"></div>
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : msgErreur ? (
                        <p className="text-red-500">{msgErreur}</p>
                      ) : sortiesArtiste.length ? (
                        <ul className="mt-4 space-y-4">
                          {sortiesArtiste.map((sortie, i) => (
                            <li key={i} className="flex items-center gap-4 p-3 bg-black rounded-lg">
                              <img
                                src={sortie.image}
                                alt={`Couverture de ${sortie.titre}`}
                                className="w-10 h-10 rounded object-cover"
                                loading="lazy"
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
                        <p className="text-gray-400">Aucune sortie future.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {ongletActif === "history" && (
            <div>
              <h2 className="text-green-400 text-xl font-semibold mb-4">Historique des sorties</h2>
              {artisteChoisi ? (
                <div>
                  <h3 className="text-green-400 text-lg font-medium mb-4">Sorties de {artisteChoisi.name}</h3>
                  <div className="flex flex-wrap gap-3 mb-4">
                    <select
                      value={filtreType}
                      onChange={(e) => setFiltreType(e.target.value)}
                      className="p-3 bg-gray-700 rounded-lg text-white border border-gray-600 focus:ring-2 focus:ring-green-500"
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
                      className="p-3 bg-gray-700 rounded-lg text-white border border-gray-600 focus:ring-2 focus:ring-green-500"
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
                      className="p-3 bg-gray-700 rounded-lg text-white border border-gray-600 focus:ring-2 focus:ring-green-500"
                      aria-label="Trier les sorties"
                    >
                      <option value="date-desc">Date (récent)</option>
                      <option value="date-asc">Date (ancien)</option>
                      <option value="title-asc">Titre (A-Z)</option>
                      <option value="title-desc">Titre (Z-A)</option>
                    </select>
                  </div>
                  {chargement ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse flex items-center gap-4 p-3 bg-gray-700 rounded-lg">
                          <div className="w-12 h-12 bg-gray-600 rounded"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : msgErreur ? (
                    <p className="text-red-500">{msgErreur}</p>
                  ) : sortiesFiltreesEtTriees.length ? (
                    <ul className="space-y-4">
                      {sortiesFiltreesEtTriees.map((sortie, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-200"
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
                            loading="lazy"
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
                              Sortie: {sortie.date.format("DD/MM/YYYY")} ({sortie.type})
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400">Aucune sortie pour ces filtres.</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-400">Sélectionnez un artiste pour voir son historique.</p>
              )}
            </div>
          )}

          {ongletActif === "genres" && (
            <div>
              <h2 className="text-green-400 text-xl font-semibold mb-4">Genres les plus écoutés</h2>
              {donneesGenres.labels.length >= 3 && (
                <div className="p-4 bg-gray-700 rounded-lg mb-4">
                  <h3 className="text-white font-semibold mb-2">🎧 Top 3 genres :</h3>
                  <ol className="list-decimal list-inside text-green-400 text-sm space-y-1">
                    {donneesGenres.labels.slice(0, 3).map((genre, i) => (
                      <div key={i}>{genre}</div>
                    ))}
                  </ol>
                </div>
              )}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => setTypeGraphique("pie")}
                  className={`p-3 rounded-lg ${typeGraphique === "pie" ? "bg-green-500 text-black" : "bg-gray-700 text-gray-400"}`}
                >
                  Secteurs
                </button>
                <button
                  onClick={() => setTypeGraphique("bar")}
                  className={`p-3 rounded-lg ${typeGraphique === "bar" ? "bg-green-500 text-black" : "bg-gray-700 text-gray-400"}`}
                >
                  Histogramme
                </button>
              </div>
              {chargement ? (
                <p className="text-gray-400">Chargement...</p>
              ) : msgErreur ? (
                <p className="text-red-500">{msgErreur}</p>
              ) : donneesGenres.labels.length ? (
                <div className="mt-4">
                  {typeGraphique === "pie" ? (
                    <Pie
                      data={donneesGenres}
                      options={{
                        responsive: true,
                        plugins: { legend: { position: "bottom", labels: { color: "white" } } },
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
                <p className="text-gray-400">Aucun genre disponible.</p>
              )}
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-gray-600 flex items-center gap-3 md:sticky md:bottom-0 md:z-10 md:bg-black">
          <img
            src={utilisateur?.images?.[0]?.url || iconeProfil}
            alt="Profil"
            className="w-10 h-10 rounded-full border border-gray-400"
            loading="lazy"
          />
          <span className="text-gray-300 text-sm">{utilisateur?.display_name || "Chargement..."}</span>
          <button
            onClick={deconnexion}
            className="ml-auto text-gray-300 hover:text-white"
            aria-label="Se déconnecter"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:ml-0 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <button onClick={moisPrecedent} className="text-2xl p-2 hover:bg-gray-700 rounded" aria-label="Mois précédent">◀</button>
          <h1 className="text-3xl font-bold capitalize">{moisActuel.format("MMMM YYYY")}</h1>
          <button onClick={moisSuivant} className="text-2xl p-2 hover:bg-gray-700 rounded" aria-label="Mois suivant">▶</button>
        </div>
        <div className="flex justify-center mb-6">
          <button
            onClick={allerAujourdHui}
            className="bg-green-500 text-black px-6 py-2 rounded-lg hover:bg-green-600"
            aria-label="Aller à aujourd'hui"
          >
            Aujourd'hui
          </button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center text-sm">
          {joursSemaine.map(jour => (
            <div key={jour} className="p-2 text-gray-300 font-bold hidden md:block">{jour}</div>
          ))}
          {genererJours.map((jour, index) => {
            const estAujourdHui = jour === aujourdHui.date() && moisActuel.isSame(aujourdHui, "month");
            const evenementsJour = artisteChoisi
              ? toutesSorties.filter(sortie => sortie.date.date() === jour && sortie.date.isSame(moisActuel, "month"))
              : [];

            return (
              <div
                key={index}
                className={`p-4 border rounded-lg text-lg ${
                  jour ? "border-gray-700 bg-black" : "bg-transparent"
                } ${evenementsJour.length ? "bg-green-500 text-black font-bold cursor-pointer" : ""} ${
                  estAujourdHui ? "border-2 border-green-500" : ""
                } hover:bg-gray-700 transition-all duration-200`}
                onClick={() => {
                  if (jour && evenementsJour.length) {
                    setEvenementsSelectionnes(evenementsJour);
                    setAfficherPopup(true);
                  }
                }}
                role={evenementsJour.length ? "button" : undefined}
                tabIndex={evenementsJour.length ? 0 : undefined}
                onKeyDown={(e) => {
                  if (evenementsJour.length && (e.key === "Enter" || e.key === " ")) {
                    setEvenementsSelectionnes(evenementsJour);
                    setAfficherPopup(true);
                  }
                }}
                aria-label={jour ? `Jour ${jour}` : "Jour vide"}
              >
                {jour}
                {evenementsJour.length > 0 && (
                  <div className="text-xs mt-2">
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
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-600 max-w-md w-full transform transition-all duration-300 scale-95 animate-popup">
            <h3 className="text-green-400 text-lg font-bold mb-4">
              Sorties le {evenementsSelectionnes[0].date.format("DD/MM/YYYY")}
            </h3>
            {evenementsSelectionnes.some(event => event.date.isAfter(aujourdHui)) && (
              <div>
                <h4 className="text-green-400 font-semibold mb-2">Sorties futures</h4>
                {["album", "single", "compilation,appears_on"].map(type => {
                  const filteredEvents = evenementsSelectionnes.filter(event => 
                    (type.includes(",") ? type.split(",").includes(event.type) : event.type === type) && event.date.isAfter(aujourdHui)
                  );
                  if (!filteredEvents.length) return null;
                  return (
                    <div key={type} className="mb-4">
                      <h5 className="text-white font-medium">
                        {type === "album" ? "Albums" : type === "single" ? "Singles" : "Compilations/Feats"}
                      </h5>
                      <ul className="space-y-2 text-sm">
                        {filteredEvents.map((event, i) => (
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
                  );
                })}
              </div>
            )}
            {evenementsSelectionnes.some(event => !event.date.isAfter(aujourdHui)) && (
              <div>
                <h4 className="text-orange-400 font-semibold mb-2">Sorties passées</h4>
                {["album", "single", "compilation,appears_on"].map(type => {
                  const filteredEvents = evenementsSelectionnes.filter(event => 
                    (type.includes(",") ? type.split(",").includes(event.type) : event.type === type) && !event.date.isAfter(aujourdHui)
                  );
                  if (!filteredEvents.length) return null;
                  return (
                    <div key={type} className="mb-4">
                      <h5 className="text-white font-medium">
                        {type === "album" ? "Albums" : type === "single" ? "Singles" : "Compilations/Feats"}
                      </h5>
                      <ul className="space-y-2 text-sm">
                        {filteredEvents.map((event, i) => (
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
                  );
                })}
              </div>
            )}
            <button
              onClick={() => setAfficherPopup(false)}
              className="mt-4 bg-green-500 text-black px-6 py-2 rounded-lg hover:bg-green-600"
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
        theme="dark"
        toastClassName="bg-gray-800 text-white border border-gray-600 rounded-lg shadow-lg"
        progressClassName="bg-green-500"
      />
    </div>
  );
};

export default Calendar;