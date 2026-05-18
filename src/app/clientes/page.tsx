"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus, Search, Filter, Download, MoreHorizontal, Building2, Mail, Phone, Sparkles, Users,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { NewContactModal } from "@/components/contacts/NewContactModal";
import { brl, cn, relativeTime } from "@/lib/cn";
import { useApi } from "@/lib/swr";

export default function ClientesPage() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const url = `/api/contacts?q=${encodeURIComponent(q)}`;
  const { data, mutate, isLoading } = useApi<{ contacts: any[] }>(url);
  const contacts = data?.contacts ?? [];

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        eyebrow="Base de clientes"
        title="Clientes & Contatos"
        description="Cadastro 360º com perfil enriquecido, histórico de interações e score IA."
        actions={
          <>
            <button className="btn btn-ghost text-xs"><Download className="h-4 w-4" /> Exportar</button>
            <button onClick={() => setOpen(true)} className="btn btn-primary text-xs">
              <Plus className="h-4 w-4" /> Novo cliente
            </button>
          </>
        }
      />

      <section className="card-premium p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[280px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tertiary" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome, e-mail, telefone, CNPJ..."
              className="input !pl-10"
            />
          </div>
          <button className="btn btn-ghost text-xs"><Filter className="h-4 w-4" /> Filtros</button>
          <div className="text-xs text-tertiary">{contacts.length} contato(s)</div>
        </div>
      </section>

      <section className="card-premium mt-4 overflow-hidden">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-12 w-full" />
            ))}
          </div>
        ) : contacts.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum cliente cadastrado ainda"
            description="Comece sua base agora — cadastre o primeiro cliente em segundos."
            action={
              <button onClick={() => setOpen(true)} className="btn btn-primary text-xs">
                <Plus className="h-4 w-4" /> Cadastrar primeiro cliente
              </button>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-12 gap-3 border-b border-[rgb(var(--border))] surface px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-tertiary">
              <div className="col-span-4">Cliente</div>
              <div className="col-span-2">Segmento</div>
              <div className="col-span-2">Responsável</div>
              <div className="col-span-1 text-right">Score</div>
              <div className="col-span-2 text-right">Cadastro</div>
              <div className="col-span-1 text-right">Ações</div>
            </div>
            <div className="divide-y divide-[rgb(var(--border))]">
              {contacts.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.01, 0.3) }}
                  className="grid grid-cols-12 items-center gap-3 px-4 py-3 transition-colors hover:surface"
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <Avatar name={c.name} tone={c.owner?.avatarTone ?? "from-cyan-400 to-royal-600"} size={36} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-primary">{c.name}</div>
                      <div className="flex items-center gap-2 text-[11px] text-tertiary">
                        {c.company?.name && (
                          <>
                            <Building2 className="h-3 w-3" />
                            <span className="truncate">{c.company.name}</span>
                          </>
                        )}
                        {!c.company?.name && c.email && <span className="truncate">{c.email}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 text-xs text-secondary">{c.segment ?? "—"}</div>
                  <div className="col-span-2 flex items-center gap-2">
                    {c.owner ? (
                      <>
                        <Avatar name={c.owner.name} tone={c.owner.avatarTone} size={24} />
                        <span className="truncate text-xs text-secondary">{c.owner.name.split(" ")[0]}</span>
                      </>
                    ) : <span className="text-xs text-tertiary">—</span>}
                  </div>
                  <div className="col-span-1 text-right">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold",
                        c.score >= 85 ? "bg-emerald-400/15 text-emerald-300"
                          : c.score >= 70 ? "bg-cyan-400/15 text-cyan-300"
                            : "surface text-secondary"
                      )}
                    >
                      <Sparkles className="h-3 w-3" /> {c.score}
                    </span>
                  </div>
                  <div className="col-span-2 text-right text-xs text-tertiary">{relativeTime(c.createdAt)}</div>
                  <div className="col-span-1 flex items-center justify-end gap-1">
                    {c.whatsapp && (
                      <a href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                        className="grid h-7 w-7 place-items-center rounded-md border border-[rgb(var(--border-strong))] surface text-secondary hover:bg-emerald-400/10 hover:text-emerald-300">
                        <Phone className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {c.email && (
                      <a href={`mailto:${c.email}`} className="grid h-7 w-7 place-items-center rounded-md border border-[rgb(var(--border-strong))] surface text-secondary hover:bg-cyan-400/10 hover:text-cyan-300">
                        <Mail className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <button className="grid h-7 w-7 place-items-center rounded-md text-tertiary hover:surface hover:text-primary">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </section>

      <NewContactModal open={open} onClose={() => setOpen(false)} onCreated={() => mutate()} />
    </div>
  );
}
