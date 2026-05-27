"use client";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const maxW = size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-2xl" : "max-w-lg";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 grid place-items-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className={`w-full ${maxW} card-premium relative overflow-hidden`}
            >
              <div className="flex items-start justify-between gap-4 p-5">
                <div>
                  <h3 className="font-display text-lg font-semibold text-primary">{title}</h3>
                  {description && <p className="mt-0.5 text-sm text-secondary">{description}</p>}
                </div>
                <button
                  onClick={onClose}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-[rgb(var(--border-strong))] surface text-secondary hover:surface-2"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="px-5 pb-5">{children}</div>
              {footer && (
                <div className="flex justify-end gap-2 border-t border-[rgb(var(--border))] p-4 surface">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
