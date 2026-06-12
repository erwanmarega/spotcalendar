const SPOTIFY_DARK = {
  "--cal-bg": "#0c0b0a",
  "--cal-surf": "#161412",
  "--cal-surf2": "#1d1a17",
  "--cal-surf3": "#26221d",
  "--cal-hair": "#2a2622",
  "--cal-hair2": "#1f1c19",
  "--cal-ink": "#f4ede0",
  "--cal-ink-s": "#c9bfa9",
  "--cal-ink-m": "#7c7468",
  "--cal-ink-f": "#4a443c",
  "--cal-accent": "#1db954",
  "--cal-peach": "#f0c294",
};

const SPOTIFY_LIGHT = {
  "--cal-bg": "#f3efe7",
  "--cal-surf": "#ffffff",
  "--cal-surf2": "#f1ece2",
  "--cal-surf3": "#e7e0d2",
  "--cal-hair": "#e1d9c9",
  "--cal-hair2": "#ece5d8",
  "--cal-ink": "#1a1712",
  "--cal-ink-s": "#4a443c",
  "--cal-ink-m": "#857c6e",
  "--cal-ink-f": "#a89e8c",
  "--cal-accent": "#1db954",
  "--cal-peach": "#b9762f",
};

const APPLE_DARK = {
  "--cal-bg": "#000000",
  "--cal-surf": "rgba(255,255,255,0.045)",
  "--cal-surf2": "rgba(255,255,255,0.07)",
  "--cal-surf3": "rgba(255,255,255,0.10)",
  "--cal-hair": "rgba(255,255,255,0.12)",
  "--cal-hair2": "rgba(255,255,255,0.16)",
  "--cal-ink": "#ffffff",
  "--cal-ink-s": "rgba(255,255,255,0.74)",
  "--cal-ink-m": "rgba(255,255,255,0.46)",
  "--cal-ink-f": "rgba(255,255,255,0.30)",
  "--cal-accent": "#fa2d6e",
  "--cal-peach": "#ff5e57",
};

const APPLE_LIGHT = {
  "--cal-bg": "#ffffff",
  "--cal-surf": "rgba(0,0,0,0.028)",
  "--cal-surf2": "rgba(0,0,0,0.05)",
  "--cal-surf3": "rgba(0,0,0,0.08)",
  "--cal-hair": "rgba(0,0,0,0.10)",
  "--cal-hair2": "rgba(0,0,0,0.14)",
  "--cal-ink": "#080808",
  "--cal-ink-s": "rgba(0,0,0,0.72)",
  "--cal-ink-m": "rgba(0,0,0,0.46)",
  "--cal-ink-f": "rgba(0,0,0,0.30)",
  "--cal-accent": "#fa2d6e",
  "--cal-peach": "#ff5e57",
};

export const PALETTES = {
  spotify: { dark: SPOTIFY_DARK, light: SPOTIFY_LIGHT },
  apple: { dark: APPLE_DARK, light: APPLE_LIGHT },
};

export const getPalette = (provider, mode) =>
  (PALETTES[provider] || PALETTES.spotify)[mode] || PALETTES.spotify.dark;
