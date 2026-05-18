"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/lib/swr";
import { useToast } from "@/components/ui/Toast";

const SEGMENTS = [
  "Alimentação","Saúde","Transporte","Bem-estar","Jurídico","Beleza","Tecnologia",
  "Imobiliário","Construção","Contábil","Distribuição","Eventos","Educação","Varejo","Outro",
];
const ORIGINS = ["Inbound","Outbound","Indicação","Evento","Paid Ads","Instagram","LinkedIn","Site","Outro"];

export function NewContactModal({
  open, onClose, onCreated,
}: {
  open: boolean; onClose: () => void; onCreated: () => void;
}) {
  const [form, setForm] = useState({
    kind: "PF",
    name: "",
    doc: "",
    email: "",
    phone: "",
    whatsapp: "",
    city: "",
    state: "",
    segment: "",
    origin: "",
    companyName: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const { push } = useToast();

  function setField<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api("/api/contacts", { method: "POST", json: form });
      push({ tone: "success", title: "Cliente cadastrado", description: form.name });
      onCreated();
      onClose();
      setForm({
        kind: "PF", name: "", doc: "", email: "", phone: "", whatsapp: "",
        city: "", state: "", segment: "", origin: "", companyName: "", notes: "",
      });
    } catch (e: any) {
      push({ tone: "error", title: "Erro ao salvar", description: e?.body?.error?.toString?.() ?? "Verifique os campos." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Novo cliente"
      description="Cadastre PF ou PJ com dados, segmento e origem."
      size="lg"
      footer={
        <>
          <button onClick={onClose} className="btn btn-ghost text-xs">Cancelar</button>
          <button onClick={submit as any} disabled={!form.name || loading} className="btn btn-primary text-xs disabled:opacity-60">
            {loading ? "Salvando..." : "Salvar cliente"}
          </button>
        </>
      }
    >
      <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Tipo</label>
          <div className="mt-1 grid grid-cols-2 gap-1 rounded-xl border border-[rgb(var(--border-strong))] surface p-1">
            {["PF","PJ"].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setField("kind", k)}
                className={`rounded-lg py-1.5 text-xs font-semibold ${form.kind === k ? "bg-grad-primary text-white" : "text-secondary hover:surface-2"}`}
              >
                {k === "PF" ? "Pessoa física" : "Pessoa jurídica"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">{form.kind === "PF" ? "CPF" : "CNPJ"}</label>
          <input className="input mt-1" value={form.doc} onChange={(e) => setField("doc", e.target.value)} placeholder="000.000.000-00" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Nome *</label>
          <input className="input mt-1" required value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Nome completo / razão social" />
        </div>
        {form.kind === "PJ" && (
          <div className="sm:col-span-2">
            <label className="label">Empresa (razão / fantasia)</label>
            <input className="input mt-1" value={form.companyName} onChange={(e) => setField("companyName", e.target.value)} placeholder="Empresa Tal Ltda" />
          </div>
        )}
        <div>
          <label className="label">E-mail</label>
          <input className="input mt-1" type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="contato@empresa.com" />
        </div>
        <div>
          <label className="label">Telefone</label>
          <input className="input mt-1" value={form.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="(11) 99999-9999" />
        </div>
        <div>
          <label className="label">WhatsApp</label>
          <input className="input mt-1" value={form.whatsapp} onChange={(e) => setField("whatsapp", e.target.value)} placeholder="+55 11 99999-9999" />
        </div>
        <div>
          <label className="label">Cidade / UF</label>
          <div className="mt-1 flex gap-2">
            <input className="input" value={form.city} onChange={(e) => setField("city", e.target.value)} placeholder="São Paulo" />
            <input className="input !w-20" maxLength={2} value={form.state} onChange={(e) => setField("state", e.target.value.toUpperCase())} placeholder="SP" />
          </div>
        </div>
        <div>
          <label className="label">Segmento</label>
          <select className="input mt-1" value={form.segment} onChange={(e) => setField("segment", e.target.value)}>
            <option value="">—</option>
            {SEGMENTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Origem do lead</label>
          <select className="input mt-1" value={form.origin} onChange={(e) => setField("origin", e.target.value)}>
            <option value="">—</option>
            {ORIGINS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label">Observações</label>
          <textarea className="input mt-1" rows={2} value={form.notes} onChange={(e) => setField("notes", e.target.value)} placeholder="Contexto, decisor, BANT..." />
        </div>
      </form>
    </Modal>
  );
}
