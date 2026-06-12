import PropTypes from "prop-types";
import { SURF, SURF2, SURF3, HAIR, HAIR2, INK, INK_S, INK_M, GREEN } from "./theme";

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>
  </svg>
);

const Settings = ({ modalRef, mode, onSetMode, onClose }) => {
  const options = [
    { value: "dark",  label: "Sombre", Icon: MoonIcon },
    { value: "light", label: "Clair",  Icon: SunIcon },
  ];

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:60, padding:16 }} onClick={onClose}>
      <div ref={modalRef} tabIndex={-1} style={{ background:SURF, borderRadius:20, width:"100%", maxWidth:420, overflow:"hidden", outline:"none", border:`1px solid ${HAIR2}` }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:`1px solid ${HAIR2}` }}>
          <div>
            <h3 style={{ fontWeight:700, fontSize:16, margin:"0 0 2px", color:INK }}>Paramètres</h3>
            <p style={{ color:INK_M, fontSize:12, margin:0 }}>Préférences de l&apos;application</p>
          </div>
          <button onClick={onClose} aria-label="Fermer" style={{ width:36, height:36, display:"grid", placeItems:"center", background:SURF2, borderRadius:"50%", border:`1px solid ${HAIR}`, color:INK_S, cursor:"pointer" }}>✕</button>
        </div>

        <div style={{ padding:20 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
            <div>
              <b style={{ fontSize:13.5, fontWeight:600, display:"block", color:INK }}>Apparence</b>
              <span style={{ fontSize:12, color:INK_M }}>Mode sombre ou clair</span>
            </div>
            <div style={{ display:"flex", gap:4, background:SURF2, border:`1px solid ${HAIR}`, borderRadius:999, padding:3, flexShrink:0 }}>
              {options.map(({ value, label, Icon }) => {
                const active = mode === value;
                return (
                  <button
                    key={value}
                    onClick={() => onSetMode(value)}
                    aria-pressed={active}
                    style={{
                      display:"inline-flex", alignItems:"center", gap:7, padding:"7px 14px", borderRadius:999,
                      fontSize:12.5, fontWeight:600, cursor:"pointer", border:"none", transition:"all .18s",
                      background: active ? GREEN : "transparent",
                      color: active ? "#000" : INK_S,
                    }}
                  >
                    <Icon/>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop:18, padding:"12px 14px", background:SURF3, borderRadius:12, border:`1px solid ${HAIR}` }}>
            <span style={{ fontSize:11.5, color:INK_M, lineHeight:1.5 }}>
              Le thème est enregistré sur cet appareil et s&apos;applique aux deux calendriers.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

Settings.propTypes = {
  modalRef: PropTypes.object,
  mode: PropTypes.oneOf(["dark", "light"]).isRequired,
  onSetMode: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Settings;
