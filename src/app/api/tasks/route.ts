import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireSession } from "@/server/auth";
import { emit } from "@/server/events";

export async function GET() {
  const s = await requireSession();
  const tasks = await prisma.task.findMany({
    where: { organizationId: s.org },
    orderBy: [{ status: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }],
    include: {
      assignee: { select: { id: true, name: true, avatarTone: true } },
      deal: { select: { id: true, title: true } },
      contact: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json({ tasks });
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
  const task = await prisma.task.create({
    data: {
      organizationId: s.org,
      title: p.data.title,
      description: p.data.description,
      priority: p.data.priority,
      dueAt: p.data.dueAt ? new Date(p.data.dueAt) : null,
      dealId: p.data.dealId,
      contactId: p.data.contactId,
      assigneeId: p.data.assigneeId ?? s.uid,
    },
  });

  if (task.dealId || task.contactId) {
    await prisma.activity.create({
      data: {
        organizationId: s.org,
        type: "task",
        title: `Tarefa criada: ${task.title}`,
        dealId: task.dealId,
        contactId: task.contactId,
        authorId: s.uid,
        authorName: s.name,
      },
    });
  }
  emit({ type: "task.created", org: s.org, payload: { taskId: task.id } });
  return NextResponse.json({ task }, { status: 201 });
}
