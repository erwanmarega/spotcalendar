export const BG      = "#0c0b0a";
export const SURF    = "#161412";
export const SURF2   = "#1d1a17";
export const SURF3   = "#26221d";
export const HAIR    = "#2a2622";
export const HAIR2   = "#1f1c19";
export const INK     = "#f4ede0";
export const INK_S   = "#c9bfa9";
export const INK_M   = "#7c7468";
export const INK_F   = "#4a443c";
export const GREEN   = "#1db954";
export const PEACH   = "#f0c294";

const COVER_GRADS = [
  "linear-gradient(135deg,#f0c294,#8b4a2f)",
  "linear-gradient(135deg,#b4a4d6,#4a3a78)",
  "linear-gradient(135deg,#e89aa3,#8b3a45)",
  "linear-gradient(135deg,#91b6d1,#2c5478)",
  "linear-gradient(135deg,#e8b864,#8a6420)",
  "linear-gradient(135deg,#c98a55,#5c2f15)",
  "linear-gradient(135deg,#2a2622,#c98a55)",
  "linear-gradient(135deg,#4a443c,#1a1814)",
];

export const getGrad = (seed) => {
  const code = typeof seed === "string" ? (seed.charCodeAt(0) || 0) : (seed || 0);
  return COVER_GRADS[Math.abs(code) % COVER_GRADS.length];
};
