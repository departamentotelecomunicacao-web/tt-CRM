import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireSession } from "@/server/auth";
import { emit } from "@/server/events";
import { ensureInit } from "@/server/init";

ensureInit();

export async function GET(req: NextRequest) {
  const s = await requireSession();
  const pipelineId = req.nextUrl.searchParams.get("pipeline");

  const deals = await prisma.deal.findMany({
    where: {
      organizationId: s.org,
      ...(pipelineId ? { pipelineId } : {}),
    },
    orderBy: [{ stageId: "asc" }, { position: "asc" }],
    include: {
      contact: true,
      company: true,
      owner: { select: { id: true, name: true, username: true, avatarTone: true } },
      tags: { include: { tag: true } },
    },
  });
  return NextResponse.json({ deals });
}

const createSchema = z.object({
  title: z.string().min(1),
  value: z.number().min(0).default(0),
  probability: z.number().int().min(0).max(100).default(20),
  priority: z.enum(["baixa", "media", "alta", "critica"]).default("media"),
  pipelineId: z.string().min(1),
  stageId: z.string().optional(),
  contactId: z.string().optional(),
  companyId: z.string().optional(),
  ownerId: z.string().optional(),
  nextActionLabel: z.string().optional(),
  nextActionAt: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  const s = await requireSession();
  const body = await req.json().catch(() => ({}));
  const p = createSchema.safeParse(body);
  if (!p.success) return NextResponse.json({ error: p.error.flatten() }, { status: 400 });

  let stageId = p.data.stageId;
  if (!stageId) {
    const firstStage = await prisma.stage.findFirst({
      where: { pipelineId: p.data.pipelineId },
      orderBy: { order: "asc" },
    });
    if (!firstStage) return NextResponse.json({ error: "Pipeline sem estágios." }, { status: 400 });
    stageId = firstStage.id;
  }

  const last = await prisma.deal.findFirst({
    where: { organizationId: s.org, stageId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const deal = await prisma.deal.create({
    data: {
      organizationId: s.org,
      pipelineId: p.data.pipelineId,
      stageId,
      title: p.data.title,
      value: p.data.value,
      probability: p.data.probability,
      priority: p.data.priority,
      contactId: p.data.contactId,
      companyId: p.data.companyId,
      ownerId: p.data.ownerId ?? s.uid,
      nextActionLabel: p.data.nextActionLabel,
      nextActionAt: p.data.nextActionAt ? new Date(p.data.nextActionAt) : null,
      position: (last?.position ?? -1) + 1,
      score: p.data.probability,
      tags: p.data.tagIds?.length
        ? { create: p.data.tagIds.map((tagId) => ({ tagId })) }
        : undefined,
    },
    include: { tags: { include: { tag: true } }, contact: true, owner: true },
  });

  await prisma.activity.create({
    data: {
      organizationId: s.org,
      type: "system",
      title: `Negócio criado: ${deal.title}`,
      dealId: deal.id,
      contactId: deal.contactId,
      authorId: s.uid,
      authorName: s.name,
    },
  });
  await prisma.auditLog.create({
    data: { organizationId: s.org, userId: s.uid, action: "deal.created", entity: "deal", entityId: deal.id },
  });

  emit({
    type: "deal.created",
    org: s.org,
    payload: { dealId: deal.id, ownerId: deal.ownerId, contactId: deal.contactId },
  });

  return NextResponse.json({ deal }, { status: 201 });
}
