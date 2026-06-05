import PropTypes from "prop-types";
import { Cover } from "./primitives";
import { BG, SURF, SURF2, HAIR2, INK, INK_S, INK_M, GREEN, getGrad } from "./theme";

const SECTIONS = [
  { label:"À venir", upcoming:true },
  { label:"Passées", upcoming:false },
];

const EventPopup = ({ evenementsSelectionnes, aujourdHui, popupRef, artisteChoisi, onClose, handleSpotifyLinkClick }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50, padding:16 }}>
    <div ref={popupRef} tabIndex={-1} style={{ background:SURF, borderRadius:20, width:"100%", maxWidth:380, overflow:"hidden", outline:"none" }}>
      <div style={{ position:"relative", height:160, overflow:"hidden", background:getGrad(evenementsSelectionnes[0].artiste) }}>
        {evenementsSelectionnes[0].image && <img src={evenementsSelectionnes[0].image} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} loading="lazy"/>}
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(22,20,18,1) 0%,rgba(22,20,18,.5) 50%,transparent 100%)" }}/>
        <button onClick={onClose} style={{ position:"absolute", top:12, right:12, width:28, height:28, display:"grid", placeItems:"center", background:"rgba(0,0,0,.4)", borderRadius:"50%", border:"none", color:INK, cursor:"pointer", fontSize:12 }}>✕</button>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"0 20px 16px" }}>
          <h3 style={{ fontWeight:700, fontSize:14, margin:"0 0 2px", textTransform:"capitalize" }}>{evenementsSelectionnes[0].date.format("dddd D MMMM YYYY")}</h3>
          <p style={{ color:INK_S, fontSize:11, margin:0 }}>{evenementsSelectionnes.length} sortie{evenementsSelectionnes.length>1?"s":""}</p>
        </div>
      </div>
      <div style={{ maxHeight:"45vh", overflowY:"auto", padding:"12px" }}>
        {SECTIONS.map(section => {
          const filtered = evenementsSelectionnes.filter(e => e.date.isAfter(aujourdHui) === section.upcoming);
          if (!filtered.length) return null;
          return (
            <div key={section.label} style={{ marginBottom:12 }}>
              <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:section.upcoming?GREEN:INK_M, padding:"0 8px 8px", margin:0 }}>{section.label}</p>
              {filtered.map((ev, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"8px", borderRadius:10, transition:"background .15s" }}
                  onMouseEnter={e=>e.currentTarget.style.background=SURF2} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <Cover name={ev.artiste} image={ev.image} size={36} radius={6} style={{ opacity:section.upcoming?1:0.6 }}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <a href={ev.lienSpotify} target="_blank" rel="noopener noreferrer" onClick={()=>handleSpotifyLinkClick(ev.titre)}
                      style={{ fontSize:14, fontWeight:500, color:section.upcoming?INK:INK_S, textDecoration:"none", display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ev.titre}</a>
                    {!artisteChoisi && ev.artiste && <span style={{ fontSize:11, color:INK_M }}>{ev.artiste}</span>}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <div style={{ padding:"12px 20px 16px", borderTop:`1px solid ${HAIR2}` }}>
        <button onClick={onClose} style={{ width:"100%", background:INK, color:BG, fontSize:14, fontWeight:700, padding:"10px 0", borderRadius:999, border:"none", cursor:"pointer" }}>Fermer</button>
      </div>
    </div>
  </div>
);

EventPopup.propTypes = {
  evenementsSelectionnes: PropTypes.array.isRequired,
  aujourdHui: PropTypes.object.isRequired,
  popupRef: PropTypes.object.isRequired,
  artisteChoisi: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  handleSpotifyLinkClick: PropTypes.func.isRequired,
};

export default EventPopup;
