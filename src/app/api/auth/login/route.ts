import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/server/models";
import { cuid } from "@/server/store";
import { setSessionCookie, signSession } from "@/server/auth";
import { ensureBootstrap } from "@/server/bootstrap";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    await ensureBootstrap();
  } catch (e: any) {
    console.error("[login] bootstrap failed", e);
    return NextResponse.json(
      {
        error:
          "Banco indisponível. Verifique se o site foi deployado via Git no Netlify (drag-and-drop não habilita o storage).",
        details: process.env.NODE_ENV !== "production" ? String(e?.message ?? e) : undefined,
      },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Credenciais inválidas." }, { status: 400 });
  }
  const { username, password } = parsed.data;

  let user;
  try {
    user = await db.users.find((u) => u.username === username);
  } catch (e: any) {
    console.error("[login] storage query failed", e);
    return NextResponse.json(
      { error: "Falha no storage. Tente novamente em instantes." },
      { status: 500 }
    );
  }

  if (!user || !user.active) {
    return NextResponse.json({ error: "Usuário ou senha incorretos." }, { status: 401 });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Usuário ou senha incorretos." }, { status: 401 });
  }

  await db.users.patch(user.id, { lastLoginAt: new Date().toISOString() });
  await db.auditLogs.put({
    id: cuid(),
    organizationId: user.organizationId,
    userId: user.id,
    action: "user.login",
    entity: "user",
    entityId: user.id,
    meta: null,
    ip: req.headers.get("x-forwarded-for") ?? null,
  });

  const organization = await db.organizations.get(user.organizationId);

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
      organization: organization
        ? { id: organization.id, name: organization.name, plan: organization.plan }
        : null,
    },
  });
  return setSessionCookie(res, token);
}
