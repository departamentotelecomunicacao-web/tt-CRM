import { NextResponse } from "next/server";
import { clearSessionCookie, getSession } from "@/server/auth";
import { db } from "@/server/models";
import { cuid } from "@/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const s = await getSession();
  if (s) {
    await db.auditLogs.put({
      id: cuid(),
      organizationId: s.org,
      userId: s.uid,
      action: "user.logout",
      entity: "user",
      entityId: s.uid,
      meta: null,
      ip: null,
    });
  }
  return clearSessionCookie(NextResponse.json({ ok: true }));
}
