"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import {
  Phone,
  MessageCircle,
  Clock,
  Flame,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { brl, cn } from "@/lib/cn";

const toneMap: Record<string, string> = {
  cyan: "bg-cyan-400/15 text-cyan-200 border-cyan-400/30",
  blue: "bg-royal-500/15 text-royal-200 border-royal-500/30",
  violet: "bg-violet-500/15 text-violet-200 border-violet-500/30",
  emerald: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
  amber: "bg-amber-500/15 text-amber-200 border-amber-500/30",
  rose: "bg-rose-500/15 text-rose-200 border-rose-500/30",
  slate: "surface text-secondary border-[rgb(var(--border))]",
};

const priorityIcon: Record<string, JSX.Element | null> = {
  critica: <Flame className="h-3 w-3" />,
  alta: <AlertTriangle className="h-3 w-3" />,
  media: null,
  baixa: null,
};

const priorityTone: Record<string, string> = {
  critica: "bg-rose-500/20 text-rose-200 border-rose-500/40",
  alta: "bg-amber-500/20 text-amber-200 border-amber-500/40",
  media: "surface text-secondary border-[rgb(var(--border-strong))]",
  baixa: "surface text-tertiary border-[rgb(var(--border-strong))]",
};

export interface DealData {
  id: string;
  title: string;
  value: number;
  probability: number;
  priority: string;
  score: number;
  inStageAt: string | Date;
  contact?: { id: string; name: string; whatsapp?: string | null; phone?: string | null } | null;
  company?: { id: string; name: string } | null;
  owner?: { id: string; name: string; avatarTone: string } | null;
  tags?: { tag: { id: string; label: string; tone: string } }[];
  nextActionLabel?: string | null;
  nextActionAt?: string | null;
}

export function DealCard({
  deal,
  onOpen,
}: {
  deal: DealData;
  onOpen: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: deal.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const inStageHours = Math.floor(
    (Date.now() - new Date(deal.inStageAt).getTime()) / 3600000
  );

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      layout
      whileHover={{ y: -2 }}
      onClick={() => onOpen(deal.id)}
      className={cn(
        "group cursor-grab rounded-xl border border-[rgb(var(--border))] surface p-3 transition-all hover:border-[rgb(var(--accent)/0.40)] active:cursor-grabbing",
        isDragging && "rotate-1 ring-2 ring-[rgb(var(--accent)/0.55)]"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold text-primary">{deal.title}</div>
          <div className="truncate text-[11px] text-tertiary">
            {deal.company?.name ?? deal.contact?.name ?? "Sem contato"}
          </div>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold capitalize",
            priorityTone[deal.priority]
          )}
        >
          {priorityIcon[deal.priority]}
          {deal.priority}
        </span>
      </div>

      {(deal.tags?.length ?? 0) > 0 && (
        <div className="mt-2 flex items-center gap-1.5">
          {deal.tags!.slice(0, 2).map((t) => (
            <span
              key={t.tag.id}
              className={cn(
                "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
                toneMap[t.tag.tone] ?? toneMap.slate
              )}
            >
              {t.tag.label}
            </span>
          ))}
          {deal.tags!.length > 2 && (
            <span className="text-[10px] text-tertiary">+{deal.tags!.length - 2}</span>
          )}
        </div>
      )}

      <div className="mt-3 flex items-end justify-between">
        <div>
          <div className="label text-[9px]">Valor</div>
          <div className="font-display text-[15px] font-bold text-primary">{brl(deal.value)}</div>
        </div>
        <div className="text-right">
          <div className="label text-[9px]">Prob.</div>
          <div className="text-[13px] font-semibold text-[rgb(var(--accent))]">{deal.probability}%</div>
        </div>
      </div>

      <div className="mt-2 h-1 overflow-hidden rounded-full surface-2">
        <div className="h-full bg-grad-primary" style={{ width: `${deal.probability}%` }} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {deal.owner ? (
            <>
              <Avatar name={deal.owner.name} tone={deal.owner.avatarTone} size={22} />
              <span className="text-[11px] text-secondary">{deal.owner.name.split(" ")[0]}</span>
            </>
          ) : (
            <span className="text-[11px] text-tertiary">Sem responsável</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {deal.contact?.whatsapp && (
            <a
              href={`https://wa.me/${deal.contact.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="grid h-7 w-7 place-items-center rounded-md border border-[rgb(var(--border-strong))] surface text-secondary hover:bg-emerald-400/10 hover:text-emerald-300"
            >
              <MessageCircle className="h-3.5 w-3.5" />
            </a>
          )}
          {deal.contact?.phone && (
            <a
              href={`tel:${deal.contact.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="grid h-7 w-7 place-items-center rounded-md border border-[rgb(var(--border-strong))] surface text-secondary hover:bg-cyan-400/10 hover:text-cyan-300"
            >
              <Phone className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between rounded-lg border border-[rgb(var(--border))] surface px-2 py-1.5 text-[10px]">
        <div className="flex items-center gap-1 text-secondary">
          <Clock className="h-3 w-3" />
          parado {inStageHours}h
        </div>
        {deal.nextActionLabel && (
          <div className="truncate text-tertiary">{deal.nextActionLabel}</div>
        )}
        {deal.score >= 80 && (
          <div className="flex items-center gap-0.5 text-[rgb(var(--accent))]">
            <Sparkles className="h-3 w-3" /> {deal.score}
          </div>
        )}
      </div>
    </motion.div>
  );
}
