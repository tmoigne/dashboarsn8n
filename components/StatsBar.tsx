"use client";

import type { HistoryEntry } from "@/types";

interface StatsBarProps {
  history: HistoryEntry[];
  instanceName: string | null;
}

export default function StatsBar({ history, instanceName }: StatsBarProps) {
  const total = history.length;
  const successes = history.filter((e) => e.status === "success").length;
  const rate = total > 0 ? Math.round((successes / total) * 100) : 0;
  const last = history[0];
  const lastStr = last
    ? new Date(last.timestamp).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const stats: { label: string; value: string; green?: boolean }[] = [
    { label: "Tâches exécutées", value: String(total) },
    { label: "Taux de succès", value: total > 0 ? `${rate}%` : "—", green: rate >= 90 },
    { label: "Dernière exécution", value: lastStr },
    { label: "Instance active", value: instanceName ?? "Non configurée" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-surface border border-border rounded-lg px-4 py-3"
        >
          <p className="font-mono text-[10px] text-dim uppercase tracking-widest mb-1">
            {s.label}
          </p>
          <p
            className={`font-mono text-lg font-bold ${
              s.green ? "text-green" : "text-text"
            }`}
          >
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}
