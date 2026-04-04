import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

type Ctx = { params: Promise<{ id: string }> };

function isAdminOrSuperadmin(session: unknown) {
  const s = session as { user?: { role?: string } } | null;
  const role = s?.user?.role ?? "";
  return s && ["admin", "superadmin"].includes(role);
}

// PATCH — update user (admin/superadmin only)
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const session = await auth();
  if (!isAdminOrSuperadmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const { name, email, password, role, taskIds } = await req.json();
  const data: Record<string, unknown> = {};
  if (name) data.name = name;
  if (email) data.email = email;
  if (password) data.password = await bcrypt.hash(password, 12);
  if (role) data.role = role;

  await prisma.user.update({ where: { id }, data });

  if (taskIds !== undefined) {
    await prisma.userTaskAccess.deleteMany({ where: { userId: id } });
    if ((taskIds as string[]).length > 0) {
      await prisma.userTaskAccess.createMany({
        data: (taskIds as string[]).map((taskId) => ({ userId: id, taskId })),
      });
    }
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, createdAt: true, taskAccess: { select: { taskId: true } } },
  });

  return NextResponse.json(user);
}

// DELETE — delete user (admin/superadmin only)
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const session = await auth();
  if (!isAdminOrSuperadmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const currentUserId = (session?.user as { id?: string })?.id;
  if (id === currentUserId) {
    return NextResponse.json({ error: "Impossible de se supprimer soi-même" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
