import PropTypes from "prop-types";

const TABS = [
  {
    id: "artists",
    label: "Calendrier",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    id: "découvertes",
    label: "Découvertes",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
  },
  {
    id: "history",
    label: "Historique",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M12 8v4l3 3M3.05 11a9 9 0 1 0 .5-3" />
        <path d="M3 4v4h4" />
      </svg>
    ),
  },
  {
    id: "genres",
    label: "Genres",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
];

const Navbar = ({ ongletActif, setOngletActif }) => (
  <>
    <div className="hidden md:flex flex-wrap items-center gap-3 px-6 pt-6 pb-5 sticky top-0 z-10 bg-gradient-to-b from-[#1a1a1a] to-transparent">
      {TABS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => setOngletActif(id)}
          className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
            ongletActif === id
              ? "bg-white text-black"
              : "bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>

    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-t border-[#282828] flex">
      {TABS.map(({ id, label, icon }) => (
        <button
          key={id}
          onClick={() => setOngletActif(id)}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors ${
            ongletActif === id ? "text-white" : "text-[#535353]"
          }`}
        >
          <span
            className={`transition-transform ${
              ongletActif === id ? "scale-110" : ""
            }`}
          >
            {icon}
          </span>
          <span
            className={`text-[10px] font-bold ${
              ongletActif === id ? "text-white" : "text-[#535353]"
            }`}
          >
            {label}
          </span>
          {ongletActif === id && (
            <span className="absolute bottom-0 w-8 h-0.5 bg-[#1DB954] rounded-full" />
          )}
        </button>
      ))}
    </div>

    <div className="md:hidden h-16" />
  </>
);

Navbar.propTypes = {
  ongletActif: PropTypes.string.isRequired,
  setOngletActif: PropTypes.func.isRequired,
};

export default Navbar;
