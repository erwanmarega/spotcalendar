import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      fetch("http://localhost:3000/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then((res) => res.json())
        .then((data) => {
          localStorage.setItem("access_token", data.access_token);
          navigate("/calendar"); 
        })
        .catch((err) => console.error("Erreur :", err));
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[rgba(36,_36,_36,_1)] flex items-center justify-center">
      <p className="text-white">Connexion en cours...</p>
    </div>
  );
};

export default Callback;