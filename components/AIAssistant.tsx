"use client";

import { useEffect, useRef, useState } from "react";
import { useEngine } from "@/lib/store";
import type { GameProject } from "@/lib/gameRuntime";
import { GENRES } from "@/lib/genres";
import { DESIGN_TEMPLATES } from "@/lib/templates";

// In-editor assistant. The user types an instruction ("make it a neon racer",
// "darker palette", "call it Voidrunner") and the app applies it to the open
// project — the Claude-Code-style "tell it what to do and it does it" flow.
export default function AIAssistant({ project }: { project: GameProject }) {
  const addChat = useEngine((s) => s.addChat);
  const updateProject = useEngine((s) => s.updateProject);
  const chats = useEngine((s) => s.chats[project.id] || []);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9e9, behavior: "smooth" });
  }, [chats.length]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    addChat(project.id, { role: "user", content: text, ts: Date.now() });
    setBusy(true);

    // Try the AI endpoint to interpret the instruction into a new spec.
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: `Current game: ${project.title}, ${project.dimension} ${project.blueprint}. Instruction: ${text}` }),
      });
      const spec = await res.json();
      const patch: Partial<GameProject> = {};
      const changes: string[] = [];

      const g = GENRES.find((x) => x.blueprint === spec.blueprint);
      if (g && spec.blueprint !== project.blueprint) {
        patch.blueprint = spec.blueprint;
        changes.push(`switched to a ${g.name.toLowerCase()}`);
      }
      if (spec.dimension && spec.dimension !== project.dimension && g?.dimensions.includes(spec.dimension)) {
        patch.dimension = spec.dimension;
        changes.push(`made it ${spec.dimension}`);
      }
      const tpl = DESIGN_TEMPLATES.find((t) => t.id === spec.templateId);
      if (tpl && tpl.id !== (project.config as any)?.templateId) {
        patch.palette = tpl.palette;
        patch.config = { ...project.config, templateId: tpl.id };
        changes.push(`applied the "${tpl.name}" look`);
      }
      // direct rename if user clearly named it
      const nameMatch = text.match(/(?:call|name|rename)(?:\s+it)?\s+["']?([^"'\n.]{2,40})["']?/i);
      if (nameMatch) {
        patch.title = nameMatch[1].trim();
        changes.push(`renamed it to "${patch.title}"`);
      }

      if (Object.keys(patch).length) updateProject(project.id, patch);

      const reply = changes.length
        ? `Done — ${changes.join(", ")}. The preview updated live. ${spec.usedAI ? "" : "(local mode)"}`
        : spec.reply || "I tweaked the project based on that.";
      addChat(project.id, { role: "assistant", content: reply, ts: Date.now() });
    } catch {
      addChat(project.id, {
        role: "assistant",
        content: "I couldn't reach the AI service, but you can change genre, dimension and design language from the panel above.",
        ts: Date.now(),
      });
    }
    setBusy(false);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-edge px-4 py-3 text-sm font-bold">
        🤖 AI Assistant
        <span className="ml-auto rounded-full bg-glow/20 px-2 py-0.5 text-[10px] font-semibold text-glow2">
          tell it what to change
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {chats.length === 0 && (
          <div className="rounded-xl border border-edge bg-panel2/40 p-3 text-xs leading-relaxed text-white/50">
            Try: <em>“make it a neon cyberpunk racer”</em>, <em>“darker horror palette”</em>, or{" "}
            <em>“rename it to Starfall”</em>. I’ll apply changes to your live build.
          </div>
        )}
        {chats.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
                m.role === "user" ? "bg-glow/25 text-white" : "border border-edge bg-panel2/60 text-white/80"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {busy && <div className="text-xs text-white/40">Thinking…</div>}
      </div>

      <div className="border-t border-edge p-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Describe a change…"
            className="flex-1 rounded-xl border border-edge bg-ink/60 px-3 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-glow"
          />
          <button onClick={send} disabled={busy} className="btn-primary rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
