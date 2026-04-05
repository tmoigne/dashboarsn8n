export async function isConfiguredAsync(): Promise<boolean> {
  try {
    const res = await fetch("/api/config");
    if (!res.ok) return false;
    const cfg = await res.json();
    return !!(cfg?.n8n_base_url && cfg?.n8n_api_key);
  } catch {
    return false;
  }
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
