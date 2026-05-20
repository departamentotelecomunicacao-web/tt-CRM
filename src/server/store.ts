// Storage abstrato — Netlify Blobs em produção, JSON em arquivo local em dev.
// Operação: chaves dentro de "stores" (= coleções/tabelas).

import fs from "node:fs/promises";
import path from "node:path";

interface RawStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  list(): Promise<string[]>;
}

// ---------- Backend: Netlify Blobs (produção) ----------
class NetlifyStore implements RawStore {
  private store: any;
  constructor(name: string) {
    const { getStore } = require("@netlify/blobs");
    this.store = getStore({ name, consistency: "strong" });
  }
  async get(key: string) {
    const v = await this.store.get(key);
    return v ?? null;
  }
  async set(key: string, value: string) {
    await this.store.set(key, value);
  }
  async delete(key: string) {
    await this.store.delete(key);
  }
  async list() {
    const { blobs } = await this.store.list();
    return (blobs ?? []).map((b: any) => b.key);
  }
}

// ---------- Backend: arquivo JSON (desenvolvimento local) ----------
const DEV_DIR = path.join(process.cwd(), ".fcrm-data");

class FileStore implements RawStore {
  constructor(private name: string) {}
  private file() {
    return path.join(DEV_DIR, `${this.name}.json`);
  }
  private async readAll(): Promise<Record<string, string>> {
    try {
      await fs.mkdir(DEV_DIR, { recursive: true });
      const data = await fs.readFile(this.file(), "utf8");
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  private async writeAll(obj: Record<string, string>) {
    await fs.mkdir(DEV_DIR, { recursive: true });
    await fs.writeFile(this.file(), JSON.stringify(obj, null, 2));
  }
  async get(key: string) {
    const all = await this.readAll();
    return all[key] ?? null;
  }
  async set(key: string, value: string) {
    const all = await this.readAll();
    all[key] = value;
    await this.writeAll(all);
  }
  async delete(key: string) {
    const all = await this.readAll();
    delete all[key];
    await this.writeAll(all);
  }
  async list() {
    const all = await this.readAll();
    return Object.keys(all);
  }
}

// Detecta backend a usar
function isNetlifyRuntime() {
  return !!(
    process.env.NETLIFY ||
    process.env.NETLIFY_LOCAL ||
    process.env.NETLIFY_DEV ||
    process.env.SITE_ID ||
    process.env.NETLIFY_SITE_ID
  );
}

const stores = new Map<string, RawStore>();
export function rawStore(name: string): RawStore {
  let s = stores.get(name);
  if (s) return s;
  s = isNetlifyRuntime() ? new NetlifyStore(name) : new FileStore(name);
  stores.set(name, s);
  return s;
}

// ---------- Coleção tipada ----------
export interface Entity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export class Collection<T extends Entity> {
  constructor(public name: string) {}
  private store() {
    return rawStore(this.name);
  }
  async get(id: string): Promise<T | null> {
    const raw = await this.store().get(id);
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  }
  async getAll(): Promise<T[]> {
    const keys = await this.store().list();
    const items = await Promise.all(keys.map((k) => this.store().get(k)));
    return items
      .filter((v): v is string => !!v)
      .map((v) => {
        try { return JSON.parse(v) as T; } catch { return null as any; }
      })
      .filter(Boolean);
  }
  async find(predicate: (item: T) => boolean): Promise<T | null> {
    const all = await this.getAll();
    return all.find(predicate) ?? null;
  }
  async filter(predicate: (item: T) => boolean): Promise<T[]> {
    const all = await this.getAll();
    return all.filter(predicate);
  }
  async put(item: T): Promise<T> {
    const now = new Date().toISOString();
    const stored = {
      ...item,
      createdAt: item.createdAt ?? now,
      updatedAt: now,
    } as T;
    await this.store().set(item.id, JSON.stringify(stored));
    return stored;
  }
  async patch(id: string, patch: Partial<T>): Promise<T | null> {
    const current = await this.get(id);
    if (!current) return null;
    const next = { ...current, ...patch, updatedAt: new Date().toISOString() } as T;
    await this.store().set(id, JSON.stringify(next));
    return next;
  }
  async delete(id: string): Promise<void> {
    await this.store().delete(id);
  }
  async count(predicate?: (item: T) => boolean): Promise<number> {
    if (!predicate) return (await this.store().list()).length;
    return (await this.filter(predicate)).length;
  }
}

// ID curto, k-sortable, sem dependências externas
export function cuid() {
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 10);
  return `${ts}${rnd}`;
}
