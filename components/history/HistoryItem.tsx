import type { HistoryEntry } from "@/types";

interface Props {
  entry: HistoryEntry;
  onReload: (entry: HistoryEntry) => void;
}

export default function HistoryItem({ entry, onReload }: Props) {
  const date = new Date(entry.timestamp);
  const timeStr = date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateStr = date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  });

  return (
    <div className="group p-3 rounded-xl border border-border hover:border-muted transition-colors">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className="font-mono text-xs text-text truncate flex-1">
          {entry.taskLabel}
        </span>
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1 ${
            entry.status === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        />
      </div>
      <p className="text-dim text-xs leading-relaxed line-clamp-2 mb-2">
        {entry.result}
      </p>
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-dim/50">
          {dateStr} {timeStr}
        </span>
        <button
          onClick={() => onReload(entry)}
          className="font-mono text-xs text-dim hover:text-accent transition-colors opacity-0 group-hover:opacity-100"
        >
          Recharger →
        </button>
      </div>
    </div>
  );
}
