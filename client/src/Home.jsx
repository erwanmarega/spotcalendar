import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./assets/my-calendar.png";

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("section-visible");
          }
        });
      },
      { threshold: 0.12 }
    );
    document
      .querySelectorAll(".scroll-section")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">
      <div className="fixed inset-0 -z-10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#050f07" />
              <stop offset="100%" stopColor="#0d2416" />
            </linearGradient>
            <radialGradient id="greenGlow" cx="50%" cy="35%" r="55%">
              <stop offset="0%" stopColor="#1DB954" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#050f07" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="1440" height="900" fill="url(#skyGrad)" />
          <rect width="1440" height="900" fill="url(#greenGlow)" />
          {[
            [80, 60],
            [200, 40],
            [340, 90],
            [500, 30],
            [660, 70],
            [820, 45],
            [950, 80],
            [1100, 55],
            [1260, 35],
            [1400, 65],
            [140, 120],
            [420, 100],
            [580, 130],
            [760, 110],
            [930, 140],
            [1150, 105],
            [1330, 125],
            [50, 155],
            [300, 170],
            [700, 160],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={i % 2 === 0 ? 1.2 : 0.8}
              fill="white"
              opacity="0.6"
            />
          ))}
          <path
            d="M0,600 L120,380 L240,480 L380,270 L520,420 L640,240 L760,370 L880,250 L1000,390 L1120,260 L1260,400 L1380,300 L1440,360 L1440,900 L0,900 Z"
            fill="#0d2e1a"
          />
          <path
            d="M0,700 L100,530 L220,630 L370,430 L520,570 L660,370 L800,510 L940,410 L1080,550 L1220,450 L1360,560 L1440,510 L1440,900 L0,900 Z"
            fill="#091e11"
          />
          <path
            d="M0,900 L0,730 L160,580 L310,690 L460,530 L620,660 L770,510 L920,630 L1060,530 L1210,670 L1360,565 L1440,620 L1440,900 Z"
            fill="#040f08"
          />
          <path
            d="M0,600 L120,380 L240,480 L380,270 L520,420 L640,240 L760,370 L880,250 L1000,390 L1120,260 L1260,400 L1380,300 L1440,360"
            fill="none"
            stroke="#1DB954"
            strokeWidth="1"
            opacity="0.25"
          />
        </svg>
      </div>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 md:p-6 bg-black/30 backdrop-blur-lg shadow-lg">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="w-10 h-10 md:w-12 md:h-12" />
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
            Spotcalendar
          </h1>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a
            href="#fonctionnalités"
            className="text-gray-300 hover:text-green-400 transition-colors duration-300 font-medium"
          >
            Fonctionnalités
          </a>
          <a
            href="#gratuit"
            className="text-gray-300 hover:text-green-400 transition-colors duration-300 font-medium"
          >
            Pourquoi gratuit ?
          </a>
          <button
            onClick={handleLoginRedirect}
            className="bg-green-500 text-black font-bold py-2 px-6 rounded-full hover:bg-green-400 transition-all duration-300 shadow-lg hover:shadow-green-500/50"
          >
            Se connecter
          </button>
        </nav>
        <button
          className="md:hidden text-gray-300 focus:outline-none"
          onClick={toggleMenu}
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={
                isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>
      </header>

      {isMenuOpen && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-black/90 backdrop-blur-md p-4 md:hidden">
          <nav className="flex flex-col gap-4 text-center">
            <a
              href="#fonctionnalités"
              className="text-gray-300 hover:text-green-400 transition-colors duration-300 font-medium"
              onClick={toggleMenu}
            >
              Fonctionnalités
            </a>
            <a
              href="#gratuit"
              className="text-gray-300 hover:text-green-400 transition-colors duration-300 font-medium"
              onClick={toggleMenu}
            >
              Pourquoi gratuit ?
            </a>
            <button
              onClick={() => {
                handleLoginRedirect();
                toggleMenu();
              }}
              className="bg-green-500 text-black font-bold py-2 px-6 rounded-full hover:bg-green-400 transition-all duration-300 shadow-lg hover:shadow-green-500/50 mx-auto"
            >
              Se connecter
            </button>
          </nav>
        </div>
      )}

      <section className="relative flex flex-col items-center justify-center px-4 md:px-8 pt-24 md:pt-32 pb-16 min-h-screen text-center">
        <div className="relative max-w-2xl z-10 bg-white/10 backdrop-blur-md border border-white/30 rounded-3xl px-8 py-10 md:px-14 md:py-14 shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
          <h2 className="text-4xl sm:text-5xl md:text-3xl lg:text-4xl font-extrabold mb-8 leading-tight animate-fade-in text-white">
            Ne manquez plus rien :<br />
            Suivez vos artistes préférés
            <br />
          </h2>
          <p className="text-gray-300 text-base sm:text-lg md:text-xl mb-10 max-w-lg mx-auto animate-slide-up">
            Synchronisez vos événements avec Spotify, suivez vos artistes et
            profitez d&apos une interface fluide, sans dépenser un centime.
          </p>
          <div className="flex justify-center gap-4 animate-slide-up delay-100">
            <button
              onClick={handleLoginRedirect}
              className="bg-green-500 text-black font-bold py-3 px-6 sm:py-4 sm:px-8 rounded-full hover:bg-green-400 transition-all duration-300 shadow-lg hover:shadow-green-500/50"
            >
              Commencer maintenant
            </button>
          </div>
        </div>
      </section>

      <section
        id="fonctionnalités"
        className="scroll-section py-16 px-4 md:px-8"
      >
        <h3 className="text-3xl sm:text-4xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-white to-green-400 animate-fade-in">
          Pourquoi choisir Spotcalendar ?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {[
            {
              title: "Synchronisation Spotify",
              description:
                "Suivez les sorties et concerts de vos artistes préférés en un clin d'œil.",
            },
            {
              title: "Calendrier des sorties",
              description:
                "Retrouver en un clin d'œil les sorties de vos artistes suivis.",
            },
            {
              title: "Design futuriste",
              description:
                "Une interface fluide et intuitive qui rend la planification addictive.",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="relative bg-white/10 backdrop-blur-md border border-white/30 p-6 rounded-2xl hover:border-green-400 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              <h4 className="text-xl sm:text-2xl font-semibold mb-4 text-green-400">
                {feature.title}
              </h4>
              <p className="text-gray-300 text-sm sm:text-base">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="gratuit" className="scroll-section py-16 px-4 md:px-8">
        <h3 className="text-3xl sm:text-4xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-white to-green-400 animate-fade-in">
          Pourquoi c'est gratuit ?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {[
            {
              title: "Pour tous les fans",
              description:
                "Je crois que suivre vos artistes préférés ne devrait pas coûter cher. Spotcalendar est gratuit pour que tout le monde puisse en profiter.",
            },
            {
              title: "Soutenu par la passion",
              description:
                "Développé par un amoureux de musique, Spotcalendar est ma façon de connecter les fans à leurs artistes, sans barrières.",
            },
          ].map((reason, index) => (
            <div
              key={index}
              className="relative bg-white/10 backdrop-blur-md border border-white/30 p-6 rounded-2xl hover:border-green-400 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] text-center"
            >
              <h4 className="text-xl sm:text-2xl font-semibold mb-4 text-green-400">
                {reason.title}
              </h4>
              <p className="text-gray-300 text-sm sm:text-base">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="scroll-section py-16 px-4 md:px-8 text-center">
        <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-md border border-white/30 rounded-3xl px-8 py-10 shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
          <h3 className="text-3xl sm:text-4xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-green-400 animate-fade-in">
            Découvrez mon portfolio !
          </h3>
          <p className="text-gray-300 text-base sm:text-lg mb-8">
            Explorez mes autres projets et découvrez mon travail sur mon
            portfolio.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://ewmdev.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-black font-bold py-3 px-6 sm:px-8 rounded-full hover:bg-green-400 transition-all duration-300 shadow-lg hover:shadow-green-500/50"
            >
              Visiter mon portfolio
            </a>
          </div>
        </div>
      </section>

      <footer className="scroll-section bg-white/10 backdrop-blur-md border-t border-white/20 py-8 text-center text-gray-300">
        <p className="text-sm sm:text-base">
          © 2025 Spotcalendar. Tous droits réservés.
        </p>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap');

        body {
          font-family: 'Poppins', sans-serif;
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .scroll-section {
          opacity: 0;
          transform: translateY(50px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }

        .scroll-section.section-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .gradient-text {
          background: linear-gradient(to right, #ffffff, #10b981);
          -webkit-background-clip: text;
          background-clip: text;
          color: white; /* Couleur de secours */
          -webkit-text-fill-color: transparent;
        }

        h2 {
          line-height: 1.1; /* Réduit l'espacement entre les lignes pour un look plus compact */
        }

        @media (max-width: 1024px) {
          .md\\:text-6xl {
            font-size: 3.5rem;
          }
          .md\\:max-w-lg {
            max-width: 100%;
          }
        }

        @media (max-width: 768px) {
          .text-4xl {
            font-size: 2rem;
          }
          .text-3xl {
            font-size: 1.75rem;
          }
          .text-xl {
            font-size: 1.125rem;
          }
          .text-base {
            font-size: 0.875rem;
          }
          .max-w-7xl {
            max-width: 100%;
          }
          .max-w-5xl {
            max-width: 100%;
          }
          .md\\:w-1\\/2 {
            width: 100%;
          }
          .md\\:text-left {
            text-align: center;
          }
          .md\\:justify-end {
            justify-content: center;
          }
          .md\\:mx-0 {
            margin-left: auto;
            margin-right: auto;
          }
        }

        @media (max-width: 640px) {
          .text-5xl {
            font-size: 2.5rem;
          }
          .text-lg {
            font-size: 1rem;
          }
          .py-16 {
            padding-top: 3rem;
            padding-bottom: 3rem;
          }
          .px-8 {
            padding-left: 1rem;
            padding-right: 1rem;
          }
          .mb-8 {
            margin-bottom: 1.5rem;
          }
          .mb-10 {
            margin-bottom: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
