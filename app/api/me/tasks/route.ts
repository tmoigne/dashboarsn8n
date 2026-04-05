import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as { id: string; role?: string };

  // Admins and superadmins see all tasks
  if (["admin", "superadmin"].includes(user.role ?? "")) {
    return NextResponse.json({ all: true, taskIds: [] });
  }

  const access = await prisma.userTaskAccess.findMany({
    where: { userId: user.id },
    select: { taskId: true },
  });

  return NextResponse.json({ all: false, taskIds: access.map((a) => a.taskId) });
}
