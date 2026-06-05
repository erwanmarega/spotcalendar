import PropTypes from "prop-types";
import { SURF, SURF2, SURF3, HAIR, HAIR2, INK, INK_M } from "./theme";

export const TABS = [
  { id:"artists",    label:"Calendrier" },
  { id:"découvertes",label:"Découvertes" },
  { id:"history",    label:"Historique" },
  { id:"genres",     label:"Genres" },
];

export const TopTabs = ({ ongletActif, setOngletActif }) => (
  <div style={{ position:"sticky", top:0, zIndex:10, background:SURF, padding:"16px 28px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, borderBottom:`1px solid ${HAIR2}` }}>
    <div style={{ display:"flex", gap:2, background:SURF2, border:`1px solid ${HAIR}`, borderRadius:10, padding:3 }}>
      {TABS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => setOngletActif(id)}
          style={{
            padding:"7px 14px", borderRadius:7, fontSize:13, fontWeight:500, border:"none", cursor:"pointer",
            background: ongletActif===id ? SURF3 : "transparent",
            color: ongletActif===id ? INK : INK_M,
            boxShadow: ongletActif===id ? "0 1px 2px rgba(0,0,0,.3)" : "none",
            transition:"all .15s",
          }}
        >{label}</button>
      ))}
    </div>
  </div>
);

TopTabs.propTypes = {
  ongletActif: PropTypes.string.isRequired,
  setOngletActif: PropTypes.func.isRequired,
};

export const BottomNav = ({ ongletActif, setOngletActif }) => (
  <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t flex" style={{ background:"rgba(12,11,10,.95)", backdropFilter:"blur(12px)", borderColor:HAIR2 }}>
    {TABS.map(({ id, label }) => (
      <button key={id} onClick={() => setOngletActif(id)}
        style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:3, padding:"10px 0", color:ongletActif===id?INK:INK_M, background:"none", border:"none", cursor:"pointer", fontSize:10, fontWeight:ongletActif===id?600:400 }}>
        {label}
      </button>
    ))}
  </div>
);

BottomNav.propTypes = {
  ongletActif: PropTypes.string.isRequired,
  setOngletActif: PropTypes.func.isRequired,
};
