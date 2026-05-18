import { NextResponse } from "next/server";
import { clearSessionCookie, getSession } from "@/server/auth";
import { prisma } from "@/server/db";

export async function POST() {
  const s = await getSession();
  if (s) {
    await prisma.auditLog.create({
      data: { organizationId: s.org, userId: s.uid, action: "user.logout", entity: "user", entityId: s.uid },
    });
  }
  return clearSessionCookie(NextResponse.json({ ok: true }));
}
