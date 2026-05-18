import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireSession } from "@/server/auth";

export async function GET() {
  const s = await requireSession();
  const logs = await prisma.auditLog.findMany({
    where: { organizationId: s.org },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { name: true, username: true, avatarTone: true } } },
  });
  return NextResponse.json({ logs });
}
