import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { requireSession } from "@/server/auth";
import { emit } from "@/server/events";

export async function GET(req: NextRequest) {
  const s = await requireSession();
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const segment = req.nextUrl.searchParams.get("segment");

  const contacts = await prisma.contact.findMany({
    where: {
      organizationId: s.org,
      ...(segment && segment !== "Todos" ? { segment } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { email: { contains: q } },
              { phone: { contains: q } },
              { doc: { contains: q } },
              { company: { name: { contains: q } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      company: true,
      owner: { select: { id: true, name: true, avatarTone: true } },
      deals: { select: { id: true, value: true, probability: true, status: true } },
      tags: { include: { tag: true } },
    },
    take: 200,
  });

  return NextResponse.json({ contacts });
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

  let companyId: string | undefined;
  if (p.data.companyName?.trim()) {
    const company = await prisma.company.create({
      data: {
        organizationId: s.org,
        name: p.data.companyName.trim(),
        segment: p.data.segment,
      },
    });
    companyId = company.id;
  }

  const contact = await prisma.contact.create({
    data: {
      organizationId: s.org,
      kind: p.data.kind,
      name: p.data.name,
      doc: p.data.doc,
      email: p.data.email || null,
      phone: p.data.phone,
      whatsapp: p.data.whatsapp,
      city: p.data.city,
      state: p.data.state,
      cep: p.data.cep,
      address: p.data.address,
      segment: p.data.segment,
      origin: p.data.origin,
      notes: p.data.notes,
      ownerId: p.data.ownerId ?? s.uid,
      companyId,
    },
    include: { company: true, owner: true, tags: { include: { tag: true } } },
  });

  await prisma.activity.create({
    data: {
      organizationId: s.org,
      type: "system",
      title: `Contato criado: ${contact.name}`,
      contactId: contact.id,
      authorId: s.uid,
      authorName: s.name,
    },
  });
  await prisma.auditLog.create({
    data: { organizationId: s.org, userId: s.uid, action: "contact.created", entity: "contact", entityId: contact.id },
  });
  emit({ type: "contact.created", org: s.org, payload: { contactId: contact.id, ownerId: contact.ownerId } });

  return NextResponse.json({ contact }, { status: 201 });
}
