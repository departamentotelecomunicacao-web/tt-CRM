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
  Wifi,
  WifiOff,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/components/providers/AuthProvider";
import { useEventBus } from "@/components/providers/EventBus";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pipeline", label: "Pipeline", icon: KanbanSquare, badge: "Kanban" },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/whatsapp", label: "Conversas", icon: MessagesSquare },
  { href: "/tarefas", label: "Tarefas", icon: ListChecks },
  { href: "/automacoes", label: "Automações", icon: Workflow },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/ia", label: "Copiloto IA", icon: Sparkles },
];

const sec = [
  { href: "/integracoes", label: "Integrações", icon: PlugZap },
  { href: "/permissoes", label: "Usuários & Permissões", icon: ShieldCheck },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  const path = usePathname();
  const { user } = useAuth();
  const { connected } = useEventBus();

  return (
    <aside className="sticky top-0 z-30 hidden h-screen w-[252px] shrink-0 flex-col border-r border-[rgb(var(--border))] bg-[rgb(var(--bg-2)/0.6)] backdrop-blur-xl lg:flex">
      <div className="flex items-center gap-2.5 px-5 pt-6">
        <div className="relative">
          <div className="absolute inset-0 rounded-xl bg-grad-primary blur-md opacity-60" />
          <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-grad-primary text-white">
            <span className="font-display text-lg font-bold tracking-tight">F</span>
          </div>
        </div>
        <div className="leading-tight">
          <div className="font-display text-[15px] font-semibold tracking-tight text-primary">
            Fatura <span className="gradient-text">CRM</span>
          </div>
          <div className="text-[11px] text-tertiary">Pipeline inteligente</div>
        </div>
      </div>

      <div className="mx-4 mt-6 rounded-2xl border border-[rgb(var(--border))] bg-grad-card p-3">
        <div className="label">Workspace</div>
        <div className="mt-1 flex items-center justify-between">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-primary">
              {user?.organization?.name ?? "—"}
            </div>
            <div className="text-[11px] text-tertiary">
              Plano {user?.organization?.plan ?? "—"}
            </div>
          </div>
          <div
            title={connected ? "Realtime conectado" : "Conectando..."}
            className={cn(
              "grid h-7 w-7 place-items-center rounded-md border border-[rgb(var(--border))]",
              connected ? "text-emerald-400" : "text-amber-400"
            )}
          >
            {connected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          </div>
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
                  ? "surface-2 text-primary"
                  : "text-secondary hover:surface hover:text-primary"
              )}
            >
              {active && (
                <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-grad-primary" />
              )}
              <n.icon
                className={cn(
                  "h-[18px] w-[18px]",
                  active ? "text-[rgb(var(--accent))]" : "text-tertiary group-hover:text-[rgb(var(--accent))]"
                )}
              />
              <span className="flex-1 font-medium">{n.label}</span>
              {n.badge && (
                <span className="rounded-full border border-[rgb(var(--accent)/0.30)] bg-[rgb(var(--accent)/0.10)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--accent))]">
                  {n.badge}
                </span>
              )}
            </Link>
          );
        })}
        <div className="my-3 h-px bg-[rgb(var(--border))]" />
        {sec.map((n) => {
          const active = path.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
                active ? "surface-2 text-primary" : "text-tertiary hover:surface hover:text-primary"
              )}
            >
              <n.icon className="h-[18px] w-[18px]" />
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="m-4 rounded-2xl border border-[rgb(var(--accent)/0.25)] bg-grad-card p-3">
        <div className="flex items-center gap-2 text-[rgb(var(--accent))]">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-semibold">Copiloto IA</span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-secondary">
          O copiloto analisa seu pipeline em tempo real e sugere ações.
        </p>
        <Link
          href="/ia"
          className="mt-2 block w-full rounded-lg border border-[rgb(var(--border-strong))] surface py-1.5 text-center text-[11px] font-semibold text-primary hover:surface-2"
        >
          Abrir insights
        </Link>
      </div>
    </aside>
  );
}
