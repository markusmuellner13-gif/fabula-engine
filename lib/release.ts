// Release-readiness model. Drives the "Ship It" checklist that tells the user
// exactly what is done and what still blocks a store release (Steam etc.).

export type ReleaseCategory = "Build" | "Legal" | "Store" | "Polish";

export interface ChecklistItem {
  id: string;
  label: string;
  category: ReleaseCategory;
  /** how to evaluate completion from project state; null = manual checkbox */
  auto?: (p: ProjectReleaseState) => boolean;
  help: string;
  blocksRelease: boolean;
}

export interface ProjectReleaseState {
  hasName: boolean;
  hasIcon: boolean;
  hasPlayableBuild: boolean;
  hasDescription: boolean;
  manual: Record<string, boolean>;
}

export const CHECKLIST: ChecklistItem[] = [
  // BUILD
  {
    id: "playable",
    label: "Game has a playable build",
    category: "Build",
    auto: (p) => p.hasPlayableBuild,
    help: "Your project compiles and runs end-to-end with no crashes.",
    blocksRelease: true,
  },
  {
    id: "name",
    label: "Title is set",
    category: "Build",
    auto: (p) => p.hasName,
    help: "A unique title — check it isn't already trademarked on the store.",
    blocksRelease: true,
  },
  {
    id: "icon",
    label: "Icon / capsule art",
    category: "Build",
    auto: (p) => p.hasIcon,
    help: "Steam needs a header capsule (920×430) and library art.",
    blocksRelease: true,
  },
  {
    id: "win-build",
    label: "Native desktop build exported",
    category: "Build",
    help: "Wrap the web build (e.g. with Electron/Tauri) to ship an .exe Steam can launch.",
    blocksRelease: true,
  },
  // LEGAL
  {
    id: "ip",
    label: "All assets are original or licensed",
    category: "Legal",
    help: "No copyrighted characters, music, fonts or logos. Keep proof of licenses.",
    blocksRelease: true,
  },
  {
    id: "privacy",
    label: "Privacy policy (if you collect data)",
    category: "Legal",
    help: "Required if the game has accounts, analytics, ads or online play.",
    blocksRelease: false,
  },
  {
    id: "eula",
    label: "EULA / terms reviewed",
    category: "Legal",
    help: "Steam provides a default EULA; add a custom one only if you need it.",
    blocksRelease: false,
  },
  {
    id: "age-rating",
    label: "Content / age rating questionnaire",
    category: "Legal",
    help: "Steam requires you to fill the content-survey; some regions need IARC/PEGI/ESRB.",
    blocksRelease: true,
  },
  {
    id: "business",
    label: "Payee + tax info on store account",
    category: "Legal",
    help: "Steamworks requires the $100 app fee, bank + tax forms before release.",
    blocksRelease: true,
  },
  // STORE
  {
    id: "desc",
    label: "Store description & tags",
    category: "Store",
    auto: (p) => p.hasDescription,
    help: "Short + long description, genre tags and at least 5 screenshots.",
    blocksRelease: true,
  },
  {
    id: "trailer",
    label: "Trailer / gameplay video",
    category: "Store",
    help: "Strongly recommended — store algorithms favor pages with a trailer.",
    blocksRelease: false,
  },
  {
    id: "price",
    label: "Price & release date set",
    category: "Store",
    help: "Pick a price tier and a date at least 2 weeks out for visibility.",
    blocksRelease: true,
  },
  // POLISH
  {
    id: "settings",
    label: "Pause, settings & key rebinding",
    category: "Polish",
    help: "Players expect a pause menu, volume control and remappable input.",
    blocksRelease: false,
  },
  {
    id: "save",
    label: "Save / progress system",
    category: "Polish",
    help: "Persist progress so players can return to their game.",
    blocksRelease: false,
  },
  {
    id: "playtest",
    label: "Playtested by 3+ people",
    category: "Polish",
    help: "Fresh eyes catch the bugs and confusion you can't see anymore.",
    blocksRelease: false,
  },
];

export function evaluate(item: ChecklistItem, p: ProjectReleaseState): boolean {
  if (item.auto) return item.auto(p);
  return !!p.manual[item.id];
}

export function readiness(p: ProjectReleaseState): {
  done: number;
  total: number;
  percent: number;
  blockers: ChecklistItem[];
} {
  const done = CHECKLIST.filter((i) => evaluate(i, p)).length;
  const blockers = CHECKLIST.filter((i) => i.blocksRelease && !evaluate(i, p));
  return {
    done,
    total: CHECKLIST.length,
    percent: Math.round((done / CHECKLIST.length) * 100),
    blockers,
  };
}
