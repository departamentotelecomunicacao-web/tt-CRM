"use client";
import { createContext, useContext } from "react";
import { useApi } from "@/lib/swr";

export interface SessionUser {
  id: string;
  name: string;
  username: string;
  email: string | null;
  role: string;
  avatarTone: string;
  organization: { id: string; name: string; plan: string };
}

const Ctx = createContext<{
  user: SessionUser | null;
  loading: boolean;
  refresh: () => void;
}>({ user: null, loading: true, refresh: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, mutate } = useApi<{ user: SessionUser | null }>("/api/auth/me");
  return (
    <Ctx.Provider value={{ user: data?.user ?? null, loading: isLoading, refresh: () => mutate() }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
