import dayjs from "dayjs";

export const getGreeting = () => {
  const h = dayjs().hour();
  if (h < 6)  return "Bonne nuit,";
  if (h < 12) return "Bonjour,";
  if (h < 18) return "Bon après-midi,";
  return "Bonsoir,";
};

export const getReleaseTag = (tag) => {
  if (!tag) return null;
  if (tag.diff === -1) return "Hier";
  if (tag.diff === 0)  return "Aujourd'hui";
  if (tag.diff <= 7)   return `J-${tag.diff}`;
  return tag.date.format("D MMM");
};

export const getWhenLabel = (date, aujourdHui) => {
  const d = date.diff(aujourdHui, "day");
  if (d === 0) return { label: "Aujourd'hui", urgent: true };
  if (d === 1) return { label: "Demain", urgent: true };
  return { label: date.format("ddd D"), urgent: false };
};

export const typeLabel = (type) =>
  type === "album" ? "Album" : type === "single" ? "Single" : "EP";
