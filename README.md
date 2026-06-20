# ⚒️ Fabula Engine

**The AI-native game engine where stories become playable worlds.**

Fabula Engine is a browser-based game studio. Describe a game in plain language and
watch it become a playable build, or craft it by hand across 2D and 3D genres. Tune the
look with original "design language" presets, run your game as its own standalone window,
and follow a guided checklist all the way to a store release.

## Features

- 🤖 **Build with AI** — type what you want ("a neon cyberpunk racer called Voidrunner")
  and the engine scaffolds a playable game. In-editor assistant applies live changes on command.
- 🎮 **Make games by hand** — 2D & 3D, across platformer, top-down adventure, arcade shooter,
  endless runner, puzzle, story/visual-novel, horror, racer and 3D sandbox blueprints.
  Single-player, co-op and multiplayer modes.
- 🎨 **Design Library** — original palettes + UI structures inspired by famous styles
  (mascot platformer, dark fantasy, neon city, cozy pixel, silhouette noir…), with **zero**
  copyrighted assets so your game is safe to publish.
- ▶ **Run button** — launches your game in its own dedicated window, like a real app.
- ⬇ **Export** — single self-contained `.html` build you can host or wrap into a desktop `.exe`.
- 🚀 **Ship It checklist** — live readiness %, blocking requirements, and Steam + legal
  guidance (content rating, IP/licensing, store page, payee/tax, native build).
- 🌌 **Loading screen** with procedurally generated phrases.

## How the "AI" works (honest version)

Fabula Engine does **not** re-implement Fable or Higgsfield's proprietary models — that
isn't possible; those run on their own servers. Instead the engine has its own AI layer:

- A `/api/ai` endpoint that turns plain-language descriptions into concrete game specs.
  Set `ANTHROPIC_API_KEY` to use Claude for rich interpretation; without it a built-in
  local intent parser handles the same job offline.
- The available **Higgsfield** generation tools (image / video / 3D / audio) can be wired in
  as the asset-generation layer where credentials are configured.

Everything ships working out of the box; adding keys just makes it smarter.

## Run locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

Optional: copy `.env.example` to `.env.local` and add your `ANTHROPIC_API_KEY`.

## Tech

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Zustand · a custom
vanilla-canvas 2D engine + Three.js for 3D. Deployed on Vercel with auto-deploy on every push.

---

*Built with Fabula Engine. This README's release guidance is informational, not legal advice.*
