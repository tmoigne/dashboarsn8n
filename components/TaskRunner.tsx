"use client";

import { useState, useRef, useCallback } from "react";
import type { Task, HistoryEntry } from "@/types";
import { getConfigAsync, toBase64 } from "@/lib/config";

interface Props {
  task: Task;
  onClose: () => void;
  onAddHistory: (entry: Omit<HistoryEntry, "id" | "timestamp">) => void;
  initialText?: string;
}

interface BatchResult {
  filename: string;
  status: "success" | "error";
  text: string;
}

type Status = "idle" | "loading" | "success" | "error";

function cleanText(raw: string): string {
  return raw
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
}

function formatResult(data: unknown): string {
  if (typeof data === "string") return cleanText(data);

  // OCR.space format: array with ParsedResults[0].ParsedText
  if (Array.isArray(data) && data.length > 0) {
    const first = data[0] as Record<string, unknown>;
    const parsed = first?.ParsedResults;
    if (Array.isArray(parsed) && parsed.length > 0) {
      const text = (parsed[0] as Record<string, unknown>)?.ParsedText;
      if (typeof text === "string") return cleanText(text);
    }
  }

  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (typeof obj.text === "string") return cleanText(obj.text);
    if (typeof obj.ParsedText === "string") return cleanText(obj.ParsedText);
  }

  return JSON.stringify(data, null, 2);
}

async function callProxy(
  webhookPath: string,
  body: Record<string, unknown>
): Promise<string> {
  const cfg = await getConfigAsync();
  const res = await fetch("/api/proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      __webhookPath: webhookPath,
      __apiKey: cfg?.apiKey ?? "",
      __baseUrl: cfg?.baseUrl ?? "",
      ...body,
    }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);
  const data = await res.json();
  return formatResult(data);
}

export default function TaskRunner({
  task,
  onClose,
  onAddHistory,
  initialText = "",
}: Props) {
  const [textInput, setTextInput] = useState(initialText);
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [displayText, setDisplayText] = useState("");
  const [batchResults, setBatchResults] = useState<BatchResult[]>([]);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [customPath, setCustomPath] = useState(task.webhookPath);
  const [outputFormat, setOutputFormat] = useState(task.outputFormats?.[0]?.id ?? "texte");
  const fileRef = useRef<HTMLInputElement>(null);

  const isFile = task.inputType === "image" || task.inputType === "pdf" || task.inputType === "file" || task.inputType === "document";

  const updateFiles = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (newFiles.length === 1 && newFiles[0].type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(newFiles[0]));
    } else {
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length > 0) updateFiles(dropped);
  }, [updateFiles]);

  const run = async () => {
    setStatus("loading");
    setDisplayText("");
    setBatchResults([]);

    try {
      if (isFile && files.length > 0) {
        setBatchProgress({ current: 0, total: files.length });
        const results: BatchResult[] = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          setBatchProgress({ current: i + 1, total: files.length });
          try {
            const base64 = await toBase64(file);
            const text = await callProxy(task.webhookPath, {
              task: task.id,
              filename: file.name,
              data: base64,
              mime: file.type,
              format: outputFormat,
            });
            results.push({ filename: file.name, status: "success", text });
            onAddHistory({
              taskId: task.id,
              taskLabel: task.label,
              webhookPath: task.webhookPath,
              status: "success",
              result: text,
            });
          } catch (err) {
            const msg =
              err instanceof Error ? err.message : "Erreur inconnue";
            results.push({ filename: file.name, status: "error", text: msg });
            onAddHistory({
              taskId: task.id,
              taskLabel: task.label,
              webhookPath: task.webhookPath,
              status: "error",
              result: msg,
            });
          }
        }

        setBatchResults(results);
        setStatus("success");
      } else {
        let body: Record<string, unknown>;
        if (task.id === "custom") {
          try {
            body = JSON.parse(textInput || "{}");
          } catch {
            throw new Error("JSON invalide — vérifie la syntaxe du payload");
          }
        } else {
          body = { task: task.id, text: textInput, format: outputFormat };
        }

        const path = task.id === "custom" ? customPath : task.webhookPath;
        const text = await callProxy(path, body);
        setDisplayText(text);
        setStatus("success");
        onAddHistory({
          taskId: task.id,
          taskLabel: task.label,
          webhookPath: path,
          status: "success",
          result: text,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setDisplayText(msg);
      setStatus("error");
      onAddHistory({
        taskId: task.id,
        taskLabel: task.label,
        webhookPath: task.id === "custom" ? customPath : task.webhookPath,
        status: "error",
        result: msg,
      });
    }
  };

  const canSubmit =
    status !== "loading" &&
    (isFile ? files.length > 0 : textInput.trim().length > 0);

  const isBatch = isFile && files.length > 1;

  return (
    <div className="slide-up fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <p className="font-mono text-xs text-dim uppercase tracking-widest mb-1">
              Tâche active
            </p>
            <h2 className="text-text font-semibold text-lg">{task.label}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-dim hover:text-text transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          {task.outputFormats && task.outputFormats.length > 1 && (
            <div className="space-y-2">
              <label className="font-mono text-xs text-dim uppercase tracking-widest">
                Format de sortie
              </label>
              <div className="flex gap-2">
                {task.outputFormats.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setOutputFormat(f.id)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs uppercase tracking-widest transition-colors ${
                      outputFormat === f.id
                        ? "bg-accent text-white"
                        : "border border-border text-dim hover:text-text hover:border-muted"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {task.id === "custom" && (
            <div className="space-y-2">
              <label className="font-mono text-xs text-dim uppercase tracking-widest">
                Chemin webhook
              </label>
              <input
                type="text"
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
                className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 font-mono text-sm text-text focus:outline-none focus:border-accent"
                placeholder="/webhook/mon-workflow"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="font-mono text-xs text-dim uppercase tracking-widest">
              {task.inputLabel}
            </label>
            {isFile ? (
              <div
                className={`drop-zone border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-muted transition-colors ${
                  dragging ? "dragging" : ""
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  className="hidden"
                  accept={
                    task.inputType === "image"
                      ? "image/*"
                      : task.inputType === "file"
                      ? ".csv,.txt,.json,.tsv"
                      : task.inputType === "document"
                      ? "image/*,application/pdf"
                      : "application/pdf"
                  }
                  onChange={(e) =>
                    updateFiles(Array.from(e.target.files ?? []))
                  }
                />
                {files.length > 0 ? (
                  <div className="space-y-2">
                    {previewUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewUrl}
                        alt="Aperçu"
                        className="max-h-48 mx-auto rounded-lg object-contain"
                      />
                    )}
                    <p className="font-mono text-accent text-sm">
                      {files.length === 1
                        ? files[0].name
                        : `${files.length} fichiers sélectionnés`}
                    </p>
                    <p className="text-dim text-xs">
                      {files.length === 1
                        ? `${(files[0].size / 1024).toFixed(1)} KB`
                        : `${(
                            files.reduce((a, f) => a + f.size, 0) / 1024
                          ).toFixed(1)} KB total`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-dim text-sm">Glisse tes fichiers ici</p>
                    <p className="text-dim/50 text-xs">
                      ou clique pour sélectionner (plusieurs fichiers OK)
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={6}
                placeholder={task.inputPlaceholder}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 font-mono text-sm text-text placeholder-dim focus:outline-none focus:border-accent resize-none transition-colors"
              />
            )}
          </div>

          {status === "loading" && isBatch && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-mono text-xs text-dim">
                  Traitement...
                </span>
                <span className="font-mono text-xs text-accent">
                  {batchProgress.current}/{batchProgress.total}
                </span>
              </div>
              <div className="h-1 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{
                    width: `${
                      (batchProgress.current / batchProgress.total) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          )}

          {status !== "idle" && !isBatch && (
            <div
              className={`rounded-xl border p-4 slide-up ${
                status === "success"
                  ? "border-green-800 bg-green-950/30"
                  : status === "error"
                  ? "border-red-800 bg-red-950/30"
                  : "border-border bg-bg"
              }`}
            >
              <p className="font-mono text-xs uppercase tracking-widest mb-2 text-dim">
                {status === "loading"
                  ? "Traitement..."
                  : status === "success"
                  ? "Résultat"
                  : "Erreur"}
              </p>
              {status === "loading" ? (
                <div className="flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent pulsing inline-block" />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-accent pulsing inline-block"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-accent pulsing inline-block"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              ) : (
                <pre className="whitespace-pre-wrap font-sans text-sm text-text leading-relaxed max-h-64 overflow-y-auto">
                  {displayText}
                </pre>
              )}
            </div>
          )}

          {batchResults.length > 0 && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {batchResults.map((r, i) => (
                <div
                  key={i}
                  className={`rounded-xl border p-4 ${
                    r.status === "success"
                      ? "border-green-800 bg-green-950/20"
                      : "border-red-800 bg-red-950/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-mono text-xs text-dim truncate flex-1">
                      {r.filename}
                    </p>
                    {r.status === "success" && (
                      <button
                        onClick={() => navigator.clipboard.writeText(r.text)}
                        className="font-mono text-xs text-dim hover:text-accent transition-colors ml-3 flex-shrink-0"
                      >
                        Copier
                      </button>
                    )}
                  </div>
                  <pre className="text-sm text-text whitespace-pre-wrap leading-relaxed">
                    {r.text}
                  </pre>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={run}
              disabled={!canSubmit}
              className="flex-1 bg-accent hover:bg-orange-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors font-mono text-sm uppercase tracking-widest"
            >
              {status === "loading"
                ? isBatch
                  ? `${batchProgress.current}/${batchProgress.total}...`
                  : "Envoi..."
                : "Exécuter"}
            </button>
            {status === "success" && !isBatch && (
              <button
                onClick={() => navigator.clipboard.writeText(displayText)}
                className="px-4 py-3 border border-border hover:border-muted text-dim hover:text-text rounded-xl transition-colors font-mono text-xs"
              >
                Copier
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
