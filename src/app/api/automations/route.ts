import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireSession } from "@/server/auth";

export async function GET() {
  const s = await requireSession();
  const items = await prisma.automation.findMany({
    where: { organizationId: s.org },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    automations: items.map((a) => ({
      ...a,
      trigger: JSON.parse(a.trigger),
      steps: JSON.parse(a.steps),
    })),
  });
}

const create = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  trigger: z.object({ type: z.string(), conditions: z.record(z.any()).optional() }),
  steps: z.array(z.object({ type: z.string(), params: z.record(z.any()).optional() })),
  active: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  const s = await requireSession();
  const body = await req.json().catch(() => ({}));
  const p = create.safeParse(body);
  if (!p.success) return NextResponse.json({ error: p.error.flatten() }, { status: 400 });
  const a = await prisma.automation.create({
    data: {
      organizationId: s.org,
      name: p.data.name,
      description: p.data.description,
      trigger: JSON.stringify(p.data.trigger),
      steps: JSON.stringify(p.data.steps),
      active: p.data.active,
    },
  });
  return NextResponse.json({
    automation: { ...a, trigger: p.data.trigger, steps: p.data.steps },
  }, { status: 201 });
}
