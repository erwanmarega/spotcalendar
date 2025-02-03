import React, { useState } from "react";
import logo from "../assets/my-calendar.png";
import dayjs from "dayjs";
import "dayjs/locale/fr";

dayjs.locale("fr");

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const today = dayjs();

  const daysOfWeek = ["Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam.", "Dim."];
  
  const startOfMonth = currentMonth.startOf("month");
  const endOfMonth = currentMonth.endOf("month");
  const daysInMonth = endOfMonth.date();
  const startDay = startOfMonth.day();
  
  const prevMonth = () => setCurrentMonth(currentMonth.subtract(1, "month"));
  const nextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));

  const generateDays = () => {
    let days = [];
    for (let i = 1 - (startDay === 0 ? 6 : startDay - 1); i <= daysInMonth; i++) {
      days.push(i > 0 ? i : "");
    }
    return days;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex p-4">
      <aside className="w-1/4 bg-black p-4 rounded-2xl shadow-md">
        <div className="flex items-center gap-2 text-lg font-bold">
          <img src={logo} alt="Logo" className="w-10 h-10" />
          <span>My Calendar</span>
        </div>
        <h2 className="text-green-400 mt-4">Vos prochains évènements</h2>
        <input
          type="text"
          placeholder="Rechercher un événement..."
          className="w-full p-2 mt-2 bg-gray-700 rounded text-white border border-gray-600"
        />
        <ul className="mt-4 space-y-2 text-sm">
          {[...Array(4)].map((_, i) => (
            <li key={i} className="border-b border-gray-600 pb-1">
              12/03 évènement interne
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex-1 bg-black p-6 rounded-2xl shadow-md border border-gray-700 ml-4">
        <div className="flex justify-between items-center mb-4 text-white">
          <button onClick={prevMonth} className="text-xl px-2">◀</button>
          <h1 className="text-3xl font-bold">{currentMonth.format("MMMM YYYY")}</h1>
          <button onClick={nextMonth} className="text-xl px-2">▶</button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {daysOfWeek.map((day) => (
            <div key={day} className="p-2 text-gray-300 font-bold">{day}</div>
          ))}

          {generateDays().map((day, index) => {
            const isToday =
              day === today.date() &&
              currentMonth.month() === today.month() &&
              currentMonth.year() === today.year();

            return (
              <div
                key={index}
                className={`p-4 border rounded-md text-lg ${day ? "border-gray-700" : "bg-transparent"} 
                ${[9, 18, 25, 30].includes(day) ? "bg-green-500 text-black font-bold" : ""} 
                ${isToday ? "border-2 border-green-500" : ""}`}
              >
                {day}
                {[9, 18, 25, 30].includes(day) && (
                  <span className="block text-xs mt-1">Évènement interne</span>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Calendar;
