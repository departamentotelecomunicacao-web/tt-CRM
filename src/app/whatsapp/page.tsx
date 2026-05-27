"use client";
import { MessagesSquare, PlugZap, Sparkles, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function WhatsAppPage() {
  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        eyebrow="Omnichannel"
        title="Conversas & WhatsApp"
        description="Central unificada de WhatsApp, e-mail e chat — integrada à timeline do cliente."
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <EmptyState
            icon={MessagesSquare}
            title="Conecte seu WhatsApp Business"
            description="Integre via WhatsApp Cloud API para receber, responder e automatizar conversas. Cada mensagem aparece automaticamente na timeline do cliente e do negócio."
            action={
              <Link href="/integracoes" className="btn btn-primary text-xs">
                <PlugZap className="h-4 w-4" /> Ir para integrações
              </Link>
            }
          />
        </div>

        <div className="card-premium relative overflow-hidden p-5">
          <div className="pointer-events-none absolute inset-0 bg-grad-glow opacity-60" />
          <div className="relative">
            <div className="label flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-[rgb(var(--accent))]" /> O que muda quando você conecta</div>
            <ul className="mt-3 space-y-3 text-sm text-secondary">
              <li className="flex gap-2"><Zap className="mt-0.5 h-4 w-4 shrink-0 text-[rgb(var(--accent))]" /> Conversas em tempo real com multiatendimento</li>
              <li className="flex gap-2"><Zap className="mt-0.5 h-4 w-4 shrink-0 text-[rgb(var(--accent))]" /> Templates aprovados e respostas rápidas</li>
              <li className="flex gap-2"><Zap className="mt-0.5 h-4 w-4 shrink-0 text-[rgb(var(--accent))]" /> Mensagens disparadas por automações</li>
              <li className="flex gap-2"><Zap className="mt-0.5 h-4 w-4 shrink-0 text-[rgb(var(--accent))]" /> Etiquetas, roteamento e SLA por equipe</li>
              <li className="flex gap-2"><Shield className="mt-0.5 h-4 w-4 shrink-0 text-[rgb(var(--accent))]" /> Mensagens gravadas como evento auditável</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
