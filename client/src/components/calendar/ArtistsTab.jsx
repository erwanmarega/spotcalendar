import PropTypes from "prop-types";
import FeaturedCard from "./FeaturedCard";
import WeekPanel from "./WeekPanel";
import MonthView from "./views/MonthView";
import WeekView from "./views/WeekView";
import AgendaView from "./views/AgendaView";
import { getGreeting } from "./helpers";
import { BG, SURF2, SURF3, HAIR, INK, INK_S, INK_M, PEACH } from "./theme";

const ArtistsTab = ({
  isMobile,
  utilisateur, isDemo, chargementCalendrier, upcomingThisMonth, cetteSemagineReleases,
  vue, setVue, moisActuel, setMoisActuel, moisPrecedent, moisSuivant, allerAujourdHui, aujourdHui,
  filtreOuvert, setFiltreOuvert, filtreType, setFiltreType,
  featuredRelease, featuredIsUpcoming, countdown,
  setOngletActif,
  joursSemaine, genererJours, artisteChoisi, toutesSorties, sortiesGlobales, nextRelease, onSelectEvents,
  debutSemaineVue, agendaGroups,
}) => {
  const reculer = () => vue==="semaine" ? setMoisActuel(m=>m.subtract(7,"day")) : moisPrecedent();
  const avancer = () => vue==="semaine" ? setMoisActuel(m=>m.add(7,"day")) : moisSuivant();
  const labelPeriode = vue==="semaine"
    ? `${moisActuel.startOf("week").format("D")} – ${moisActuel.endOf("week").format("D MMM YYYY")}`
    : moisActuel.format("MMMM YYYY");

  return (
    <>
      <div style={{ marginBottom:22 }}>
        {!isMobile && (
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:24, marginBottom:0 }}>
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
            <div style={{ display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
              <button onClick={reculer} style={{ width:34, height:34, borderRadius:"50%", border:`1px solid ${HAIR}`, background:SURF2, display:"grid", placeItems:"center", color:INK_S, cursor:"pointer" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m8.5 3.5-3.5 3.5 3.5 3.5"/></svg>
              </button>
              <span style={{ fontFamily:'"Fraunces",serif', fontSize:22, fontWeight:400, color:INK, padding:"0 12px", letterSpacing:"-0.01em", textTransform:"capitalize" }}>
                {labelPeriode}
              </span>
              <button onClick={avancer} style={{ width:34, height:34, borderRadius:"50%", border:`1px solid ${HAIR}`, background:SURF2, display:"grid", placeItems:"center", color:INK_S, cursor:"pointer" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m5.5 3.5 3.5 3.5-3.5 3.5"/></svg>
              </button>
              <button onClick={allerAujourdHui} style={{ padding:"8px 16px", background:INK, color:BG, borderRadius:999, fontSize:12, fontWeight:600, border:"none", cursor:"pointer" }}>
                Aujourd'hui
              </button>
            </div>
          </div>
        )}
        {isMobile && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
            <button onClick={reculer} style={{ width:34, height:34, borderRadius:"50%", border:`1px solid ${HAIR}`, background:SURF2, display:"grid", placeItems:"center", color:INK_S, cursor:"pointer", flexShrink:0 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m8.5 3.5-3.5 3.5 3.5 3.5"/></svg>
            </button>
            <div style={{ textAlign:"center" }}>
              <span style={{ fontFamily:'"Fraunces",serif', fontSize:20, fontWeight:400, color:INK, letterSpacing:"-0.01em", textTransform:"capitalize", display:"block" }}>
                {vue==="semaine"
                  ? `${moisActuel.startOf("week").format("D")} – ${moisActuel.endOf("week").format("D MMM")}`
                  : moisActuel.format("MMMM YYYY")}
              </span>
            </div>
            <button onClick={avancer} style={{ width:34, height:34, borderRadius:"50%", border:`1px solid ${HAIR}`, background:SURF2, display:"grid", placeItems:"center", color:INK_S, cursor:"pointer", flexShrink:0 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m5.5 3.5 3.5 3.5-3.5 3.5"/></svg>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr]" style={{ gap:14, marginBottom:28 }}>
        <FeaturedCard featuredRelease={featuredRelease} featuredIsUpcoming={featuredIsUpcoming} countdown={countdown} />
        <WeekPanel cetteSemagineReleases={cetteSemagineReleases} aujourdHui={aujourdHui} onVoirTout={() => setOngletActif("history")} />
      </div>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, gap:12 }}>
        <div style={{ display:"inline-flex", alignItems:"center", background:SURF2, border:`1px solid ${HAIR}`, borderRadius:999, padding:4, gap:2 }}>
          {[{id:"mois",label:"Mois"},{id:"semaine",label:"Semaine"},{id:"agenda",label:"Agenda"}].map(({id,label}) => (
            <button key={id} onClick={() => setVue(id)} style={{
              padding: isMobile ? "5px 12px" : "6px 16px", borderRadius:999, fontSize:13, fontWeight:600, cursor:"pointer", border:"none", outline:"none",
              background: vue===id ? INK : "transparent",
              color:      vue===id ? BG  : INK_M,
              transition:"all .15s",
            }}>{label}</button>
          ))}
        </div>

        <div style={{ position:"relative" }}>
          <button onClick={() => setFiltreOuvert(f=>!f)} style={{
            display:"flex", alignItems:"center", gap:8, padding:"8px 16px",
            background: filtreOuvert ? SURF3 : SURF2,
            border:`1px solid ${HAIR}`, borderRadius:999, fontSize:13, fontWeight:500,
            color: filtreOuvert ? INK : INK_S, cursor:"pointer", outline:"none", transition:"all .15s",
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M1 3h12M3 7h8M5 11h4"/></svg>
            {!isMobile && "Filtrer"}
          </button>
          {filtreOuvert && (
            <>
              <div style={{ position:"fixed", inset:0, zIndex:19 }} onClick={() => setFiltreOuvert(false)}/>
              <div style={{ position:"absolute", right:0, top:"calc(100% + 8px)", background:"#161412", border:`1px solid ${HAIR}`, borderRadius:14, padding:16, zIndex:20, minWidth:200, boxShadow:"0 8px 32px rgba(0,0,0,.5)" }}>
                <p style={{ fontSize:10.5, fontWeight:700, color:INK_M, margin:"0 0 10px", textTransform:"uppercase", letterSpacing:"0.08em" }}>Type</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {[["tous","Tous"],["album","Albums"],["single","Singles"],["compilation","Compilations"]].map(([v,l]) => (
                    <button key={v} onClick={() => { setFiltreType(v); setFiltreOuvert(false); }} style={{
                      padding:"5px 12px", borderRadius:999, fontSize:12, fontWeight:500, cursor:"pointer", border:`1px solid ${filtreType===v ? INK : HAIR}`, outline:"none",
                      background: filtreType===v ? INK : SURF2,
                      color:      filtreType===v ? BG  : INK_S,
                    }}>{l}</button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {vue === "mois" && (
        <MonthView
          joursSemaine={joursSemaine} isMobile={isMobile} genererJours={genererJours}
          moisActuel={moisActuel} aujourdHui={aujourdHui} artisteChoisi={artisteChoisi}
          toutesSorties={toutesSorties} sortiesGlobales={sortiesGlobales}
          nextRelease={nextRelease} onSelectEvents={onSelectEvents}
        />
      )}

      {vue === "semaine" && (
        <WeekView
          debutSemaineVue={debutSemaineVue} aujourdHui={aujourdHui}
          joursSemaine={joursSemaine} sortiesGlobales={sortiesGlobales}
        />
      )}

      {vue === "agenda" && (
        <AgendaView agendaGroups={agendaGroups} aujourdHui={aujourdHui} isMobile={isMobile} />
      )}
    </>
  );
};

ArtistsTab.propTypes = {
  isMobile: PropTypes.bool.isRequired,
  utilisateur: PropTypes.object,
  isDemo: PropTypes.bool.isRequired,
  chargementCalendrier: PropTypes.bool.isRequired,
  upcomingThisMonth: PropTypes.number.isRequired,
  cetteSemagineReleases: PropTypes.array.isRequired,
  vue: PropTypes.string.isRequired,
  setVue: PropTypes.func.isRequired,
  moisActuel: PropTypes.object.isRequired,
  setMoisActuel: PropTypes.func.isRequired,
  moisPrecedent: PropTypes.func.isRequired,
  moisSuivant: PropTypes.func.isRequired,
  allerAujourdHui: PropTypes.func.isRequired,
  aujourdHui: PropTypes.object.isRequired,
  filtreOuvert: PropTypes.bool.isRequired,
  setFiltreOuvert: PropTypes.func.isRequired,
  filtreType: PropTypes.string.isRequired,
  setFiltreType: PropTypes.func.isRequired,
  featuredRelease: PropTypes.object,
  featuredIsUpcoming: PropTypes.bool.isRequired,
  countdown: PropTypes.object.isRequired,
  setOngletActif: PropTypes.func.isRequired,
  joursSemaine: PropTypes.array.isRequired,
  genererJours: PropTypes.array.isRequired,
  artisteChoisi: PropTypes.object,
  toutesSorties: PropTypes.array.isRequired,
  sortiesGlobales: PropTypes.array.isRequired,
  nextRelease: PropTypes.object,
  onSelectEvents: PropTypes.func.isRequired,
  debutSemaineVue: PropTypes.object.isRequired,
  agendaGroups: PropTypes.array.isRequired,
};

export default ArtistsTab;
