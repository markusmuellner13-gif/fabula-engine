"use client";

import { useEngine } from "@/lib/store";
import { GENRES } from "@/lib/genres";
import { DESIGN_TEMPLATES } from "@/lib/templates";

export default function Dashboard() {
  const projects = useEngine((s) => s.projects);
  const openProject = useEngine((s) => s.openProject);
  const deleteProject = useEngine((s) => s.deleteProject);
  const setView = useEngine((s) => s.setView);

  return (
    <div className="h-full overflow-y-auto px-8 py-8">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            Welcome back, <span className="gradient-text">creator</span>
          </h1>
          <p className="mt-1 text-white/50">Pick up a world or start a brand-new one.</p>
        </div>
        <button onClick={() => setView("new")} className="btn-primary rounded-xl px-5 py-3 text-sm font-bold text-white">
          ✨ New Game
        </button>
      </header>

      {projects.length === 0 ? (
        <EmptyState onNew={() => setView("new")} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((p) => {
            const genre = GENRES.find((g) => g.blueprint === p.blueprint);
            const tpl = DESIGN_TEMPLATES.find((t) => t.id === (p.config as any)?.templateId);
            return (
              <div key={p.id} className="card-hover group relative overflow-hidden rounded-2xl border border-edge bg-panel2/70">
                <div
                  className="flex h-32 items-center justify-center text-5xl"
                  style={{ background: `linear-gradient(135deg, ${p.palette.primary}, ${p.palette.accent})` }}
                >
                  {genre?.emoji || "🎮"}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="truncate font-bold">{p.title}</h3>
                    <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold">{p.dimension}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-white/40">
                    {genre?.name} · {tpl?.name || "Custom"}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => openProject(p.id)}
                      className="flex-1 rounded-lg bg-glow/20 px-3 py-2 text-xs font-semibold text-white ring-1 ring-glow/30 hover:bg-glow/30"
                    >
                      Open Editor
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${p.title}"? This can't be undone.`)) deleteProject(p.id);
                      }}
                      className="rounded-lg bg-white/5 px-3 py-2 text-xs text-white/50 hover:bg-red-500/20 hover:text-red-300"
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="glass flex flex-col items-center justify-center rounded-3xl px-8 py-20 text-center">
      <div className="mb-4 text-6xl animate-float">🌌</div>
      <h2 className="text-xl font-bold">No worlds yet</h2>
      <p className="mt-2 max-w-md text-white/50">
        Start from a genre and a design language, or just describe the game you want in the AI Assistant and watch it
        get built.
      </p>
      <button onClick={onNew} className="btn-primary mt-6 rounded-xl px-6 py-3 text-sm font-bold text-white">
        Create your first game
      </button>
    </div>
  );
}
