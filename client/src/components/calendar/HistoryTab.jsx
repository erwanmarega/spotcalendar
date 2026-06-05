import PropTypes from "prop-types";
import { Avatar } from "./primitives";
import { typeLabel } from "./helpers";
import { SURF2, SURF3, HAIR, HAIR2, INK, INK_S, INK_M, getGrad } from "./theme";

const SELECTS = [
  { key:"type",    opts:[["tous","Tous"],["album","Albums"],["single","Singles"],["compilation","Compilations"],["appears_on","Feats"]] },
  { key:"periode", opts:[[1,"1 mois"],[3,"3 mois"],[6,"6 mois"],[12,"12 mois"]] },
  { key:"tri",     opts:[["date-desc","Récent d'abord"],["date-asc","Ancien d'abord"],["title-asc","A→Z"],["title-desc","Z→A"]] },
];

const HistoryTab = ({
  artisteChoisi, artistes, chargement, sortiesFiltreesEtTriees,
  filtreType, setFiltreType, filtrePeriode, setFiltrePeriode, triHistorique, setTriHistorique,
  onBack, onSelectArtiste, handleSpotifyLinkClick,
}) => {
  const selValues = { type:filtreType, periode:filtrePeriode, tri:triHistorique };
  const selSetters = {
    type:setFiltreType,
    periode:v=>setFiltrePeriode(Number(v)),
    tri:setTriHistorique,
  };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
        {artisteChoisi && (
          <button onClick={onBack}
            style={{ width:34, height:34, display:"grid", placeItems:"center", borderRadius:"50%", background:SURF2, border:`1px solid ${HAIR}`, color:INK_S, cursor:"pointer", fontSize:16, flexShrink:0 }}>←</button>
        )}
        <div style={{ flex:1, minWidth:0 }}>
          <h2 style={{ fontFamily:'"Fraunces",serif', fontWeight:400, fontSize:26, margin:"0 0 2px", letterSpacing:"-0.02em", color:INK }}>
            {artisteChoisi ? artisteChoisi.name : "Historique"}
          </h2>
          {!artisteChoisi && <p style={{ color:INK_M, fontSize:13.5, margin:0 }}>Explorez les sorties de chacun de vos artistes</p>}
        </div>
        {artisteChoisi && <Avatar name={artisteChoisi.name} image={artisteChoisi.images?.[0]?.url} size={40} style={{ flexShrink:0 }}/>}
      </div>

      {artisteChoisi ? (
        <div>
          <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
            {SELECTS.map(sel => (
              <select key={sel.key} value={selValues[sel.key]} onChange={e=>selSetters[sel.key](e.target.value)}
                style={{ padding:"7px 14px", background:SURF2, border:`1px solid ${HAIR}`, borderRadius:999, fontSize:12.5, color:INK_S, cursor:"pointer", outline:"none", fontWeight:500 }}>
                {sel.opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            ))}
          </div>

          {chargement ? (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:14 }}>
              {[...Array(8)].map((_,i) => (
                <div key={i} style={{ background:SURF2, borderRadius:14, padding:14 }}>
                  <div style={{ aspectRatio:"1/1", background:SURF3, borderRadius:10, marginBottom:12 }}/>
                  <div style={{ height:10, background:SURF3, borderRadius:4, width:"70%", marginBottom:7 }}/>
                  <div style={{ height:8,  background:SURF3, borderRadius:4, width:"50%" }}/>
                </div>
              ))}
            </div>
          ) : sortiesFiltreesEtTriees.length ? (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:14 }}>
              {sortiesFiltreesEtTriees.map((s,i) => (
                <a key={i} href={s.lienSpotify} target="_blank" rel="noopener noreferrer" onClick={()=>handleSpotifyLinkClick(s.titre)}
                  style={{ display:"block", background:SURF2, border:`1px solid ${HAIR2}`, borderRadius:14, padding:14, textDecoration:"none", transition:"background .15s,border-color .15s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.background=SURF3; e.currentTarget.style.borderColor=HAIR; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background=SURF2; e.currentTarget.style.borderColor=HAIR2; }}
                >
                  <div style={{ aspectRatio:"1/1", background:getGrad(s.titre), borderRadius:10, marginBottom:12, overflow:"hidden", position:"relative" }}>
                    {s.image && <img src={s.image} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }} loading="lazy"/>}
                  </div>
                  <p style={{ fontSize:13, fontWeight:500, color:INK, margin:"0 0 4px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.titre}</p>
                  <p style={{ fontSize:11, color:INK_M, margin:0 }}>{s.date.format("DD/MM/YY")} · {typeLabel(s.type)}</p>
                </a>
              ))}
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 0", gap:8, textAlign:"center" }}>
              <p style={{ fontFamily:'"Fraunces",serif', fontWeight:400, fontSize:20, color:INK_S, fontStyle:"italic", margin:0 }}>Rien ici…</p>
              <p style={{ color:INK_M, fontSize:13, margin:0 }}>Aucune sortie pour ces filtres.</p>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:12 }}>
          {artistes.map(a => (
            <button key={a.id} onClick={() => onSelectArtiste(a)}
              style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10, padding:"18px 14px 14px", background:SURF2, border:`1px solid ${HAIR2}`, borderRadius:16, cursor:"pointer", transition:"background .15s,border-color .15s", outline:"none" }}
              onMouseEnter={e=>{ e.currentTarget.style.background=SURF3; e.currentTarget.style.borderColor=HAIR; }}
              onMouseLeave={e=>{ e.currentTarget.style.background=SURF2; e.currentTarget.style.borderColor=HAIR2; }}
            >
              <Avatar name={a.name} image={a.images?.[0]?.url} size={60}/>
              <div style={{ textAlign:"center", width:"100%" }}>
                <p style={{ fontSize:13, fontWeight:500, color:INK, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.name}</p>
                {a.genres?.[0] && <p style={{ fontSize:10.5, color:INK_M, margin:"3px 0 0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", textTransform:"capitalize" }}>{a.genres[0]}</p>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

HistoryTab.propTypes = {
  artisteChoisi: PropTypes.object,
  artistes: PropTypes.array.isRequired,
  chargement: PropTypes.bool.isRequired,
  sortiesFiltreesEtTriees: PropTypes.array.isRequired,
  filtreType: PropTypes.string.isRequired,
  setFiltreType: PropTypes.func.isRequired,
  filtrePeriode: PropTypes.number.isRequired,
  setFiltrePeriode: PropTypes.func.isRequired,
  triHistorique: PropTypes.string.isRequired,
  setTriHistorique: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onSelectArtiste: PropTypes.func.isRequired,
  handleSpotifyLinkClick: PropTypes.func.isRequired,
};

export default HistoryTab;
