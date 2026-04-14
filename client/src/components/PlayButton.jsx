import { useState, useEffect, useRef } from "react";
import { fetchSpotifyData } from "../api";

const PlayButton = ({ albumId }) => {
  const [state, setState] = useState("idle");
  const audioRef = useRef(null);

  const handlePlay = async () => {
    if (state === "playing") {
      audioRef.current?.pause();
      setState("idle");
      return;
    }

    setState("loading");
    try {
      const data = await fetchSpotifyData(`albums/${albumId}/tracks?limit=10`);
      const previewUrl = data.items?.find((t) => t.preview_url)?.preview_url;

      if (!previewUrl) {
        setState("unavailable");
        return;
      }

      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(previewUrl);
      audioRef.current = audio;
      audio.volume = 0.7;
      audio.play();
      setState("playing");
      audio.onended = () => setState("idle");
    } catch {
      setState("idle");
    }
  };

  useEffect(() => {
    return () => audioRef.current?.pause();
  }, []);

  if (state === "unavailable") {
    return <span className="text-[#727272] text-[11px]">Pas d'extrait</span>;
  }

  return (
    <button
      onClick={handlePlay}
      className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full transition-colors ${
        state === "playing"
          ? "bg-white text-black"
          : "bg-[#282828] text-white hover:bg-[#3a3a3a]"
      }`}
    >
      {state === "loading" ? (
        <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : state === "playing" ? (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" />
          <rect x="14" y="4" width="4" height="16" />
        </svg>
      ) : (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
      {state === "playing" ? "Stop" : "Extrait"}
    </button>
  );
};

export default PlayButton;
