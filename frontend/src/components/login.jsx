import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/my-calendar.png";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const errorMessage = location.state?.error || null;

  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_REDIRECT_URI;
  const scope = "user-follow-read";

  if (!clientId || !redirectUri) {
    console.error("Erreur : Variables d'environnement manquantes (VITE_SPOTIFY_CLIENT_ID, VITE_REDIRECT_URI)");
    return <div className="text-red-500 text-center">Erreur de configuration. Veuillez contacter l'administrateur.</div>;
  }

  const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: scope,
    redirect_uri: redirectUri,
    show_dialog: "true",
  })}`;

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    const expiresAt = localStorage.getItem("expires_at");
    if (accessToken && expiresAt && Date.now() < parseInt(expiresAt)) {
      navigate("/calendar");
    }
  }, [navigate]);

  const handleLogin = () => {
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,#1a1a1a_0%,#121212_100%)] flex items-center justify-center p-4">
      <div className="bg-black p-8 rounded-2xl shadow-md border border-white-400 w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <img src={logo} alt="Logo" className="w-12 h-12" />
          <h1 className="text-2xl font-bold text-white">Spotify Calendar</h1>
        </div>

        {errorMessage && (
          <p className="text-red-500 text-center mb-4">{errorMessage}</p>
        )}

        <p className="text-gray-300 text-center mb-6">
          Connecte-toi avec Spotify pour voir les sorties de tes artistes préférés !
        </p>

        <button
          onClick={handleLogin}
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