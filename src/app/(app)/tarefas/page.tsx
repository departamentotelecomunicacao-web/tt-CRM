"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus, Filter, ListChecks, KanbanSquare, Calendar, CheckCircle2, Circle, Clock, Flame, AlertTriangle, Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { NewTaskModal } from "@/components/tasks/NewTaskModal";
import { useApi, api } from "@/lib/swr";
import { useEventBus } from "@/components/providers/EventBus";
import { useToast } from "@/components/ui/Toast";
import { cn, relativeTime } from "@/lib/cn";

const priorityTone: Record<string, string> = {
  critica: "border-rose-500/40 bg-rose-500/10 text-rose-200",
  alta: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  media: "border-[rgb(var(--border-strong))] surface text-secondary",
  baixa: "border-[rgb(var(--border-strong))] surface text-tertiary",
};
const priorityIcon: Record<string, JSX.Element | null> = {
  critica: <Flame className="h-3 w-3" />,
  alta: <AlertTriangle className="h-3 w-3" />,
  media: null,
  baixa: null,
};

export default function TarefasPage() {
  const { data, mutate, isLoading } = useApi<{ tasks: any[] }>("/api/tasks");
  const tasks = data?.tasks ?? [];
  const { subscribe } = useEventBus();
  const { push } = useToast();
  const [view, setView] = useState<"kanban" | "lista">("kanban");
  const [open, setOpen] = useState(false);

  useEffect(() => subscribe((e) => { if (e.type?.startsWith("task.")) mutate(); }), [subscribe, mutate]);

  async function toggle(id: string, done: boolean) {
    await api(`/api/tasks/${id}`, { method: "PATCH", json: { status: done ? "done" : "todo" } });
    mutate();
  }

  async function del(id: string) {
    await api(`/api/tasks/${id}`, { method: "DELETE" });
    push({ tone: "success", title: "Tarefa removida" });
    mutate();
  }

  const buckets = [
    { id: "todo", label: "A fazer", accent: "from-cyan-400 to-royal-600", filter: (t: any) => t.status === "todo" },
    { id: "doing", label: "Em andamento", accent: "from-amber-400 to-rose-600", filter: (t: any) => t.status === "doing" },
    { id: "done", label: "Concluídas", accent: "from-emerald-400 to-emerald-600", filter: (t: any) => t.status === "done" },
  ];

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        eyebrow="Produtividade"
        title="Tarefas & Follow-ups"
        description="Centralize ações comerciais com SLA, prioridades e automações."
        actions={
          <>
            <div className="hidden gap-1 rounded-xl border border-[rgb(var(--border-strong))] surface p-1 md:flex">
              {[
                { id: "kanban", icon: KanbanSquare, label: "Kanban" },
                { id: "lista", icon: ListChecks, label: "Lista" },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setView(v.id as any)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium",
                    view === v.id ? "surface-2 text-primary" : "text-secondary hover:text-primary"
                  )}
                >
                  <v.icon className="h-3.5 w-3.5" /> {v.label}
                </button>
              ))}
            </div>
            <button onClick={() => setOpen(true)} className="btn btn-primary text-xs">
              <Plus className="h-4 w-4" /> Nova tarefa
            </button>
          </>
        }
      />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20 w-full" />)}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="Sem tarefas no momento"
          description="Crie tarefas para si ou para a equipe. Elas aparecem na timeline do negócio vinculado."
          action={<button onClick={() => setOpen(true)} className="btn btn-primary text-xs"><Plus className="h-4 w-4" /> Criar primeira tarefa</button>}
        />
      ) : view === "kanban" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {buckets.map((b) => {
            const items = tasks.filter(b.filter);
            return (
              <div key={b.id} className="flex flex-col">
                <div className="mb-2 flex items-center gap-2 px-1">
                  <span className={cn("h-2.5 w-2.5 rounded-full bg-gradient-to-br", b.accent)} />
                  <h3 className="font-display text-[13px] font-semibold uppercase tracking-wider text-primary">
                    {b.label}
                  </h3>
                  <span className="rounded-md border border-[rgb(var(--border-strong))] surface px-1.5 py-0.5 text-[10px] font-semibold text-secondary">
                    {items.length}
                  </span>
                </div>
                <div className="flex-1 space-y-2 rounded-2xl border border-[rgb(var(--border))] surface p-2">
                  {items.map((t) => (
                    <motion.div key={t.id} layout className="card-premium p-3">
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => toggle(t.id, t.status !== "done")}
                          className={cn(
                            "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-all",
                            t.status === "done"
                              ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
                              : "border-[rgb(var(--border-strong))] hover:border-[rgb(var(--accent))]"
                          )}
                        >
                          {t.status === "done" && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className={cn("text-[13px] font-medium", t.status === "done" ? "text-tertiary line-through" : "text-primary")}>
                            {t.title}
                          </div>
                          {t.deal && <div className="mt-0.5 text-[11px] text-tertiary">{t.deal.title}</div>}
                        </div>
                        <button onClick={() => del(t.id)} className="text-tertiary hover:text-rose-300">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold capitalize", priorityTone[t.priority])}>
                          {priorityIcon[t.priority]} {t.priority}
                        </span>
                        {t.dueAt && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-secondary">
                            <Clock className="h-3 w-3" /> {new Date(t.dueAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {items.length === 0 && (
                    <div className="grid place-items-center rounded-xl border border-dashed border-[rgb(var(--border-strong))] p-6 text-center text-[11px] text-tertiary">
                      Nada por aqui ✨
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-premium overflow-hidden">
          {tasks.map((t) => (
            <div key={t.id} className="flex items-center gap-3 border-b border-[rgb(var(--border))] px-4 py-3 last:border-b-0 hover:surface">
              <button
                onClick={() => toggle(t.id, t.status !== "done")}
                className={cn("grid h-5 w-5 place-items-center rounded-full border",
                  t.status === "done" ? "border-emerald-400 bg-emerald-400/20 text-emerald-300" : "border-[rgb(var(--border-strong))]"
                )}
              >
                {t.status === "done" && <CheckCircle2 className="h-3.5 w-3.5" />}
              </button>
              <div className="min-w-0 flex-1">
                <div className={cn("truncate text-sm", t.status === "done" ? "text-tertiary line-through" : "text-primary")}>{t.title}</div>
                {t.deal && <div className="truncate text-[11px] text-tertiary">{t.deal.title}</div>}
              </div>
              <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-semibold capitalize", priorityTone[t.priority])}>{t.priority}</span>
              <span className="text-xs text-secondary">{t.dueAt ? relativeTime(t.dueAt) : "—"}</span>
              <button onClick={() => del(t.id)} className="text-tertiary hover:text-rose-300">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <NewTaskModal open={open} onClose={() => setOpen(false)} onCreated={() => mutate()} />
    </div>
  );
}
