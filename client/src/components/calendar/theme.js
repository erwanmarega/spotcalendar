export const BG      = "var(--cal-bg, #0c0b0a)";
export const SURF    = "var(--cal-surf, #161412)";
export const SURF2   = "var(--cal-surf2, #1d1a17)";
export const SURF3   = "var(--cal-surf3, #26221d)";
export const HAIR    = "var(--cal-hair, #2a2622)";
export const HAIR2   = "var(--cal-hair2, #1f1c19)";
export const INK     = "var(--cal-ink, #f4ede0)";
export const INK_S   = "var(--cal-ink-s, #c9bfa9)";
export const INK_M   = "var(--cal-ink-m, #7c7468)";
export const INK_F   = "var(--cal-ink-f, #4a443c)";
export const GREEN   = "var(--cal-accent, #1db954)";
export const PEACH   = "var(--cal-peach, #f0c294)";

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
