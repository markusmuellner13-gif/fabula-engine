"use client";

import { useEngine } from "@/lib/store";
import { CHECKLIST, evaluate, readiness, type ProjectReleaseState, type ReleaseCategory } from "@/lib/release";

const CATEGORIES: ReleaseCategory[] = ["Build", "Legal", "Store", "Polish"];
const CAT_ICON: Record<ReleaseCategory, string> = { Build: "🔧", Legal: "⚖️", Store: "🛒", Polish: "✨" };

export default function ReleaseChecklist() {
  const project = useEngine((s) => s.projects.find((p) => p.id === s.currentId));
  const projects = useEngine((s) => s.projects);
  const manualMap = useEngine((s) => s.manual);
  const toggleManual = useEngine((s) => s.toggleManual);
  const openProject = useEngine((s) => s.openProject);

  if (!project) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-white/50">
        <div className="text-5xl">🚀</div>
        <p>Open a project to see its road to release.</p>
        {projects[0] && (
          <button onClick={() => openProject(projects[0].id)} className="btn-primary rounded-xl px-5 py-2.5 text-sm font-bold text-white">
            Open “{projects[0].title}”
          </button>
        )}
      </div>
    );
  }

  const state: ProjectReleaseState = {
    hasName: project.title.trim().length > 1,
    hasIcon: false, // becomes true once art is added; manual override available
    hasPlayableBuild: true, // every project has a runnable build in this engine
    hasDescription: !!(project.config as any)?.description,
    manual: manualMap[project.id] || {},
  };

  const r = readiness(state);
  const releasable = r.blockers.length === 0;

  return (
    <div className="h-full overflow-y-auto px-8 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Ship “{project.title}”</h1>
          <p className="mt-1 text-white/50">Everything you need before publishing to Steam and other stores.</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black tabular-nums">{r.percent}%</div>
          <div className="text-xs text-white/40">{r.done}/{r.total} complete</div>
        </div>
      </div>

      {/* progress bar */}
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all ${releasable ? "bg-green-400" : "bg-gradient-to-r from-glow to-glow2"}`}
          style={{ width: `${r.percent}%` }}
        />
      </div>

      {/* status banner */}
      <div
        className={`mt-4 rounded-2xl border p-4 text-sm ${
          releasable ? "border-green-500/40 bg-green-500/10 text-green-200" : "border-amber-500/30 bg-amber-500/5 text-amber-200/90"
        }`}
      >
        {releasable ? (
          <>✅ <strong>Release-ready.</strong> All blocking requirements are met. Build your desktop wrapper and submit to the store.</>
        ) : (
          <>
            ⏳ <strong>{r.blockers.length} blocker{r.blockers.length === 1 ? "" : "s"} left</strong> before you can release:{" "}
            {r.blockers.map((b) => b.label).join(", ")}.
          </>
        )}
      </div>

      {/* checklist by category */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {CATEGORIES.map((cat) => {
          const items = CHECKLIST.filter((i) => i.category === cat);
          return (
            <div key={cat} className="rounded-2xl border border-edge bg-panel2/50 p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
                <span>{CAT_ICON[cat]}</span> {cat}
              </h3>
              <ul className="space-y-2.5">
                {items.map((item) => {
                  const done = evaluate(item, state);
                  const auto = !!item.auto;
                  return (
                    <li key={item.id} className="flex items-start gap-3">
                      <button
                        disabled={auto}
                        onClick={() => !auto && toggleManual(project.id, item.id)}
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${
                          done ? "border-green-400 bg-green-400/20 text-green-300" : "border-white/30 text-transparent"
                        } ${auto ? "cursor-default opacity-90" : "cursor-pointer hover:border-glow"}`}
                        title={auto ? "Tracked automatically" : "Click to mark complete"}
                      >
                        ✓
                      </button>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-sm">
                          <span className={done ? "text-white/80 line-through decoration-white/30" : "text-white"}>
                            {item.label}
                          </span>
                          {item.blocksRelease && !done && (
                            <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold text-red-300">
                              REQUIRED
                            </span>
                          )}
                          {auto && (
                            <span className="rounded bg-glow/20 px-1.5 py-0.5 text-[9px] font-semibold text-glow2">AUTO</span>
                          )}
                        </div>
                        <p className="text-xs text-white/45">{item.help}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-edge bg-panel2/40 p-5 text-sm text-white/60">
        <h3 className="mb-2 font-bold text-white/80">📦 From web build to Steam</h3>
        <ol className="list-inside list-decimal space-y-1">
          <li>Hit <strong>Export</strong> in the editor to get your single-file game.</li>
          <li>Wrap it as a desktop app with <span className="text-glow2">Tauri</span> or <span className="text-glow2">Electron</span> to produce a Windows <code>.exe</code>.</li>
          <li>Create a Steamworks account ($100 one-time fee per app), fill the store page, content survey and tax/bank info.</li>
          <li>Upload your build with SteamPipe, set price &amp; date, then submit for review.</li>
        </ol>
        <p className="mt-2 text-xs text-white/40">
          This is general guidance, not legal advice. Confirm IP/licensing for every asset before you publish.
        </p>
      </div>
    </div>
  );
}
