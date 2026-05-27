import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, safeOwner } from "@/server/models";
import { cuid } from "@/server/store";
import { requireSession } from "@/server/auth";
import { emit } from "@/server/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const s = await requireSession();
  const deal = await db.deals.get(params.id);
  if (!deal || deal.organizationId !== s.org)
    return NextResponse.json({ error: "not_found" }, { status: 404 });

  const [contact, company, owner, stage, pipeline, allTags, allActivities, allTasks] =
    await Promise.all([
      deal.contactId ? db.contacts.get(deal.contactId) : null,
      deal.companyId ? db.companies.get(deal.companyId) : null,
      deal.ownerId ? db.users.get(deal.ownerId) : null,
      db.stages.get(deal.stageId),
      db.pipelines.get(deal.pipelineId),
      db.tags.filter((t) => t.organizationId === s.org),
      db.activities.filter((a) => a.dealId === deal.id),
      db.tasks.filter((t) => t.dealId === deal.id),
    ]);
  const tagByid = new Map(allTags.map((t) => [t.id, t]));
  allActivities.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  allTasks.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

  // Authors map
  const authorIds = Array.from(new Set(allActivities.map((a) => a.authorId).filter(Boolean)));
  const authors = await Promise.all(authorIds.map((id) => db.users.get(id as string)));
  const authorByid = new Map(authors.filter(Boolean).map((u: any) => [u.id, u]));

  return NextResponse.json({
    deal: {
      ...deal,
      contact,
      company,
      owner: safeOwner(owner),
      stage,
      pipeline,
      tags: deal.tagIds.map((id) => ({ tag: tagByid.get(id) })).filter((t) => t.tag),
      activities: allActivities.slice(0, 80).map((a) => ({
        ...a,
        author: a.authorId ? { name: authorByid.get(a.authorId)?.name ?? a.authorName } : null,
      })),
      tasks: allTasks.slice(0, 20),
    },
  });
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

  const existing = await db.deals.get(params.id);
  if (!existing || existing.organizationId !== s.org)
    return NextResponse.json({ error: "not_found" }, { status: 404 });

  const data: any = { ...p.data };
  const stageChanged = p.data.stageId && p.data.stageId !== existing.stageId;
  if (stageChanged) data.inStageAt = new Date().toISOString();

  const updated = await db.deals.patch(existing.id, data);
  if (!updated) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (stageChanged) {
    const [fromStage, toStage] = await Promise.all([
      db.stages.get(existing.stageId),
      db.stages.get(updated.stageId),
    ]);
    await db.activities.put({
      id: cuid(),
      organizationId: s.org,
      type: "stage",
      title: `Movido: ${fromStage?.name ?? "—"} → ${toStage?.name ?? "—"}`,
      body: null,
      meta: { fromStageId: existing.stageId, toStageId: updated.stageId },
      dealId: updated.id,
      contactId: updated.contactId,
      authorId: s.uid,
      authorName: s.name,
    });
    await db.auditLogs.put({
      id: cuid(),
      organizationId: s.org,
      userId: s.uid,
      action: "deal.moved",
      entity: "deal",
      entityId: updated.id,
      meta: { fromStageId: existing.stageId, toStageId: updated.stageId },
      ip: null,
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
  const existing = await db.deals.get(params.id);
  if (!existing || existing.organizationId !== s.org)
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  await db.deals.delete(existing.id);
  await db.auditLogs.put({
    id: cuid(),
    organizationId: s.org,
    userId: s.uid,
    action: "deal.deleted",
    entity: "deal",
    entityId: existing.id,
    meta: null,
    ip: null,
  });
  emit({ type: "deal.deleted", org: s.org, payload: { dealId: existing.id } });
  return NextResponse.json({ ok: true });
}
