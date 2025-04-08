import { useState, useEffect } from "react";

const IntroVideo = ({ onFinish }) => {
  const [disparition, setDisparition] = useState(false);
  const [afficherVideo, setAfficherVideo] = useState(true);

  useEffect(() => {
    const aVuIntro = sessionStorage.getItem("aVuIntro");
    if (aVuIntro) {
      setAfficherVideo(false);
      onFinish();
    }
  }, [onFinish]);

  const gererFinVideo = () => {
    setDisparition(true);
    sessionStorage.setItem("aVuIntro", "true");
    setTimeout(() => {
      setAfficherVideo(false);
      onFinish();
    }, 10);
  };

  if (!afficherVideo) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black z-50 transition-opacity duration-500 ${
        disparition ? "opacity-0" : "opacity-100"
      }`}
    >
      <video
        className="w-1/4 h-auto object-cover"
        autoPlay
        muted
        onEnded={gererFinVideo}
      >
        <source src="/video/Intro.mp4" type="video/mp4" />
        Votre navigateur ne prend pas en charge la vidéo.
      </video>
      <button
        onClick={gererFinVideo}
        className="absolute top-5 right-5 bg-white text-black px-4 py-2 rounded-lg shadow-md hover:bg-gray-200 transition"
      >
        Passer
      </button>
    </div>
  );
};

export default IntroVideo;