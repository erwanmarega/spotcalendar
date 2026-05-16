import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getToken } from "../api"; 

const Callback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasRun = useRef(false);

  const echangerCodeContreToken = async (code) => {
    try {
      await getToken(code);
      navigate("/calendar");
    } catch (e) {
      console.error("Erreur lors de l'échange du code :", e);
      navigate("/login");
    }
  };

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    const returnedState = params.get("state");
    const savedState = sessionStorage.getItem("oauth_state");
    sessionStorage.removeItem("oauth_state");

    if (!returnedState || !savedState || returnedState !== savedState) {
      console.error("State OAuth invalide — possible attaque CSRF");
      navigate("/login", { state: { error: "Erreur de sécurité lors de la connexion. Veuillez réessayer." } });
      return;
    }

    if (code) {
      echangerCodeContreToken(code);
    } else {
      console.error("Aucun code d'autorisation trouvé dans l'URL");
      navigate("/login");
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_center,#1a1a1a_0%,#121212_100%)]">
      <div className="text-white text-2xl">Connexion en cours...</div>
    </div>
  );
};

export default Callback;