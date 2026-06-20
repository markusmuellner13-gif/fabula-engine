// Genre + dimension catalog used by the New Project wizard. Each genre maps
// to a starter "blueprint" the runtime generator knows how to build.

export type Dimension = "2D" | "3D";

export interface Genre {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
  dimensions: Dimension[];
  /** which runtime blueprint to scaffold */
  blueprint: BlueprintId;
  modes: ("Single-player" | "Multiplayer" | "Co-op")[];
}

export type BlueprintId =
  | "platformer"
  | "topdown"
  | "shooter"
  | "runner"
  | "puzzle"
  | "story"
  | "horror"
  | "racer"
  | "scene3d";

export const GENRES: Genre[] = [
  {
    id: "platformer",
    name: "Platformer",
    emoji: "🍄",
    blurb: "Jump, dash and climb through handcrafted levels.",
    dimensions: ["2D"],
    blueprint: "platformer",
    modes: ["Single-player", "Co-op"],
  },
  {
    id: "topdown",
    name: "Top-Down Adventure",
    emoji: "🗺️",
    blurb: "Explore an open map, fight enemies, collect loot.",
    dimensions: ["2D"],
    blueprint: "topdown",
    modes: ["Single-player", "Co-op", "Multiplayer"],
  },
  {
    id: "shooter",
    name: "Arcade Shooter",
    emoji: "🚀",
    blurb: "Dodge bullets, blast waves of enemies, chase a high score.",
    dimensions: ["2D"],
    blueprint: "shooter",
    modes: ["Single-player", "Multiplayer"],
  },
  {
    id: "runner",
    name: "Endless Runner",
    emoji: "🏃",
    blurb: "One-button reflex game with rising difficulty.",
    dimensions: ["2D"],
    blueprint: "runner",
    modes: ["Single-player"],
  },
  {
    id: "puzzle",
    name: "Puzzle",
    emoji: "🧩",
    blurb: "Grid-based logic and match challenges.",
    dimensions: ["2D"],
    blueprint: "puzzle",
    modes: ["Single-player"],
  },
  {
    id: "story",
    name: "Story / Visual Novel",
    emoji: "📖",
    blurb: "Branching dialogue, choices and consequences.",
    dimensions: ["2D"],
    blueprint: "story",
    modes: ["Single-player"],
  },
  {
    id: "horror",
    name: "Horror",
    emoji: "🕯️",
    blurb: "Tension, darkness and things that chase you.",
    dimensions: ["2D", "3D"],
    blueprint: "horror",
    modes: ["Single-player", "Co-op"],
  },
  {
    id: "racer",
    name: "Racer",
    emoji: "🏎️",
    blurb: "Top-down or arcade racing against the clock.",
    dimensions: ["2D"],
    blueprint: "racer",
    modes: ["Single-player", "Multiplayer"],
  },
  {
    id: "sandbox3d",
    name: "3D Sandbox",
    emoji: "🧊",
    blurb: "A walkable 3D scene you can build out into anything.",
    dimensions: ["3D"],
    blueprint: "scene3d",
    modes: ["Single-player", "Multiplayer"],
  },
];

export const DIMENSIONS: { id: Dimension; label: string; desc: string }[] = [
  { id: "2D", label: "2D", desc: "Sprite-based. Fast to build, runs anywhere." },
  { id: "3D", label: "3D", desc: "WebGL scenes with real depth and camera." },
];
