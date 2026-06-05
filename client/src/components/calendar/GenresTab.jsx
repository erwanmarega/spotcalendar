import PropTypes from "prop-types";
import { SURF2, SURF3, HAIR, INK, INK_S, INK_M, INK_F, GREEN } from "./theme";

const GenresTab = ({ chargement, donneesGenres, artistesParGenre, onSelectGenre }) => (
  <div style={{ maxWidth:640 }}>
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
            <div key={i} onClick={() => onSelectGenre({ genre, artists:artistesParGenre[genre]||[] })}
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
);

GenresTab.propTypes = {
  chargement: PropTypes.bool.isRequired,
  donneesGenres: PropTypes.object.isRequired,
  artistesParGenre: PropTypes.object.isRequired,
  onSelectGenre: PropTypes.func.isRequired,
};

export default GenresTab;
