"use client";

import { useEngine, type View } from "@/lib/store";

const NAV: { id: View; label: string; icon: string }[] = [
  { id: "dashboard", label: "Projects", icon: "🗂️" },
  { id: "new", label: "New Game", icon: "✨" },
  { id: "templates", label: "Design Library", icon: "🎨" },
  { id: "release", label: "Ship It", icon: "🚀" },
];

export default function Sidebar() {
  const view = useEngine((s) => s.view);
  const setView = useEngine((s) => s.setView);
  const projects = useEngine((s) => s.projects);
  const current = useEngine((s) => s.projects.find((p) => p.id === s.currentId));

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-edge bg-panel/60 backdrop-blur-xl">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-glow to-glow2 text-lg">
          ⚒️
        </div>
        <div className="leading-tight">
          <div className="text-sm font-black">
            <span className="gradient-text">Fabula</span>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-white/40">Engine</div>
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-3">
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => setView(n.id)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
              view === n.id
                ? "bg-glow/15 text-white ring-1 ring-glow/40"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className="text-base">{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>

      {current && (
        <button
          onClick={() => setView("editor")}
          className={`mx-3 mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
            view === "editor" ? "bg-glow/15 text-white ring-1 ring-glow/40" : "text-white/60 hover:bg-white/5"
          }`}
        >
          <span className="text-base">🎮</span>
          <span className="truncate">{current.title}</span>
        </button>
      )}

      <div className="mt-auto px-5 py-4 text-[11px] leading-relaxed text-white/30">
        <div className="mb-2 h-px w-full bg-edge" />
        {projects.length} project{projects.length === 1 ? "" : "s"} saved locally.
        <br />
        Built with Fabula Engine.
      </div>
    </aside>
  );
}
