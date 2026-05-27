// Simple in-memory event bus para SSE / automações.
// Suficiente para single-instance; em produção usar Redis pub/sub.

type Listener = (evt: AppEvent) => void;

export interface AppEvent {
  type: string; // deal.moved, deal.created, contact.created, task.completed, message.received, audit
  org: string;
  payload: any;
  at: number;
}

const listeners = new Set<Listener>();

export function subscribe(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function emit(evt: Omit<AppEvent, "at">) {
  const full: AppEvent = { ...evt, at: Date.now() };
  for (const l of listeners) {
    try { l(full); } catch {}
  }
}
