import PropTypes from "prop-types";
import { Cover } from "../primitives";
import { typeLabel } from "../helpers";
import { BG, SURF2, SURF3, HAIR2, INK, INK_S, INK_M, INK_F, GREEN, PEACH } from "../theme";

const MonthView = ({
  joursSemaine, isMobile, genererJours, moisActuel, aujourdHui,
  artisteChoisi, toutesSorties, sortiesGlobales, nextRelease, onSelectEvents,
}) => (
  <>
    {!isMobile && (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <h3 style={{ fontSize:13, fontWeight:600, margin:0, color:INK_S, letterSpacing:"0.04em", textTransform:"uppercase" }}>
          Toutes les sorties · {moisActuel.format("MMMM")}
        </h3>
        <div style={{ display:"flex", alignItems:"center", gap:14, fontSize:11.5, color:INK_M }}>
          <span><span style={{ width:8, height:8, borderRadius:"50%", background:PEACH, display:"inline-block", marginRight:6, verticalAlign:"middle" }}/>Aujourd'hui</span>
          <span><span style={{ width:8, height:8, borderRadius:"50%", background:GREEN, display:"inline-block", marginRight:6, verticalAlign:"middle" }}/>Sortie</span>
        </div>
      </div>
    )}
    <div style={{ display:"grid", gridTemplateColumns:"repeat(7, minmax(0,1fr))", gap: isMobile ? 3 : 6 }}>
      {joursSemaine.map(j => (
        <div key={j} style={{ fontSize:10.5, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", color:INK_M, padding: isMobile ? "4px 2px 6px" : "6px 4px 8px", textAlign:"center" }}>
          {isMobile ? j[0] : j}
        </div>
      ))}
      {genererJours.map((jour, index) => {
        const isOutside = jour === "";
        const isWeekend = (index % 7) >= 5;
        const isToday   = jour === aujourdHui.date() && moisActuel.isSame(aujourdHui, "month");
        const sourceSorties = artisteChoisi ? toutesSorties : sortiesGlobales;
        const events = jour ? sourceSorties.filter(s => s.date.date()===jour && s.date.isSame(moisActuel,"month")) : [];
        const isFeatured = events.some(e => e.albumId === nextRelease?.albumId);
        return (
          <div key={index}
            onClick={() => { if (jour && events.length) onSelectEvents(events); }}
            role={events.length ? "button" : undefined} tabIndex={events.length ? 0 : undefined}
            onKeyDown={e => { if (events.length && (e.key==="Enter"||e.key===" ")) onSelectEvents(events); }}
            style={{
              position:"relative", minHeight: isMobile ? 48 : 110, borderRadius: isMobile ? 8 : 12,
              padding: isMobile ? "6px 4px" : 10, display:"flex", flexDirection:"column", gap: isMobile ? 4 : 6,
              overflow:"hidden", transition:"all .15s",
              background: isOutside ? "transparent" : isToday ? undefined : isWeekend ? BG : isFeatured ? "linear-gradient(135deg,rgba(232,184,100,.1),rgba(240,194,148,.05))" : SURF2,
              border: isOutside ? "1px solid transparent" : isToday ? `1px solid rgba(240,194,148,.35)` : isFeatured ? "1px solid rgba(240,194,148,.22)" : `1px solid ${HAIR2}`,
              backgroundImage: isToday ? `radial-gradient(circle at 50% 0%,rgba(240,194,148,.12) 0%,transparent 70%),${SURF2}` : undefined,
              cursor: events.length ? "pointer" : "default",
            }}
          >
            <div style={{ fontSize: isMobile ? 11 : 13, fontWeight:600, color: isOutside ? INK_F : isToday ? PEACH : INK_S, display:"flex", alignItems:"center", justifyContent: isMobile ? "center" : "space-between" }}>
              {jour || ""}
              {!isMobile && events.length > 1 && (
                <span style={{ fontSize:9.5, fontWeight:600, color:GREEN, background:"rgba(29,185,84,.14)", padding:"1px 5px", borderRadius:999, border:"1px solid rgba(29,185,84,.28)" }}>{events.length}</span>
              )}
            </div>
            {isMobile ? (
              events.length > 0 && (
                <div style={{ display:"flex", gap:3, justifyContent:"center", flexWrap:"wrap" }}>
                  {events.slice(0,3).map((ev,i) => (
                    <span key={i} style={{ width:5, height:5, borderRadius:"50%", flexShrink:0, background: isFeatured && i===0 ? PEACH : GREEN }}/>
                  ))}
                </div>
              )
            ) : (
              <>
                {events.slice(0,2).map((ev,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:5, borderRadius:7, background: isFeatured && i===0 ? "linear-gradient(90deg,rgba(240,194,148,.18),rgba(240,194,148,.05))" : SURF3, border: isFeatured && i===0 ? "1px solid rgba(240,194,148,.2)" : "none", minHeight:32 }}>
                    <Cover name={ev.artiste} image={ev.image} size={22} radius={4} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <b style={{ display:"block", fontSize:11, fontWeight:500, color:INK, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", lineHeight:1.2 }}>
                        {artisteChoisi ? ev.titre : ev.artiste}
                      </b>
                      <span style={{ display:"block", fontSize:9.5, color:INK_M, lineHeight:1.2, textTransform:"uppercase", letterSpacing:"0.04em" }}>
                        {typeLabel(ev.type)}
                      </span>
                    </div>
                  </div>
                ))}
                {events.length > 2 && <div style={{ fontSize:10.5, color:INK_M, padding:"4px 8px" }}>+ {events.length-2} autre{events.length-2>1?"s":""}</div>}
              </>
            )}
          </div>
        );
      })}
    </div>
  </>
);

MonthView.propTypes = {
  joursSemaine: PropTypes.array.isRequired,
  isMobile: PropTypes.bool.isRequired,
  genererJours: PropTypes.array.isRequired,
  moisActuel: PropTypes.object.isRequired,
  aujourdHui: PropTypes.object.isRequired,
  artisteChoisi: PropTypes.object,
  toutesSorties: PropTypes.array.isRequired,
  sortiesGlobales: PropTypes.array.isRequired,
  nextRelease: PropTypes.object,
  onSelectEvents: PropTypes.func.isRequired,
};

export default MonthView;
