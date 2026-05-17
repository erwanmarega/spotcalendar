import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import iconeProfil from "../assets/profile-icon.avif";
import dayjs from "dayjs";
import "dayjs/locale/fr";
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

dayjs.locale("fr");

const BG      = "#0c0b0a";
const SURF    = "#161412";
const SURF2   = "#1d1a17";
const SURF3   = "#26221d";
const HAIR    = "#2a2622";
const HAIR2   = "#1f1c19";
const INK     = "#f4ede0";
const INK_S   = "#c9bfa9";
const INK_M   = "#7c7468";
const INK_F   = "#4a443c";
const GREEN   = "#1db954";
const PEACH   = "#f0c294";

const COVER_GRADS = [
  "linear-gradient(135deg,#f0c294,#8b4a2f)",
  "linear-gradient(135deg,#b4a4d6,#4a3a78)",
  "linear-gradient(135deg,#e89aa3,#8b3a45)",
  "linear-gradient(135deg,#91b6d1,#2c5478)",
  "linear-gradient(135deg,#e8b864,#8a6420)",
  "linear-gradient(135deg,#c98a55,#5c2f15)",
  "linear-gradient(135deg,#2a2622,#c98a55)",
  "linear-gradient(135deg,#4a443c,#1a1814)",
];
const getGrad = (seed) => {
  const code = typeof seed === "string" ? (seed.charCodeAt(0) || 0) : (seed || 0);
  return COVER_GRADS[Math.abs(code) % COVER_GRADS.length];
};

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
  { id:"demo-1", name:"Drake", genres:["hip hop","rap"], images:[{url:DEMO_IMAGES["Drake"]}] },
  { id:"demo-2", name:"Taylor Swift", genres:["pop","indie pop"], images:[{url:DEMO_IMAGES["Taylor Swift"]}] },
  { id:"demo-3", name:"The Weeknd", genres:["r&b","pop"], images:[{url:DEMO_IMAGES["The Weeknd"]}] },
  { id:"demo-4", name:"Daft Punk", genres:["electronic","house"], images:[{url:DEMO_IMAGES["Daft Punk"]}] },
  { id:"demo-5", name:"Rosalía", genres:["latin","flamenco pop"], images:[{url:DEMO_IMAGES["Rosalía"]}] },
  { id:"demo-6", name:"Stromae", genres:["chanson française","electronic"], images:[{url:DEMO_IMAGES["Stromae"]}] },
  { id:"demo-7", name:"Billie Eilish", genres:["pop","alternative"], images:[{url:DEMO_IMAGES["Billie Eilish"]}] },
  { id:"demo-8", name:"Kendrick Lamar", genres:["hip hop","conscious rap"], images:[{url:DEMO_IMAGES["Kendrick Lamar"]}] },
];
const DEMO_SORTIES_GLOBALES = [
  { albumId:"d1", date:dayjs("2026-05-20"), titre:"Certified Lover Boy II", artiste:"Drake", type:"album", groupe:"album", lienSpotify:"#", image:DEMO_IMAGES["Drake"] },
  { albumId:"d2", date:dayjs("2026-05-23"), titre:"The Tortured Poets Vol. 2", artiste:"Taylor Swift", type:"album", groupe:"album", lienSpotify:"#", image:DEMO_IMAGES["Taylor Swift"] },
  { albumId:"d3", date:dayjs("2026-05-21"), titre:"Midnight Sun", artiste:"The Weeknd", type:"single", groupe:"single", lienSpotify:"#", image:DEMO_IMAGES["The Weeknd"] },
  { albumId:"d4", date:dayjs("2026-06-14"), titre:"Random Access Memories II", artiste:"Daft Punk", type:"album", groupe:"album", lienSpotify:"#", image:DEMO_IMAGES["Daft Punk"] },
  { albumId:"d5", date:dayjs("2026-06-18"), titre:"MOTOMAMI 2", artiste:"Rosalía", type:"album", groupe:"album", lienSpotify:"#", image:DEMO_IMAGES["Rosalía"] },
  { albumId:"d6", date:dayjs("2026-05-30"), titre:"Multitude II", artiste:"Stromae", type:"single", groupe:"single", lienSpotify:"#", image:DEMO_IMAGES["Stromae"] },
  { albumId:"d7", date:dayjs("2026-06-25"), titre:"HIT ME HARD AND SOFT 2", artiste:"Billie Eilish", type:"album", groupe:"album", lienSpotify:"#", image:DEMO_IMAGES["Billie Eilish"] },
  { albumId:"d8", date:dayjs("2026-06-28"), titre:"GNX Deluxe", artiste:"Kendrick Lamar", type:"album", groupe:"album", lienSpotify:"#", image:DEMO_IMAGES["Kendrick Lamar"] },
];
const DEMO_GENRES = {
  labels:["hip hop","pop","r&b","electronic","rap","latin","alternative","chanson française","house","indie pop"],
  datasets:[{ label:"Artistes", data:[8,7,5,4,6,3,3,2,2,2], backgroundColor:["#1DB954","#1ed760","#17a844","#148a38","#FFCE56","#FF6384","#36A2EB","#4BC0C0","#9966FF","#FF9F40"], borderColor:"#121212", borderWidth:2 }],
};

const Avatar = ({ name = "", image, size = 38, style = {} }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, overflow: "hidden", position: "relative", background: getGrad(name), ...style }}>
    {image
      ? <img src={image} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
      : <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: '"Fraunces", serif', fontSize: size * 0.42, color: "rgba(0,0,0,.5)", fontWeight: 500 }}>{name[0]}</span>}
  </div>
);

const Cover = ({ name = "", image, size = 22, radius = 4, style = {} }) => (
  <div style={{ width: size, height: size, borderRadius: radius, flexShrink: 0, overflow: "hidden", position: "relative", background: getGrad(name), ...style }}>
    {image
      ? <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
      : <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: '"Fraunces", serif', fontSize: size * 0.45, color: "rgba(0,0,0,.45)", fontWeight: 500 }}>{name[0]}</span>}
  </div>
);

const Calendar = () => {
  const [moisActuel, setMoisActuel] = useState(dayjs());
  const [ongletActif, setOngletActif] = useState("artists");
  const [artistes, setArtistes] = useState([]);
  const [donneesGenres, setDonneesGenres] = useState({ labels:[], datasets:[] });
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
  const [topArtistes, setTopArtistes] = useState([]);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0 });
  const tokenExpiresAtRef = useRef(null);
  const cacheAlbumsRef = useRef({});
  const isDemoRef = useRef(false);
  const genreModalRef = useRef(null);
  const eventPopupRef = useRef(null);

  const aujourdHui = dayjs();
  const navigate = useNavigate();
  const joursSemaine = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const debutMois = moisActuel.startOf("month");
  const finMois = moisActuel.endOf("month");
  const joursDansMois = finMois.date();
  const jourDebut = debutMois.day();

  const moisPrecedent = useCallback(() => setMoisActuel(m => m.subtract(1, "month")), []);
  const moisSuivant   = useCallback(() => setMoisActuel(m => m.add(1, "month")), []);
  const allerAujourdHui = useCallback(() => setMoisActuel(dayjs()), []);

  useEffect(() => { if (genreChoisi)    genreModalRef.current?.focus(); }, [genreChoisi]);
  useEffect(() => { if (afficherPopup)  eventPopupRef.current?.focus(); }, [afficherPopup]);

  const genererJours = useMemo(() => {
    const jours = [];
    for (let i = 1 - (jourDebut === 0 ? 6 : jourDebut - 1); i <= joursDansMois; i++) {
      jours.push(i > 0 ? i : "");
    }
    return jours;
  }, [jourDebut, joursDansMois]);

  const nextRelease = useMemo(() =>
    sortiesGlobales.filter(s => s.date.isAfter(aujourdHui)).sort((a,b) => a.date.valueOf()-b.date.valueOf())[0] || null,
    [sortiesGlobales, aujourdHui]);

  const featuredRelease = useMemo(() => {
    const thisMonthReleases = sortiesGlobales.filter(s => s.date.isSame(moisActuel, "month"));
    if (!thisMonthReleases.length) return null;
    for (const top of topArtistes) {
      const hit = thisMonthReleases.find(s => s.artiste.toLowerCase() === top.name.toLowerCase());
      if (hit) return { ...hit, topArtistImage: top.images?.[0]?.url };
    }
      const upcoming = thisMonthReleases.filter(s => s.date.isAfter(aujourdHui)).sort((a,b) => a.date.valueOf()-b.date.valueOf());
    if (upcoming.length) return upcoming[0];
    return thisMonthReleases.sort((a,b) => b.date.valueOf()-a.date.valueOf())[0];
  }, [sortiesGlobales, moisActuel, topArtistes, aujourdHui]);

  const featuredIsUpcoming = featuredRelease ? featuredRelease.date.isAfter(aujourdHui) : false;

  const cetteSemagineReleases = useMemo(() => {
    const startOfWeek = aujourdHui.startOf("week");
    const endOfWeek = aujourdHui.endOf("week");
    return sortiesGlobales
      .filter(s => !s.date.isBefore(startOfWeek) && !s.date.isAfter(endOfWeek))
      .sort((a,b) => a.date.valueOf()-b.date.valueOf());
  }, [sortiesGlobales, aujourdHui]);

  const artistReleaseTagMap = useMemo(() => {
    const map = {};
    sortiesGlobales.forEach(s => {
      const diff = s.date.diff(aujourdHui, "day");
      if (diff >= -1 && diff <= 30) {
        if (!map[s.artiste] || Math.abs(diff) < Math.abs(map[s.artiste].diff)) {
          map[s.artiste] = { diff, date: s.date };
        }
      }
    });
    return map;
  }, [sortiesGlobales, aujourdHui]);

  useEffect(() => {
    if (!featuredRelease || !featuredIsUpcoming) return;
    const update = () => {
      const secs = featuredRelease.date.diff(dayjs(), "second");
      if (secs <= 0) { setCountdown({ days:0, hours:0, mins:0 }); return; }
      setCountdown({ days: Math.floor(secs/86400), hours: Math.floor((secs%86400)/3600), mins: Math.floor((secs%3600)/60) });
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [featuredRelease, featuredIsUpcoming]);

  const getGreeting = () => {
    const h = dayjs().hour();
    if (h < 6)  return "Bonne nuit,";
    if (h < 12) return "Bonjour,";
    if (h < 18) return "Bon après-midi,";
    return "Bonsoir,";
  };

  const getReleaseTag = (tag) => {
    if (!tag) return null;
    if (tag.diff === -1) return "Hier";
    if (tag.diff === 0)  return "Aujourd'hui";
    if (tag.diff <= 7)   return `J-${tag.diff}`;
    return tag.date.format("D MMM");
  };

  const getWhenLabel = (date) => {
    const d = date.diff(aujourdHui, "day");
    if (d === 0) return { label: "Aujourd'hui", urgent: true };
    if (d === 1) return { label: "Demain", urgent: true };
    return { label: date.format("ddd D"), urgent: false };
  };

  const upcomingThisMonth = useMemo(() =>
    sortiesGlobales.filter(s => s.date.isAfter(aujourdHui) && s.date.isSame(moisActuel, "month")).length,
    [sortiesGlobales, aujourdHui, moisActuel]);

  const rafraichirToken = async () => {
    await refreshToken();
    tokenExpiresAtRef.current = Date.now() + 3600 * 1000;
  };

  const fetchAvecAuth = async (path, options = {}, retries = 1) => {
    setChargement(true); setMsgErreur(null);
    try {
      if (!tokenExpiresAtRef.current || Date.now() >= tokenExpiresAtRef.current) await rafraichirToken();
      return await fetchSpotifyData(path.replace(/^\/+|\/+$/g, ""), options);
    } catch (e) {
      if (e.message.includes("429") && retries > 0) { await new Promise(r => setTimeout(r, 2000)); return fetchAvecAuth(path, options, retries-1); }
      setMsgErreur(e.message.includes("404") ? "Ressource non trouvée." : e.message.includes("429") ? "Trop de requêtes. Réessaie." : e.message || "Erreur.");
      return null;
    } finally { setChargement(false); }
  };

  const recupererProfilUtilisateur = useCallback(async () => {
    const data = await fetchAvecAuth("me");
    if (data) setUtilisateur(data);
  }, []);

  const recupererArtistes = useCallback(async () => {
    const data = await fetchAvecAuth("me/following?type=artist&limit=50");
    if (data) {
      setArtistes(data.artists.items);
      setGenresDisponibles([...new Set(data.artists.items.flatMap(a => a.genres))].sort());
      return data.artists.items;
    }
    return [];
  }, []);

  const recupererToutesSortiesGlobales = useCallback(async (artistesList) => {
    if (!artistesList?.length) return;
    setChargementCalendrier(true);
    const since = dayjs().subtract(3, "month").format("YYYY-MM-DD");
    const results = [];
    try {
      if (!tokenExpiresAtRef.current || Date.now() >= tokenExpiresAtRef.current) { await refreshToken(); tokenExpiresAtRef.current = Date.now() + 3600000; }
      for (let i = 0; i < artistesList.length; i += 5) {
        const batch = artistesList.slice(i, i+5);
        const batchResults = await Promise.all(batch.map(async (a) => {
          try {
            const data = await fetchSpotifyData(`artists/${a.id}/albums?include_groups=album,single&limit=10&market=FR`);
            return data.items.filter(item => item.release_date >= since).map(item => ({
              albumId: item.id, date: dayjs(item.release_date), titre: item.name,
              artiste: a.name, type: item.album_type, groupe: item.album_group,
              lienSpotify: item.external_urls.spotify, image: item.images[0]?.url || iconeProfil,
            }));
          } catch { return []; }
        }));
        results.push(...batchResults.flat());
      }
      setSortiesGlobales(results);
    } finally { setChargementCalendrier(false); }
  }, []);

  const recupererChansonsRecentes = useCallback(async () => {
    const data = await fetchAvecAuth("me/player/recently-played?limit=50");
    if (!data) return;
    const chansons = data.items.map(i => i.track).filter(Boolean);
    if (!chansons.length) return;
    const idsArtistes = [...new Set(chansons.flatMap(c => c.artists.map(a => a.id)))];
    const artisteData = [];
    for (let i = 0; i < idsArtistes.length; i += 50) {
      const d = await fetchAvecAuth(`artists?ids=${idsArtistes.slice(i, i+50).join(",")}`);
      if (d) artisteData.push(...d.artists);
    }
    if (!artisteData.length) return;
    const compteGenres = {};
    artisteData.forEach(a => a?.genres?.forEach(g => { compteGenres[g] = (compteGenres[g]||0)+1; }));
    const genreToArtists = {};
    artisteData.forEach(a => {
      if (a?.genres?.length) a.genres.forEach(g => {
        if (!genreToArtists[g]) genreToArtists[g] = [];
        if (!genreToArtists[g].find(x => x.id === a.id)) genreToArtists[g].push({ id:a.id, name:a.name, images:a.images });
      });
    });
    setArtistesParGenre(genreToArtists);
    const genresTries = Object.entries(compteGenres).sort((a,b) => b[1]-a[1]).slice(0,10);
    const couleurs = ["#1DB954","#1ed760","#17a844","#148a38","#FF6384","#36A2EB","#FFCE56","#4BC0C0","#9966FF","#FF9F40"];
    setDonneesGenres({ labels: genresTries.map(([g])=>g), datasets:[{ label:"Artistes", data:genresTries.map(([,c])=>c), backgroundColor:genresTries.map((_,i)=>couleurs[i%couleurs.length]), borderColor:"#121212", borderWidth:2 }] });
  }, []);

  const recupererPlaylistEnBoucle = useCallback(async () => {
    let playlists = [], url = "me/playlists?limit=50";
    while (url) {
      const data = await fetchAvecAuth(url);
      if (!data) return;
      playlists = [...playlists, ...data.items];
      url = data.next ? data.next.replace("https://api.spotify.com/v1","") : null;
    }
    const pl = playlists.find(p => p.name === "En Boucle" || p.name === "On Repeat");
    if (!pl) { await recupererChansonsRecentes(); return; }
    const d = await fetchAvecAuth(`playlists/${pl.id}/tracks?limit=50`);
    if (!d) return;
    const chansons = d.items.map(i => i.track).filter(Boolean);
    if (!chansons.length) { await recupererChansonsRecentes(); return; }
    const idsArtistes = [...new Set(chansons.flatMap(c => c.artists.map(a => a.id)))];
    const artisteData = [];
    for (let i = 0; i < idsArtistes.length; i += 50) {
      const ad = await fetchAvecAuth(`artists?ids=${idsArtistes.slice(i,i+50).join(",")}`);
      if (ad) artisteData.push(...ad.artists);
    }
    if (!artisteData.length) return;
    const compteGenres = {};
    artisteData.forEach(a => a?.genres?.forEach(g => { compteGenres[g]=(compteGenres[g]||0)+1; }));
    const genreToArtists = {};
    artisteData.forEach(a => {
      if (a?.genres?.length) a.genres.forEach(g => {
        if (!genreToArtists[g]) genreToArtists[g] = [];
        if (!genreToArtists[g].find(x => x.id === a.id)) genreToArtists[g].push({ id:a.id, name:a.name, images:a.images });
      });
    });
    setArtistesParGenre(genreToArtists);
    const genresTries = Object.entries(compteGenres).sort((a,b) => b[1]-a[1]).slice(0,10);
    const couleurs = ["#1DB954","#1ed760","#17a844","#148a38","#FF6384","#36A2EB","#FFCE56","#4BC0C0","#9966FF","#FF9F40"];
    setDonneesGenres({ labels:genresTries.map(([g])=>g), datasets:[{ label:"Artistes", data:genresTries.map(([,c])=>c), backgroundColor:genresTries.map((_,i)=>couleurs[i%couleurs.length]), borderColor:"#121212", borderWidth:2 }] });
  }, [recupererChansonsRecentes]);

  const recupererSortiesArtiste = useCallback(async (idArtiste) => {
    if (isDemoRef.current) {
      const nom = DEMO_ARTISTES.find(a => a.id === idArtiste)?.name;
      const sorties = DEMO_SORTIES_GLOBALES.filter(s => s.artiste === nom);
      setToutesSorties(sorties); setSortiesArtiste(sorties.filter(s => s.date.isAfter(dayjs()))); return;
    }
    if (cacheAlbumsRef.current[idArtiste]) {
      const cached = cacheAlbumsRef.current[idArtiste];
      setToutesSorties(cached); setSortiesArtiste(cached.filter(s => s.date.isAfter(dayjs()))); return;
    }
    const cutoff = dayjs().subtract(5, "year");
    let all = [], url = `artists/${idArtiste}/albums?include_groups=album,single,compilation,appears_on&limit=50&market=FR`;
    while (url) {
      const data = await fetchAvecAuth(url);
      if (!data) { setMsgErreur("Aucune donnée disponible."); return; }
      all = [...all, ...data.items];
      if (data.items.at(-1) && dayjs(data.items.at(-1).release_date).isBefore(cutoff)) break;
      url = data.next ? data.next.replace("https://api.spotify.com/v1","") : null;
    }
    const fmt = all.map(item => ({ date:dayjs(item.release_date), titre:item.name, type:item.album_type, groupe:item.album_group, lienSpotify:item.external_urls.spotify, image:item.images[0]?.url||iconeProfil }));
    cacheAlbumsRef.current[idArtiste] = fmt;
    setToutesSorties(fmt); setSortiesArtiste(fmt.filter(s => s.date.isAfter(dayjs())));
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const tokens = await checkTokens();
        if (!tokens?.access_token_exists) throw new Error("not authenticated");
        if (tokens?.expires_at) tokenExpiresAtRef.current = parseInt(tokens.expires_at);
      } catch {
        isDemoRef.current = true; setIsDemo(true);
        setArtistes(DEMO_ARTISTES);
        setTopArtistes(DEMO_ARTISTES); // demo: use same list as top artists
        setGenresDisponibles(["hip hop","pop","r&b","electronic","rap","latin","alternative","chanson française","house","indie pop"]);
        setSortiesGlobales(DEMO_SORTIES_GLOBALES);
        setDonneesGenres(DEMO_GENRES);
        const demoGenreMap = {};
        DEMO_ARTISTES.forEach(a => a.genres.forEach(g => { if(!demoGenreMap[g]) demoGenreMap[g]=[]; demoGenreMap[g].push(a); }));
        setArtistesParGenre(demoGenreMap);
        getDemoData().then(data => {
          if (!data.artists) return;
          const imageMap = Object.fromEntries(data.artists.filter(a=>a.image).map(a=>[a.name,a.image]));
          setArtistes(prev => prev.map(a => ({ ...a, images: imageMap[a.name] ? [{url:imageMap[a.name]}] : a.images })));
          setSortiesGlobales(prev => prev.map(s => ({ ...s, image: imageMap[s.artiste]||s.image })));
          setArtistesParGenre(prev => { const u={}; Object.entries(prev).forEach(([g,arts]) => { u[g]=arts.map(a => imageMap[a.name]?{...a,images:[{url:imageMap[a.name]}]}:a); }); return u; });
        }).catch(()=>{});
        return;
      }
      const [artistesList] = await Promise.all([
        recupererArtistes(), recupererProfilUtilisateur(), recupererPlaylistEnBoucle(),
        getEmailPreferences().then(p => setEmailEnabled(p.enabled)).catch(()=>{}),
        fetchSpotifyData("me/top/artists?limit=10&time_range=short_term")
          .then(d => { if (d?.items) setTopArtistes(d.items); })
          .catch(()=>{}),
      ]);
      if (artistesList?.length) await recupererToutesSortiesGlobales(artistesList);
    };
    init();
  }, [recupererProfilUtilisateur, recupererArtistes, recupererPlaylistEnBoucle, recupererToutesSortiesGlobales]);

  const deconnexion = useCallback(() => {
    toast.info("Déconnexion en cours... 👋", { position:"bottom-right", autoClose:2000, theme:"dark" });
    setTimeout(async () => { try { await logout(); } catch {} finally { navigate("/login", {replace:true,state:{fromLogout:true}}); } }, 2000);
  }, [navigate]);

  const handleSpotifyLinkClick = useCallback((titre) => {
    toast.success(`Redirection vers Spotify 🎧 : ${titre}`, { position:"bottom-right", autoClose:3000, theme:"dark" });
  }, []);

  const artistesFiltres = useMemo(() =>
    artistes.filter(a =>
      a.name.toLowerCase().includes(rechercheArtiste.toLowerCase()) &&
      (filtreGenre === "tous" || a.genres.includes(filtreGenre))),
    [artistes, rechercheArtiste, filtreGenre]);

  const sortiesFiltreesEtTriees = useMemo(() =>
    toutesSorties.filter(s => {
      const after = aujourdHui.subtract(filtrePeriode,"month");
      return s.date.isAfter(after) && s.date.isBefore(aujourdHui) && (filtreType==="tous"||filtreType===s.type);
    }).sort((a,b) => {
      if (triHistorique==="date-desc") return b.date-a.date;
      if (triHistorique==="date-asc")  return a.date-b.date;
      if (triHistorique==="title-asc") return a.titre.localeCompare(b.titre);
      return b.titre.localeCompare(a.titre);
    }), [toutesSorties, filtrePeriode, filtreType, triHistorique, aujourdHui]);

  const TABS = [
    { id:"artists",    label:"Calendrier" },
    { id:"découvertes",label:"Découvertes" },
    { id:"history",    label:"Historique" },
    { id:"genres",     label:"Genres" },
  ];

  return (
    <div
      style={{ fontFamily:'"DM Sans", system-ui, sans-serif', background:BG, color:INK, WebkitFontSmoothing:"antialiased" }}
      className="flex h-screen overflow-hidden p-2 gap-2"
    >
      <button
        className="md:hidden fixed top-3 left-3 z-50 w-9 h-9 flex items-center justify-center rounded-full"
        style={{ background:SURF2, border:`1px solid ${HAIR}` }}
        onClick={() => setSidebarOuverte(s => !s)}
        aria-label="Menu"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={INK_S} strokeWidth="1.6" strokeLinecap="round">
          {sidebarOuverte
            ? <><path d="M2 2l10 10M12 2L2 12"/></>
            : <><path d="M1 3.5h12M1 7h12M1 10.5h12"/></>}
        </svg>
      </button>

      {sidebarOuverte && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-30" onClick={() => setSidebarOuverte(false)} />
      )}

      <aside
        className={`fixed md:relative top-0 left-0 h-full w-[280px] flex-shrink-0 flex flex-col z-40 transform transition-transform duration-300 ease-in-out ${sidebarOuverte ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        style={{ background:SURF, borderRadius:16, border:`1px solid ${HAIR2}`, overflow:"hidden" }}
      >
        <div style={{ padding:"22px 22px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <button onClick={() => navigate("/")} style={{ display:"inline-flex", alignItems:"center", gap:10, fontWeight:700, fontSize:16, letterSpacing:"-0.01em", color:INK }}>
            <span style={{ width:26, height:26, background:GREEN, borderRadius:7, position:"relative", display:"grid", placeItems:"center", flexShrink:0 }}>
              <span style={{ position:"absolute", top:-3, left:6, right:6, height:5, borderLeft:`2px solid ${GREEN}`, borderRight:`2px solid ${GREEN}` }}/>
              <span style={{ width:6, height:6, background:BG, borderRadius:"50%" }}/>
            </span>
            <span>Spot<span style={{ color:INK_M, fontWeight:500 }}>Calendar</span></span>
          </button>
          <button
            onClick={deconnexion}
            style={{ width:32, height:32, borderRadius:8, display:"grid", placeItems:"center", color:INK_S, background:"none", border:"none", cursor:"pointer" }}
            title="Déconnexion"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 2h3.5a.5.5 0 0 1 .5.5v10a.5.5 0 0 1-.5.5H9M6 4.5l3 3-3 3M9 7.5H2"/>
            </svg>
          </button>
        </div>

        <div style={{ margin:"0 16px 16px", background:SURF2, border:`1px solid ${HAIR}`, borderRadius:10, display:"flex", alignItems:"center", padding:"0 12px", height:38, gap:10 }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke={INK_M} strokeWidth="1.6"><circle cx="6" cy="6" r="4.5"/><path d="m9.4 9.4 3 3"/></svg>
          <input
            type="text"
            placeholder="Rechercher un artiste…"
            value={rechercheArtiste}
            onChange={e => setRechercheArtiste(e.target.value)}
            style={{ border:0, background:"transparent", color:INK, fontFamily:"inherit", fontSize:13.5, outline:"none", width:"100%" }}
          />
          <span style={{ fontFamily:'"JetBrains Mono",monospace', fontSize:10.5, color:INK_M, padding:"2px 6px", border:`1px solid ${HAIR}`, borderRadius:4 }}>⌘K</span>
        </div>

        <div style={{ padding:"0 16px 16px", display:"flex", gap:6, overflowX:"auto", scrollbarWidth:"none" }}>
          {["tous", ...genresDisponibles.slice(0,6)].map(g => (
            <button
              key={g}
              onClick={() => setFiltreGenre(g)}
              style={{
                padding:"6px 12px", borderRadius:999, fontSize:12, whiteSpace:"nowrap", cursor:"pointer", transition:"all .15s",
                background: filtreGenre===g ? INK : SURF2,
                color: filtreGenre===g ? BG : INK_S,
                border: `1px solid ${filtreGenre===g ? INK : HAIR}`,
                fontWeight: filtreGenre===g ? 500 : 400,
              }}
            >{g === "tous" ? "Tous" : g}</button>
          ))}
        </div>

        <div style={{ padding:"8px 22px", fontSize:10.5, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:INK_M, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span>Artistes suivis</span>
          <span style={{ background:SURF3, color:INK_S, padding:"2px 7px", borderRadius:999, fontSize:10, letterSpacing:0 }}>{artistes.length}</span>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"0 8px 12px", scrollbarWidth:"thin", scrollbarColor:`${HAIR} transparent` }}>
          {chargement
            ? [...Array(5)].map((_,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 12px" }}>
                  <div style={{ width:38, height:38, borderRadius:"50%", background:SURF3, flexShrink:0 }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ height:10, background:SURF3, borderRadius:4, width:"60%", marginBottom:6 }}/>
                    <div style={{ height:8,  background:SURF3, borderRadius:4, width:"40%" }}/>
                  </div>
                </div>
              ))
            : artistesFiltres.map((artiste, idx) => {
                const tag    = artistReleaseTagMap[artiste.name];
                const tagStr = getReleaseTag(tag);
                const isActive = artisteChoisi?.id === artiste.id;
                return (
                  <div
                    key={artiste.id}
                    onClick={() => {
                      if (isActive) { setArtisteChoisi(null); setToutesSorties([]); setSortiesArtiste([]); }
                      else { setArtisteChoisi(artiste); recupererSortiesArtiste(artiste.id); }
                    }}
                    style={{
                      display:"flex", alignItems:"center", gap:12, padding:"8px 12px", borderRadius:10,
                      cursor:"pointer", position:"relative", transition:"background .15s",
                      background: isActive ? SURF3 : "transparent",
                    }}
                    onMouseEnter={e => { if(!isActive) e.currentTarget.style.background=SURF2; }}
                    onMouseLeave={e => { if(!isActive) e.currentTarget.style.background="transparent"; }}
                  >
                    {tag && (
                      <span style={{ position:"absolute", left:4, top:"50%", transform:"translateY(-50%)", width:4, height:4, borderRadius:"50%", background:GREEN, boxShadow:"0 0 0 3px rgba(29,185,84,.15)" }}/>
                    )}
                    <Avatar name={artiste.name} image={artiste.images?.[0]?.url} size={38} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <b style={{ display:"block", fontSize:13.5, fontWeight:500, color:INK, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{artiste.name}</b>
                      <span style={{ display:"block", fontSize:11.5, color:INK_M }}>{artiste.genres?.[0] || "Artiste"}</span>
                    </div>
                    {tagStr && (
                      <span style={{ fontFamily:'"JetBrains Mono",monospace', fontSize:10, color:GREEN, padding:"3px 7px", background:"rgba(29,185,84,.14)", borderRadius:999, flexShrink:0 }}>{tagStr}</span>
                    )}
                  </div>
                );
              })}
        </div>

        <div style={{ padding:"12px 16px 16px", borderTop:`1px solid ${HAIR2}`, display:"flex", flexDirection:"column", gap:10 }}>
          {!isDemo && (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, padding:"8px" }}>
              <div>
                <b style={{ fontSize:12.5, fontWeight:500, display:"block", color:INK }}>Récap hebdomadaire</b>
                <span style={{ fontSize:11, color:INK_M }}>Chaque lundi matin</span>
              </div>
              <button
                onClick={() => { const next=!emailEnabled; setEmailEnabled(next); setEmailPreferences(next).catch(()=>setEmailEnabled(!next)); }}
                style={{ width:32, height:18, background:emailEnabled?GREEN:SURF3, borderRadius:999, position:"relative", cursor:"pointer", flexShrink:0, border:"none", transition:"background .2s" }}
                aria-label="Emails hebdo"
              >
                <span style={{ position:"absolute", width:14, height:14, borderRadius:"50%", background:"#fff", top:2, right:emailEnabled?2:undefined, left:emailEnabled?undefined:2, boxShadow:"0 1px 2px rgba(0,0,0,.3)", transition:"all .2s" }}/>
              </button>
            </div>
          )}
          {isDemo ? (
            <button
              onClick={() => navigate("/login")}
              style={{ width:"100%", background:GREEN, color:"#000", fontWeight:700, fontSize:13.5, padding:"10px 0", borderRadius:999, border:"none", cursor:"pointer" }}
            >Se connecter avec Spotify</button>
          ) : (
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:8, borderRadius:10, cursor:"pointer" }}>
              <Avatar name={utilisateur?.display_name||"U"} image={utilisateur?.images?.[0]?.url} size={30} />
              <div style={{ flex:1, minWidth:0 }}>
                <span style={{ fontSize:13, fontWeight:500, display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{utilisateur?.display_name||"Chargement…"}</span>
                <span style={{ fontSize:11, color:INK_M }}>Plan Gratuit</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      <main
        style={{ flex:1, background:SURF, borderRadius:16, border:`1px solid ${HAIR2}`, overflowY:"auto", scrollbarWidth:"thin", scrollbarColor:`${HAIR} transparent`, display:"flex", flexDirection:"column" }}
      >
        {isDemo && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 24px", background:"rgba(29,185,84,.08)", borderBottom:`1px solid rgba(29,185,84,.18)` }}>
            <p style={{ fontSize:13, color:INK_S, margin:0 }}>
              <span style={{ color:GREEN, fontWeight:600 }}>Mode démo</span> — Connecte-toi pour voir tes vraies données Spotify
            </p>
            <button onClick={() => navigate("/login")} style={{ background:GREEN, color:"#000", fontWeight:700, fontSize:12, padding:"6px 16px", borderRadius:999, border:"none", cursor:"pointer", flexShrink:0, marginLeft:16 }}>
              Se connecter
            </button>
          </div>
        )}

        <div style={{ position:"sticky", top:0, zIndex:10, background:SURF, padding:"16px 28px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, borderBottom:`1px solid ${HAIR2}` }}>
          <div style={{ display:"flex", gap:2, background:SURF2, border:`1px solid ${HAIR}`, borderRadius:10, padding:3 }}>
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setOngletActif(id)}
                style={{
                  padding:"7px 14px", borderRadius:7, fontSize:13, fontWeight:500, border:"none", cursor:"pointer",
                  background: ongletActif===id ? SURF3 : "transparent",
                  color: ongletActif===id ? INK : INK_M,
                  boxShadow: ongletActif===id ? "0 1px 2px rgba(0,0,0,.3)" : "none",
                  transition:"all .15s",
                }}
              >{label}</button>
            ))}
          </div>
          {ongletActif === "artists" && (
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ display:"flex", background:SURF2, border:`1px solid ${HAIR}`, borderRadius:8, padding:2 }}>
                {["Mois","Semaine","Agenda"].map((v,i) => (
                  <button key={v} style={{ padding:"6px 12px", borderRadius:6, fontSize:12, fontWeight:500, border:"none", cursor:"pointer", background:i===0?INK:"transparent", color:i===0?BG:INK_M }}>
                    {v}
                  </button>
                ))}
              </div>
              <button style={{ padding:"7px 14px", background:SURF2, border:`1px solid ${HAIR}`, borderRadius:8, fontSize:12.5, fontWeight:500, color:INK_S, display:"inline-flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 3h9M3.5 6.5h6M5 10h3"/></svg>
                Filtrer
              </button>
            </div>
          )}
        </div>

        <div style={{ padding:"24px 32px 32px", flex:1 }}>

          {ongletActif === "artists" && (
            <>
              <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:22, gap:24, flexWrap:"wrap" }}>
                <div>
                  <h1 style={{ fontSize:28, fontWeight:600, margin:"0 0 4px", letterSpacing:"-0.02em" }}>
                    {getGreeting()}{" "}
                    <em style={{ fontFamily:'"Fraunces",serif', fontStyle:"italic", fontWeight:400, color:PEACH }}>
                      {utilisateur?.display_name || (isDemo ? "ami(e)" : "…")}
                    </em>
                  </h1>
                  <p style={{ fontSize:13.5, color:INK_M, margin:0 }}>
                    {chargementCalendrier
                      ? "Chargement des sorties…"
                      : upcomingThisMonth > 0
                      ? `${upcomingThisMonth} sortie${upcomingThisMonth>1?"s":""} t'attend${upcomingThisMonth>1?"ent":""} ce mois-ci — dont ${cetteSemagineReleases.length} cette semaine.`
                      : "Aucune sortie à venir ce mois-ci."}
                  </p>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <button onClick={moisPrecedent} style={{ width:34, height:34, borderRadius:"50%", border:`1px solid ${HAIR}`, background:SURF2, display:"grid", placeItems:"center", color:INK_S, cursor:"pointer" }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m8.5 3.5-3.5 3.5 3.5 3.5"/></svg>
                  </button>
                  <span style={{ fontFamily:'"Fraunces",serif', fontSize:22, fontWeight:400, color:INK, padding:"0 12px", letterSpacing:"-0.01em", textTransform:"capitalize" }}>
                    {moisActuel.format("MMMM YYYY")}
                  </span>
                  <button onClick={moisSuivant} style={{ width:34, height:34, borderRadius:"50%", border:`1px solid ${HAIR}`, background:SURF2, display:"grid", placeItems:"center", color:INK_S, cursor:"pointer" }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m5.5 3.5 3.5 3.5-3.5 3.5"/></svg>
                  </button>
                  <button onClick={allerAujourdHui} style={{ padding:"8px 16px", background:INK, color:BG, borderRadius:999, fontSize:12, fontWeight:600, border:"none", cursor:"pointer" }}>
                    Aujourd'hui
                  </button>
                </div>
              </div>

              {/* Hero row — always visible */}
              <div style={{ display:"grid", gridTemplateColumns:"1.1fr 1fr", gap:14, marginBottom:28 }}>

                {/* Featured card */}
                <div style={{
                  position:"relative", borderRadius:18, overflow:"hidden", padding:22, minHeight:220,
                  background: featuredRelease
                    ? `linear-gradient(135deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,.15) 60%,rgba(0,0,0,.7) 100%),${getGrad(featuredRelease.artiste)}`
                    : `linear-gradient(135deg,rgba(0,0,0,.4) 0%,rgba(0,0,0,.1) 100%),${SURF3}`,
                  border:`1px solid ${HAIR}`, display:"flex", flexDirection:"column", justifyContent:"space-between",
                }}>
                  <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,240,220,.04) 1px,transparent 1.2px)", backgroundSize:"4px 4px", pointerEvents:"none" }}/>
                  {featuredRelease ? (
                    <>
                      <span style={{ display:"inline-flex", alignItems:"center", gap:8, fontSize:10.5, letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(244,237,224,.85)", fontWeight:600, position:"relative" }}>
                        {featuredIsUpcoming
                          ? <span style={{ width:6, height:6, borderRadius:"50%", background:GREEN, boxShadow:"0 0 0 4px rgba(29,185,84,.2)", animation:"pulse 2.4s ease-in-out infinite" }}/>
                          : <span style={{ width:6, height:6, borderRadius:"50%", background:PEACH }}/>
                        }
                        {featuredIsUpcoming ? "Prochaine sortie" : "Sortie ce mois"} · {featuredRelease.date.format("dddd D MMMM")}
                      </span>
                      <div style={{ position:"relative" }}>
                        <div style={{ display:"flex", gap:18, alignItems:"flex-end", marginTop:16 }}>
                          <Cover name={featuredRelease.artiste} image={featuredRelease.image} size={96} radius={10} style={{ boxShadow:"0 12px 30px -10px rgba(0,0,0,.6)" }}/>
                          <div>
                            <h2 style={{ fontFamily:'"Fraunces",serif', fontWeight:400, fontSize:26, lineHeight:1.1, margin:"0 0 4px", letterSpacing:"-0.015em" }}>{featuredRelease.titre}</h2>
                            <div style={{ fontSize:13, color:"rgba(244,237,224,.75)" }}>{featuredRelease.artiste} · {featuredRelease.type === "album" ? "Album" : featuredRelease.type === "single" ? "Single" : "EP"}</div>
                          </div>
                        </div>
                        <div style={{ marginTop:18, display:"flex", alignItems:"center", justifyContent:"space-between", gap:14 }}>
                          {featuredIsUpcoming ? (
                            <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
                              <span style={{ fontFamily:'"Fraunces",serif', fontSize:38, fontWeight:400, lineHeight:1, color:INK }}>{countdown.days}</span>
                              <span style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.08em", color:"rgba(244,237,224,.6)" }}>
                                j · {String(countdown.hours).padStart(2,"0")} h · {String(countdown.mins).padStart(2,"0")} min
                              </span>
                            </div>
                          ) : (
                            <span style={{ fontSize:12, color:"rgba(244,237,224,.55)", fontStyle:"italic" }}>Déjà sorti</span>
                          )}
                          <a href={featuredRelease.lienSpotify} target="_blank" rel="noopener noreferrer" style={{ padding:"10px 18px", background:"rgba(255,255,255,.94)", color:BG, borderRadius:999, fontSize:12.5, fontWeight:600, display:"inline-flex", alignItems:"center", gap:8, textDecoration:"none" }}>
                            {featuredIsUpcoming ? (
                              <>
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 1.5v9M2 1.5c4.5 0 4.5 3.75 0 3.75M2 10.5h2M10 5l-3-2.5v5Z" fill="currentColor"/></svg>
                                Me prévenir
                              </>
                            ) : (
                              <>
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="3,1.5 10.5,6 3,10.5" fill="currentColor"/></svg>
                                Écouter
                              </>
                            )}
                          </a>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", justifyContent:"center", flex:1, gap:10, position:"relative" }}>
                      <span style={{ display:"inline-flex", alignItems:"center", gap:8, fontSize:10.5, letterSpacing:"0.08em", textTransform:"uppercase", color:INK_M, fontWeight:600 }}>
                        <span style={{ width:6, height:6, borderRadius:"50%", background:INK_F }}/>
                        Sortie du mois
                      </span>
                      <div style={{ marginTop:8 }}>
                        <p style={{ fontFamily:'"Fraunces",serif', fontWeight:400, fontSize:22, margin:"0 0 6px", color:INK_S, fontStyle:"italic" }}>Rien ce mois-ci…</p>
                        <p style={{ fontSize:13, color:INK_M, margin:0 }}>Aucune sortie annoncée pour tes artistes. Ça ne devrait pas tarder.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Week strip */}
                <div style={{ background:SURF2, borderRadius:18, border:`1px solid ${HAIR}`, padding:18, display:"flex", flexDirection:"column", gap:10 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingBottom:6 }}>
                    <b style={{ fontSize:13, fontWeight:600 }}>
                      Cette semaine{" "}
                      <em style={{ fontFamily:'"Fraunces",serif', fontStyle:"italic", color:INK_M, fontWeight:400, fontSize:12 }}>
                        {cetteSemagineReleases.length > 0 ? `· ${cetteSemagineReleases.length} sortie${cetteSemagineReleases.length>1?"s":""}` : "· rien cette semaine"}
                      </em>
                    </b>
                    <button onClick={() => setOngletActif("history")} style={{ fontSize:11.5, color:INK_M, background:"none", border:"none", cursor:"pointer" }}>Voir tout →</button>
                  </div>
                  {cetteSemagineReleases.length > 0 ? (
                    <div style={{ display:"flex", flexDirection:"column", gap:4, overflowY:"auto", maxHeight:170 }}>
                      {cetteSemagineReleases.map((s, i) => {
                        const isPast = s.date.isBefore(aujourdHui, "day");
                        const isToday = s.date.isSame(aujourdHui, "day");
                        const when = getWhenLabel(s.date);
                        return (
                          <a key={i} href={s.lienSpotify} target="_blank" rel="noopener noreferrer"
                            style={{ display:"flex", alignItems:"center", gap:12, padding:8, borderRadius:10, cursor:"pointer", transition:"background .15s", textDecoration:"none", color:"inherit", opacity: isPast ? 0.6 : 1 }}
                            onMouseEnter={e => e.currentTarget.style.background=SURF3}
                            onMouseLeave={e => e.currentTarget.style.background="transparent"}
                          >
                            <Cover name={s.artiste} image={s.image} size={36} radius={6} />
                            <div style={{ flex:1, minWidth:0 }}>
                              <b style={{ display:"block", fontSize:12.5, fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{s.titre}</b>
                              <span style={{ display:"block", fontSize:11, color:INK_M }}>{s.artiste} · {s.type==="album"?"Album":s.type==="single"?"Single":"EP"}</span>
                            </div>
                            {isToday ? (
                              <span style={{ fontFamily:'"JetBrains Mono",monospace', fontSize:10.5, padding:"3px 8px", borderRadius:999, flexShrink:0, color:GREEN, background:"rgba(29,185,84,.14)", border:"1px solid rgba(29,185,84,.28)" }}>Aujourd'hui</span>
                            ) : isPast ? (
                              <span style={{ fontFamily:'"JetBrains Mono",monospace', fontSize:10.5, padding:"3px 8px", borderRadius:999, flexShrink:0, color:INK_F, background:SURF, border:`1px solid ${HAIR}` }}>Sorti</span>
                            ) : (
                              <span style={{ fontFamily:'"JetBrains Mono",monospace', fontSize:10.5, padding:"3px 8px", borderRadius:999, flexShrink:0, color: when.urgent ? GREEN : INK_S, background: when.urgent ? "rgba(29,185,84,.14)" : SURF, border:`1px solid ${when.urgent ? "rgba(29,185,84,.28)" : HAIR}` }}>{when.label}</span>
                            )}
                          </a>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8, padding:"16px 0" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={INK_F} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                      </svg>
                      <p style={{ fontSize:12.5, color:INK_M, margin:0, textAlign:"center" }}>Aucune sortie<br/>cette semaine</p>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <h3 style={{ fontSize:13, fontWeight:600, margin:0, color:INK_S, letterSpacing:"0.04em", textTransform:"uppercase" }}>
                  Toutes les sorties · {moisActuel.format("MMMM")}
                </h3>
                <div style={{ display:"flex", alignItems:"center", gap:14, fontSize:11.5, color:INK_M }}>
                  <span><span style={{ width:8, height:8, borderRadius:"50%", background:PEACH, display:"inline-block", marginRight:6, verticalAlign:"middle" }}/>Aujourd'hui</span>
                  <span><span style={{ width:8, height:8, borderRadius:"50%", background:GREEN, display:"inline-block", marginRight:6, verticalAlign:"middle" }}/>Sortie</span>
                </div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6 }}>
                {joursSemaine.map(j => (
                  <div key={j} style={{ fontSize:10.5, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.1em", color:INK_M, padding:"6px 4px 8px", textAlign:"left" }}>{j}</div>
                ))}

                {genererJours.map((jour, index) => {
                  const isOutside  = jour === "";
                  const isWeekend  = (index % 7) >= 5;
                  const isToday    = jour === aujourdHui.date() && moisActuel.isSame(aujourdHui, "month");
                  const sourceSorties = artisteChoisi ? toutesSorties : sortiesGlobales;
                  const events = jour
                    ? sourceSorties.filter(s => s.date.date()===jour && s.date.isSame(moisActuel,"month"))
                    : [];
                  const isFeatured = events.some(e => e.albumId === nextRelease?.albumId);

                  return (
                    <div
                      key={index}
                      onClick={() => { if (jour && events.length) { setEvenementsSelectionnes(events); setAfficherPopup(true); } }}
                      role={events.length ? "button" : undefined}
                      tabIndex={events.length ? 0 : undefined}
                      onKeyDown={e => { if (events.length && (e.key==="Enter"||e.key===" ")) { setEvenementsSelectionnes(events); setAfficherPopup(true); } }}
                      style={{
                        position:"relative", minHeight:110, borderRadius:12, padding:10, display:"flex", flexDirection:"column", gap:6, overflow:"hidden", transition:"all .15s",
                        background: isOutside ? "transparent"
                          : isToday ? undefined
                          : isWeekend ? BG
                          : isFeatured ? "linear-gradient(135deg,rgba(232,184,100,.1),rgba(240,194,148,.05))"
                          : SURF2,
                        border: isOutside ? "1px solid transparent"
                          : isToday ? `1px solid rgba(240,194,148,.35)`
                          : isFeatured ? "1px solid rgba(240,194,148,.22)"
                          : `1px solid ${HAIR2}`,
                        backgroundImage: isToday ? `radial-gradient(circle at 50% 0%,rgba(240,194,148,.12) 0%,transparent 70%),${SURF2}` : undefined,
                        cursor: events.length ? "pointer" : "default",
                      }}
                    >
                      <div style={{ fontSize:13, fontWeight:600, color: isOutside ? INK_F : isToday ? PEACH : INK_S, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        {jour || ""}
                        {events.length > 1 && (
                          <span style={{ fontSize:9.5, fontWeight:600, color:GREEN, background:"rgba(29,185,84,.14)", padding:"1px 5px", borderRadius:999, border:"1px solid rgba(29,185,84,.28)" }}>{events.length}</span>
                        )}
                      </div>

                      {events.slice(0,2).map((ev, i) => (
                        <div
                          key={i}
                          style={{
                            display:"flex", alignItems:"center", gap:8, padding:5, borderRadius:7,
                            background: isFeatured && i===0 ? "linear-gradient(90deg,rgba(240,194,148,.18),rgba(240,194,148,.05))" : SURF3,
                            border: isFeatured && i===0 ? "1px solid rgba(240,194,148,.2)" : "none",
                            minHeight:32,
                          }}
                        >
                          <Cover name={ev.artiste} image={ev.image} size={22} radius={4} />
                          <div style={{ flex:1, minWidth:0 }}>
                            <b style={{ display:"block", fontSize:11, fontWeight:500, color:INK, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", lineHeight:1.2 }}>
                              {artisteChoisi ? ev.titre : ev.artiste}
                            </b>
                            <span style={{ display:"block", fontSize:9.5, color:INK_M, lineHeight:1.2, textTransform:"uppercase", letterSpacing:"0.04em" }}>
                              {ev.type==="album"?"Album":ev.type==="single"?"Single":"EP"}
                            </span>
                          </div>
                        </div>
                      ))}
                      {events.length > 2 && (
                        <div style={{ fontSize:10.5, color:INK_M, padding:"4px 8px" }}>+ {events.length-2} autre{events.length-2>1?"s":""}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {ongletActif === "découvertes" && <SmartReleases isDemo={isDemo} />}

          {ongletActif === "history" && (
            <div>
              {/* Header */}
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
                {artisteChoisi && (
                  <button onClick={() => { setArtisteChoisi(null); setToutesSorties([]); setSortiesArtiste([]); }}
                    style={{ width:34, height:34, display:"grid", placeItems:"center", borderRadius:"50%", background:SURF2, border:`1px solid ${HAIR}`, color:INK_S, cursor:"pointer", fontSize:16, flexShrink:0 }}>←</button>
                )}
                <div style={{ flex:1, minWidth:0 }}>
                  <h2 style={{ fontFamily:'"Fraunces",serif', fontWeight:400, fontSize:26, margin:"0 0 2px", letterSpacing:"-0.02em", color:INK }}>
                    {artisteChoisi ? artisteChoisi.name : "Historique"}
                  </h2>
                  {!artisteChoisi && <p style={{ color:INK_M, fontSize:13.5, margin:0 }}>Explorez les sorties de chacun de vos artistes</p>}
                </div>
                {artisteChoisi && <Avatar name={artisteChoisi.name} image={artisteChoisi.images?.[0]?.url} size={40} style={{ flexShrink:0 }}/>}
              </div>

              {artisteChoisi ? (
                <div>
                  {/* Filters */}
                  <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
                    {[
                      { val:filtreType,    set:setFiltreType,                  opts:[["tous","Tous"],["album","Albums"],["single","Singles"],["compilation","Compilations"],["appears_on","Feats"]] },
                      { val:filtrePeriode, set:v=>setFiltrePeriode(Number(v)), opts:[[1,"1 mois"],[3,"3 mois"],[6,"6 mois"],[12,"12 mois"]] },
                      { val:triHistorique, set:setTriHistorique,               opts:[["date-desc","Récent d'abord"],["date-asc","Ancien d'abord"],["title-asc","A→Z"],["title-desc","Z→A"]] },
                    ].map((sel,i) => (
                      <select key={i} value={sel.val} onChange={e=>sel.set(e.target.value)}
                        style={{ padding:"7px 14px", background:SURF2, border:`1px solid ${HAIR}`, borderRadius:999, fontSize:12.5, color:INK_S, cursor:"pointer", outline:"none", fontWeight:500 }}>
                        {sel.opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    ))}
                  </div>

                  {/* Releases grid */}
                  {chargement ? (
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:14 }}>
                      {[...Array(8)].map((_,i) => (
                        <div key={i} style={{ background:SURF2, borderRadius:14, padding:14 }}>
                          <div style={{ aspectRatio:"1/1", background:SURF3, borderRadius:10, marginBottom:12 }}/>
                          <div style={{ height:10, background:SURF3, borderRadius:4, width:"70%", marginBottom:7 }}/>
                          <div style={{ height:8,  background:SURF3, borderRadius:4, width:"50%" }}/>
                        </div>
                      ))}
                    </div>
                  ) : sortiesFiltreesEtTriees.length ? (
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:14 }}>
                      {sortiesFiltreesEtTriees.map((s,i) => (
                        <a key={i} href={s.lienSpotify} target="_blank" rel="noopener noreferrer" onClick={()=>handleSpotifyLinkClick(s.titre)}
                          style={{ display:"block", background:SURF2, border:`1px solid ${HAIR2}`, borderRadius:14, padding:14, textDecoration:"none", transition:"background .15s,border-color .15s" }}
                          onMouseEnter={e=>{ e.currentTarget.style.background=SURF3; e.currentTarget.style.borderColor=HAIR; }}
                          onMouseLeave={e=>{ e.currentTarget.style.background=SURF2; e.currentTarget.style.borderColor=HAIR2; }}
                        >
                          <div style={{ aspectRatio:"1/1", background:getGrad(s.titre), borderRadius:10, marginBottom:12, overflow:"hidden", position:"relative" }}>
                            {s.image && <img src={s.image} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }} loading="lazy"/>}
                          </div>
                          <p style={{ fontSize:13, fontWeight:500, color:INK, margin:"0 0 4px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.titre}</p>
                          <p style={{ fontSize:11, color:INK_M, margin:0 }}>{s.date.format("DD/MM/YY")} · {s.type==="album"?"Album":s.type==="single"?"Single":"EP"}</p>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 0", gap:8, textAlign:"center" }}>
                      <p style={{ fontFamily:'"Fraunces",serif', fontWeight:400, fontSize:20, color:INK_S, fontStyle:"italic", margin:0 }}>Rien ici…</p>
                      <p style={{ color:INK_M, fontSize:13, margin:0 }}>Aucune sortie pour ces filtres.</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Artist picker grid */
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:12 }}>
                  {artistes.map(a => (
                    <button key={a.id} onClick={() => { setArtisteChoisi(a); recupererSortiesArtiste(a.id); }}
                      style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10, padding:"18px 14px 14px", background:SURF2, border:`1px solid ${HAIR2}`, borderRadius:16, cursor:"pointer", transition:"background .15s,border-color .15s", outline:"none" }}
                      onMouseEnter={e=>{ e.currentTarget.style.background=SURF3; e.currentTarget.style.borderColor=HAIR; }}
                      onMouseLeave={e=>{ e.currentTarget.style.background=SURF2; e.currentTarget.style.borderColor=HAIR2; }}
                    >
                      <Avatar name={a.name} image={a.images?.[0]?.url} size={60}/>
                      <div style={{ textAlign:"center", width:"100%" }}>
                        <p style={{ fontSize:13, fontWeight:500, color:INK, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.name}</p>
                        {a.genres?.[0] && <p style={{ fontSize:10.5, color:INK_M, margin:"3px 0 0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", textTransform:"capitalize" }}>{a.genres[0]}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {ongletActif === "genres" && (
            <div style={{ maxWidth:640 }}>
              {/* Header */}
              <div style={{ marginBottom:28 }}>
                <h2 style={{ fontFamily:'"Fraunces",serif', fontWeight:400, fontSize:26, margin:"0 0 4px", letterSpacing:"-0.02em", color:INK }}>Genres</h2>
                <p style={{ color:INK_M, fontSize:13.5, margin:0 }}>Basé sur vos artistes suivis et vos écoutes récentes</p>
              </div>

              {chargement ? (
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {[...Array(8)].map((_,i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:16, padding:"12px 14px" }}>
                      <div style={{ width:18, height:9, background:SURF3, borderRadius:4, flexShrink:0 }}/>
                      <div style={{ flex:1 }}>
                        <div style={{ height:10, background:SURF3, borderRadius:4, width:"30%", marginBottom:8 }}/>
                        <div style={{ height:3, background:SURF3, borderRadius:2 }}/>
                      </div>
                      <div style={{ width:44, height:9, background:SURF3, borderRadius:4, flexShrink:0 }}/>
                    </div>
                  ))}
                </div>
              ) : donneesGenres.labels.length ? (
                <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                  {donneesGenres.labels.map((genre, i) => {
                    const data = donneesGenres.datasets[0].data;
                    const val = data[i], pct = Math.round((val / Math.max(...data)) * 100);
                    const isTop = i === 0;
                    const barColor = isTop ? GREEN : i < 3 ? "#4acf78" : HAIR;
                    const rowBg    = isTop ? "rgba(29,185,84,.07)" : "transparent";
                    const rowBgHov = isTop ? "rgba(29,185,84,.11)" : SURF2;
                    return (
                      <div key={i} onClick={() => setGenreChoisi({ genre, artists:artistesParGenre[genre]||[] })}
                        style={{ display:"flex", alignItems:"center", gap:14, padding:"11px 14px", borderRadius:12, cursor:"pointer", background:rowBg, border:`1px solid transparent`, transition:"background .15s,border-color .15s" }}
                        onMouseEnter={e=>{ e.currentTarget.style.background=rowBgHov; if(!isTop) e.currentTarget.style.borderColor=HAIR; }}
                        onMouseLeave={e=>{ e.currentTarget.style.background=rowBg;    e.currentTarget.style.borderColor="transparent"; }}
                      >
                        <span style={{ fontFamily:'"JetBrains Mono",monospace', fontSize:11, fontWeight:700, width:20, textAlign:"right", flexShrink:0, color:isTop ? GREEN : INK_F }}>
                          {i + 1}
                        </span>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:7, gap:8 }}>
                            <span style={{ fontSize:14, fontWeight: isTop ? 600 : 500, color: isTop ? INK : INK_S, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", textTransform:"capitalize" }}>{genre}</span>
                            <span style={{ fontSize:11, color:INK_M, flexShrink:0, fontFamily:'"JetBrains Mono",monospace' }}>{val} artiste{val>1?"s":""}</span>
                          </div>
                          <div style={{ height:3, background:SURF3, borderRadius:2, overflow:"hidden" }}>
                            <div style={{ height:"100%", width:`${pct}%`, background:barColor, borderRadius:2, transition:"width .4s ease" }}/>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 0", gap:8, textAlign:"center" }}>
                  <p style={{ fontFamily:'"Fraunces",serif', fontWeight:400, fontSize:20, color:INK_S, fontStyle:"italic", margin:0 }}>Aucun genre détecté…</p>
                  <p style={{ color:INK_M, fontSize:13, margin:0 }}>Suivez des artistes pour voir vos genres apparaître ici.</p>
                </div>
              )}
            </div>
          )}

        </div>

        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t flex" style={{ background:"rgba(12,11,10,.95)", backdropFilter:"blur(12px)", borderColor:HAIR2 }}>
          {TABS.map(({ id, label }) => (
            <button key={id} onClick={() => setOngletActif(id)}
              style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:3, padding:"10px 0", color:ongletActif===id?INK:INK_M, background:"none", border:"none", cursor:"pointer", fontSize:10, fontWeight:ongletActif===id?600:400 }}>
              {label}
            </button>
          ))}
        </div>
      </main>

      {genreChoisi && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50, padding:16 }} onClick={() => setGenreChoisi(null)}>
          <div ref={genreModalRef} tabIndex={-1} style={{ background:SURF, borderRadius:20, width:"100%", maxWidth:440, overflow:"hidden", outline:"none" }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:`1px solid ${HAIR2}` }}>
              <div>
                <h3 style={{ fontWeight:700, fontSize:16, margin:"0 0 2px", textTransform:"capitalize" }}>{genreChoisi.genre}</h3>
                <p style={{ color:INK_M, fontSize:12, margin:0 }}>{genreChoisi.artists.length} artiste{genreChoisi.artists.length>1?"s":""}</p>
              </div>
              <button onClick={()=>setGenreChoisi(null)} style={{ width:36, height:36, display:"grid", placeItems:"center", background:SURF2, borderRadius:"50%", border:`1px solid ${HAIR}`, color:INK_S, cursor:"pointer" }}>✕</button>
            </div>
            <div style={{ maxHeight:"60vh", overflowY:"auto", padding:16 }}>
              {genreChoisi.artists.length ? (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  {genreChoisi.artists.map((a,i) => {
                    const sel = artisteChoisi?.id === a.id;
                    return (
                      <div key={i} onClick={() => { if(sel){setArtisteChoisi(null);setToutesSorties([]);setSortiesArtiste([]);}else{setArtisteChoisi(a);recupererSortiesArtiste(a.id);setOngletActif("artists");} setGenreChoisi(null); }}
                        style={{ display:"flex", alignItems:"center", gap:12, padding:12, borderRadius:14, cursor:"pointer", background:sel?"rgba(29,185,84,.15)":SURF2, border:`1px solid ${sel?"rgba(29,185,84,.4)":HAIR2}`, transition:"all .15s" }}>
                        <Avatar name={a.name} image={a.images?.[0]?.url} size={40}/>
                        <span style={{ fontSize:13, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:sel?GREEN:INK }}>{a.name}</span>
                      </div>
                    );
                  })}
                </div>
              ) : <p style={{ color:INK_M, fontSize:14, textAlign:"center", padding:"24px 0" }}>Aucun artiste trouvé.</p>}
            </div>
          </div>
        </div>
      )}

      {afficherPopup && evenementsSelectionnes.length > 0 && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50, padding:16 }}>
          <div ref={eventPopupRef} tabIndex={-1} style={{ background:SURF, borderRadius:20, width:"100%", maxWidth:380, overflow:"hidden", outline:"none" }}>
            <div style={{ position:"relative", height:160, overflow:"hidden", background:getGrad(evenementsSelectionnes[0].artiste) }}>
              {evenementsSelectionnes[0].image && <img src={evenementsSelectionnes[0].image} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} loading="lazy"/>}
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(22,20,18,1) 0%,rgba(22,20,18,.5) 50%,transparent 100%)" }}/>
              <button onClick={()=>setAfficherPopup(false)} style={{ position:"absolute", top:12, right:12, width:28, height:28, display:"grid", placeItems:"center", background:"rgba(0,0,0,.4)", borderRadius:"50%", border:"none", color:INK, cursor:"pointer", fontSize:12 }}>✕</button>
              <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"0 20px 16px" }}>
                <h3 style={{ fontWeight:700, fontSize:14, margin:"0 0 2px", textTransform:"capitalize" }}>{evenementsSelectionnes[0].date.format("dddd D MMMM YYYY")}</h3>
                <p style={{ color:INK_S, fontSize:11, margin:0 }}>{evenementsSelectionnes.length} sortie{evenementsSelectionnes.length>1?"s":""}</p>
              </div>
            </div>
            <div style={{ maxHeight:"45vh", overflowY:"auto", padding:"12px" }}>
              {[{ label:"À venir", filter: e => e.date.isAfter(aujourdHui) }, { label:"Passées", filter: e => !e.date.isAfter(aujourdHui) }].map(section => {
                const filtered = evenementsSelectionnes.filter(section.filter);
                if (!filtered.length) return null;
                return (
                  <div key={section.label} style={{ marginBottom:12 }}>
                    <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:section.label==="À venir"?GREEN:INK_M, padding:"0 8px 8px", margin:0 }}>{section.label}</p>
                    {filtered.map((ev, i) => (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"8px", borderRadius:10, transition:"background .15s" }}
                        onMouseEnter={e=>e.currentTarget.style.background=SURF2} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <Cover name={ev.artiste} image={ev.image} size={36} radius={6} style={{ opacity:section.label==="Passées"?0.6:1 }}/>
                        <div style={{ flex:1, minWidth:0 }}>
                          <a href={ev.lienSpotify} target="_blank" rel="noopener noreferrer" onClick={()=>handleSpotifyLinkClick(ev.titre)}
                            style={{ fontSize:14, fontWeight:500, color:section.label==="À venir"?INK:INK_S, textDecoration:"none", display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ev.titre}</a>
                          {!artisteChoisi && ev.artiste && <span style={{ fontSize:11, color:INK_M }}>{ev.artiste}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
            <div style={{ padding:"12px 20px 16px", borderTop:`1px solid ${HAIR2}` }}>
              <button onClick={()=>setAfficherPopup(false)} style={{ width:"100%", background:INK, color:BG, fontSize:14, fontWeight:700, padding:"10px 0", borderRadius:999, border:"none", cursor:"pointer" }}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse{0%,100%{box-shadow:0 0 0 4px rgba(29,185,84,.2)}50%{box-shadow:0 0 0 7px rgba(29,185,84,.05)}}`}</style>

      <ToastContainer position="bottom-right" autoClose={3000} theme="dark"
        toastClassName="!bg-[#1d1a17] !text-[#f4ede0] !border !border-[#2a2622] !rounded-xl !shadow-xl"
        progressClassName="!bg-[#1db954]"
      />
    </div>
  );
};

export default Calendar;
