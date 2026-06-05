import PropTypes from "prop-types";
import { Cover } from "../primitives";
import { BG, SURF2, SURF3, HAIR, HAIR2, INK, INK_S, INK_M, INK_F, PEACH } from "../theme";

const WeekView = ({ debutSemaineVue, aujourdHui, joursSemaine, sortiesGlobales }) => (
  <div style={{ display:"grid", gridTemplateColumns:"repeat(7,minmax(0,1fr))", gap:8 }}>
    {Array.from({length:7}, (_,i) => {
      const day = debutSemaineVue.add(i,"day");
      const isToday   = day.isSame(aujourdHui,"day");
      const isWeekend = i >= 5;
      const events = sortiesGlobales.filter(s => s.date.isSame(day,"day"));
      return (
        <div key={i} style={{ borderRadius:12, overflow:"hidden", border:`1px solid ${isToday ? "rgba(240,194,148,.35)" : HAIR2}`, background: isToday ? undefined : isWeekend ? BG : SURF2, backgroundImage: isToday ? `radial-gradient(circle at 50% 0%,rgba(240,194,148,.12),transparent 70%),${SURF2}` : undefined }}>
          <div style={{ padding:"10px 8px 8px", borderBottom:`1px solid ${HAIR2}`, textAlign:"center" }}>
            <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color: isToday ? PEACH : INK_M, marginBottom:4 }}>
              {joursSemaine[i]}
            </div>
            <div style={{ fontFamily:'"Fraunces",serif', fontSize:22, fontWeight:400, lineHeight:1, color: isToday ? PEACH : INK_S }}>
              {day.format("D")}
            </div>
          </div>
          <div style={{ padding:8, display:"flex", flexDirection:"column", gap:5, minHeight:80 }}>
            {events.length === 0 ? (
              <p style={{ fontSize:11, color:INK_F, textAlign:"center", padding:"16px 0", margin:0 }}>—</p>
            ) : events.map((ev, j) => (
              <a key={j} href={ev.lienSpotify} target="_blank" rel="noopener noreferrer"
                style={{ display:"flex", gap:8, padding:7, borderRadius:8, background:SURF3, textDecoration:"none", color:"inherit", transition:"background .15s" }}
                onMouseEnter={e=>e.currentTarget.style.background=HAIR}
                onMouseLeave={e=>e.currentTarget.style.background=SURF3}
              >
                <Cover name={ev.artiste} image={ev.image} size={32} radius={5}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <b style={{ display:"block", fontSize:11, fontWeight:500, color:INK, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{ev.artiste}</b>
                  <span style={{ display:"block", fontSize:9.5, color:INK_M, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{ev.titre}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      );
    })}
  </div>
);

WeekView.propTypes = {
  debutSemaineVue: PropTypes.object.isRequired,
  aujourdHui: PropTypes.object.isRequired,
  joursSemaine: PropTypes.array.isRequired,
  sortiesGlobales: PropTypes.array.isRequired,
};

export default WeekView;
