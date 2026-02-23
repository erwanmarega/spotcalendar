import { useNavigate } from "react-router-dom";
import logo from "../assets/my-calendar.png";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,#2a2a2a_0%,#0a0a0a_100%)] text-white">
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 md:p-6 bg-black/30 backdrop-blur-lg shadow-lg">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img src={logo} alt="Logo" className="w-10 h-10" />
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">Spotcalendar</h1>
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-8 pt-32 pb-16">
        <h2 className="text-4xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-green-400">
          Politique de confidentialité
        </h2>
        <p className="text-gray-400 text-sm mb-10">Dernière mise à jour : février 2026</p>

        <div className="space-y-8 text-gray-300 text-base leading-relaxed">

          <section>
            <h3 className="text-xl font-bold text-green-400 mb-3">1. Introduction</h3>
            <p>
              Spotcalendar (<strong className="text-white">www.spotcalendar.fr</strong>) est une application web gratuite
              qui vous permet de visualiser les nouvelles sorties musicales de vos artistes Spotify suivis dans un
              calendrier. Cette politique explique quelles données nous collectons, comment nous les utilisons et vos droits.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-green-400 mb-3">2. Données collectées</h3>
            <p className="mb-3">Lors de votre connexion via Spotify, nous collectons :</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li><strong className="text-white">Identifiant Spotify</strong> — pour vous identifier de façon unique.</li>
              <li><strong className="text-white">Adresse e-mail</strong> — pour vous envoyer les notifications hebdomadaires de sorties manquées (si vous les activez).</li>
              <li><strong className="text-white">Refresh token Spotify</strong> — pour maintenir votre session et accéder à vos données Spotify sans vous redemander de vous connecter.</li>
            </ul>
            <p className="mt-3">
              Nous n'avons pas accès à votre mot de passe Spotify. L'authentification est gérée entièrement par Spotify via OAuth 2.0.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-green-400 mb-3">3. Utilisation des données</h3>
            <p className="mb-3">Vos données sont utilisées uniquement pour :</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>Afficher votre calendrier de sorties musicales personnalisé.</li>
              <li>Vous envoyer un e-mail hebdomadaire récapitulatif des nouvelles sorties de vos artistes suivis (uniquement si vous activez cette option).</li>
            </ul>
            <p className="mt-3">
              Nous ne vendons, ne partageons ni ne transmettons vos données personnelles à des tiers.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-green-400 mb-3">4. Stockage et sécurité</h3>
            <p>
              Vos données sont stockées dans une base de données sécurisée sur nos serveurs. Les tokens d'accès Spotify
              sont stockés dans des cookies <code className="bg-white/10 px-1 rounded text-sm">httpOnly</code> et ne sont
              jamais accessibles depuis le navigateur. Nous prenons toutes les précautions raisonnables pour protéger vos données.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-green-400 mb-3">5. Services tiers</h3>
            <p>
              Spotcalendar utilise l'<strong className="text-white">API Spotify</strong> pour récupérer vos artistes suivis
              et leurs sorties musicales. Votre utilisation de Spotcalendar est également soumise à la{" "}
              <a
                href="https://www.spotify.com/fr/legal/privacy-policy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 underline"
              >
                politique de confidentialité de Spotify
              </a>.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-green-400 mb-3">6. Vos droits</h3>
            <p className="mb-3">Vous pouvez à tout moment :</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li><strong className="text-white">Vous désabonner</strong> des e-mails via le lien de désinscription présent dans chaque e-mail.</li>
              <li><strong className="text-white">Désactiver les notifications</strong> directement depuis l'application.</li>
              <li><strong className="text-white">Demander la suppression</strong> de vos données en nous contactant.</li>
              <li><strong className="text-white">Révoquer l'accès</strong> de Spotcalendar à votre compte Spotify depuis les paramètres Spotify → Applications.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-green-400 mb-3">7. Contact</h3>
            <p>
              Pour toute question concernant cette politique ou vos données personnelles, vous pouvez me contacter via{" "}
              <a
                href="https://ewmdev.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 underline"
              >
                ewmdev.com
              </a>.
            </p>
          </section>

        </div>
      </main>

      <footer className="bg-black/50 py-8 text-center text-gray-400">
        <p className="text-sm">© 2025 Spotcalendar. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
