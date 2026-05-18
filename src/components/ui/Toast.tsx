"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

type Tone = "success" | "error" | "info";
interface Toast { id: string; tone: Tone; title: string; description?: string }

const Ctx = createContext<{ push: (t: Omit<Toast, "id">) => void }>({ push: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((cur) => [...cur, { ...t, id }]);
    setTimeout(() => setToasts((cur) => cur.filter((x) => x.id !== id)), 4500);
  }, []);
  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon =
              t.tone === "success" ? CheckCircle2 : t.tone === "error" ? AlertTriangle : Info;
            const tone =
              t.tone === "success"
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                : t.tone === "error"
                  ? "border-rose-400/30 bg-rose-400/10 text-rose-200"
                  : "border-cyan-400/30 bg-cyan-400/10 text-cyan-200";
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 32, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 32, scale: 0.97 }}
                className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-3 backdrop-blur ${tone}`}
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-primary">{t.title}</div>
                  {t.description && <div className="text-xs text-secondary">{t.description}</div>}
                </div>
                <button
                  onClick={() => setToasts((cur) => cur.filter((x) => x.id !== t.id))}
                  className="rounded-md p-1 text-secondary hover:bg-white/5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
