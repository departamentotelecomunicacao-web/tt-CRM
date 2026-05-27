import { bootstrapAutomations } from "./automations";

// Bootstrap (idempotente) — chamado por qualquer rota que precise garantir o engine
let done = false;
export function ensureInit() {
  if (done) return;
  done = true;
  bootstrapAutomations();
}
