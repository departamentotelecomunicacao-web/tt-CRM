import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db, safeUser } from "@/server/models";
import { cuid } from "@/server/store";
import { requireSession } from "@/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_ROLES = ["owner", "admin"];

export async function GET() {
  const s = await requireSession();
  const users = await db.users.filter((u) => u.organizationId === s.org);
  users.sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));
  return NextResponse.json({ users: users.map(safeUser) });
}

const create = z.object({
  username: z.string().min(3).regex(/^[A-Za-z0-9_.-]+$/, "Use letras, números, _ . -"),
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().min(6),
  role: z.enum(["owner", "admin", "manager", "seller", "sdr", "cs"]).default("seller"),
  avatarTone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const s = await requireSession();
  if (!ADMIN_ROLES.includes(s.role))
    return NextResponse.json({ error: "Apenas administradores podem criar usuários." }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const p = create.safeParse(body);
  if (!p.success) return NextResponse.json({ error: p.error.flatten() }, { status: 400 });

  const exists = await db.users.find((u) => u.username === p.data.username);
  if (exists) return NextResponse.json({ error: "Username já existe." }, { status: 409 });

  const passwordHash = await bcrypt.hash(p.data.password, 10);
  const tones = [
    "from-cyan-400 to-royal-600",
    "from-violet-400 to-royal-600",
    "from-emerald-400 to-cyan-600",
    "from-amber-400 to-rose-600",
    "from-rose-400 to-violet-600",
  ];

  const user = await db.users.put({
    id: cuid(),
    organizationId: s.org,
    username: p.data.username,
    name: p.data.name,
    email: p.data.email || null,
    passwordHash,
    role: p.data.role,
    avatarTone: p.data.avatarTone ?? tones[Math.floor(Math.random() * tones.length)],
    active: true,
    lastLoginAt: null,
  });

  await db.auditLogs.put({
    id: cuid(),
    organizationId: s.org,
    userId: s.uid,
    action: "user.created",
    entity: "user",
    entityId: user.id,
    meta: { role: user.role },
    ip: null,
  });
  return NextResponse.json({ user: safeUser(user) }, { status: 201 });
}
