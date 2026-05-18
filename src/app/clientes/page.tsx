"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Building2,
  Mail,
  Phone,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DEALS } from "@/lib/data";
import { Avatar } from "@/components/Avatar";
import { brl, cn } from "@/lib/cn";

const segments = ["Todos", "Alimentação", "Saúde", "Transporte", "Bem-estar", "Jurídico", "Beleza", "Tecnologia", "Imobiliário", "Construção", "Contábil", "Distribuição", "Eventos"];

export default function ClientesPage() {
  const [q, setQ] = useState("");
  const [seg, setSeg] = useState("Todos");

  const filtered = DEALS.filter(
    (d) =>
      (seg === "Todos" || d.segment === seg) &&
      (q === "" || `${d.name} ${d.company}`.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        eyebrow="Base de clientes"
        title="Clientes & Contatos"
        description="Cadastro 360º com perfil enriquecido, histórico financeiro e score automatizado por IA."
        actions={
          <>
            <button className="btn-ghost">
              <Download className="h-4 w-4" /> Exportar CSV
            </button>
            <button className="btn-primary">
              <Plus className="h-4 w-4" /> Novo cliente
            </button>
          </>
        }
      />

      <section className="card-premium p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[280px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome, empresa, e-mail, CNPJ..."
              className="input !pl-10"
            />
          </div>
          <button className="btn-ghost">
            <Filter className="h-4 w-4" /> Filtros avançados
          </button>
          <div className="flex flex-wrap gap-1.5">
            {segments.slice(0, 6).map((s) => (
              <button
                key={s}
                onClick={() => setSeg(s)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[11px] font-medium transition-colors",
                  seg === s
                    ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-4">
        {[
          { label: "Clientes ativos", value: "1.284", tone: "cyan" },
          { label: "Novos (30d)", value: "184", tone: "royal" },
          { label: "Lifetime value médio", value: brl(28400), tone: "emerald" },
          { label: "NPS médio", value: "72", tone: "amber" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="card-premium p-4"
          >
            <div className="text-[11px] uppercase tracking-wider text-slate-400">{s.label}</div>
            <div className="mt-1 font-display text-2xl font-bold text-white">{s.value}</div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
              <div className="h-full w-3/4 bg-grad-primary" />
            </div>
          </motion.div>
        ))}
      </section>

      <section className="card-premium mt-4 overflow-hidden">
        <div className="grid grid-cols-12 gap-3 border-b border-white/5 bg-white/[0.02] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          <div className="col-span-4">Cliente</div>
          <div className="col-span-2">Segmento</div>
          <div className="col-span-2">Responsável</div>
          <div className="col-span-1 text-right">Score</div>
          <div className="col-span-2 text-right">Valor potencial</div>
          <div className="col-span-1 text-right">Ações</div>
        </div>
        <div className="divide-y divide-white/5">
          {filtered.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="grid grid-cols-12 items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03]"
            >
              <div className="col-span-4 flex items-center gap-3">
                <Avatar name={d.name} tone={d.owner.avatarTone} size={36} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{d.name}</div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Building2 className="h-3 w-3" />
                    {d.company}
                  </div>
                </div>
              </div>
              <div className="col-span-2 text-xs text-slate-300">{d.segment}</div>
              <div className="col-span-2 flex items-center gap-2">
                <Avatar name={d.owner.name} tone={d.owner.avatarTone} size={24} />
                <span className="truncate text-xs text-slate-300">{d.owner.name.split(" ")[0]}</span>
              </div>
              <div className="col-span-1 text-right">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold",
                    d.score >= 85
                      ? "bg-emerald-400/10 text-emerald-300"
                      : d.score >= 70
                        ? "bg-cyan-400/10 text-cyan-300"
                        : "bg-white/5 text-slate-300"
                  )}
                >
                  <Sparkles className="h-3 w-3" /> {d.score}
                </span>
              </div>
              <div className="col-span-2 text-right">
                <div className="text-sm font-bold text-white">{brl(d.value)}</div>
                <div className="text-[10px] text-slate-400">{d.probability}% prob.</div>
              </div>
              <div className="col-span-1 flex items-center justify-end gap-1">
                <button className="grid h-7 w-7 place-items-center rounded-md border border-white/10 bg-white/5 text-slate-300 hover:bg-emerald-400/10 hover:text-emerald-300">
                  <Phone className="h-3.5 w-3.5" />
                </button>
                <button className="grid h-7 w-7 place-items-center rounded-md border border-white/10 bg-white/5 text-slate-300 hover:bg-cyan-400/10 hover:text-cyan-300">
                  <Mail className="h-3.5 w-3.5" />
                </button>
                <button className="grid h-7 w-7 place-items-center rounded-md text-slate-400 hover:bg-white/5 hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
