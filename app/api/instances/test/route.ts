import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { baseUrl, apiKey } = await req.json();
  if (!baseUrl || !apiKey) {
    return NextResponse.json({ ok: false, error: "baseUrl et apiKey requis" });
  }

  try {
    const url = `${baseUrl.replace(/\/$/, "")}/api/v1/workflows?limit=1`;
    const res = await fetch(url, {
      headers: { "X-N8N-API-KEY": apiKey },
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false, status: res.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Connexion impossible";
    return NextResponse.json({ ok: false, error: message });
  }
}
