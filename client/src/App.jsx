import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login";
import Callback from "./components/callback";
import Calendar from "./components/calendar";
import IntroVideo from "./components/introvideo";
import PrivacyPolicy from "./components/PrivacyPolicy";

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
            <Route path="/" element={<Calendar />} />
            <Route path="/login" element={<Login />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
          </Routes>
        </Router>
      )}
    </div>
  );
}

export default App;