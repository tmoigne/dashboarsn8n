import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || !["superadmin", "admin"].includes(role ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await req.json();

  // If setting active, deactivate others first
  if (body.active === true) {
    await prisma.n8nInstance.updateMany({ data: { active: false } });
  }

  const instance = await prisma.n8nInstance.update({ where: { id }, data: body });
  return NextResponse.json(instance);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || !["superadmin", "admin"].includes(role ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  await prisma.n8nInstance.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
