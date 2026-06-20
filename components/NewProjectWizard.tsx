"use client";

import { useState } from "react";
import { useEngine } from "@/lib/store";
import { GENRES, DIMENSIONS, type Dimension } from "@/lib/genres";
import { DESIGN_TEMPLATES } from "@/lib/templates";

export default function NewProjectWizard() {
  const createProject = useEngine((s) => s.createProject);

  const [title, setTitle] = useState("");
  const [dimension, setDimension] = useState<Dimension>("2D");
  const [genreId, setGenreId] = useState("platformer");
  const [templateId, setTemplateId] = useState("celeste-pixel");

  // AI quick-build
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);

  const visibleGenres = GENRES.filter((g) => g.dimensions.includes(dimension));
  const selectedGenre = visibleGenres.find((g) => g.id === genreId) || visibleGenres[0];

  async function runAI() {
    if (!aiPrompt.trim() || aiBusy) return;
    setAiBusy(true);
    setAiNote(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const spec = await res.json();
      if (spec.error) throw new Error(spec.error);
      // immediately create the described game
      createProject({
        title: spec.title,
        blueprint: spec.blueprint,
        dimension: spec.dimension,
        templateId: spec.templateId,
      });
    } catch {
      setAiNote("Couldn't reach the AI service. Pick options manually below — it works the same.");
      setAiBusy(false);
    }
  }

  function createManual() {
    const g = GENRES.find((x) => x.id === genreId)!;
    createProject({ title, blueprint: g.blueprint, dimension, templateId });
  }

  return (
    <div className="h-full overflow-y-auto px-8 py-8">
      <h1 className="text-3xl font-black tracking-tight">Create a new game</h1>
      <p className="mt-1 text-white/50">Describe it and let the AI build it — or craft it by hand.</p>

      {/* AI quick build */}
      <section className="mt-6 rounded-2xl border border-glow/30 bg-gradient-to-br from-glow/10 to-glow2/5 p-5">
        <div className="mb-2 flex items-center gap-2 text-sm font-bold">
          <span>🤖</span> Build with AI
          <span className="rounded-full bg-glow/20 px-2 py-0.5 text-[10px] font-semibold text-glow2">describe → playable</span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runAI()}
            placeholder='e.g. "a spooky 2D horror game called Nightfall where you find 3 keys in the dark"'
            className="flex-1 rounded-xl border border-edge bg-ink/60 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-glow"
          />
          <button
            onClick={runAI}
            disabled={aiBusy}
            className="btn-primary rounded-xl px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {aiBusy ? "Building…" : "Build it ✨"}
          </button>
        </div>
        {aiNote && <p className="mt-2 text-xs text-amber-300/80">{aiNote}</p>}
      </section>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-white/30">
        <div className="h-px flex-1 bg-edge" /> or build manually <div className="h-px flex-1 bg-edge" />
      </div>

      {/* manual */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* dimension */}
        <div>
          <h3 className="mb-3 text-sm font-bold text-white/70">1 · Dimension</h3>
          <div className="flex flex-col gap-3">
            {DIMENSIONS.map((d) => (
              <button
                key={d.id}
                onClick={() => {
                  setDimension(d.id);
                  const first = GENRES.find((g) => g.dimensions.includes(d.id));
                  if (first) setGenreId(first.id);
                }}
                className={`rounded-xl border p-4 text-left transition ${
                  dimension === d.id ? "border-glow bg-glow/10" : "border-edge bg-panel2/50 hover:border-white/30"
                }`}
              >
                <div className="text-lg font-black">{d.label}</div>
                <div className="text-xs text-white/50">{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* genre */}
        <div>
          <h3 className="mb-3 text-sm font-bold text-white/70">2 · Genre</h3>
          <div className="grid max-h-[420px] grid-cols-1 gap-2 overflow-y-auto pr-1">
            {visibleGenres.map((g) => (
              <button
                key={g.id}
                onClick={() => setGenreId(g.id)}
                className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                  genreId === g.id ? "border-glow bg-glow/10" : "border-edge bg-panel2/50 hover:border-white/30"
                }`}
              >
                <span className="text-xl">{g.emoji}</span>
                <span>
                  <span className="block text-sm font-semibold">{g.name}</span>
                  <span className="block text-xs text-white/50">{g.blurb}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* design template */}
        <div>
          <h3 className="mb-3 text-sm font-bold text-white/70">3 · Design language</h3>
          <div className="grid max-h-[420px] grid-cols-1 gap-2 overflow-y-auto pr-1">
            {DESIGN_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplateId(t.id)}
                className={`rounded-xl border p-3 text-left transition ${
                  templateId === t.id ? "border-glow bg-glow/10" : "border-edge bg-panel2/50 hover:border-white/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{t.name}</span>
                  <span className="flex gap-1">
                    {[t.palette.primary, t.palette.secondary, t.palette.accent].map((c) => (
                      <span key={c} className="h-3 w-3 rounded-full" style={{ background: c }} />
                    ))}
                  </span>
                </div>
                <div className="text-xs text-white/40">Inspired by: {t.inspiredBy}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* footer create */}
      <div className="sticky bottom-0 mt-8 flex items-center gap-4 rounded-2xl border border-edge bg-panel/80 p-4 backdrop-blur">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`Title (e.g. ${selectedGenre?.name} Quest)`}
          className="flex-1 rounded-xl border border-edge bg-ink/60 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-glow"
        />
        <button onClick={createManual} className="btn-primary rounded-xl px-6 py-3 text-sm font-bold text-white">
          Create & Open Editor →
        </button>
      </div>
    </div>
  );
}
