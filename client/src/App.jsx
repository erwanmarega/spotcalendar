import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Callback from "./pages/Callback";
import Calendar from "./pages/Calendar";
import IntroVideo from "./pages/IntroVideo";
import LegalPage from "./pages/LegalPage";
import Landing from "./pages/Landing";

function App() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem("hasSeenIntro");
    if (hasSeenIntro) {
      setShowIntro(false);
    }
  }, []);

  const handleIntroEnd = () => {
    setShowIntro(false);
    localStorage.setItem("hasSeenIntro", "true");
  };

  return (
    <div className="min-h-screen">
      {showIntro ? (
        <IntroVideo onFinish={handleIntroEnd} />
      ) : (
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/privacy" element={<LegalPage />} />
          </Routes>
        </Router>
      )}
    </div>
  );
}

export default App;
