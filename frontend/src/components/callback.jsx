import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Callback = () => {
  const navigate = useNavigate();
  const [hasProcessed, setHasProcessed] = useState(false); // État pour éviter les doubles appels

  useEffect(() => {
    if (hasProcessed) return; // Évite les doubles appels

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      const exchangeCodeForToken = async () => {
        try {
          const response = await fetch("http://localhost:3000/api/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ code }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur HTTP : ${response.status} - ${errorText}`);
          }

          const data = await response.json();

          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
          localStorage.setItem("expires_at", Date.now() + data.expires_in * 1000);
          localStorage.setItem("token_type", "Bearer");

          setHasProcessed(true); 
          navigate("/calendar");
        } catch (error) {
          navigate("/");
        }
      };

      exchangeCodeForToken();
    } else {
      navigate("/");
    }
  }, [navigate, hasProcessed]);

  return <div>Chargement...</div>;
};

export default Callback;