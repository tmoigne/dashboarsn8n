import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — list templates for current user
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const templates = await prisma.emailTemplate.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, blocks: true, updatedAt: true, createdAt: true },
  });

  // blocks is stored as JSON string — parse before returning
  return NextResponse.json(
    templates.map(t => ({ ...t, blocks: JSON.parse(t.blocks) }))
  );
}

// POST — create or update (upsert by name) a template
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { name, blocks } = await req.json();
  if (!name || !blocks) {
    return NextResponse.json({ error: "name et blocks requis" }, { status: 400 });
  }

  const template = await prisma.emailTemplate.create({
    data: { name, blocks: JSON.stringify(blocks), userId },
    select: { id: true, name: true, blocks: true, updatedAt: true, createdAt: true },
  });

  return NextResponse.json({ ...template, blocks: JSON.parse(template.blocks) });
}
