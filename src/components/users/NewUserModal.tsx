"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/lib/swr";
import { useToast } from "@/components/ui/Toast";

const ROLES = [
  { id: "admin", label: "Administrador", desc: "Acesso quase total exceto gestão de billing" },
  { id: "manager", label: "Gerente comercial", desc: "Visualiza toda equipe e relatórios" },
  { id: "seller", label: "Vendedor", desc: "Gerencia próprios negócios e contatos" },
  { id: "sdr", label: "SDR / Pré-venda", desc: "Qualifica leads e agenda reuniões" },
  { id: "cs", label: "Customer Success", desc: "Pós-venda e renovação" },
];

export function NewUserModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ username: "", name: "", email: "", password: "", role: "seller" });
  const [loading, setLoading] = useState(false);
  const { push } = useToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api("/api/users", { method: "POST", json: form });
      push({ tone: "success", title: "Usuário criado", description: `@${form.username} já pode entrar.` });
      onCreated();
      onClose();
      setForm({ username: "", name: "", email: "", password: "", role: "seller" });
    } catch (e: any) {
      push({ tone: "error", title: "Erro", description: e?.body?.error?.toString?.() ?? "Verifique os campos." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open} onClose={onClose}
      title="Novo usuário"
      description="Crie uma conta para um colaborador da equipe."
      footer={
        <>
          <button onClick={onClose} className="btn btn-ghost text-xs">Cancelar</button>
          <button onClick={submit as any} disabled={!form.username || !form.password || !form.name || loading} className="btn btn-primary text-xs disabled:opacity-60">
            {loading ? "Criando..." : "Criar usuário"}
          </button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="label">Nome completo *</label>
          <input className="input mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Usuário (login) *</label>
            <input className="input mt-1" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="ex.: ana.silva" required />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input className="input mt-1" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="label">Senha inicial *</label>
          <input className="input mt-1" type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="mínimo 6 caracteres" required />
          <div className="mt-1 text-[11px] text-tertiary">O usuário poderá alterar depois.</div>
        </div>
        <div>
          <label className="label">Perfil de acesso *</label>
          <div className="mt-1 space-y-1">
            {ROLES.map((r) => (
              <label key={r.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-2.5 text-sm ${form.role === r.id ? "border-[rgb(var(--accent)/0.50)] bg-[rgb(var(--accent)/0.06)]" : "border-[rgb(var(--border-strong))] surface hover:surface-2"}`}>
                <input type="radio" name="role" checked={form.role === r.id} onChange={() => setForm({ ...form, role: r.id })} className="accent-[rgb(var(--accent))]" />
                <div className="flex-1">
                  <div className="font-semibold text-primary">{r.label}</div>
                  <div className="text-[11px] text-tertiary">{r.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
