"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Paperclip,
  Smile,
  Send,
  Mic,
  Phone,
  Video,
  Sparkles,
  MoreVertical,
  Check,
  CheckCheck,
  Tag,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { CONVERSATIONS, MESSAGES } from "@/lib/data";
import { Avatar } from "@/components/Avatar";
import { cn } from "@/lib/cn";

export default function WhatsAppPage() {
  const [activeId, setActiveId] = useState(CONVERSATIONS[0].id);
  const active = CONVERSATIONS.find((c) => c.id === activeId)!;

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        eyebrow="Omnichannel"
        title="WhatsApp & Conversas"
        description="Multiatendimento centralizado, com templates, etiquetas, automação e respostas inteligentes."
        actions={
          <>
            <button className="btn-ghost text-xs">Templates</button>
            <button className="btn-primary text-xs">
              <Sparkles className="h-4 w-4" /> Sugerir resposta IA
            </button>
          </>
        }
      />

      <div className="card-premium grid h-[calc(100vh-220px)] grid-cols-12 overflow-hidden p-0">
        {/* Conversations list */}
        <aside className="col-span-12 flex flex-col border-r border-white/5 md:col-span-4 lg:col-span-3">
          <div className="border-b border-white/5 p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input placeholder="Buscar conversas..." className="input !pl-10 !py-2 text-xs" />
            </div>
            <div className="mt-2 flex gap-1.5 text-[11px]">
              {["Todas", "Não lidas", "Atribuídas", "Tags"].map((t, i) => (
                <button
                  key={t}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 font-medium",
                    i === 0
                      ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
                      : "border-white/10 bg-white/5 text-slate-300"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <ul className="flex-1 divide-y divide-white/5 overflow-y-auto scroll-thin">
            {CONVERSATIONS.map((c) => (
              <li
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 p-3 transition-colors",
                  activeId === c.id ? "bg-white/[0.05]" : "hover:bg-white/[0.03]"
                )}
              >
                <div className="relative">
                  <Avatar name={c.name} tone="from-cyan-400 to-royal-600" size={42} />
                  {c.online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-ink-900 bg-emerald-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-sm font-semibold text-white">{c.name}</span>
                    <span className="text-[10px] text-slate-400">{c.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="truncate text-xs text-slate-400">{c.last}</span>
                    {c.unread > 0 && (
                      <span className="ml-2 grid h-4 min-w-[16px] place-items-center rounded-full bg-grad-primary px-1 text-[10px] font-bold text-white">
                        {c.unread}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Chat */}
        <section className="col-span-12 flex flex-col md:col-span-8 lg:col-span-6">
          <header className="flex items-center justify-between border-b border-white/5 p-3">
            <div className="flex items-center gap-3">
              <Avatar name={active.name} tone="from-cyan-400 to-royal-600" size={40} />
              <div>
                <div className="text-sm font-semibold text-white">{active.name}</div>
                <div className="text-[11px] text-emerald-300">
                  {active.online ? "online" : "visto recentemente"} · {active.company}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
                <Phone className="h-4 w-4" />
              </button>
              <button className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
                <Video className="h-4 w-4" />
              </button>
              <button className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="relative flex-1 overflow-y-auto p-4 scroll-thin">
            <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] [background-size:24px_24px]" />
            <div className="relative mx-auto max-w-2xl space-y-2.5">
              <div className="my-2 text-center text-[10px] uppercase tracking-wider text-slate-500">
                Hoje
              </div>
              {MESSAGES.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={cn("flex", m.from === "me" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[78%] rounded-2xl px-3.5 py-2 text-[13px]",
                      m.from === "me"
                        ? "rounded-br-md bg-grad-primary text-white shadow-glow"
                        : "rounded-bl-md border border-white/10 bg-white/[0.05] text-slate-100"
                    )}
                  >
                    {m.text}
                    <div
                      className={cn(
                        "mt-0.5 flex items-center justify-end gap-1 text-[10px]",
                        m.from === "me" ? "text-cyan-100/80" : "text-slate-400"
                      )}
                    >
                      {m.at}
                      {m.from === "me" && <CheckCheck className="h-3 w-3" />}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/5 p-3">
            <div className="mb-2 flex flex-wrap gap-1.5 text-[11px]">
              {["👋 Saudação", "📄 Enviar proposta", "📅 Agendar reunião", "🙏 Agradecer"].map((q) => (
                <button
                  key={q}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-slate-200 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-200"
                >
                  {q}
                </button>
              ))}
              <button className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-0.5 text-cyan-200 hover:bg-cyan-400/15">
                <Sparkles className="mr-1 inline h-3 w-3" /> Gerar com IA
              </button>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
              <button className="text-slate-300 hover:text-white">
                <Smile className="h-5 w-5" />
              </button>
              <button className="text-slate-300 hover:text-white">
                <Paperclip className="h-5 w-5" />
              </button>
              <input
                placeholder="Digite uma mensagem..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none"
              />
              <button className="text-slate-300 hover:text-white">
                <Mic className="h-5 w-5" />
              </button>
              <button className="grid h-9 w-9 place-items-center rounded-xl bg-grad-primary text-white shadow-glow">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Right context panel */}
        <aside className="hidden flex-col border-l border-white/5 lg:col-span-3 lg:flex">
          <div className="border-b border-white/5 p-4 text-center">
            <Avatar name={active.name} tone="from-cyan-400 to-royal-600" size={72} />
            <h3 className="mt-2 font-display text-base font-semibold text-white">{active.name}</h3>
            <div className="text-xs text-slate-400">{active.company}</div>
            <div className="mt-3 flex justify-center gap-1.5">
              <span className="chip">
                <Tag className="h-3 w-3" /> Hot lead
              </span>
              <span className="chip">
                <Tag className="h-3 w-3" /> Enterprise
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Negócio vinculado</div>
            <div className="mt-2 rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Proposta enviada</span>
                <span className="rounded-md bg-cyan-400/10 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-200">
                  70%
                </span>
              </div>
              <div className="mt-1 font-display text-lg font-bold text-cyan-300">R$ 67.500</div>
              <button className="mt-2 flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-slate-200 hover:bg-white/10">
                Ver no pipeline <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="px-4">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Resumo da conversa (IA)</div>
            <div className="mt-2 rounded-xl border border-cyan-400/20 bg-grad-card p-3 text-[12px] text-slate-200">
              Cliente engajado com a proposta, tem dúvida técnica sobre integração com ERP. Tom positivo. Recomendado oferecer call com especialista nas próximas 24h.
            </div>
          </div>
          <div className="mt-auto p-4">
            <button className="btn-ghost w-full text-xs">Ver perfil completo</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
