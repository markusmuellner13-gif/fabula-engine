import { NextResponse } from "next/server";
import { GENRES } from "@/lib/genres";
import { DESIGN_TEMPLATES } from "@/lib/templates";

// The "describe it and the app builds it" endpoint.
//
// If ANTHROPIC_API_KEY is configured it asks Claude to translate the user's
// description into a concrete game spec. Without a key it falls back to a
// local intent parser so the feature still works offline — just less cleverly.

export const runtime = "nodejs";

interface Spec {
  title: string;
  blueprint: string;
  dimension: "2D" | "3D";
  templateId: string;
  reply: string;
}

const BLUEPRINTS = GENRES.map((g) => g.blueprint);
const TEMPLATE_IDS = DESIGN_TEMPLATES.map((t) => t.id);

function localParse(prompt: string): Spec {
  const p = prompt.toLowerCase();
  const has = (...w: string[]) => w.some((x) => p.includes(x));

  let blueprint = "platformer";
  if (has("shoot", "shooter", "space", "bullet", "alien")) blueprint = "shooter";
  else if (has("runner", "endless", "flappy", "run")) blueprint = "runner";
  else if (has("horror", "scary", "monster", "dark", "fear")) blueprint = "horror";
  else if (has("race", "racing", "car", "drift", "track")) blueprint = "racer";
  else if (has("puzzle", "match", "memory", "logic", "brain")) blueprint = "puzzle";
  else if (has("story", "novel", "narrative", "dialogue", "choice")) blueprint = "story";
  else if (has("top", "adventure", "rpg", "explore", "zelda", "dungeon")) blueprint = "topdown";
  else if (has("platform", "jump", "mario", "side-scroll", "sidescroll")) blueprint = "platformer";

  let dimension: "2D" | "3D" = "2D";
  if (has("3d", "first person", "fps", "walk around", "world", "sandbox")) dimension = "3D";

  let templateId = "celeste-pixel";
  if (has("neon", "cyberpunk", "synth")) templateId = "cyberpunk-neon";
  else if (has("dark fantasy", "souls", "grim")) templateId = "soulslike";
  else if (has("noir", "silhouette", "shadow")) templateId = "limbo-noir";
  else if (has("minimal", "clean", "geometry", "calm")) templateId = "monument-minimal";
  else if (has("sci-fi", "scifi", "space", "cavern")) templateId = "metroid-dread";
  else if (has("mascot", "bright", "cheerful", "mushroom")) templateId = "classic-platform";
  else if (has("rogue", "underworld", "isometric")) templateId = "hades-isometric";

  // pull a title guess
  const m = prompt.match(/called\s+["']?([^"'\n.]{2,40})["']?/i) || prompt.match(/named\s+["']?([^"'\n.]{2,40})["']?/i);
  const title = m ? m[1].trim() : titleFrom(blueprint, dimension);

  const reply = `Got it — I'll scaffold a ${dimension} ${blueprint} called "${title}" using the "${
    DESIGN_TEMPLATES.find((t) => t.id === templateId)?.name
  }" design language. Hit Create and you'll have a playable build in seconds.`;

  return { title, blueprint, dimension, templateId, reply };
}

function titleFrom(bp: string, dim: string) {
  const a = ["Neon", "Crystal", "Shadow", "Lost", "Pixel", "Ember", "Astral", "Iron"];
  const b = { platformer: "Leap", shooter: "Vanguard", runner: "Dash", horror: "Hollow", racer: "Circuit", puzzle: "Cipher", story: "Saga", topdown: "Realm", scene3d: "Frontier" } as Record<string, string>;
  return `${a[Math.floor(Math.random() * a.length)]} ${b[bp] || "Quest"}`;
}

async function claudeParse(prompt: string, apiKey: string): Promise<Spec> {
  const sys = `You translate a user's plain-language game idea into a strict JSON spec for a browser game engine.
Allowed blueprint values: ${BLUEPRINTS.join(", ")}.
Allowed dimension values: 2D, 3D.
Allowed templateId values: ${TEMPLATE_IDS.join(", ")}.
Respond ONLY with minified JSON: {"title","blueprint","dimension","templateId","reply"} where reply is one friendly sentence to the user.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-8",
      max_tokens: 400,
      system: sys,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`anthropic ${res.status}: ${body.slice(0, 160)}`);
  }
  const data = await res.json();
  const text = data?.content?.[0]?.text || "{}";
  const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
  // validate against allowed sets, fall back where needed
  const local = localParse(prompt);
  return {
    title: typeof json.title === "string" ? json.title : local.title,
    blueprint: BLUEPRINTS.includes(json.blueprint) ? json.blueprint : local.blueprint,
    dimension: json.dimension === "3D" ? "3D" : "2D",
    templateId: TEMPLATE_IDS.includes(json.templateId) ? json.templateId : local.templateId,
    reply: typeof json.reply === "string" ? json.reply : local.reply,
  };
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "missing prompt" }, { status: 400 });
    }
    const key = process.env.ANTHROPIC_API_KEY;
    let spec: Spec;
    let usedAI = false;
    let aiError: string | undefined;
    let keyPresent = !!key;
    if (key) {
      try {
        spec = await claudeParse(prompt, key);
        usedAI = true;
      } catch (err) {
        aiError = err instanceof Error ? err.message : String(err);
        console.error("[ai] claude call failed:", aiError);
        spec = localParse(prompt);
      }
    } else {
      spec = localParse(prompt);
    }
    // `debug` only surfaces a safe reason string (status + provider message), never the key.
    const debug = req.headers.get("x-debug") === "1" ? { keyPresent, aiError } : undefined;
    return NextResponse.json({ ...spec, usedAI, ...(debug ? { debug } : {}) });
  } catch (e) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}
