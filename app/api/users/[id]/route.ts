import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// PATCH — update user
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email, password, role, taskIds } = await req.json();
  const data: Record<string, unknown> = {};
  if (name) data.name = name;
  if (email) data.email = email;
  if (password) data.password = await bcrypt.hash(password, 12);
  if (role) data.role = role;

  await prisma.user.update({ where: { id: params.id }, data });

  if (taskIds !== undefined) {
    await prisma.userTaskAccess.deleteMany({ where: { userId: params.id } });
    if ((taskIds as string[]).length > 0) {
      await prisma.userTaskAccess.createMany({
        data: (taskIds as string[]).map((taskId) => ({ userId: params.id, taskId })),
      });
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, email: true, name: true, role: true, createdAt: true, taskAccess: { select: { taskId: true } } },
  });

  return NextResponse.json(user);
}

// DELETE — delete user
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentUserId = session.user?.id;
  if (params.id === currentUserId) {
    return NextResponse.json({ error: "Impossible de se supprimer soi-même" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
