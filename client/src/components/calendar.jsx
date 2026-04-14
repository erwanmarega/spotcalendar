import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../assets/my-calendar.png";
import iconeProfil from "../assets/profile-icon.avif";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { FaBars, FaTimes } from "react-icons/fa";
import {
  checkTokens,
  refreshToken,
  logout,
  fetchSpotifyData,
  getEmailPreferences,
  setEmailPreferences,
  getDemoData,
} from "../api";
import SmartReleases from "./SmartReleases";
import PlayButton from "./PlayButton";
import Navbar from "./Navbar";

dayjs.locale("fr");

const DEMO_IMAGES = {
  Drake: "https://placehold.co/300x300/8B5CF6/ffffff?text=DR",
  "Taylor Swift": "https://placehold.co/300x300/EC4899/ffffff?text=TS",
  "The Weeknd": "https://placehold.co/300x300/EF4444/ffffff?text=TW",
  "Daft Punk": "https://placehold.co/300x300/F59E0B/ffffff?text=DP",
  Rosalía: "https://placehold.co/300x300/10B981/ffffff?text=RO",
  Stromae: "https://placehold.co/300x300/3B82F6/ffffff?text=ST",
  "Billie Eilish": "https://placehold.co/300x300/84CC16/ffffff?text=BE",
  "Kendrick Lamar": "https://placehold.co/300x300/F97316/ffffff?text=KL",
};

const DEMO_ARTISTES = [
  {
    id: "demo-1",
    name: "Drake",
    genres: ["hip hop", "rap"],
    images: [{ url: DEMO_IMAGES["Drake"] }],
  },
  {
    id: "demo-2",
    name: "Taylor Swift",
    genres: ["pop", "indie pop"],
    images: [{ url: DEMO_IMAGES["Taylor Swift"] }],
  },
  {
    id: "demo-3",
    name: "The Weeknd",
    genres: ["r&b", "pop"],
    images: [{ url: DEMO_IMAGES["The Weeknd"] }],
  },
  {
    id: "demo-4",
    name: "Daft Punk",
    genres: ["electronic", "house"],
    images: [{ url: DEMO_IMAGES["Daft Punk"] }],
  },
  {
    id: "demo-5",
    name: "Rosalía",
    genres: ["latin", "flamenco pop"],
    images: [{ url: DEMO_IMAGES["Rosalía"] }],
  },
  {
    id: "demo-6",
    name: "Stromae",
    genres: ["chanson française", "electronic"],
    images: [{ url: DEMO_IMAGES["Stromae"] }],
  },
  {
    id: "demo-7",
    name: "Billie Eilish",
    genres: ["pop", "alternative"],
    images: [{ url: DEMO_IMAGES["Billie Eilish"] }],
  },
  {
    id: "demo-8",
    name: "Kendrick Lamar",
    genres: ["hip hop", "conscious rap"],
    images: [{ url: DEMO_IMAGES["Kendrick Lamar"] }],
  },
];

const DEMO_SORTIES_GLOBALES = [
  {
    albumId: "d1",
    date: dayjs("2026-04-02"),
    titre: "Certified Lover Boy II",
    artiste: "Drake",
    type: "album",
    groupe: "album",
    lienSpotify: "#",
    image: DEMO_IMAGES["Drake"],
  },
  {
    albumId: "d2",
    date: dayjs("2026-04-05"),
    titre: "The Tortured Poets Vol. 2",
    artiste: "Taylor Swift",
    type: "album",
    groupe: "album",
    lienSpotify: "#",
    image: DEMO_IMAGES["Taylor Swift"],
  },
  {
    albumId: "d3",
    date: dayjs("2026-04-10"),
    titre: "Midnight Sun",
    artiste: "The Weeknd",
    type: "single",
    groupe: "single",
    lienSpotify: "#",
    image: DEMO_IMAGES["The Weeknd"],
  },
  {
    albumId: "d4",
    date: dayjs("2026-04-14"),
    titre: "Random Access Memories II",
    artiste: "Daft Punk",
    type: "album",
    groupe: "album",
    lienSpotify: "#",
    image: DEMO_IMAGES["Daft Punk"],
  },
  {
    albumId: "d5",
    date: dayjs("2026-04-18"),
    titre: "MOTOMAMI 2",
    artiste: "Rosalía",
    type: "album",
    groupe: "album",
    lienSpotify: "#",
    image: DEMO_IMAGES["Rosalía"],
  },
  {
    albumId: "d6",
    date: dayjs("2026-04-21"),
    titre: "Multitude II",
    artiste: "Stromae",
    type: "single",
    groupe: "single",
    lienSpotify: "#",
    image: DEMO_IMAGES["Stromae"],
  },
  {
    albumId: "d7",
    date: dayjs("2026-04-25"),
    titre: "HIT ME HARD AND SOFT 2",
    artiste: "Billie Eilish",
    type: "album",
    groupe: "album",
    lienSpotify: "#",
    image: DEMO_IMAGES["Billie Eilish"],
  },
  {
    albumId: "d8",
    date: dayjs("2026-04-28"),
    titre: "GNX Deluxe",
    artiste: "Kendrick Lamar",
    type: "album",
    groupe: "album",
    lienSpotify: "#",
    image: DEMO_IMAGES["Kendrick Lamar"],
  },
];

const DEMO_GENRES = {
  labels: [
    "hip hop",
    "pop",
    "r&b",
    "electronic",
    "rap",
    "latin",
    "alternative",
    "chanson française",
    "house",
    "indie pop",
  ],
  datasets: [
    {
      label: "Artistes",
      data: [8, 7, 5, 4, 6, 3, 3, 2, 2, 2],
      backgroundColor: [
        "#1DB954",
        "#1ed760",
        "#17a844",
        "#148a38",
        "#FFCE56",
        "#FF6384",
        "#36A2EB",
        "#4BC0C0",
        "#9966FF",
        "#FF9F40",
      ],
      borderColor: "#121212",
      borderWidth: 2,
    },
  ],
};

const Calendar = () => {
  const [moisActuel, setMoisActuel] = useState(dayjs());
  const [ongletActif, setOngletActif] = useState("artists");
  const [artistes, setArtistes] = useState([]);
  const [donneesGenres, setDonneesGenres] = useState({
    labels: [],
    datasets: [],
  });
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
  const [sortiesGlobales, setSortiesGlobales] = useState([]);
  const [chargementCalendrier, setChargementCalendrier] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [artistesParGenre, setArtistesParGenre] = useState({});
  const [genreChoisi, setGenreChoisi] = useState(null);
  const tokenExpiresAtRef = useRef(null);
  const cacheAlbumsRef = useRef({});
  const isDemoRef = useRef(false);

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

  const rafraichirToken = async () => {
    await refreshToken();
    tokenExpiresAtRef.current = Date.now() + 3600 * 1000;
    return true;
  };

  const fetchAvecAuth = async (path, options = {}, retries = 1) => {
    setChargement(true);
    setMsgErreur(null);
    try {
      if (
        !tokenExpiresAtRef.current ||
        Date.now() >= tokenExpiresAtRef.current
      ) {
        await rafraichirToken();
      }
      const cleanPath = path.replace(/^\/+|\/+$/g, "");
      const data = await fetchSpotifyData(cleanPath, options);
      return data;
    } catch (e) {
      if (e.message.includes("429") && retries > 0) {
        await new Promise((r) => setTimeout(r, 2000));
        return fetchAvecAuth(path, options, retries - 1);
      }
      if (e.message.includes("404")) {
        setMsgErreur("Ressource non trouvée.");
      } else if (e.message.includes("429")) {
        setMsgErreur(
          "Trop de requêtes Spotify. Réessaie dans quelques secondes."
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

  const recupererProfilUtilisateur = useCallback(async () => {
    const data = await fetchAvecAuth("me");
    if (data) setUtilisateur(data);
  }, []);

  const recupererArtistes = useCallback(async () => {
    const data = await fetchAvecAuth("me/following?type=artist&limit=50");
    if (data) {
      setArtistes(data.artists.items);
      setGenresDisponibles(
        [
          ...new Set(data.artists.items.flatMap((artist) => artist.genres)),
        ].sort()
      );
      return data.artists.items;
    }
    return [];
  }, []);

  const recupererToutesSortiesGlobales = useCallback(async (artistesList) => {
    if (!artistesList?.length) return;
    setChargementCalendrier(true);
    const since = dayjs().subtract(3, "month");
    const sinceStr = since.format("YYYY-MM-DD");
    const results = [];
    const batchSize = 5;
    try {
      if (
        !tokenExpiresAtRef.current ||
        Date.now() >= tokenExpiresAtRef.current
      ) {
        await refreshToken();
        tokenExpiresAtRef.current = Date.now() + 3600 * 1000;
      }
      for (let i = 0; i < artistesList.length; i += batchSize) {
        const batch = artistesList.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (artiste) => {
            try {
              const data = await fetchSpotifyData(
                `artists/${artiste.id}/albums?include_groups=album,single&limit=10&market=FR`
              );
              return data.items
                .filter((item) => item.release_date >= sinceStr)
                .map((item) => ({
                  albumId: item.id,
                  date: dayjs(item.release_date),
                  titre: item.name,
                  artiste: artiste.name,
                  type: item.album_type,
                  groupe: item.album_group,
                  lienSpotify: item.external_urls.spotify,
                  image: item.images[0]?.url || iconeProfil,
                }));
            } catch {
              return [];
            }
          })
        );
        results.push(...batchResults.flat());
      }
      setSortiesGlobales(results);
    } finally {
      setChargementCalendrier(false);
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
    const genreToArtists = {};
    artisteData.forEach((artiste) => {
      if (artiste?.genres?.length) {
        artiste.genres.forEach((genre) => {
          if (!genreToArtists[genre]) genreToArtists[genre] = [];
          if (!genreToArtists[genre].find((a) => a.id === artiste.id)) {
            genreToArtists[genre].push({ id: artiste.id, name: artiste.name, images: artiste.images });
          }
        });
      }
    });
    setArtistesParGenre(genreToArtists);
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
    if (isDemoRef.current) {
      const nomArtiste = DEMO_ARTISTES.find((a) => a.id === idArtiste)?.name;
      const sorties = DEMO_SORTIES_GLOBALES.filter(
        (s) => s.artiste === nomArtiste
      );
      setToutesSorties(sorties);
      setSortiesArtiste(sorties.filter((s) => s.date.isAfter(dayjs())));
      return;
    }
    if (cacheAlbumsRef.current[idArtiste]) {
      const cached = cacheAlbumsRef.current[idArtiste];
      setToutesSorties(cached);
      const dateActuelle = new Date("2025-04-06");
      setSortiesArtiste(
        cached.filter((item) => new Date(item.date) > dateActuelle)
      );
      return;
    }
    const cutoff = dayjs().subtract(5, "year");
    let toutesSorties = [];
    let url = `artists/${idArtiste}/albums?include_groups=album,single,compilation,appears_on&limit=50&market=FR`;
    while (url) {
      const data = await fetchAvecAuth(url);
      if (!data) {
        setMsgErreur("Aucune donnée disponible pour cet artiste.");
        return;
      }
      toutesSorties = [...toutesSorties, ...data.items];
      const plusAncien = data.items[data.items.length - 1];
      if (plusAncien && dayjs(plusAncien.release_date).isBefore(cutoff)) break;
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
    cacheAlbumsRef.current[idArtiste] = sortiesFormatees;
    setToutesSorties(sortiesFormatees);
    const dateActuelle = new Date("2025-04-06");
    setSortiesArtiste(
      sortiesFormatees.filter((item) => new Date(item.date) > dateActuelle)
    );
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const tokens = await checkTokens();
        if (!tokens?.access_token_exists) throw new Error("not authenticated");
        if (tokens?.expires_at)
          tokenExpiresAtRef.current = parseInt(tokens.expires_at);
      } catch {
        isDemoRef.current = true;
        setIsDemo(true);
        setArtistes(DEMO_ARTISTES);
        setGenresDisponibles([
          "hip hop",
          "pop",
          "r&b",
          "electronic",
          "rap",
          "latin",
          "alternative",
          "chanson française",
          "house",
          "indie pop",
        ]);
        setSortiesGlobales(DEMO_SORTIES_GLOBALES);
        setDonneesGenres(DEMO_GENRES);
        const demoGenreMap = {};
        DEMO_ARTISTES.forEach((artiste) => {
          artiste.genres.forEach((genre) => {
            if (!demoGenreMap[genre]) demoGenreMap[genre] = [];
            demoGenreMap[genre].push(artiste);
          });
        });
        setArtistesParGenre(demoGenreMap);
        getDemoData()
          .then((data) => {
            if (!data.artists) return;
            const imageMap = Object.fromEntries(
              data.artists.filter((a) => a.image).map((a) => [a.name, a.image])
            );
            setArtistes((prev) =>
              prev.map((a) => ({
                ...a,
                images: imageMap[a.name]
                  ? [{ url: imageMap[a.name] }]
                  : a.images,
              }))
            );
            setSortiesGlobales((prev) =>
              prev.map((s) => ({
                ...s,
                image: imageMap[s.artiste] || s.image,
              }))
            );
            setArtistesParGenre((prev) => {
              const updated = {};
              Object.entries(prev).forEach(([genre, artistes]) => {
                updated[genre] = artistes.map((a) =>
                  imageMap[a.name] ? { ...a, images: [{ url: imageMap[a.name] }] } : a
                );
              });
              return updated;
            });
          })
          .catch(() => {});
        return;
      }
      const [artistesList] = await Promise.all([
        recupererArtistes(),
        recupererProfilUtilisateur(),
        recupererPlaylistEnBoucle(),
        getEmailPreferences()
          .then((prefs) => setEmailEnabled(prefs.enabled))
          .catch(() => {}),
      ]);
      if (artistesList?.length) {
        await recupererToutesSortiesGlobales(artistesList);
      }
    };
    init();
  }, [
    recupererProfilUtilisateur,
    recupererArtistes,
    recupererPlaylistEnBoucle,
    recupererToutesSortiesGlobales,
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
          flex flex-col z-40 bg-[#000000]
          transform transition-transform duration-300 ease-in-out
          ${
            sidebarOuverte ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0
        `}
      >
        <div className="flex-shrink-0">
          <div className="flex items-center gap-2.5 px-4 pt-5 pb-4">
            <img src={logo} alt="Logo" className="w-7 h-7 flex-shrink-0" />
            <span className="font-bold text-sm tracking-tight text-white">
              Mon Calendrier
            </span>
          </div>
        </div>

        <div className="bg-[#121212] rounded-xl mx-2 mb-2 flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="px-4 pt-4 pb-2 flex-shrink-0">
            <span className="text-base font-bold text-white">
              Votre bibliothèque
            </span>
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
            <div
              className="flex gap-1.5 overflow-x-auto pb-1"
              style={{ scrollbarWidth: "none" }}
            >
              {["tous", ...genresDisponibles.slice(0, 8)].map((genre) => (
                <button
                  key={genre}
                  onClick={() => setFiltreGenre(genre)}
                  className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    filtreGenre === genre
                      ? "bg-white text-black"
                      : "bg-[#242424] text-white hover:bg-[#3E3E3E]"
                  }`}
                >
                  {genre === "tous" ? "Tous" : genre}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-4">
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
                        flex items-center gap-3 px-2 py-2 rounded-md cursor-pointer transition-colors duration-150 group
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
                          className="w-11 h-11 rounded-md object-cover flex-shrink-0"
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-base font-bold truncate transition-colors ${
                              artisteChoisi?.id === artiste.id
                                ? "text-[#1DB954]"
                                : "text-white"
                            }`}
                          >
                            {artiste.name}
                          </p>
                          <p className="text-sm text-[#727272] truncate">
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
                              {sortie.date.format("DD/MM/YYYY")} · {sortie.type}
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
          </div>

          <div className="flex-shrink-0 border-t border-[#282828]">
            {isDemo ? (
              <div className="px-3 py-3">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full bg-[#1DB954] text-black font-bold text-sm py-2.5 rounded-full hover:bg-[#1ed760] transition-colors"
                >
                  Se connecter avec Spotify
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-3.5 h-3.5 flex-shrink-0 text-[#B3B3B3]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm0 16a3 3 0 01-2.83-2h5.66A3 3 0 0110 18z" />
                    </svg>
                    <div>
                      <p className="text-[11px] font-medium text-[#B3B3B3]">
                        Emails hebdo.
                      </p>
                      <p className="text-[10px] text-[#535353]">
                        Récap. chaque lundi matin
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const next = !emailEnabled;
                      setEmailEnabled(next);
                      setEmailPreferences(next).catch(() =>
                        setEmailEnabled(!next)
                      );
                    }}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${
                      emailEnabled ? "bg-[#1DB954]" : "bg-[#3E3E3E]"
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
                <div className="flex items-center gap-3 px-3 pb-3 pt-1 mx-1 mb-1 rounded-lg hover:bg-[#1a1a1a] transition-colors group cursor-default">
                  <img
                    src={utilisateur?.images?.[0]?.url || iconeProfil}
                    alt="Profil"
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    loading="lazy"
                  />
                  <span className="text-sm font-bold text-white flex-1 truncate">
                    {utilisateur?.display_name || "Chargement..."}
                  </span>
                  <button
                    onClick={deconnexion}
                    className="opacity-100 text-[#B3B3B3] hover:text-white transition-all flex-shrink-0"
                    aria-label="Se déconnecter"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#1a1a1a] via-[#161616] to-[#121212]">
        {isDemo && (
          <div className="flex items-center justify-between px-6 py-2.5 bg-[#1DB954]/10 border-b border-[#1DB954]/20">
            <p className="text-sm text-[#B3B3B3]">
              <span className="text-[#1DB954] font-bold">Mode démo</span> —
              Connecte-toi pour voir tes vraies données Spotify
            </p>
            <button
              onClick={() => navigate("/login")}
              className="flex-shrink-0 ml-4 bg-[#1DB954] text-black font-bold text-xs px-4 py-1.5 rounded-full hover:bg-[#1ed760] transition-colors"
            >
              Se connecter
            </button>
          </div>
        )}
        <Navbar ongletActif={ongletActif} setOngletActif={setOngletActif} />
        {ongletActif === "découvertes" ? (
          <SmartReleases isDemo={isDemo} />
        ) : null}

        {ongletActif === "history" && (
          <div className="px-6 py-4">
            <h2 className="text-xl font-bold text-white mb-4">
              Historique{artisteChoisi ? ` — ${artisteChoisi.name}` : ""}
            </h2>
            {artisteChoisi ? (
              <div>
                <div className="flex gap-3 mb-6 flex-wrap">
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
                      className="px-3 py-2 bg-[#242424] rounded-full text-sm text-white outline-none cursor-pointer"
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
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="w-full aspect-square bg-[#282828] rounded-lg mb-2" />
                        <div className="h-3 bg-[#282828] rounded w-3/4 mb-1" />
                        <div className="h-2.5 bg-[#282828] rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : sortiesFiltreesEtTriees.length ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sortiesFiltreesEtTriees.map((sortie, i) => (
                      <a
                        key={i}
                        href={sortie.lienSpotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block bg-[#181818] hover:bg-[#282828] rounded-lg p-3 transition-colors"
                        onClick={() => handleSpotifyLinkClick(sortie.titre)}
                      >
                        <img
                          src={sortie.image}
                          alt=""
                          className="w-full aspect-square rounded-md object-cover mb-3"
                          loading="lazy"
                        />
                        <p className="text-white text-sm font-medium truncate group-hover:text-[#1DB954] transition-colors">
                          {sortie.titre}
                        </p>
                        <p className="text-[#727272] text-xs mt-0.5">
                          {sortie.date.format("DD/MM/YYYY")} · {sortie.type}
                        </p>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#727272] text-sm">
                    Aucune sortie pour ces filtres.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-[#727272] text-sm">
                Sélectionnez un artiste dans la bibliothèque.
              </p>
            )}
          </div>
        )}

        {ongletActif === "genres" && (
          <div className="px-6 py-6 max-w-2xl">
            <h2 className="text-2xl font-black text-white mb-1">Vos genres</h2>
            <p className="text-[#B3B3B3] text-sm mb-8">
              Basé sur vos écoutes récentes
            </p>
            {chargement ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse flex items-center gap-4 py-2"
                  >
                    <div className="w-4 h-3 bg-[#282828] rounded flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-3 bg-[#282828] rounded w-1/3 mb-2.5" />
                      <div className="h-1 bg-[#282828] rounded" />
                    </div>
                    <div className="w-8 h-3 bg-[#282828] rounded flex-shrink-0" />
                  </div>
                ))}
              </div>
            ) : donneesGenres.labels.length ? (
              <div className="space-y-1">
                {donneesGenres.labels.map((genre, i) => {
                  const data = donneesGenres.datasets[0].data;
                  const max = Math.max(...data);
                  const val = data[i];
                  const pct = Math.round((val / max) * 100);
                  const isFirst = i === 0;
                  const isTop3 = i < 3;
                  const barColor = isFirst
                    ? "#1DB954"
                    : isTop3
                    ? "#1ed760"
                    : donneesGenres.datasets[0].backgroundColor[i];

                  return (
                    <div
                      key={i}
                      onClick={() => setGenreChoisi({ genre, artists: artistesParGenre[genre] || [] })}
                      className={`group flex items-center gap-4 px-3 py-3 rounded-lg transition-colors cursor-pointer ${
                        isFirst ? "bg-[#1a2a1a] hover:bg-[#1f3320]" : "hover:bg-[#181818]"
                      }`}
                    >
                      <span
                        className={`text-xs font-bold w-4 text-right flex-shrink-0 tabular-nums ${
                          isFirst
                            ? "text-[#1DB954]"
                            : isTop3
                            ? "text-[#B3B3B3]"
                            : "text-[#535353]"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-sm font-semibold truncate ${
                              isFirst
                                ? "text-white"
                                : "text-[#B3B3B3] group-hover:text-white transition-colors"
                            }`}
                          >
                            {genre}
                          </span>
                          <span className="text-[#535353] text-xs flex-shrink-0 ml-4 tabular-nums">
                            {val} artiste{val > 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="h-[3px] bg-[#282828] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: barColor,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[#727272] text-sm">Aucun genre disponible.</p>
            )}
          </div>
        )}

        <div
          className={`px-6 py-8 ${ongletActif !== "artists" ? "hidden" : ""}`}
        >
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

          <div className="flex justify-center items-center gap-4 mb-8">
            <button
              onClick={allerAujourdHui}
              className="bg-white text-black text-xs font-bold px-5 py-2 rounded-full hover:scale-105 active:scale-95 transition-transform"
              aria-label="Aller à aujourd'hui"
            >
              Aujourd&apos;hui
            </button>
            {chargementCalendrier && (
              <span className="text-[#727272] text-xs animate-pulse">
                Chargement des sorties...
              </span>
            )}
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

          {!chargementCalendrier &&
            artistes.length > 0 &&
            (artisteChoisi ? toutesSorties : sortiesGlobales).filter((s) =>
              s.date.isSame(moisActuel, "month")
            ).length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-[#727272] text-sm">
                  {artisteChoisi
                    ? `Aucune sortie de ${artisteChoisi.name} ce mois-ci`
                    : "Aucune sortie de tes artistes ce mois-ci"}
                </p>
              </div>
            )}

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
            {genererJours.map((jour, index) => {
              const estAujourdHui =
                jour === aujourdHui.date() &&
                moisActuel.isSame(aujourdHui, "month");
              const sourceSorties = artisteChoisi
                ? toutesSorties
                : sortiesGlobales;
              const evenementsJour = jour
                ? sourceSorties.filter(
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
                              {!artisteChoisi && event.artiste
                                ? event.artiste
                                : event.titre}
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

      {genreChoisi && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setGenreChoisi(null)}
        >
          <div
            className="bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#282828]">
              <div>
                <h3 className="text-white font-bold text-base capitalize">
                  {genreChoisi.genre}
                </h3>
                <p className="text-[#B3B3B3] text-xs mt-0.5">
                  {genreChoisi.artists.length} artiste{genreChoisi.artists.length > 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => setGenreChoisi(null)}
                className="w-7 h-7 flex items-center justify-center bg-[#282828] hover:bg-[#3a3a3a] rounded-full text-white transition-colors text-xs"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4">
              {genreChoisi.artists.length ? (
                <div className="grid grid-cols-2 gap-3">
                  {genreChoisi.artists.map((artiste, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-[#242424] hover:bg-[#2a2a2a] rounded-xl p-3 transition-colors"
                    >
                      <img
                        src={artiste.images?.[0]?.url || iconeProfil}
                        alt={artiste.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        loading="lazy"
                      />
                      <span className="text-white text-sm font-medium truncate">
                        {artiste.name}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#727272] text-sm text-center py-8">
                  Aucun artiste trouvé pour ce genre.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

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
                  {evenementsSelectionnes.length} sortie
                  {evenementsSelectionnes.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="max-h-[45vh] overflow-y-auto px-3 py-3 space-y-4">
              {evenementsSelectionnes.some((e) =>
                e.date.isAfter(aujourdHui)
              ) && (
                <div>
                  <p className="text-[#1DB954] text-[10px] font-bold uppercase tracking-wider mb-2 px-2">
                    À venir
                  </p>
                  {["album", "single", "compilation", "appears_on"].map(
                    (groupe) => {
                      const filteredEvents = evenementsSelectionnes.filter(
                        (event) =>
                          event.groupe === groupe &&
                          event.date.isAfter(aujourdHui)
                      );
                      if (!filteredEvents.length) return null;
                      return (
                        <div key={groupe} className="mb-2">
                          <p className="text-[#727272] text-[10px] font-medium uppercase tracking-wide mb-1 px-2">
                            {groupe === "album"
                              ? "Albums"
                              : groupe === "single"
                              ? "Singles"
                              : groupe === "compilation"
                              ? "Compilations"
                              : "Featurings"}
                          </p>
                          <ul className="space-y-0.5">
                            {filteredEvents.map((event, i) => (
                              <li key={i}>
                                <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors group">
                                  {event.image && (
                                    <img
                                      src={event.image}
                                      alt=""
                                      className="w-9 h-9 rounded object-cover flex-shrink-0"
                                      loading="lazy"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <a
                                      href={event.lienSpotify}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-white text-sm group-hover:text-[#1DB954] transition-colors block truncate"
                                      onClick={() =>
                                        handleSpotifyLinkClick(event.titre)
                                      }
                                    >
                                      {event.titre}
                                    </a>
                                    {!artisteChoisi && event.artiste && (
                                      <span className="text-[#727272] text-xs">
                                        {event.artiste}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    {event.albumId && (
                                      <PlayButton albumId={event.albumId} />
                                    )}
                                    {event.groupe === "appears_on" && (
                                      <span className="text-[9px] font-bold bg-[#727272]/20 text-[#727272] px-1.5 py-0.5 rounded-full">
                                        Feat.
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
              {evenementsSelectionnes.some(
                (e) => !e.date.isAfter(aujourdHui)
              ) && (
                <div>
                  <p className="text-[#727272] text-[10px] font-bold uppercase tracking-wider mb-2 px-2">
                    Passées
                  </p>
                  {["album", "single", "compilation", "appears_on"].map(
                    (groupe) => {
                      const filteredEvents = evenementsSelectionnes.filter(
                        (event) =>
                          event.groupe === groupe &&
                          !event.date.isAfter(aujourdHui)
                      );
                      if (!filteredEvents.length) return null;
                      return (
                        <div key={groupe} className="mb-2">
                          <p className="text-[#727272] text-[10px] font-medium uppercase tracking-wide mb-1 px-2">
                            {groupe === "album"
                              ? "Albums"
                              : groupe === "single"
                              ? "Singles"
                              : groupe === "compilation"
                              ? "Compilations"
                              : "Featurings"}
                          </p>
                          <ul className="space-y-0.5">
                            {filteredEvents.map((event, i) => (
                              <li key={i}>
                                <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors group">
                                  {event.image && (
                                    <img
                                      src={event.image}
                                      alt=""
                                      className="w-9 h-9 rounded object-cover flex-shrink-0 opacity-60"
                                      loading="lazy"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <a
                                      href={event.lienSpotify}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#B3B3B3] text-sm group-hover:text-white transition-colors block truncate"
                                      onClick={() =>
                                        handleSpotifyLinkClick(event.titre)
                                      }
                                    >
                                      {event.titre}
                                    </a>
                                    {!artisteChoisi && event.artiste && (
                                      <span className="text-[#727272] text-xs">
                                        {event.artiste}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    {event.albumId && (
                                      <PlayButton albumId={event.albumId} />
                                    )}
                                    {event.groupe === "appears_on" && (
                                      <span className="text-[9px] font-bold bg-[#727272]/20 text-[#727272] px-1.5 py-0.5 rounded-full">
                                        Feat.
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    }
                  )}
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
