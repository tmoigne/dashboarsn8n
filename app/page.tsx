"use client";

import { useState, useEffect } from "react";
import TaskRunner from "@/components/TaskRunner";
import HistoryPanel from "@/components/history/HistoryPanel";
import ClaudeUsage from "@/components/ClaudeUsage";
import UsageStats from "@/components/UsageStats";
import StatsBar from "@/components/StatsBar";
import { TASKS } from "@/lib/tasks";
import { useHistory } from "@/hooks/useHistory";
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
  "pellet-ocr-livraison": "PELLET",
  "pellet-correcteur-email": "PELLET",
  "pellet-fiche-client": "PELLET",
};

export default function HomePage() {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [initialText, setInitialText] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [allowedTaskIds, setAllowedTaskIds] = useState<string[] | null>(null);
  const [n8nConfigured, setN8nConfigured] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string>("user");
  const { history, add: addHistory, clear: clearHistory } = useHistory();

  useEffect(() => {
    fetch("/api/me/tasks")
      .then((r) => r.json())
      .then((data) => {
        if (data.all) setAllowedTaskIds(null);
        else setAllowedTaskIds(data.taskIds ?? []);
      })
      .catch(() => setAllowedTaskIds(null));

    fetch("/api/config")
      .then((r) => r.json())
      .then((cfg) => setN8nConfigured(!!(cfg?.n8n_base_url && cfg?.n8n_api_key)))
      .catch(() => setN8nConfigured(false));

    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s) => { if (s?.user?.role) setUserRole(s.user.role); })
      .catch(() => {});
  }, []);

  const visibleTasks = allowedTaskIds === null
    ? TASKS
    : TASKS.filter((t) => allowedTaskIds.includes(t.id));

  const handleReload = (entry: HistoryEntry) => {
    const task = TASKS.find((t) => t.id === entry.taskId);
    if (!task) return;
    setInitialText(entry.result);
    setActiveTask(task);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-surface border-b border-border h-12 flex items-center justify-between px-6">
        <span className="font-mono text-sm text-text font-semibold">Tableau de bord</span>
        <div className="flex items-center gap-4">
          {["admin", "superadmin"].includes(userRole) && (
            <a href="/admin" className="font-mono text-xs text-dim hover:text-text transition-colors">
              Admin
            </a>
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

      {n8nConfigured === false && ["admin", "superadmin"].includes(userRole) && (
        <div className="bg-yellow-950/40 border-b border-yellow-800/50 px-6 py-3 flex items-center justify-between gap-4">
          <p className="font-mono text-xs text-yellow-400">
            ⚠ Connexion n8n non configurée — rendez-vous dans Admin pour l'ajouter.
          </p>
          <a
            href="/admin"
            className="flex-shrink-0 font-mono text-xs px-3 py-1.5 bg-yellow-800/40 hover:bg-yellow-700/40 text-yellow-300 rounded-lg transition-colors"
          >
            Configurer →
          </a>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <StatsBar history={history} instanceName={n8nConfigured ? "n8n" : null} />

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-xs text-dim uppercase tracking-widest">
            Automatisations disponibles — {visibleTasks.length}
          </h2>
          <span className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${n8nConfigured ? "bg-green" : "bg-yellow-500"}`} />
            <span className="font-mono text-xs text-dim">
              {n8nConfigured ? "n8n connecté" : "n8n non configuré"}
            </span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visibleTasks.map((task) => (
            <button
              key={task.id}
              onClick={() => { setInitialText(""); setActiveTask(task); }}
              className="group text-left bg-surface border border-border hover:border-green/40 rounded-xl p-4 transition-all duration-150 hover:bg-muted active:scale-[0.98]"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${n8nConfigured ? "bg-green" : "bg-yellow-500/50"}`} />
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
