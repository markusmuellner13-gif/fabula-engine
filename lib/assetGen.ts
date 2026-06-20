// Asset generation ("Higgsfield-style" creative layer).
//
// IMPORTANT honesty note: Higgsfield's generative models run on their servers
// and are exposed here only as MCP tools in the build assistant's environment,
// not as a public REST API the deployed site can call. So this module ships a
// real, working, deterministic procedural generator that runs entirely in the
// browser (sprites, backgrounds, tileable patterns) — and exposes a single
// `generateRemote()` seam where a hosted generation endpoint can be dropped in
// later without touching the UI.

export type AssetKind = "sprite" | "background" | "pattern";

export interface GeneratedAsset {
  id: string;
  kind: AssetKind;
  prompt: string;
  dataUrl: string;
  ts: number;
}

type Palette = { bg: string; primary: string; secondary: string; accent: string; text: string };

// --- deterministic PRNG so the same prompt yields the same asset ----------
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!];
}

function pickColors(prompt: string, palette: Palette): string[] {
  const p = prompt.toLowerCase();
  const base = [palette.primary, palette.secondary, palette.accent];
  if (/(fire|lava|ember|hot|red|blood)/.test(p)) return ["#ff4d2e", "#ffb703", "#7a1f0f", ...base];
  if (/(ice|frost|snow|cold|blue|water|ocean)/.test(p)) return ["#46f0ff", "#1b6ca8", "#cdf6ff", ...base];
  if (/(forest|leaf|grass|nature|green|poison)/.test(p)) return ["#43b047", "#1f5e2a", "#a7e063", ...base];
  if (/(neon|cyber|synth|night|purple)/.test(p)) return ["#ff007a", "#00e5ff", "#7c5cff", ...base];
  if (/(gold|treasure|coin|royal|yellow)/.test(p)) return ["#ffd000", "#b5893a", "#fff3b0", ...base];
  if (/(dark|shadow|ghost|grim|black)/.test(p)) return ["#9a0000", "#2a2a2a", "#e8e8e8", ...base];
  return base;
}

// --- SPRITE: mirrored pixel-art creature/object ----------------------------
function genSprite(prompt: string, palette: Palette): string {
  const rng = mulberry32(hashSeed("sprite|" + prompt));
  const grid = 9; // half-width is grid columns; mirrored to 18 wide visually... we draw grid x grid then mirror
  const cols = grid;
  const rows = 9;
  const colors = pickColors(prompt, palette);
  const cell = 14;
  const W = cols * 2 * cell;
  const H = rows * cell;
  const [c, ctx] = canvas(W, H);
  ctx.imageSmoothingEnabled = false;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const fill = rng() > 0.45;
      if (!fill) continue;
      const col = colors[Math.floor(rng() * colors.length)];
      ctx.fillStyle = col;
      // left + mirrored right
      ctx.fillRect(x * cell, y * cell, cell, cell);
      ctx.fillRect(W - (x + 1) * cell, y * cell, cell, cell);
    }
  }
  // subtle outline pass
  ctx.globalCompositeOperation = "destination-over";
  ctx.fillStyle = "#00000000";
  ctx.globalCompositeOperation = "source-over";
  return c.toDataURL("image/png");
}

// --- BACKGROUND: layered gradient sky + parallax silhouettes ----------------
function genBackground(prompt: string, palette: Palette): string {
  const rng = mulberry32(hashSeed("bg|" + prompt));
  const colors = pickColors(prompt, palette);
  const W = 480;
  const H = 270;
  const [c, ctx] = canvas(W, H);

  // sky gradient
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, palette.bg);
  g.addColorStop(1, colors[0]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // celestial body
  ctx.fillStyle = colors[2] || palette.accent;
  const sunR = 24 + rng() * 26;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.arc(60 + rng() * (W - 120), 50 + rng() * 60, sunR, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // stars / particles
  for (let i = 0; i < 60; i++) {
    ctx.fillStyle = palette.text;
    ctx.globalAlpha = rng() * 0.6;
    ctx.fillRect(rng() * W, rng() * H * 0.6, 1.5, 1.5);
  }
  ctx.globalAlpha = 1;

  // parallax silhouette ranges (back to front)
  const layers = [
    { color: colors[1] || palette.secondary, base: 0.62, amp: 0.12, alpha: 0.5 },
    { color: shade(colors[1] || palette.secondary, -20), base: 0.74, amp: 0.16, alpha: 0.7 },
    { color: shade(palette.bg, -30), base: 0.86, amp: 0.2, alpha: 1 },
  ];
  for (const L of layers) {
    ctx.globalAlpha = L.alpha;
    ctx.fillStyle = L.color;
    ctx.beginPath();
    ctx.moveTo(0, H);
    const step = 24;
    for (let x = 0; x <= W; x += step) {
      const y = H * (L.base + Math.sin((x / W) * Math.PI * (2 + rng() * 3)) * L.amp * rng());
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  return c.toDataURL("image/png");
}

// --- PATTERN: seamless tileable texture ------------------------------------
function genPattern(prompt: string, palette: Palette): string {
  const rng = mulberry32(hashSeed("pat|" + prompt));
  const colors = pickColors(prompt, palette);
  const S = 128;
  const [c, ctx] = canvas(S, S);
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, S, S);
  const n = 6 + Math.floor(rng() * 6);
  for (let i = 0; i < n; i++) {
    const col = colors[Math.floor(rng() * colors.length)];
    ctx.fillStyle = col;
    ctx.globalAlpha = 0.5 + rng() * 0.5;
    const x = rng() * S;
    const y = rng() * S;
    const r = 6 + rng() * 22;
    // draw tiled across edges for seamlessness
    for (const dx of [-S, 0, S]) {
      for (const dy of [-S, 0, S]) {
        ctx.beginPath();
        ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.globalAlpha = 1;
  return c.toDataURL("image/png");
}

function shade(hex: string, amt: number): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return hex;
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp(parseInt(m[1], 16) + amt);
  const g = clamp(parseInt(m[2], 16) + amt);
  const b = clamp(parseInt(m[3], 16) + amt);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/** Local, deterministic, offline asset generation. Always works. */
export function generateLocal(kind: AssetKind, prompt: string, palette: Palette): GeneratedAsset {
  const dataUrl =
    kind === "sprite" ? genSprite(prompt, palette) : kind === "background" ? genBackground(prompt, palette) : genPattern(prompt, palette);
  return { id: "a_" + Math.random().toString(36).slice(2, 9), kind, prompt, dataUrl, ts: Date.now() };
}

/**
 * Seam for a hosted generation backend (e.g. a Higgsfield-style image API).
 * Returns null if no backend is configured, so callers fall back to local gen.
 */
export async function generateRemote(kind: AssetKind, prompt: string): Promise<string | null> {
  try {
    const res = await fetch("/api/assets", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind, prompt }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.dataUrl === "string" ? data.dataUrl : null;
  } catch {
    return null;
  }
}
