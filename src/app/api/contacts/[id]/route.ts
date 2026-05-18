import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireSession } from "@/server/auth";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const s = await requireSession();
  const contact = await prisma.contact.findFirst({
    where: { id: params.id, organizationId: s.org },
    include: {
      company: true,
      owner: { select: { id: true, name: true, avatarTone: true } },
      deals: { include: { stage: true, pipeline: true } },
      tasks: { orderBy: { createdAt: "desc" }, take: 20 },
      activities: { orderBy: { createdAt: "desc" }, take: 50 },
      tags: { include: { tag: true } },
    },
  });
  if (!contact) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ contact });
}

const patch = z.object({
  name: z.string().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  whatsapp: z.string().nullable().optional(),
  segment: z.string().nullable().optional(),
  origin: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await requireSession();
  const body = await req.json().catch(() => ({}));
  const p = patch.safeParse(body);
  if (!p.success) return NextResponse.json({ error: p.error.flatten() }, { status: 400 });

  const updated = await prisma.contact.update({
    where: { id: params.id },
    data: p.data as any,
  });
  return NextResponse.json({ contact: updated });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const s = await requireSession();
  await prisma.contact.delete({ where: { id: params.id } });
  await prisma.auditLog.create({
    data: { organizationId: s.org, userId: s.uid, action: "contact.deleted", entity: "contact", entityId: params.id },
  });
  return NextResponse.json({ ok: true });
}
