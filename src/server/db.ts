import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function resolveDatabaseUrl(): string | undefined {
  // 1. Variáveis explícitas (set manualmente)
  if (process.env.DATABASE_URL && !/^postgres(?:ql)?:\/\/<?\w+>?/.test("")) {
    if (process.env.DATABASE_URL.startsWith("postgres")) return process.env.DATABASE_URL;
  }
  // 2. Variáveis automáticas do Netlify Database (Neon)
  const fromEnv =
    process.env.NETLIFY_DATABASE_URL ||
    process.env.NETLIFY_DATABASE_URL_UNPOOLED ||
    process.env.NEON_DATABASE_URL;
  if (fromEnv) return fromEnv;

  // 3. Tenta usar o helper do @netlify/database (lazy require — em build local pode não estar instalado)
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require("@netlify/database");
    const url = mod?.getConnectionString?.();
    if (url) return url;
  } catch {}

  return undefined;
}

function buildClient() {
  const url = resolveDatabaseUrl();
  if (!url && process.env.NODE_ENV === "production") {
    console.warn(
      "[db] DATABASE_URL não disponível. Bootstrap falhará até que o Netlify Database esteja conectado."
    );
  }
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    ...(url ? { datasources: { db: { url } } } : {}),
  });
}

export const prisma = global.prisma ?? buildClient();
if (process.env.NODE_ENV !== "production") global.prisma = prisma;
