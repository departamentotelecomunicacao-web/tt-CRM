import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "./models";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "fatura-crm-dev-secret-change-in-production-2026"
);
const COOKIE = "fcrm_session";
const MAX_AGE = 60 * 60 * 24 * 7;

export interface SessionPayload {
  uid: string;
  org: string;
  role: string;
  name: string;
  username: string;
}

export async function signSession(payload: SessionPayload) {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const c = cookies().get(COOKIE);
  if (!c?.value) return null;
  return verifySession(c.value);
}

export async function getCurrentUser() {
  const s = await getSession();
  if (!s) return null;
  const user = await db.users.get(s.uid);
  if (!user) return null;
  const organization = await db.organizations.get(user.organizationId);
  if (!organization) return null;
  return { ...user, organization };
}

export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  return res;
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}

export const SESSION_COOKIE = COOKIE;

export async function requireSession() {
  const s = await getSession();
  if (!s) {
    throw new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  return s;
}
