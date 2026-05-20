import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/models";
import { cuid } from "@/server/store";
import { requireSession } from "@/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const s = await requireSession();
  const dealId = req.nextUrl.searchParams.get("dealId");
  const contactId = req.nextUrl.searchParams.get("contactId");
  const type = req.nextUrl.searchParams.get("type");
  let activities = await db.activities.filter((a) => {
    if (a.organizationId !== s.org) return false;
    if (dealId && a.dealId !== dealId) return false;
    if (contactId && a.contactId !== contactId) return false;
    if (type && a.type !== type) return false;
    return true;
  });
  activities.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  return NextResponse.json({ activities: activities.slice(0, 100) });
}

const create = z.object({
  type: z.enum(["call", "email", "whatsapp", "note", "meeting", "task", "file", "stage", "ai", "system"]),
  title: z.string().min(1),
  body: z.string().optional(),
  dealId: z.string().optional(),
  contactId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const s = await requireSession();
  const body = await req.json().catch(() => ({}));
  const p = create.safeParse(body);
  if (!p.success) return NextResponse.json({ error: p.error.flatten() }, { status: 400 });
  const a = await db.activities.put({
    id: cuid(),
    organizationId: s.org,
    type: p.data.type,
    title: p.data.title,
    body: p.data.body ?? null,
    meta: null,
    dealId: p.data.dealId ?? null,
    contactId: p.data.contactId ?? null,
    authorId: s.uid,
    authorName: s.name,
  });
  return NextResponse.json({ activity: a }, { status: 201 });
}
