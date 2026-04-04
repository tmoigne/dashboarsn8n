"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useInstances } from "@/hooks/useInstances";
import { Users, Settings, Server, Key, ArrowLeft, Check } from "lucide-react";

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionUser | null>(null);
  const [claudeKey, setClaudeKey] = useState("");
  const [claudeKeySaving, setClaudeKeySaving] = useState(false);
  const [claudeKeySaved, setClaudeKeySaved] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);
  const { instances, activeInstance, add, remove, switchTo } = useInstances();

  // Auth guard — superadmin only
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
        if (cfg.claude_api_key) setClaudeKey(cfg.claude_api_key);
        setConfigLoaded(true);
      })
      .catch(() => setConfigLoaded(true));
  }, []);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  const saveClaudeKey = async () => {
    setClaudeKeySaving(true);
    await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claude_api_key: claudeKey }),
    });
    setClaudeKeySaving(false);
    setClaudeKeySaved(true);
    setTimeout(() => setClaudeKeySaved(false), 2000);
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

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Link href="/admin/users" className="flex flex-col gap-3 bg-surface border border-border hover:border-green/40 rounded-xl p-5 transition-colors group">
            <Users size={20} className="text-dim group-hover:text-green transition-colors" />
            <div>
              <p className="font-semibold text-text text-sm">Comptes</p>
              <p className="font-mono text-xs text-dim mt-0.5">Gérer les utilisateurs</p>
            </div>
          </Link>
          <Link href="/settings" className="flex flex-col gap-3 bg-surface border border-border hover:border-green/40 rounded-xl p-5 transition-colors group">
            <Server size={20} className="text-dim group-hover:text-green transition-colors" />
            <div>
              <p className="font-semibold text-text text-sm">Instances n8n</p>
              <p className="font-mono text-xs text-dim mt-0.5">Connexions n8n</p>
            </div>
          </Link>
          <Link href="/" className="flex flex-col gap-3 bg-surface border border-border hover:border-green/40 rounded-xl p-5 transition-colors group">
            <Settings size={20} className="text-dim group-hover:text-green transition-colors" />
            <div>
              <p className="font-semibold text-text text-sm">Dashboard</p>
              <p className="font-mono text-xs text-dim mt-0.5">Retour à l'app</p>
            </div>
          </Link>
        </div>

        {/* Instances n8n */}
        <section className="space-y-4">
          <p className="font-mono text-xs text-dim uppercase tracking-widest">
            Instances n8n — {instances.length}
          </p>
          {instances.length === 0 ? (
            <p className="text-dim text-sm font-mono">Aucune instance configurée.</p>
          ) : (
            <div className="space-y-3">
              {instances.map(inst => (
                <div
                  key={inst.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                    inst.id === activeInstance?.id
                      ? "border-green/40 bg-green/5"
                      : "border-border bg-surface"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {inst.id === activeInstance?.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-green" />
                      )}
                      <p className="font-semibold text-text text-sm">{inst.name}</p>
                    </div>
                    <p className="font-mono text-xs text-dim truncate mt-0.5">{inst.baseUrl}</p>
                  </div>
                  <div className="flex gap-2">
                    {inst.id !== activeInstance?.id && (
                      <button
                        onClick={() => switchTo(inst.id)}
                        className="font-mono text-xs text-dim hover:text-green transition-colors"
                      >
                        Activer
                      </button>
                    )}
                    <button
                      onClick={() => remove(inst.id)}
                      className="font-mono text-xs text-dim hover:text-red-400 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 font-mono text-xs text-dim hover:text-green transition-colors"
          >
            <Server size={12} /> Gérer les instances →
          </Link>
        </section>

        {/* Claude API key */}
        <section className="space-y-4">
          <p className="font-mono text-xs text-dim uppercase tracking-widest flex items-center gap-2">
            <Key size={12} /> Clé API Claude (Anthropic)
          </p>
          {configLoaded && (
            <div className="flex gap-3">
              <input
                type="password"
                value={claudeKey}
                onChange={e => setClaudeKey(e.target.value)}
                placeholder="sk-ant-••••••••••••••••"
                className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 font-mono text-sm text-text placeholder-dim focus:outline-none focus:border-green transition-colors"
              />
              <button
                onClick={saveClaudeKey}
                disabled={claudeKeySaving}
                className="flex items-center gap-2 px-4 py-3 bg-green-dark hover:bg-green disabled:opacity-40 text-white rounded-xl font-mono text-xs uppercase tracking-widest transition-colors"
              >
                {claudeKeySaved ? <Check size={14} /> : null}
                {claudeKeySaving ? "..." : claudeKeySaved ? "Sauvegardé" : "Sauvegarder"}
              </button>
            </div>
          )}
          <p className="font-mono text-xs text-dim/50">
            Stockée en base de données — partagée avec tous les utilisateurs.
          </p>
        </section>

      </main>
    </div>
  );
}
