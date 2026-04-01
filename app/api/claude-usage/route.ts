import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const key = req.headers.get("x-claude-key");
  if (!key) return NextResponse.json({ error: "Clé API manquante" }, { status: 400 });

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1,
        messages: [{ role: "user", content: "hi" }],
      }),
      signal: AbortSignal.timeout(15000),
    });

    const h = res.headers;

    // Collect all anthropic headers for debug
    const allHeaders: Record<string, string> = {};
    h.forEach((v, k) => { if (k.startsWith("anthropic")) allHeaders[k] = v; });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return NextResponse.json({ error: body?.error?.message ?? `HTTP ${res.status}`, allHeaders }, { status: res.status });
    }

    const body = await res.json();
    const usage = body.usage ?? {};

    return NextResponse.json({
      ok: true,
      usage: {
        input_tokens: usage.input_tokens ?? null,
        output_tokens: usage.output_tokens ?? null,
        cache_read: usage.cache_read_input_tokens ?? null,
      },
      requests: {
        limit: h.get("anthropic-ratelimit-requests-limit"),
        remaining: h.get("anthropic-ratelimit-requests-remaining"),
        reset: h.get("anthropic-ratelimit-requests-reset"),
      },
      tokens: {
        limit: h.get("anthropic-ratelimit-tokens-limit"),
        remaining: h.get("anthropic-ratelimit-tokens-remaining"),
        reset: h.get("anthropic-ratelimit-tokens-reset"),
      },
      input_tokens: {
        limit: h.get("anthropic-ratelimit-input-tokens-limit"),
        remaining: h.get("anthropic-ratelimit-input-tokens-remaining"),
        reset: h.get("anthropic-ratelimit-input-tokens-reset"),
      },
      allHeaders,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
