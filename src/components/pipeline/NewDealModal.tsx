"use client";
import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { api, useApi } from "@/lib/swr";
import { useToast } from "@/components/ui/Toast";

export function NewDealModal({
  open,
  onClose,
  pipelineId,
  stageId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  pipelineId: string;
  stageId?: string;
  onCreated: () => void;
}) {
  const { data: contactsData } = useApi<{ contacts: any[] }>(open ? "/api/contacts" : null);
  const { push } = useToast();
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [probability, setProbability] = useState("30");
  const [priority, setPriority] = useState("media");
  const [contactId, setContactId] = useState<string>("");
  const [nextActionLabel, setNextActionLabel] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setTitle(""); setValue(""); setProbability("30"); setPriority("media"); setContactId(""); setNextActionLabel("");
    }
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api("/api/deals", {
        method: "POST",
        json: {
          title,
          value: Number(value) || 0,
          probability: Math.max(0, Math.min(100, Number(probability) || 0)),
          priority,
          pipelineId,
          stageId,
          contactId: contactId || undefined,
          nextActionLabel: nextActionLabel || undefined,
        },
      });
      push({ tone: "success", title: "Negócio criado", description: title });
      onCreated();
      onClose();
    } catch (e: any) {
      push({ tone: "error", title: "Falha ao criar", description: e?.body?.error?.toString?.() ?? "Tente novamente." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Novo negócio"
      description="Adicione uma oportunidade ao pipeline."
      footer={
        <>
          <button onClick={onClose} className="btn btn-ghost text-xs">Cancelar</button>
          <button onClick={submit as any} disabled={!title || loading} className="btn btn-primary text-xs disabled:opacity-60">
            {loading ? "Criando..." : "Criar negócio"}
          </button>
        </>
      }
    >
      <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Título do negócio *</label>
          <input className="input mt-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Implantação CRM — Lucas / Boulangerie" required />
        </div>
        <div>
          <label className="label">Contato</label>
          <select className="input mt-1" value={contactId} onChange={(e) => setContactId(e.target.value)}>
            <option value="">— sem contato vinculado —</option>
            {contactsData?.contacts?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.company?.name ? `· ${c.company.name}` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Valor (R$)</label>
          <input className="input mt-1" type="number" min={0} step="100" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" />
        </div>
        <div>
          <label className="label">Probabilidade (%)</label>
          <input className="input mt-1" type="number" min={0} max={100} value={probability} onChange={(e) => setProbability(e.target.value)} />
        </div>
        <div>
          <label className="label">Prioridade</label>
          <select className="input mt-1" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label">Próxima ação</label>
          <input className="input mt-1" value={nextActionLabel} onChange={(e) => setNextActionLabel(e.target.value)} placeholder="Ex.: Ligar amanhã 10h" />
        </div>
      </form>
    </Modal>
  );
}
