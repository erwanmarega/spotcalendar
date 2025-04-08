import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  ];

  if (!idClient || !uriRedirection) {
    console.error("Erreur : Variables d'environnement manquantes (VITE_SPOTIFY_CLIENT_ID, VITE_REDIRECT_URI)");
    return <div className="text-red-500 text-center">Erreur de configuration. Veuillez contacter l'administrateur.</div>;
  }

  const urlAuth = `https://accounts.spotify.com/authorize?${new URLSearchParams({
    response_type: "code",
    client_id: idClient,
    scope: permissions.join(" "),
    redirect_uri: uriRedirection,
    show_dialog: "true",
  })}`;

  useEffect(() => {
    const tokenAcces = localStorage.getItem("access_token");
    const expireA = localStorage.getItem("expires_at");
    if (tokenAcces && expireA && Date.now() < parseInt(expireA)) {
      navigate("/calendrier");
    }
  }, [navigate]);

  const gererConnexion = () => {
    window.location.href = urlAuth;
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,#1a1a1a_0%,#121212_100%)] flex items-center justify-center p-4">
      <div className="bg-black p-8 rounded-2xl shadow-md border border-white-400 w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <img src={logo} alt="Logo" className="w-12 h-12" />
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
          className="w-full bg-green-500 text-black font-bold py-3 px-4 rounded-md hover:bg-green-400 transition duration-300"
        >
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