import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

// PATCH — rename or update blocks
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { id } = await ctx.params;
  const body = await req.json();

  const existing = await prisma.emailTemplate.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.name) data.name = body.name;
  if (body.blocks) data.blocks = JSON.stringify(body.blocks);

  const updated = await prisma.emailTemplate.update({
    where: { id },
    data,
    select: { id: true, name: true, blocks: true, updatedAt: true, createdAt: true },
  });

  return NextResponse.json({ ...updated, blocks: JSON.parse(updated.blocks) });
}

// DELETE — remove a template (owner only)
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { id } = await ctx.params;

  const existing = await prisma.emailTemplate.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.emailTemplate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
