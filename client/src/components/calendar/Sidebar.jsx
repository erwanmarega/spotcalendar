import PropTypes from "prop-types";
import { Avatar } from "./primitives";
import { getReleaseTag } from "./helpers";
import { BG, SURF, SURF2, SURF3, HAIR, HAIR2, INK, INK_S, INK_M, GREEN } from "./theme";

const Sidebar = ({
  sidebarOuverte, setSidebarOuverte,
  navigate, deconnexion,
  rechercheArtiste, setRechercheArtiste,
  genresDisponibles, filtreGenre, setFiltreGenre,
  chargement, artistesFiltres, artistesCount,
  artistReleaseTagMap, artisteChoisi, onToggleArtiste,
  isDemo, emailEnabled, onToggleEmail, utilisateur,
  onOpenSettings,
}) => (
  <>
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
          <span style={{ width:26, height:26, background:GREEN, borderRadius:7, position:"relative", display:"grid", placeItems:"center", flexShrink:0 }}>
            <span style={{ position:"absolute", top:-3, left:6, right:6, height:5, borderLeft:`2px solid ${GREEN}`, borderRight:`2px solid ${GREEN}` }}/>
            <span style={{ width:6, height:6, background:BG, borderRadius:"50%" }}/>
          </span>
          <span>Spot<span style={{ color:INK_M, fontWeight:500 }}>Calendar</span></span>
        <div style={{ display:"flex", alignItems:"center", gap:2 }}>
          <button
            onClick={onOpenSettings}
            style={{ width:32, height:32, borderRadius:8, display:"grid", placeItems:"center", color:INK_S, background:"none", border:"none", cursor:"pointer" }}
            title="Paramètres"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
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
        <span style={{ background:SURF3, color:INK_S, padding:"2px 7px", borderRadius:999, fontSize:10, letterSpacing:0 }}>{artistesCount}</span>
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
          : artistesFiltres.map((artiste) => {
              const tag    = artistReleaseTagMap[artiste.name];
              const tagStr = getReleaseTag(tag);
              const isActive = artisteChoisi?.id === artiste.id;
              return (
                <div
                  key={artiste.id}
                  onClick={() => onToggleArtiste(artiste, isActive)}
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
              onClick={onToggleEmail}
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
  </>
);

Sidebar.propTypes = {
  sidebarOuverte: PropTypes.bool.isRequired,
  setSidebarOuverte: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
  deconnexion: PropTypes.func.isRequired,
  rechercheArtiste: PropTypes.string.isRequired,
  setRechercheArtiste: PropTypes.func.isRequired,
  genresDisponibles: PropTypes.array.isRequired,
  filtreGenre: PropTypes.string.isRequired,
  setFiltreGenre: PropTypes.func.isRequired,
  chargement: PropTypes.bool.isRequired,
  artistesFiltres: PropTypes.array.isRequired,
  artistesCount: PropTypes.number.isRequired,
  artistReleaseTagMap: PropTypes.object.isRequired,
  artisteChoisi: PropTypes.object,
  onToggleArtiste: PropTypes.func.isRequired,
  isDemo: PropTypes.bool.isRequired,
  emailEnabled: PropTypes.bool.isRequired,
  onToggleEmail: PropTypes.func.isRequired,
  utilisateur: PropTypes.object,
  onOpenSettings: PropTypes.func,
};

export default Sidebar;
