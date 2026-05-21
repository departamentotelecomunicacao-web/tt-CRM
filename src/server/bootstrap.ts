import bcrypt from "bcryptjs";
import { db } from "./models";
import { cuid } from "./store";

const DEFAULT_STAGES = [
  { name: "Novos leads",       accent: "from-royal-500 to-royal-700",     hint: "Captação inicial",      order: 0, slaHours: 24, isWon: false, isLost: false },
  { name: "Qualificados",      accent: "from-cyan-400 to-royal-500",      hint: "SDR validou ICP",       order: 1, slaHours: 24, isWon: false, isLost: false },
  { name: "Proposta enviada",  accent: "from-cyan-300 to-cyan-600",       hint: "Aguardando retorno",    order: 2, slaHours: 48, isWon: false, isLost: false },
  { name: "Negociação",        accent: "from-amber-300 to-amber-600",     hint: "Ajustes finais",        order: 3, slaHours: 72, isWon: false, isLost: false },
  { name: "Fechamento",        accent: "from-emerald-300 to-emerald-600", hint: "Contrato em assinatura",order: 4, slaHours: 24, isWon: false, isLost: false },
  { name: "Ganho",             accent: "from-emerald-400 to-emerald-700", hint: "Onboarding",            order: 5, slaHours: null as number | null, isWon: true,  isLost: false },
  { name: "Perdido",           accent: "from-rose-400 to-rose-700",       hint: "Análise pós-venda",     order: 6, slaHours: null as number | null, isWon: false, isLost: true },
];

let bootstrapped = false;
let inflight: Promise<void> | null = null;

export async function ensureBootstrap() {
  if (bootstrapped) return;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      let org = await db.organizations.findByIndex("slug", "fatura-expert");
      if (!org) {
        org = await db.organizations.put({
          id: cuid(),
          name: "Fatura Expert",
          slug: "fatura-expert",
          plan: "enterprise",
        });
      }

      let admin = await db.users.findByIndex("username", "Departartamento_ADM");
      if (!admin) {
        const passwordHash = await bcrypt.hash("Light@2255", 10);
        admin = await db.users.put({
          id: cuid(),
          organizationId: org.id,
          username: "Departartamento_ADM",
          name: "Departamento ADM",
          email: "adm@faturaexpert.com",
          passwordHash,
          role: "owner",
          avatarTone: "from-cyan-400 to-royal-600",
          active: true,
          lastLoginAt: null,
        });
      }

      let pipeline = await db.pipelines.find(
        (p) => p.organizationId === org!.id && p.isDefault
      );
      if (!pipeline) {
        pipeline = await db.pipelines.put({
          id: cuid(),
          organizationId: org.id,
          name: "Pipeline comercial",
          isDefault: true,
          order: 0,
        });
      }

      const stages = await db.stages.filter((s) => s.pipelineId === pipeline!.id);
      if (stages.length === 0) {
        for (const s of DEFAULT_STAGES) {
          await db.stages.put({
            id: cuid(),
            pipelineId: pipeline.id,
            name: s.name,
            accent: s.accent,
            hint: s.hint,
            order: s.order,
            slaHours: s.slaHours,
            isWon: s.isWon,
            isLost: s.isLost,
          });
        }
      }

      bootstrapped = true;
    } catch (e) {
      console.error("[bootstrap] failed", e);
      throw e;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}
