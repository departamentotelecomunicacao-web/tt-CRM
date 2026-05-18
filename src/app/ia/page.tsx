"use client";
import { motion } from "framer-motion";
import {
  Sparkles, TrendingUp, Target, HeartHandshake, Brain, MessageSquare, Wand2, ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useApi } from "@/lib/swr";
import { brl, cn } from "@/lib/cn";

const capabilities = [
  { icon: Brain, title: "Resumo de negociações", desc: "Síntese de calls, e-mails e WhatsApp em insights.", tone: "cyan" },
  { icon: Target, title: "Score automático", desc: "Pontuação 0–100 baseada em fit e engajamento.", tone: "royal" },
  { icon: TrendingUp, title: "Previsão de fechamento", desc: "Probabilidade ponderada por dados históricos.", tone: "emerald" },
  { icon: HeartHandshake, title: "Análise de sentimento", desc: "Detecção de objeções e sinais de compra.", tone: "rose" },
  { icon: MessageSquare, title: "Geração de follow-up", desc: "Mensagens personalizadas com tom adequado.", tone: "amber" },
  { icon: Wand2, title: "Próximos passos", desc: "Sugestões priorizadas pelo impacto.", tone: "violet" },
];

const tones: Record<string, string> = {
  cyan: "from-cyan-400/25 to-cyan-400/0 text-cyan-300",
  royal: "from-royal-500/25 to-royal-500/0 text-royal-300",
  emerald: "from-emerald-400/25 to-emerald-400/0 text-emerald-300",
  rose: "from-rose-400/25 to-rose-400/0 text-rose-300",
  amber: "from-amber-400/25 to-amber-400/0 text-amber-300",
  violet: "from-violet-400/25 to-violet-400/0 text-violet-300",
};

export default function IAPage() {
  const { data } = useApi<any>("/api/dashboard");
  const insights = data?.insights ?? [];
  const topDeals = (data?.funnel ?? []).flatMap((f: any) => []); // placeholder if needed
  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        eyebrow="Copiloto comercial"
        title="Inteligência aplicada à venda"
        description="O copiloto analisa seu pipeline, conversas e métricas em tempo real para entregar previsibilidade e produtividade."
      />

      <section className="card-premium relative overflow-hidden p-6">
        <div className="pointer-events-none absolute inset-0 bg-grad-glow opacity-60" />
        <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 text-[rgb(var(--accent))]">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Resumo executivo</span>
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold text-primary">
              Sua operação <span className="gradient-text">em tempo real</span>
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-secondary">
              {data?.kpis?.dealsCount
                ? <>
                    Você tem <b className="text-primary">{data.kpis.dealsCount}</b> negócio(s) no pipeline somando{" "}
                    <b className="text-[rgb(var(--accent))]">{brl(data.kpis.pipelineActive)}</b> em oportunidades.
                    A taxa de conversão atual é de <b className="text-primary">{(data.kpis.conversion ?? 0).toFixed(1)}%</b>.
                  </>
                : <>O copiloto começa a operar assim que você criar seus primeiros negócios e contatos. Volte aqui para insights personalizados.</>
              }
            </p>
          </div>
          <div className="space-y-3">
            {insights.length === 0 && (
              <div className="rounded-xl border border-[rgb(var(--border))] surface p-3 text-xs text-tertiary">
                Sem insights ainda. Eles aparecem conforme você operar o pipeline.
              </div>
            )}
            {insights.map((it: any, i: number) => (
              <div key={i} className="rounded-xl border border-[rgb(var(--accent)/0.30)] bg-[rgb(var(--accent)/0.05)] p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--accent))]">{it.title}</div>
                <p className="mt-1 text-[12px] text-secondary">{it.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {capabilities.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -3 }}
            className="card-premium relative overflow-hidden p-5"
          >
            <div className={cn("pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br blur-2xl", tones[c.tone])} />
            <div className={cn("relative grid h-11 w-11 place-items-center rounded-xl border border-[rgb(var(--border-strong))] surface", tones[c.tone].split(" ").pop())}>
              <c.icon className="h-5 w-5" />
            </div>
            <h3 className="relative mt-3 font-display text-base font-semibold text-primary">{c.title}</h3>
            <p className="relative mt-1 text-sm text-secondary">{c.desc}</p>
            <span className="relative mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[rgb(var(--accent))]">
              Em breve <ArrowRight className="h-3 w-3" />
            </span>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
