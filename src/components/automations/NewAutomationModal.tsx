"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/lib/swr";
import { useToast } from "@/components/ui/Toast";

const TRIGGERS = [
  { id: "deal.created", label: "Quando um negócio é criado" },
  { id: "deal.moved", label: "Quando um negócio muda de estágio" },
  { id: "task.completed", label: "Quando uma tarefa é concluída" },
  { id: "contact.created", label: "Quando um contato é cadastrado" },
];

const STEPS = [
  { id: "createTask", label: "Criar tarefa de follow-up" },
  { id: "createActivity", label: "Adicionar nota na timeline" },
  { id: "notify", label: "Enviar notificação ao responsável" },
];

export function NewAutomationModal({
  open, onClose, onCreated,
}: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState("deal.moved");
  const [stepType, setStepType] = useState("createTask");
  const [taskTitle, setTaskTitle] = useState("Fazer follow-up");
  const [dueInHours, setDueInHours] = useState("24");
  const [loading, setLoading] = useState(false);
  const { push } = useToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const step: any = { type: stepType, params: {} };
      if (stepType === "createTask") {
        step.params = { title: taskTitle, dueInHours: Number(dueInHours) || 24 };
      } else if (stepType === "createActivity") {
        step.params = { activityType: "note", title: taskTitle, body: "Disparada por automação." };
      } else if (stepType === "notify") {
        step.params = { title: taskTitle, body: "Verificar negócio.", tone: "info" };
      }
      await api("/api/automations", {
        method: "POST",
        json: {
          name,
          trigger: { type: triggerType },
          steps: [step],
          active: true,
        },
      });
      push({ tone: "success", title: "Automação criada" });
      onCreated();
      onClose();
      setName(""); setTaskTitle("Fazer follow-up"); setDueInHours("24");
    } catch {
      push({ tone: "error", title: "Erro ao criar automação" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open} onClose={onClose}
      title="Nova automação"
      description="Configure gatilhos e ações para automatizar sua operação comercial."
      size="lg"
      footer={
        <>
          <button onClick={onClose} className="btn btn-ghost text-xs">Cancelar</button>
          <button onClick={submit as any} disabled={!name || loading} className="btn btn-primary text-xs disabled:opacity-60">
            {loading ? "Salvando..." : "Criar automação"}
          </button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Nome da automação *</label>
          <input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Follow-up automático após proposta" required />
        </div>
        <div>
          <label className="label">Gatilho</label>
          <select className="input mt-1" value={triggerType} onChange={(e) => setTriggerType(e.target.value)}>
            {TRIGGERS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Ação</label>
          <select className="input mt-1" value={stepType} onChange={(e) => setStepType(e.target.value)}>
            {STEPS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Título / mensagem</label>
            <input className="input mt-1" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
          </div>
          {stepType === "createTask" && (
            <div>
              <label className="label">Vencer em (horas)</label>
              <input className="input mt-1" type="number" min={1} value={dueInHours} onChange={(e) => setDueInHours(e.target.value)} />
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
