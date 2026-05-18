"use client";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/cn";

export function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  tone = "cyan",
}: {
  label: string;
  value: string;
  delta?: number;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "cyan" | "royal" | "violet" | "emerald" | "amber";
}) {
  const tones: Record<string, string> = {
    cyan: "from-cyan-400/20 to-cyan-400/0 text-cyan-300",
    royal: "from-royal-500/20 to-royal-500/0 text-royal-300",
    violet: "from-violet-500/20 to-violet-500/0 text-violet-300",
    emerald: "from-emerald-500/20 to-emerald-500/0 text-emerald-300",
    amber: "from-amber-500/20 to-amber-500/0 text-amber-300",
  };
  const positive = (delta ?? 0) >= 0;
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 280, damping: 20 }}
      className="card-premium relative overflow-hidden p-5"
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br blur-2xl",
          tones[tone]
        )}
      />
      <div className="relative flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-slate-400">{label}</div>
          <div className="mt-1 font-display text-[28px] font-bold text-white">{value}</div>
        </div>
        <div className={cn("grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5", tones[tone].split(" ").pop())}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {typeof delta === "number" && (
        <div className="relative mt-3 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold",
              positive ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"
            )}
          >
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta)}%
          </span>
          <span className="text-slate-400">vs. mês anterior</span>
        </div>
      )}
    </motion.div>
  );
}
