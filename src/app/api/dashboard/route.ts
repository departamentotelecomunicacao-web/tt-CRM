import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireSession } from "@/server/auth";

export async function GET() {
  const s = await requireSession();

  const [deals, pipelines, tasks, users, recentActivities] = await Promise.all([
    prisma.deal.findMany({
      where: { organizationId: s.org },
      include: { stage: true, owner: true, contact: true },
    }),
    prisma.pipeline.findMany({
      where: { organizationId: s.org },
      include: { stages: { orderBy: { order: "asc" } } },
    }),
    prisma.task.findMany({ where: { organizationId: s.org } }),
    prisma.user.findMany({
      where: { organizationId: s.org, active: true },
      select: { id: true, name: true, avatarTone: true, role: true },
    }),
    prisma.activity.findMany({
      where: { organizationId: s.org },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { author: { select: { name: true } } },
    }),
  ]);

  const pipelineActive = deals.filter((d) => d.status === "open");
  const wonThisMonth = deals.filter((d) => {
    if (d.status !== "won") return false;
    const now = new Date();
    return d.updatedAt.getMonth() === now.getMonth() && d.updatedAt.getFullYear() === now.getFullYear();
  });
  const lost = deals.filter((d) => d.status === "lost");

  const totalPipeline = pipelineActive.reduce((a, d) => a + d.value, 0);
  const weighted = pipelineActive.reduce((a, d) => a + d.value * (d.probability / 100), 0);
  const wonRevenue = wonThisMonth.reduce((a, d) => a + d.value, 0);
  const conversion = deals.length ? (wonThisMonth.length / deals.length) * 100 : 0;

  // Funnel by stage
  const stages = pipelines[0]?.stages ?? [];
  const funnel = stages.map((st) => {
    const ds = deals.filter((d) => d.stageId === st.id);
    return {
      stageId: st.id,
      name: st.name,
      total: ds.reduce((a, d) => a + d.value, 0),
      count: ds.length,
      accent: st.accent,
    };
  });

  // By origin (from contact)
  const originMap = new Map<string, number>();
  for (const d of deals) {
    const c = d.contact;
    const k = c?.origin || "Sem origem";
    originMap.set(k, (originMap.get(k) ?? 0) + 1);
  }
  const origins = Array.from(originMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Ranking by owner
  const ownerMap = new Map<string, { id: string; name: string; tone: string; deals: number; won: number; revenue: number }>();
  for (const d of deals) {
    if (!d.owner) continue;
    const cur = ownerMap.get(d.owner.id) ?? {
      id: d.owner.id,
      name: d.owner.name,
      tone: d.owner.avatarTone,
      deals: 0,
      won: 0,
      revenue: 0,
    };
    cur.deals += 1;
    if (d.status === "won") {
      cur.won += 1;
      cur.revenue += d.value;
    }
    ownerMap.set(d.owner.id, cur);
  }
  const ranking = Array.from(ownerMap.values())
    .sort((a, b) => b.revenue - a.revenue || b.won - a.won)
    .slice(0, 8);

  // Insights AI (heurísticas)
  const insights: { tone: string; title: string; body: string }[] = [];
  const stuck = pipelineActive.filter((d) => {
    const h = (Date.now() - d.inStageAt.getTime()) / 3600000;
    return h > 72;
  });
  if (stuck.length) {
    insights.push({
      tone: "warn",
      title: "Leads parados",
      body: `${stuck.length} negócio(s) estão parados há mais de 3 dias no mesmo estágio.`,
    });
  }
  const hot = pipelineActive.filter((d) => d.score >= 85 || d.priority === "critica");
  if (hot.length) {
    insights.push({
      tone: "cyan",
      title: "Oportunidades quentes",
      body: `${hot.length} negócio(s) com score alto/crítico precisam de atenção imediata.`,
    });
  }
  if (deals.length === 0) {
    insights.push({
      tone: "info",
      title: "Bem-vindo!",
      body: "Comece criando seu primeiro negócio em Pipeline ou cadastre clientes em Clientes.",
    });
  }
  if (wonThisMonth.length) {
    insights.push({
      tone: "success",
      title: "Fechamentos do mês",
      body: `${wonThisMonth.length} negócio(s) fechado(s) este mês, totalizando R$ ${wonRevenue.toLocaleString("pt-BR")}.`,
    });
  }

  return NextResponse.json({
    kpis: {
      revenueMonth: wonRevenue,
      pipelineActive: totalPipeline,
      pipelineWeighted: weighted,
      conversion,
      avgCycleDays: 0, // TODO: calcular a partir de histórico
      dealsCount: deals.length,
      wonCount: wonThisMonth.length,
      lostCount: lost.length,
      activeUsers: users.length,
      tasksOpen: tasks.filter((t) => t.status !== "done").length,
    },
    funnel,
    origins,
    ranking,
    insights,
    recentActivities: recentActivities.map((a) => ({
      id: a.id,
      type: a.type,
      title: a.title,
      body: a.body,
      author: a.author?.name ?? a.authorName,
      at: a.createdAt,
    })),
  });
}
