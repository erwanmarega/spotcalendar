import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import LoginApple from "./pages/LoginApple";
import Callback from "./pages/Callback";
import Calendar from "./pages/Calendar";
import CalendarApple from "./pages/CalendarApple";
import IntroVideo from "./pages/IntroVideo";
import LegalPage from "./pages/LegalPage";
import Landing from "./pages/Landing";

function App() {
  const [showIntro, setShowIntro] = useState(
    () => !localStorage.getItem("hasSeenIntro")
  );

  const handleIntroEnd = () => {
    setShowIntro(false);
    localStorage.setItem("hasSeenIntro", "true");
  };

  return (
    <div className="min-h-screen">
      <Router>
        {showIntro && <IntroVideo onFinish={handleIntroEnd} />}
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/apple" element={<LoginApple />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/calendar/apple" element={<CalendarApple />} />
          <Route path="/privacy" element={<LegalPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
