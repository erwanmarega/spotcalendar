import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { checkTokens } from "../api";

const Landing = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkTokens()
      .then((data) => {
        if (data.access_token_exists && data.expires_at && Date.now() < parseInt(data.expires_at)) {
          setIsLoggedIn(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleAppleClick = () => {
    toast("Apple Music arrive bientôt !", {
      position: "bottom-center",
      autoClose: 3000,
      hideProgressBar: true,
      style: {
        background: "#1a1a1a",
        color: "#fff",
        border: "1px solid #333",
        borderRadius: "12px",
        fontFamily: '"DM Sans", sans-serif',
      },
    });
  };

  return (
    <div
      className="min-h-screen bg-white text-[#1a1a1a]"
      style={{ fontFamily: '"DM Sans", system-ui, -apple-system, sans-serif', WebkitFontSmoothing: "antialiased" }}
    >
      <ToastContainer />
      <div className="max-w-[1240px] mx-auto px-10 max-md:px-4">

        {/* HEADER */}
        <header className="flex items-center justify-between pt-7">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2.5 font-bold text-[18px] tracking-tight"
          >
            <span
              className="relative w-7 h-7 bg-[#1a1a1a] rounded-[7px] grid place-items-center flex-shrink-0"
              style={{ boxShadow: "inset 0 -3px 0 rgba(255,255,255,.08)" }}
            >
              <span className="absolute -top-[3px] left-[6px] right-[6px] h-[5px] border-l-2 border-r-2 border-[#1a1a1a]" />
              <span className="w-1.5 h-1.5 bg-[#f6d3b8] rounded-full" />
            </span>
            <span>
              <span className="text-[#1a1a1a]">Spot</span>
              <span className="text-[#8a857f] font-semibold">Calendar</span>
            </span>
          </button>

          <nav className="flex items-center gap-8 text-[14.5px] text-[#4b4744] max-md:hidden">
            <a href="#features" className="hover:text-[#1a1a1a] transition-colors">Fonctionnalités</a>
            <button
              onClick={() => navigate(isLoggedIn ? "/calendar" : "/login")}
              className="border border-[#ece7df] px-3.5 py-2 rounded-full bg-white font-medium text-[#1a1a1a] hover:bg-[#fbf8f3] hover:border-[#ddd5c7] transition-all"
            >
              {isLoggedIn ? "Mon calendrier" : "Se connecter"}
            </button>
          </nav>
        </header>

        <div
          className="relative mt-7 rounded-[32px] overflow-hidden max-md:rounded-[22px]"
          style={{
            background: "#fbf5ea",
            boxShadow: "0 1px 0 rgba(40,30,20,.04), 0 30px 60px -30px rgba(40,30,20,.18)",
            isolation: "isolate",
          }}
        >
          <div
            aria-hidden="true"
            className="absolute top-0 bottom-0 right-0 w-1/2 z-0 max-md:w-full max-md:bg-[center_95%] max-md:[background-size:160%_auto] max-md:bg-no-repeat"
            style={{
              backgroundImage: "url('/hero-lofi.png')",
              backgroundSize: "cover",
              backgroundPosition: "72% center",
              WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 18%, #000 100%)",
              maskImage: "linear-gradient(90deg, transparent 0%, #000 18%, #000 100%)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 z-[1] max-md:hidden"
            style={{
              background: "linear-gradient(90deg, #fbf5ea 0%, #fbf5ea 38%, rgba(251,245,234,0) 60%)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 z-[1] hidden max-md:block"
            style={{
              background: "linear-gradient(180deg, rgba(255,253,248,.96) 0%, rgba(255,253,248,.85) 38%, rgba(255,253,248,.45) 55%, rgba(255,253,248,0) 70%)",
            }}
          />

          <section
            className="relative z-[2] grid grid-cols-2 px-16 py-[88px] min-h-[600px] max-md:grid-cols-1 max-md:px-6 max-md:pt-10 max-md:pb-[360px] max-md:min-h-0"
          >
            <div className="max-w-[480px]">
              <div className="inline-flex items-center gap-2.5 text-[12.5px] tracking-[0.08em] uppercase text-[#8a857f] font-medium mb-7">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#1db954] flex-shrink-0"
                  style={{ boxShadow: "0 0 0 4px rgba(29,185,84,.15)" }}
                />
                Beta · Rejoins les premiers mélomanes
              </div>

              <h1
                className="font-bold leading-[1.05] tracking-[-0.035em] mb-6"
                style={{ fontFamily: '"DM Sans", sans-serif', fontSize: "clamp(36px, 4vw, 56px)" }}
              >
                Tes artistes sortent<br />
                quelque chose. Sois<br />
                <em style={{ fontFamily: '"Fraunces", serif', fontStyle: "italic", fontWeight: 400 }}>le premier</em>{" "}
                <span className="relative whitespace-nowrap">
                  à le savoir.
                  <span
                    className="absolute left-0 right-0 bottom-[0.02em] rounded-[3px] -z-[1]"
                    style={{ height: "0.32em", background: "#f6d3b8", opacity: 0.8 }}
                  />
                </span>
              </h1>

              <p className="text-[18px] leading-[1.55] text-[#4b4744] max-w-[460px] mb-9">
                SpotCalendar synchronise ta bibliothèque musicale et te prévient dès qu'un album,
                un single ou un EP arrive. Plus aucune sortie manquée — un calendrier rien que pour ton oreille.
              </p>

              <div className="flex items-end gap-3 flex-wrap">
                <button
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center gap-3 px-[22px] py-[14px] rounded-full text-[15px] font-semibold text-white transition-all hover:-translate-y-px active:translate-y-0 whitespace-nowrap"
                  style={{
                    background: "#1db954",
                    boxShadow: "0 1px 0 rgba(0,0,0,.06), 0 12px 24px -10px rgba(29,185,84,.5)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#169c46")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#1db954")}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <circle cx="9" cy="9" r="9" fill="#fff"/>
                    <path d="M4 7.2c2.8-.9 7-.6 9.5.8" stroke="#1db954" strokeWidth="1.7" strokeLinecap="round"/>
                    <path d="M4.6 10c2.3-.7 5.8-.5 7.8.7" stroke="#1db954" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M5.3 12.5c1.8-.5 4.5-.4 6.1.6" stroke="#1db954" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  Continuer avec Spotify
                </button>

                <div className="inline-flex flex-col items-end gap-1.5">
                  <span className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-[#fc3c44] bg-[#ffe9eb] px-2.5 py-[3px] rounded-full mr-2.5">
                    Bientôt
                  </span>
                  <button
                    onClick={handleAppleClick}
                    className="inline-flex items-center gap-3 px-[22px] py-[14px] rounded-full text-[15px] font-semibold text-[#fc3c44] bg-white border border-[#f6d2d4] transition-all hover:-translate-y-px hover:bg-[#fff5f5] active:translate-y-0 whitespace-nowrap"
                    style={{ boxShadow: "0 1px 0 rgba(0,0,0,.02), 0 6px 16px -10px rgba(252,60,68,.3)" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <rect x="2" y="2" width="12" height="12" rx="3" fill="#fc3c44"/>
                      <circle cx="6.4" cy="10" r="1.4" fill="#fff"/>
                      <circle cx="10.6" cy="9" r="1.4" fill="#fff"/>
                      <path d="M7.8 10V5.4l4.2-1V8.6" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Continuer avec Apple Music
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2.5 mt-6 text-[#8a857f] text-[13px]">
                <span className="inline-flex">
                  {[{ bg: "#f6d3b8" }, { bg: "#d8d2ef" }, { bg: "#c9dceb" }, { bg: "#b4c9a5" }].map((dot, i) => (
                    <span
                      key={i}
                      className="w-[22px] h-[22px] rounded-full border-2 border-white inline-block"
                      style={{ background: dot.bg, marginLeft: i === 0 ? 0 : "-6px" }}
                    />
                  ))}
                </span>
                <span>Gratuit pendant la beta · Aucune carte requise</span>
              </div>
            </div>

            <div
              aria-hidden="true"
              className="absolute top-16 right-14 bg-white rounded-[14px] p-2 pr-3.5 flex items-center gap-2.5 z-[5] border border-[#ece7df] whitespace-nowrap max-md:hidden"
              style={{ boxShadow: "0 1px 0 rgba(40,30,20,.04), 0 10px 30px -12px rgba(40,30,20,.12)", transform: "rotate(-3deg)" }}
            >
              <div
                className="w-[38px] h-[38px] rounded-lg relative overflow-hidden flex-shrink-0"
                style={{ background: "radial-gradient(circle at 30% 30%, #f6d3b8 0%, #fc3c44 90%)" }}
              >
                <span
                  className="absolute rounded-full bg-white"
                  style={{ inset: "30%", boxShadow: "inset 0 0 0 2px #fc3c44" }}
                />
              </div>
              <div className="flex flex-col leading-[1.2]">
                <b className="text-[12.5px] font-semibold">Nouveau single</b>
                <span className="text-[10.5px] text-[#8a857f]">Demain · 00:00</span>
              </div>
            </div>

            <div
              aria-hidden="true"
              className="absolute bottom-20 right-20 bg-white border border-[#ece7df] rounded-[14px] px-3.5 py-2.5 flex items-center gap-2.5 z-[5] whitespace-nowrap max-md:hidden"
              style={{ boxShadow: "0 1px 0 rgba(40,30,20,.04), 0 10px 30px -12px rgba(40,30,20,.12)", transform: "rotate(3deg)" }}
            >
              <span
                className="w-2 h-2 rounded-full bg-[#1db954] flex-shrink-0"
                style={{ boxShadow: "0 0 0 3px rgba(29,185,84,.18)" }}
              />
              <div className="flex flex-col leading-[1.2]">
                <b className="text-[12.5px] font-semibold">Vendredi 22</b>
                <span className="text-[10.5px] text-[#8a857f]">3 sorties prévues</span>
              </div>
            </div>
          </section>
        </div>

        <section id="features" className="pt-24 pb-20 border-t border-[#f3efe8]">
          <div className="flex items-end justify-between mb-14 gap-10 max-md:flex-col max-md:items-start">
            <h2
              className="font-semibold tracking-[-0.025em] leading-[1.15] m-0 max-w-[560px]"
              style={{ fontSize: "clamp(28px, 2.8vw, 38px)" }}
            >
              Une oreille attentive,<br />
              <em style={{ fontFamily: '"Fraunces", serif', fontWeight: 400, fontStyle: "italic", color: "#8a857f" }}>sans effort.</em>
            </h2>
            <p className="text-[#8a857f] text-[15px] max-w-[320px] m-0">
              Connecte ton compte, et laisse SpotCalendar faire le reste. On t'évite la veille manuelle et les notifications inutiles.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 max-md:grid-cols-1">
            <div
              className="bg-[#fbf8f3] border border-[#f3efe8] rounded-3xl p-7 flex flex-col gap-4 min-h-[240px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className="w-12 h-12 rounded-[14px] grid place-items-center border"
                style={{ background: "linear-gradient(135deg, #fff, #f6d3b8)", borderColor: "#f1d9bc" }}
              >
                <div className="relative w-6 h-6">
                  {[{ top: "2px", left: "7px", bg: "#1a1a1a" }, { bottom: 0, left: "1px", bg: "#6f8b62" }, { bottom: 0, right: "1px", bg: "#b07ab8" }].map((s, i) => (
                    <span key={i} className="absolute w-2.5 h-2.5 rounded-full" style={{ background: s.bg, top: s.top, left: s.left, bottom: s.bottom, right: s.right }} />
                  ))}
                </div>
              </div>
              <h3 className="text-[17px] font-semibold tracking-[-0.01em] m-0">Artistes suivis</h3>
              <p className="text-[#4b4744] text-[14.5px] m-0 leading-relaxed">
                On récupère automatiquement les artistes que tu écoutes le plus. Tu gardes la main pour en ajouter ou en retirer.
              </p>
              <span className="mt-auto text-[11px] text-[#8a857f] tracking-[0.05em]" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                01 — Sync
              </span>
            </div>

            <div
              className="bg-[#fbf8f3] border border-[#f3efe8] rounded-3xl p-7 flex flex-col gap-4 min-h-[240px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className="w-12 h-12 rounded-[14px] grid place-items-center border"
                style={{ background: "linear-gradient(135deg, #fff, #d8d2ef)", borderColor: "#d6cee9" }}
              >
                <div className="relative w-6 h-6 border-2 border-[#1a1a1a] rounded-[5px]">
                  <span className="absolute -top-1 left-0 right-0 border-t-2 border-[#1a1a1a]" />
                  <span className="absolute bottom-[3px] left-[3px] w-1.5 h-1.5 bg-[#fc3c44] rounded-sm" />
                </div>
              </div>
              <h3 className="text-[17px] font-semibold tracking-[-0.01em] m-0">Calendrier personnalisé</h3>
              <p className="text-[#4b4744] text-[14.5px] m-0 leading-relaxed">
                Toutes les sorties à venir, vue mois ou agenda. Filtrable par genre, par artiste, ou par type — album, EP, single.
              </p>
              <span className="mt-auto text-[11px] text-[#8a857f] tracking-[0.05em]" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                02 — Plan
              </span>
            </div>

            <div
              className="bg-[#fbf8f3] border border-[#f3efe8] rounded-3xl p-7 flex flex-col gap-4 min-h-[240px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className="w-12 h-12 rounded-[14px] grid place-items-center border"
                style={{ background: "linear-gradient(135deg, #fff, #c9dceb)", borderColor: "#c5d6e3" }}
              >
                <div className="relative w-[22px] h-[22px]">
                  <span className="absolute top-[2px] left-[3px] w-4 h-3.5 bg-[#1a1a1a] rounded-[50%_50%_8px_8px]" />
                  <span className="absolute bottom-0 left-[9px] w-1 h-[3px] bg-[#1a1a1a] rounded-b-full" />
                  <span
                    className="absolute top-0 right-0 w-[7px] h-[7px] bg-[#fc3c44] rounded-full"
                    style={{ boxShadow: "0 0 0 2px #fbf8f3" }}
                  />
                </div>
              </div>
              <h3 className="text-[17px] font-semibold tracking-[-0.01em] m-0">Sorties manquées</h3>
              <p className="text-[#4b4744] text-[14.5px] m-0 leading-relaxed">
                Une notification douce le jour J — et un récap hebdo des releases que tu n'aurais pas dû rater.
              </p>
              <span className="mt-auto text-[11px] text-[#8a857f] tracking-[0.05em]" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                03 — Ping
              </span>
            </div>
          </div>
        </section>

        <footer className="border-t border-[#f3efe8] py-8 flex justify-between items-center text-[#8a857f] text-[13px] gap-4 flex-wrap">
          <div className="flex items-center gap-3.5">
            <span
              className="relative w-5 h-5 bg-[#1a1a1a] rounded-[5px] grid place-items-center flex-shrink-0"
            >
              <span className="w-1 h-1 bg-[#f6d3b8] rounded-full" />
            </span>
            <span className="font-semibold text-[#4b4744]">SpotCalendar</span>
            <span>© 2026</span>
          </div>
          <div className="flex gap-5 flex-wrap">
            <button
              onClick={() => navigate("/privacy")}
              className="hover:text-[#1a1a1a] transition-colors"
            >
              Politique de confidentialité
            </button>
            <a href="mailto:maregaerwan@gmail.com" className="hover:text-[#1a1a1a] transition-colors">Contact</a>
            <span>Made with ♡ in Paris</span>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default Landing;
