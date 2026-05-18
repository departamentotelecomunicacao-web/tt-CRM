import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireSession } from "@/server/auth";

export async function GET(req: NextRequest) {
  const s = await requireSession();
  const dealId = req.nextUrl.searchParams.get("dealId");
  const contactId = req.nextUrl.searchParams.get("contactId");
  const type = req.nextUrl.searchParams.get("type");

  const activities = await prisma.activity.findMany({
    where: {
      organizationId: s.org,
      ...(dealId ? { dealId } : {}),
      ...(contactId ? { contactId } : {}),
      ...(type ? { type } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { author: { select: { name: true, avatarTone: true } } },
  });
  return NextResponse.json({ activities });
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
  const a = await prisma.activity.create({
    data: {
      organizationId: s.org,
      type: p.data.type,
      title: p.data.title,
      body: p.data.body,
      dealId: p.data.dealId,
      contactId: p.data.contactId,
      authorId: s.uid,
      authorName: s.name,
    },
  });
  return NextResponse.json({ activity: a }, { status: 201 });
}
