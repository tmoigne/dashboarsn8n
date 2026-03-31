export interface WebhookConfig {
  baseUrl: string;
  apiKey: string;
}

export interface Task {
  id: string;
  label: string;
  description: string;
  icon: string;
  webhookPath: string;
  inputType: "image" | "pdf" | "text" | "file";
  inputLabel: string;
  inputPlaceholder?: string;
}

export interface HistoryEntry {
  id: string;
  taskId: string;
  taskLabel: string;
  webhookPath: string;
  timestamp: number;
  status: "success" | "error";
  result: string;
}

export interface N8nInstance {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
}
