"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TaskRunner from "@/components/TaskRunner";
import HistoryPanel from "@/components/history/HistoryPanel";
import ClaudeUsage from "@/components/ClaudeUsage";
import UsageStats from "@/components/UsageStats";
import StatsBar from "@/components/StatsBar";
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
  Receipt: "◻",
  ClipboardList: "☰",
  Zap: "⚡",
};

const CATEGORY: Record<string, string> = {
  "ocr-image": "IMAGE",
  "extract-pdf": "PDF",
  "extract-file": "FICHIER",
  summarize: "TEXTE",
  translate: "TEXTE",
  classify: "TEXTE",
  stats: "TEXTE",
  "csv-json": "DONNÉES",
  spellcheck: "TEXTE",
  "detect-lang": "TEXTE",
  "extract-invoice": "DOCUMENT",
  "extract-form": "IMAGE",
  custom: "WEBHOOK",
};

export default function HomePage() {
  const router = useRouter();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [initialText, setInitialText] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showInstanceMenu, setShowInstanceMenu] = useState(false);
  const { history, add: addHistory, clear: clearHistory } = useHistory();
  const { instances, activeInstance, switchTo } = useInstances();

  const notConfigured = instances.length === 0;

  const handleReload = (entry: HistoryEntry) => {
    const task = TASKS.find((t) => t.id === entry.taskId);
    if (!task) return;
    setInitialText(entry.result);
    setActiveTask(task);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface border-b border-border h-12 flex items-center justify-between px-6">
        <span className="font-mono text-sm text-text font-semibold">Tableau de bord</span>
        <div className="flex items-center gap-4">
          {instances.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowInstanceMenu((v) => !v)}
                className="flex items-center gap-2 font-mono text-xs text-dim hover:text-text transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green" />
                {activeInstance?.name ?? "Instance"}
                <span className="text-dim/40">▾</span>
              </button>
              {showInstanceMenu && (
                <div className="absolute right-0 top-6 mt-1 w-56 bg-surface border border-border rounded-lg overflow-hidden z-50 shadow-xl">
                  {instances.map((inst) => (
                    <button
                      key={inst.id}
                      onClick={() => { switchTo(inst.id); setShowInstanceMenu(false); }}
                      className={`w-full text-left px-4 py-3 font-mono text-xs transition-colors hover:bg-muted ${
                        inst.id === activeInstance?.id ? "text-green" : "text-dim"
                      }`}
                    >
                      {inst.name}
                      <span className="block text-dim/40 text-xs truncate mt-0.5">{inst.baseUrl}</span>
                    </button>
                  ))}
                  <div className="border-t border-border">
                    <button
                      onClick={() => { setShowInstanceMenu(false); router.push("/settings"); }}
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
            onClick={() => setShowHistory((v) => !v)}
            className="relative font-mono text-xs text-dim hover:text-text transition-colors"
          >
            Historique
            {history.length > 0 && (
              <span className="absolute -top-1 -right-3 w-4 h-4 rounded-full bg-green-dark text-white text-[9px] flex items-center justify-center font-bold">
                {history.length > 9 ? "9+" : history.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Bannière configuration manquante */}
      {notConfigured && (
        <div className="bg-yellow-950/40 border-b border-yellow-800/50 px-6 py-3 flex items-center justify-between gap-4">
          <p className="font-mono text-xs text-yellow-400">
            ⚠ Aucune instance n8n configurée — les tâches ne fonctionneront pas.
          </p>
          <Link
            href="/settings"
            className="flex-shrink-0 font-mono text-xs px-3 py-1.5 bg-yellow-800/40 hover:bg-yellow-700/40 text-yellow-300 rounded-lg transition-colors"
          >
            Configurer →
          </Link>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-6 py-8">
        <StatsBar history={history} instanceName={activeInstance?.name ?? null} />

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-xs text-dim uppercase tracking-widest">
            Tâches disponibles — {TASKS.length}
          </h2>
          <span className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${notConfigured ? "bg-yellow-500" : "bg-green"}`} />
            <span className="font-mono text-xs text-dim">
              {notConfigured ? "Non connecté" : "Webhooks actifs"}
            </span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TASKS.map((task) => (
            <button
              key={task.id}
              onClick={() => { setInitialText(""); setActiveTask(task); }}
              className="group text-left bg-surface border border-border hover:border-green/40 rounded-lg p-4 transition-all duration-150 hover:bg-muted"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${notConfigured ? "bg-yellow-500/50" : "bg-green"}`} />
                  <span className="font-mono text-base text-text/70 group-hover:text-green transition-colors">
                    {ICONS[task.icon] ?? "◆"}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-dim bg-bg border border-border px-2 py-0.5 rounded-full">
                  {CATEGORY[task.id] ?? task.inputType.toUpperCase()}
                </span>
              </div>
              <h3 className="font-semibold text-text text-sm mb-1">{task.label}</h3>
              <p className="text-dim text-xs leading-relaxed line-clamp-2">{task.description}</p>
              <div className="mt-3 pt-3 border-t border-border">
                <p className="font-mono text-[10px] text-dim/50 truncate">{task.webhookPath}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <UsageStats history={history} />
          <ClaudeUsage />
        </div>
      </main>

      {showHistory && (
        <HistoryPanel
          history={history}
          onClear={clearHistory}
          onReload={handleReload}
          onClose={() => setShowHistory(false)}
        />
      )}

      {activeTask && (
        <TaskRunner
          task={activeTask}
          onClose={() => setActiveTask(null)}
          onAddHistory={addHistory}
          initialText={initialText}
        />
      )}
    </div>
  );
}
