import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Callback = () => {
  const navigate = useNavigate();
  const [aTraite, setATraite] = useState(false);

  useEffect(() => {
    if (aTraite) return;

    const paramsUrl = new URLSearchParams(window.location.search);
    const code = paramsUrl.get("code");

    if (code) {
      const echangerCodeContreToken = async () => {
        try {
          const reponse = await fetch("http://localhost:3000/api/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ code }),
          });

          if (!reponse.ok) {
            const texteErreur = await reponse.text();
            throw new Error(`Erreur HTTP : ${reponse.status} - ${texteErreur}`);
          }

          const donnees = await reponse.json();

          localStorage.setItem("access_token", donnees.access_token);
          localStorage.setItem("refresh_token", donnees.refresh_token);
          localStorage.setItem("expires_at", Date.now() + donnees.expires_in * 1000);
          localStorage.setItem("token_type", "Bearer");

          setATraite(true);
          navigate("/calendar");
        } catch (erreur) {
          navigate("/");
        }
      };

      echangerCodeContreToken();
    } else {
      navigate("/");
    }
  }, [navigate, aTraite]);

  return <div>Chargement...</div>;
};

export default Callback;