import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const key = req.headers.get("x-claude-key");
  if (!key) return NextResponse.json({ error: "Clé API manquante" }, { status: 400 });

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages/count_tokens", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "token-counting-2024-11-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        messages: [{ role: "user", content: "hi" }],
      }),
      signal: AbortSignal.timeout(8000),
    });

    const h = res.headers;
    return NextResponse.json({
      ok: res.ok,
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
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
