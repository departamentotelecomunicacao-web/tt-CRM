"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Building2, Bell, Palette, Globe, CreditCard, KeyRound, Webhook, Database, ChevronRight, ShieldCheck, PlugZap, Workflow,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/cn";

const sections = [
  { icon: ShieldCheck, title: "Usuários & permissões", desc: "Crie acessos, defina perfis e gerencie equipes.", href: "/permissoes", tone: "cyan" },
  { icon: Workflow, title: "Automações", desc: "Workflows comerciais que rodam 24/7.", href: "/automacoes", tone: "royal" },
  { icon: PlugZap, title: "Integrações", desc: "WhatsApp, e-mail, calendar, ERPs e mais.", href: "/integracoes", tone: "violet" },
  { icon: Bell, title: "Notificações", desc: "Alertas por canal, frequência e gatilho.", href: "#", tone: "amber" },
  { icon: Globe, title: "Domínio personalizado", desc: "crm.suaempresa.com com SSL automático.", href: "#", tone: "emerald" },
  { icon: CreditCard, title: "Faturamento", desc: "Plano e ciclo de cobrança.", href: "#", tone: "rose" },
  { icon: KeyRound, title: "API Keys & Webhooks", desc: "Integre programaticamente.", href: "#", tone: "cyan" },
  { icon: Database, title: "Backup & Exportação", desc: "Exporte tudo em CSV / JSON.", href: "#", tone: "violet" },
];

const tones: Record<string, string> = {
  cyan: "bg-cyan-400/15 text-cyan-300",
  royal: "bg-royal-500/15 text-royal-300",
  violet: "bg-violet-500/15 text-violet-300",
  emerald: "bg-emerald-400/15 text-emerald-300",
  amber: "bg-amber-400/15 text-amber-300",
  rose: "bg-rose-400/15 text-rose-300",
};

export default function ConfiguracoesPage() {
  const { user } = useAuth();
  const { theme, set } = useTheme();

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        eyebrow="Workspace"
        title="Configurações"
        description="Personalize o CRM para o seu negócio. Multi-empresa, branding white-label e governança enterprise."
      />

      <section className="card-premium mb-4 flex items-center gap-4 p-5">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-grad-primary text-white text-2xl font-bold">
          {user?.organization?.name?.[0] ?? "F"}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="truncate font-display text-xl font-bold text-primary">{user?.organization?.name ?? "—"}</h2>
          <p className="text-sm text-tertiary">Plano {user?.organization?.plan ?? "—"} · multi-tenant ativo</p>
        </div>
        <div className="hidden gap-1 rounded-xl border border-[rgb(var(--border-strong))] surface p-1 sm:flex">
          {["dark", "light"].map((t) => (
            <button
              key={t}
              onClick={() => set(t as any)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold capitalize",
                theme === t ? "bg-grad-primary text-white" : "text-secondary hover:text-primary"
              )}
            >
              {t === "dark" ? "Escuro" : "Claro"}
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {sections.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            whileHover={{ y: -2 }}
            className="card-premium"
          >
            <Link href={s.href} className="flex items-center gap-4 p-4">
              <div className={cn("grid h-11 w-11 place-items-center rounded-xl", tones[s.tone])}>
                <s.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate font-display text-sm font-semibold text-primary">{s.title}</div>
                <div className="truncate text-xs text-tertiary">{s.desc}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-tertiary" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
