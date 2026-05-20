import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/models";
import { requireSession } from "@/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patch = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  trigger: z.object({ type: z.string(), conditions: z.record(z.any()).optional() }).optional(),
  steps: z.array(z.object({ type: z.string(), params: z.record(z.any()).optional() })).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await requireSession();
  const body = await req.json().catch(() => ({}));
  const p = patch.safeParse(body);
  if (!p.success) return NextResponse.json({ error: p.error.flatten() }, { status: 400 });
  const existing = await db.automations.get(params.id);
  if (!existing || existing.organizationId !== s.org)
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  const updated = await db.automations.patch(params.id, p.data as any);
  return NextResponse.json({ automation: updated });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const s = await requireSession();
  const existing = await db.automations.get(params.id);
  if (!existing || existing.organizationId !== s.org)
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  await db.automations.delete(params.id);
  return NextResponse.json({ ok: true });
}
