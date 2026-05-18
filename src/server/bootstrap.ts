import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { INIT_SQL } from "./initSql";

const DEFAULT_STAGES = [
  { name: "Novos leads",       accent: "from-royal-500 to-royal-700",     hint: "Captação inicial",      order: 0, slaHours: 24 },
  { name: "Qualificados",      accent: "from-cyan-400 to-royal-500",      hint: "SDR validou ICP",       order: 1, slaHours: 24 },
  { name: "Proposta enviada",  accent: "from-cyan-300 to-cyan-600",       hint: "Aguardando retorno",    order: 2, slaHours: 48 },
  { name: "Negociação",        accent: "from-amber-300 to-amber-600",     hint: "Ajustes finais",        order: 3, slaHours: 72 },
  { name: "Fechamento",        accent: "from-emerald-300 to-emerald-600", hint: "Contrato em assinatura",order: 4, slaHours: 24 },
  { name: "Ganho",             accent: "from-emerald-400 to-emerald-700", hint: "Onboarding",            order: 5, isWon: true,  slaHours: null as any },
  { name: "Perdido",           accent: "from-rose-400 to-rose-700",       hint: "Análise pós-venda",     order: 6, isLost: true, slaHours: null as any },
];

let bootstrapped = false;
let inflight: Promise<void> | null = null;

async function ensureSchema() {
  // Tenta uma query no Organization. Se a tabela não existir → roda o init.sql.
  try {
    await prisma.organization.findFirst({ select: { id: true } });
    return;
  } catch (e: any) {
    const msg = String(e?.message ?? e);
    if (!/does not exist|undefined_table|relation .* does not exist/i.test(msg)) {
      // Outro tipo de erro (rede, auth). Propaga.
      throw e;
    }
    console.log("[bootstrap] schema ausente, aplicando init.sql...");
  }

  // Quebra em statements e executa cada um isoladamente, ignorando
  // erros de "already exists" (ALTER TABLE … ADD CONSTRAINT não é idempotente).
  const statements = INIT_SQL.split(/;\s*$/m)
    .map((s) => s.trim())
    .filter((s) => s && !/^--/.test(s));

  for (const stmt of statements) {
    try {
      await prisma.$executeRawUnsafe(stmt);
    } catch (e: any) {
      const m = String(e?.message ?? e);
      if (/already exists|duplicate_object|42P07|42710/i.test(m)) continue;
      console.error("[bootstrap] falha em statement", stmt.slice(0, 80), "→", m);
      throw e;
    }
  }
  console.log("[bootstrap] schema aplicado com sucesso.");
}

async function ensureSeed() {
  const org =
    (await prisma.organization.findUnique({ where: { slug: "fatura-expert" } })) ??
    (await prisma.organization.create({
      data: { name: "Fatura Expert", slug: "fatura-expert", plan: "enterprise" },
    }));

  const admin = await prisma.user.findUnique({ where: { username: "Departartamento_ADM" } });
  if (!admin) {
    const passwordHash = await bcrypt.hash("Light@2255", 10);
    await prisma.user.create({
      data: {
        organizationId: org.id,
        username: "Departartamento_ADM",
        name: "Departamento ADM",
        email: "adm@faturaexpert.com",
        passwordHash,
        role: "owner",
      },
    });
  }

  let pipeline = await prisma.pipeline.findFirst({
    where: { organizationId: org.id, isDefault: true },
  });
  if (!pipeline) {
    pipeline = await prisma.pipeline.create({
      data: { organizationId: org.id, name: "Pipeline comercial", isDefault: true },
    });
  }

  const stageCount = await prisma.stage.count({ where: { pipelineId: pipeline.id } });
  if (stageCount === 0) {
    for (const s of DEFAULT_STAGES) {
      await prisma.stage.create({
        data: {
          pipelineId: pipeline.id,
          name: s.name,
          accent: s.accent,
          hint: s.hint,
          order: s.order,
          isWon: !!s.isWon,
          isLost: !!s.isLost,
          slaHours: s.slaHours ?? null,
        },
      });
    }
  }
}

export async function ensureBootstrap() {
  if (bootstrapped) return;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      await ensureSchema();
      await ensureSeed();
      bootstrapped = true;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}
