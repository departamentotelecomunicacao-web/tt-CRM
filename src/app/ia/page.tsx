"use client";
import { motion } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  Target,
  HeartHandshake,
  Brain,
  MessageSquare,
  Wand2,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DEALS } from "@/lib/data";
import { Avatar } from "@/components/Avatar";
import { brl, cn } from "@/lib/cn";

const capabilities = [
  {
    icon: Brain,
    title: "Resumo de negociações",
    desc: "Sintetize calls, e-mails e WhatsApp em insights acionáveis.",
    tone: "from-cyan-400/20 to-cyan-400/0 text-cyan-300",
  },
  {
    icon: Target,
    title: "Score automático",
    desc: "Cada lead recebe pontuação 0–100 baseada em comportamento e fit.",
    tone: "from-royal-500/20 to-royal-500/0 text-royal-300",
  },
  {
    icon: TrendingUp,
    title: "Previsão de fechamento",
    desc: "Identifique negócios com alta probabilidade nas próximas 2 semanas.",
    tone: "from-emerald-400/20 to-emerald-400/0 text-emerald-300",
  },
  {
    icon: HeartHandshake,
    title: "Análise de sentimento",
    desc: "Detecte frustração, objeção e sinais de compra em tempo real.",
    tone: "from-rose-400/20 to-rose-400/0 text-rose-300",
  },
  {
    icon: MessageSquare,
    title: "Geração de follow-up",
    desc: "Mensagens personalizadas com tom adequado ao cliente.",
    tone: "from-amber-400/20 to-amber-400/0 text-amber-300",
  },
  {
    icon: Wand2,
    title: "Próximos passos sugeridos",
    desc: "Recomendações de ações priorizadas pelo impacto comercial.",
    tone: "from-violet-400/20 to-violet-400/0 text-violet-300",
  },
];

export default function IAPage() {
  const topDeals = [...DEALS].sort((a, b) => b.score - a.score).slice(0, 5);

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        eyebrow="Copiloto comercial"
        title="Inteligência aplicada à venda"
        description="Modelos especializados em CRM analisam suas conversas, leads e métricas para entregar previsibilidade e produtividade."
        actions={
          <button className="btn-primary">
            <Sparkles className="h-4 w-4" /> Gerar plano semanal
          </button>
        }
      />

      <section className="card-premium relative overflow-hidden p-6">
        <div className="pointer-events-none absolute inset-0 bg-grad-glow" />
        <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 text-cyan-300">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Resumo IA semanal</span>
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold text-white">
              Sua semana em <span className="gradient-text">3 frases</span>
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-200">
              Você está com <b className="text-white">12 negócios ativos</b> somando{" "}
              <b className="text-cyan-300">{brl(DEALS.reduce((a, d) => a + d.value, 0))}</b> em pipeline. Três oportunidades enterprise
              estão em estágio avançado e podem fechar nesta semana, contribuindo com até{" "}
              <b className="text-cyan-300">{brl(157000)}</b> em receita.
              <br />
              <br />
              <b>Foco recomendado:</b> priorize Eduardo Prates (Logística Norte) e André Vasconcelos (Vasco
              Distribuidora) — ambos com score acima de 90 e SLA crítico nas próximas horas. Considere oferecer
              trial de 14 dias para acelerar a decisão.
            </p>
          </div>
          <div className="space-y-3">
            <Insight
              tone="rose"
              title="Risco detectado"
              text="2 leads PME parados há 7+ dias devem ser nutridos com cadência outbound."
            />
            <Insight
              tone="cyan"
              title="Oportunidade"
              text="Beatriz Camargo demonstrou alto engajamento e está pronta para upgrade."
            />
            <Insight
              tone="emerald"
              title="Padrão de sucesso"
              text="Negócios com call de descoberta nos primeiros 2 dias fecham 38% mais."
            />
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {capabilities.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -3 }}
            className="card-premium relative overflow-hidden p-5"
          >
            <div className={cn("pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br blur-2xl", c.tone)} />
            <div className={cn("relative grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5", c.tone.split(" ").pop())}>
              <c.icon className="h-5 w-5" />
            </div>
            <h3 className="relative mt-3 font-display text-base font-semibold text-white">{c.title}</h3>
            <p className="relative mt-1 text-sm text-slate-400">{c.desc}</p>
            <button className="relative mt-3 inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:underline">
              Experimentar <ArrowRight className="h-3 w-3" />
            </button>
          </motion.div>
        ))}
      </section>

      <section className="card-premium mt-6 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/5 p-4">
          <Target className="h-4 w-4 text-cyan-300" />
          <h3 className="text-sm font-semibold text-white">Top 5 negócios por score de fechamento</h3>
        </div>
        <div className="divide-y divide-white/5">
          {topDeals.map((d, i) => (
            <div key={d.id} className="grid grid-cols-12 items-center gap-3 p-4 hover:bg-white/[0.02]">
              <div className="col-span-1 font-display text-2xl font-bold text-slate-500">#{i + 1}</div>
              <div className="col-span-4 flex items-center gap-3">
                <Avatar name={d.name} tone={d.owner.avatarTone} size={36} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{d.name}</div>
                  <div className="truncate text-[11px] text-slate-400">{d.company}</div>
                </div>
              </div>
              <div className="col-span-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Score IA</span>
                  <span className="font-semibold text-cyan-300">{d.score}/100</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full bg-grad-primary" style={{ width: `${d.score}%` }} />
                </div>
              </div>
              <div className="col-span-2 text-sm font-semibold text-white">{brl(d.value)}</div>
              <div className="col-span-2 text-right">
                <button className="btn-ghost text-xs">
                  Ver insights <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Insight({ tone, title, text }: { tone: "rose" | "cyan" | "emerald"; title: string; text: string }) {
  const tones = {
    rose: "border-rose-400/30 bg-rose-400/5 text-rose-200",
    cyan: "border-cyan-400/30 bg-cyan-400/5 text-cyan-200",
    emerald: "border-emerald-400/30 bg-emerald-400/5 text-emerald-200",
  };
  return (
    <div className={cn("rounded-xl border p-3", tones[tone])}>
      <div className="text-[10px] font-semibold uppercase tracking-wider">{title}</div>
      <p className="mt-1 text-[12px] text-slate-100">{text}</p>
    </div>
  );
}
