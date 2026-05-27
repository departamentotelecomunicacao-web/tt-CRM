import { NextResponse } from "next/server";
import { db } from "@/server/models";
import { requireSession } from "@/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const s = await requireSession();
  const [logs, users] = await Promise.all([
    db.auditLogs.filter((l) => l.organizationId === s.org),
    db.users.filter((u) => u.organizationId === s.org),
  ]);
  const userByid = new Map(users.map((u) => [u.id, u]));
  logs.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  return NextResponse.json({
    logs: logs.slice(0, 100).map((l) => ({
      ...l,
      user: l.userId
        ? {
            name: userByid.get(l.userId)?.name ?? "—",
            username: userByid.get(l.userId)?.username ?? "—",
            avatarTone: userByid.get(l.userId)?.avatarTone ?? "from-cyan-400 to-royal-600",
          }
        : null,
    })),
  });
}
