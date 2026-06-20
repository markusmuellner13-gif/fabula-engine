"use client";

import { useMemo } from "react";
import { buildGameHTML, type GameProject } from "@/lib/gameRuntime";

// Renders the live, playable preview inside a sandboxed iframe using srcDoc.
// Re-mounts whenever the project signature changes so edits show instantly.
export default function GameCanvas({ project }: { project: GameProject }) {
  const html = useMemo(() => buildGameHTML(project), [project]);
  const sig = `${project.id}-${project.blueprint}-${project.dimension}-${JSON.stringify(project.palette)}`;

  return (
    <iframe
      key={sig}
      title="Game preview"
      srcDoc={html}
      sandbox="allow-scripts allow-pointer-lock allow-same-origin"
      className="h-full w-full rounded-xl border border-edge bg-black"
    />
  );
}
