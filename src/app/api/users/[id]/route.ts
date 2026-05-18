import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";
import { requireSession } from "@/server/auth";

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

  const data: any = { ...p.data };
  if (p.data.password) {
    data.passwordHash = await bcrypt.hash(p.data.password, 10);
    delete data.password;
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data,
    select: { id: true, username: true, name: true, email: true, role: true, avatarTone: true, active: true },
  });

  await prisma.auditLog.create({
    data: { organizationId: s.org, userId: s.uid, action: "user.updated", entity: "user", entityId: updated.id },
  });
  return NextResponse.json({ user: updated });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const s = await requireSession();
  if (!ADMIN_ROLES.includes(s.role))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (params.id === s.uid)
    return NextResponse.json({ error: "Não é possível remover a si mesmo." }, { status: 400 });

  await prisma.user.update({ where: { id: params.id }, data: { active: false } });
  await prisma.auditLog.create({
    data: { organizationId: s.org, userId: s.uid, action: "user.deactivated", entity: "user", entityId: params.id },
  });
  return NextResponse.json({ ok: true });
}
