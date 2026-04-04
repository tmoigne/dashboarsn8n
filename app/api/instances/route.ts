import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const instances = await prisma.n8nInstance.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(instances);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || !["superadmin", "admin"].includes(role ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, baseUrl, apiKey } = await req.json();
  if (!name || !baseUrl || !apiKey) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  // If first instance, set as active
  const count = await prisma.n8nInstance.count();
  const instance = await prisma.n8nInstance.create({
    data: { name, baseUrl, apiKey, active: count === 0 },
  });
  return NextResponse.json(instance);
}
