"use client";
import { motion } from "framer-motion";
import { Shield, Users, Plus, Check, X } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";

const roles = [
  { name: "Owner", users: 1, perms: 28, tone: "from-cyan-400 to-royal-600" },
  { name: "Admin", users: 3, perms: 24, tone: "from-violet-400 to-royal-600" },
  { name: "Gerente comercial", users: 4, perms: 18, tone: "from-amber-400 to-rose-600" },
  { name: "Vendedor", users: 12, perms: 12, tone: "from-emerald-400 to-cyan-600" },
  { name: "SDR", users: 6, perms: 9, tone: "from-rose-400 to-violet-600" },
  { name: "Customer Success", users: 4, perms: 11, tone: "from-cyan-400 to-emerald-600" },
];

const matrix = [
  { feature: "Ver todos os negócios", roles: [true, true, true, false, false, false] },
  { feature: "Editar pipeline", roles: [true, true, true, true, false, false] },
  { feature: "Exportar dados", roles: [true, true, true, false, false, false] },
  { feature: "Acessar relatórios", roles: [true, true, true, true, false, true] },
  { feature: "Gerenciar automações", roles: [true, true, false, false, false, false] },
  { feature: "Configurar integrações", roles: [true, true, false, false, false, false] },
  { feature: "Logs de auditoria", roles: [true, true, false, false, false, false] },
];

export default function PermissoesPage() {
  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        eyebrow="Governança"
        title="Permissões & Times"
        description="Controle granular de acesso, perfis personalizados e logs completos de auditoria."
        actions={
          <button className="btn-primary">
            <Plus className="h-4 w-4" /> Novo perfil
          </button>
        }
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roles.map((r, i) => (
          <motion.div
            key={r.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -3 }}
            className="card-premium p-5"
          >
            <div className="flex items-center justify-between">
              <Avatar name={r.name} tone={r.tone} size={44} />
              <span className="chip">
                <Shield className="h-3 w-3" /> {r.perms} permissões
              </span>
            </div>
            <h3 className="mt-3 font-display text-lg font-semibold text-white">{r.name}</h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
              <Users className="h-3.5 w-3.5" /> {r.users} usuário{r.users > 1 ? "s" : ""}
            </div>
            <button className="btn-ghost mt-4 w-full text-xs">Editar perfil</button>
          </motion.div>
        ))}
      </section>

      <section className="card-premium mt-6 overflow-x-auto">
        <div className="border-b border-white/5 p-4">
          <h3 className="font-display text-base font-semibold text-white">Matriz de permissões</h3>
          <p className="text-xs text-slate-400">Configure granularmente o que cada perfil pode fazer.</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-[10px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="p-3 text-left">Recurso</th>
              {roles.map((r) => (
                <th key={r.name} className="p-3 text-center">{r.name}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {matrix.map((m) => (
              <tr key={m.feature} className="hover:bg-white/[0.02]">
                <td className="p-3 text-white">{m.feature}</td>
                {m.roles.map((v, i) => (
                  <td key={i} className="p-3 text-center">
                    {v ? (
                      <span className="inline-grid h-6 w-6 place-items-center rounded-md bg-emerald-400/15 text-emerald-300">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    ) : (
                      <span className="inline-grid h-6 w-6 place-items-center rounded-md bg-white/5 text-slate-500">
                        <X className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
