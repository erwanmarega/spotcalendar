import PropTypes from "prop-types";
import { Cover } from "../primitives";
import { typeLabel } from "../helpers";
import { SURF, SURF2, SURF3, HAIR, HAIR2, INK, INK_S, INK_M, INK_F, GREEN, PEACH } from "../theme";

const AgendaView = ({ agendaGroups, aujourdHui, isMobile }) => (
  <div style={{ display:"flex", flexDirection:"column" }}>
    {agendaGroups.length === 0 ? (
      <div style={{ textAlign:"center", padding:"60px 0" }}>
        <p style={{ fontFamily:'"Fraunces",serif', fontSize:20, color:INK_S, fontStyle:"italic", margin:"0 0 6px" }}>Rien à venir…</p>
        <p style={{ fontSize:13, color:INK_M, margin:0 }}>Aucune sortie annoncée pour vos artistes.</p>
      </div>
    ) : agendaGroups.map((g, gi) => {
      const isToday = g.date.isSame(aujourdHui,"day");
      const isPast  = g.date.isBefore(aujourdHui,"day");
      return (
        <div key={gi}>
          <div style={{ display:"flex", alignItems:"center", gap:14, padding:"18px 0 8px" }}>
            <div style={{ fontFamily:'"Fraunces",serif', fontSize:isMobile?22:28, fontWeight:400, lineHeight:1, color: isToday ? PEACH : isPast ? INK_F : INK_S, minWidth:30, textAlign:"right", flexShrink:0 }}>
              {g.date.format("D")}
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color: isToday ? PEACH : INK_M, lineHeight:1.3 }}>
                {g.date.format("dddd")}
              </div>
              <div style={{ fontSize:10.5, color:INK_F }}>{g.date.format("MMMM YYYY")}</div>
            </div>
            {isToday && <span style={{ fontFamily:'"JetBrains Mono",monospace', fontSize:9.5, padding:"2px 8px", borderRadius:999, color:GREEN, background:"rgba(29,185,84,.14)", border:"1px solid rgba(29,185,84,.28)", flexShrink:0 }}>Aujourd'hui</span>}
            <div style={{ flex:1, height:1, background:HAIR2 }}/>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
            {g.items.map((r, ri) => (
              <a key={ri} href={r.lienSpotify} target="_blank" rel="noopener noreferrer"
                style={{ display:"flex", alignItems:"center", gap:14, padding:"10px 12px", borderRadius:12, background:SURF2, border:`1px solid ${HAIR2}`, textDecoration:"none", color:"inherit", opacity: isPast ? 0.5 : 1, transition:"background .15s,border-color .15s" }}
                onMouseEnter={e=>{ e.currentTarget.style.background=SURF3; e.currentTarget.style.borderColor=HAIR; }}
                onMouseLeave={e=>{ e.currentTarget.style.background=SURF2; e.currentTarget.style.borderColor=HAIR2; }}
              >
                <Cover name={r.artiste} image={r.image} size={44} radius={8}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <b style={{ display:"block", fontSize:13.5, fontWeight:500, color:INK, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.titre}</b>
                  <span style={{ display:"block", fontSize:12, color:INK_M }}>{r.artiste}</span>
                </div>
                <span style={{ fontFamily:'"JetBrains Mono",monospace', fontSize:10.5, padding:"3px 8px", borderRadius:999, color:INK_S, background:SURF, border:`1px solid ${HAIR}`, flexShrink:0 }}>
                  {typeLabel(r.type)}
                </span>
              </a>
            ))}
          </div>
        </div>
      );
    })}
  </div>
);

AgendaView.propTypes = {
  agendaGroups: PropTypes.array.isRequired,
  aujourdHui: PropTypes.object.isRequired,
  isMobile: PropTypes.bool.isRequired,
};

export default AgendaView;
