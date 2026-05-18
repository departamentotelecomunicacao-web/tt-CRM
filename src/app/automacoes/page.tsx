"use client";
import { motion } from "framer-motion";
import {
  Plus,
  Workflow,
  Zap,
  Clock,
  CheckCircle2,
  PlayCircle,
  PauseCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Mail,
  MessageCircle,
  UserPlus,
  Tag,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { AUTOMATIONS } from "@/lib/data";
import { cn } from "@/lib/cn";

const actionIcons: Record<string, any> = {
  "Enviar WhatsApp template": MessageCircle,
  "Criar tarefa de qualificação": CheckCircle2,
  "Atribuir SDR": UserPlus,
  "Notificar responsável": Zap,
  "Enviar e-mail de retomada": Mail,
  "Alterar prioridade para alta": Tag,
  "Criar conta": UserPlus,
  "Agendar reunião kickoff": Clock,
  "Notificar CS": Zap,
  "Gerar resumo das negociações": Sparkles,
  "Sugerir próximas ações": Sparkles,
  "Enviar e-mail ao gestor": Mail,
};

export default function AutomacoesPage() {
  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        eyebrow="Workflow builder"
        title="Automações comerciais"
        description="Crie fluxos visuais para nutrir leads, resgatar oportunidades e operar com eficiência enterprise."
        actions={
          <>
            <button className="btn-ghost text-xs">Galeria de templates</button>
            <button className="btn-primary">
              <Plus className="h-4 w-4" /> Nova automação
            </button>
          </>
        }
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: "Automações ativas", value: "12", icon: Workflow, tone: "from-cyan-400/20 to-cyan-400/0" },
          { label: "Execuções hoje", value: "428", icon: Zap, tone: "from-royal-500/20 to-royal-500/0" },
          { label: "Tarefas geradas", value: "1.8k", icon: CheckCircle2, tone: "from-emerald-400/20 to-emerald-400/0" },
          { label: "Tempo economizado", value: "64h", icon: Clock, tone: "from-amber-400/20 to-amber-400/0" },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="card-premium relative overflow-hidden p-4"
          >
            <div className={cn("pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br blur-2xl", k.tone)} />
            <div className="relative flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-400">{k.label}</div>
                <div className="mt-1 font-display text-2xl font-bold text-white">{k.value}</div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-cyan-300">
                <k.icon className="h-5 w-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {AUTOMATIONS.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-premium overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-white/5 p-4">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-grad-primary text-white">
                  <Workflow className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{a.name}</h3>
                  <div className="text-[11px] text-slate-400">{a.runs.toLocaleString("pt-BR")} execuções</div>
                </div>
              </div>
              <button
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-xl border",
                  a.active
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                    : "border-white/10 bg-white/5 text-slate-400"
                )}
              >
                {a.active ? <PlayCircle className="h-4 w-4" /> : <PauseCircle className="h-4 w-4" />}
              </button>
            </div>

            <div className="p-4">
              <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.05] p-3">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-cyan-300">
                  <Zap className="h-3 w-3" /> Gatilho
                </div>
                <div className="mt-1 text-sm text-white">{a.trigger}</div>
              </div>

              <div className="my-2 flex justify-center">
                <ArrowRight className="h-4 w-4 text-slate-500" />
              </div>

              <ol className="space-y-1.5">
                {a.actions.map((act, idx) => {
                  const Icon = actionIcons[act] ?? Zap;
                  return (
                    <li
                      key={idx}
                      className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-2.5 text-[12px] text-slate-200"
                    >
                      <span className="grid h-6 w-6 place-items-center rounded-md bg-grad-primary text-white">
                        <Icon className="h-3 w-3" />
                      </span>
                      {act}
                    </li>
                  );
                })}
              </ol>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span className="inline-flex items-center gap-1 text-emerald-300">
                  <TrendingUp className="h-3 w-3" /> Taxa de sucesso 98,2%
                </span>
                <button className="font-semibold text-cyan-300 hover:underline">Editar fluxo</button>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      <section className="card-premium mt-6 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/5 p-4">
          <Sparkles className="h-4 w-4 text-cyan-300" />
          <h3 className="text-sm font-semibold text-white">Pré-visualização: workflow builder</h3>
        </div>
        <div className="relative grid grid-cols-1 gap-4 p-8 md:grid-cols-5">
          {[
            { t: "Lead criado", c: "bg-grad-primary" },
            { t: "Condição: ICP?", c: "bg-amber-500/80" },
            { t: "Enviar WhatsApp", c: "bg-emerald-500/80" },
            { t: "Esperar 24h", c: "bg-royal-500/80" },
            { t: "Atribuir SDR", c: "bg-cyan-500/80" },
          ].map((n, i) => (
            <div key={i} className="relative">
              <div className="card-premium p-4 text-center">
                <div className={cn("mx-auto grid h-10 w-10 place-items-center rounded-xl text-white", n.c)}>
                  <Zap className="h-4 w-4" />
                </div>
                <div className="mt-2 text-xs font-semibold text-white">{n.t}</div>
                <div className="text-[10px] text-slate-400">Passo {i + 1}</div>
              </div>
              {i < 4 && (
                <ArrowRight className="absolute -right-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-slate-500 md:block" />
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
