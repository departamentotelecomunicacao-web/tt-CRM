"use client";
import useSWR, { SWRConfiguration } from "swr";

export const fetcher = async (url: string) => {
  const r = await fetch(url, { credentials: "include" });
  if (!r.ok) {
    const e: any = new Error("request_failed");
    e.status = r.status;
    try {
      e.body = await r.json();
    } catch {}
    throw e;
  }
  return r.json();
};

export function useApi<T = any>(url: string | null, opts?: SWRConfiguration) {
  return useSWR<T>(url, fetcher, {
    revalidateOnFocus: false,
    keepPreviousData: true,
    ...opts,
  });
}

export async function api<T = any>(
  url: string,
  init: RequestInit & { json?: any } = {}
): Promise<T> {
  const { json, headers, ...rest } = init;
  const r = await fetch(url, {
    ...rest,
    credentials: "include",
    headers: {
      "content-type": "application/json",
      ...(headers ?? {}),
    },
    body: json !== undefined ? JSON.stringify(json) : (init.body as any),
  });
  if (!r.ok) {
    const e: any = new Error("request_failed");
    e.status = r.status;
    try {
      e.body = await r.json();
    } catch {}
    throw e;
  }
  return r.json();
}
