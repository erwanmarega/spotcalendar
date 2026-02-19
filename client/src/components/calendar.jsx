import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../assets/my-calendar.png";
import iconeProfil from "../assets/profile-icon.avif";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import {
  FaChartPie,
  FaHistory,
  FaUserFriends,
  FaBars,
  FaTimes,
  FaBell,
} from "react-icons/fa";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { checkTokens, refreshToken, logout, fetchSpotifyData, getEmailPreferences, setEmailPreferences } from "../api";
import MissedReleases from "./MissedReleases";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);
dayjs.locale("fr");

const Calendar = () => {
  const [moisActuel, setMoisActuel] = useState(dayjs());
  const [ongletActif, setOngletActif] = useState("artists");
  const [artistes, setArtistes] = useState([]);
  const [donneesGenres, setDonneesGenres] = useState({
    labels: [],
    datasets: [],
  });
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
  const [emailEnabled, setEmailEnabled] = useState(false);

  const aujourdHui = dayjs();
  const navigate = useNavigate();
  const joursSemaine = ["Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam.", "Dim."];
  const debutMois = moisActuel.startOf("month");
  const finMois = moisActuel.endOf("month");
  const joursDansMois = finMois.date();
  const jourDebut = debutMois.day();

  const moisPrecedent = useCallback(
    () => setMoisActuel(moisActuel.subtract(1, "month")),
    [moisActuel]
  );
  const moisSuivant = useCallback(
    () => setMoisActuel(moisActuel.add(1, "month")),
    [moisActuel]
  );
  const allerAujourdHui = useCallback(() => setMoisActuel(aujourdHui), []);

  const genererJours = useMemo(() => {
    const jours = [];
    for (
      let i = 1 - (jourDebut === 0 ? 6 : jourDebut - 1);
      i <= joursDansMois;
      i++
    ) {
      jours.push(i > 0 ? i : "");
    }
    return jours;
  }, [jourDebut, joursDansMois]);

  const getAuthTokens = async () => {
    return await checkTokens();
  };

  const rafraichirToken = async () => {
    const tokens = await getAuthTokens();
    if (!tokens?.refresh_token_exists) {
      throw new Error("Aucun refresh_token disponible");
    }
    await refreshToken();
    return true;
  };

  const fetchAvecAuth = async (path, options = {}) => {
    setChargement(true);
    setMsgErreur(null);
    try {
      const tokens = await getAuthTokens();
      if (
        !tokens?.access_token_exists ||
        !tokens?.expires_at ||
        Date.now() >= parseInt(tokens.expires_at)
      ) {
        await rafraichirToken();
      }
      const cleanPath = path.replace(/^\/+|\/+$/g, "");
      const data = await fetchSpotifyData(cleanPath, options);
      return data;
    } catch (e) {
      if (e.message.includes("404")) {
        setMsgErreur(
          "Ressource non trouvée. Vérifiez votre requête ou essayez plus tard."
        );
      } else {
        setMsgErreur(
          e.message || "Une erreur est survenue. Veuillez réessayer."
        );
      }
      return null;
    } finally {
      setChargement(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const recupererProfilUtilisateur = useCallback(async () => {
    const data = await fetchAvecAuth("me");
    if (data) setUtilisateur(data);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const recupererArtistes = useCallback(async () => {
    const data = await fetchAvecAuth("me/following?type=artist&limit=50");
    if (data) {
      setArtistes(data.artists.items);
      setGenresDisponibles(
        [
          ...new Set(data.artists.items.flatMap((artist) => artist.genres)),
        ].sort()
      );
    }
  }, []);

  const recupererChansonsRecentes = useCallback(async () => {
    const data = await fetchAvecAuth("me/player/recently-played?limit=50");
    if (!data) return;
    const chansons = data.items
      .map((item) => item.track)
      .filter((track) => track);
    if (chansons.length === 0) {
      setMsgErreur(
        "Aucune chanson récente. Écoutez de la musique pour voir des données."
      );
      return;
    }
    const idsArtistes = [
      ...new Set(
        chansons.flatMap((chanson) =>
          chanson.artists.map((artiste) => artiste.id)
        )
      ),
    ];
    const artisteData = [];
    for (let i = 0; i < idsArtistes.length; i += 50) {
      const batch = idsArtistes.slice(i, i + 50);
      const donneesArtistes = await fetchAvecAuth(
        `artists?ids=${batch.join(",")}`
      );
      if (donneesArtistes) artisteData.push(...donneesArtistes.artists);
    }
    if (!artisteData.length) return;
    const compteGenres = {};
    artisteData.forEach((artiste) => {
      if (artiste?.genres?.length) {
        artiste.genres.forEach((genre) => {
          compteGenres[genre] = (compteGenres[genre] || 0) + 1;
        });
      }
    });
    if (!Object.keys(compteGenres).length) {
      setMsgErreur("Aucun genre trouvé pour les artistes récents.");
      return;
    }
    const genresTries = Object.entries(compteGenres)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    const etiquettes = genresTries.map(([genre]) => genre);
    const nombres = genresTries.map(([, count]) => count);
    const couleurs = [
      "#1DB954",
      "#1ed760",
      "#17a844",
      "#148a38",
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
      "#FF9F40",
    ];
    setDonneesGenres({
      labels: etiquettes,
      datasets: [
        {
          label: "Artistes",
          data: nombres,
          backgroundColor: etiquettes.map(
            (_, i) => couleurs[i % couleurs.length]
          ),
          borderColor: "#121212",
          borderWidth: 2,
        },
      ],
    });
  }, []);

  const recupererPlaylistEnBoucle = useCallback(async () => {
    let playlists = [];
    let url = "me/playlists?limit=50";
    while (url) {
      const data = await fetchAvecAuth(url);
      if (!data) return;
      playlists = [...playlists, ...data.items];
      url = data.next
        ? data.next.replace("https://api.spotify.com/v1", "")
        : null;
    }
    const playlistEnBoucle = playlists.find(
      (p) => p.name === "En Boucle" || p.name === "On Repeat"
    );
    if (!playlistEnBoucle) {
      await recupererChansonsRecentes();
      return;
    }
    const donneesChansons = await fetchAvecAuth(
      `playlists/${playlistEnBoucle.id}/tracks?limit=50`
    );
    if (!donneesChansons) return;
    const chansons = donneesChansons.items
      .map((item) => item.track)
      .filter((track) => track);
    if (!chansons.length) {
      await recupererChansonsRecentes();
      return;
    }
    const idsArtistes = [
      ...new Set(
        chansons.flatMap((chanson) =>
          chanson.artists.map((artiste) => artiste.id)
        )
      ),
    ];
    const artisteData = [];
    for (let i = 0; i < idsArtistes.length; i += 50) {
      const batch = idsArtistes.slice(i, i + 50);
      const donneesArtistes = await fetchAvecAuth(
        `artists?ids=${batch.join(",")}`
      );
      if (donneesArtistes) artisteData.push(...donneesArtistes.artists);
    }
    if (!artisteData.length) return;
    const compteGenres = {};
    artisteData.forEach((artiste) => {
      if (artiste?.genres?.length) {
        artiste.genres.forEach((genre) => {
          compteGenres[genre] = (compteGenres[genre] || 0) + 1;
        });
      }
    });
    if (!Object.keys(compteGenres).length) {
      await recupererChansonsRecentes();
      return;
    }
    const genresTries = Object.entries(compteGenres)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    const etiquettes = genresTries.map(([genre]) => genre);
    const nombres = genresTries.map(([, count]) => count);
    const couleurs = [
      "#1DB954",
      "#1ed760",
      "#17a844",
      "#148a38",
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
      "#FF9F40",
    ];
    setDonneesGenres({
      labels: etiquettes,
      datasets: [
        {
          label: "Artistes",
          data: nombres,
          backgroundColor: etiquettes.map(
            (_, i) => couleurs[i % couleurs.length]
          ),
          borderColor: "#121212",
          borderWidth: 2,
        },
      ],
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
      url = data.next
        ? data.next.replace("https://api.spotify.com/v1", "")
        : null;
    }
    const sortiesFormatees = toutesSorties.map((item) => ({
      date: dayjs(item.release_date),
      titre: item.name,
      type: item.album_type,
      groupe: item.album_group,
      lienSpotify: item.external_urls.spotify,
      image: item.images[0]?.url || iconeProfil,
    }));
    setToutesSorties(sortiesFormatees);
    const dateActuelle = new Date("2025-04-06");
    setSortiesArtiste(
      sortiesFormatees.filter((item) => new Date(item.date) > dateActuelle)
    );
  }, []);

  useEffect(() => {
    recupererProfilUtilisateur();
    recupererArtistes();
    recupererPlaylistEnBoucle();
    getEmailPreferences().then((prefs) => setEmailEnabled(prefs.enabled)).catch(() => {});
  }, [
    recupererProfilUtilisateur,
    recupererArtistes,
    recupererPlaylistEnBoucle,
  ]);

  const deconnexion = useCallback(() => {
    toast.info("Déconnexion en cours... 👋", {
      position: "bottom-right",
      autoClose: 2000,
      theme: "dark",
    });
    setTimeout(async () => {
      try {
        await logout();
      } catch {
        // logout peut échouer, on redirige quand même
      } finally {
        navigate("/login", { replace: true, state: { fromLogout: true } });
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

  const artistesFiltres = useMemo(
    () =>
      artistes.filter(
        (artiste) =>
          artiste.name.toLowerCase().includes(rechercheArtiste.toLowerCase()) &&
          (filtreGenre === "tous" || artiste.genres.includes(filtreGenre))
      ),
    [artistes, rechercheArtiste, filtreGenre]
  );

  const sortiesFiltreesEtTriees = useMemo(
    () =>
      toutesSorties
        .filter((sortie) => {
          const periodeAvant = aujourdHui.subtract(filtrePeriode, "month");
          const dansPeriode =
            sortie.date.isAfter(periodeAvant) &&
            sortie.date.isBefore(aujourdHui);
          const typeMatch = filtreType === "tous" || filtreType === sortie.type;
          return dansPeriode && typeMatch;
        })
        .sort((a, b) => {
          if (triHistorique === "date-desc") return b.date - a.date;
          if (triHistorique === "date-asc") return a.date - b.date;
          if (triHistorique === "title-asc")
            return a.titre.localeCompare(b.titre);
          if (triHistorique === "title-desc")
            return b.titre.localeCompare(b.titre);
          return 0;
        }),
    [toutesSorties, filtrePeriode, filtreType, triHistorique, aujourdHui]
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#121212] text-white">
      <button
        className="md:hidden fixed top-4 left-4 z-50 w-9 h-9 flex items-center justify-center bg-[#282828] rounded-full shadow-lg"
        onClick={() => setSidebarOuverte(!sidebarOuverte)}
        aria-label={sidebarOuverte ? "Fermer le menu" : "Ouvrir le menu"}
      >
        {sidebarOuverte ? <FaTimes size={14} /> : <FaBars size={14} />}
      </button>

      {sidebarOuverte && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-30"
          onClick={() => setSidebarOuverte(false)}
        />
      )}

      <aside
        className={`
          fixed md:relative top-0 left-0 h-full w-[280px] flex-shrink-0
          flex flex-col z-40
          transform transition-transform duration-300 ease-in-out
          ${
            sidebarOuverte ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0
        `}
      >
        <div className="bg-[#121212] rounded-lg mx-2 mt-2 mb-2 flex-shrink-0">
          <div className="flex items-center gap-2.5 px-4 pt-5 pb-4">
            <img src={logo} alt="Logo" className="w-7 h-7 flex-shrink-0" />
            <span className="font-bold text-sm tracking-tight text-white">
              Mon Calendrier
            </span>
          </div>

          <nav className="px-2 pb-3">
            <ul className="space-y-0.5">
              {[
                { id: "artists", label: "Artistes", icon: FaUserFriends },
                { id: "history", label: "Historique", icon: FaHistory },
                { id: "genres", label: "Genres", icon: FaChartPie },
                { id: "ratés", label: "Ratés", icon: FaBell },
              ].map(({ id, label, icon: Icon }) => (
                <li key={id}>
                  <button
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors duration-100
                      ${
                        ongletActif === id
                          ? "text-white"
                          : "text-[#B3B3B3] hover:text-white"
                      }
                    `}
                    onClick={() => setOngletActif(id)}
                    aria-label={`Voir ${label.toLowerCase()}`}
                  >
                    <Icon
                      className={`text-[22px] flex-shrink-0 ${
                        ongletActif === id ? "text-white" : "text-[#B3B3B3]"
                      }`}
                    />
                    <span
                      className={`text-sm leading-none ${
                        ongletActif === id ? "font-bold" : "font-medium"
                      }`}
                    >
                      {label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="bg-[#121212] rounded-lg mx-2 flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 flex-shrink-0">
            <div className="flex items-center gap-3 text-[#B3B3B3] hover:text-white cursor-default transition-colors">
              <FaUserFriends className="text-xl" />
              <span className="text-sm font-bold">Votre bibliothèque</span>
            </div>
          </div>

          <div className="px-3 pb-3 space-y-2 flex-shrink-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un artiste..."
                value={rechercheArtiste}
                onChange={(e) => setRechercheArtiste(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#242424] rounded-full text-xs text-white placeholder-[#727272] outline-none focus:ring-1 focus:ring-white/20 transition-all"
                aria-label="Rechercher un artiste"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#727272]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <select
              value={filtreGenre}
              onChange={(e) => setFiltreGenre(e.target.value)}
              className="w-full px-3 py-2 bg-[#242424] rounded-full text-xs text-white outline-none cursor-pointer"
              aria-label="Filtrer par genre"
            >
              <option value="tous">Tous les genres</option>
              {genresDisponibles.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          <div className="mx-4 border-t border-[#282828] mb-1 flex-shrink-0" />

          <div className="flex-1 overflow-y-auto px-3 pb-4">
            {ongletActif === "artists" && (
              <div>
                <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#727272]">
                  Artistes suivis
                </p>
                {chargement ? (
                  <div className="space-y-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse flex items-center gap-3 px-3 py-2"
                      >
                        <div className="w-9 h-9 bg-[#282828] rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 bg-[#282828] rounded w-2/3" />
                          <div className="h-2.5 bg-[#282828] rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : msgErreur ? (
                  <div className="mx-1 p-3 bg-[#2a1010] border border-red-900/50 rounded-lg">
                    <p className="text-red-400 text-xs">{msgErreur}</p>
                  </div>
                ) : (
                  <ul className="space-y-0.5">
                    {artistesFiltres.length ? (
                      artistesFiltres.map((artiste) => (
                        <li
                          key={artiste.id}
                          className={`
                          flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors duration-150 group
                          ${
                            artisteChoisi?.id === artiste.id
                              ? "bg-[#282828]"
                              : "hover:bg-[#181818]"
                          }
                        `}
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
                            alt={artiste.name}
                            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                            loading="lazy"
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-medium truncate transition-colors ${
                                artisteChoisi?.id === artiste.id
                                  ? "text-[#1DB954]"
                                  : "text-white"
                              }`}
                            >
                              {artiste.name}
                            </p>
                            <p className="text-xs text-[#727272] truncate">
                              {artiste.genres?.length
                                ? artiste.genres[0]
                                : "Artiste"}
                            </p>
                          </div>
                        </li>
                      ))
                    ) : (
                      <p className="px-3 py-4 text-[#727272] text-sm">
                        Aucun artiste trouvé.
                      </p>
                    )}
                  </ul>
                )}

                {artisteChoisi && !chargement && (
                  <div className="mt-4 px-1">
                    <div className="flex items-center gap-2 mb-2 px-2">
                      <div className="w-0.5 h-4 bg-[#1DB954] rounded-full" />
                      <p className="text-xs font-bold text-white">
                        Prochaines sorties
                      </p>
                    </div>
                    <p className="px-3 text-[11px] text-[#727272] mb-2">
                      {artisteChoisi.name}
                    </p>
                    {sortiesArtiste.length ? (
                      <ul className="space-y-0.5">
                        {sortiesArtiste.map((sortie, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-[#181818] transition-colors"
                          >
                            <img
                              src={sortie.image}
                              alt=""
                              className="w-8 h-8 rounded object-cover flex-shrink-0"
                              loading="lazy"
                            />
                            <div className="flex-1 min-w-0">
                              <a
                                href={sortie.lienSpotify}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#1DB954] text-xs font-medium hover:underline block truncate"
                                onClick={() =>
                                  handleSpotifyLinkClick(sortie.titre)
                                }
                              >
                                {sortie.titre}
                              </a>
                              <p className="text-[#727272] text-[10px]">
                                {sortie.date.format("DD/MM/YYYY")} ·{" "}
                                {sortie.type}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="px-3 text-[#727272] text-xs">
                        Aucune sortie à venir.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {ongletActif === "history" && (
              <div>
                <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#727272]">
                  Historique
                </p>
                {artisteChoisi ? (
                  <div>
                    <p className="px-3 text-sm font-medium text-white mb-3">
                      {artisteChoisi.name}
                    </p>
                    <div className="space-y-1.5 mb-4">
                      {[
                        {
                          value: filtreType,
                          onChange: (v) => setFiltreType(v),
                          options: [
                            ["tous", "Tous"],
                            ["album", "Albums"],
                            ["single", "Singles"],
                            ["compilation", "Compilations"],
                            ["appears_on", "Feats"],
                          ],
                        },
                        {
                          value: filtrePeriode,
                          onChange: (v) => setFiltrePeriode(Number(v)),
                          options: [
                            [1, "1 mois"],
                            [3, "3 mois"],
                            [6, "6 mois"],
                            [12, "12 mois"],
                          ],
                        },
                        {
                          value: triHistorique,
                          onChange: (v) => setTriHistorique(v),
                          options: [
                            ["date-desc", "Récent d'abord"],
                            ["date-asc", "Ancien d'abord"],
                            ["title-asc", "Titre A→Z"],
                            ["title-desc", "Titre Z→A"],
                          ],
                        },
                      ].map((sel, idx) => (
                        <select
                          key={idx}
                          value={sel.value}
                          onChange={(e) => sel.onChange(e.target.value)}
                          className="w-full px-3 py-2 bg-[#242424] rounded-md text-xs text-white outline-none cursor-pointer"
                        >
                          {sel.options.map(([val, label]) => (
                            <option key={val} value={val}>
                              {label}
                            </option>
                          ))}
                        </select>
                      ))}
                    </div>
                    {chargement ? (
                      <div className="space-y-1">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className="animate-pulse flex items-center gap-3 px-2 py-2"
                          >
                            <div className="w-9 h-9 bg-[#282828] rounded flex-shrink-0" />
                            <div className="flex-1 space-y-1.5">
                              <div className="h-3 bg-[#282828] rounded w-3/4" />
                              <div className="h-2.5 bg-[#282828] rounded w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : sortiesFiltreesEtTriees.length ? (
                      <ul className="space-y-0.5">
                        {sortiesFiltreesEtTriees.map((sortie, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-[#181818] transition-colors cursor-pointer"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                handleSpotifyLinkClick(sortie.titre);
                                window.open(
                                  sortie.lienSpotify,
                                  "_blank",
                                  "noopener,noreferrer"
                                );
                              }
                            }}
                          >
                            <img
                              src={sortie.image}
                              alt=""
                              className="w-9 h-9 rounded object-cover flex-shrink-0"
                              loading="lazy"
                            />
                            <div className="flex-1 min-w-0">
                              <a
                                href={sortie.lienSpotify}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white text-xs font-medium hover:text-[#1DB954] transition-colors block truncate"
                                onClick={() =>
                                  handleSpotifyLinkClick(sortie.titre)
                                }
                              >
                                {sortie.titre}
                              </a>
                              <p className="text-[#727272] text-[10px]">
                                {sortie.date.format("DD/MM/YYYY")} ·{" "}
                                {sortie.type}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="px-3 text-[#727272] text-sm">
                        Aucune sortie pour ces filtres.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="px-3 py-4 text-[#727272] text-sm">
                    Sélectionnez un artiste pour voir son historique.
                  </p>
                )}
              </div>
            )}

            {ongletActif === "genres" && (
              <div>
                <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#727272]">
                  Genres les plus écoutés
                </p>
                {donneesGenres.labels.length >= 3 && (
                  <div className="mx-1 p-3 bg-[#181818] rounded-lg mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#727272] mb-2">
                      Top 3
                    </p>
                    <ol className="space-y-1.5">
                      {donneesGenres.labels.slice(0, 3).map((genre, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="text-[#1DB954] text-xs font-bold w-4">
                            {i + 1}
                          </span>
                          <span className="text-white text-sm truncate">
                            {genre}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                <div className="flex gap-1.5 px-1 mb-4">
                  {[
                    { id: "pie", label: "Secteurs" },
                    { id: "bar", label: "Barres" },
                  ].map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => setTypeGraphique(id)}
                      className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
                        typeGraphique === id
                          ? "bg-white text-black"
                          : "bg-[#242424] text-[#B3B3B3] hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {chargement ? (
                  <p className="px-3 text-[#727272] text-sm">Chargement...</p>
                ) : donneesGenres.labels.length ? (
                  <div className="px-1">
                    {typeGraphique === "pie" ? (
                      <Pie
                        data={donneesGenres}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: "bottom",
                              labels: {
                                color: "#B3B3B3",
                                font: { size: 10 },
                                boxWidth: 12,
                                padding: 8,
                              },
                            },
                          },
                        }}
                      />
                    ) : (
                      <Bar
                        data={donneesGenres}
                        options={{
                          responsive: true,
                          scales: {
                            x: {
                              ticks: { color: "#B3B3B3", font: { size: 9 } },
                              grid: { color: "#282828" },
                            },
                            y: {
                              beginAtZero: true,
                              ticks: { color: "#B3B3B3", stepSize: 1 },
                              grid: { color: "#282828" },
                            },
                          },
                          plugins: { legend: { display: false } },
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <p className="px-3 text-[#727272] text-sm">
                    Aucun genre disponible.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex-shrink-0 px-4 pt-3 pb-1 border-t border-[#282828] bg-[#121212]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-[#B3B3B3] font-medium">Emails hebdomadaires</span>
              <button
                onClick={() => {
                  const next = !emailEnabled;
                  setEmailEnabled(next);
                  setEmailPreferences(next).catch(() => setEmailEnabled(!next));
                }}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${
                  emailEnabled ? "bg-[#1DB954]" : "bg-[#282828]"
                }`}
                aria-label="Activer les emails hebdomadaires"
                role="switch"
                aria-checked={emailEnabled}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 mt-0.5 ${
                    emailEnabled ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <img
                src={utilisateur?.images?.[0]?.url || iconeProfil}
                alt="Profil"
                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                loading="lazy"
              />
              <span className="text-sm font-bold text-white flex-1 truncate">
                {utilisateur?.display_name || "Chargement..."}
              </span>
              <button
                onClick={deconnexion}
                className="text-[#B3B3B3] hover:text-white transition-colors text-xs font-medium flex-shrink-0"
                aria-label="Se déconnecter"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#1a1a1a] via-[#161616] to-[#121212]">
        {ongletActif === "ratés" ? (
          <MissedReleases />
        ) : null}
        <div className={`px-6 py-8 ${ongletActif === "ratés" ? "hidden" : ""}`}>
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={moisPrecedent}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-[#282828] hover:bg-[#3E3E3E] transition-colors text-sm"
              aria-label="Mois précédent"
            >
              ◀
            </button>
            <h1 className="text-2xl font-bold capitalize tracking-tight">
              {moisActuel.format("MMMM YYYY")}
            </h1>
            <button
              onClick={moisSuivant}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-[#282828] hover:bg-[#3E3E3E] transition-colors text-sm"
              aria-label="Mois suivant"
            >
              ▶
            </button>
          </div>

          <div className="flex justify-center mb-8">
            <button
              onClick={allerAujourdHui}
              className="bg-white text-black text-xs font-bold px-5 py-2 rounded-full hover:scale-105 active:scale-95 transition-transform"
              aria-label="Aller à aujourd'hui"
            >
              Aujourd&apos;hui
            </button>
          </div>

          <div className="grid grid-cols-7 mb-2 hidden md:grid">
            {joursSemaine.map((jour) => (
              <div
                key={jour}
                className="text-center text-[10px] font-bold uppercase tracking-widest text-[#727272] py-2"
              >
                {jour}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
            {genererJours.map((jour, index) => {
              const estAujourdHui =
                jour === aujourdHui.date() &&
                moisActuel.isSame(aujourdHui, "month");
              const evenementsJour = artisteChoisi
                ? toutesSorties.filter(
                    (sortie) =>
                      sortie.date.date() === jour &&
                      sortie.date.isSame(moisActuel, "month")
                  )
                : [];

              return (
                <div
                  key={index}
                  className={`
                    relative min-h-[80px] md:min-h-[100px] rounded-lg flex flex-col overflow-hidden
                    transition-all duration-200
                    ${
                      !jour
                        ? "bg-transparent pointer-events-none"
                        : evenementsJour.length
                        ? "bg-[#181818] border border-[#1DB954]/25 hover:border-[#1DB954]/60 cursor-pointer hover:shadow-[0_0_20px_rgba(29,185,84,0.15)]"
                        : `bg-[#181818] cursor-default ${
                            estAujourdHui
                              ? "ring-2 ring-[#1DB954]"
                              : "hover:bg-[#1f1f1f]"
                          }`
                    }
                  `}
                  onClick={() => {
                    if (jour && evenementsJour.length) {
                      setEvenementsSelectionnes(evenementsJour);
                      setAfficherPopup(true);
                    }
                  }}
                  role={evenementsJour.length ? "button" : undefined}
                  tabIndex={evenementsJour.length ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (
                      evenementsJour.length &&
                      (e.key === "Enter" || e.key === " ")
                    ) {
                      setEvenementsSelectionnes(evenementsJour);
                      setAfficherPopup(true);
                    }
                  }}
                  aria-label={jour ? `Jour ${jour}` : "Jour vide"}
                >
                  {evenementsJour.length > 0 && evenementsJour[0].image && (
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `url(${evenementsJour[0].image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        opacity: 0.07,
                      }}
                    />
                  )}
                  {evenementsJour.length > 0 && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#1DB954] rounded-l-lg" />
                  )}

                  <div className="relative z-10 p-3 flex flex-col h-full">
                    <div className="flex items-start justify-between">
                      <span
                        className={`text-sm font-semibold leading-none ${
                          estAujourdHui && !evenementsJour.length
                            ? "text-[#1DB954]"
                            : "text-white"
                        }`}
                      >
                        {jour}
                      </span>
                      {evenementsJour.length > 0 && evenementsJour[0].image && (
                        <img
                          src={evenementsJour[0].image}
                          alt=""
                          className="w-6 h-6 rounded object-cover opacity-90 flex-shrink-0"
                          loading="lazy"
                        />
                      )}
                    </div>

                    {evenementsJour.length > 0 && (
                      <div className="mt-1.5 space-y-0.5 overflow-hidden flex-1">
                        {evenementsJour.slice(0, 2).map((event, i) => (
                          <div
                            key={i}
                            className="text-[9px] truncate leading-tight"
                          >
                            <a
                              href={event.lienSpotify}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`hover:underline ${
                                i === 0
                                  ? "text-[#1DB954] font-semibold"
                                  : "text-[#B3B3B3]"
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSpotifyLinkClick(event.titre);
                              }}
                            >
                              {event.titre}
                            </a>
                          </div>
                        ))}
                        {evenementsJour.length > 2 && (
                          <div className="text-[9px] text-[#727272] mt-0.5">
                            +{evenementsJour.length - 2} autres
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {afficherPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

            <div className="relative h-40 overflow-hidden">
              {evenementsSelectionnes[0].image && (
                <img
                  src={evenementsSelectionnes[0].image}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/50 to-transparent" />
              <button
                onClick={() => setAfficherPopup(false)}
                className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors text-xs"
                aria-label="Fermer"
              >
                ✕
              </button>
              <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
                <h3 className="text-white font-bold text-sm capitalize">
                  {evenementsSelectionnes[0].date.format("dddd D MMMM YYYY")}
                </h3>
                <p className="text-[#B3B3B3] text-[11px] mt-0.5">
                  {evenementsSelectionnes.length} sortie{evenementsSelectionnes.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="max-h-[45vh] overflow-y-auto px-3 py-3 space-y-4">
              {evenementsSelectionnes.some((e) => e.date.isAfter(aujourdHui)) && (
                <div>
                  <p className="text-[#1DB954] text-[10px] font-bold uppercase tracking-wider mb-2 px-2">
                    À venir
                  </p>
                  {["album", "single", "compilation", "appears_on"].map((groupe) => {
                    const filteredEvents = evenementsSelectionnes.filter(
                      (event) => event.groupe === groupe && event.date.isAfter(aujourdHui)
                    );
                    if (!filteredEvents.length) return null;
                    return (
                      <div key={groupe} className="mb-2">
                        <p className="text-[#727272] text-[10px] font-medium uppercase tracking-wide mb-1 px-2">
                          {groupe === "album" ? "Albums" : groupe === "single" ? "Singles" : groupe === "compilation" ? "Compilations" : "Featurings"}
                        </p>
                        <ul className="space-y-0.5">
                          {filteredEvents.map((event, i) => (
                            <li key={i}>
                              <a
                                href={event.lienSpotify}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors group"
                                onClick={() => handleSpotifyLinkClick(event.titre)}
                              >
                                {event.image && (
                                  <img
                                    src={event.image}
                                    alt=""
                                    className="w-9 h-9 rounded object-cover flex-shrink-0"
                                    loading="lazy"
                                  />
                                )}
                                <span className="text-white text-sm group-hover:text-[#1DB954] transition-colors truncate flex-1">
                                  {event.titre}
                                </span>
                                {event.groupe === "appears_on" && (
                                  <span className="flex-shrink-0 text-[9px] font-bold bg-[#727272]/20 text-[#727272] px-1.5 py-0.5 rounded-full">
                                    Feat.
                                  </span>
                                )}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
              {evenementsSelectionnes.some((e) => !e.date.isAfter(aujourdHui)) && (
                <div>
                  <p className="text-[#727272] text-[10px] font-bold uppercase tracking-wider mb-2 px-2">
                    Passées
                  </p>
                  {["album", "single", "compilation", "appears_on"].map((groupe) => {
                    const filteredEvents = evenementsSelectionnes.filter(
                      (event) => event.groupe === groupe && !event.date.isAfter(aujourdHui)
                    );
                    if (!filteredEvents.length) return null;
                    return (
                      <div key={groupe} className="mb-2">
                        <p className="text-[#727272] text-[10px] font-medium uppercase tracking-wide mb-1 px-2">
                          {groupe === "album" ? "Albums" : groupe === "single" ? "Singles" : groupe === "compilation" ? "Compilations" : "Featurings"}
                        </p>
                        <ul className="space-y-0.5">
                          {filteredEvents.map((event, i) => (
                            <li key={i}>
                              <a
                                href={event.lienSpotify}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors group"
                                onClick={() => handleSpotifyLinkClick(event.titre)}
                              >
                                {event.image && (
                                  <img
                                    src={event.image}
                                    alt=""
                                    className="w-9 h-9 rounded object-cover flex-shrink-0 opacity-60"
                                    loading="lazy"
                                  />
                                )}
                                <span className="text-[#B3B3B3] text-sm group-hover:text-white transition-colors truncate flex-1">
                                  {event.titre}
                                </span>
                                {event.groupe === "appears_on" && (
                                  <span className="flex-shrink-0 text-[9px] font-bold bg-[#727272]/20 text-[#727272] px-1.5 py-0.5 rounded-full">
                                    Feat.
                                  </span>
                                )}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-white/5">
              <button
                onClick={() => setAfficherPopup(false)}
                className="w-full bg-white text-black text-sm font-bold py-2.5 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-transform"
                aria-label="Fermer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        theme="dark"
        toastClassName="!bg-[#282828] !text-white !border !border-[#3E3E3E] !rounded-xl !shadow-xl"
        progressClassName="!bg-[#1DB954]"
      />
    </div>
  );
};

export default Calendar;
