"use client";

import { useState } from "react";
import { useEngine } from "@/lib/store";
import GameCanvas from "./GameCanvas";
import AIAssistant from "./AIAssistant";
import { buildGameHTML } from "@/lib/gameRuntime";
import { GENRES } from "@/lib/genres";
import { DESIGN_TEMPLATES } from "@/lib/templates";

export default function Editor() {
  const project = useEngine((s) => s.projects.find((p) => p.id === s.currentId));
  const updateProject = useEngine((s) => s.updateProject);
  const setView = useEngine((s) => s.setView);
  const [tab, setTab] = useState<"assistant" | "design">("assistant");

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center text-white/50">
        No project open.{" "}
        <button onClick={() => setView("dashboard")} className="ml-2 text-glow underline">
          Go to projects
        </button>
      </div>
    );
  }

  const genre = GENRES.find((g) => g.blueprint === project.blueprint);

  // Launch the game in its own standalone window (its own "app" on the device).
  function run() {
    if (!project) return;
    const html = buildGameHTML(project);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const w = window.open(
      url,
      "_blank",
      "popup=yes,width=1024,height=720,menubar=no,toolbar=no,location=no,status=no"
    );
    if (!w) {
      alert("Your browser blocked the game window. Please allow pop-ups for Fabula Engine and press Run again.");
    }
    setTimeout(() => URL.revokeObjectURL(url), 20000);
  }

  // Export a single-file build the user can host or wrap into a desktop app.
  function exportBuild() {
    if (!project) return;
    const html = buildGameHTML(project);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex h-full flex-col">
      {/* top bar */}
      <header className="flex items-center gap-3 border-b border-edge bg-panel/60 px-5 py-3 backdrop-blur">
        <span className="text-2xl">{genre?.emoji || "🎮"}</span>
        <input
          value={project.title}
          onChange={(e) => updateProject(project.id, { title: e.target.value })}
          className="min-w-0 flex-1 bg-transparent text-lg font-bold outline-none"
        />
        <span className="rounded-md bg-white/10 px-2 py-1 text-[11px] font-semibold">{project.dimension}</span>
        <span className="hidden rounded-md bg-white/10 px-2 py-1 text-[11px] font-semibold sm:inline">{genre?.name}</span>
        <button onClick={exportBuild} className="rounded-xl border border-edge px-4 py-2 text-sm font-semibold text-white/70 hover:bg-white/5">
          ⬇ Export
        </button>
        <button onClick={run} className="btn-primary rounded-xl px-5 py-2 text-sm font-bold text-white">
          ▶ Run
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* preview */}
        <div className="flex min-w-0 flex-1 flex-col p-4">
          <div className="mb-2 flex items-center justify-between text-xs text-white/40">
            <span>Live preview — fully playable</span>
            <span>Run opens it as its own window</span>
          </div>
          <div className="min-h-0 flex-1">
            <GameCanvas project={project} />
          </div>
        </div>

        {/* right panel */}
        <aside className="flex w-[360px] shrink-0 flex-col border-l border-edge bg-panel/40">
          <div className="flex border-b border-edge">
            {(["assistant", "design"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm font-semibold capitalize transition ${
                  tab === t ? "bg-glow/15 text-white" : "text-white/50 hover:bg-white/5"
                }`}
              >
                {t === "assistant" ? "🤖 Assistant" : "🎨 Design"}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1">
            {tab === "assistant" ? (
              <AIAssistant project={project} />
            ) : (
              <DesignPanel projectId={project.id} currentTemplate={(project.config as any)?.templateId} />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function DesignPanel({ projectId, currentTemplate }: { projectId: string; currentTemplate?: string }) {
  const updateProject = useEngine((s) => s.updateProject);
  const project = useEngine((s) => s.projects.find((p) => p.id === projectId));
  if (!project) return null;

  return (
    <div className="h-full overflow-y-auto p-4">
      <h4 className="mb-2 text-sm font-bold text-white/70">Genre</h4>
      <div className="mb-5 grid grid-cols-2 gap-2">
        {GENRES.filter((g) => g.dimensions.includes(project.dimension)).map((g) => (
          <button
            key={g.id}
            onClick={() => updateProject(projectId, { blueprint: g.blueprint })}
            className={`rounded-lg border p-2 text-left text-xs transition ${
              project.blueprint === g.blueprint ? "border-glow bg-glow/10" : "border-edge hover:border-white/30"
            }`}
          >
            <span className="mr-1">{g.emoji}</span>
            {g.name}
          </button>
        ))}
      </div>

      <h4 className="mb-2 text-sm font-bold text-white/70">Design language</h4>
      <div className="space-y-2">
        {DESIGN_TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => updateProject(projectId, { palette: t.palette, config: { ...project.config, templateId: t.id } })}
            className={`flex w-full items-center justify-between rounded-lg border p-2.5 text-left transition ${
              currentTemplate === t.id ? "border-glow bg-glow/10" : "border-edge hover:border-white/30"
            }`}
          >
            <span className="text-xs font-semibold">{t.name}</span>
            <span className="flex gap-1">
              {[t.palette.primary, t.palette.secondary, t.palette.accent].map((c) => (
                <span key={c} className="h-3 w-3 rounded-full" style={{ background: c }} />
              ))}
            </span>
          </button>
        ))}
      </div>

      <h4 className="mb-2 mt-5 text-sm font-bold text-white/70">Fine-tune colors</h4>
      <div className="grid grid-cols-2 gap-2">
        {(["bg", "primary", "secondary", "accent", "text"] as const).map((k) => (
          <label key={k} className="flex items-center justify-between rounded-lg border border-edge p-2 text-xs">
            <span className="capitalize text-white/60">{k}</span>
            <input
              type="color"
              value={project.palette[k]}
              onChange={(e) => updateProject(projectId, { palette: { ...project.palette, [k]: e.target.value } })}
              className="h-6 w-8 cursor-pointer rounded border-none bg-transparent"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
