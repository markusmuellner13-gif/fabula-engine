// Design templates: original "design languages" the user can apply so their
// game shares the *structure and feel* of a familiar genre style WITHOUT using
// any copyrighted art, names, logos or assets. These are palettes + layout
// conventions only — generated procedurally at runtime.

export interface DesignTemplate {
  id: string;
  name: string;
  inspiredBy: string; // described as a vibe, not a brand
  palette: { bg: string; primary: string; secondary: string; accent: string; text: string };
  vibe: string;
  uiStyle: "minimal" | "retro" | "neon" | "painterly" | "blocky";
}

export const DESIGN_TEMPLATES: DesignTemplate[] = [
  {
    id: "classic-platform",
    name: "Mushroom Kingdom Feel",
    inspiredBy: "Bright mascot platformers",
    palette: { bg: "#5c94fc", primary: "#e52521", secondary: "#43b047", accent: "#fbd000", text: "#ffffff" },
    vibe: "Cheerful, bouncy, high-contrast blocks and warm skies.",
    uiStyle: "blocky",
  },
  {
    id: "metroid-dread",
    name: "Lonely Sci-Fi Caverns",
    inspiredBy: "Atmospheric exploration shooters",
    palette: { bg: "#0b0f1a", primary: "#ff7a00", secondary: "#2a3b5e", accent: "#46f0ff", text: "#d8e6ff" },
    vibe: "Isolated, moody, orange-on-deep-blue tension.",
    uiStyle: "neon",
  },
  {
    id: "soulslike",
    name: "Ashen Dark Fantasy",
    inspiredBy: "Punishing dark-fantasy action",
    palette: { bg: "#14110d", primary: "#b5893a", secondary: "#3a3026", accent: "#c0382b", text: "#e8dcc0" },
    vibe: "Grim, weighty, embers in the dark.",
    uiStyle: "painterly",
  },
  {
    id: "celeste-pixel",
    name: "Cozy Pixel Mountain",
    inspiredBy: "Expressive indie pixel platformers",
    palette: { bg: "#2b1b3d", primary: "#ff5277", secondary: "#5bc0eb", accent: "#ffd166", text: "#f7f0ff" },
    vibe: "Warm pixel art, soft gradients, emotional palette.",
    uiStyle: "retro",
  },
  {
    id: "hades-isometric",
    name: "Underworld Roguelite",
    inspiredBy: "Stylish isometric roguelites",
    palette: { bg: "#1a0f1f", primary: "#ff3d6e", secondary: "#7b2cbf", accent: "#ffb703", text: "#ffe8f0" },
    vibe: "Hot reds and purples, painterly UI, fast and flashy.",
    uiStyle: "painterly",
  },
  {
    id: "monument-minimal",
    name: "Serene Geometry",
    inspiredBy: "Minimalist optical-illusion puzzles",
    palette: { bg: "#f5e9da", primary: "#e76f51", secondary: "#2a9d8f", accent: "#e9c46a", text: "#264653" },
    vibe: "Calm pastels, clean shapes, lots of breathing room.",
    uiStyle: "minimal",
  },
  {
    id: "cyberpunk-neon",
    name: "Rainy Neon Sprawl",
    inspiredBy: "Neon dystopian cities",
    palette: { bg: "#06070f", primary: "#ff007a", secondary: "#00e5ff", accent: "#faff00", text: "#e6f7ff" },
    vibe: "Wet streets, magenta-cyan glow, chrome reflections.",
    uiStyle: "neon",
  },
  {
    id: "limbo-noir",
    name: "Silhouette Noir",
    inspiredBy: "Monochrome atmospheric horror",
    palette: { bg: "#0a0a0a", primary: "#e8e8e8", secondary: "#444444", accent: "#9a0000", text: "#f0f0f0" },
    vibe: "Black silhouettes, fog, a single bleed of red.",
    uiStyle: "minimal",
  },
];
