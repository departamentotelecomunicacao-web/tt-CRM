import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireSession } from "@/server/auth";

export async function GET() {
  const s = await requireSession();
  const items = await prisma.notification.findMany({
    where: { userId: s.uid },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  const unread = await prisma.notification.count({ where: { userId: s.uid, read: false } });
  return NextResponse.json({ items, unread });
}

export async function POST(req: NextRequest) {
  const s = await requireSession();
  const body = await req.json().catch(() => ({}));
  if (body.action === "markAllRead") {
    await prisma.notification.updateMany({ where: { userId: s.uid, read: false }, data: { read: true } });
  }
  return NextResponse.json({ ok: true });
}
