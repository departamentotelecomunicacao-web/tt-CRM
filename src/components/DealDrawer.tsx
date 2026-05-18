"use client";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Building2,
  Tag,
  Sparkles,
  FileText,
  CheckCircle2,
  PhoneCall,
  StickyNote,
  Calendar,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import type { Deal, InteractionEvent } from "@/lib/data";
import { Avatar } from "./Avatar";
import { brl, cn, relativeTime } from "@/lib/cn";

const typeStyle: Record<InteractionEvent["type"], { icon: any; tone: string }> = {
  call: { icon: PhoneCall, tone: "bg-cyan-400/10 text-cyan-300 border-cyan-400/30" },
  email: { icon: Mail, tone: "bg-royal-500/10 text-royal-300 border-royal-500/30" },
  whatsapp: { icon: MessageCircle, tone: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30" },
  note: { icon: StickyNote, tone: "bg-amber-400/10 text-amber-300 border-amber-400/30" },
  meeting: { icon: Calendar, tone: "bg-violet-400/10 text-violet-300 border-violet-400/30" },
  task: { icon: CheckCircle2, tone: "bg-slate-400/10 text-slate-200 border-white/10" },
  file: { icon: FileText, tone: "bg-slate-400/10 text-slate-200 border-white/10" },
  stage: { icon: TrendingUp, tone: "bg-cyan-400/10 text-cyan-300 border-cyan-400/30" },
  ai: { icon: Sparkles, tone: "bg-gradient-to-br from-cyan-400/15 to-royal-500/15 text-cyan-200 border-cyan-400/30" },
};

export function DealDrawer({
  deal,
  open,
  onClose,
}: {
  deal: Deal | null;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && deal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-ink-950/70 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-[640px] flex-col border-l border-white/10 bg-ink-900/95 shadow-2xl backdrop-blur-2xl"
          >
            <header className="relative overflow-hidden border-b border-white/5 px-6 pt-5">
              <div className="pointer-events-none absolute inset-0 bg-grad-glow" />
              <div className="relative flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Avatar name={deal.name} tone={deal.owner.avatarTone} size={56} />
                  <div>
                    <h2 className="font-display text-xl font-bold text-white">{deal.name}</h2>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-300">
                      <Building2 className="h-3.5 w-3.5" />
                      {deal.company} · {deal.segment}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {deal.tags.map((t) => (
                        <span key={t.label} className="chip">
                          <Tag className="h-3 w-3" />
                          {t.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="relative mt-5 grid grid-cols-3 gap-3">
                <Stat label="Valor" value={brl(deal.value)} accent="cyan" />
                <Stat label="Probabilidade" value={`${deal.probability}%`} accent="royal" />
                <Stat label="Score IA" value={`${deal.score}`} accent="violet" />
              </div>

              <div className="relative mt-4 flex items-center gap-2 pb-4">
                <button className="btn-primary !py-2 text-xs">
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </button>
                <button className="btn-ghost !py-2 text-xs">
                  <Phone className="h-3.5 w-3.5" /> Ligar
                </button>
                <button className="btn-ghost !py-2 text-xs">
                  <Mail className="h-3.5 w-3.5" /> E-mail
                </button>
                <button className="btn-ghost !py-2 text-xs">
                  <Calendar className="h-3.5 w-3.5" /> Agendar
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-5 scroll-thin">
              <section className="card-premium relative overflow-hidden p-4">
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-400/10 blur-2xl" />
                <div className="relative flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-300" />
                  <h3 className="text-sm font-semibold text-white">Resumo IA da negociação</h3>
                </div>
                <p className="relative mt-2 text-[13px] leading-relaxed text-slate-300">
                  {deal.name.split(" ")[0]} demonstra <b className="text-white">forte intenção de compra</b>, decisor confirmado.
                  Sensibilidade média a preço, alta valorização do suporte. Próximo passo recomendado:{" "}
                  <b className="text-cyan-300">{deal.nextAction.label}</b> em <b>{deal.nextAction.date}</b>.
                </p>
                <div className="relative mt-3 flex flex-wrap gap-2">
                  <button className="chip hover:border-cyan-400/40 hover:bg-cyan-400/10">
                    Gerar mensagem WhatsApp
                  </button>
                  <button className="chip hover:border-cyan-400/40 hover:bg-cyan-400/10">
                    Sugerir desconto inteligente
                  </button>
                  <button className="chip hover:border-cyan-400/40 hover:bg-cyan-400/10">
                    Análise de sentimento
                  </button>
                </div>
              </section>

              <section className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Contato</h3>
                  <button className="text-[11px] text-cyan-300 hover:underline">Editar</button>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <ContactRow icon={Mail} label={deal.contact.email} />
                  <ContactRow icon={Phone} label={deal.contact.phone} />
                  <ContactRow icon={MessageCircle} label={deal.contact.whatsapp} />
                  <ContactRow icon={MapPin} label="São Paulo, SP · Brasil" />
                </div>
              </section>

              <section className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Produtos & valores</h3>
                  <button className="text-[11px] text-cyan-300 hover:underline">Adicionar</button>
                </div>
                <div className="overflow-hidden rounded-xl border border-white/5">
                  {deal.products.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-3 py-2 last:border-b-0"
                    >
                      <div className="text-sm text-white">{p.name}</div>
                      <div className="text-sm font-semibold text-cyan-300">{brl(p.price)}/mês</div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Timeline de interações</h3>
                  <button className="text-[11px] text-cyan-300 hover:underline">Ver tudo</button>
                </div>
                <ol className="relative ml-3 space-y-3 border-l border-white/10 pl-5">
                  {deal.timeline
                    .slice()
                    .reverse()
                    .map((t) => {
                      const s = typeStyle[t.type];
                      const Icon = s.icon;
                      return (
                        <li key={t.id} className="relative">
                          <span
                            className={cn(
                              "absolute -left-[30px] grid h-6 w-6 place-items-center rounded-full border",
                              s.tone
                            )}
                          >
                            <Icon className="h-3 w-3" />
                          </span>
                          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-white">{t.title}</span>
                              <span className="text-slate-400">{relativeTime(t.at)}</span>
                            </div>
                            {t.description && (
                              <p className="mt-1 text-[12px] text-slate-300">{t.description}</p>
                            )}
                            <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
                              por {t.author}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                </ol>
              </section>
            </div>

            <footer className="flex items-center justify-between border-t border-white/5 bg-ink-900/80 px-6 py-3">
              <div className="text-[11px] text-slate-400">
                Última atualização há {relativeTime(deal.timeline.slice(-1)[0]?.at ?? new Date().toISOString())}
              </div>
              <button className="btn-primary text-xs">
                Avançar etapa <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "cyan" | "royal" | "violet";
}) {
  const tones = {
    cyan: "from-cyan-400/15 to-cyan-400/0 border-cyan-400/20",
    royal: "from-royal-500/15 to-royal-500/0 border-royal-500/20",
    violet: "from-violet-500/15 to-violet-500/0 border-violet-500/20",
  };
  return (
    <div className={cn("rounded-xl border bg-gradient-to-b p-3", tones[accent])}>
      <div className="text-[10px] uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-1 font-display text-lg font-bold text-white">{value}</div>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-2.5 text-xs text-slate-200">
      <span className="grid h-7 w-7 place-items-center rounded-md bg-white/5 text-slate-300">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="truncate">{label}</span>
    </div>
  );
}
