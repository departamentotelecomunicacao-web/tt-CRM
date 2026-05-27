import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/models";
import { requireSession } from "@/server/auth";
import { emit } from "@/server/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patch = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["todo", "doing", "done"]).optional(),
  priority: z.enum(["baixa", "media", "alta", "critica"]).optional(),
  dueAt: z.string().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await requireSession();
  const body = await req.json().catch(() => ({}));
  const p = patch.safeParse(body);
  if (!p.success) return NextResponse.json({ error: p.error.flatten() }, { status: 400 });

  const existing = await db.tasks.get(params.id);
  if (!existing || existing.organizationId !== s.org)
    return NextResponse.json({ error: "not_found" }, { status: 404 });

  const data: any = { ...p.data };
  if (p.data.dueAt !== undefined) data.dueAt = p.data.dueAt ? new Date(p.data.dueAt).toISOString() : null;
  if (p.data.status === "done") data.completedAt = new Date().toISOString();
  if (p.data.status && p.data.status !== "done") data.completedAt = null;

  const updated = await db.tasks.patch(params.id, data);
  if (p.data.status === "done") {
    emit({ type: "task.completed", org: s.org, payload: { taskId: params.id, dealId: existing.dealId } });
  }
  return NextResponse.json({ task: updated });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const s = await requireSession();
  const existing = await db.tasks.get(params.id);
  if (!existing || existing.organizationId !== s.org)
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  await db.tasks.delete(params.id);
  return NextResponse.json({ ok: true });
}
