import { NextResponse } from "next/server";
import {
  rawStore,
  currentBackend,
  lastBlobsErrorMessage,
  blobsCredentialsConfigured,
  redisConfigured,
} from "@/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Diagnóstico público (sem autenticação): GET /api/diag
 * Mostra qual backend de storage está ativo e se ele responde.
 */
export async function GET() {
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    platform: process.env.VERCEL ? "vercel" : process.env.NETLIFY ? "netlify" : "other",
    redis_configured: redisConfigured(),
    netlify_blobs_manual_creds: blobsCredentialsConfigured(),
    has_NETLIFY_BLOBS_CONTEXT: !!process.env.NETLIFY_BLOBS_CONTEXT,
    has_AUTH_SECRET: !!process.env.AUTH_SECRET,
  };

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
    probe.roundtrip = { match: got === value };
  } catch (e: any) {
    probe.error = { message: String(e?.message ?? e), name: e?.name };
  }
  probe.blobsInitError = lastBlobsErrorMessage();

  let hint: string;
  if (probe.ok && probe.backend === "redis") {
    hint = "✅ Redis (Upstash/Vercel KV) ativo. Login deve funcionar.";
  } else if (probe.ok && probe.backend === "netlify") {
    hint = "✅ Netlify Blobs ativo. Login deve funcionar.";
  } else if (probe.backend === "file" || !probe.ok) {
    hint =
      "⚠️ Nenhum storage persistente disponível. " +
      "No Vercel: adicione a integração Upstash (KV) no painel Storage — ela injeta " +
      "KV_REST_API_URL e KV_REST_API_TOKEN automaticamente. Depois faça redeploy. " +
      "Alternativa: crie uma conta gratuita em upstash.com e configure " +
      "UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN nas Environment Variables.";
  } else {
    hint = "Estado indefinido. Veja storage.error.";
  }

  return NextResponse.json(
    { ok: probe.ok, environment: env, storage: probe, hint },
    { status: probe.ok ? 200 : 503 }
  );
}
