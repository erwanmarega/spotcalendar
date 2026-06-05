import PropTypes from "prop-types";
import { Cover } from "./primitives";
import { getWhenLabel, typeLabel } from "./helpers";
import { SURF, SURF2, SURF3, HAIR, INK_F, INK_M, GREEN, INK_S } from "./theme";

const WeekPanel = ({ cetteSemagineReleases, aujourdHui, onVoirTout }) => (
  <div style={{ background:SURF2, borderRadius:18, border:`1px solid ${HAIR}`, padding:18, display:"flex", flexDirection:"column", gap:10 }}>
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingBottom:6 }}>
      <b style={{ fontSize:13, fontWeight:600 }}>
        Cette semaine{" "}
        <em style={{ fontFamily:'"Fraunces",serif', fontStyle:"italic", color:INK_M, fontWeight:400, fontSize:12 }}>
          {cetteSemagineReleases.length > 0 ? `· ${cetteSemagineReleases.length} sortie${cetteSemagineReleases.length>1?"s":""}` : "· rien cette semaine"}
        </em>
      </b>
      <button onClick={onVoirTout} style={{ fontSize:11.5, color:INK_M, background:"none", border:"none", cursor:"pointer" }}>Voir tout →</button>
    </div>
    {cetteSemagineReleases.length > 0 ? (
      <div style={{ display:"flex", flexDirection:"column", gap:4, overflowY:"auto", maxHeight:170 }}>
        {cetteSemagineReleases.map((s, i) => {
          const isPast = s.date.isBefore(aujourdHui, "day");
          const isToday = s.date.isSame(aujourdHui, "day");
          const when = getWhenLabel(s.date, aujourdHui);
          return (
            <a key={i} href={s.lienSpotify} target="_blank" rel="noopener noreferrer"
              style={{ display:"flex", alignItems:"center", gap:12, padding:8, borderRadius:10, cursor:"pointer", transition:"background .15s", textDecoration:"none", color:"inherit", opacity: isPast ? 0.6 : 1 }}
              onMouseEnter={e => e.currentTarget.style.background=SURF3}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}
            >
              <Cover name={s.artiste} image={s.image} size={36} radius={6} />
              <div style={{ flex:1, minWidth:0 }}>
                <b style={{ display:"block", fontSize:12.5, fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{s.titre}</b>
                <span style={{ display:"block", fontSize:11, color:INK_M }}>{s.artiste} · {typeLabel(s.type)}</span>
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
);

WeekPanel.propTypes = {
  cetteSemagineReleases: PropTypes.array.isRequired,
  aujourdHui: PropTypes.object.isRequired,
  onVoirTout: PropTypes.func.isRequired,
};

export default WeekPanel;
