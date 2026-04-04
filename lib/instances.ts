import type { N8nInstance } from "@/types";

// All instance data is now stored in the DB via /api/instances.
// These client-side stubs are kept for backward compatibility with hooks.
// The real data fetching happens in useInstances (async, via fetch).

export function getInstances(): N8nInstance[] { return []; }
export function getActiveInstance(): N8nInstance | null { return null; }
export function getActiveInstanceId(): string | null { return null; }
export function setActiveInstance(_id: string): void {}
export function saveInstance(_data: Omit<N8nInstance, "id">): N8nInstance {
  return { id: "", name: "", baseUrl: "", apiKey: "" };
}
export function updateInstance(_instance: N8nInstance): void {}
export function deleteInstance(_id: string): void {}
