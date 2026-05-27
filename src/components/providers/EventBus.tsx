"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";

type Listener = (evt: any) => void;
const Ctx = createContext<{ subscribe: (fn: Listener) => () => void; connected: boolean }>({
  subscribe: () => () => {},
  connected: false,
});

export function EventBusProvider({ children }: { children: React.ReactNode }) {
  const listeners = useRef(new Set<Listener>());
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let es: EventSource | null = null;
    let stopped = false;

    function connect() {
      if (stopped) return;
      es = new EventSource("/api/events");
      es.onopen = () => setConnected(true);
      es.onerror = () => {
        setConnected(false);
        es?.close();
        if (!stopped) setTimeout(connect, 4000);
      };
      es.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          listeners.current.forEach((l) => {
            try { l(data); } catch {}
          });
        } catch {}
      };
    }
    connect();
    return () => {
      stopped = true;
      es?.close();
    };
  }, []);

  return (
    <Ctx.Provider
      value={{
        subscribe: (fn) => {
          listeners.current.add(fn);
          return () => listeners.current.delete(fn);
        },
        connected,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useEventBus = () => useContext(Ctx);
