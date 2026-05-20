import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/models";
import { cuid } from "@/server/store";
import { requireSession } from "@/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const s = await requireSession();
  const items = await db.automations.filter((a) => a.organizationId === s.org);
  items.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  return NextResponse.json({ automations: items });
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
  const automation = await db.automations.put({
    id: cuid(),
    organizationId: s.org,
    name: p.data.name,
    description: p.data.description ?? null,
    trigger: p.data.trigger,
    steps: p.data.steps,
    active: p.data.active,
    runs: 0,
    lastRunAt: null,
  });
  return NextResponse.json({ automation }, { status: 201 });
}
