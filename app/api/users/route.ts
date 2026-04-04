import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET — list all users (admin only)
export async function GET() {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true, email: true, name: true, role: true, createdAt: true,
      taskAccess: { select: { taskId: true } },
    },
  });

  return NextResponse.json(users);
}

// POST — create user
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, name, password, role, taskIds } = await req.json();
  if (!email || !name || !password) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "Email déjà utilisé" }, { status: 400 });

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email, name, password: hashed,
      role: role ?? "user",
      taskAccess: taskIds?.length
        ? { create: (taskIds as string[]).map((taskId) => ({ taskId })) }
        : undefined,
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true, taskAccess: { select: { taskId: true } } },
  });

  return NextResponse.json(user);
}
