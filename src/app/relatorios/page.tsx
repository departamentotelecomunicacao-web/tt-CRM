"use client";
import { motion } from "framer-motion";
import { Download, Filter, BarChart3, Inbox } from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
} from "recharts";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { useApi } from "@/lib/swr";
import { brl } from "@/lib/cn";

const radar = [
  { metric: "Prospecção", A: 70 },
  { metric: "Qualificação", A: 70 },
  { metric: "Proposta", A: 70 },
  { metric: "Negociação", A: 70 },
  { metric: "Fechamento", A: 70 },
  { metric: "Pós-venda", A: 70 },
];

export default function RelatoriosPage() {
  const { data } = useApi<any>("/api/dashboard");
  const funnel = (data?.funnel ?? []).map((f: any) => ({ name: f.name.split(" ")[0], total: f.total }));
  const empty = (data?.kpis?.dealsCount ?? 0) === 0;

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        eyebrow="Business Intelligence"
        title="Relatórios & Performance"
        description="Indicadores comerciais, benchmarks e tendências da sua operação."
        actions={
          <>
            <button className="btn btn-ghost text-xs"><Filter className="h-4 w-4" /> Período</button>
            <button className="btn btn-primary text-xs"><Download className="h-4 w-4" /> Exportar PDF</button>
          </>
        }
      />

      {empty ? (
        <EmptyState
          icon={Inbox}
          title="Sem dados para relatar ainda"
          description="Crie negócios e movimente o pipeline. Os relatórios serão gerados automaticamente a partir da sua operação."
        />
      ) : (
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-5 xl:col-span-2">
            <h3 className="font-display text-lg font-semibold text-primary">Funil (valor por estágio)</h3>
            <div className="mt-3 h-[260px]">
              <ResponsiveContainer>
                <BarChart data={funnel} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="b1" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b5cff" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgb(var(--text)/0.08)" />
                  <XAxis type="number" stroke="rgb(var(--text-3))" fontSize={11} tickFormatter={(v) => brl(v)} />
                  <YAxis type="category" dataKey="name" stroke="rgb(var(--text-2))" fontSize={11} width={100} />
                  <Tooltip formatter={(v: any) => brl(Number(v))} cursor={{ fill: "rgb(var(--text)/0.04)" }} />
                  <Bar dataKey="total" radius={[0, 8, 8, 0]} fill="url(#b1)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-5">
            <h3 className="font-display text-base font-semibold text-primary">Skills da equipe</h3>
            <div className="mt-3 h-[260px]">
              <ResponsiveContainer>
                <RadarChart data={radar}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis />
                  <Radar name="Equipe" dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.32} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </section>
      )}

      <section className="card-premium mt-6 p-5">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-[rgb(var(--accent))]" />
          <h3 className="font-display text-base font-semibold text-primary">Relatórios pré-construídos</h3>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            "Receita por vendedor","Conversão por origem","Cohort de retenção","Tempo médio por etapa",
            "Motivos de perda","Pipeline ponderado","Performance vs. meta","Receita recorrente (MRR)",
          ].map((r) => (
            <button key={r} className="card-premium flex items-center justify-between p-3 text-left text-sm text-primary hover:border-[rgb(var(--accent)/0.40)]">
              {r}
              <span className="text-[10px] text-tertiary">→</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
