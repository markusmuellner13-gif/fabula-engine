"use client";

import { useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import NewProjectWizard from "@/components/NewProjectWizard";
import Editor from "@/components/Editor";
import DesignTemplates from "@/components/DesignTemplates";
import ReleaseChecklist from "@/components/ReleaseChecklist";
import { useEngine } from "@/lib/store";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const view = useEngine((s) => s.view);

  if (loading) return <LoadingScreen onDone={() => setLoading(false)} />;

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        {view === "dashboard" && <Dashboard />}
        {view === "new" && <NewProjectWizard />}
        {view === "editor" && <Editor />}
        {view === "templates" && <DesignTemplates />}
        {view === "release" && <ReleaseChecklist />}
      </main>
    </div>
  );
}
