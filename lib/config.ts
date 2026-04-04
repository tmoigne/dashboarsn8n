import type { WebhookConfig, N8nInstance } from "@/types";

export type { WebhookConfig };

export async function getConfigAsync(): Promise<WebhookConfig | null> {
  try {
    const res = await fetch("/api/instances");
    if (!res.ok) return null;
    const instances: N8nInstance[] = await res.json();
    const active = instances.find((i) => i.active) ?? instances[0] ?? null;
    if (active) return { baseUrl: active.baseUrl, apiKey: active.apiKey };
  } catch {}
  return null;
}

export async function isConfiguredAsync(): Promise<boolean> {
  const cfg = await getConfigAsync();
  return !!(cfg?.baseUrl && cfg?.apiKey);
}

export function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
