"use client";

import { useState, useCallback } from "react";
import {
  getInstances,
  saveInstance,
  updateInstance,
  deleteInstance,
  getActiveInstance,
  setActiveInstance,
} from "@/lib/instances";
import type { N8nInstance } from "@/types";

export function useInstances() {
  const [instances, setInstances] = useState<N8nInstance[]>(() =>
    getInstances()
  );
  const [activeInstance, setActive] = useState<N8nInstance | null>(() =>
    getActiveInstance()
  );

  const refresh = useCallback(() => {
    setInstances(getInstances());
    setActive(getActiveInstance());
  }, []);

  const add = useCallback(
    (data: Omit<N8nInstance, "id">) => {
      const newInstance = saveInstance(data);
      if (!getActiveInstance()) setActiveInstance(newInstance.id);
      refresh();
      return newInstance;
    },
    [refresh]
  );

  const update = useCallback(
    (instance: N8nInstance) => {
      updateInstance(instance);
      refresh();
    },
    [refresh]
  );

  const remove = useCallback(
    (id: string) => {
      deleteInstance(id);
      refresh();
    },
    [refresh]
  );

  const switchTo = useCallback(
    (id: string) => {
      setActiveInstance(id);
      refresh();
    },
    [refresh]
  );

  return { instances, activeInstance, add, update, remove, switchTo };
}
