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
import SmartReleases from "../components/SmartReleases";
import { BG, SURF, HAIR, HAIR2, INK, INK_S, GREEN } from "../components/calendar/theme";
import { DEMO_ARTISTES, DEMO_SORTIES_GLOBALES, DEMO_GENRES } from "../components/calendar/demoData";
import Sidebar from "../components/calendar/Sidebar";
import ArtistsTab from "../components/calendar/ArtistsTab";
import HistoryTab from "../components/calendar/HistoryTab";
import GenresTab from "../components/calendar/GenresTab";
import GenreModal from "../components/calendar/GenreModal";
import EventPopup from "../components/calendar/EventPopup";
import { TopTabs, BottomNav } from "../components/calendar/Tabs";

dayjs.locale("fr");

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
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [vue, setVue] = useState("mois");
  const [filtreOuvert, setFiltreOuvert] = useState(false);
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
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

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

  const debutSemaineVue = useMemo(() => moisActuel.startOf("week"), [moisActuel]);

  const agendaGroups = useMemo(() => {
    const releases = [...sortiesGlobales].sort((a,b) => a.date.valueOf()-b.date.valueOf());
    const groups = [];
    releases.forEach(r => {
      const key = r.date.format("YYYY-MM-DD");
      const last = groups[groups.length-1];
      if (last && last.key === key) last.items.push(r);
      else groups.push({ key, date:r.date, items:[r] });
    });
    return groups;
  }, [sortiesGlobales]);

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
        setTopArtistes(DEMO_ARTISTES);
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
    setTimeout(async () => { try { await logout(); } catch {} finally { navigate("/", {replace:true,state:{fromLogout:true}}); } }, 2000);
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

  const deselectionnerArtiste = () => { setArtisteChoisi(null); setToutesSorties([]); setSortiesArtiste([]); };

  const toggleArtiste = (artiste, isActive) => {
    if (isActive) deselectionnerArtiste();
    else { setArtisteChoisi(artiste); recupererSortiesArtiste(artiste.id); }
  };

  const toggleEmail = () => {
    const next = !emailEnabled;
    setEmailEnabled(next);
    setEmailPreferences(next).catch(() => setEmailEnabled(!next));
  };

  return (
    <div
      style={{ fontFamily:'"DM Sans", system-ui, sans-serif', background:BG, color:INK, WebkitFontSmoothing:"antialiased" }}
      className="flex h-screen overflow-hidden p-2 gap-2"
    >
      <Sidebar
        sidebarOuverte={sidebarOuverte} setSidebarOuverte={setSidebarOuverte}
        navigate={navigate} deconnexion={deconnexion}
        rechercheArtiste={rechercheArtiste} setRechercheArtiste={setRechercheArtiste}
        genresDisponibles={genresDisponibles} filtreGenre={filtreGenre} setFiltreGenre={setFiltreGenre}
        chargement={chargement} artistesFiltres={artistesFiltres} artistesCount={artistes.length}
        artistReleaseTagMap={artistReleaseTagMap} artisteChoisi={artisteChoisi} onToggleArtiste={toggleArtiste}
        isDemo={isDemo} emailEnabled={emailEnabled} onToggleEmail={toggleEmail} utilisateur={utilisateur}
      />

      <main
        style={{ flex:1, background:SURF, borderRadius:16, border:`1px solid ${HAIR2}`, overflowY:"auto", overflowX:"hidden", scrollbarWidth:"thin", scrollbarColor:`${HAIR} transparent`, display:"flex", flexDirection:"column" }}
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

        {!isMobile && <TopTabs ongletActif={ongletActif} setOngletActif={setOngletActif} />}

        <div style={{ padding:"24px 32px 32px", flex:1 }}>

          {ongletActif === "artists" && (
            <ArtistsTab
              isMobile={isMobile}
              utilisateur={utilisateur} isDemo={isDemo} chargementCalendrier={chargementCalendrier}
              upcomingThisMonth={upcomingThisMonth} cetteSemagineReleases={cetteSemagineReleases}
              vue={vue} setVue={setVue} moisActuel={moisActuel} setMoisActuel={setMoisActuel}
              moisPrecedent={moisPrecedent} moisSuivant={moisSuivant} allerAujourdHui={allerAujourdHui} aujourdHui={aujourdHui}
              filtreOuvert={filtreOuvert} setFiltreOuvert={setFiltreOuvert} filtreType={filtreType} setFiltreType={setFiltreType}
              featuredRelease={featuredRelease} featuredIsUpcoming={featuredIsUpcoming} countdown={countdown}
              setOngletActif={setOngletActif}
              joursSemaine={joursSemaine} genererJours={genererJours} artisteChoisi={artisteChoisi}
              toutesSorties={toutesSorties} sortiesGlobales={sortiesGlobales} nextRelease={nextRelease}
              onSelectEvents={(events) => { setEvenementsSelectionnes(events); setAfficherPopup(true); }}
              debutSemaineVue={debutSemaineVue} agendaGroups={agendaGroups}
            />
          )}

          {ongletActif === "découvertes" && <SmartReleases isDemo={isDemo} />}

          {ongletActif === "history" && (
            <HistoryTab
              artisteChoisi={artisteChoisi} artistes={artistes} chargement={chargement}
              sortiesFiltreesEtTriees={sortiesFiltreesEtTriees}
              filtreType={filtreType} setFiltreType={setFiltreType}
              filtrePeriode={filtrePeriode} setFiltrePeriode={setFiltrePeriode}
              triHistorique={triHistorique} setTriHistorique={setTriHistorique}
              onBack={deselectionnerArtiste}
              onSelectArtiste={(a) => { setArtisteChoisi(a); recupererSortiesArtiste(a.id); }}
              handleSpotifyLinkClick={handleSpotifyLinkClick}
            />
          )}

          {ongletActif === "genres" && (
            <GenresTab
              chargement={chargement} donneesGenres={donneesGenres}
              artistesParGenre={artistesParGenre}
              onSelectGenre={setGenreChoisi}
            />
          )}

        </div>

        {isMobile && <BottomNav ongletActif={ongletActif} setOngletActif={setOngletActif} />}
      </main>

      {genreChoisi && (
        <GenreModal
          genreChoisi={genreChoisi} modalRef={genreModalRef} artisteChoisi={artisteChoisi}
          onClose={() => setGenreChoisi(null)}
          onSelectArtist={(a, sel) => {
            if (sel) deselectionnerArtiste();
            else { setArtisteChoisi(a); recupererSortiesArtiste(a.id); setOngletActif("artists"); }
            setGenreChoisi(null);
          }}
        />
      )}

      {afficherPopup && evenementsSelectionnes.length > 0 && (
        <EventPopup
          evenementsSelectionnes={evenementsSelectionnes} aujourdHui={aujourdHui}
          popupRef={eventPopupRef} artisteChoisi={artisteChoisi}
          onClose={() => setAfficherPopup(false)}
          handleSpotifyLinkClick={handleSpotifyLinkClick}
        />
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
