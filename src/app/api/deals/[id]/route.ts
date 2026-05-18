import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireSession } from "@/server/auth";
import { emit } from "@/server/events";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const s = await requireSession();
  const deal = await prisma.deal.findFirst({
    where: { id: params.id, organizationId: s.org },
    include: {
      contact: true,
      company: true,
      owner: { select: { id: true, name: true, avatarTone: true } },
      stage: true,
      pipeline: true,
      tags: { include: { tag: true } },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { author: { select: { name: true } } },
      },
      tasks: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!deal) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ deal });
}

const patch = z.object({
  title: z.string().optional(),
  value: z.number().optional(),
  probability: z.number().int().min(0).max(100).optional(),
  priority: z.enum(["baixa", "media", "alta", "critica"]).optional(),
  stageId: z.string().optional(),
  position: z.number().int().optional(),
  contactId: z.string().nullable().optional(),
  ownerId: z.string().nullable().optional(),
  nextActionLabel: z.string().nullable().optional(),
  nextActionAt: z.string().nullable().optional(),
  status: z.enum(["open", "won", "lost"]).optional(),
  lossReason: z.string().nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await requireSession();
  const body = await req.json().catch(() => ({}));
  const p = patch.safeParse(body);
  if (!p.success) return NextResponse.json({ error: p.error.flatten() }, { status: 400 });

  const existing = await prisma.deal.findFirst({
    where: { id: params.id, organizationId: s.org },
    include: { stage: true },
  });
  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const data: any = { ...p.data };
  if (p.data.nextActionAt !== undefined)
    data.nextActionAt = p.data.nextActionAt ? new Date(p.data.nextActionAt) : null;

  const stageChanged = p.data.stageId && p.data.stageId !== existing.stageId;
  if (stageChanged) data.inStageAt = new Date();

  const updated = await prisma.deal.update({
    where: { id: existing.id },
    data,
    include: { stage: true, contact: true, owner: true, tags: { include: { tag: true } } },
  });

  if (stageChanged) {
    const fromStage = existing.stage.name;
    const toStage = updated.stage.name;
    await prisma.activity.create({
      data: {
        organizationId: s.org,
        type: "stage",
        title: `Movido: ${fromStage} → ${toStage}`,
        dealId: updated.id,
        contactId: updated.contactId,
        authorId: s.uid,
        authorName: s.name,
        meta: JSON.stringify({ fromStageId: existing.stageId, toStageId: updated.stageId }),
      },
    });
    await prisma.auditLog.create({
      data: {
        organizationId: s.org,
        userId: s.uid,
        action: "deal.moved",
        entity: "deal",
        entityId: updated.id,
        meta: JSON.stringify({ fromStageId: existing.stageId, toStageId: updated.stageId }),
      },
    });
    emit({
      type: "deal.moved",
      org: s.org,
      payload: {
        dealId: updated.id,
        fromStageId: existing.stageId,
        toStageId: updated.stageId,
        ownerId: updated.ownerId,
        contactId: updated.contactId,
      },
    });
  } else {
    emit({ type: "deal.updated", org: s.org, payload: { dealId: updated.id } });
  }

  return NextResponse.json({ deal: updated });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const s = await requireSession();
  const existing = await prisma.deal.findFirst({ where: { id: params.id, organizationId: s.org } });
  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });
  await prisma.deal.delete({ where: { id: existing.id } });
  await prisma.auditLog.create({
    data: { organizationId: s.org, userId: s.uid, action: "deal.deleted", entity: "deal", entityId: existing.id },
  });
  emit({ type: "deal.deleted", org: s.org, payload: { dealId: existing.id } });
  return NextResponse.json({ ok: true });
}
