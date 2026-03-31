"use client";

import { useState, useCallback } from "react";
import { getHistory, addHistoryEntry, clearHistory } from "@/lib/history";
import type { HistoryEntry } from "@/types";

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => getHistory());

  const add = useCallback(
    (entry: Omit<HistoryEntry, "id" | "timestamp">) => {
      const newEntry = addHistoryEntry(entry);
      setHistory((prev) => [newEntry, ...prev].slice(0, 50));
      return newEntry;
    },
    []
  );

  const clear = useCallback(() => {
    clearHistory();
    setHistory([]);
  }, []);

  return { history, add, clear };
}
