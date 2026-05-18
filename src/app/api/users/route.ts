import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";
import { requireSession } from "@/server/auth";

const ADMIN_ROLES = ["owner", "admin"];

export async function GET() {
  const s = await requireSession();
  const users = await prisma.user.findMany({
    where: { organizationId: s.org },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      role: true,
      avatarTone: true,
      active: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ users });
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

  const exists = await prisma.user.findUnique({ where: { username: p.data.username } });
  if (exists) return NextResponse.json({ error: "Username já existe." }, { status: 409 });

  const passwordHash = await bcrypt.hash(p.data.password, 10);
  const tones = [
    "from-cyan-400 to-royal-600",
    "from-violet-400 to-royal-600",
    "from-emerald-400 to-cyan-600",
    "from-amber-400 to-rose-600",
    "from-rose-400 to-violet-600",
  ];

  const user = await prisma.user.create({
    data: {
      organizationId: s.org,
      username: p.data.username,
      name: p.data.name,
      email: p.data.email || null,
      passwordHash,
      role: p.data.role,
      avatarTone: p.data.avatarTone ?? tones[Math.floor(Math.random() * tones.length)],
    },
    select: { id: true, username: true, name: true, email: true, role: true, avatarTone: true, active: true, createdAt: true },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: s.org,
      userId: s.uid,
      action: "user.created",
      entity: "user",
      entityId: user.id,
      meta: JSON.stringify({ role: user.role }),
    },
  });
  return NextResponse.json({ user }, { status: 201 });
}
