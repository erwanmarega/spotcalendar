import { useState, useEffect } from "react";
import { getSmartReleases } from "../api";

const SURF  = "#161412";
const SURF2 = "#1d1a17";
const SURF3 = "#26221d";
const HAIR  = "#2a2622";
const HAIR2 = "#1f1c19";
const INK   = "#f4ede0";
const INK_S = "#c9bfa9";
const INK_M = "#7c7468";
const GREEN = "#1db954";
const PEACH = "#f0c294";

const COVER_GRADS = [
  "linear-gradient(135deg,#f0c294,#8b4a2f)",
  "linear-gradient(135deg,#b4a4d6,#4a3a78)",
  "linear-gradient(135deg,#e89aa3,#8b3a45)",
  "linear-gradient(135deg,#91b6d1,#2c5478)",
  "linear-gradient(135deg,#e8b864,#8a6420)",
  "linear-gradient(135deg,#c98a55,#5c2f15)",
  "linear-gradient(135deg,#2a2622,#c98a55)",
  "linear-gradient(135deg,#4a443c,#1a1814)",
];
const getGrad = (seed) => {
  const code = typeof seed === "string" ? (seed.charCodeAt(0) || 0) : (seed || 0);
  return COVER_GRADS[Math.abs(code) % COVER_GRADS.length];
};

const SOURCE_BADGE = {
  followed: { label:"Suivi",        color:GREEN,    bg:"rgba(29,185,84,.15)",    border:"rgba(29,185,84,.28)"    },
  top:      { label:"Top écouté",   color:PEACH,    bg:"rgba(240,194,148,.15)",  border:"rgba(240,194,148,.28)"  },
  both:     { label:"Suivi · Top",  color:"#e8d08a",bg:"rgba(232,208,138,.12)", border:"rgba(232,208,138,.25)" },
};

function formatType(type) {
  return type === "album" ? "Album" : type === "single" ? "Single" : type === "compilation" ? "Compilation" : type;
}
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("fr-FR", { day:"2-digit", month:"short", year:"numeric" });
}

const DEMO_RELEASES = [
  { albumId:"sd1", artiste:"Drake",          titre:"Certified Lover Boy II",     type:"album",  date:"2026-04-02", source:"followed", image:null, lienSpotify:"#" },
  { albumId:"sd2", artiste:"Taylor Swift",   titre:"The Tortured Poets Vol. 2",  type:"album",  date:"2026-04-05", source:"both",     image:null, lienSpotify:"#" },
  { albumId:"sd3", artiste:"The Weeknd",     titre:"Midnight Sun",               type:"single", date:"2026-04-10", source:"top",      image:null, lienSpotify:"#" },
  { albumId:"sd4", artiste:"Daft Punk",      titre:"Random Access Memories II",  type:"album",  date:"2026-04-14", source:"both",     image:null, lienSpotify:"#" },
  { albumId:"sd5", artiste:"Rosalía",        titre:"MOTOMAMI 2",                 type:"album",  date:"2026-04-18", source:"followed", image:null, lienSpotify:"#" },
  { albumId:"sd6", artiste:"Billie Eilish",  titre:"HIT ME HARD AND SOFT 2",     type:"album",  date:"2026-04-25", source:"top",      image:null, lienSpotify:"#" },
  { albumId:"sd7", artiste:"Kendrick Lamar", titre:"GNX Deluxe",                 type:"album",  date:"2026-04-28", source:"followed", image:null, lienSpotify:"#" },
];

const FILTRES = [
  { id:"tous",     label:"Tous" },
  { id:"followed", label:"Suivis" },
  { id:"top",      label:"Top écoutés" },
  { id:"both",     label:"Les deux" },
];

const SmartReleases = ({ isDemo = false }) => {
  const [releases, setReleases] = useState(isDemo ? DEMO_RELEASES : []);
  const [loading, setLoading]   = useState(!isDemo);
  const [error, setError]       = useState(null);
  const [filtre, setFiltre]     = useState("tous");

  useEffect(() => {
    if (isDemo) {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
      fetch(`${API_BASE_URL}/api/demo-data`)
        .then(r => r.json())
        .then(data => {
          if (!data.artists) return;
          const imageMap = Object.fromEntries(data.artists.filter(a => a.image).map(a => [a.name, a.image]));
          setReleases(prev => prev.map(r => ({ ...r, image: imageMap[r.artiste] || r.image })));
        })
        .catch(() => {});
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getSmartReleases()
      .then(data => { if (!cancelled) setReleases(data); })
      .catch(e   => { if (!cancelled) setError(e.message || "Une erreur est survenue."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isDemo]);

  const releasesFiltrees = filtre === "tous" ? releases : releases.filter(r => r.source === filtre);

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontFamily:'"Fraunces",serif', fontWeight:400, fontSize:26, margin:"0 0 4px", letterSpacing:"-0.02em", color:INK }}>Découvertes</h2>
        <p style={{ color:INK_M, fontSize:13.5, margin:0 }}>
          Nouvelles sorties de tes artistes suivis et de ceux que tu écoutes en boucle.
        </p>
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:24, flexWrap:"wrap" }}>
        {FILTRES.map(({ id, label }) => (
          <button key={id} onClick={() => setFiltre(id)} style={{
            padding:"7px 14px", borderRadius:999, fontSize:12.5, fontWeight:600, cursor:"pointer",
            background: filtre===id ? INK : SURF2,
            color:      filtre===id ? "#0c0b0a" : INK_S,
            border:     `1px solid ${filtre===id ? INK : HAIR}`,
            outline:"none", transition:"background .15s,color .15s",
          }}>
            {label}
            {id !== "tous" && !loading && (
              <span style={{ marginLeft:6, opacity:0.5, fontWeight:400 }}>
                {releases.filter(r => r.source === id).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12 }}>
          {[...Array(6)].map((_,i) => (
            <div key={i} style={{ background:SURF2, borderRadius:14, padding:14, display:"flex", gap:14 }}>
              <div style={{ width:64, height:64, borderRadius:8, background:SURF3, flexShrink:0 }}/>
              <div style={{ flex:1, display:"flex", flexDirection:"column", gap:8, paddingTop:4 }}>
                <div style={{ height:9,  width:"30%", background:SURF3, borderRadius:4 }}/>
                <div style={{ height:11, width:"55%", background:SURF3, borderRadius:4 }}/>
                <div style={{ height:9,  width:"70%", background:SURF3, borderRadius:4 }}/>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div style={{ padding:16, background:"rgba(180,60,60,.12)", border:"1px solid rgba(180,60,60,.3)", borderRadius:12 }}>
          <p style={{ color:"#e08080", fontSize:13, margin:0 }}>{error}</p>
        </div>
      ) : releasesFiltrees.length === 0 ? (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"80px 0", gap:10, textAlign:"center" }}>
          <p style={{ fontFamily:'"Fraunces",serif', fontWeight:400, fontSize:22, color:INK_S, fontStyle:"italic", margin:0 }}>Rien pour le moment…</p>
          <p style={{ color:INK_M, fontSize:13, margin:0 }}>Aucune sortie trouvée pour cette catégorie.</p>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12 }}>
          {releasesFiltrees.map((release, i) => {
            const badge = SOURCE_BADGE[release.source] || SOURCE_BADGE.followed;
            return (
              <a key={i} href={release.lienSpotify} target="_blank" rel="noopener noreferrer"
                style={{ display:"flex", gap:14, padding:14, background:SURF2, border:`1px solid ${HAIR2}`, borderRadius:14, textDecoration:"none", color:"inherit", transition:"background .15s,border-color .15s" }}
                onMouseEnter={e => { e.currentTarget.style.background=SURF3; e.currentTarget.style.borderColor=HAIR; }}
                onMouseLeave={e => { e.currentTarget.style.background=SURF2; e.currentTarget.style.borderColor=HAIR2; }}
              >
                <div style={{ width:64, height:64, borderRadius:8, flexShrink:0, overflow:"hidden", background:getGrad(release.artiste), position:"relative" }}>
                  {release.image
                    ? <img src={release.image} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }} loading="lazy"/>
                    : <span style={{ position:"absolute", inset:0, display:"grid", placeItems:"center", fontFamily:'"Fraunces",serif', fontSize:28, color:"rgba(0,0,0,.45)", fontWeight:500 }}>{release.artiste[0]}</span>
                  }
                </div>

                <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", justifyContent:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4, flexWrap:"wrap" }}>
                    <span style={{ fontSize:11, fontWeight:500, color:INK_M, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{release.artiste}</span>
                    <span style={{ fontFamily:'"JetBrains Mono",monospace', fontSize:9.5, padding:"2px 6px", borderRadius:999, flexShrink:0, fontWeight:600, letterSpacing:"0.03em", color:badge.color, background:badge.bg, border:`1px solid ${badge.border}` }}>
                      {badge.label}
                    </span>
                  </div>
                  <p style={{ fontSize:13.5, fontWeight:500, color:INK, margin:"0 0 3px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{release.titre}</p>
                  <p style={{ fontSize:11, color:INK_M, margin:0 }}>{formatType(release.type)} · {formatDate(release.date)}</p>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SmartReleases;
