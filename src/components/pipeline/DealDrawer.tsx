"use client";
import { AnimatePresence, motion } from "framer-motion";
import {
  X, Phone, Mail, MessageCircle, MapPin, Building2, Tag, Sparkles, FileText,
  CheckCircle2, PhoneCall, StickyNote, Calendar, TrendingUp, ArrowUpRight, Trash2,
} from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { brl, cn, relativeTime } from "@/lib/cn";
import { useApi, api } from "@/lib/swr";
import { useToast } from "@/components/ui/Toast";

const typeStyle: Record<string, { icon: any; tone: string }> = {
  call:     { icon: PhoneCall,    tone: "bg-cyan-400/15 text-cyan-300 border-cyan-400/40" },
  email:    { icon: Mail,         tone: "bg-royal-500/15 text-royal-300 border-royal-500/40" },
  whatsapp: { icon: MessageCircle,tone: "bg-emerald-400/15 text-emerald-300 border-emerald-400/40" },
  note:     { icon: StickyNote,   tone: "bg-amber-400/15 text-amber-300 border-amber-400/40" },
  meeting:  { icon: Calendar,     tone: "bg-violet-400/15 text-violet-300 border-violet-400/40" },
  task:     { icon: CheckCircle2, tone: "surface text-secondary border-[rgb(var(--border-strong))]" },
  file:     { icon: FileText,     tone: "surface text-secondary border-[rgb(var(--border-strong))]" },
  stage:    { icon: TrendingUp,   tone: "bg-cyan-400/15 text-cyan-300 border-cyan-400/40" },
  ai:       { icon: Sparkles,     tone: "bg-cyan-400/15 text-cyan-200 border-cyan-400/40" },
  system:   { icon: Sparkles,     tone: "surface text-secondary border-[rgb(var(--border-strong))]" },
};

export function DealDrawer({
  dealId,
  onClose,
  onChange,
}: {
  dealId: string | null;
  onClose: () => void;
  onChange: () => void;
}) {
  const open = !!dealId;
  const { data, mutate } = useApi<any>(dealId ? `/api/deals/${dealId}` : null);
  const deal = data?.deal;
  const { push } = useToast();

  const [note, setNote] = useState("");

  async function addActivity(type: string, title: string, body?: string) {
    if (!deal) return;
    await api("/api/activities", {
      method: "POST",
      json: { type, title, body, dealId: deal.id, contactId: deal.contactId ?? undefined },
    });
    mutate();
    push({ tone: "success", title: "Atividade registrada na timeline" });
  }

  async function markWon() {
    if (!deal) return;
    const wonStage = await fetch(`/api/pipelines`).then((r) => r.json());
    const target = wonStage.pipelines?.[0]?.stages?.find((s: any) => s.isWon);
    await api(`/api/deals/${deal.id}`, {
      method: "PATCH",
      json: { status: "won", probability: 100, stageId: target?.id },
    });
    push({ tone: "success", title: "Negócio fechado!", description: "Parabéns 🎉" });
    onChange();
    mutate();
  }

  async function deleteDeal() {
    if (!deal) return;
    if (!confirm(`Excluir o negócio "${deal.title}"?`)) return;
    await api(`/api/deals/${deal.id}`, { method: "DELETE" });
    push({ tone: "success", title: "Negócio excluído" });
    onChange();
    onClose();
  }

  return (
    <AnimatePresence>
      {open && deal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-[640px] flex-col border-l border-[rgb(var(--border-strong))] bg-[rgb(var(--bg-2))] shadow-2xl"
          >
            <header className="relative overflow-hidden border-b border-[rgb(var(--border))] px-6 pt-5">
              <div className="pointer-events-none absolute inset-0 bg-grad-glow opacity-60" />
              <div className="relative flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Avatar name={deal.contact?.name ?? deal.title} tone={deal.owner?.avatarTone ?? "from-cyan-400 to-royal-600"} size={56} />
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-xl font-bold text-primary">{deal.title}</h2>
                    {deal.company?.name && (
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-secondary">
                        <Building2 className="h-3.5 w-3.5" />
                        {deal.company.name}
                      </div>
                    )}
                    {deal.contact?.name && (
                      <div className="mt-0.5 text-xs text-tertiary">Contato: {deal.contact.name}</div>
                    )}
                    {(deal.tags?.length ?? 0) > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {deal.tags.map((t: any) => (
                          <span key={t.tag.id} className="chip">
                            <Tag className="h-3 w-3" />
                            {t.tag.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-[rgb(var(--border-strong))] surface text-secondary hover:surface-2"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="relative mt-5 grid grid-cols-3 gap-3">
                <Stat label="Valor" value={brl(deal.value)} accent="cyan" />
                <Stat label="Probabilidade" value={`${deal.probability}%`} accent="royal" />
                <Stat label="Score IA" value={String(deal.score)} accent="violet" />
              </div>

              <div className="relative mt-4 flex flex-wrap items-center gap-2 pb-4">
                {deal.contact?.whatsapp && (
                  <a
                    href={`https://wa.me/${deal.contact.whatsapp.replace(/\D/g, "")}`}
                    target="_blank" rel="noreferrer"
                    className="btn btn-primary !py-2 text-xs"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                  </a>
                )}
                {deal.contact?.phone && (
                  <a href={`tel:${deal.contact.phone}`} className="btn btn-ghost !py-2 text-xs">
                    <Phone className="h-3.5 w-3.5" /> Ligar
                  </a>
                )}
                {deal.contact?.email && (
                  <a href={`mailto:${deal.contact.email}`} className="btn btn-ghost !py-2 text-xs">
                    <Mail className="h-3.5 w-3.5" /> E-mail
                  </a>
                )}
                <button
                  onClick={() => addActivity("note", "Anotação rápida", note || "Sem descrição")}
                  className="btn btn-ghost !py-2 text-xs"
                >
                  <StickyNote className="h-3.5 w-3.5" /> Anotar
                </button>
                {deal.status === "open" && (
                  <button onClick={markWon} className="btn !py-2 text-xs bg-emerald-500 text-white hover:bg-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Marcar como ganho
                  </button>
                )}
                <button onClick={deleteDeal} className="ml-auto btn !py-2 text-xs text-rose-300 hover:bg-rose-500/10">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-5 scroll-thin">
              <section className="card-premium relative overflow-hidden p-4">
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-400/15 blur-2xl" />
                <div className="relative flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[rgb(var(--accent))]" />
                  <h3 className="text-sm font-semibold text-primary">Resumo do copiloto</h3>
                </div>
                <p className="relative mt-2 text-[13px] leading-relaxed text-secondary">
                  Negócio no estágio <b className="text-primary">{deal.stage?.name}</b> há {Math.floor((Date.now() - new Date(deal.inStageAt).getTime()) / 3600000)}h.
                  Score atual {deal.score}/100 ({deal.probability}% de probabilidade ponderada).
                  {deal.nextActionLabel && <> Próxima ação sugerida: <b className="text-[rgb(var(--accent))]">{deal.nextActionLabel}</b>.</>}
                </p>
              </section>

              <section className="mt-5">
                <h3 className="mb-2 text-sm font-semibold text-primary">Adicionar anotação</h3>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="Ex: cliente pediu desconto, decisor confirmado..."
                  className="input"
                />
                <button
                  disabled={!note.trim()}
                  onClick={async () => { await addActivity("note", "Anotação", note); setNote(""); }}
                  className="btn btn-ghost mt-2 text-xs disabled:opacity-50"
                >
                  Salvar anotação
                </button>
              </section>

              <section className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-primary">Timeline universal</h3>
                  <span className="chip">{deal.activities?.length ?? 0} eventos</span>
                </div>
                {(deal.activities?.length ?? 0) === 0 ? (
                  <div className="rounded-xl border border-dashed border-[rgb(var(--border-strong))] p-6 text-center text-xs text-tertiary">
                    Sem eventos ainda. Cada interação aparecerá aqui.
                  </div>
                ) : (
                  <ol className="relative ml-3 space-y-3 border-l border-[rgb(var(--border-strong))] pl-5">
                    {deal.activities.map((t: any) => {
                      const s = typeStyle[t.type] ?? typeStyle.system;
                      const Icon = s.icon;
                      return (
                        <li key={t.id} className="relative">
                          <span className={cn("absolute -left-[30px] grid h-6 w-6 place-items-center rounded-full border", s.tone)}>
                            <Icon className="h-3 w-3" />
                          </span>
                          <div className="rounded-xl border border-[rgb(var(--border))] surface p-3">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-primary">{t.title}</span>
                              <span className="text-tertiary">{relativeTime(t.createdAt)}</span>
                            </div>
                            {t.body && <p className="mt-1 text-[12px] text-secondary">{t.body}</p>}
                            <div className="mt-1 text-[10px] uppercase tracking-wider text-tertiary">
                              por {t.author?.name ?? t.authorName ?? "Sistema"}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </section>
            </div>

            <footer className="flex items-center justify-between border-t border-[rgb(var(--border))] bg-[rgb(var(--bg-2))] px-6 py-3">
              <div className="text-[11px] text-tertiary">
                Última atualização {relativeTime(deal.updatedAt ?? deal.createdAt)}
              </div>
              <button className="btn btn-primary text-xs">
                Avançar etapa <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: "cyan" | "royal" | "violet" }) {
  const tones = {
    cyan: "from-cyan-400/20 to-cyan-400/0 border-cyan-400/30",
    royal: "from-royal-500/20 to-royal-500/0 border-royal-500/30",
    violet: "from-violet-500/20 to-violet-500/0 border-violet-500/30",
  };
  return (
    <div className={cn("rounded-xl border bg-gradient-to-b p-3", tones[accent])}>
      <div className="label">{label}</div>
      <div className="mt-1 font-display text-lg font-bold text-primary">{value}</div>
    </div>
  );
}
