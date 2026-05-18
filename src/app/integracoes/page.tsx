"use client";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/lib/cn";

const integrations = [
  { name: "WhatsApp Business", cat: "Comunicação", color: "from-emerald-400 to-emerald-700" },
  { name: "Gmail / Outlook", cat: "E-mail", color: "from-rose-400 to-rose-700" },
  { name: "Google Calendar", cat: "Agenda", color: "from-cyan-400 to-cyan-700" },
  { name: "Slack", cat: "Notificações", color: "from-violet-400 to-violet-700" },
  { name: "Meta Ads", cat: "Captura de leads", color: "from-royal-500 to-royal-700" },
  { name: "Google Ads", cat: "Captura de leads", color: "from-amber-400 to-rose-700" },
  { name: "Asaas", cat: "Cobrança", color: "from-cyan-400 to-royal-700" },
  { name: "Stripe", cat: "Pagamentos", color: "from-violet-400 to-royal-700" },
  { name: "Bling ERP", cat: "Gestão", color: "from-emerald-400 to-cyan-700" },
  { name: "Omie ERP", cat: "Gestão", color: "from-amber-400 to-emerald-700" },
  { name: "Zapier", cat: "Automação", color: "from-rose-400 to-amber-700" },
  { name: "n8n", cat: "Automação", color: "from-rose-400 to-violet-700" },
];

export default function IntegracoesPage() {
  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        eyebrow="Conexões"
        title="Integrações"
        description="Conecte seu CRM ao stack que sua operação já usa."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {integrations.map((i, idx) => (
          <motion.div
            key={i.name}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            whileHover={{ y: -3 }}
            className="card-premium p-4"
          >
            <div className="flex items-center gap-3">
              <div className={cn("grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br text-white font-bold", i.color)}>
                {i.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-display text-sm font-semibold text-primary">{i.name}</div>
                <div className="text-[11px] text-tertiary">{i.cat}</div>
              </div>
            </div>
            <button className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-[rgb(var(--border-strong))] surface px-3 py-2 text-xs font-semibold text-primary hover:surface-2">
              <Plus className="h-3.5 w-3.5" /> Conectar
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
