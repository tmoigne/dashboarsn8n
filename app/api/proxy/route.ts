import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { __webhookPath, __apiKey, __baseUrl, ...payload } = body;

    if (!__webhookPath || !__apiKey || !__baseUrl) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const targetUrl = `${__baseUrl.replace(/\/$/, "")}${__webhookPath}`;

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": __apiKey,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ error: `n8n: ${response.status} ${text}` }, { status: response.status });
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      const text = await response.text();
      return NextResponse.json({ text: text.trim() });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
