import PropTypes from "prop-types";

const TABS = [
  { id: "artists", label: "Calendrier" },
  { id: "history", label: "Historique" },
  { id: "genres", label: "Genres" },
  { id: "ratés", label: "Ratés" },
];

const Navbar = ({ ongletActif, setOngletActif }) => (
  <div className="flex flex-wrap items-center gap-3 px-6 pt-6 pb-5 sticky top-0 z-10 bg-gradient-to-b from-[#1a1a1a] to-transparent">
    {TABS.map(({ id, label }) => (
      <button
        key={id}
        onClick={() => setOngletActif(id)}
        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
          ongletActif === id
            ? "bg-white text-black"
            : "bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]"
        }`}
      >
        {label}
      </button>
    ))}
  </div>
);

Navbar.propTypes = {
  ongletActif: PropTypes.string.isRequired,
  setOngletActif: PropTypes.func.isRequired,
};

export default Navbar;
