import type { HistoryEntry } from "@/types";
import HistoryItem from "./HistoryItem";

interface Props {
  history: HistoryEntry[];
  onClear: () => void;
  onReload: (entry: HistoryEntry) => void;
  onClose: () => void;
}

export default function HistoryPanel({
  history,
  onClear,
  onReload,
  onClose,
}: Props) {
  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-surface border-l border-border flex flex-col z-40">
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <div>
          <p className="font-mono text-xs text-dim uppercase tracking-widest">
            Historique
          </p>
          <p className="text-text text-sm font-semibold mt-0.5">
            {history.length} entrée{history.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {history.length > 0 && (
            <button
              onClick={onClear}
              className="font-mono text-xs text-dim hover:text-red-400 transition-colors"
            >
              Vider
            </button>
          )}
          <button
            onClick={onClose}
            className="text-dim hover:text-text transition-colors w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {history.length === 0 ? (
          <p className="text-dim text-sm text-center mt-8">
            Aucune tâche exécutée
          </p>
        ) : (
          history.map((entry) => (
            <HistoryItem key={entry.id} entry={entry} onReload={onReload} />
          ))
        )}
      </div>
    </div>
  );
}
