import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, listDealsWithRelations } from "@/server/models";
import { cuid } from "@/server/store";
import { requireSession } from "@/server/auth";
import { emit } from "@/server/events";
import { ensureInit } from "@/server/init";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

ensureInit();

export async function GET(req: NextRequest) {
  const s = await requireSession();
  const pipelineId = req.nextUrl.searchParams.get("pipeline");
  let deals = await listDealsWithRelations(s.org);
  if (pipelineId) deals = deals.filter((d) => d.pipelineId === pipelineId);
  deals.sort((a, b) => a.stageId.localeCompare(b.stageId) || a.position - b.position);
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
    const stages = await db.stages.filter((st) => st.pipelineId === p.data.pipelineId);
    stages.sort((a, b) => a.order - b.order);
    if (stages.length === 0)
      return NextResponse.json({ error: "Pipeline sem estágios." }, { status: 400 });
    stageId = stages[0].id;
  }

  const others = await db.deals.filter(
    (d) => d.organizationId === s.org && d.stageId === stageId
  );
  const maxPos = others.reduce((m, d) => Math.max(m, d.position), -1);

  const deal = await db.deals.put({
    id: cuid(),
    organizationId: s.org,
    pipelineId: p.data.pipelineId,
    stageId,
    contactId: p.data.contactId ?? null,
    companyId: p.data.companyId ?? null,
    ownerId: p.data.ownerId ?? s.uid,
    title: p.data.title,
    value: p.data.value,
    probability: p.data.probability,
    priority: p.data.priority,
    score: p.data.probability,
    status: "open",
    lossReason: null,
    nextActionLabel: p.data.nextActionLabel ?? null,
    nextActionAt: p.data.nextActionAt ?? null,
    inStageAt: new Date().toISOString(),
    position: maxPos + 1,
    tagIds: p.data.tagIds ?? [],
  });

  await db.activities.put({
    id: cuid(),
    organizationId: s.org,
    type: "system",
    title: `Negócio criado: ${deal.title}`,
    body: null,
    meta: null,
    dealId: deal.id,
    contactId: deal.contactId,
    authorId: s.uid,
    authorName: s.name,
  });
  await db.auditLogs.put({
    id: cuid(),
    organizationId: s.org,
    userId: s.uid,
    action: "deal.created",
    entity: "deal",
    entityId: deal.id,
    meta: null,
    ip: null,
  });
  emit({
    type: "deal.created",
    org: s.org,
    payload: { dealId: deal.id, ownerId: deal.ownerId, contactId: deal.contactId },
  });

  return NextResponse.json({ deal }, { status: 201 });
}
