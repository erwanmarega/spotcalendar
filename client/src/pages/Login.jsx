import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { checkTokens } from "../api";
import dayjs from "dayjs";
import "dayjs/locale/fr";

dayjs.locale("fr");

const BG    = "#0c0b0a";
const SURF  = "#161412";
const SURF2 = "#1d1a17";
const SURF3 = "#26221d";
const HAIR  = "#2a2622";
const INK   = "#f4ede0";
const INK_S = "#c9bfa9";
const INK_M = "#7c7468";
const INK_F = "#4a443c";
const GREEN = "#1db954";
const PEACH = "#f0c294";
const LAVENDER = "#b4a4d6";
const POWDER = "#91b6d1";
const ROSE  = "#e89aa3";
const AMBER = "#e8b864";

const MINI_CELLS = [
  { d:"",   bars:[] },         { d:"",   bars:[] },        { d:"1",  bars:[] },
  { d:"2",  bars:[] },         { d:"3",  bars:[PEACH] },   { d:"4",  bars:[] },
  { d:"5",  bars:[] },         { d:"6",  bars:[] },        { d:"7",  bars:[GREEN] },
  { d:"8",  bars:[] },         { d:"9",  bars:[] },        { d:"10", bars:[LAVENDER] },
  { d:"11", bars:[] },         { d:"12", bars:[] },        { d:"13", bars:[] },
  { d:"14", bars:[] },         { d:"15", bars:[ROSE] },    { d:"16", bars:[POWDER] },
  { d:"17", bars:[] },         { d:"18", bars:[AMBER] },   { d:"19", bars:[] },
  { d:"20", bars:[] },         { d:"21", bars:[GREEN] },   { d:"22", bars:[] },
  { d:"23", bars:[] },         { d:"24", bars:[LAVENDER] },{ d:"25", bars:[] },
  { d:"26", bars:[] },         { d:"27", bars:[] },        { d:"28", bars:[PEACH,ROSE] },
];

const Login = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const messageErreur = location.state?.error || null;
  const [heure, setHeure] = useState(() => dayjs().format("HH:mm"));

  const idClient      = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const uriRedirection = import.meta.env.VITE_REDIRECT_URI;
  const permissions   = [
    "user-follow-read","user-read-recently-played",
    "user-read-private","user-read-email","user-top-read",
  ];
  const urlAuth = idClient && uriRedirection
    ? `https://accounts.spotify.com/authorize?${new URLSearchParams({ response_type:"code", client_id:idClient, scope:permissions.join(" "), redirect_uri:uriRedirection, show_dialog:"true" })}`
    : "";

  useEffect(() => {
    const id = setInterval(() => setHeure(dayjs().format("HH:mm")), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (location.state?.fromLogout) return;
    checkTokens()
      .then(data => {
        if (data.access_token_exists && data.expires_at && Date.now() < parseInt(data.expires_at))
          navigate("/calendar");
      })
      .catch(() => {});
  }, [navigate, location]);

  const gererConnexion = () => {
    if (!urlAuth) return;
    const state = crypto.randomUUID();
    sessionStorage.setItem("oauth_state", state);
    window.location.href = `${urlAuth}&${new URLSearchParams({ state })}`;
  };

  if (!idClient || !uriRedirection) {
    return <div style={{ color:"#e08080", textAlign:"center", padding:32 }}>Erreur de configuration.</div>;
  }

  const today = String(dayjs().date());

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@1,9..144,400;1,9..144,500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=JetBrains+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:${BG};font-family:'DM Sans',sans-serif;color:${INK}}
        @keyframes float-card{0%,100%{transform:rotate(4deg) translateY(0)}50%{transform:rotate(4deg) translateY(-7px)}}
        @keyframes pulse-dot{0%,100%{box-shadow:0 0 0 0 rgba(29,185,84,.5)}60%{box-shadow:0 0 0 5px rgba(29,185,84,0)}}
        .login-btn-spotify:hover{background:#1ec85d!important;transform:translateY(-1px)!important;box-shadow:0 22px 40px -16px rgba(29,185,84,.6)!important}
        .scene-stat:not(:last-child){border-right:1px solid ${HAIR};padding-right:20px;margin-right:0}
        @media(max-width:860px){.login-shell{grid-template-columns:1fr!important}.login-scene{display:none!important}}
        @media(max-width:560px){.login-shell{padding:0!important;gap:0!important}.login-form-side{min-height:100vh;padding:48px 24px 32px!important;align-items:flex-start!important}}
      `}</style>

      <div className="login-shell" style={{
        display:"grid", gridTemplateColumns:"1fr 1fr",
        minHeight:"100vh", padding:14, gap:14, background:BG,
      }}>

        <aside className="login-scene" style={{
          borderRadius:22, padding:28, overflow:"hidden", position:"relative",
          display:"flex", flexDirection:"column", justifyContent:"space-between",
          background:`radial-gradient(ellipse at 30% 18%, rgba(240,194,148,.11) 0%, transparent 55%),
                      radial-gradient(ellipse at 72% 82%, rgba(29,185,84,.08) 0%, transparent 50%), ${SURF2}`,
          border:`1px solid ${HAIR}`,
        }}>
          <div style={{ position:"absolute", inset:0, pointerEvents:"none", borderRadius:22, opacity:.35,
            backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.05'/%3E%3C/svg%3E")`,
            backgroundSize:"140px",
          }}/>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative", zIndex:2 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:8, background:GREEN, display:"grid", placeItems:"center", flexShrink:0 }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="2" y="4" width="14" height="12" rx="2" stroke={BG} strokeWidth="1.6"/>
                  <path d="M5 2v4M13 2v4M2 8h14" stroke={BG} strokeWidth="1.6" strokeLinecap="round"/>
                  <circle cx="6" cy="12" r="1.2" fill={BG}/><circle cx="9" cy="12" r="1.2" fill={BG}/>
                </svg>
              </div>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:15, color:INK, letterSpacing:"-0.01em" }}>SpotCalendar</span>
            </div>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:INK_M, letterSpacing:"0.06em" }}>{heure}</span>
          </div>

          <div style={{ position:"relative", flex:1, display:"flex", alignItems:"center", justifyContent:"center", margin:"28px 0 20px" }}>

            <div style={{
              position:"absolute", top:-10, left:-4, zIndex:4,
              transform:"rotate(-4deg)",
              display:"flex", alignItems:"center",
              background:SURF, border:`1px solid ${HAIR}`, borderRadius:999,
              padding:"5px 14px 5px 5px",
              boxShadow:"0 4px 18px rgba(0,0,0,.45)",
            }}>
              {[PEACH, ROSE, LAVENDER].map((c,i) => (
                <div key={i} style={{ width:26, height:26, borderRadius:"50%", background:`linear-gradient(135deg,${c},${c}99)`, border:`2px solid ${SURF}`, marginLeft: i===0?0:-8, flexShrink:0 }}/>
              ))}
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5, fontWeight:500, color:INK_S, marginLeft:8, whiteSpace:"nowrap" }}>3 sorties en cours</span>
            </div>

            <div style={{
              transform:"rotate(-3deg)", position:"relative", zIndex:2,
              background:SURF, border:`1px solid ${HAIR}`, borderRadius:16,
              padding:14, width:248,
              boxShadow:"0 16px 48px rgba(0,0,0,.55)",
            }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <span style={{ fontFamily:"'Fraunces',serif", fontSize:13, fontWeight:400, color:INK, textTransform:"capitalize", letterSpacing:"-0.01em" }}>
                  {dayjs().format("MMMM YYYY")}
                </span>
                <div style={{ display:"flex", gap:4 }}>
                  {[PEACH, GREEN, LAVENDER].map((c,i) => <span key={i} style={{ width:5, height:5, borderRadius:"50%", background:c }}/>)}
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:3 }}>
                {["L","M","M","J","V","S","D"].map((d,i) => (
                  <div key={i} style={{ fontSize:8, fontWeight:700, color:INK_M, textAlign:"center", textTransform:"uppercase", letterSpacing:"0.08em", paddingBottom:3 }}>{d}</div>
                ))}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
                {MINI_CELLS.map((cell, i) => {
                  const isToday = cell.d === today;
                  const isWeekend = (i % 7) >= 5;
                  return (
                    <div key={i} style={{
                      borderRadius:4, padding:"4px 2px 3px", minHeight:26,
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"space-between", gap:2,
                      background: isToday ? "rgba(240,194,148,.14)" : isWeekend ? BG : SURF2,
                      border: isToday ? "1px solid rgba(240,194,148,.32)" : `1px solid ${HAIR}`,
                    }}>
                      <span style={{ fontSize:8, fontWeight: isToday ? 700 : 400, color: isToday ? PEACH : cell.d ? INK_S : "transparent" }}>{cell.d || "·"}</span>
                      <div style={{ display:"flex", gap:1, width:"100%", justifyContent:"center" }}>
                        {cell.bars.map((c,j) => <div key={j} style={{ flex:1, height:2.5, borderRadius:2, background:c, maxWidth:12 }}/>)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{
              position:"absolute", bottom:0, right:-12, zIndex:4,
              transform:"rotate(4deg)",
              animation:"float-card 4s ease-in-out infinite",
              background:SURF3, border:`1px solid ${HAIR}`, borderRadius:14,
              padding:"12px 14px", width:184,
              boxShadow:"0 20px 48px rgba(0,0,0,.65)",
            }}>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <div style={{ width:38, height:38, borderRadius:8, background:`linear-gradient(135deg,${GREEN},${PEACH})`, flexShrink:0 }}/>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:11.5, fontWeight:600, color:INK, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>New Album</div>
                  <div style={{ fontSize:10, color:INK_M }}>Artiste · Vendredi</div>
                </div>
              </div>
              <div style={{ marginTop:10, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <span style={{ fontFamily:"'Fraunces',serif", fontSize:24, fontWeight:400, color:INK, lineHeight:1 }}>3</span>
                  <div style={{ fontSize:9, color:INK_M, marginTop:1 }}>jours</div>
                </div>
                <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:9.5, fontWeight:700, color:GREEN, background:"rgba(29,185,84,.14)", border:"1px solid rgba(29,185,84,.28)", borderRadius:999, padding:"3px 9px" }}>
                  <span style={{ width:5, height:5, borderRadius:"50%", background:GREEN, animation:"pulse-dot 2s ease-in-out infinite", display:"inline-block" }}/>
                  Bientôt
                </span>
              </div>
            </div>
          </div>
        </aside>

        <main className="login-form-side" style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"32px 24px" }}>
          <div style={{ width:"100%", maxWidth:400 }}>

            <div style={{ display:"inline-flex", alignItems:"center", gap:8, fontSize:11.5, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.1em", color:INK_M, marginBottom:22 }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:PEACH, flexShrink:0 }}/>
              Connexion · Bêta
            </div>

            <h1 style={{ fontSize:"clamp(28px,3.5vw,42px)", fontWeight:600, letterSpacing:"-0.025em", lineHeight:1.1, marginBottom:14, color:INK }}>
              Tes sorties,{" "}
              <em style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic", fontWeight:400, color:PEACH }}>au bon moment.</em>
            </h1>

            <p style={{ fontSize:15, color:INK_M, lineHeight:1.65, marginBottom:32 }}>
              Suis tes artistes Spotify et retrouve toutes leurs sorties organisées dans un calendrier. Gratuit, en lecture seule.
            </p>

            {messageErreur && (
              <div style={{ background:"rgba(180,60,60,.12)", border:"1px solid rgba(180,60,60,.28)", borderRadius:10, padding:"10px 14px", marginBottom:18 }}>
                <p style={{ color:"#e08a8a", fontSize:13, margin:0 }}>{messageErreur}</p>
              </div>
            )}

            <button onClick={gererConnexion} className="login-btn-spotify" style={{
              width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:12,
              padding:"15px 24px", borderRadius:14, border:"none", cursor:"pointer",
              background:GREEN, color:BG,
              fontSize:15.5, fontWeight:700, letterSpacing:"-0.01em",
              boxShadow:"0 18px 36px -14px rgba(29,185,84,.5)",
              transition:"background .18s,transform .18s,box-shadow .18s",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink:0 }}>
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              Se connecter avec Spotify
            </button>

            <p style={{ fontSize:12.5, color:INK_F, textAlign:"center", marginTop:14, lineHeight:1.5 }}>
              Apple Music arrive dans quelques semaines.
            </p>

            <div style={{ background:SURF, border:`1px solid ${HAIR}`, borderRadius:14, overflow:"hidden", marginTop:28 }}>
              {[
                { text:"Accès en lecture seule", svg:<path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/> },
                { text:"Aucune donnée sensible stockée", svg:<><rect x="8" y="2" width="8" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.6" fill="none"/><path d="M5 4H4a2 2 0 00-2 2v13a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none"/></> },
              ].map(({ text, svg }, i, arr) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderBottom: i < arr.length-1 ? `1px solid ${HAIR}` : "none" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" style={{ color:PEACH, flexShrink:0 }}>{svg}</svg>
                  <span style={{ fontSize:13, color:INK_S }}>{text}</span>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:24, gap:12 }}>
              <a href="/" style={{ fontSize:12.5, color:INK_M, textDecoration:"none", display:"inline-flex", alignItems:"center", gap:5, transition:"color .15s" }}
                onMouseEnter={e=>e.currentTarget.style.color=INK_S}
                onMouseLeave={e=>e.currentTarget.style.color=INK_M}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 2.5L4 6l3.5 3.5"/></svg>
                Retour à l'accueil
              </a>
              <a href="/privacy" style={{ fontSize:12, color:INK_F, textDecoration:"none" }}
                onMouseEnter={e=>e.currentTarget.style.color=INK_M}
                onMouseLeave={e=>e.currentTarget.style.color=INK_F}
              >Confidentialité</a>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Login;
