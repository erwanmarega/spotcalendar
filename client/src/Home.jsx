import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./assets/my-calendar.png";
import mockup from "./assets/mockup.png";

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,#2a2a2a_0%,#0a0a0a_100%)] text-white overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 md:p-6 bg-black/30 backdrop-blur-lg shadow-lg">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="w-10 h-10 md:w-12 md:h-12 animate-pulse" />
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">Spotcalendar</h1>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#fonctionnalités" className="text-gray-300 hover:text-green-400 transition-colors duration-300 font-medium">
            Fonctionnalités
          </a>
          <a href="#gratuit" className="text-gray-300 hover:text-green-400 transition-colors duration-300 font-medium">
            Pourquoi gratuit ?
          </a>
          <button
            onClick={handleLoginRedirect}
            className="bg-green-500 text-black font-bold py-2 px-6 rounded-full hover:bg-green-400 transition-all duration-300 shadow-lg hover:shadow-green-500/50"
          >
            Se connecter
          </button>
        </nav>
        <button className="md:hidden text-gray-300 focus:outline-none" onClick={toggleMenu}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </header>

      {isMenuOpen && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-black/90 backdrop-blur-md p-4 md:hidden">
          <nav className="flex flex-col gap-4 text-center">
            <a href="#fonctionnalités" className="text-gray-300 hover:text-green-400 transition-colors duration-300 font-medium" onClick={toggleMenu}>
              Fonctionnalités
            </a>
            <a href="#gratuit" className="text-gray-300 hover:text-green-400 transition-colors duration-300 font-medium" onClick={toggleMenu}>
              Pourquoi gratuit ?
            </a>
            <button
              onClick={() => { handleLoginRedirect(); toggleMenu(); }}
              className="bg-green-500 text-black font-bold py-2 px-6 rounded-full hover:bg-green-400 transition-all duration-300 shadow-lg hover:shadow-green-500/50 mx-auto"
            >
              Se connecter
            </button>
          </nav>
        </div>
      )}

      <section className="relative flex flex-col md:flex-row items-center justify-between px-4 md:px-8 pt-24 md:pt-32 pb-16 min-h-screen">
        <div className="md:w-1/2 text-center md:text-left z-10">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8 leading-tight animate-fade-in text-white">
            Ne manquez plus rien :<br />
            Suivez vos artistes préférés<br />
            <span className="text-green-400">100% gratuit avec Spotcalendar !</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg md:text-xl mb-10 max-w-lg mx-auto md:mx-0 animate-slide-up">
            Synchronisez vos événements avec Spotify, suivez vos artistes et profitez d'une interface fluide, sans dépenser un centime.
          </p>
          <div className="flex justify-center md:justify-start gap-4 animate-slide-up delay-100">
            <button
              onClick={handleLoginRedirect}
              className="bg-green-500 text-black font-bold py-3 px-6 sm:py-4 sm:px-8 rounded-full hover:bg-green-400 transition-all duration-300 shadow-lg hover:shadow-green-500/50"
            >
              Commencer maintenant
            </button>
          </div>
        </div>
        <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center md:justify-end">
          <img
            src={mockup}
            alt="Spotcalendar PC Mockup"
            className="w-full max-w-md md:max-w-lg animate-float object-contain"
          />
        </div>
      </section>

      <section id="fonctionnalités" className="py-16 px-4 md:px-8">
        <h3 className="text-3xl sm:text-4xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-white to-green-400 animate-fade-in">
          Pourquoi choisir Spotcalendar
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {[
            {
              title: "Synchronisation Spotify",
              description: "Suivez les sorties et concerts de vos artistes préférés en un clin d'œil.",
            },
            {
              title: "Calendrier des sorties",
              description: "Retrouver en un clin d'œil les sorties de vos artistes suivis.",
            },
            {
              title: "Design futuriste",
              description: "Une interface fluide et intuitive qui rend la planification addictive.",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="relative bg-black/60 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-md hover:border-green-400 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              <h4 className="text-xl sm:text-2xl font-semibold mb-4 text-green-400">{feature.title}</h4>
              <p className="text-gray-300 text-sm sm:text-base">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="gratuit" className="py-16 px-4 md:px-8 bg-[radial-gradient(circle_at_bottom,#1a1a1a_0%,#0a0a0a_100%)]">
        <h3 className="text-3xl sm:text-4xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-white to-green-400 animate-fade-in">
          Pourquoi c'est gratuit ?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {[
            {
              title: "Pour tous les fans",
              description: "Je crois que suivre vos artistes préférés ne devrait pas coûter cher. Spotcalendar est gratuit pour que tout le monde puisse en profiter.",
            },
            {
              title: "Soutenu par la passion",
              description: "Développé par un amoureux de musique, Spotcalendar est ma façon de connecter les fans à leurs artistes, sans barrières.",
            },
          ].map((reason, index) => (
            <div
              key={index}
              className="relative bg-black/60 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-md hover:border-green-400 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] text-center"
            >
              <h4 className="text-xl sm:text-2xl font-semibold mb-4 text-green-400">{reason.title}</h4>
              <p className="text-gray-300 text-sm sm:text-base">{reason.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 md:px-8 text-center">
        <h3 className="text-3xl sm:text-4xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-green-400 animate-fade-in">
          Découvrez mon portfolio !
        </h3>
        <p className="text-gray-300 text-base sm:text-lg mb-8 max-w-xl mx-auto">
          Explorez mes autres projets et découvrez mon travail sur mon portfolio.
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
      </section>

      <footer className="bg-black/50 py-8 text-center text-gray-400">
        <p className="text-sm sm:text-base">© 2025 Spotcalendar. Tous droits réservés.</p>
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