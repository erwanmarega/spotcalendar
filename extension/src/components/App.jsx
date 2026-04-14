import { useState, useEffect } from "react";
import CalendarPanel from "./CalendarPanel";
import AuthPrompt from "./AuthPrompt";

export default function App() {
  const [open, setOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    chrome.storage.local.get(["access_token", "expires_at"], (data) => {
      setAuthenticated(
        !!(data.access_token && data.expires_at && Date.now() < data.expires_at)
      );
      setChecking(false);
    });
  }, []);

  const handleLogin = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: "LOGIN" });
      if (response?.success) {
        setAuthenticated(true);
      } else {
        console.error("[Spotcalendar] Login failed:", response?.error);
      }
    } catch (e) {
      console.error("[Spotcalendar] sendMessage error:", e);
    }
  };

  const handleLogout = async () => {
    await new Promise((resolve) =>
      chrome.storage.local.remove(
        ["access_token", "refresh_token", "expires_at"],
        resolve
      )
    );
    setAuthenticated(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ pointerEvents: "auto" }}
        className="fixed bottom-24 right-4 flex items-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-sm px-4 py-2.5 rounded-full shadow-lg transition-all duration-200 z-50"
        aria-label={open ? "Fermer Spotcalendar" : "Ouvrir Spotcalendar"}
      >
        <svg
          className="w-4 h-4 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
        {open ? "Fermer" : "Calendrier"}
      </button>

      <div
        style={{ pointerEvents: open ? "auto" : "none" }}
        className={`fixed top-0 right-0 bottom-[72px] w-[380px] shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {!checking &&
          (authenticated ? (
            <CalendarPanel onLogout={handleLogout} />
          ) : (
            <AuthPrompt onLogin={handleLogin} />
          ))}
      </div>
    </>
  );
}
