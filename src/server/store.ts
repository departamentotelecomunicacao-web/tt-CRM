// Storage agnostic — Netlify Blobs em produção, JSON em arquivo local em dev.
// Otimizações:
//  - Cache em memória por instância (TTL curto) para reduzir chamadas de rede aos Blobs
//  - findBy* com índice opcional (acelera buscas frequentes por username, slug, etc.)
//  - paginação básica via slice
//
// Convenção:
//  - Cada Collection é um "store" Netlify Blobs (= namespace)
//  - Chaves armazenadas como JSON serializado

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

// ---------- Cache em memória (TTL curto, escopo do processo) ----------
const TTL_MS = 4_000; // suficiente para deduplicar chamadas dentro do mesmo request
interface CacheEntry<T> { value: T; expires: number; }
const cache = new Map<string, CacheEntry<any>>();

function cacheKey(coll: string, key: string) {
  return `${coll}::${key}`;
}
function cacheGet<T>(coll: string, key: string): T | undefined {
  const e = cache.get(cacheKey(coll, key));
  if (!e) return undefined;
  if (Date.now() > e.expires) {
    cache.delete(cacheKey(coll, key));
    return undefined;
  }
  return e.value as T;
}
function cacheSet<T>(coll: string, key: string, value: T) {
  cache.set(cacheKey(coll, key), { value, expires: Date.now() + TTL_MS });
}
function cacheInvalidate(coll: string, key?: string) {
  if (key) {
    cache.delete(cacheKey(coll, key));
    cache.delete(cacheKey(coll, "__all__"));
    return;
  }
  for (const k of Array.from(cache.keys())) {
    if (k.startsWith(coll + "::")) cache.delete(k);
  }
}

// ---------- Coleção tipada ----------
export interface Entity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export class Collection<T extends Entity> {
  /**
   * @param name      Nome do store (= coleção/tabela)
   * @param indexes   Campos a indexar (ex.: ["username"]) — gera lookups O(1)
   */
  constructor(public name: string, private indexes: (keyof T)[] = []) {}

  private store() { return rawStore(this.name); }
  private indexStore() { return rawStore(`__index_${this.name}`); }

  async get(id: string): Promise<T | null> {
    const hit = cacheGet<T | null>(this.name, id);
    if (hit !== undefined) return hit;
    const raw = await this.store().get(id);
    if (!raw) { cacheSet<T | null>(this.name, id, null); return null; }
    try {
      const parsed = JSON.parse(raw) as T;
      cacheSet(this.name, id, parsed);
      return parsed;
    } catch { return null; }
  }

  async getAll(): Promise<T[]> {
    const hit = cacheGet<T[]>(this.name, "__all__");
    if (hit !== undefined) return hit;
    const keys = await this.store().list();
    const items = await Promise.all(keys.map((k) => this.store().get(k)));
    const parsed = items
      .filter((v): v is string => !!v)
      .map((v) => { try { return JSON.parse(v) as T; } catch { return null as any; } })
      .filter(Boolean);
    cacheSet(this.name, "__all__", parsed);
    return parsed;
  }

  async find(predicate: (item: T) => boolean): Promise<T | null> {
    const all = await this.getAll();
    return all.find(predicate) ?? null;
  }
  async filter(predicate: (item: T) => boolean): Promise<T[]> {
    const all = await this.getAll();
    return all.filter(predicate);
  }

  /** Busca otimizada por campo indexado (O(1) via blob de índice). */
  async findByIndex(field: keyof T, value: any): Promise<T | null> {
    if (!this.indexes.includes(field)) return this.find((it) => (it as any)[field] === value);
    const indexKey = `${String(field)}=${String(value)}`;
    const cached = cacheGet<string | null>(`__index_${this.name}`, indexKey);
    let id: string | null;
    if (cached !== undefined) id = cached;
    else {
      id = await this.indexStore().get(indexKey);
      cacheSet<string | null>(`__index_${this.name}`, indexKey, id);
    }
    if (!id) return null;
    return this.get(id);
  }

  async put(item: T): Promise<T> {
    const now = new Date().toISOString();
    const stored = {
      ...item,
      createdAt: item.createdAt ?? now,
      updatedAt: now,
    } as T;
    await this.store().set(item.id, JSON.stringify(stored));
    // Atualiza índices
    for (const field of this.indexes) {
      const val = (stored as any)[field];
      if (val !== undefined && val !== null && val !== "") {
        await this.indexStore().set(`${String(field)}=${String(val)}`, item.id);
        cacheInvalidate(`__index_${this.name}`, `${String(field)}=${String(val)}`);
      }
    }
    cacheInvalidate(this.name);
    return stored;
  }

  async patch(id: string, patch: Partial<T>): Promise<T | null> {
    const current = await this.get(id);
    if (!current) return null;
    const next = { ...current, ...patch, updatedAt: new Date().toISOString() } as T;
    await this.store().set(id, JSON.stringify(next));
    // Reindexa qualquer campo que mudou
    for (const field of this.indexes) {
      if (field in patch) {
        const oldVal = (current as any)[field];
        const newVal = (next as any)[field];
        if (oldVal !== undefined && oldVal !== null && oldVal !== "") {
          await this.indexStore().delete(`${String(field)}=${String(oldVal)}`);
        }
        if (newVal !== undefined && newVal !== null && newVal !== "") {
          await this.indexStore().set(`${String(field)}=${String(newVal)}`, id);
        }
        cacheInvalidate(`__index_${this.name}`);
      }
    }
    cacheInvalidate(this.name);
    return next;
  }

  async delete(id: string): Promise<void> {
    const cur = await this.get(id);
    if (cur) {
      for (const field of this.indexes) {
        const val = (cur as any)[field];
        if (val !== undefined && val !== null && val !== "") {
          await this.indexStore().delete(`${String(field)}=${String(val)}`);
        }
      }
    }
    await this.store().delete(id);
    cacheInvalidate(this.name);
  }

  async count(predicate?: (item: T) => boolean): Promise<number> {
    if (!predicate) return (await this.store().list()).length;
    return (await this.filter(predicate)).length;
  }
}

// ID curto, k-sortable (timestamp prefix), sem deps
export function cuid() {
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 10);
  return `${ts}${rnd}`;
}

// Para limpar cache manualmente (testes / debug)
export function _flushCache() {
  cache.clear();
}
