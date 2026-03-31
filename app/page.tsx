"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfigGuard from "@/components/ConfigGuard";
import TaskRunner from "@/components/TaskRunner";
import HistoryPanel from "@/components/history/HistoryPanel";
import { TASKS } from "@/lib/tasks";
import { useHistory } from "@/hooks/useHistory";
import { useInstances } from "@/hooks/useInstances";
import type { Task, HistoryEntry } from "@/types";

const ICONS: Record<string, string> = {
  ScanText: "⌗",
  FileText: "⎙",
  FileSpreadsheet: "⊞",
  AlignLeft: "≡",
  Languages: "⇄",
  Tag: "◈",
  BarChart2: "▦",
  Table: "⊟",
  SpellCheck: "✓",
  Globe: "◉",
  Zap: "⚡",
};

export default function HomePage() {
  const router = useRouter();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [initialText, setInitialText] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showInstanceMenu, setShowInstanceMenu] = useState(false);
  const { history, add: addHistory, clear: clearHistory } = useHistory();
  const { instances, activeInstance, switchTo } = useInstances();

  const handleReload = (entry: HistoryEntry) => {
    const task = TASKS.find((t) => t.id === entry.taskId);
    if (!task) return;
    setInitialText(entry.result);
    setActiveTask(task);
    setShowHistory(false);
  };

  return (
    <ConfigGuard>
      <div className="min-h-screen bg-bg">
        {/* Topbar */}
        <header className="border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span className="font-mono text-sm text-text tracking-widest uppercase">
              Occitinfo / n8n
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* Instance switcher */}
            {instances.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowInstanceMenu((v) => !v)}
                  className="flex items-center gap-2 font-mono text-xs text-dim hover:text-text transition-colors uppercase tracking-widest"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {activeInstance?.name ?? "Instance"}
                  <span className="text-dim/40">▾</span>
                </button>
                {showInstanceMenu && (
                  <div className="absolute right-0 top-6 mt-1 w-56 bg-surface border border-border rounded-xl overflow-hidden z-50 shadow-xl">
                    {instances.map((inst) => (
                      <button
                        key={inst.id}
                        onClick={() => {
                          switchTo(inst.id);
                          setShowInstanceMenu(false);
                        }}
                        className={`w-full text-left px-4 py-3 font-mono text-xs transition-colors hover:bg-muted ${
                          inst.id === activeInstance?.id
                            ? "text-accent"
                            : "text-dim"
                        }`}
                      >
                        {inst.name}
                        <span className="block text-dim/40 text-xs truncate mt-0.5">
                          {inst.baseUrl}
                        </span>
                      </button>
                    ))}
                    <div className="border-t border-border">
                      <button
                        onClick={() => {
                          setShowInstanceMenu(false);
                          router.push("/settings");
                        }}
                        className="w-full text-left px-4 py-3 font-mono text-xs text-dim hover:text-text transition-colors hover:bg-muted"
                      >
                        + Gérer les instances
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => router.push("/settings")}
              className="font-mono text-xs text-dim hover:text-text transition-colors uppercase tracking-widest"
            >
              Config
            </button>
            <button
              onClick={() => setShowHistory((v) => !v)}
              className="relative font-mono text-xs text-dim hover:text-text transition-colors uppercase tracking-widest"
            >
              Historique
              {history.length > 0 && (
                <span className="absolute -top-1 -right-3 w-4 h-4 rounded-full bg-accent text-white text-[9px] flex items-center justify-center font-bold">
                  {history.length > 9 ? "9+" : history.length}
                </span>
              )}
            </button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-12">
          {/* Hero */}
          <div className="mb-14">
            <h1 className="text-4xl font-semibold text-text mb-3 tracking-tight">
              Automatisation
              <span className="text-accent"> n8n</span>
            </h1>
            <p className="text-dim font-sans text-base max-w-md">
              Sélectionne une tâche ci-dessous. Le fichier ou texte sera envoyé
              au workflow n8n correspondant.
            </p>
          </div>

          {/* Task grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TASKS.map((task) => (
              <button
                key={task.id}
                onClick={() => {
                  setInitialText("");
                  setActiveTask(task);
                }}
                className="group text-left bg-surface border border-border hover:border-accent/40 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/5"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-2xl text-accent/80 font-mono group-hover:text-accent transition-colors">
                    {ICONS[task.icon] ?? "◆"}
                  </span>
                  <span className="font-mono text-xs text-dim/60 bg-bg px-2 py-0.5 rounded-full">
                    {task.inputType.toUpperCase()}
                  </span>
                </div>
                <h3 className="font-semibold text-text text-base mb-1.5">
                  {task.label}
                </h3>
                <p className="text-dim text-sm leading-relaxed">
                  {task.description}
                </p>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="font-mono text-xs text-dim/60 truncate">
                    {task.webhookPath}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-border flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="font-mono text-xs text-dim">
              Connecté — webhooks actifs
            </span>
          </div>
        </main>

        {/* History panel */}
        {showHistory && (
          <HistoryPanel
            history={history}
            onClear={clearHistory}
            onReload={handleReload}
            onClose={() => setShowHistory(false)}
          />
        )}

        {/* Task modal */}
        {activeTask && (
          <TaskRunner
            task={activeTask}
            onClose={() => setActiveTask(null)}
            onAddHistory={addHistory}
            initialText={initialText}
          />
        )}
      </div>
    </ConfigGuard>
  );
}
