import PropTypes from "prop-types";
import { Cover } from "./primitives";
import { typeLabel } from "./helpers";
import { BG, SURF3, HAIR, INK, INK_S, INK_M, INK_F, GREEN, PEACH, getGrad } from "./theme";

const FeaturedCard = ({ featuredRelease, featuredIsUpcoming, countdown }) => (
  <div className="p-4 sm:p-[22px]" style={{
    position:"relative", borderRadius:18, overflow:"hidden", minHeight:200,
    background: featuredRelease
      ? `linear-gradient(135deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,.15) 60%,rgba(0,0,0,.7) 100%),${getGrad(featuredRelease.artiste)}`
      : `linear-gradient(135deg,rgba(0,0,0,.4) 0%,rgba(0,0,0,.1) 100%),${SURF3}`,
    border:`1px solid ${HAIR}`, display:"flex", flexDirection:"column", justifyContent:"space-between",
  }}>
    <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,240,220,.04) 1px,transparent 1.2px)", backgroundSize:"4px 4px", pointerEvents:"none" }}/>
    {featuredRelease ? (
      <>
        <span style={{ display:"inline-flex", alignItems:"center", gap:8, fontSize:10.5, letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(244,237,224,.85)", fontWeight:600, position:"relative", flexWrap:"wrap" }}>
          {featuredIsUpcoming
            ? <span style={{ width:6, height:6, borderRadius:"50%", background:GREEN, boxShadow:"0 0 0 4px rgba(29,185,84,.2)", animation:"pulse 2.4s ease-in-out infinite", flexShrink:0 }}/>
            : <span style={{ width:6, height:6, borderRadius:"50%", background:PEACH, flexShrink:0 }}/>
          }
          {featuredIsUpcoming ? "Prochaine sortie" : "Sortie ce mois"} · {featuredRelease.date.format("dddd D MMMM")}
        </span>
        <div style={{ position:"relative" }}>
          <div style={{ display:"flex", gap:14, alignItems:"flex-end", marginTop:14, flexWrap:"wrap" }}>
            <Cover name={featuredRelease.artiste} image={featuredRelease.image} size={80} radius={10} style={{ boxShadow:"0 12px 30px -10px rgba(0,0,0,.6)" }}/>
            <div style={{ minWidth:0, flex:1 }}>
              <h2 className="text-[20px] sm:text-[26px]" style={{ fontFamily:'"Fraunces",serif', fontWeight:400, lineHeight:1.1, margin:"0 0 4px", letterSpacing:"-0.015em", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{featuredRelease.titre}</h2>
              <div style={{ fontSize:13, color:"rgba(244,237,224,.75)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{featuredRelease.artiste} · {typeLabel(featuredRelease.type)}</div>
            </div>
          </div>
          <div style={{ marginTop:16, display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, flexWrap:"wrap" }}>
            {featuredIsUpcoming ? (
              <div style={{ display:"flex", alignItems:"baseline", gap:5 }}>
                <span className="text-[30px] sm:text-[38px]" style={{ fontFamily:'"Fraunces",serif', fontWeight:400, lineHeight:1, color:INK }}>{countdown.days}</span>
                <span style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.08em", color:"rgba(244,237,224,.6)" }}>
                  j · {String(countdown.hours).padStart(2,"0")} h · {String(countdown.mins).padStart(2,"0")} min
                </span>
              </div>
            ) : (
              <span style={{ fontSize:12, color:"rgba(244,237,224,.55)", fontStyle:"italic" }}>Déjà sorti</span>
            )}
            <a href={featuredRelease.lienSpotify} target="_blank" rel="noopener noreferrer" style={{ padding:"9px 16px", background:"rgba(255,255,255,.94)", color:BG, borderRadius:999, fontSize:12.5, fontWeight:600, display:"inline-flex", alignItems:"center", gap:8, textDecoration:"none", flexShrink:0 }}>
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
);

FeaturedCard.propTypes = {
  featuredRelease: PropTypes.object,
  featuredIsUpcoming: PropTypes.bool.isRequired,
  countdown: PropTypes.object.isRequired,
};

export default FeaturedCard;
