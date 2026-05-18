"use client";

import { Bell, Search, Plus, ChevronDown, Command } from "lucide-react";

export function Topbar() {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-white/5 bg-ink-950/70 px-6 py-3 backdrop-blur-xl lg:px-8">
      <div className="relative w-full max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Buscar clientes, negócios, tarefas..."
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-24 text-sm text-slate-100 placeholder:text-slate-400 focus:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-300">
          <Command className="h-3 w-3" /> K
        </kbd>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button className="btn-ghost hidden md:inline-flex">
          <Plus className="h-4 w-4" />
          Novo negócio
        </button>
        <button className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10">
          <Bell className="h-[18px] w-[18px] text-slate-200" />
          <span className="absolute right-1.5 top-1.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-cyan-400 px-1 text-[10px] font-bold text-ink-950">
            7
          </span>
        </button>
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-3">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-cyan-400 to-royal-600 text-xs font-bold text-white">
            MA
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-semibold text-white leading-tight">Mariana Alves</div>
            <div className="text-[10px] text-slate-400">Gerente comercial</div>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>
      </div>
    </header>
  );
}
