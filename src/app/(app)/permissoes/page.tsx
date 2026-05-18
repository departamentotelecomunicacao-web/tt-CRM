"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Users, Plus, Check, X, Trash2, Lock } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { NewUserModal } from "@/components/users/NewUserModal";
import { useApi, api } from "@/lib/swr";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { relativeTime } from "@/lib/cn";

const ROLE_LABEL: Record<string, string> = {
  owner: "Proprietário",
  admin: "Administrador",
  manager: "Gerente comercial",
  seller: "Vendedor",
  sdr: "SDR",
  cs: "Customer Success",
};

const matrix = [
  { feature: "Ver todos os negócios", roles: { owner: true, admin: true, manager: true, seller: false, sdr: false, cs: false } },
  { feature: "Editar pipeline e estágios", roles: { owner: true, admin: true, manager: false, seller: false, sdr: false, cs: false } },
  { feature: "Exportar dados", roles: { owner: true, admin: true, manager: true, seller: false, sdr: false, cs: false } },
  { feature: "Acessar relatórios", roles: { owner: true, admin: true, manager: true, seller: true, sdr: false, cs: true } },
  { feature: "Gerenciar automações", roles: { owner: true, admin: true, manager: false, seller: false, sdr: false, cs: false } },
  { feature: "Configurar integrações", roles: { owner: true, admin: true, manager: false, seller: false, sdr: false, cs: false } },
  { feature: "Criar/editar usuários", roles: { owner: true, admin: true, manager: false, seller: false, sdr: false, cs: false } },
  { feature: "Auditoria & logs", roles: { owner: true, admin: true, manager: false, seller: false, sdr: false, cs: false } },
];

const ALL_ROLES = ["owner", "admin", "manager", "seller", "sdr", "cs"] as const;

export default function PermissoesPage() {
  const { data, mutate, isLoading } = useApi<{ users: any[] }>("/api/users");
  const users = data?.users ?? [];
  const { user: me } = useAuth();
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const isAdmin = me?.role === "owner" || me?.role === "admin";

  async function toggle(id: string, active: boolean) {
    await api(`/api/users/${id}`, { method: "PATCH", json: { active } });
    mutate();
  }
  async function remove(id: string) {
    if (!confirm("Desativar este usuário? Ele perderá acesso ao sistema.")) return;
    await api(`/api/users/${id}`, { method: "DELETE" });
    push({ tone: "success", title: "Usuário desativado" });
    mutate();
  }

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        eyebrow="Governança"
        title="Usuários & Permissões"
        description="Gerencie acessos, perfis de função e audite a operação."
        actions={
          isAdmin ? (
            <button onClick={() => setOpen(true)} className="btn btn-primary text-xs">
              <Plus className="h-4 w-4" /> Novo usuário
            </button>
          ) : (
            <span className="chip"><Lock className="h-3 w-3" /> Apenas administradores</span>
          )
        }
      />

      <section className="card-premium overflow-hidden">
        <div className="border-b border-[rgb(var(--border))] p-4">
          <h3 className="font-display text-base font-semibold text-primary">Usuários da organização</h3>
          <p className="text-xs text-tertiary">{users.length} usuário(s) · {users.filter((u) => u.active).length} ativo(s)</p>
        </div>
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-12 w-full" />)}
          </div>
        ) : (
          <div className="divide-y divide-[rgb(var(--border))]">
            {users.map((u) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-12 items-center gap-3 px-4 py-3 hover:surface"
              >
                <div className="col-span-4 flex items-center gap-3">
                  <Avatar name={u.name} tone={u.avatarTone} size={36} />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-primary">{u.name}</div>
                    <div className="truncate text-[11px] text-tertiary">@{u.username} {u.email ? ` · ${u.email}` : ""}</div>
                  </div>
                </div>
                <div className="col-span-2 text-xs">
                  <span className="chip capitalize">{ROLE_LABEL[u.role] ?? u.role}</span>
                </div>
                <div className="col-span-2 text-xs text-tertiary">
                  {u.lastLoginAt ? `Último login ${relativeTime(u.lastLoginAt)}` : "Nunca logou"}
                </div>
                <div className="col-span-2">
                  <span className={u.active ? "chip text-emerald-300" : "chip text-rose-300"}>
                    <span className={`dot ${u.active ? "bg-emerald-400" : "bg-rose-400"}`} /> {u.active ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-1">
                  {isAdmin && u.id !== me?.id && (
                    <>
                      <button onClick={() => toggle(u.id, !u.active)} className="btn btn-ghost !py-1.5 text-[11px]">
                        {u.active ? "Suspender" : "Reativar"}
                      </button>
                      <button onClick={() => remove(u.id)} className="grid h-7 w-7 place-items-center rounded-md text-tertiary hover:bg-rose-500/10 hover:text-rose-300">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  {u.id === me?.id && <span className="chip">Você</span>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section className="card-premium mt-6 overflow-x-auto">
        <div className="border-b border-[rgb(var(--border))] p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[rgb(var(--accent))]" />
            <h3 className="font-display text-base font-semibold text-primary">Matriz de permissões</h3>
          </div>
          <p className="mt-0.5 text-xs text-tertiary">Capacidades padrão por perfil — base para o RBAC do workspace.</p>
        </div>
        <table className="w-full text-sm">
          <thead className="surface text-[10px] uppercase tracking-wider text-tertiary">
            <tr>
              <th className="p-3 text-left">Recurso</th>
              {ALL_ROLES.map((r) => (
                <th key={r} className="p-3 text-center font-semibold text-secondary">{ROLE_LABEL[r]}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgb(var(--border))]">
            {matrix.map((m) => (
              <tr key={m.feature} className="hover:surface">
                <td className="p-3 text-primary">{m.feature}</td>
                {ALL_ROLES.map((r) => (
                  <td key={r} className="p-3 text-center">
                    {(m.roles as any)[r] ? (
                      <span className="inline-grid h-6 w-6 place-items-center rounded-md bg-emerald-400/15 text-emerald-300">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    ) : (
                      <span className="inline-grid h-6 w-6 place-items-center rounded-md surface text-tertiary">
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

      <NewUserModal open={open} onClose={() => setOpen(false)} onCreated={() => mutate()} />
    </div>
  );
}
