"use client";

import { useState, useEffect, useCallback } from "react";

const CLAUDE_KEY = "claude_api_key";

interface UsageData {
  requests: { limit: string | null; remaining: string | null; reset: string | null };
  tokens: { limit: string | null; remaining: string | null; reset: string | null };
  input_tokens: { limit: string | null; remaining: string | null; reset: string | null };
}

function Bar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const color = pct > 80 ? "bg-green-500" : pct > 40 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="h-1 bg-border rounded-full overflow-hidden flex-1">
      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function fmt(n: string | null): number { return n ? parseInt(n, 10) : 0; }
function fmtReset(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = Math.max(0, Math.round((d.getTime() - Date.now()) / 1000));
  return diff < 60 ? `${diff}s` : `${Math.round(diff / 60)}min`;
}

export default function ClaudeUsage() {
  const [apiKey, setApiKey] = useState<string>("");
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    const k = localStorage.getItem(CLAUDE_KEY) ?? "";
    setApiKey(k);
  }, []);

  const fetch_ = useCallback(async (key: string) => {
    if (!key) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/claude-usage", {
        headers: { "x-claude-key": key },
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Erreur API");
      setData(json);
      setLastRefresh(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (apiKey) fetch_(apiKey);
  }, [apiKey, fetch_]);

  // Auto-refresh every 60s
  useEffect(() => {
    if (!apiKey) return;
    const id = setInterval(() => fetch_(apiKey), 60000);
    return () => clearInterval(id);
  }, [apiKey, fetch_]);

  if (!apiKey) return null;

  return (
    <div className="border border-border bg-surface rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-dim uppercase tracking-widest">Claude — Limites</span>
          {lastRefresh && (
            <span className="font-mono text-xs text-dim/40">
              {lastRefresh.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
        </div>
        <button
          onClick={() => fetch_(apiKey)}
          disabled={loading}
          className="font-mono text-xs text-dim hover:text-accent transition-colors disabled:opacity-30"
        >
          {loading ? "..." : "↻ Refresh"}
        </button>
      </div>

      {error && (
        <p className="font-mono text-xs text-red-400">{error}</p>
      )}

      {data && (
        <div className="space-y-3">
          {[
            { label: "Requêtes / min", d: data.requests },
            { label: "Tokens / min", d: data.tokens },
            { label: "Tokens input / min", d: data.input_tokens },
          ].map(({ label, d }) => {
            if (!d.limit) return null;
            const lim = fmt(d.limit);
            const rem = fmt(d.remaining);
            const used = lim - rem;
            return (
              <div key={label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-dim">{label}</span>
                  <span className="font-mono text-xs text-text">
                    {rem.toLocaleString()} / {lim.toLocaleString()}
                    {d.reset && <span className="text-dim/50 ml-1">↺ {fmtReset(d.reset)}</span>}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Bar value={rem} max={lim} />
                  <span className="font-mono text-xs text-dim/50 w-8 text-right">
                    {lim > 0 ? Math.round((used / lim) * 100) : 0}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {loading && !data && (
        <div className="flex gap-1.5 items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-accent pulsing" />
          <span className="w-1.5 h-1.5 rounded-full bg-accent pulsing" style={{ animationDelay: "0.2s" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-accent pulsing" style={{ animationDelay: "0.4s" }} />
        </div>
      )}
    </div>
  );
}
