import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/models";
import { requireSession } from "@/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const s = await requireSession();
  const items = await db.notifications.filter((n) => n.userId === s.uid);
  items.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  const unread = items.filter((n) => !n.read).length;
  return NextResponse.json({ items: items.slice(0, 30), unread });
}

export async function POST(req: NextRequest) {
  const s = await requireSession();
  const body = await req.json().catch(() => ({}));
  if (body.action === "markAllRead") {
    const unread = await db.notifications.filter((n) => n.userId === s.uid && !n.read);
    for (const n of unread) await db.notifications.patch(n.id, { read: true });
  }
  return NextResponse.json({ ok: true });
}
