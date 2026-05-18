"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  MessagesSquare,
  ListChecks,
  Workflow,
  Sparkles,
  Settings,
  ShieldCheck,
  BarChart3,
  PlugZap,
} from "lucide-react";
import { cn } from "@/lib/cn";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pipeline", label: "Pipeline", icon: KanbanSquare, badge: "Kanban" },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/whatsapp", label: "WhatsApp", icon: MessagesSquare, badge: "12" },
  { href: "/tarefas", label: "Tarefas", icon: ListChecks },
  { href: "/automacoes", label: "Automações", icon: Workflow },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/ia", label: "Copiloto IA", icon: Sparkles, badge: "novo" },
];

const sec = [
  { href: "/integracoes", label: "Integrações", icon: PlugZap },
  { href: "/permissoes", label: "Permissões", icon: ShieldCheck },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="sticky top-0 z-30 hidden h-screen w-[252px] shrink-0 flex-col border-r border-white/5 bg-ink-900/60 backdrop-blur-xl lg:flex">
      <div className="flex items-center gap-2.5 px-5 pt-6">
        <div className="relative">
          <div className="absolute inset-0 rounded-xl bg-grad-primary blur-md opacity-60" />
          <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-grad-primary text-white shadow-glow">
            <span className="font-display text-lg font-bold tracking-tight">F</span>
          </div>
        </div>
        <div className="leading-tight">
          <div className="font-display text-[15px] font-semibold tracking-tight text-white">
            Fatura <span className="gradient-text">CRM</span>
          </div>
          <div className="text-[11px] text-slate-400">Pipeline inteligente</div>
        </div>
      </div>

      <div className="mx-4 mt-6 rounded-2xl border border-white/5 bg-grad-card p-3">
        <div className="text-[10px] uppercase tracking-wider text-slate-400">Workspace</div>
        <div className="mt-1 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">Fatura Expert</div>
            <div className="text-[11px] text-slate-400">Plano Enterprise · 24 usuários</div>
          </div>
          <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_2px_rgba(16,185,129,0.6)]" />
        </div>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1 px-3 scroll-thin overflow-y-auto">
        {nav.map((n) => {
          const active = path === n.href || (n.href !== "/" && path.startsWith(n.href));
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                active
                  ? "bg-white/[0.06] text-white shadow-card"
                  : "text-slate-300 hover:bg-white/[0.04] hover:text-white"
              )}
            >
              {active && (
                <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-grad-primary" />
              )}
              <n.icon className={cn("h-[18px] w-[18px]", active ? "text-cyan-300" : "text-slate-400 group-hover:text-cyan-300")} />
              <span className="flex-1 font-medium">{n.label}</span>
              {n.badge && (
                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-200">
                  {n.badge}
                </span>
              )}
            </Link>
          );
        })}
        <div className="my-3 h-px bg-white/5" />
        {sec.map((n) => {
          const active = path.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
                active ? "bg-white/[0.06] text-white" : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              )}
            >
              <n.icon className="h-[18px] w-[18px]" />
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="m-4 rounded-2xl border border-cyan-400/20 bg-grad-card p-3">
        <div className="flex items-center gap-2 text-cyan-300">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-semibold">Copiloto IA ativo</span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
          Você tem <b className="text-white">3 negociações</b> com alta probabilidade de fechar essa semana.
        </p>
        <button className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 py-1.5 text-[11px] font-semibold text-white hover:bg-white/10">
          Ver insights
        </button>
      </div>
    </aside>
  );
}
