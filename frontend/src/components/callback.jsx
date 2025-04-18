import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Callback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasRun = useRef(false);

  const echangerCodeContreToken = async (code) => {
    try {
      const res = await fetch("http://localhost:3000/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Erreur du serveur :", errorData);
        throw new Error(errorData.error || `Erreur HTTP : ${res.status}`);
      }

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