"use client";
import { motion } from "framer-motion";
import {
  Building2,
  Bell,
  Palette,
  Globe,
  CreditCard,
  KeyRound,
  Webhook,
  Database,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/cn";

const sections = [
  { icon: Building2, title: "Empresa & marca", desc: "Logotipo, identidade, fuso horário, idioma padrão.", tone: "cyan" },
  { icon: Bell, title: "Notificações", desc: "Configure alertas por canal, frequência e gatilho.", tone: "royal" },
  { icon: Palette, title: "Aparência", desc: "Tema escuro/claro, acentos, densidade de layout.", tone: "violet" },
  { icon: Globe, title: "Domínio personalizado", desc: "crm.suaempresa.com com SSL automático.", tone: "emerald" },
  { icon: CreditCard, title: "Faturamento", desc: "Plano Enterprise · próx. cobrança em 12/06.", tone: "amber" },
  { icon: KeyRound, title: "API Keys", desc: "Gere chaves OAuth 2.0 para integrações.", tone: "cyan" },
  { icon: Webhook, title: "Webhooks", desc: "Receba eventos em tempo real no seu sistema.", tone: "royal" },
  { icon: Database, title: "Backup & Export", desc: "Exporte dados em CSV, JSON ou conexão direta.", tone: "violet" },
];

const tones: Record<string, string> = {
  cyan: "bg-cyan-400/10 text-cyan-300",
  royal: "bg-royal-500/10 text-royal-300",
  violet: "bg-violet-500/10 text-violet-300",
  emerald: "bg-emerald-400/10 text-emerald-300",
  amber: "bg-amber-400/10 text-amber-300",
};

export default function ConfiguracoesPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        eyebrow="Workspace"
        title="Configurações"
        description="Personalize o CRM para o seu negócio. Multi-empresa, branding white-label e governança enterprise."
      />

      <section className="card-premium mb-4 flex items-center gap-4 p-5">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-grad-primary text-white text-2xl font-bold">
          FE
        </div>
        <div className="flex-1">
          <h2 className="font-display text-xl font-bold text-white">Fatura Expert</h2>
          <p className="text-sm text-slate-400">Workspace principal · São Paulo, Brasil · 24 usuários ativos</p>
        </div>
        <button className="btn-ghost">Trocar workspace</button>
      </section>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {sections.map((s, i) => (
          <motion.button
            key={s.title}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            whileHover={{ y: -2 }}
            className="card-premium flex items-center gap-4 p-4 text-left"
          >
            <div className={cn("grid h-11 w-11 place-items-center rounded-xl", tones[s.tone])}>
              <s.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-display text-sm font-semibold text-white">{s.title}</div>
              <div className="text-xs text-slate-400">{s.desc}</div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
