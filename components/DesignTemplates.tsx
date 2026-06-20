"use client";

import { DESIGN_TEMPLATES } from "@/lib/templates";

export default function DesignTemplates() {
  return (
    <div className="h-full overflow-y-auto px-8 py-8">
      <h1 className="text-3xl font-black tracking-tight">Design Library</h1>
      <p className="mt-1 max-w-2xl text-white/50">
        Original design languages that capture the <em>feel</em> of well-known game styles — palettes, mood and UI
        structure only. No copyrighted art, names or logos are used, so games you make are safe to publish.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {DESIGN_TEMPLATES.map((t) => (
          <div key={t.id} className="card-hover overflow-hidden rounded-2xl border border-edge bg-panel2/60">
            {/* palette preview */}
            <div className="relative h-36" style={{ background: t.palette.bg }}>
              <div className="absolute inset-0 flex items-center justify-center gap-3">
                <span className="h-14 w-14 rounded-xl shadow-lg" style={{ background: t.palette.primary }} />
                <span className="h-10 w-10 rounded-lg shadow-lg" style={{ background: t.palette.secondary }} />
                <span className="h-8 w-8 rounded-full shadow-lg" style={{ background: t.palette.accent }} />
              </div>
              <span
                className="absolute bottom-2 right-3 text-xs font-bold"
                style={{ color: t.palette.text }}
              >
                {t.uiStyle}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-bold">{t.name}</h3>
              <p className="mt-0.5 text-xs text-glow2">Inspired by: {t.inspiredBy}</p>
              <p className="mt-2 text-sm text-white/55">{t.vibe}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-200/80">
        <strong>Why this is safe:</strong> these presets define color, mood and layout structure — the same way two
        racing games can both use red cars without infringing each other. They never copy a specific game's characters,
        artwork, fonts, names or sound. Apply one to any project, then make it yours.
      </div>
    </div>
  );
}
