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

  useEffect(() => {
    const handler = () => setOpen((o) => !o);
    document.addEventListener("spotcalendar-toggle", handler);
    return () => document.removeEventListener("spotcalendar-toggle", handler);
  }, []);

  useEffect(() => {
    document.dispatchEvent(
      new CustomEvent("spotcalendar-state", { detail: { open } })
    );
  }, [open]);

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
    setOpen(false);
  };

  return (
    <div
      style={{ pointerEvents: open ? "auto" : "none" }}
      className={`fixed top-[64px] right-0 bottom-0 w-[380px] shadow-2xl transition-transform duration-300 ${
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
  );
}
