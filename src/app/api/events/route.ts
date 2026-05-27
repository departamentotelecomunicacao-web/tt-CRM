import { NextRequest } from "next/server";
import { subscribe } from "@/server/events";
import { getSession } from "@/server/auth";
import { ensureInit } from "@/server/init";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Server-Sent Events: realtime push para clientes do mesmo org.
export async function GET(_req: NextRequest) {
  ensureInit();
  const s = await getSession();
  if (!s) return new Response("unauthorized", { status: 401 });

  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder();
      const send = (data: any) => {
        try {
          controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {}
      };

      send({ type: "hello", at: Date.now() });

      const unsubscribe = subscribe((evt) => {
        if (evt.org !== s.org) return;
        send(evt);
      });
      const ping = setInterval(() => send({ type: "ping", at: Date.now() }), 25000);

      // @ts-ignore
      controller.signal?.addEventListener?.("abort", () => {
        clearInterval(ping);
        unsubscribe();
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "x-accel-buffering": "no",
      connection: "keep-alive",
    },
  });
}
