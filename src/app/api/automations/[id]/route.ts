import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireSession } from "@/server/auth";

const patch = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  trigger: z.object({ type: z.string(), conditions: z.record(z.any()).optional() }).optional(),
  steps: z.array(z.object({ type: z.string(), params: z.record(z.any()).optional() })).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await requireSession();
  const body = await req.json().catch(() => ({}));
  const p = patch.safeParse(body);
  if (!p.success) return NextResponse.json({ error: p.error.flatten() }, { status: 400 });
  const data: any = {};
  if (p.data.name !== undefined) data.name = p.data.name;
  if (p.data.description !== undefined) data.description = p.data.description;
  if (p.data.active !== undefined) data.active = p.data.active;
  if (p.data.trigger) data.trigger = JSON.stringify(p.data.trigger);
  if (p.data.steps) data.steps = JSON.stringify(p.data.steps);
  const a = await prisma.automation.update({ where: { id: params.id }, data });
  return NextResponse.json({
    automation: { ...a, trigger: JSON.parse(a.trigger), steps: JSON.parse(a.steps) },
  });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await requireSession();
  await prisma.automation.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
