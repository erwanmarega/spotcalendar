import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { checkTokens } from "../api";
import dayjs from "dayjs";
import "dayjs/locale/fr";

dayjs.locale("fr");

const BG    = "#000000";
const SURF  = "rgba(255,255,255,0.05)";
const SURF2 = "rgba(255,255,255,0.08)";
const HAIR  = "rgba(255,255,255,0.10)";
const HAIR2 = "rgba(255,255,255,0.16)";
const INK   = "#ffffff";
const INK_S = "rgba(255,255,255,0.74)";
const INK_M = "rgba(255,255,255,0.46)";
const INK_F = "rgba(255,255,255,0.30)";
const AM_PINK = "#fa2d6e";
const AM_RED  = "#fa233b";
const AM_CORAL= "#ff5e57";
const AM_PURP = "#c34bff";
const AM_GRAD = `linear-gradient(135deg, ${AM_PINK} 0%, ${AM_RED} 52%, ${AM_CORAL} 100%)`;

const SF = `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", "Segoe UI", sans-serif`;

const MINI_CELLS = [
  { d:"",   bars:[] },         { d:"",   bars:[] },        { d:"1",  bars:[] },
  { d:"2",  bars:[] },         { d:"3",  bars:[AM_PINK] }, { d:"4",  bars:[] },
  { d:"5",  bars:[] },         { d:"6",  bars:[] },        { d:"7",  bars:[AM_CORAL] },
  { d:"8",  bars:[] },         { d:"9",  bars:[] },        { d:"10", bars:[AM_PURP] },
  { d:"11", bars:[] },         { d:"12", bars:[] },        { d:"13", bars:[] },
  { d:"14", bars:[] },         { d:"15", bars:[AM_RED] },  { d:"16", bars:[AM_CORAL] },
  { d:"17", bars:[] },         { d:"18", bars:[AM_PINK] }, { d:"19", bars:[] },
  { d:"20", bars:[] },         { d:"21", bars:[AM_PURP] }, { d:"22", bars:[] },
  { d:"23", bars:[] },         { d:"24", bars:[AM_RED] },  { d:"25", bars:[] },
  { d:"26", bars:[] },         { d:"27", bars:[] },        { d:"28", bars:[AM_PINK,AM_CORAL] },
];

const LoginApple = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [erreur, setErreur] = useState(location.state?.error || null);
  const [chargement, setChargement] = useState(false);
  const [heure, setHeure] = useState(() => dayjs().format("HH:mm"));

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

  useEffect(() => {
    if (window.MusicKit || document.getElementById("musickit-js")) return;
    const s = document.createElement("script");
    s.id = "musickit-js";
    s.src = "https://js-cdn.music.apple.com/musickit/v3/musickit.js";
    s.async = true;
    document.head.appendChild(s);
  }, []);

  const gererConnexion = async () => {
    setErreur(null);
    setChargement(true);
    try {
      if (!window.MusicKit) throw new Error("MusicKit n'est pas encore chargé, réessaie.");

      navigate("/calendar/apple");
    } catch (e) {
      setErreur(e.message || "Connexion impossible.");
    } finally {
      setChargement(false);
    }
  };

  const today = String(dayjs().date());

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:${BG};font-family:${SF};color:${INK};-webkit-font-smoothing:antialiased}
        @keyframes float-card{0%,100%{transform:rotate(4deg) translateY(0)}50%{transform:rotate(4deg) translateY(-7px)}}
        @keyframes pulse-dot{0%,100%{box-shadow:0 0 0 0 rgba(250,35,59,.5)}60%{box-shadow:0 0 0 5px rgba(250,35,59,0)}}
        @keyframes glow-drift{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(8%,-6%) scale(1.12)}66%{transform:translate(-6%,7%) scale(.95)}}
        .login-btn-apple:hover{filter:brightness(1.07)!important;transform:translateY(-1px)!important;box-shadow:0 22px 44px -16px rgba(250,35,59,.62)!important}
        @media(max-width:860px){.login-shell{grid-template-columns:1fr!important}.login-scene{display:none!important}}
        @media(max-width:560px){.login-shell{padding:0!important;gap:0!important}.login-form-side{min-height:100vh;padding:48px 24px 32px!important;align-items:flex-start!important}}
      `}</style>

      <div className="login-shell" style={{
        display:"grid", gridTemplateColumns:"1fr 1fr",
        minHeight:"100vh", padding:14, gap:14, background:BG,
      }}>

        <aside className="login-scene" style={{
          borderRadius:24, padding:28, overflow:"hidden", position:"relative",
          display:"flex", flexDirection:"column", justifyContent:"space-between",
          background:"#070708",
          border:`1px solid ${HAIR}`,
        }}>
          <div style={{
            position:"absolute", top:"8%", left:"18%", width:340, height:340, borderRadius:"50%",
            background:`radial-gradient(circle, ${AM_PINK}66 0%, transparent 70%)`,
            filter:"blur(46px)", pointerEvents:"none", animation:"glow-drift 9s ease-in-out infinite",
          }}/>
          <div style={{
            position:"absolute", bottom:"6%", right:"12%", width:300, height:300, borderRadius:"50%",
            background:`radial-gradient(circle, ${AM_PURP}55 0%, transparent 70%)`,
            filter:"blur(52px)", pointerEvents:"none", animation:"glow-drift 11s ease-in-out infinite reverse",
          }}/>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative", zIndex:2 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:9, background:AM_GRAD, display:"grid", placeItems:"center", flexShrink:0, boxShadow:`0 6px 18px -6px ${AM_RED}` }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill={INK}>
                  <path d="M16.5 3.2 9 4.8c-.5.1-.8.5-.8 1v9.5a3 3 0 1 0 1.5 2.6V8.3l6-1.3v5.4a3 3 0 1 0 1.5 2.6V4.2c0-.7-.6-1.1-1.2-1z"/>
                </svg>
              </div>
              <span style={{ fontWeight:600, fontSize:15, color:INK, letterSpacing:"-0.01em" }}>SpotCalendar</span>
            </div>
            <span style={{ fontVariantNumeric:"tabular-nums", fontSize:12, color:INK_M, letterSpacing:"0.04em" }}>{heure}</span>
          </div>

          <div style={{ position:"relative", flex:1, display:"flex", alignItems:"center", justifyContent:"center", margin:"28px 0 20px", zIndex:2 }}>

            <div style={{
              position:"absolute", top:-10, left:-4, zIndex:4,
              transform:"rotate(-4deg)",
              display:"flex", alignItems:"center",
              background:SURF2, border:`1px solid ${HAIR2}`, borderRadius:999,
              padding:"5px 14px 5px 5px", backdropFilter:"blur(18px)", WebkitBackdropFilter:"blur(18px)",
              boxShadow:"0 4px 18px rgba(0,0,0,.5)",
            }}>
              {[AM_PINK, AM_CORAL, AM_PURP].map((c,i) => (
                <div key={i} style={{ width:26, height:26, borderRadius:"50%", background:`linear-gradient(135deg,${c},${c}99)`, border:`2px solid #0b0b0c`, marginLeft: i===0?0:-8, flexShrink:0 }}/>
              ))}
              <span style={{ fontSize:11.5, fontWeight:500, color:INK_S, marginLeft:8, whiteSpace:"nowrap" }}>3 sorties en cours</span>
            </div>

            <div style={{
              transform:"rotate(-3deg)", position:"relative", zIndex:2,
              background:SURF, border:`1px solid ${HAIR2}`, borderRadius:18,
              padding:14, width:248, backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
              boxShadow:"0 16px 48px rgba(0,0,0,.6)",
            }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <span style={{ fontSize:13, fontWeight:600, color:INK, textTransform:"capitalize", letterSpacing:"-0.01em" }}>
                  {dayjs().format("MMMM YYYY")}
                </span>
                <div style={{ display:"flex", gap:4 }}>
                  {[AM_PINK, AM_RED, AM_PURP].map((c,i) => <span key={i} style={{ width:5, height:5, borderRadius:"50%", background:c }}/>)}
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
                      borderRadius:5, padding:"4px 2px 3px", minHeight:26,
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"space-between", gap:2,
                      background: isToday ? "rgba(250,45,110,.16)" : isWeekend ? "rgba(255,255,255,.02)" : SURF,
                      border: isToday ? "1px solid rgba(250,45,110,.4)" : `1px solid ${HAIR}`,
                    }}>
                      <span style={{ fontSize:8, fontWeight: isToday ? 700 : 400, color: isToday ? AM_PINK : cell.d ? INK_S : "transparent" }}>{cell.d || "·"}</span>
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
              background:SURF2, border:`1px solid ${HAIR2}`, borderRadius:16,
              padding:"12px 14px", width:184, backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
              boxShadow:"0 20px 48px rgba(0,0,0,.7)",
            }}>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <div style={{ width:38, height:38, borderRadius:9, background:AM_GRAD, flexShrink:0, boxShadow:`0 8px 20px -6px ${AM_RED}` }}/>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:11.5, fontWeight:600, color:INK, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>New Album</div>
                  <div style={{ fontSize:10, color:INK_M }}>Artiste · Vendredi</div>
                </div>
              </div>
              <div style={{ marginTop:10, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <span style={{ fontSize:24, fontWeight:600, color:INK, lineHeight:1, letterSpacing:"-0.02em" }}>3</span>
                  <div style={{ fontSize:9, color:INK_M, marginTop:1 }}>jours</div>
                </div>
                <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:9.5, fontWeight:700, color:AM_CORAL, background:"rgba(250,35,59,.16)", border:"1px solid rgba(250,35,59,.3)", borderRadius:999, padding:"3px 9px" }}>
                  <span style={{ width:5, height:5, borderRadius:"50%", background:AM_CORAL, animation:"pulse-dot 2s ease-in-out infinite", display:"inline-block" }}/>
                  Bientôt
                </span>
              </div>
            </div>
          </div>
        </aside>

        <main className="login-form-side" style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"32px 24px" }}>
          <div style={{ width:"100%", maxWidth:400 }}>

            <div style={{ display:"inline-flex", alignItems:"center", gap:8, fontSize:11.5, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.1em", color:INK_M, marginBottom:22 }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:AM_PINK, flexShrink:0 }}/>
              Connexion · Bêta
            </div>

            <h1 style={{ fontSize:"clamp(28px,3.5vw,42px)", fontWeight:600, letterSpacing:"-0.03em", lineHeight:1.08, marginBottom:14, color:INK }}>
              Tes sorties,{" "}
              <span style={{ background:AM_GRAD, WebkitBackgroundClip:"text", backgroundClip:"text", WebkitTextFillColor:"transparent" }}>au bon moment.</span>
            </h1>

            <p style={{ fontSize:15, color:INK_M, lineHeight:1.6, marginBottom:32 }}>
              Suis tes artistes Apple Music et retrouve toutes leurs sorties organisées dans un calendrier. Gratuit, en lecture seule.
            </p>

            {erreur && (
              <div style={{ background:"rgba(250,35,59,.12)", border:"1px solid rgba(250,35,59,.3)", borderRadius:12, padding:"10px 14px", marginBottom:18 }}>
                <p style={{ color:"#ff8a93", fontSize:13, margin:0 }}>{erreur}</p>
              </div>
            )}

            <button onClick={gererConnexion} disabled={chargement} className="login-btn-apple" style={{
              width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:12,
              padding:"15px 24px", borderRadius:14, border:"none", cursor: chargement ? "default" : "pointer",
              background:AM_GRAD, color:INK, opacity: chargement ? .7 : 1,
              fontSize:15.5, fontWeight:600, letterSpacing:"-0.01em",
              boxShadow:"0 18px 36px -14px rgba(250,35,59,.55)",
              transition:"filter .18s,transform .18s,box-shadow .18s",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink:0 }}>
                <path d="M17.4 3.1 9.2 4.85c-.62.13-1 .6-1 1.22v9.78a3.4 3.4 0 1 0 1.7 2.95V8.36l6.6-1.42v5.6a3.4 3.4 0 1 0 1.7 2.95V4.3c0-.83-.72-1.38-1.5-1.2z"/>
              </svg>
              {chargement ? "Connexion…" : "Se connecter avec Apple Music"}
            </button>

            <p style={{ fontSize:12.5, color:INK_F, textAlign:"center", marginTop:14, lineHeight:1.5 }}>
              Tu utilises Spotify ?{" "}
              <a href="/login" style={{ color:INK_M, textDecoration:"none", borderBottom:`1px solid ${HAIR2}` }}>Connexion Spotify</a>
            </p>

            <div style={{ background:SURF, border:`1px solid ${HAIR}`, borderRadius:14, overflow:"hidden", marginTop:28 }}>
              {[
                { text:"Accès en lecture seule", svg:<path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/> },
                { text:"Aucune donnée sensible stockée", svg:<><rect x="8" y="2" width="8" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.6" fill="none"/><path d="M5 4H4a2 2 0 00-2 2v13a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none"/></> },
              ].map(({ text, svg }, i, arr) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderBottom: i < arr.length-1 ? `1px solid ${HAIR}` : "none" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" style={{ color:AM_PINK, flexShrink:0 }}>{svg}</svg>
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

export default LoginApple;
