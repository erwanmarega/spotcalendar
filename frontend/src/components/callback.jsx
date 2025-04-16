import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Callback = () => {
  const navigate = useNavigate();
  const [aTraite, setATraite] = useState(false);
  const [erreur, setErreur] = useState(null);

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
              "Content-Type": "application/x-www-form-urlencoded", 
            },
            body: new URLSearchParams({ code }), 
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
          setErreur("Erreur lors de l'authentification : " + erreur.message);
          navigate("/", { state: { error: "Erreur lors de l'authentification : " + erreur.message } });
        }
      };

      echangerCodeContreToken();
    } else {
      navigate("/", { state: { error: "Aucun code d'authentification reçu" } });
    }
  }, [navigate, aTraite]);

  return <div>{erreur ? <p className="text-red-500 text-center">{erreur}</p> : "Chargement..."}</div>;
};

export default Callback;