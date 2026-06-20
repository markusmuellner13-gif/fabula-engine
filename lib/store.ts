"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GameProject } from "./gameRuntime";
import type { BlueprintId } from "./genres";
import { DESIGN_TEMPLATES } from "./templates";

export type View = "dashboard" | "new" | "editor" | "templates" | "release";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  ts: number;
}

interface EngineState {
  view: View;
  projects: GameProject[];
  currentId: string | null;
  chats: Record<string, ChatMessage[]>;
  // release manual checkboxes per project
  manual: Record<string, Record<string, boolean>>;

  setView: (v: View) => void;
  createProject: (p: {
    title: string;
    blueprint: BlueprintId;
    dimension: "2D" | "3D";
    templateId: string;
  }) => string;
  openProject: (id: string) => void;
  updateProject: (id: string, patch: Partial<GameProject>) => void;
  deleteProject: (id: string) => void;
  addChat: (id: string, m: ChatMessage) => void;
  toggleManual: (projectId: string, itemId: string) => void;
  current: () => GameProject | null;
}

export const useEngine = create<EngineState>()(
  persist(
    (set, get) => ({
      view: "dashboard",
      projects: [],
      currentId: null,
      chats: {},
      manual: {},

      setView: (v) => set({ view: v }),

      createProject: ({ title, blueprint, dimension, templateId }) => {
        const tpl = DESIGN_TEMPLATES.find((t) => t.id === templateId) || DESIGN_TEMPLATES[0];
        const id = "g_" + Math.random().toString(36).slice(2, 9);
        const project: GameProject = {
          id,
          title: title || "Untitled Game",
          blueprint,
          dimension,
          palette: tpl.palette,
          config: { templateId: tpl.id },
        };
        set((s) => ({
          projects: [project, ...s.projects],
          currentId: id,
          view: "editor",
        }));
        return id;
      },

      openProject: (id) => set({ currentId: id, view: "editor" }),

      updateProject: (id, patch) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),

      deleteProject: (id) =>
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          currentId: s.currentId === id ? null : s.currentId,
          view: s.currentId === id ? "dashboard" : s.view,
        })),

      addChat: (id, m) =>
        set((s) => ({ chats: { ...s.chats, [id]: [...(s.chats[id] || []), m] } })),

      toggleManual: (projectId, itemId) =>
        set((s) => {
          const cur = s.manual[projectId] || {};
          return { manual: { ...s.manual, [projectId]: { ...cur, [itemId]: !cur[itemId] } } };
        }),

      current: () => {
        const s = get();
        return s.projects.find((p) => p.id === s.currentId) || null;
      },
    }),
    { name: "fabula-engine-v1" }
  )
);
