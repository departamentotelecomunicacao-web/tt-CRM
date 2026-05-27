import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, safeOwner } from "@/server/models";
import { cuid } from "@/server/store";
import { requireSession } from "@/server/auth";
import { emit } from "@/server/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const s = await requireSession();
  const [tasks, users, deals, contacts] = await Promise.all([
    db.tasks.filter((t) => t.organizationId === s.org),
    db.users.filter((u) => u.organizationId === s.org),
    db.deals.filter((d) => d.organizationId === s.org),
    db.contacts.filter((c) => c.organizationId === s.org),
  ]);
  const uMap = new Map(users.map((u) => [u.id, u]));
  const dMap = new Map(deals.map((d) => [d.id, d]));
  const cMap = new Map(contacts.map((c) => [c.id, c]));
  tasks.sort((a, b) => {
    if (a.status === b.status) return (a.dueAt ?? "").localeCompare(b.dueAt ?? "");
    return a.status === "done" ? 1 : -1;
  });
  return NextResponse.json({
    tasks: tasks.map((t) => ({
      ...t,
      assignee: t.assigneeId ? safeOwner(uMap.get(t.assigneeId)) : null,
      deal: t.dealId ? { id: t.dealId, title: dMap.get(t.dealId)?.title ?? "—" } : null,
      contact: t.contactId ? { id: t.contactId, name: cMap.get(t.contactId)?.name ?? "—" } : null,
    })),
  });
}

const create = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["baixa", "media", "alta", "critica"]).default("media"),
  dueAt: z.string().optional(),
  dealId: z.string().optional(),
  contactId: z.string().optional(),
  assigneeId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const s = await requireSession();
  const body = await req.json().catch(() => ({}));
  const p = create.safeParse(body);
  if (!p.success) return NextResponse.json({ error: p.error.flatten() }, { status: 400 });
  const task = await db.tasks.put({
    id: cuid(),
    organizationId: s.org,
    title: p.data.title,
    description: p.data.description ?? null,
    status: "todo",
    priority: p.data.priority,
    dueAt: p.data.dueAt ? new Date(p.data.dueAt).toISOString() : null,
    completedAt: null,
    dealId: p.data.dealId ?? null,
    contactId: p.data.contactId ?? null,
    assigneeId: p.data.assigneeId ?? s.uid,
  });
  if (task.dealId || task.contactId) {
    await db.activities.put({
      id: cuid(),
      organizationId: s.org,
      type: "task",
      title: `Tarefa criada: ${task.title}`,
      body: null,
      meta: null,
      dealId: task.dealId,
      contactId: task.contactId,
      authorId: s.uid,
      authorName: s.name,
    });
  }
  emit({ type: "task.created", org: s.org, payload: { taskId: task.id } });
  return NextResponse.json({ task }, { status: 201 });
}
