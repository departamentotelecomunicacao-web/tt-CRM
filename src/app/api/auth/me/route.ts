import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { ensureBootstrap } from "@/server/bootstrap";

export async function GET() {
  await ensureBootstrap();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      avatarTone: user.avatarTone,
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        plan: user.organization.plan,
      },
    },
  });
}
