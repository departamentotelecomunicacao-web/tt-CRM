"use client";
import { motion } from "framer-motion";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mb-6 flex flex-wrap items-end justify-between gap-4"
    >
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-[rgb(var(--accent)/0.30)] bg-[rgb(var(--accent)/0.10)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--accent))]">
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-[28px] font-bold tracking-tight text-primary sm:text-[32px]">
          {title}
        </h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-secondary">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </motion.div>
  );
}
