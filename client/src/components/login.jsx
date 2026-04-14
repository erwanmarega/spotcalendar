import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { checkTokens } from "../api"; 
import logo from "../assets/my-calendar.png";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const messageErreur = location.state?.error || null;

  const idClient = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const uriRedirection = import.meta.env.VITE_REDIRECT_URI;
  const permissions = [
    "user-follow-read",
    "user-read-recently-played",
    "user-read-private",
    "user-read-email",
    "user-top-read",
  ];

  if (!idClient || !uriRedirection) {
    console.error("Erreur : Variables d'environnement manquantes (VITE_SPOTIFY_CLIENT_ID, VITE_REDIRECT_URI)");
    return <div className="text-red-500 text-center">Erreur de configuration. Veuillez contacter l'administrateur : <s>erwanmarega25@gmail.com</s></div>;
  }

  const urlAuth = `https://accounts.spotify.com/authorize?${new URLSearchParams({
    response_type: "code",
    client_id: idClient,
    scope: permissions.join(" "),
    redirect_uri: uriRedirection,
    show_dialog: "true",
  })}`;

  useEffect(() => {
    if (location.state?.fromLogout) {
      return;
    }
  
    const verifierAuth = async () => {
      try {
        const data = await checkTokens();
        if (data.access_token_exists && data.expires_at && Date.now() < parseInt(data.expires_at)) {
          navigate("/");
        }
      } catch (e) {
        console.error("Échec de la vérification des tokens :", e);
      }
    };
  
    verifierAuth();
  }, [navigate, location]);

  const gererConnexion = () => {
    window.location.href = urlAuth;
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,#1a1a1a_0%,#121212_100%)] flex items-center justify-center p-4">
      <div className="bg-black p-8 rounded-2xl shadow-md border border-white-400 w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <a href="/">
            <img src={logo} alt="Logo" className="w-12 h-12" />
          </a>
          <h1 className="text-2xl font-bold text-white">Calendrier Spotify</h1>
        </div>

        {messageErreur && (
          <p className="text-red-500 text-center mb-4">{messageErreur}</p>
        )}

        <p className="text-gray-300 text-center mb-6">
          Connecte-toi avec Spotify pour voir les sorties de tes artistes préférés !
        </p>

        <button
          onClick={gererConnexion}
          className="w-full bg-[#1DB954] text-black font-bold py-3 px-4 rounded-md hover:bg-[#1ed760] transition duration-300 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Se connecter avec Spotify
        </button>

        <p className="text-gray-400 text-xs mt-4 text-center">
          Aucune donnée sensible n’est stockée. Promis !
        </p>
      </div>
    </div>
  );
};

export default Login;