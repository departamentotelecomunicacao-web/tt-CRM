import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireSession } from "@/server/auth";
import { emit } from "@/server/events";

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

  const data: any = { ...p.data };
  if (p.data.dueAt !== undefined) data.dueAt = p.data.dueAt ? new Date(p.data.dueAt) : null;
  if (p.data.status === "done") data.completedAt = new Date();
  if (p.data.status && p.data.status !== "done") data.completedAt = null;

  const updated = await prisma.task.update({ where: { id: params.id }, data });
  if (p.data.status === "done") {
    emit({ type: "task.completed", org: s.org, payload: { taskId: updated.id, dealId: updated.dealId } });
  }
  return NextResponse.json({ task: updated });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const s = await requireSession();
  await prisma.task.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
