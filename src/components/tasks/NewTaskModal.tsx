"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/lib/swr";
import { useToast } from "@/components/ui/Toast";

export function NewTaskModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ title: "", description: "", priority: "media", dueAt: "" });
  const [loading, setLoading] = useState(false);
  const { push } = useToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api("/api/tasks", {
        method: "POST",
        json: {
          title: form.title,
          description: form.description || undefined,
          priority: form.priority,
          dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : undefined,
        },
      });
      push({ tone: "success", title: "Tarefa criada" });
      onCreated();
      onClose();
      setForm({ title: "", description: "", priority: "media", dueAt: "" });
    } catch {
      push({ tone: "error", title: "Erro ao criar tarefa" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nova tarefa"
      description="Atribua, defina prioridade e prazo."
      footer={
        <>
          <button onClick={onClose} className="btn btn-ghost text-xs">Cancelar</button>
          <button onClick={submit as any} disabled={!form.title || loading} className="btn btn-primary text-xs disabled:opacity-60">
            {loading ? "Salvando..." : "Criar tarefa"}
          </button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="label">Título *</label>
          <input className="input mt-1" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex.: Ligar para Lucas amanhã" required />
        </div>
        <div>
          <label className="label">Descrição</label>
          <textarea className="input mt-1" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detalhes adicionais (opcional)" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Prioridade</label>
            <select className="input mt-1" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </select>
          </div>
          <div>
            <label className="label">Prazo</label>
            <input className="input mt-1" type="datetime-local" value={form.dueAt} onChange={(e) => setForm({ ...form, dueAt: e.target.value })} />
          </div>
        </div>
      </form>
    </Modal>
  );
}
