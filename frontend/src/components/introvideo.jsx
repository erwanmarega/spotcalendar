import { useState, useEffect } from "react";

const IntroVideo = ({ onFinish }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [showVideo, setShowVideo] = useState(true);

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem("hasSeenIntro"); 
    if (hasSeenIntro) {
      setShowVideo(false);
      onFinish();
    }
  }, [onFinish]);

  const handleVideoEnd = () => {
    setFadeOut(true);
    sessionStorage.setItem("hasSeenIntro", "true"); 
    setTimeout(() => {
      setShowVideo(false);
      onFinish();
    }, 10);
  };

  if (!showVideo) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black z-50 transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <video
        className="w-1/4 h-auto object-cover"
        autoPlay
        muted
        onEnded={handleVideoEnd}
      >
        <source src="/video/Intro.mp4" type="video/mp4" />
        Votre navigateur ne supporte pas la vidéo.
      </video>
      <button
        onClick={handleVideoEnd}
        className="absolute top-5 right-5 bg-white text-black px-4 py-2 rounded-lg shadow-md hover:bg-gray-200 transition"
      >
        Skip
      </button>
    </div>
  );
};

export default IntroVideo;
