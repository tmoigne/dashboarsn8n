"use client";

import { useState, useCallback, useEffect } from "react";
import type { N8nInstance } from "@/types";

export function useInstances() {
  const [instances, setInstances] = useState<N8nInstance[]>([]);
  const [activeInstance, setActive] = useState<N8nInstance | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/instances");
      if (!res.ok) return;
      const data: N8nInstance[] = await res.json();
      setInstances(data);
      setActive(data.find((i) => i.active) ?? data[0] ?? null);
    } catch {}
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const add = useCallback(async (data: Omit<N8nInstance, "id">) => {
    const res = await fetch("/api/instances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const inst = await res.json();
    await refresh();
    return inst as N8nInstance;
  }, [refresh]);

  const update = useCallback(async (instance: N8nInstance) => {
    await fetch(`/api/instances/${instance.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(instance),
    });
    await refresh();
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await fetch(`/api/instances/${id}`, { method: "DELETE" });
    await refresh();
  }, [refresh]);

  const switchTo = useCallback(async (id: string) => {
    await fetch(`/api/instances/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: true }),
    });
    await refresh();
  }, [refresh]);

  return { instances, activeInstance, add, update, remove, switchTo };
}
