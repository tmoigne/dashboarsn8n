"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useInstances } from "@/hooks/useInstances";
import type { N8nInstance } from "@/types";

const CLAUDE_KEY = "claude_api_key";

interface FormState {
  name: string;
  baseUrl: string;
  apiKey: string;
}

const EMPTY_FORM: FormState = { name: "", baseUrl: "", apiKey: "" };

const WEBHOOKS = [
  "/webhook/ocr-image",
  "/webhook/extract-pdf",
  "/webhook/summarize",
  "/webhook/translate",
  "/webhook/classify",
  "/webhook/ping",
];

export default function SettingsPage() {
  const router = useRouter();
  const { instances, activeInstance, add, update, remove, switchTo } =
    useInstances();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"ok" | "error" | null>(null);
  const [claudeKey, setClaudeKey] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem(CLAUDE_KEY) ?? "" : ""
  );

  const isValid = form.name.trim() && form.baseUrl.trim() && form.apiKey.trim();

  const handleEdit = (inst: N8nInstance) => {
    setEditingId(inst.id);
    setForm({ name: inst.name, baseUrl: inst.baseUrl, apiKey: inst.apiKey });
    setTestResult(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setTestResult(null);
  };

  const handleSave = () => {
    if (!isValid) return;
    if (editingId) {
      update({ id: editingId, ...form });
    } else {
      const newInst = add(form);
      switchTo(newInst.id);
    }
    handleCancel();
    if (instances.length === 0 && !editingId) {
      router.push("/");
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          __webhookPath: "/webhook/ping",
          __apiKey: form.apiKey,
          __baseUrl: form.baseUrl,
          ping: true,
        }),
        signal: AbortSignal.timeout(8000),
      });
      setTestResult(res.ok ? "ok" : "error");
    } catch {
      setTestResult("error");
    } finally {
      setTesting(false);
    }
  };

  const showForm = editingId !== null || instances.length === 0;

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-accent font-mono text-2xl">⚡</span>
            <span className="font-mono text-sm text-dim uppercase tracking-widest">
              Occitinfo / n8n
            </span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-text">Configuration</h1>
            {instances.length > 0 && (
              <button
                onClick={() => router.push("/")}
                className="font-mono text-xs text-dim hover:text-text transition-colors uppercase tracking-widest"
              >
                ← Retour
              </button>
            )}
          </div>
          <p className="text-dim text-sm mt-2">
            Gère tes instances n8n. Chaque instance a sa propre URL et clé API.
          </p>
        </div>

        {/* Instances list */}
        {instances.length > 0 && (
          <div className="mb-8 space-y-3">
            <p className="font-mono text-xs text-dim uppercase tracking-widest mb-4">
              Instances ({instances.length})
            </p>
            {instances.map((inst) => (
              <div
                key={inst.id}
                className={`p-4 rounded-xl border transition-colors ${
                  inst.id === activeInstance?.id
                    ? "border-accent/40 bg-accent/5"
                    : "border-border bg-surface"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {inst.id === activeInstance?.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                      )}
                      <p className="font-semibold text-text text-sm">
                        {inst.name}
                      </p>
                    </div>
                    <p className="font-mono text-xs text-dim truncate">
                      {inst.baseUrl}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {inst.id !== activeInstance?.id && (
                      <button
                        onClick={() => switchTo(inst.id)}
                        className="font-mono text-xs text-dim hover:text-accent transition-colors"
                      >
                        Activer
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(inst)}
                      className="font-mono text-xs text-dim hover:text-text transition-colors"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => remove(inst.id)}
                      className="font-mono text-xs text-dim hover:text-red-400 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add button */}
        {instances.length > 0 && !showForm && (
          <button
            onClick={() => {
              setEditingId("");
              setForm(EMPTY_FORM);
            }}
            className="w-full py-3 border border-dashed border-border hover:border-muted text-dim hover:text-text rounded-xl transition-colors font-mono text-xs uppercase tracking-widest mb-8"
          >
            + Ajouter une instance
          </button>
        )}

        {/* Form */}
        {(showForm || editingId === "") && (
          <div className="space-y-5">
            <p className="font-mono text-xs text-dim uppercase tracking-widest">
              {editingId ? "Modifier l'instance" : "Nouvelle instance"}
            </p>

            <div className="space-y-2">
              <label className="font-mono text-xs text-dim uppercase tracking-widest block">
                Nom
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Production, Local, Test..."
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 font-mono text-sm text-text placeholder-dim focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="font-mono text-xs text-dim uppercase tracking-widest block">
                URL de base n8n
              </label>
              <input
                type="url"
                value={form.baseUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, baseUrl: e.target.value }))
                }
                placeholder="https://n8n.mondomaine.com"
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 font-mono text-sm text-text placeholder-dim focus:outline-none focus:border-accent transition-colors"
              />
              <p className="font-mono text-xs text-dim/60">
                Sans slash final — ex: http://192.168.1.50:5678
              </p>
            </div>

            <div className="space-y-2">
              <label className="font-mono text-xs text-dim uppercase tracking-widest block">
                Clé API (X-Api-Key)
              </label>
              <input
                type="password"
                value={form.apiKey}
                onChange={(e) =>
                  setForm((f) => ({ ...f, apiKey: e.target.value }))
                }
                placeholder="••••••••••••••••"
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 font-mono text-sm text-text placeholder-dim focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {testResult && (
              <div
                className={`rounded-xl border px-4 py-3 slide-up ${
                  testResult === "ok"
                    ? "border-green-800 bg-green-950/30 text-green-400"
                    : "border-red-800 bg-red-950/30 text-red-400"
                }`}
              >
                <p className="font-mono text-xs">
                  {testResult === "ok"
                    ? "✓ Connexion OK — /webhook/ping répond"
                    : "✗ Échec — vérifie l'URL et la clé"}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleTest}
                disabled={!isValid || testing}
                className="px-4 py-3 border border-border hover:border-muted disabled:opacity-30 disabled:cursor-not-allowed text-dim hover:text-text rounded-xl transition-colors font-mono text-xs uppercase tracking-widest"
              >
                {testing ? "Test..." : "Tester"}
              </button>
              <button
                onClick={handleSave}
                disabled={!isValid}
                className="flex-1 bg-accent hover:bg-orange-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors font-mono text-sm uppercase tracking-widest"
              >
                {editingId ? "Mettre à jour" : "Ajouter"}
              </button>
              {editingId && (
                <button
                  onClick={handleCancel}
                  className="px-4 py-3 border border-border hover:border-muted text-dim hover:text-text rounded-xl transition-colors font-mono text-xs"
                >
                  Annuler
                </button>
              )}
            </div>
          </div>
        )}

        {/* Claude API key */}
        <div className="mt-10 space-y-3">
          <p className="font-mono text-xs text-dim uppercase tracking-widest">
            Clé API Claude (Anthropic)
          </p>
          <p className="text-dim text-xs">Utilisée pour afficher les limites d'utilisation en temps réel.</p>
          <input
            type="password"
            value={claudeKey}
            onChange={(e) => {
              setClaudeKey(e.target.value);
              localStorage.setItem(CLAUDE_KEY, e.target.value);
            }}
            placeholder="sk-ant-••••••••••••••••"
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 font-mono text-sm text-text placeholder-dim focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Webhooks info */}
        <div className="mt-10 p-4 bg-surface border border-border rounded-xl">
          <p className="font-mono text-xs text-dim uppercase tracking-widest mb-3">
            Webhooks attendus
          </p>
          <div className="space-y-1.5">
            {WEBHOOKS.map((path) => (
              <p key={path} className="font-mono text-xs text-dim/70">
                {path}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
