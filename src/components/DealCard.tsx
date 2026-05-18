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
import type { Deal } from "@/lib/data";
import { Avatar } from "./Avatar";
import { brl, cn } from "@/lib/cn";

const toneMap: Record<string, string> = {
  cyan: "bg-cyan-400/10 text-cyan-200 border-cyan-400/20",
  blue: "bg-royal-500/10 text-royal-200 border-royal-500/20",
  violet: "bg-violet-500/10 text-violet-200 border-violet-500/20",
  emerald: "bg-emerald-500/10 text-emerald-200 border-emerald-500/20",
  amber: "bg-amber-500/10 text-amber-200 border-amber-500/20",
  rose: "bg-rose-500/10 text-rose-200 border-rose-500/20",
  slate: "bg-white/5 text-slate-200 border-white/10",
};

const priorityIcon = {
  critica: <Flame className="h-3 w-3" />,
  alta: <AlertTriangle className="h-3 w-3" />,
  media: null,
  baixa: null,
};

const priorityTone: Record<string, string> = {
  critica: "bg-rose-500/15 text-rose-200 border-rose-500/30",
  alta: "bg-amber-500/15 text-amber-200 border-amber-500/30",
  media: "bg-white/5 text-slate-300 border-white/10",
  baixa: "bg-white/5 text-slate-400 border-white/10",
};

export function DealCard({
  deal,
  onOpen,
}: {
  deal: Deal;
  onOpen: (d: Deal) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: deal.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const slaCritical = deal.slaHours <= 4;
  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      layout
      whileHover={{ y: -2 }}
      onClick={() => onOpen(deal)}
      className={cn(
        "group cursor-grab rounded-xl border border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-white/[0.015] p-3 shadow-card transition-all hover:border-cyan-400/30 hover:shadow-card-hover active:cursor-grabbing",
        isDragging && "rotate-1 ring-2 ring-cyan-400/50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold text-white">{deal.name}</div>
          <div className="truncate text-[11px] text-slate-400">{deal.company}</div>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold capitalize",
            priorityTone[deal.priority]
          )}
        >
          {priorityIcon[deal.priority as keyof typeof priorityIcon]}
          {deal.priority}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        {deal.tags.slice(0, 2).map((t) => (
          <span
            key={t.label}
            className={cn(
              "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
              toneMap[t.tone]
            )}
          >
            {t.label}
          </span>
        ))}
        {deal.tags.length > 2 && (
          <span className="text-[10px] text-slate-400">+{deal.tags.length - 2}</span>
        )}
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400">Valor</div>
          <div className="font-display text-[15px] font-bold text-white">{brl(deal.value)}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-slate-400">Prob.</div>
          <div className="text-[13px] font-semibold text-cyan-300">{deal.probability}%</div>
        </div>
      </div>

      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full bg-grad-primary"
          style={{ width: `${deal.probability}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Avatar name={deal.owner.name} tone={deal.owner.avatarTone} size={22} />
          <span className="text-[11px] text-slate-300">{deal.owner.name.split(" ")[0]}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => e.stopPropagation()}
            className="grid h-7 w-7 place-items-center rounded-md border border-white/10 bg-white/5 text-slate-300 hover:bg-emerald-400/10 hover:text-emerald-300"
          >
            <MessageCircle className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="grid h-7 w-7 place-items-center rounded-md border border-white/10 bg-white/5 text-slate-300 hover:bg-cyan-400/10 hover:text-cyan-300"
          >
            <Phone className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between rounded-lg border border-white/5 bg-black/10 px-2 py-1.5 text-[10px]">
        <div
          className={cn(
            "flex items-center gap-1",
            slaCritical ? "text-rose-300" : "text-slate-300"
          )}
        >
          <Clock className="h-3 w-3" />
          SLA {deal.slaHours}h
        </div>
        <div className="text-slate-400">parado {deal.inStageHours}h</div>
        {deal.score >= 85 && (
          <div className="flex items-center gap-0.5 text-cyan-300">
            <Sparkles className="h-3 w-3" /> {deal.score}
          </div>
        )}
      </div>
    </motion.div>
  );
}
