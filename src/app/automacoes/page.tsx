"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus, Workflow, Zap, Clock, CheckCircle2, PlayCircle, PauseCircle, ArrowRight, Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { NewAutomationModal } from "@/components/automations/NewAutomationModal";
import { useApi, api } from "@/lib/swr";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";

export default function AutomacoesPage() {
  const { data, mutate, isLoading } = useApi<{ automations: any[] }>("/api/automations");
  const automations = data?.automations ?? [];
  const [open, setOpen] = useState(false);
  const { push } = useToast();

  async function toggle(id: string, active: boolean) {
    await api(`/api/automations/${id}`, { method: "PATCH", json: { active } });
    mutate();
  }
  async function del(id: string) {
    if (!confirm("Excluir esta automação?")) return;
    await api(`/api/automations/${id}`, { method: "DELETE" });
    push({ tone: "success", title: "Automação removida" });
    mutate();
  }

  const stats = {
    active: automations.filter((a) => a.active).length,
    runs: automations.reduce((a, x) => a + (x.runs ?? 0), 0),
    triggers: new Set(automations.map((a) => a.trigger?.type)).size,
  };

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        eyebrow="Workflow builder"
        title="Automações comerciais"
        description="Crie fluxos para nutrir leads, gerar tarefas e operar com eficiência enterprise."
        actions={
          <button onClick={() => setOpen(true)} className="btn btn-primary">
            <Plus className="h-4 w-4" /> Nova automação
          </button>
        }
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: "Ativas", value: String(stats.active), icon: Workflow, tone: "from-cyan-400/25 to-cyan-400/0" },
          { label: "Execuções totais", value: stats.runs.toLocaleString("pt-BR"), icon: Zap, tone: "from-royal-500/25 to-royal-500/0" },
          { label: "Tipos de gatilho", value: String(stats.triggers), icon: Clock, tone: "from-emerald-400/25 to-emerald-400/0" },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="card-premium relative overflow-hidden p-4"
          >
            <div className={cn("pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br blur-2xl", k.tone)} />
            <div className="relative flex items-center justify-between">
              <div>
                <div className="label">{k.label}</div>
                <div className="mt-1 font-display text-2xl font-bold text-primary">{k.value}</div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl border border-[rgb(var(--border-strong))] surface text-[rgb(var(--accent))]">
                <k.icon className="h-5 w-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {isLoading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-32 w-full" />)}
        </div>
      ) : automations.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Workflow}
            title="Nenhuma automação criada"
            description="Comece com um fluxo simples: quando um negócio mover de estágio, criar uma tarefa de follow-up."
            action={<button onClick={() => setOpen(true)} className="btn btn-primary text-xs"><Plus className="h-4 w-4" /> Criar primeira automação</button>}
          />
        </div>
      ) : (
        <section className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
          {automations.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-premium overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-[rgb(var(--border))] p-4">
                <div className="flex items-center gap-2">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-grad-primary text-white">
                    <Workflow className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-primary">{a.name}</h3>
                    <div className="text-[11px] text-tertiary">{a.runs ?? 0} execuções</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggle(a.id, !a.active)} className={cn(
                    "grid h-9 w-9 place-items-center rounded-xl border",
                    a.active ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" : "border-[rgb(var(--border-strong))] surface text-tertiary"
                  )}>
                    {a.active ? <PlayCircle className="h-4 w-4" /> : <PauseCircle className="h-4 w-4" />}
                  </button>
                  <button onClick={() => del(a.id)} className="grid h-9 w-9 place-items-center rounded-xl text-tertiary hover:bg-rose-500/10 hover:text-rose-300">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="rounded-xl border border-[rgb(var(--accent)/0.30)] bg-[rgb(var(--accent)/0.06)] p-3">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[rgb(var(--accent))]">
                    <Zap className="h-3 w-3" /> Gatilho
                  </div>
                  <div className="mt-1 text-sm text-primary">{a.trigger?.type ?? "—"}</div>
                </div>

                <div className="my-2 flex justify-center">
                  <ArrowRight className="h-4 w-4 text-tertiary" />
                </div>

                <ol className="space-y-1.5">
                  {(a.steps ?? []).map((step: any, idx: number) => (
                    <li key={idx} className="flex items-center gap-2 rounded-xl border border-[rgb(var(--border))] surface p-2.5 text-[12px] text-secondary">
                      <span className="grid h-6 w-6 place-items-center rounded-md bg-grad-primary text-white">
                        <CheckCircle2 className="h-3 w-3" />
                      </span>
                      <span className="font-semibold capitalize text-primary">{step.type}</span>
                      <span className="truncate text-tertiary">{step.params?.title ?? ""}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </motion.div>
          ))}
        </section>
      )}

      <NewAutomationModal open={open} onClose={() => setOpen(false)} onCreated={() => mutate()} />
    </div>
  );
}
