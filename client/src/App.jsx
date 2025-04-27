import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Login from "./components/login";
import Callback from "./components/callback";
import Calendar from "./components/calendar";
import IntroVideo from "./components/introvideo";
import { checkTokens } from "./api";

function AppContent() {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem("hasSeenIntro");
    if (hasSeenIntro) {
      setShowIntro(false);
    }

    checkTokens()
      .then((tokenData) => {
        console.log("Résultat de checkTokens au démarrage :", tokenData);
        if (tokenData.access_token_exists) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          if (location.pathname !== "/callback" && location.pathname !== "/login") {
            navigate("/login");
          }
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la vérification des tokens :", error);
        setIsAuthenticated(false);
        if (location.pathname !== "/callback" && location.pathname !== "/login") {
          navigate("/login");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [navigate]);

  const handleIntroEnd = () => {
    setShowIntro(false);
    localStorage.setItem("hasSeenIntro", "true");
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_center,#1a1a1a_0%,#121212_100%)]">
      <div className="text-white text-2xl">Chargement...</div>
    </div>;
  }

  return (
    <div className="min-h-screen">
      {showIntro ? (
        <IntroVideo onFinish={handleIntroEnd} />
      ) : (
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/calendar" element={isAuthenticated ? <Calendar /> : <Login />} />
        </Routes>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;