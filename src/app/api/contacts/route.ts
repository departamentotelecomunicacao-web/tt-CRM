import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, listContactsWithRelations } from "@/server/models";
import { cuid } from "@/server/store";
import { requireSession } from "@/server/auth";
import { emit } from "@/server/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const s = await requireSession();
  const q = (req.nextUrl.searchParams.get("q") ?? "").toLowerCase();
  const segment = req.nextUrl.searchParams.get("segment");
  let contacts = await listContactsWithRelations(s.org);
  if (segment && segment !== "Todos") contacts = contacts.filter((c) => c.segment === segment);
  if (q) {
    contacts = contacts.filter((c) =>
      `${c.name} ${c.email ?? ""} ${c.phone ?? ""} ${c.doc ?? ""} ${c.company?.name ?? ""}`
        .toLowerCase()
        .includes(q)
    );
  }
  contacts.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  return NextResponse.json({ contacts: contacts.slice(0, 200) });
}

const createSchema = z.object({
  kind: z.enum(["PF", "PJ"]).default("PF"),
  name: z.string().min(1),
  doc: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  cep: z.string().optional(),
  address: z.string().optional(),
  segment: z.string().optional(),
  origin: z.string().optional(),
  notes: z.string().optional(),
  companyName: z.string().optional(),
  ownerId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const s = await requireSession();
  const body = await req.json().catch(() => ({}));
  const p = createSchema.safeParse(body);
  if (!p.success) return NextResponse.json({ error: p.error.flatten() }, { status: 400 });

  let companyId: string | null = null;
  if (p.data.companyName?.trim()) {
    const company = await db.companies.put({
      id: cuid(),
      organizationId: s.org,
      name: p.data.companyName.trim(),
      segment: p.data.segment ?? null,
    });
    companyId = company.id;
  }

  const contact = await db.contacts.put({
    id: cuid(),
    organizationId: s.org,
    kind: p.data.kind,
    name: p.data.name,
    doc: p.data.doc ?? null,
    email: p.data.email || null,
    phone: p.data.phone ?? null,
    whatsapp: p.data.whatsapp ?? null,
    city: p.data.city ?? null,
    state: p.data.state ?? null,
    cep: p.data.cep ?? null,
    address: p.data.address ?? null,
    segment: p.data.segment ?? null,
    origin: p.data.origin ?? null,
    notes: p.data.notes ?? null,
    companyId,
    ownerId: p.data.ownerId ?? s.uid,
    score: 50,
    tagIds: [],
  });

  await db.activities.put({
    id: cuid(),
    organizationId: s.org,
    type: "system",
    title: `Contato criado: ${contact.name}`,
    body: null,
    meta: null,
    dealId: null,
    contactId: contact.id,
    authorId: s.uid,
    authorName: s.name,
  });
  await db.auditLogs.put({
    id: cuid(),
    organizationId: s.org,
    userId: s.uid,
    action: "contact.created",
    entity: "contact",
    entityId: contact.id,
    meta: null,
    ip: null,
  });
  emit({
    type: "contact.created",
    org: s.org,
    payload: { contactId: contact.id, ownerId: contact.ownerId },
  });
  return NextResponse.json({ contact }, { status: 201 });
}
