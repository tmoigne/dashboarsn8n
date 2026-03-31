import type { N8nInstance } from "@/types";

function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const INSTANCES_KEY = "n8n_instances";
const ACTIVE_KEY = "n8n_active_instance";

export function getInstances(): N8nInstance[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(INSTANCES_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveInstance(data: Omit<N8nInstance, "id">): N8nInstance {
  const newInstance: N8nInstance = { ...data, id: generateId() };
  const instances = [...getInstances(), newInstance];
  localStorage.setItem(INSTANCES_KEY, JSON.stringify(instances));
  return newInstance;
}

export function updateInstance(instance: N8nInstance): void {
  const instances = getInstances().map((i) =>
    i.id === instance.id ? instance : i
  );
  localStorage.setItem(INSTANCES_KEY, JSON.stringify(instances));
}

export function deleteInstance(id: string): void {
  const instances = getInstances().filter((i) => i.id !== id);
  localStorage.setItem(INSTANCES_KEY, JSON.stringify(instances));
  if (getActiveInstanceId() === id) {
    const next = instances[0];
    if (next) localStorage.setItem(ACTIVE_KEY, next.id);
    else localStorage.removeItem(ACTIVE_KEY);
  }
}

export function getActiveInstanceId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_KEY);
}

export function setActiveInstance(id: string): void {
  localStorage.setItem(ACTIVE_KEY, id);
}

export function getActiveInstance(): N8nInstance | null {
  const instances = getInstances();
  if (instances.length === 0) return null;
  const activeId = getActiveInstanceId();
  return instances.find((i) => i.id === activeId) ?? instances[0];
}
