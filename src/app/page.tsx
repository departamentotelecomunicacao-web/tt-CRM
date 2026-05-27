"use client";

import { motion } from "framer-motion";
import Link from "next/link";
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
  Plus,
  Inbox,
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
  Legend,
} from "recharts";
import { useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { KpiCard } from "@/components/ui/KpiCard";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { useApi } from "@/lib/swr";
import { brl, relativeTime } from "@/lib/cn";
import { useEventBus } from "@/components/providers/EventBus";

const PIE_COLORS = ["#22d3ee", "#3b5cff", "#8eadff", "#67e8f9", "#1d4ed8", "#06b6d4", "#a78bfa"];

export default function DashboardPage() {
  const { data, mutate, isLoading } = useApi<any>("/api/dashboard");
  const { subscribe } = useEventBus();
  useEffect(() => {
    return subscribe((e) => {
      if (e.type?.startsWith("deal.") || e.type?.startsWith("task.")) mutate();
    });
  }, [subscribe, mutate]);

  const empty = !isLoading && (data?.kpis?.dealsCount ?? 0) === 0;

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        eyebrow="Visão executiva"
        title="Dashboard"
        description="Sua operação comercial em tempo real. KPIs, funil, performance da equipe e insights do copiloto IA."
        actions={
          <>
            <Link href="/pipeline" className="btn btn-ghost text-xs">
              Abrir pipeline <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link href="/clientes" className="btn btn-primary text-xs">
              <Plus className="h-4 w-4" /> Cadastrar cliente
            </Link>
          </>
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Receita do mês" value={brl(data?.kpis?.revenueMonth ?? 0)} icon={DollarSign} tone="cyan" hint={`${data?.kpis?.wonCount ?? 0} fechamento(s)`} />
        <KpiCard label="Pipeline ativo" value={brl(data?.kpis?.pipelineActive ?? 0)} icon={TrendingUp} tone="royal" hint={`${data?.kpis?.dealsCount ?? 0} negócio(s)`} />
        <KpiCard label="Taxa de conversão" value={`${(data?.kpis?.conversion ?? 0).toFixed(1)}%`} icon={Target} tone="emerald" hint={`${data?.kpis?.wonCount ?? 0} / ${data?.kpis?.dealsCount ?? 0}`} />
        <KpiCard label="Tarefas em aberto" value={String(data?.kpis?.tasksOpen ?? 0)} icon={Clock} tone="amber" hint="A executar nos próximos dias" />
      </section>

      {empty ? (
        <div className="mt-8">
          <EmptyState
            icon={Inbox}
            title="Sua operação está pronta para começar"
            description="Cadastre seu primeiro cliente, crie um negócio no Kanban e veja seus indicadores em tempo real aqui."
            action={
              <div className="flex gap-2">
                <Link href="/clientes" className="btn btn-ghost text-xs">Cadastrar cliente</Link>
                <Link href="/pipeline" className="btn btn-primary text-xs">Criar negócio</Link>
              </div>
            }
          />
        </div>
      ) : (
        <>
          <section className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-premium p-5 xl:col-span-2"
            >
              <div className="flex items-end justify-between">
                <div>
                  <div className="label">Funil comercial</div>
                  <h3 className="font-display text-lg font-semibold text-primary">
                    Distribuição por estágio
                  </h3>
                </div>
                <Link href="/pipeline" className="btn btn-ghost text-xs">
                  Abrir pipeline <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="mt-4 h-[280px]">
                <ResponsiveContainer>
                  <BarChart data={data?.funnel ?? []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="bar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#2740f0" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgb(var(--text)/0.08)" strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="rgb(var(--text-3))" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgb(var(--text-3))" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: "rgb(var(--text)/0.04)" }}
                      formatter={(v: any, _n: any, p: any) => [brl(Number(v)), p.payload.name]}
                    />
                    <Bar dataKey="total" radius={[8, 8, 0, 0]} fill="url(#bar)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="card-premium p-5"
            >
              <div className="flex items-center justify-between">
                <div className="label">Origem dos leads</div>
                <span className="chip">últimos 30d</span>
              </div>
              {(data?.origins?.length ?? 0) === 0 ? (
                <div className="grid h-[260px] place-items-center text-xs text-tertiary">
                  Sem dados ainda
                </div>
              ) : (
                <>
                  <div className="mt-1 h-[200px]">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={data?.origins}
                          dataKey="value"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                          stroke="rgb(var(--bg-2))"
                          strokeWidth={2}
                        >
                          {data?.origins.map((_d: any, i: number) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {data?.origins.map((o: any, i: number) => {
                      const total = data.origins.reduce((a: number, x: any) => a + x.value, 0) || 1;
                      const pct = ((o.value / total) * 100).toFixed(0);
                      return (
                        <li key={o.name} className="flex items-center gap-2 text-xs">
                          <span className="dot" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="flex-1 truncate text-secondary">{o.name}</span>
                          <span className="font-semibold text-primary">{pct}%</span>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </motion.div>
          </section>

          <section className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-premium overflow-hidden p-5 xl:col-span-2"
            >
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-300" />
                <h3 className="font-display text-sm font-semibold text-primary">Ranking de vendedores</h3>
              </div>
              {(data?.ranking?.length ?? 0) === 0 ? (
                <div className="mt-3 rounded-xl border border-dashed border-[rgb(var(--border-strong))] p-6 text-center text-xs text-tertiary">
                  Sem dados de performance ainda
                </div>
              ) : (
                <ul className="mt-3 space-y-2">
                  {data?.ranking.map((r: any, i: number) => (
                    <li key={r.id} className="flex items-center gap-3 rounded-xl border border-[rgb(var(--border))] surface p-2.5">
                      <div className="grid h-6 w-6 place-items-center rounded-md surface-2 text-[11px] font-bold text-secondary">
                        {i + 1}
                      </div>
                      <Avatar name={r.name} tone={r.tone} size={34} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-primary">{r.name}</div>
                        <div className="text-[11px] text-tertiary">
                          {r.deals} negócio(s) · {r.won} ganho(s)
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-[rgb(var(--accent))]">{brl(r.revenue)}</div>
                        <div className="text-[10px] text-tertiary">faturado</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-premium relative overflow-hidden p-5"
            >
              <div className="pointer-events-none absolute inset-0 bg-grad-glow opacity-60" />
              <div className="relative">
                <div className="flex items-center gap-2 text-[rgb(var(--accent))]">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Copiloto IA</span>
                </div>
                <h3 className="mt-2 font-display text-lg font-semibold text-primary">Insights comerciais</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {(data?.insights ?? []).map((it: any, i: number) => (
                    <li key={i} className="rounded-xl border border-[rgb(var(--border))] surface p-3">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-[rgb(var(--accent))]">
                        {it.title}
                      </div>
                      <div className="mt-1 text-secondary">{it.body}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </section>

          {(data?.recentActivities?.length ?? 0) > 0 && (
            <section className="card-premium mt-6 overflow-hidden">
              <div className="border-b border-[rgb(var(--border))] p-4">
                <h3 className="font-display text-sm font-semibold text-primary">Atividade recente</h3>
              </div>
              <ul className="divide-y divide-[rgb(var(--border))]">
                {data?.recentActivities.map((a: any) => (
                  <li key={a.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="dot bg-[rgb(var(--accent))]" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm text-primary">{a.title}</div>
                      <div className="text-[11px] text-tertiary">por {a.author ?? "Sistema"}</div>
                    </div>
                    <div className="text-[10px] text-tertiary">{relativeTime(a.at)}</div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
