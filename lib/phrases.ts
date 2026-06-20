// Loading-screen phrase generator. Combines hand-written lines with a
// procedural generator so the loading screen never feels repetitive.

const STATIC_PHRASES = [
  "Create your own games now.",
  "Where stories become playable worlds.",
  "Forging pixels into adventures…",
  "Every legend starts with a single frame.",
  "Compiling imagination…",
  "Your next world is loading.",
  "From idea to playable in minutes.",
  "Spinning up the dream loom…",
  "No code required. No limits either.",
  "Dream it. Describe it. Ship it.",
  "Summoning particles and possibility…",
  "Building the engine behind your epic.",
  "Worlds don't build themselves — but they're about to.",
  "Charging the creativity core…",
  "Painting the first horizon…",
];

const SUBJECTS = [
  "dungeons", "galaxies", "boss fights", "open worlds", "pixel heroes",
  "neon cities", "haunted halls", "racing tracks", "puzzle rooms",
  "magic systems", "co-op quests", "skill trees", "soundtracks", "loot tables",
];

const VERBS = [
  "Assembling", "Rendering", "Weaving", "Conjuring", "Calibrating",
  "Generating", "Stitching", "Sculpting", "Bootstrapping", "Tuning",
];

const TAILS = [
  "for your next hit", "with zero boilerplate", "at the speed of thought",
  "so you can just create", "pixel by pixel", "frame by frame",
  "ready to play", "built to ship",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Returns a freshly composed loading phrase. */
export function randomPhrase(): string {
  // 50/50 between a curated line and a procedurally generated one.
  if (Math.random() < 0.5) return pick(STATIC_PHRASES);
  return `${pick(VERBS)} ${pick(SUBJECTS)} ${pick(TAILS)}…`;
}

/** A short rotating set of distinct phrases for a single load session. */
export function phraseSequence(n = 6): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (out.length < n && guard < 200) {
    const p = randomPhrase();
    if (!seen.has(p)) {
      seen.add(p);
      out.push(p);
    }
    guard++;
  }
  return out;
}
