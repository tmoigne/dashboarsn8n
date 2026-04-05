import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Read n8n config from DB (set by superadmin)
    const rows = await prisma.appConfig.findMany({
      where: { key: { in: ["n8n_base_url", "n8n_api_key"] } },
    });
    const cfg: Record<string, string> = {};
    for (const r of rows) cfg[r.key] = r.value;

    const baseUrl = cfg["n8n_base_url"]?.trim();
    const apiKey  = cfg["n8n_api_key"]?.trim();

    if (!baseUrl || !apiKey) {
      return NextResponse.json({ error: "n8n non configuré — contactez l'administrateur." }, { status: 503 });
    }

    const body = await req.json();
    const { __webhookPath, ...payload } = body;

    if (!__webhookPath) {
      return NextResponse.json({ error: "Paramètre __webhookPath manquant" }, { status: 400 });
    }

    const targetUrl = `${baseUrl.replace(/\/$/, "")}${__webhookPath}`;

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-N8N-API-KEY": apiKey,
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
      return NextResponse.json(await response.json());
    }
    return NextResponse.json({ text: (await response.text()).trim() });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
