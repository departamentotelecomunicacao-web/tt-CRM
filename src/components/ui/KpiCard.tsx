"use client";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/cn";

export function KpiCard({
  label,
  value,
  delta,
  hint,
  icon: Icon,
  tone = "cyan",
}: {
  label: string;
  value: string;
  delta?: number;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "cyan" | "royal" | "violet" | "emerald" | "amber" | "rose";
}) {
  const tones: Record<string, string> = {
    cyan: "from-cyan-400/25 to-cyan-400/0",
    royal: "from-royal-500/25 to-royal-500/0",
    violet: "from-violet-500/25 to-violet-500/0",
    emerald: "from-emerald-500/25 to-emerald-500/0",
    amber: "from-amber-500/25 to-amber-500/0",
    rose: "from-rose-500/25 to-rose-500/0",
  };
  const iconTones: Record<string, string> = {
    cyan: "text-cyan-400",
    royal: "text-royal-400",
    violet: "text-violet-400",
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    rose: "text-rose-400",
  };
  const positive = (delta ?? 0) >= 0;
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 280, damping: 20 }}
      className="card-premium relative overflow-hidden p-5"
    >
      <div className={cn("pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br blur-2xl", tones[tone])} />
      <div className="relative flex items-center justify-between">
        <div className="min-w-0">
          <div className="label">{label}</div>
          <div className="mt-1 truncate font-display text-[26px] font-bold text-primary">{value}</div>
          {hint && <div className="mt-0.5 text-[11px] text-tertiary">{hint}</div>}
        </div>
        <div className={cn("grid h-11 w-11 place-items-center rounded-xl border border-[rgb(var(--border))] surface", iconTones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {typeof delta === "number" && Number.isFinite(delta) && (
        <div className="relative mt-3 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold",
              positive ? "bg-emerald-400/15 text-emerald-300" : "bg-rose-400/15 text-rose-300"
            )}
          >
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
          <span className="text-tertiary">vs. período anterior</span>
        </div>
      )}
    </motion.div>
  );
}
