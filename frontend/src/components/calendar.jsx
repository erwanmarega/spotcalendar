import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/my-calendar.png"; import profileIcon from "../assets/profile-icon.avif";
import dayjs from "dayjs"; import "dayjs/locale/fr"; import { FaChartPie, FaHistory, FaUserFriends } from "react-icons/fa";
import { Pie, Bar } from "react-chartjs-2"; import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);
dayjs.locale("fr");

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(dayjs()); const [activeTab, setActiveTab] = useState("genres");
  const [artists, setArtists] = useState([]); const [genresData, setGenresData] = useState({ labels: [], datasets: [] });
  const [chartType, setChartType] = useState("pie"); const [loading, setLoading] = useState(false); const [errMsg, setErrMsg] = useState(null);
  const [chosenArtist, setChosenArtist] = useState(null); const [artistReleases, setArtistReleases] = useState([]);
  const [allReleases, setAllReleases] = useState([]); const [selectedEvents, setSelectedEvents] = useState([]);
  const [popup, setPopup] = useState(false); const [user, setUser] = useState(null); const today = dayjs();
  const navigate = useNavigate(); const daysOfWeek = ["Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam.", "Dim."];

  const startOfMonth = currentMonth.startOf("month"); const endOfMonth = currentMonth.endOf("month");
  const daysInMonth = endOfMonth.date(); const startDay = startOfMonth.day();
  const prevMonth = () => setCurrentMonth(currentMonth.subtract(1, "month")); const nextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));
  const goToToday = () => setCurrentMonth(today);

  const generateDays = () => {
    let days = []; for (let i = 1 - (startDay === 0 ? 6 : startDay - 1); i <= daysInMonth; i++) days.push(i > 0 ? i : ""); return days;
  };

  const refreshToken = async () => {
    const refreshTok = localStorage.getItem("refresh_token");
    if (!refreshTok) { navigate("/"); return null; }
    try {
      const res = await fetch("http://localhost:3000/api/refresh-token", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: refreshTok }) });
      if (!res.ok) throw new Error(`Erreur HTTP : ${res.status} - ${await res.text()}`);
      const data = await res.json(); localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("expires_at", (Date.now() + data.expires_in * 1000).toString());
      return data.access_token;
    } catch (e) {
      console.error("token refresh failed:", e); localStorage.clear(); navigate("/"); return null;
    }
  };

  const fetchUserProfile = async () => {
    setLoading(true); setErrMsg(null); let tok = localStorage.getItem("access_token");
    const expires = localStorage.getItem("expires_at"); const tokType = localStorage.getItem("token_type") || "Bearer";
    if (!tok || !expires || Date.now() >= parseInt(expires)) { tok = await refreshToken(); if (!tok) { setErrMsg("token refresh failed, please login again"); setLoading(false); return; } }
    try {
      const res = await fetch("https://api.spotify.com/v1/me", { headers: { Authorization: `${tokType} ${tok}` } });
      if (!res.ok) throw new Error(`Erreur HTTP : ${res.status} - ${await res.text()}`); const data = await res.json(); setUser(data);
    } catch (e) { setErrMsg("cant fetch user info, try again"); console.error("fetch user error:", e); } finally { setLoading(false); }
  };

  const fetchArtists = async () => {
    setLoading(true); setErrMsg(null); let tok = localStorage.getItem("access_token"); const expires = localStorage.getItem("expires_at");
    const tokType = localStorage.getItem("token_type") || "Bearer"; if (!tok || !expires || Date.now() >= parseInt(expires)) { tok = await refreshToken(); if (!tok) { setErrMsg("token refresh failed, please login again"); setLoading(false); return; } }
    try {
      const res = await fetch("https://api.spotify.com/v1/me/following?type=artist&limit=50", { headers: { Authorization: `${tokType} ${tok}` } });
      if (!res.ok) throw new Error(`Erreur HTTP : ${res.status} - ${await res.text()}`); const data = await res.json(); setArtists(data.artists.items);
    } catch (e) { setErrMsg("cant fetch followed artists, try again"); console.error("fetch artists error:", e); } finally { setLoading(false); }
  };

  const fetchRecentlyPlayed = async () => { setLoading(true); setErrMsg(null); let tok = localStorage.getItem("access_token"); const expires = localStorage.getItem("expires_at"); const tokType = localStorage.getItem("token_type") || "Bearer";
    if (!tok || !expires || Date.now() >= parseInt(expires)) { tok = await refreshToken(); if (!tok) { setErrMsg("token refresh failed, please login again"); setLoading(false); return; } }
    try {
      const res = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=50", { headers: { Authorization: `${tokType} ${tok}` } });
      if (!res.ok) throw new Error(`Erreur lors de la récupération des chansons récemment écoutées : ${res.status} - ${await res.text()}`);
      const data = await res.json(); const tracks = data.items.map(item => item.track).filter(track => track); if (tracks.length === 0) { setErrMsg("no recently played songs found, listen to some music"); setLoading(false); return; }
      const artistIds = [...new Set(tracks.flatMap(track => track.artists.map(artist => artist.id)))]; if (artistIds.length === 0) { setErrMsg("no artists found in recently played songs"); setLoading(false); return; }
      const artistsRes = await fetch(`https://api.spotify.com/v1/artists?ids=${artistIds.join(",")}`, { headers: { Authorization: `${tokType} ${tok}` } });
      if (!artistsRes.ok) throw new Error(`Erreur lors de la récupération des artistes : ${artistsRes.status} - ${await artistsRes.text()}`); const artistsData = await artistsRes.json(); const artistsWithGenres = artistsData.artists;
      const genreCount = {}; artistsWithGenres.forEach(artist => { if (artist && artist.genres && artist.genres.length > 0) artist.genres.forEach(genre => { genreCount[genre] = (genreCount[genre] || 0) + 1; }); });
      if (Object.keys(genreCount).length === 0) { setErrMsg("no genres found for recently played artists"); setLoading(false); return; }
      const sortedGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]).slice(0, 10); const labels = sortedGenres.map(([genre]) => genre); const counts = sortedGenres.map(([, count]) => count);
      const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#66FF66", "#FF66CC", "#66CCCC", "#FF9933"];
      setGenresData({ labels, datasets: [{ label: "Nombre d'artistes", data: counts, backgroundColor: labels.map((_, index) => colors[index % colors.length]), borderColor: "#000", borderWidth: 1 }] });
    } catch (e) { setErrMsg(e.message || "cant fetch genres from recently played songs, try again"); console.error("fetchRecentlyPlayed error:", e); } finally { setLoading(false); }
  };

  const fetchOnRepeatPlaylist = async () => { setLoading(true); setErrMsg(null); let tok = localStorage.getItem("access_token"); const expires = localStorage.getItem("expires_at"); const tokType = localStorage.getItem("token_type") || "Bearer";
    if (!tok || !expires || Date.now() >= parseInt(expires)) { tok = await refreshToken(); if (!tok) { setErrMsg("token refresh failed, please login again"); setLoading(false); return; } }
    try {
      let playlists = []; let url = "https://api.spotify.com/v1/me/playlists?limit=50"; while (url) { const res = await fetch(url, { headers: { Authorization: `${tokType} ${tok}` } }); if (!res.ok) throw new Error(`Erreur lors de la récupération des playlists : ${res.status} - ${await res.text()}`); const data = await res.json(); playlists = [...playlists, ...data.items]; url = data.next; }
      const onRepeatPlaylist = playlists.find(playlist => playlist.name === "En Boucle" || playlist.name === "On Repeat"); if (!onRepeatPlaylist) { console.warn("Playlist 'En Boucle' not found, using recently played songs instead"); await fetchRecentlyPlayed(); return; }
      const tracksRes = await fetch(`https://api.spotify.com/v1/playlists/${onRepeatPlaylist.id}/tracks?limit=50`, { headers: { Authorization: `${tokType} ${tok}` } });
      if (!tracksRes.ok) throw new Error(`Erreur lors de la récupération des chansons : ${tracksRes.status} - ${await tracksRes.text()}`); const tracksData = await tracksRes.json(); const tracks = tracksData.items.map(item => item.track).filter(track => track);
      if (tracks.length === 0) { console.warn("Playlist 'En Boucle' empty, using recently played songs instead"); await fetchRecentlyPlayed(); return; }
      const artistIds = [...new Set(tracks.flatMap(track => track.artists.map(artist => artist.id)))]; if (artistIds.length === 0) { console.warn("No artists found in 'En Boucle' playlist, using recently played songs instead"); await fetchRecentlyPlayed(); return; }
      const artistsRes = await fetch(`https://api.spotify.com/v1/artists?ids=${artistIds.join(",")}`, { headers: { Authorization: `${tokType} ${tok}` } });
      if (!artistsRes.ok) throw new Error(`Erreur lors de la récupération des artistes : ${artistsRes.status} - ${await artistsRes.text()}`); const artistsData = await artistsRes.json(); const artistsWithGenres = artistsData.artists;
      const genreCount = {}; artistsWithGenres.forEach(artist => { if (artist && artist.genres && artist.genres.length > 0) artist.genres.forEach(genre => { genreCount[genre] = (genreCount[genre] || 0) + 1; }); });
      if (Object.keys(genreCount).length === 0) { console.warn("No genres found for artists in 'En Boucle' playlist, using recently played songs instead"); await fetchRecentlyPlayed(); return; }
      const sortedGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]).slice(0, 10); const labels = sortedGenres.map(([genre]) => genre); const counts = sortedGenres.map(([, count]) => count);
      const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#66FF66", "#FF66CC", "#66CCCC", "#FF9933"];
      setGenresData({ labels, datasets: [{ label: "Nombre d'artistes", data: counts, backgroundColor: labels.map((_, index) => colors[index % colors.length]), borderColor: "#000", borderWidth: 1 }] });
    } catch (e) { setErrMsg(e.message || "cant fetch genres from 'En Boucle' playlist, try again"); console.error("fetchOnRepeatPlaylist error:", e); } finally { setLoading(false); }
  };

  const fetchArtistReleases = async artistId => { setLoading(true); setErrMsg(null); let tok = localStorage.getItem("access_token"); const expires = localStorage.getItem("expires_at"); const tokType = localStorage.getItem("token_type") || "Bearer";
    if (!tok || !expires || Date.now() >= parseInt(expires)) { tok = await refreshToken(); if (!tok) { setErrMsg("token refresh failed, please login again"); setLoading(false); return; } }
    try {
      let allReleases = []; let url = `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single,compilation,appears_on&limit=50&market=FR`;
      while (url) { const res = await fetch(url, { headers: { Authorization: `${tokType} ${tok}` } }); if (!res.ok) throw new Error(`Erreur HTTP : ${res.status} - ${await res.text()}`); const data = await res.json(); allReleases = [...allReleases, ...data.items]; url = data.next; }
      const formattedReleases = allReleases.map(item => ({ date: dayjs(item.release_date), title: item.name, type: item.album_type })); setAllReleases(formattedReleases);
      const currentDate = new Date("2025-04-06"); const futureReleases = formattedReleases.filter(item => new Date(item.date) > currentDate); setArtistReleases(futureReleases);
    } catch (e) { setErrMsg("cant fetch artist releases, try again"); console.error("fetch artist releases error:", e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchUserProfile(); fetchArtists(); fetchOnRepeatPlaylist(); }, []);

  const handleLogout = () => { localStorage.clear(); navigate("/"); };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,#1a1a1a_0%,#121212_100%)] text-white flex">
      <aside className="w-1/4 trueGray-900 p-4 rounded-2xl shadow-md border border-white-400 h-screen flex flex-col">
        <div className="flex items-center gap-2 text-lg font-bold mb-4"><img src={logo} alt="Logo" className="w-10 h-10"/></div>
        <input type="text" placeholder="Rechercher..." className="w-full p-2 mb-4 bg-gray-700 rounded text-white border border-gray-600"/>
        <nav className="flex-1"><ul className="space-y-2">
          <li><button className={`w-full flex items-center gap-2 p-2 rounded ${activeTab === "genres" ? "bg-gray-700 text-green-400" : "text-gray-400 hover:bg-gray-800"}`} onClick={() => setActiveTab("genres")}><FaChartPie className="text-lg"/>Genres</button></li>
          <li><button className={`w-full flex items-center gap-2 p-2 rounded ${activeTab === "history" ? "bg-gray-700 text-green-400" : "text-gray-400 hover:bg-gray-800"}`} onClick={() => setActiveTab("history")}><FaHistory className="text-lg"/>Historique</button></li>
          <li><button className={`w-full flex items-center gap-2 p-2 rounded ${activeTab === "artists" ? "bg-gray-700 text-green-400" : "text-gray-400 hover:bg-gray-800"}`} onClick={() => setActiveTab("artists")}><FaUserFriends className="text-lg"/>Artistes</button></li>
        </ul></nav>
        <div className="flex-1 overflow-y-auto">
          {activeTab === "genres" && (<div><h2 className="text-green-400 mt-4">Genres les plus écoutés (En Boucle)</h2><div className="mt-2 flex gap-2"><button onClick={() => setChartType("pie")} className={`p-2 rounded ${chartType === "pie" ? "bg-green-500 text-black" : "bg-gray-700 text-white"}`}>Graphique en secteurs</button><button onClick={() => setChartType("bar")} className={`p-2 rounded ${chartType === "bar" ? "bg-green-500 text-black" : "bg-gray-700 text-white"}`}>Histogramme</button></div>{loading ? (<p className="text-gray-400 mt-4">Chargement...</p>) : errMsg ? (<p className="text-red-500 mt-4">{errMsg}</p>) : genresData.labels.length > 0 ? (<div className="mt-4">{chartType === "pie" ? (<Pie data={genresData} options={{ responsive: true, plugins: { legend: { position: "bottom", labels: { color: "white" } } } }} />) : (<Bar data={genresData} options={{ responsive: true, scales: { x: { ticks: { color: "white" } }, y: { beginAtZero: true, ticks: { color: "white", stepSize: 1 } } }, plugins: { legend: { display: false } } }} />)}</div>) : (<p className="text-gray-400 mt-4">Aucun genre dispo pour la playlist 'En Boucle'.</p>)}</div>)}
          {activeTab === "history" && (<div><h2 className="text-green-400 mt-4">Historique des sorties (6 derniers mois)</h2><p className="text-gray-400 mt-4">Veuillez sélectionner un artiste pour voir son historique.</p></div>)}
          {activeTab === "artists" && (<div><h2 className="text-green-400 mt-4">Artistes suivis</h2>{loading ? (<p className="text-gray-400 mt-4">Chargement...</p>) : errMsg ? (<p className="text-red-500 mt-4">{errMsg}</p>) : (<div><ul className="mt-4 space-y-2 text-sm">{artists.length > 0 ? artists.map(artist => (<li key={artist.id} className="border-b border-gray-600 pb-1"><button onClick={() => { setChosenArtist(artist); fetchArtistReleases(artist.id); }} className="text-left w-full hover:text-green-400">{artist.name}</button></li>)) : (<li className="text-gray-400">Aucun artiste suivi.</li>)}</ul>{chosenArtist && (<div className="mt-4"><h3 className="text-green-400">Prochaines sorties de {chosenArtist.name}</h3>{loading ? (<p className="text-gray-400 mt-2">Chargement...</p>) : errMsg ? (<p className="text-red-500 mt-2">{errMsg}</p>) : artistReleases.length > 0 ? (<ul className="mt-2 space-y-2 text-sm">{artistReleases.map((release, i) => (<li key={i} className="border-b border-gray-600 pb-1">{release.title} - Sortie prévue le : {release.date.format("DD/MM/YYYY")} ({release.type})</li>))}</ul>) : (<p className="text-gray-400 mt-2">Aucune sortie future pour cet artiste.</p>)}</div>)}</div>)}</div>)}
        </div>
        <div className="mt-auto pt-4 border-t border-gray-600"><div className="flex items-center gap-2"><img src={user && user.images && user.images.length > 0 ? user.images[0].url : profileIcon} alt="Profil" className="w-8 h-8 rounded-full border border-gray-400 cursor-pointer"/>{user ? (<span className="text-gray-400 text-sm">{user.display_name}</span>) : (<span className="text-gray-400 text-sm">Chargement...</span>)}<button onClick={handleLogout} className="text-gray-400 text-sm hover:text-white ml-auto">Déconnexion</button></div></div>
      </aside>
      <main className="fixed top-0 right-0 w-3/4 h-screen trueGray-900 p-6 rounded-2xl shadow-md border border-white-400 overflow-hidden">
        <div className="flex justify-between items-center mb-4 text-white"><button onClick={prevMonth} className="text-xl px-2">◀</button><h1 className="text-3xl font-bold">{currentMonth.format("MMMM YYYY")}</h1><button onClick={nextMonth} className="text-xl px-2">▶</button></div>
        <div className="flex justify-center mb-4"><button onClick={goToToday} className="bg-green-500 text-black px-4 py-2 rounded">Today</button></div>
        <div className="grid grid-cols-7 gap-1 text-center text-sm">{daysOfWeek.map(day => (<div key={day} className="p-2 text-gray-300 font-bold">{day}</div>))}{generateDays().map((day, index) => { const isToday = day === today.date() && currentMonth.month() === today.month() && currentMonth.year() === today.year(); const artistEvents = chosenArtist ? allReleases.filter(release => release.date.date() === day && release.date.month() === currentMonth.month() && release.date.year() === currentMonth.year()) : []; const dayEvents = [...artistEvents]; return (<div key={index} className={`p-4 border rounded-md text-lg ${day ? "border-gray-700" : "bg-transparent"} ${dayEvents.length > 0 ? dayEvents.some(event => event.date.isAfter(today)) ? "bg-green-500 text-black font-bold cursor-pointer" : "bg-orange-500 text-black font-bold cursor-pointer" : ""} ${isToday ? "border-2 border-green-500" : ""}`} onClick={() => { if (day && dayEvents.length > 0) { setSelectedEvents(dayEvents); setPopup(true); } }}>{day}{dayEvents.length > 0 && (<div className="text-xs mt-1">{dayEvents.map((event, i) => (<div key={i}>{event.title}</div>))}</div>)}</div>); })}</div>
      </main>
      {popup && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-black p-6 rounded-lg shadow-lg border border-gray-600 max-w-md w-full"><h3 className="text-green-400 text-lg font-bold mb-4">Sorties le {selectedEvents[0].date.format("DD/MM/YYYY")}</h3>{selectedEvents.some(event => event.date.isAfter(today)) && (<div><h4 className="text-green-400 font-semibold mb-2">Sorties futures</h4>{selectedEvents.some(event => event.type === "album" && event.date.isAfter(today)) && (<div className="mb-4"><h5 className="text-white font-medium">Albums</h5><ul className="space-y-2 text-sm">{selectedEvents.filter(event => event.type === "album" && event.date.isAfter(today)).map((event, i) => (<li key={i} className="border-b border-gray-600 pb-1">{event.title}</li>))}</ul></div>)}{selectedEvents.some(event => event.type === "single" && event.date.isAfter(today)) && (<div className="mb-4"><h5 className="text-white font-medium">Sons/Singles</h5><ul className="space-y-2 text-sm">{selectedEvents.filter(event => event.type === "single" && event.date.isAfter(today)).map((event, i) => (<li key={i} className="border-b border-gray-600 pb-1">{event.title}</li>))}</ul></div>)}{selectedEvents.some(event => (event.type === "compilation" || event.type === "appears_on") && event.date.isAfter(today)) && (<div className="mb-4"><h5 className="text-white font-medium">Autres (Compilations/Feats)</h5><ul className="space-y-2 text-sm">{selectedEvents.filter(event => (event.type === "compilation" || event.type === "appears_on") && event.date.isAfter(today)).map((event, i) => (<li key={i} className="border-b border-gray-600 pb-1">{event.title}</li>))}</ul></div>)}</div>)}{selectedEvents.some(event => !event.date.isAfter(today)) && (<div><h4 className="text-orange-400 font-semibold mb-2">Sorties anciennes</h4>{selectedEvents.some(event => event.type === "album" && !event.date.isAfter(today)) && (<div className="mb-4"><h5 className="text-white font-medium">Albums</h5><ul className="space-y-2 text-sm">{selectedEvents.filter(event => event.type === "album" && !event.date.isAfter(today)).map((event, i) => (<li key={i} className="border-b border-gray-600 pb-1">{event.title}</li>))}</ul></div>)}{selectedEvents.some(event => event.type === "single" && !event.date.isAfter(today)) && (<div className="mb-4"><h5 className="text-white font-medium">Sons/Singles</h5><ul className="space-y-2 text-sm">{selectedEvents.filter(event => event.type === "single" && !event.date.isAfter(today)).map((event, i) => (<li key={i} className="border-b border-gray-600 pb-1">{event.title}</li>))}</ul></div>)}{selectedEvents.some(event => (event.type === "compilation" || event.type === "appears_on") && !event.date.isAfter(today)) && (<div className="mb-4"><h5 className="text-white font-medium">Autres (Compilations/Feats)</h5><ul className="space-y-2 text-sm">{selectedEvents.filter(event => (event.type === "compilation" || event.type === "appears_on") && !event.date.isAfter(today)).map((event, i) => (<li key={i} className="border-b border-gray-600 pb-1">{event.title}</li>))}</ul></div>)}</div>)}<button onClick={() => setPopup(false)} className="mt-4 bg-green-500 text-black px-4 py-2 rounded hover:bg-green-600">Fermer</button></div></div>)}
    </div>
  );
};

export default Calendar;