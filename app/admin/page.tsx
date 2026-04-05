"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Key, ArrowLeft, Check, Wifi } from "lucide-react";

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionUser | null>(null);
  const [configLoaded, setConfigLoaded] = useState(false);

  const [n8nUrl, setN8nUrl] = useState("");
  const [n8nKey, setN8nKey] = useState("");
  const [claudeKey, setClaudeKey] = useState("");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"ok" | "error" | null>(null);

  // superadmin only
  useEffect(() => {
    fetch("/api/auth/session")
      .then(r => r.json())
      .then(s => {
        if (!s?.user) { router.push("/login"); return; }
        if (s.user.role !== "superadmin") { router.push("/"); return; }
        setSession(s.user);
      })
      .catch(() => router.push("/login"));
  }, [router]);

  const loadConfig = useCallback(() => {
    fetch("/api/config")
      .then(r => r.json())
      .then(cfg => {
        if (cfg.n8n_base_url)   setN8nUrl(cfg.n8n_base_url);
        if (cfg.n8n_api_key)    setN8nKey(cfg.n8n_api_key);
        if (cfg.claude_api_key) setClaudeKey(cfg.claude_api_key);
        setConfigLoaded(true);
      })
      .catch(() => setConfigLoaded(true));
  }, []);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  const saveAll = async () => {
    setSaving(true);
    await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        n8n_base_url:   n8nUrl.trim(),
        n8n_api_key:    n8nKey.trim(),
        claude_api_key: claudeKey.trim(),
      }),
    });
    setSaving(false);
    setSaved(true);
    setTestResult(null);
    setTimeout(() => setSaved(false), 2000);
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/instances/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseUrl: n8nUrl.trim(), apiKey: n8nKey.trim() }),
        signal: AbortSignal.timeout(10000),
      });
      const data = await res.json();
      setTestResult(data.ok ? "ok" : "error");
    } catch {
      setTestResult("error");
    } finally {
      setTesting(false);
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-surface border-b border-border h-12 flex items-center gap-3 px-6">
        <Link href="/" className="text-dim hover:text-text transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <span className="font-mono text-sm text-text font-semibold">Administration</span>
        <span className="font-mono text-xs px-2 py-0.5 rounded-full border border-purple-800 bg-purple-950/30 text-purple-400">
          superadmin
        </span>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-10">

        {/* Connexion n8n */}
        <section className="space-y-4">
          <p className="font-mono text-xs text-dim uppercase tracking-widest flex items-center gap-2">
            <Wifi size={12} /> Connexion n8n
          </p>
          {configLoaded && (
            <div className="space-y-3">
              <div>
                <label className="font-mono text-xs text-dim uppercase tracking-widest block mb-2">URL de base</label>
                <input
                  type="url"
                  value={n8nUrl}
                  onChange={e => { setN8nUrl(e.target.value); setTestResult(null); }}
                  placeholder="https://n8n.mondomaine.com"
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 font-mono text-sm text-text placeholder-dim focus:outline-none focus:border-green transition-colors"
                />
                <p className="font-mono text-xs text-dim/50 mt-1">Sans slash final — ex: http://192.168.1.50:5678</p>
              </div>
              <div>
                <label className="font-mono text-xs text-dim uppercase tracking-widest block mb-2">Clé API n8n</label>
                <input
                  type="password"
                  value={n8nKey}
                  onChange={e => { setN8nKey(e.target.value); setTestResult(null); }}
                  placeholder="••••••••••••••••"
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 font-mono text-sm text-text placeholder-dim focus:outline-none focus:border-green transition-colors"
                />
              </div>
              {testResult && (
                <div className={`rounded-xl border px-4 py-3 ${testResult === "ok" ? "border-green-800 bg-green-950/30 text-green-400" : "border-red-800 bg-red-950/30 text-red-400"}`}>
                  <p className="font-mono text-xs">
                    {testResult === "ok" ? "✓ Connexion OK — API n8n accessible" : "✗ Échec — vérifiez l'URL et la clé API"}
                  </p>
                </div>
              )}
              <button
                onClick={testConnection}
                disabled={testing || !n8nUrl || !n8nKey}
                className="font-mono text-xs px-4 py-2 border border-border hover:border-muted disabled:opacity-30 text-dim hover:text-text rounded-xl transition-colors uppercase tracking-widest"
              >
                {testing ? "Test…" : "Tester la connexion"}
              </button>
            </div>
          )}
        </section>

        {/* Clé Claude */}
        <section className="space-y-4">
          <p className="font-mono text-xs text-dim uppercase tracking-widest flex items-center gap-2">
            <Key size={12} /> Clé API Claude (Anthropic)
          </p>
          {configLoaded && (
            <input
              type="password"
              value={claudeKey}
              onChange={e => setClaudeKey(e.target.value)}
              placeholder="sk-ant-••••••••••••••••"
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 font-mono text-sm text-text placeholder-dim focus:outline-none focus:border-green transition-colors"
            />
          )}
        </section>

        {/* Save */}
        <button
          onClick={saveAll}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-green-dark hover:bg-green disabled:opacity-40 text-white rounded-xl font-mono text-sm uppercase tracking-widest transition-colors"
        >
          {saved ? <Check size={14} /> : null}
          {saving ? "Enregistrement…" : saved ? "Sauvegardé" : "Sauvegarder les paramètres"}
        </button>

        {/* Comptes */}
        <section className="pt-6 border-t border-border space-y-4">
          <p className="font-mono text-xs text-dim uppercase tracking-widest flex items-center gap-2">
            <Users size={12} /> Comptes collaborateurs
          </p>
          <p className="text-dim text-sm">
            Créez des comptes et choisissez quelles automatisations chaque collaborateur peut utiliser.
          </p>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 bg-surface border border-border hover:border-green/40 rounded-xl px-5 py-3 font-mono text-sm text-text transition-colors"
          >
            <Users size={15} className="text-dim" />
            Gérer les comptes →
          </Link>
        </section>

      </main>
    </div>
  );
}
