"use client";
import { motion } from "framer-motion";
import { Download, Filter, BarChart3 } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { REVENUE_SERIES, DEALS, STAGES, RANKING } from "@/lib/data";
import { brl } from "@/lib/cn";

export default function RelatoriosPage() {
  const funnel = STAGES.map((s) => ({
    name: s.label.split(" ")[0],
    total: DEALS.filter((d) => d.stage === s.id).reduce((a, d) => a + d.value, 0) / 1000,
  }));

  const radar = [
    { metric: "Prospecção", A: 88, B: 70 },
    { metric: "Qualificação", A: 76, B: 65 },
    { metric: "Proposta", A: 92, B: 78 },
    { metric: "Negociação", A: 70, B: 60 },
    { metric: "Fechamento", A: 84, B: 72 },
    { metric: "Pós-venda", A: 80, B: 68 },
  ];

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        eyebrow="Business Intelligence"
        title="Relatórios & Performance"
        description="Visão profunda dos seus indicadores comerciais, com benchmarks e tendências."
        actions={
          <>
            <button className="btn-ghost">
              <Filter className="h-4 w-4" /> Período
            </button>
            <button className="btn-primary">
              <Download className="h-4 w-4" /> Exportar PDF
            </button>
          </>
        }
      />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-5 xl:col-span-2">
          <h3 className="font-display text-lg font-semibold text-white">Evolução de receita (12 meses)</h3>
          <div className="mt-3 h-[280px]">
            <ResponsiveContainer>
              <AreaChart data={REVENUE_SERIES}>
                <defs>
                  <linearGradient id="r1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <XAxis dataKey="m" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: "rgba(7,13,31,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#22d3ee" strokeWidth={2.5} fill="url(#r1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-5">
          <h3 className="font-display text-lg font-semibold text-white">Funil (R$ mil)</h3>
          <div className="mt-3 h-[280px]">
            <ResponsiveContainer>
              <BarChart data={funnel} layout="vertical">
                <defs>
                  <linearGradient id="b1" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b5cff" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.6)" fontSize={11} width={90} />
                <Tooltip
                  contentStyle={{ background: "rgba(7,13,31,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}
                />
                <Bar dataKey="total" radius={[0, 8, 8, 0]} fill="url(#b1)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-5">
          <h3 className="font-display text-base font-semibold text-white">Skills da equipe vs. benchmark</h3>
          <div className="mt-3 h-[260px]">
            <ResponsiveContainer>
              <RadarChart data={radar}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="metric" stroke="rgba(255,255,255,0.6)" fontSize={11} />
                <PolarRadiusAxis stroke="rgba(255,255,255,0.2)" fontSize={9} />
                <Radar name="Sua equipe" dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.35} />
                <Radar name="Benchmark" dataKey="B" stroke="#3b5cff" fill="#3b5cff" fillOpacity={0.2} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#cbd5e1" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-5 xl:col-span-2">
          <h3 className="font-display text-base font-semibold text-white">Ranking detalhado da equipe</h3>
          <div className="mt-3 overflow-hidden rounded-xl border border-white/5">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] text-[10px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="p-3 text-left">Vendedor</th>
                  <th className="p-3 text-right">Negócios</th>
                  <th className="p-3 text-right">Ganhos</th>
                  <th className="p-3 text-right">Win rate</th>
                  <th className="p-3 text-right">Receita</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {RANKING.map((r) => (
                  <tr key={r.name} className="hover:bg-white/[0.02]">
                    <td className="p-3 text-white">{r.name}</td>
                    <td className="p-3 text-right text-slate-300">{r.deals}</td>
                    <td className="p-3 text-right text-emerald-300">{r.win}</td>
                    <td className="p-3 text-right text-cyan-300">
                      {Math.round((r.win / r.deals) * 100)}%
                    </td>
                    <td className="p-3 text-right font-semibold text-white">{brl(r.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>

      <section className="mt-4 card-premium p-5">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-cyan-300" />
          <h3 className="font-display text-base font-semibold text-white">Relatórios pré-construídos</h3>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            "Receita por vendedor",
            "Conversão por origem",
            "Cohort de retenção",
            "Tempo médio por etapa",
            "Motivos de perda",
            "Pipeline ponderado",
            "Performance vs. meta",
            "Receita recorrente (MRR)",
          ].map((r) => (
            <button
              key={r}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left text-sm text-white hover:border-cyan-400/30 hover:bg-cyan-400/[0.04]"
            >
              {r}
              <span className="text-[10px] text-slate-400">→</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
