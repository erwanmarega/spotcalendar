import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import SmartReleases from "../components/SmartReleases";
import { BG, SURF, HAIR, HAIR2, INK, INK_S } from "../components/calendar/theme";
import {
  DEMO_ARTISTES_APPLE,
  DEMO_SORTIES_GLOBALES_APPLE,
  DEMO_GENRES_APPLE,
} from "../components/calendar/demoDataApple";
import Sidebar from "../components/calendar/Sidebar";
import ArtistsTab from "../components/calendar/ArtistsTab";
import HistoryTab from "../components/calendar/HistoryTab";
import GenresTab from "../components/calendar/GenresTab";
import GenreModal from "../components/calendar/GenreModal";
import EventPopup from "../components/calendar/EventPopup";
import Settings from "../components/calendar/Settings";
import { TopTabs, BottomNav } from "../components/calendar/Tabs";
import { getPalette } from "../components/calendar/palettes";
import { useThemeMode } from "../components/calendar/useThemeMode";

dayjs.locale("fr");

const AM_PINK = "#fa2d6e";

const CalendarApple = () => {
  const [moisActuel, setMoisActuel] = useState(dayjs());
  const [ongletActif, setOngletActif] = useState("artists");
  const [artistes] = useState(DEMO_ARTISTES_APPLE);
  const [donneesGenres] = useState(DEMO_GENRES_APPLE);
  const [artisteChoisi, setArtisteChoisi] = useState(null);
  const [toutesSorties, setToutesSorties] = useState([]);
  const [evenementsSelectionnes, setEvenementsSelectionnes] = useState([]);
  const [afficherPopup, setAfficherPopup] = useState(false);
  const [filtreType, setFiltreType] = useState("tous");
  const [filtrePeriode, setFiltrePeriode] = useState(6);
  const [rechercheArtiste, setRechercheArtiste] = useState("");
  const [filtreGenre, setFiltreGenre] = useState("tous");
  const [genresDisponibles] = useState(
    ["hip hop","pop","r&b","electronic","rap","latin","alternative","chanson française","house","indie pop"]
  );
  const [triHistorique, setTriHistorique] = useState("date-desc");
  const [sidebarOuverte, setSidebarOuverte] = useState(false);
  const [sortiesGlobales] = useState(DEMO_SORTIES_GLOBALES_APPLE);
  const [artistesParGenre] = useState(() => {
    const map = {};
    DEMO_ARTISTES_APPLE.forEach(a => a.genres.forEach(g => {
      if (!map[g]) map[g] = [];
      map[g].push(a);
    }));
    return map;
  });
  const [genreChoisi, setGenreChoisi] = useState(null);
  const [afficherParametres, setAfficherParametres] = useState(false);
  const [mode, , setMode] = useThemeMode();
  const palette = useMemo(() => getPalette("apple", mode), [mode]);
  const [topArtistes] = useState(DEMO_ARTISTES_APPLE);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0 });
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [vue, setVue] = useState("mois");
  const [filtreOuvert, setFiltreOuvert] = useState(false);
  const genreModalRef = useRef(null);
  const eventPopupRef = useRef(null);
  const settingsModalRef = useRef(null);

  const aujourdHui = useMemo(() => dayjs(), []);
  const navigate = useNavigate();
  const joursSemaine = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const debutMois = moisActuel.startOf("month");
  const finMois = moisActuel.endOf("month");
  const joursDansMois = finMois.date();
  const jourDebut = debutMois.day();

  const moisPrecedent = useCallback(() => setMoisActuel(m => m.subtract(1, "month")), []);
  const moisSuivant   = useCallback(() => setMoisActuel(m => m.add(1, "month")), []);
  const allerAujourdHui = useCallback(() => setMoisActuel(dayjs()), []);

  useEffect(() => { if (genreChoisi)       genreModalRef.current?.focus(); }, [genreChoisi]);
  useEffect(() => { if (afficherPopup)     eventPopupRef.current?.focus(); }, [afficherPopup]);
  useEffect(() => { if (afficherParametres) settingsModalRef.current?.focus(); }, [afficherParametres]);
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

  const recupererSortiesArtiste = useCallback((idArtiste) => {
    const nom = DEMO_ARTISTES_APPLE.find(a => a.id === idArtiste)?.name;
    const sorties = DEMO_SORTIES_GLOBALES_APPLE.filter(s => s.artiste === nom);
    setToutesSorties(sorties);
  }, []);

  const deconnexion = useCallback(() => {
    toast.info("Déconnexion en cours... 👋", { position:"bottom-right", autoClose:2000, theme:"dark" });
    setTimeout(() => navigate("/login/apple", { replace:true, state:{ fromLogout:true } }), 2000);
  }, [navigate]);

  const handleSpotifyLinkClick = useCallback((titre) => {
    toast.success(`Redirection vers Apple Music 🎧 : ${titre}`, { position:"bottom-right", autoClose:3000, theme:"dark" });
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

  const deselectionnerArtiste = () => { setArtisteChoisi(null); setToutesSorties([]); };

  const toggleArtiste = (artiste, isActive) => {
    if (isActive) deselectionnerArtiste();
    else { setArtisteChoisi(artiste); recupererSortiesArtiste(artiste.id); }
  };

  return (
    <div
      style={{ ...palette, fontFamily:'-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif', background:BG, color:INK, WebkitFontSmoothing:"antialiased" }}
      className="flex h-screen overflow-hidden p-2 gap-2"
    >
      <Sidebar
        sidebarOuverte={sidebarOuverte} setSidebarOuverte={setSidebarOuverte}
        navigate={navigate} deconnexion={deconnexion}
        rechercheArtiste={rechercheArtiste} setRechercheArtiste={setRechercheArtiste}
        genresDisponibles={genresDisponibles} filtreGenre={filtreGenre} setFiltreGenre={setFiltreGenre}
        chargement={false} artistesFiltres={artistesFiltres} artistesCount={artistes.length}
        artistReleaseTagMap={artistReleaseTagMap} artisteChoisi={artisteChoisi} onToggleArtiste={toggleArtiste}
        isDemo={true} emailEnabled={false} onToggleEmail={() => {}} utilisateur={null}
        onOpenSettings={() => setAfficherParametres(true)}
      />

      <main
        style={{ flex:1, background:SURF, borderRadius:16, border:`1px solid ${HAIR2}`, overflowY:"auto", overflowX:"hidden", scrollbarWidth:"thin", scrollbarColor:`${HAIR} transparent`, display:"flex", flexDirection:"column" }}
      >
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 24px", background:"rgba(250,45,110,.08)", borderBottom:"1px solid rgba(250,45,110,.18)" }}>
          <p style={{ fontSize:13, color:INK_S, margin:0 }}>
            <span style={{ color:AM_PINK, fontWeight:600 }}>Mode démo</span> — Connecte-toi pour voir tes vraies données Apple Music
          </p>
          <button onClick={() => navigate("/login/apple")} style={{ background:AM_PINK, color:"#fff", fontWeight:700, fontSize:12, padding:"6px 16px", borderRadius:999, border:"none", cursor:"pointer", flexShrink:0, marginLeft:16 }}>
            Se connecter
          </button>
        </div>

        {!isMobile && <TopTabs ongletActif={ongletActif} setOngletActif={setOngletActif} />}

        <div style={{ padding:"24px 32px 32px", flex:1 }}>

          {ongletActif === "artists" && (
            <ArtistsTab
              isMobile={isMobile}
              utilisateur={null} isDemo={true} chargementCalendrier={false}
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

          {ongletActif === "découvertes" && <SmartReleases isDemo={true} />}

          {ongletActif === "history" && (
            <HistoryTab
              artisteChoisi={artisteChoisi} artistes={artistes} chargement={false}
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
              chargement={false} donneesGenres={donneesGenres}
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

      {afficherParametres && (
        <Settings
          modalRef={settingsModalRef} mode={mode} onSetMode={setMode}
          onClose={() => setAfficherParametres(false)}
        />
      )}

      <style>{`@keyframes pulse{0%,100%{box-shadow:0 0 0 4px rgba(250,45,110,.2)}50%{box-shadow:0 0 0 7px rgba(250,45,110,.05)}}`}</style>

      <ToastContainer position="bottom-right" autoClose={3000} theme="dark"
        toastClassName="!bg-[#161616] !text-[#ffffff] !border !border-[#2a2a2a] !rounded-xl !shadow-xl"
        progressClassName="!bg-[#fa2d6e]"
      />
    </div>
  );
};

export default CalendarApple;
