import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_STAGES = [
  { name: "Novos leads", accent: "from-royal-500 to-royal-700", hint: "Captação inicial", order: 0, slaHours: 24 },
  { name: "Qualificados", accent: "from-cyan-400 to-royal-500", hint: "SDR validou ICP", order: 1, slaHours: 24 },
  { name: "Proposta enviada", accent: "from-cyan-300 to-cyan-600", hint: "Aguardando retorno", order: 2, slaHours: 48 },
  { name: "Negociação", accent: "from-amber-300 to-amber-600", hint: "Ajustes finais", order: 3, slaHours: 72 },
  { name: "Fechamento", accent: "from-emerald-300 to-emerald-600", hint: "Contrato em assinatura", order: 4, slaHours: 24 },
  { name: "Ganho", accent: "from-emerald-400 to-emerald-700", hint: "Onboarding", order: 5, isWon: true },
  { name: "Perdido", accent: "from-rose-400 to-rose-700", hint: "Análise pós-venda", order: 6, isLost: true },
];

async function main() {
  console.log("🌱 Seeding Fatura CRM (sistema zerado)...");

  // Organização principal
  const org = await prisma.organization.upsert({
    where: { slug: "fatura-expert" },
    update: {},
    create: {
      name: "Fatura Expert",
      slug: "fatura-expert",
      plan: "enterprise",
    },
  });

  // Admin user
  const passwordHash = await bcrypt.hash("Light@2255", 10);
  const admin = await prisma.user.upsert({
    where: { username: "Departartamento_ADM" },
    update: {
      passwordHash,
      active: true,
      role: "owner",
    },
    create: {
      organizationId: org.id,
      username: "Departartamento_ADM",
      name: "Departamento ADM",
      email: "adm@faturaexpert.com",
      passwordHash,
      role: "owner",
      avatarTone: "from-cyan-400 to-royal-600",
    },
  });

  // Pipeline padrão + stages
  const pipeline = await prisma.pipeline.upsert({
    where: { id: `${org.id}-default` },
    update: {},
    create: {
      id: `${org.id}-default`,
      organizationId: org.id,
      name: "Pipeline comercial",
      isDefault: true,
    },
  });

  for (const s of DEFAULT_STAGES) {
    await prisma.stage.upsert({
      where: { id: `${pipeline.id}-${s.order}` },
      update: {},
      create: {
        id: `${pipeline.id}-${s.order}`,
        pipelineId: pipeline.id,
        ...s,
      },
    });
  }

  // Audit
  await prisma.auditLog.create({
    data: {
      organizationId: org.id,
      userId: admin.id,
      action: "system.seed",
      entity: "organization",
      entityId: org.id,
      meta: JSON.stringify({ message: "Sistema iniciado com admin padrão" }),
    },
  });

  console.log("✅ Organização:", org.name);
  console.log("✅ Admin user:", admin.username);
  console.log("✅ Pipeline padrão criado com", DEFAULT_STAGES.length, "estágios");
  console.log("\n🔑 Login:");
  console.log("   usuário: Departartamento_ADM");
  console.log("   senha:   Light@2255\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
