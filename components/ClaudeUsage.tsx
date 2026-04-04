"use client";

import { useState, useEffect, useCallback } from "react";

interface UsageData {
  ok: boolean;
  usage?: { input_tokens: number | null; output_tokens: number | null };
  requests: { limit: string | null; remaining: string | null; reset: string | null };
  tokens: { limit: string | null; remaining: string | null; reset: string | null };
  input_tokens: { limit: string | null; remaining: string | null; reset: string | null };
  allHeaders?: Record<string, string>;
}

function Bar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const color = pct > 60 ? "bg-green-500" : pct > 25 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="h-1 bg-border rounded-full overflow-hidden flex-1">
      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function fmt(n: string | null): number { return n ? parseInt(n, 10) : 0; }
function fmtReset(iso: string | null): string {
  if (!iso) return "";
  const diff = Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 1000));
  return diff < 60 ? `${diff}s` : `${Math.round(diff / 60)}min`;
}

export default function ClaudeUsage() {
  const [apiKey, setApiKey] = useState("");
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then(r => r.json())
      .then(cfg => { if (cfg.claude_api_key) setApiKey(cfg.claude_api_key); })
      .catch(() => {});
  }, []);

  const fetchUsage = useCallback(async (key: string) => {
    if (!key) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/claude-usage", {
        headers: { "x-claude-key": key },
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
      setLastRefresh(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (apiKey) fetchUsage(apiKey); }, [apiKey, fetchUsage]);
  useEffect(() => {
    if (!apiKey) return;
    const id = setInterval(() => fetchUsage(apiKey), 60000);
    return () => clearInterval(id);
  }, [apiKey, fetchUsage]);

  if (!apiKey) return null;

  const rateLimits = [
    { label: "Requêtes / min", d: data?.requests },
    { label: "Tokens / min", d: data?.tokens },
    { label: "Tokens input / min", d: data?.input_tokens },
  ].filter(({ d }) => d?.limit);

  return (
    <div className="border border-border bg-surface rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-dim uppercase tracking-widest">Claude — API</span>
          {lastRefresh && (
            <span className="font-mono text-xs text-dim/40">
              {lastRefresh.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
        </div>
        <button
          onClick={() => fetchUsage(apiKey)}
          disabled={loading}
          className="font-mono text-xs text-dim hover:text-accent transition-colors disabled:opacity-30"
        >
          {loading ? "..." : "↻"}
        </button>
      </div>

      {error && (
        <div className="bg-red-950/30 border border-red-800 rounded-xl px-3 py-2">
          <p className="font-mono text-xs text-red-400">✗ {error}</p>
        </div>
      )}

      {loading && !data && (
        <div className="flex gap-1.5 items-center py-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent pulsing" />
          <span className="w-1.5 h-1.5 rounded-full bg-accent pulsing" style={{ animationDelay: "0.2s" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-accent pulsing" style={{ animationDelay: "0.4s" }} />
        </div>
      )}

      {data && (
        <>
          {/* Token usage de la dernière requête */}
          {data.usage && (
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Tokens entrée", value: data.usage.input_tokens },
                { label: "Tokens sortie", value: data.usage.output_tokens },
              ].map(({ label, value }) => value !== null && (
                <div key={label} className="bg-bg rounded-xl p-3 text-center">
                  <p className="text-text font-semibold text-base">{value?.toLocaleString()}</p>
                  <p className="font-mono text-xs text-dim mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Rate limits */}
          {rateLimits.length > 0 ? (
            <div className="space-y-3">
              {rateLimits.map(({ label, d }) => {
                if (!d) return null;
                const lim = fmt(d.limit);
                const rem = fmt(d.remaining);
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
                        {lim > 0 ? Math.round(((lim - rem) / lim) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="font-mono text-xs text-dim/50 text-center py-2">
              Limites non disponibles pour ce forfait
            </p>
          )}

          <a
            href="https://console.anthropic.com/settings/usage"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center font-mono text-xs text-dim/50 hover:text-accent transition-colors pt-1"
          >
            Voir usage complet → console.anthropic.com
          </a>
        </>
      )}
    </div>
  );
}
