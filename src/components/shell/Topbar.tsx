"use client";

import { Bell, Search, Plus, ChevronDown, Command, Moon, Sun, LogOut, User } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useApi, api } from "@/lib/swr";
import { useEventBus } from "@/components/providers/EventBus";
import { Avatar } from "@/components/ui/Avatar";
import { relativeTime } from "@/lib/cn";
import { useToast } from "@/components/ui/Toast";

export function Topbar() {
  const { user, refresh } = useAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const { push } = useToast();
  const [showNotif, setShowNotif] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: notif, mutate: refreshNotif } = useApi<{ items: any[]; unread: number }>(
    "/api/notifications"
  );
  const { subscribe } = useEventBus();

  useEffect(() => {
    return subscribe((evt) => {
      if (evt.type === "deal.moved" || evt.type === "deal.created" || evt.type === "task.created") {
        refreshNotif();
      }
    });
  }, [subscribe, refreshNotif]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function logout() {
    try {
      await api("/api/auth/logout", { method: "POST" });
      refresh();
      router.push("/login");
    } catch {
      push({ tone: "error", title: "Erro ao sair" });
    }
  }

  async function markAllRead() {
    await api("/api/notifications", { method: "POST", json: { action: "markAllRead" } });
    refreshNotif();
  }

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg)/0.75)] px-6 py-3 backdrop-blur-xl lg:px-8">
      <div className="relative w-full max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tertiary" />
        <input
          placeholder="Buscar clientes, negócios, tarefas..."
          className="input !pl-10 !pr-24"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md border border-[rgb(var(--border-strong))] surface px-1.5 py-0.5 text-[10px] text-tertiary">
          <Command className="h-3 w-3" /> K
        </kbd>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={toggle}
          title={theme === "dark" ? "Trocar para claro" : "Trocar para escuro"}
          className="grid h-10 w-10 place-items-center rounded-xl border border-[rgb(var(--border-strong))] surface hover:surface-2"
        >
          {theme === "dark" ? (
            <Sun className="h-[18px] w-[18px] text-[rgb(var(--text-2))]" />
          ) : (
            <Moon className="h-[18px] w-[18px] text-[rgb(var(--text-2))]" />
          )}
        </button>

        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotif((s) => !s)}
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-[rgb(var(--border-strong))] surface hover:surface-2"
          >
            <Bell className="h-[18px] w-[18px] text-[rgb(var(--text-2))]" />
            {(notif?.unread ?? 0) > 0 && (
              <span className="absolute right-1.5 top-1.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-[rgb(var(--accent))] px-1 text-[10px] font-bold text-[rgb(var(--bg))]">
                {notif!.unread}
              </span>
            )}
          </button>
          {showNotif && (
            <div className="absolute right-0 top-12 z-40 w-80 overflow-hidden rounded-xl border border-[rgb(var(--border-strong))] bg-[rgb(var(--bg-2))] shadow-2xl">
              <div className="flex items-center justify-between border-b border-[rgb(var(--border))] p-3">
                <div className="text-sm font-semibold text-primary">Notificações</div>
                <button onClick={markAllRead} className="text-[11px] font-semibold text-[rgb(var(--accent))] hover:underline">
                  Marcar todas como lidas
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto scroll-thin">
                {(notif?.items ?? []).length === 0 ? (
                  <div className="p-6 text-center text-xs text-tertiary">Nada por aqui.</div>
                ) : (
                  notif?.items.map((n) => (
                    <div key={n.id} className="border-b border-[rgb(var(--border))] p-3 text-xs hover:surface">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-primary">{n.title}</div>
                        <div className="shrink-0 text-[10px] text-tertiary">{relativeTime(n.createdAt)}</div>
                      </div>
                      {n.body && <div className="mt-0.5 text-secondary">{n.body}</div>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowMenu((s) => !s)}
            className="flex items-center gap-3 rounded-xl border border-[rgb(var(--border-strong))] surface py-1.5 pl-1.5 pr-3 hover:surface-2"
          >
            <Avatar name={user?.name ?? "U"} tone={user?.avatarTone ?? "from-cyan-400 to-royal-600"} size={32} />
            <div className="hidden sm:block">
              <div className="text-xs font-semibold leading-tight text-primary">{user?.name ?? "—"}</div>
              <div className="text-[10px] capitalize text-tertiary">{user?.role ?? "—"}</div>
            </div>
            <ChevronDown className="h-4 w-4 text-tertiary" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-12 z-40 w-56 overflow-hidden rounded-xl border border-[rgb(var(--border-strong))] bg-[rgb(var(--bg-2))] shadow-2xl">
              <div className="border-b border-[rgb(var(--border))] p-3">
                <div className="text-sm font-semibold text-primary">{user?.name}</div>
                <div className="text-[11px] text-tertiary">@{user?.username}</div>
              </div>
              <button
                onClick={() => router.push("/configuracoes")}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-secondary hover:surface"
              >
                <User className="h-4 w-4" /> Perfil & workspace
              </button>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 border-t border-[rgb(var(--border))] px-3 py-2 text-left text-sm text-rose-300 hover:bg-rose-500/10"
              >
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
