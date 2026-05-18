"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Plus,
  Calendar as CalendarIcon,
  Filter,
  ListChecks,
  KanbanSquare,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { TASKS } from "@/lib/data";
import { cn } from "@/lib/cn";

const buckets = [
  { id: "hoje", label: "Para hoje", accent: "from-rose-400 to-rose-600" },
  { id: "semana", label: "Esta semana", accent: "from-cyan-400 to-royal-600" },
  { id: "atrasadas", label: "Atrasadas", accent: "from-amber-400 to-amber-600" },
  { id: "concluidas", label: "Concluídas", accent: "from-emerald-400 to-emerald-600" },
];

const priorityTone: Record<string, string> = {
  critica: "border-rose-500/30 bg-rose-500/10 text-rose-200",
  alta: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  media: "border-white/10 bg-white/5 text-slate-200",
  baixa: "border-white/10 bg-white/5 text-slate-400",
};

const priorityIcon: Record<string, JSX.Element | null> = {
  critica: <Flame className="h-3 w-3" />,
  alta: <AlertTriangle className="h-3 w-3" />,
  media: null,
  baixa: null,
};

export default function TarefasPage() {
  const [tasks, setTasks] = useState(TASKS);
  const [view, setView] = useState<"kanban" | "lista" | "calendario">("kanban");

  function toggle(id: string) {
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  }

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        eyebrow="Produtividade"
        title="Tarefas & Follow-ups"
        description="Centralize todas as ações comerciais com SLA, prioridades e automações inteligentes."
        actions={
          <>
            <div className="hidden gap-1 rounded-xl border border-white/10 bg-white/5 p-1 md:flex">
              {[
                { id: "kanban", icon: KanbanSquare, label: "Kanban" },
                { id: "lista", icon: ListChecks, label: "Lista" },
                { id: "calendario", icon: Calendar, label: "Calendário" },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setView(v.id as any)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium",
                    view === v.id ? "bg-white/10 text-white" : "text-slate-300 hover:text-white"
                  )}
                >
                  <v.icon className="h-3.5 w-3.5" /> {v.label}
                </button>
              ))}
            </div>
            <button className="btn-ghost">
              <Filter className="h-4 w-4" /> Filtros
            </button>
            <button className="btn-primary">
              <Plus className="h-4 w-4" /> Nova tarefa
            </button>
          </>
        }
      />

      {view === "kanban" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {buckets.map((b) => {
            const items = tasks.filter((t) =>
              b.id === "concluidas"
                ? t.done
                : b.id === "hoje"
                  ? !t.done && t.due.includes("Hoje")
                  : b.id === "atrasadas"
                    ? !t.done && t.due.includes("Hoje") && t.priority === "critica"
                    : !t.done && !t.due.includes("Hoje")
            );
            return (
              <div key={b.id} className="flex flex-col">
                <div className="mb-2 flex items-center gap-2 px-1">
                  <span className={cn("h-2.5 w-2.5 rounded-full bg-gradient-to-br", b.accent)} />
                  <h3 className="font-display text-[13px] font-semibold uppercase tracking-wider text-white">
                    {b.label}
                  </h3>
                  <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300">
                    {items.length}
                  </span>
                </div>
                <div className="flex-1 space-y-2 rounded-2xl border border-white/5 bg-white/[0.015] p-2">
                  {items.map((t) => (
                    <motion.div
                      key={t.id}
                      layout
                      whileHover={{ y: -2 }}
                      className="card-premium p-3"
                    >
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => toggle(t.id)}
                          className={cn(
                            "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-all",
                            t.done
                              ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
                              : "border-white/15 hover:border-cyan-400"
                          )}
                        >
                          {t.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3 w-3 opacity-0" />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div
                            className={cn(
                              "text-[13px] font-medium",
                              t.done ? "text-slate-400 line-through" : "text-white"
                            )}
                          >
                            {t.title}
                          </div>
                          <div className="mt-0.5 text-[11px] text-slate-400">{t.deal}</div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold capitalize",
                            priorityTone[t.priority]
                          )}
                        >
                          {priorityIcon[t.priority]} {t.priority}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-300">
                          <Clock className="h-3 w-3" /> {t.due}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                  {items.length === 0 && (
                    <div className="grid place-items-center rounded-xl border border-dashed border-white/10 p-6 text-center text-[11px] text-slate-400">
                      Nenhuma tarefa aqui ✨
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "lista" && (
        <div className="card-premium overflow-hidden">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 border-b border-white/5 px-4 py-3 last:border-b-0 hover:bg-white/[0.03]"
            >
              <button
                onClick={() => toggle(t.id)}
                className={cn(
                  "grid h-5 w-5 place-items-center rounded-full border",
                  t.done ? "border-emerald-400 bg-emerald-400/20 text-emerald-300" : "border-white/15"
                )}
              >
                {t.done && <CheckCircle2 className="h-3.5 w-3.5" />}
              </button>
              <div className="flex-1">
                <div className={cn("text-sm", t.done ? "text-slate-400 line-through" : "text-white")}>
                  {t.title}
                </div>
                <div className="text-[11px] text-slate-400">{t.deal}</div>
              </div>
              <span
                className={cn(
                  "rounded-md border px-2 py-0.5 text-[10px] font-semibold capitalize",
                  priorityTone[t.priority]
                )}
              >
                {t.priority}
              </span>
              <span className="text-xs text-slate-300">{t.due}</span>
            </div>
          ))}
        </div>
      )}

      {view === "calendario" && (
        <div className="card-premium p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-white">Maio 2026</h3>
            <div className="flex items-center gap-1 text-xs text-slate-300">
              <CalendarIcon className="h-3.5 w-3.5" /> Visão semanal
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-xs">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => (
              <div key={d} className="text-center text-[10px] uppercase tracking-wider text-slate-400">
                {d}
              </div>
            ))}
            {Array.from({ length: 35 }).map((_, i) => {
              const day = i - 3;
              const hasTask = [4, 5, 7, 11, 14, 18, 22, 25].includes(day);
              return (
                <div
                  key={i}
                  className={cn(
                    "aspect-square rounded-xl border border-white/5 bg-white/[0.02] p-2 transition-colors hover:bg-white/[0.06]",
                    day === 18 && "border-cyan-400/40 bg-cyan-400/5"
                  )}
                >
                  {day > 0 && day < 32 && (
                    <>
                      <div
                        className={cn(
                          "text-xs font-semibold",
                          day === 18 ? "text-cyan-300" : "text-white"
                        )}
                      >
                        {day}
                      </div>
                      {hasTask && (
                        <div className="mt-1 space-y-0.5">
                          <div className="truncate rounded bg-cyan-400/15 px-1 text-[9px] text-cyan-200">
                            Call · Eduardo
                          </div>
                          {day % 2 === 0 && (
                            <div className="truncate rounded bg-amber-400/15 px-1 text-[9px] text-amber-200">
                              Proposta
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
