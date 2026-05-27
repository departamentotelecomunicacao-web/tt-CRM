import { NextResponse } from "next/server";
import {
  rawStore,
  currentBackend,
  lastBlobsErrorMessage,
  blobsCredentialsConfigured,
} from "@/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Diagnóstico público (sem autenticação): GET /api/diag
 * Mostra backend ativo, erro de Blobs (se houver) e roundtrip read/write.
 */
export async function GET() {
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    NETLIFY: !!process.env.NETLIFY,
    has_NETLIFY_BLOBS_CONTEXT: !!process.env.NETLIFY_BLOBS_CONTEXT,
    has_AUTH_SECRET: !!process.env.AUTH_SECRET,
    blobs_manual_creds: blobsCredentialsConfigured(),
    DEPLOY_ID: process.env.DEPLOY_ID ?? null,
    DEPLOY_PRIME_URL: process.env.DEPLOY_PRIME_URL ?? null,
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
  if (probe.ok && probe.backend === "netlify") {
    hint = "✅ Netlify Blobs ativo e funcionando. Login deve funcionar normalmente.";
  } else if (probe.backend === "file") {
    hint =
      "⚠️ Caiu no FileStore (não persiste de forma confiável em serverless). " +
      "Netlify Blobs não está disponível neste deploy. " +
      (env.blobs_manual_creds
        ? "Credenciais manuais detectadas mas falharam — veja blobsInitError."
        : "Solução A: faça deploy via Git (Netlify injeta o contexto). " +
          "Solução B: configure as env vars NETLIFY_SITE_ID e NETLIFY_BLOBS_TOKEN.");
  } else {
    hint = "Estado indefinido. Veja storage.error e storage.blobsInitError.";
  }

  return NextResponse.json(
    { ok: probe.ok, environment: env, storage: probe, hint },
    { status: probe.ok ? 200 : 503 }
  );
}
