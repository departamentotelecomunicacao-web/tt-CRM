import { NextResponse } from "next/server";
import { rawStore, currentBackend } from "@/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Endpoint de diagnóstico — público, sem autenticação.
 * Mostra qual backend de storage está ativo e se ele responde.
 *
 *   GET /api/diag
 *
 * Resposta inclui:
 *   - environment: detalha NETLIFY/NODE_ENV/etc
 *   - backend: "netlify-blobs" | "file"
 *   - blobs: { ok, error? } — tenta ler/gravar/limpar um valor de teste
 */
export async function GET() {
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    NETLIFY: !!process.env.NETLIFY,
    NETLIFY_DEV: !!process.env.NETLIFY_DEV,
    NETLIFY_LOCAL: !!process.env.NETLIFY_LOCAL,
    SITE_ID_present: !!process.env.SITE_ID,
    NETLIFY_SITE_ID_present: !!process.env.NETLIFY_SITE_ID,
    DEPLOY_PRIME_URL: process.env.DEPLOY_PRIME_URL ?? null,
    has_AUTH_SECRET: !!process.env.AUTH_SECRET,
  };
  const usingNetlify = !!(
    env.NETLIFY ||
    env.NETLIFY_DEV ||
    env.NETLIFY_LOCAL ||
    env.SITE_ID_present ||
    env.NETLIFY_SITE_ID_present
  );

  const probe: any = { ok: false, error: null, backend: "unknown" };
  try {
    const s = rawStore("__diag");
    probe.backend = currentBackend();
    const key = "ping";
    const value = `pong-${Date.now()}`;
    await s.set(key, value);
    const got = await s.get(key);
    await s.delete(key);
    probe.ok = got === value;
    probe.roundtrip = { wrote: value, read: got, match: got === value };
  } catch (e: any) {
    probe.error = {
      message: String(e?.message ?? e),
      name: e?.name,
      stack: process.env.NODE_ENV !== "production" ? e?.stack : undefined,
    };
  }

  return NextResponse.json(
    {
      ok: probe.ok,
      environment: env,
      storage: probe,
      hint: probe.ok
        ? "Storage funcionando. Se o login ainda falha, problema é em outro lugar."
        : "Storage não está respondendo. Veja 'storage.error' para o motivo exato.",
    },
    { status: probe.ok ? 200 : 503 }
  );
}
