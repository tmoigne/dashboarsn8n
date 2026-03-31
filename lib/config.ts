import { getActiveInstance } from "@/lib/instances";
import type { WebhookConfig } from "@/types";

export type { WebhookConfig };

const LEGACY_CONFIG_KEY = "n8n_webhook_config";

export function getConfig(): WebhookConfig | null {
  // Active instance takes priority
  const instance = getActiveInstance();
  if (instance) return { baseUrl: instance.baseUrl, apiKey: instance.apiKey };

  // Fallback: legacy single-config (migration path)
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(LEGACY_CONFIG_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WebhookConfig;
  } catch {
    return null;
  }
}

export function isConfigured(): boolean {
  const cfg = getConfig();
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
