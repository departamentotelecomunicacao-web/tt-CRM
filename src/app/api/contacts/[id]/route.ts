import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/models";
import { cuid } from "@/server/store";
import { requireSession } from "@/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const s = await requireSession();
  const contact = await db.contacts.get(params.id);
  if (!contact || contact.organizationId !== s.org)
    return NextResponse.json({ error: "not_found" }, { status: 404 });

  const [company, owner, deals, tasks, activities, tags] = await Promise.all([
    contact.companyId ? db.companies.get(contact.companyId) : null,
    contact.ownerId ? db.users.get(contact.ownerId) : null,
    db.deals.filter((d) => d.contactId === contact.id),
    db.tasks.filter((t) => t.contactId === contact.id),
    db.activities.filter((a) => a.contactId === contact.id),
    db.tags.filter((t) => t.organizationId === s.org),
  ]);
  activities.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  const tagByid = new Map(tags.map((t) => [t.id, t]));

  return NextResponse.json({
    contact: {
      ...contact,
      company,
      owner: owner ? { id: owner.id, name: owner.name, avatarTone: owner.avatarTone } : null,
      deals,
      tasks: tasks.slice(0, 20),
      activities: activities.slice(0, 50),
      tags: contact.tagIds.map((id) => ({ tag: tagByid.get(id) })).filter((t) => t.tag),
    },
  });
}

const patch = z.object({
  name: z.string().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  whatsapp: z.string().nullable().optional(),
  segment: z.string().nullable().optional(),
  origin: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await requireSession();
  const body = await req.json().catch(() => ({}));
  const p = patch.safeParse(body);
  if (!p.success) return NextResponse.json({ error: p.error.flatten() }, { status: 400 });
  const existing = await db.contacts.get(params.id);
  if (!existing || existing.organizationId !== s.org)
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  const updated = await db.contacts.patch(params.id, p.data as any);
  return NextResponse.json({ contact: updated });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const s = await requireSession();
  const existing = await db.contacts.get(params.id);
  if (!existing || existing.organizationId !== s.org)
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  await db.contacts.delete(params.id);
  await db.auditLogs.put({
    id: cuid(),
    organizationId: s.org,
    userId: s.uid,
    action: "contact.deleted",
    entity: "contact",
    entityId: params.id,
    meta: null,
    ip: null,
  });
  return NextResponse.json({ ok: true });
}
