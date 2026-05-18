"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { api } from "@/lib/swr";
import { useAuth } from "@/components/providers/AuthProvider";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await api("/api/auth/login", { method: "POST", json: { username, password } });
      await refresh();
      const from = params.get("from") || "/";
      router.replace(from);
    } catch (e: any) {
      const code = e?.status;
      const body = e?.body?.error;
      if (code === 401) setErr("Usuário ou senha incorretos.");
      else if (code === 500 || code === 502 || code === 503)
        setErr(`Erro do servidor (${code}). Verifique se o banco de dados está conectado.`);
      else if (typeof body === "string") setErr(body);
      else setErr(`Não foi possível entrar${code ? ` (HTTP ${code})` : ""}.`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-mesh opacity-80" />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.06]" />

      <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <div className="hidden flex-col justify-between p-12 lg:flex">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-grad-primary text-white font-bold">
              F
            </div>
            <div className="text-lg font-semibold text-primary">
              Fatura <span className="gradient-text">CRM</span>
            </div>
          </div>

          <div className="max-w-md">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[rgb(var(--accent)/0.30)] bg-[rgb(var(--accent)/0.10)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[rgb(var(--accent))]">
              <Sparkles className="h-3 w-3" /> Pipeline visual enterprise
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight text-primary">
              Gestão comercial <span className="gradient-text">de alta performance</span>.
            </h1>
            <p className="mt-4 text-base text-secondary">
              Kanban operacional, automações, omnichannel e copiloto IA em uma plataforma SaaS feita para times que vendem todos os dias.
            </p>

            <ul className="mt-8 space-y-3 text-sm text-secondary">
              <li className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-[rgb(var(--accent))]" />
                Multi-tenant com isolamento por organização
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-[rgb(var(--accent))]" />
                Auditoria completa e RBAC granular
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-[rgb(var(--accent))]" />
                Realtime via Server-Sent Events
              </li>
            </ul>
          </div>

          <div className="text-[11px] text-tertiary">
            © {new Date().getFullYear()} Fatura CRM · Todos os direitos reservados
          </div>
        </div>

        <div className="flex items-center justify-center p-6 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="card-premium w-full max-w-md p-8"
          >
            <div className="mb-1 text-sm font-semibold text-[rgb(var(--accent))]">Bem-vindo de volta</div>
            <h2 className="font-display text-2xl font-bold text-primary">Entrar na sua conta</h2>
            <p className="mt-1 text-sm text-secondary">
              Use suas credenciais para acessar o workspace da sua organização.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-secondary">Usuário</label>
                <input
                  className="input"
                  placeholder="Departartamento_ADM"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-secondary">Senha</label>
                <div className="relative">
                  <input
                    className="input pr-10"
                    type={show ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-tertiary hover:text-primary"
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {err && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">
                  {err}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-70">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? "Entrando..." : "Entrar no CRM"}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
