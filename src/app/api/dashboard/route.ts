import { NextResponse } from "next/server";
import { db } from "@/server/models";
import { requireSession } from "@/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const s = await requireSession();

  const [deals, pipelines, stages, tasks, users, contacts, activities] = await Promise.all([
    db.deals.filter((d) => d.organizationId === s.org),
    db.pipelines.filter((p) => p.organizationId === s.org),
    db.stages.getAll(),
    db.tasks.filter((t) => t.organizationId === s.org),
    db.users.filter((u) => u.organizationId === s.org && u.active),
    db.contacts.filter((c) => c.organizationId === s.org),
    db.activities.filter((a) => a.organizationId === s.org),
  ]);

  const pipelineActive = deals.filter((d) => d.status === "open");
  const wonAll = deals.filter((d) => d.status === "won");
  const wonThisMonth = wonAll.filter((d) => {
    if (!d.updatedAt) return false;
    const dt = new Date(d.updatedAt);
    const now = new Date();
    return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
  });
  const lost = deals.filter((d) => d.status === "lost");

  const totalPipeline = pipelineActive.reduce((a, d) => a + d.value, 0);
  const weighted = pipelineActive.reduce((a, d) => a + d.value * (d.probability / 100), 0);
  const wonRevenue = wonThisMonth.reduce((a, d) => a + d.value, 0);
  const conversion = deals.length ? (wonAll.length / deals.length) * 100 : 0;

  const defaultPipeline = pipelines.find((p) => p.isDefault) ?? pipelines[0];
  const pipelineStages = defaultPipeline
    ? stages.filter((st) => st.pipelineId === defaultPipeline.id).sort((a, b) => a.order - b.order)
    : [];
  const funnel = pipelineStages.map((st) => {
    const ds = deals.filter((d) => d.stageId === st.id);
    return {
      stageId: st.id,
      name: st.name,
      total: ds.reduce((a, d) => a + d.value, 0),
      count: ds.length,
      accent: st.accent,
    };
  });

  const contactByid = new Map(contacts.map((c) => [c.id, c]));
  const originMap = new Map<string, number>();
  for (const d of deals) {
    const c = d.contactId ? contactByid.get(d.contactId) : null;
    const k = c?.origin || "Sem origem";
    originMap.set(k, (originMap.get(k) ?? 0) + 1);
  }
  const origins = Array.from(originMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const userByid = new Map(users.map((u) => [u.id, u]));
  const ownerMap = new Map<string, { id: string; name: string; tone: string; deals: number; won: number; revenue: number }>();
  for (const d of deals) {
    if (!d.ownerId) continue;
    const owner = userByid.get(d.ownerId);
    if (!owner) continue;
    const cur = ownerMap.get(owner.id) ?? {
      id: owner.id, name: owner.name, tone: owner.avatarTone, deals: 0, won: 0, revenue: 0,
    };
    cur.deals += 1;
    if (d.status === "won") {
      cur.won += 1;
      cur.revenue += d.value;
    }
    ownerMap.set(owner.id, cur);
  }
  const ranking = Array.from(ownerMap.values())
    .sort((a, b) => b.revenue - a.revenue || b.won - a.won)
    .slice(0, 8);

  const insights: { tone: string; title: string; body: string }[] = [];
  const stuck = pipelineActive.filter(
    (d) => (Date.now() - new Date(d.inStageAt).getTime()) / 3600000 > 72
  );
  if (stuck.length)
    insights.push({
      tone: "warn", title: "Leads parados",
      body: `${stuck.length} negócio(s) estão parados há mais de 3 dias no mesmo estágio.`,
    });
  const hot = pipelineActive.filter((d) => d.score >= 85 || d.priority === "critica");
  if (hot.length)
    insights.push({
      tone: "cyan", title: "Oportunidades quentes",
      body: `${hot.length} negócio(s) com score alto/crítico precisam de atenção imediata.`,
    });
  if (deals.length === 0)
    insights.push({
      tone: "info", title: "Bem-vindo!",
      body: "Comece criando seu primeiro negócio em Pipeline ou cadastre clientes em Clientes.",
    });
  if (wonThisMonth.length)
    insights.push({
      tone: "success", title: "Fechamentos do mês",
      body: `${wonThisMonth.length} negócio(s) fechado(s) este mês, totalizando R$ ${wonRevenue.toLocaleString("pt-BR")}.`,
    });

  const recentActivities = [...activities]
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, 12)
    .map((a) => ({
      id: a.id,
      type: a.type,
      title: a.title,
      body: a.body,
      author: a.authorName ?? "Sistema",
      at: a.createdAt,
    }));

  return NextResponse.json({
    kpis: {
      revenueMonth: wonRevenue,
      pipelineActive: totalPipeline,
      pipelineWeighted: weighted,
      conversion,
      dealsCount: deals.length,
      wonCount: wonAll.length,
      lostCount: lost.length,
      activeUsers: users.length,
      tasksOpen: tasks.filter((t) => t.status !== "done").length,
    },
    funnel,
    origins,
    ranking,
    insights,
    recentActivities,
  });
}
