import PropTypes from "prop-types";
import { Avatar } from "./primitives";
import { SURF, SURF2, HAIR, HAIR2, INK, INK_S, INK_M, GREEN } from "./theme";

const GenreModal = ({ genreChoisi, modalRef, artisteChoisi, onClose, onSelectArtist }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50, padding:16 }} onClick={onClose}>
    <div ref={modalRef} tabIndex={-1} style={{ background:SURF, borderRadius:20, width:"100%", maxWidth:440, overflow:"hidden", outline:"none" }} onClick={e=>e.stopPropagation()}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:`1px solid ${HAIR2}` }}>
        <div>
          <h3 style={{ fontWeight:700, fontSize:16, margin:"0 0 2px", textTransform:"capitalize" }}>{genreChoisi.genre}</h3>
          <p style={{ color:INK_M, fontSize:12, margin:0 }}>{genreChoisi.artists.length} artiste{genreChoisi.artists.length>1?"s":""}</p>
        </div>
        <button onClick={onClose} style={{ width:36, height:36, display:"grid", placeItems:"center", background:SURF2, borderRadius:"50%", border:`1px solid ${HAIR}`, color:INK_S, cursor:"pointer" }}>✕</button>
      </div>
      <div style={{ maxHeight:"60vh", overflowY:"auto", padding:16 }}>
        {genreChoisi.artists.length ? (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {genreChoisi.artists.map((a,i) => {
              const sel = artisteChoisi?.id === a.id;
              return (
                <div key={i} onClick={() => onSelectArtist(a, sel)}
                  style={{ display:"flex", alignItems:"center", gap:12, padding:12, borderRadius:14, cursor:"pointer", background:sel?"rgba(29,185,84,.15)":SURF2, border:`1px solid ${sel?"rgba(29,185,84,.4)":HAIR2}`, transition:"all .15s" }}>
                  <Avatar name={a.name} image={a.images?.[0]?.url} size={40}/>
                  <span style={{ fontSize:13, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:sel?GREEN:INK }}>{a.name}</span>
                </div>
              );
            })}
          </div>
        ) : <p style={{ color:INK_M, fontSize:14, textAlign:"center", padding:"24px 0" }}>Aucun artiste trouvé.</p>}
      </div>
    </div>
  </div>
);

GenreModal.propTypes = {
  genreChoisi: PropTypes.object.isRequired,
  modalRef: PropTypes.object.isRequired,
  artisteChoisi: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSelectArtist: PropTypes.func.isRequired,
};

export default GenreModal;
