"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  Target,
  Users,
  Clock,
  Sparkles,
  ArrowRight,
  Trophy,
  Flame,
  CheckCircle2,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
} from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { Avatar } from "@/components/Avatar";
import { DEALS, ORIGIN_DATA, RANKING, REVENUE_SERIES, STAGES } from "@/lib/data";
import { brl } from "@/lib/cn";

function funnelData() {
  const byStage = STAGES.map((s) => {
    const deals = DEALS.filter((d) => d.stage === s.id);
    const total = deals.reduce((a, d) => a + d.value, 0);
    return { name: s.label, total, count: deals.length };
  });
  return byStage;
}

export default function Page() {
  const funnel = funnelData();
  const totalPipeline = DEALS.reduce((a, d) => a + d.value, 0);
  const won = DEALS.filter((d) => d.stage === "ganho").reduce((a, d) => a + d.value, 0);

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        eyebrow="Visão executiva"
        title="Bem-vinda, Mariana 👋"
        description="Seu pipeline está aquecido. Você tem 3 negociações próximas do fechamento esta semana."
        actions={
          <>
            <button className="btn-ghost">Exportar</button>
            <button className="btn-primary">
              <Sparkles className="h-4 w-4" />
              Resumo IA do dia
            </button>
          </>
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Receita do mês" value={brl(446000)} delta={12.4} icon={DollarSign} tone="cyan" />
        <KpiCard label="Pipeline ativo" value={brl(totalPipeline)} delta={8.1} icon={TrendingUp} tone="royal" />
        <KpiCard label="Taxa de conversão" value="34,8%" delta={3.2} icon={Target} tone="emerald" />
        <KpiCard label="Tempo médio fechamento" value="18d" delta={-6.3} icon={Clock} tone="amber" />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="card-premium relative overflow-hidden p-5 xl:col-span-2"
        >
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400">Receita vs. Meta</div>
              <div className="mt-1 flex items-baseline gap-3">
                <h3 className="font-display text-2xl font-bold text-white">{brl(won + 446000)}</h3>
                <span className="rounded-md bg-emerald-400/10 px-1.5 py-0.5 text-xs font-semibold text-emerald-300">
                  +18,2% YoY
                </span>
              </div>
            </div>
            <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1 text-xs">
              <button className="rounded-lg bg-white/10 px-3 py-1.5 font-semibold text-white">12M</button>
              <button className="rounded-lg px-3 py-1.5 text-slate-300 hover:text-white">90D</button>
              <button className="rounded-lg px-3 py-1.5 text-slate-300 hover:text-white">30D</button>
            </div>
          </div>
          <div className="mt-4 h-[260px]">
            <ResponsiveContainer>
              <AreaChart data={REVENUE_SERIES} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="meta" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b5cff" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#3b5cff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="m" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(7,13,31,0.95)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                    color: "#fff",
                  }}
                />
                <Area type="monotone" dataKey="meta" stroke="#3b5cff" strokeWidth={2} fill="url(#meta)" />
                <Area type="monotone" dataKey="revenue" stroke="#22d3ee" strokeWidth={2.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="card-premium p-5"
        >
          <div className="flex items-center justify-between">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">Origem dos leads</div>
            <span className="chip">últimos 30d</span>
          </div>
          <div className="mt-2 h-[200px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={ORIGIN_DATA} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {ORIGIN_DATA.map((d, i) => (
                    <Cell key={i} fill={d.fill} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "rgba(7,13,31,0.95)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {ORIGIN_DATA.map((o) => (
              <div key={o.name} className="flex items-center gap-2">
                <span className="dot" style={{ background: o.fill }} />
                <span className="flex-1 text-slate-300">{o.name}</span>
                <span className="font-semibold text-white">{o.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card-premium p-5 xl:col-span-2"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400">Funil comercial</div>
              <h3 className="font-display text-lg font-semibold text-white">Distribuição por estágio</h3>
            </div>
            <button className="btn-ghost text-xs">
              Abrir pipeline <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-4 h-[240px]">
            <ResponsiveContainer>
              <BarChart data={funnel} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="bar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#2740f0" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(7,13,31,0.95)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                  }}
                  formatter={(v: any, _n: any, p: any) => [brl(Number(v)), p.payload.name]}
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]} fill="url(#bar)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="card-premium p-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-amber-400/10 text-amber-300">
                <Trophy className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-400">Ranking de vendedores</div>
                <h3 className="font-display text-sm font-semibold text-white">Top performers do mês</h3>
              </div>
            </div>
          </div>
          <ul className="mt-3 space-y-2">
            {RANKING.map((r, i) => (
              <li
                key={r.name}
                className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-2.5 transition-colors hover:bg-white/[0.05]"
              >
                <div className="grid h-6 w-6 place-items-center rounded-md bg-white/5 text-[11px] font-bold text-slate-300">
                  {i + 1}
                </div>
                <Avatar name={r.name} tone={r.tone} size={34} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-white">{r.name}</div>
                  <div className="text-[11px] text-slate-400">
                    {r.deals} negócios · {r.win} ganhos
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-cyan-300">{brl(r.revenue)}</div>
                  <div className="text-[10px] text-slate-400">faturado</div>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card-premium overflow-hidden p-5 xl:col-span-2"
        >
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-rose-300" />
            <h3 className="font-display text-sm font-semibold text-white">Negociações quentes agora</h3>
            <span className="chip">prioridade crítica</span>
          </div>
          <div className="mt-3 divide-y divide-white/5 rounded-xl border border-white/5 bg-white/[0.02]">
            {DEALS.filter((d) => d.priority === "critica" || d.priority === "alta")
              .slice(0, 5)
              .map((d) => (
                <div key={d.id} className="flex items-center gap-3 p-3">
                  <Avatar name={d.name} tone={d.owner.avatarTone} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-white">{d.name}</div>
                    <div className="truncate text-[11px] text-slate-400">
                      {d.company} · {d.segment}
                    </div>
                  </div>
                  <div className="hidden text-right md:block">
                    <div className="text-xs text-slate-400">próx. ação</div>
                    <div className="text-xs font-semibold text-white">{d.nextAction.label}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-cyan-300">{brl(d.value)}</div>
                    <div className="text-[10px] text-slate-400">{d.probability}% prob.</div>
                  </div>
                  <button className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="card-premium relative overflow-hidden p-5"
        >
          <div className="pointer-events-none absolute inset-0 bg-grad-glow" />
          <div className="relative">
            <div className="flex items-center gap-2 text-cyan-300">
              <Sparkles className="h-4 w-4" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Copiloto IA</span>
            </div>
            <h3 className="mt-2 font-display text-lg font-semibold text-white">
              Insights comerciais
            </h3>
            <ul className="mt-3 space-y-3 text-sm">
              {[
                {
                  i: <Flame className="h-3.5 w-3.5" />,
                  t: "Eduardo Prates (Logística Norte) está com SLA crítico — ligar nas próximas 2h.",
                  c: "rose",
                },
                {
                  i: <Users className="h-3.5 w-3.5" />,
                  t: "5 leads PME parados há +3 dias podem ser recuperados com cadência automática.",
                  c: "cyan",
                },
                {
                  i: <CheckCircle2 className="h-3.5 w-3.5" />,
                  t: "Você bateu 89% da meta. Faltam 3 fechamentos para liberar o bônus mensal.",
                  c: "emerald",
                },
              ].map((it, i) => (
                <li key={i} className="flex items-start gap-2.5 rounded-xl border border-white/5 bg-white/[0.03] p-3">
                  <span
                    className={`mt-0.5 grid h-6 w-6 place-items-center rounded-md bg-${it.c}-400/15 text-${it.c}-300`}
                    style={{
                      background:
                        it.c === "rose"
                          ? "rgba(244,63,94,0.12)"
                          : it.c === "cyan"
                            ? "rgba(34,211,238,0.12)"
                            : "rgba(16,185,129,0.12)",
                      color:
                        it.c === "rose"
                          ? "#fda4af"
                          : it.c === "cyan"
                            ? "#67e8f9"
                            : "#6ee7b7",
                    }}
                  >
                    {it.i}
                  </span>
                  <span className="text-slate-200">{it.t}</span>
                </li>
              ))}
            </ul>
            <button className="btn-primary mt-4 w-full">
              <Sparkles className="h-4 w-4" /> Gerar plano de ação do dia
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
