import { Collection, type Entity } from "./store";

// ============================================================
// Types — versão Blobs (sem relations declarativas, FK por id)
// ============================================================

export interface Organization extends Entity {
  name: string;
  slug: string;
  plan: string;
}

export interface User extends Entity {
  organizationId: string;
  username: string;
  email: string | null;
  name: string;
  passwordHash: string;
  role: "owner" | "admin" | "manager" | "seller" | "sdr" | "cs";
  avatarTone: string;
  active: boolean;
  lastLoginAt: string | null;
}

export interface Pipeline extends Entity {
  organizationId: string;
  name: string;
  isDefault: boolean;
  order: number;
}

export interface Stage extends Entity {
  pipelineId: string;
  name: string;
  accent: string;
  hint?: string | null;
  order: number;
  slaHours: number | null;
  isWon: boolean;
  isLost: boolean;
}

export interface Company extends Entity {
  organizationId: string;
  name: string;
  cnpj?: string | null;
  segment?: string | null;
  website?: string | null;
  size?: string | null;
  city?: string | null;
  state?: string | null;
}

export interface Contact extends Entity {
  organizationId: string;
  kind: "PF" | "PJ";
  name: string;
  doc?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  city?: string | null;
  state?: string | null;
  cep?: string | null;
  address?: string | null;
  segment?: string | null;
  origin?: string | null;
  notes?: string | null;
  companyId?: string | null;
  ownerId?: string | null;
  score: number;
  tagIds: string[];
}

export interface Deal extends Entity {
  organizationId: string;
  pipelineId: string;
  stageId: string;
  contactId?: string | null;
  companyId?: string | null;
  ownerId?: string | null;
  title: string;
  value: number;
  probability: number;
  priority: "baixa" | "media" | "alta" | "critica";
  score: number;
  status: "open" | "won" | "lost";
  lossReason?: string | null;
  nextActionLabel?: string | null;
  nextActionAt?: string | null;
  inStageAt: string;
  position: number;
  tagIds: string[];
}

export interface Tag extends Entity {
  organizationId: string;
  label: string;
  tone: string;
}

export interface Activity extends Entity {
  organizationId: string;
  type: "call" | "email" | "whatsapp" | "note" | "meeting" | "task" | "file" | "stage" | "ai" | "system";
  title: string;
  body?: string | null;
  meta?: any;
  dealId?: string | null;
  contactId?: string | null;
  authorId?: string | null;
  authorName?: string | null;
}

export interface Task extends Entity {
  organizationId: string;
  title: string;
  description?: string | null;
  status: "todo" | "doing" | "done";
  priority: "baixa" | "media" | "alta" | "critica";
  dueAt?: string | null;
  completedAt?: string | null;
  dealId?: string | null;
  contactId?: string | null;
  assigneeId?: string | null;
}

export interface Automation extends Entity {
  organizationId: string;
  name: string;
  description?: string | null;
  trigger: { type: string; conditions?: Record<string, any> };
  steps: { type: string; params?: Record<string, any> }[];
  active: boolean;
  runs: number;
  lastRunAt?: string | null;
}

export interface AuditLog extends Entity {
  organizationId: string;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  meta?: any;
  ip?: string | null;
}

export interface Notification extends Entity {
  organizationId: string;
  userId: string;
  type: string;
  title: string;
  body?: string | null;
  read: boolean;
  link?: string | null;
}

// ============================================================
// Collections — uma por modelo
// ============================================================
export const db = {
  organizations: new Collection<Organization>("organizations", ["slug"]),
  users: new Collection<User>("users", ["username"]),
  pipelines: new Collection<Pipeline>("pipelines"),
  stages: new Collection<Stage>("stages"),
  companies: new Collection<Company>("companies"),
  contacts: new Collection<Contact>("contacts"),
  deals: new Collection<Deal>("deals"),
  tags: new Collection<Tag>("tags"),
  activities: new Collection<Activity>("activities"),
  tasks: new Collection<Task>("tasks"),
  automations: new Collection<Automation>("automations"),
  auditLogs: new Collection<AuditLog>("audit_logs"),
  notifications: new Collection<Notification>("notifications"),
};

// ============================================================
// Helpers de domínio
// ============================================================

export async function listDealsWithRelations(orgId: string) {
  const [deals, contacts, companies, users, stages, pipelines, tags] = await Promise.all([
    db.deals.filter((d) => d.organizationId === orgId),
    db.contacts.filter((c) => c.organizationId === orgId),
    db.companies.filter((c) => c.organizationId === orgId),
    db.users.filter((u) => u.organizationId === orgId),
    db.stages.getAll(),
    db.pipelines.filter((p) => p.organizationId === orgId),
    db.tags.filter((t) => t.organizationId === orgId),
  ]);
  const cByid = new Map(contacts.map((c) => [c.id, c]));
  const coByid = new Map(companies.map((c) => [c.id, c]));
  const uByid = new Map(users.map((u) => [u.id, u]));
  const sByid = new Map(stages.map((s) => [s.id, s]));
  const pByid = new Map(pipelines.map((p) => [p.id, p]));
  const tByid = new Map(tags.map((t) => [t.id, t]));
  return deals.map((d) => ({
    ...d,
    contact: d.contactId ? cByid.get(d.contactId) ?? null : null,
    company: d.companyId ? coByid.get(d.companyId) ?? null : null,
    owner: d.ownerId ? safeOwner(uByid.get(d.ownerId)) : null,
    stage: sByid.get(d.stageId) ?? null,
    pipeline: pByid.get(d.pipelineId) ?? null,
    tags: d.tagIds.map((id) => ({ tag: tByid.get(id) })).filter((t) => t.tag),
  }));
}

export async function listContactsWithRelations(orgId: string) {
  const [contacts, companies, users, deals, tags] = await Promise.all([
    db.contacts.filter((c) => c.organizationId === orgId),
    db.companies.filter((c) => c.organizationId === orgId),
    db.users.filter((u) => u.organizationId === orgId),
    db.deals.filter((d) => d.organizationId === orgId),
    db.tags.filter((t) => t.organizationId === orgId),
  ]);
  const coByid = new Map(companies.map((c) => [c.id, c]));
  const uByid = new Map(users.map((u) => [u.id, u]));
  const tByid = new Map(tags.map((t) => [t.id, t]));
  return contacts.map((c) => ({
    ...c,
    company: c.companyId ? coByid.get(c.companyId) ?? null : null,
    owner: c.ownerId ? safeOwner(uByid.get(c.ownerId)) : null,
    deals: deals
      .filter((d) => d.contactId === c.id)
      .map((d) => ({ id: d.id, value: d.value, probability: d.probability, status: d.status })),
    tags: c.tagIds.map((id) => ({ tag: tByid.get(id) })).filter((t) => t.tag),
  }));
}

export function safeOwner(u?: User | null) {
  if (!u) return null;
  return { id: u.id, name: u.name, username: u.username, avatarTone: u.avatarTone };
}

export function safeUser(u: User) {
  return {
    id: u.id,
    name: u.name,
    username: u.username,
    email: u.email,
    role: u.role,
    avatarTone: u.avatarTone,
    active: u.active,
    lastLoginAt: u.lastLoginAt,
    createdAt: u.createdAt,
  };
}
