"use client";

import type { HistoryEntry } from "@/types";

interface Props {
  history: HistoryEntry[];
}

export default function UsageStats({ history }: Props) {
  if (history.length === 0) return null;

  const total = history.length;
  const success = history.filter((h) => h.status === "success").length;
  const successRate = Math.round((success / total) * 100);

  // Count by task
  const counts: Record<string, { label: string; count: number; errors: number }> = {};
  for (const entry of history) {
    if (!counts[entry.taskId]) {
      counts[entry.taskId] = { label: entry.taskLabel, count: 0, errors: 0 };
    }
    counts[entry.taskId].count++;
    if (entry.status === "error") counts[entry.taskId].errors++;
  }

  const sorted = Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5);
  const max = sorted[0]?.count ?? 1;

  // Recent activity (last 7 days by day)
  const now = Date.now();
  const days: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    days[d.toLocaleDateString("fr-FR", { weekday: "short" })] = 0;
  }
  for (const entry of history) {
    const d = new Date(entry.timestamp);
    if (now - entry.timestamp < 7 * 86400000) {
      const key = d.toLocaleDateString("fr-FR", { weekday: "short" });
      if (key in days) days[key]++;
    }
  }
  const dayMax = Math.max(...Object.values(days), 1);

  return (
    <div className="border border-border bg-surface rounded-2xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-dim uppercase tracking-widest">Mes statistiques</span>
        <span className="font-mono text-xs text-dim/50">{total} exécution{total > 1 ? "s" : ""}</span>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: total },
          { label: "Succès", value: success },
          { label: "Taux", value: `${successRate}%` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-bg rounded-xl p-3 text-center">
            <p className="text-text font-semibold text-lg">{value}</p>
            <p className="font-mono text-xs text-dim mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Top tools */}
      <div className="space-y-2">
        <p className="font-mono text-xs text-dim/60 uppercase tracking-widest">Outils les plus utilisés</p>
        {sorted.map(({ label, count, errors }) => (
          <div key={label} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-text text-xs font-medium">{label}</span>
              <span className="font-mono text-xs text-dim">
                {count}x
                {errors > 0 && <span className="text-red-400 ml-1">({errors} erreur{errors > 1 ? "s" : ""})</span>}
              </span>
            </div>
            <div className="h-1 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-500"
                style={{ width: `${Math.round((count / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Activity last 7 days */}
      <div className="space-y-2">
        <p className="font-mono text-xs text-dim/60 uppercase tracking-widest">Activité — 7 derniers jours</p>
        <div className="flex items-end gap-1.5 h-10">
          {Object.entries(days).map(([day, count]) => (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-accent/70 rounded-sm transition-all duration-500"
                style={{ height: `${Math.round((count / dayMax) * 32)}px`, minHeight: count > 0 ? "3px" : "0" }}
              />
              <span className="font-mono text-xs text-dim/40">{day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
