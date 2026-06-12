import { useState, useCallback } from "react";

const STORAGE_KEY = "spotcal-theme-mode";

const readStored = () => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "light" || v === "dark" ? v : "dark";
  } catch {
    return "dark";
  }
};

export const useThemeMode = () => {
  const [mode, setModeState] = useState(readStored);

  const setMode = useCallback((next) => {
    setModeState(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
  }, []);

  const toggle = useCallback(() => {
    setModeState(prev => {
      const next = prev === "dark" ? "light" : "dark";
      try { localStorage.setItem(STORAGE_KEY, next); } catch {}
      return next;
    });
  }, []);

  return [mode, toggle, setMode];
};
