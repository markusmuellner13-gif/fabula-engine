"use client";

import { useState } from "react";
import { useEngine } from "@/lib/store";
import { generateLocal, generateRemote, type AssetKind, type GeneratedAsset } from "@/lib/assetGen";
import type { GameProject } from "@/lib/gameRuntime";

const KINDS: { id: AssetKind; label: string; icon: string }[] = [
  { id: "sprite", label: "Sprite", icon: "👾" },
  { id: "background", label: "Background", icon: "🌄" },
  { id: "pattern", label: "Pattern", icon: "🔲" },
];

// "Higgsfield-style" asset generation panel. Generates sprites, backgrounds and
// tileable patterns from a text prompt. Backgrounds can be applied straight to
// the live game.
export default function AssetStudio({ project }: { project: GameProject }) {
  const updateProject = useEngine((s) => s.updateProject);
  const [kind, setKind] = useState<AssetKind>("background");
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [gallery, setGallery] = useState<GeneratedAsset[]>([]);

  async function generate() {
    const p = prompt.trim() || `${project.title} ${kind}`;
    if (busy) return;
    setBusy(true);
    // Try a hosted backend first; fall back to the offline generator.
    const remote = await generateRemote(kind, p);
    const asset: GeneratedAsset = remote
      ? { id: "a_" + Math.random().toString(36).slice(2, 9), kind, prompt: p, dataUrl: remote, ts: Date.now() }
      : generateLocal(kind, p, project.palette);
    setGallery((g) => [asset, ...g].slice(0, 12));
    setBusy(false);
  }

  function download(a: GeneratedAsset) {
    const el = document.createElement("a");
    el.href = a.dataUrl;
    el.download = `${a.kind}-${a.prompt.replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 24)}.png`;
    el.click();
  }

  function useAsBackground(a: GeneratedAsset) {
    updateProject(project.id, { config: { ...project.config, background: a.dataUrl } });
  }

  const hasBg = !!(project.config as any)?.background;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-edge px-4 py-3 text-sm font-bold">
        🎨 Asset Studio
        <span className="ml-auto rounded-full bg-glow/20 px-2 py-0.5 text-[10px] font-semibold text-glow2">generate</span>
      </div>

      <div className="space-y-3 border-b border-edge p-4">
        <div className="grid grid-cols-3 gap-2">
          {KINDS.map((k) => (
            <button
              key={k.id}
              onClick={() => setKind(k.id)}
              className={`rounded-lg border py-2 text-xs font-semibold transition ${
                kind === k.id ? "border-glow bg-glow/10 text-white" : "border-edge text-white/60 hover:border-white/30"
              }`}
            >
              <div className="text-base">{k.icon}</div>
              {k.label}
            </button>
          ))}
        </div>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
          placeholder={`Describe the ${kind}… (e.g. "fiery lava cavern")`}
          className="w-full rounded-xl border border-edge bg-ink/60 px-3 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-glow"
        />
        <button onClick={generate} disabled={busy} className="btn-primary w-full rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-60">
          {busy ? "Generating…" : "✨ Generate asset"}
        </button>
        {hasBg && (
          <button
            onClick={() => updateProject(project.id, { config: { ...project.config, background: undefined } })}
            className="w-full rounded-xl border border-edge py-2 text-xs text-white/60 hover:bg-white/5"
          >
            Remove game background
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {gallery.length === 0 ? (
          <p className="text-xs leading-relaxed text-white/40">
            Generated assets appear here. Backgrounds can be applied to your live game; everything is downloadable as PNG.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {gallery.map((a) => (
              <div key={a.id} className="overflow-hidden rounded-xl border border-edge bg-panel2/60">
                <img src={a.dataUrl} alt={a.prompt} className="h-24 w-full bg-black object-contain" />
                <div className="p-2">
                  <p className="truncate text-[10px] text-white/50">{a.prompt}</p>
                  <div className="mt-1.5 flex gap-1">
                    <button onClick={() => download(a)} className="flex-1 rounded-md bg-white/10 py-1 text-[10px] hover:bg-white/20" title="Download PNG">
                      ⬇
                    </button>
                    {a.kind === "background" && (
                      <button
                        onClick={() => useAsBackground(a)}
                        className="flex-1 rounded-md bg-glow/25 py-1 text-[10px] font-semibold text-white ring-1 ring-glow/30 hover:bg-glow/35"
                        title="Use as game background"
                      >
                        Use
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
