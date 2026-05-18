import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/server/db";
import { setSessionCookie, signSession } from "@/server/auth";
import { ensureBootstrap } from "@/server/bootstrap";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  await ensureBootstrap();
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Credenciais inválidas." }, { status: 400 });
  }
  const { username, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { username },
    include: { organization: true },
  });
  if (!user || !user.active) {
    return NextResponse.json({ error: "Usuário ou senha incorretos." }, { status: 401 });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Usuário ou senha incorretos." }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
  await prisma.auditLog.create({
    data: {
      organizationId: user.organizationId,
      userId: user.id,
      action: "user.login",
      entity: "user",
      entityId: user.id,
      ip: req.headers.get("x-forwarded-for") ?? null,
    },
  });

  const token = await signSession({
    uid: user.id,
    org: user.organizationId,
    role: user.role,
    name: user.name,
    username: user.username,
  });
  const res = NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      avatarTone: user.avatarTone,
      organization: { id: user.organization.id, name: user.organization.name, plan: user.organization.plan },
    },
  });
  return setSessionCookie(res, token);
}
