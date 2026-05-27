import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db, safeUser } from "@/server/models";
import { cuid } from "@/server/store";
import { requireSession } from "@/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_ROLES = ["owner", "admin"];

const patch = z.object({
  name: z.string().optional(),
  email: z.string().email().nullable().optional(),
  role: z.enum(["owner", "admin", "manager", "seller", "sdr", "cs"]).optional(),
  active: z.boolean().optional(),
  password: z.string().min(6).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await requireSession();
  if (!ADMIN_ROLES.includes(s.role))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const p = patch.safeParse(body);
  if (!p.success) return NextResponse.json({ error: p.error.flatten() }, { status: 400 });

  const existing = await db.users.get(params.id);
  if (!existing || existing.organizationId !== s.org)
    return NextResponse.json({ error: "not_found" }, { status: 404 });

  const data: any = { ...p.data };
  if (p.data.password) {
    data.passwordHash = await bcrypt.hash(p.data.password, 10);
    delete data.password;
  }

  const updated = await db.users.patch(params.id, data);
  await db.auditLogs.put({
    id: cuid(),
    organizationId: s.org,
    userId: s.uid,
    action: "user.updated",
    entity: "user",
    entityId: params.id,
    meta: null,
    ip: null,
  });
  return NextResponse.json({ user: updated ? safeUser(updated) : null });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const s = await requireSession();
  if (!ADMIN_ROLES.includes(s.role))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (params.id === s.uid)
    return NextResponse.json({ error: "Não é possível remover a si mesmo." }, { status: 400 });
  await db.users.patch(params.id, { active: false } as any);
  await db.auditLogs.put({
    id: cuid(),
    organizationId: s.org,
    userId: s.uid,
    action: "user.deactivated",
    entity: "user",
    entityId: params.id,
    meta: null,
    ip: null,
  });
  return NextResponse.json({ ok: true });
}
