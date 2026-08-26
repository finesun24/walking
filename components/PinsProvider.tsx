"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PIN_COLUMNS, type Pin } from "@/lib/types";

interface PinsContextValue {
  pins: Pin[];
  loading: boolean;
  userId: string | null;
  addOptimisticPin: (pin: Pin) => void;
  refresh: () => Promise<void>;
}

const PinsContext = createContext<PinsContextValue | null>(null);

export function PinsProvider({ children }: { children: React.ReactNode }) {
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());

  const load = useCallback(async (uid: string) => {
    const supabase = supabaseRef.current;
    const { data } = await supabase
      .from("pins")
      .select(PIN_COLUMNS)
      .eq("user_id", uid)
      .order("taken_at", { ascending: false });
    if (data) setPins(data as Pin[]);
    setLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    if (userId) await load(userId);
  }, [userId, load]);

  useEffect(() => {
    const supabase = supabaseRef.current;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const uid = session?.user.id;
      if (!uid) {
        setLoading(false);
        return;
      }
      setUserId(uid);
      await load(uid);

      channel = supabase
        .channel("pins-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "pins", filter: `user_id=eq.${uid}` },
          (payload) => {
            setPins((prev) => {
              if (payload.eventType === "DELETE") {
                return prev.filter((p) => p.id !== (payload.old as Pin).id);
              }
              const incoming = payload.new as Pin;
              const exists = prev.some((p) => p.id === incoming.id);
              const next = exists
                ? prev.map((p) => (p.id === incoming.id ? incoming : p))
                : [incoming, ...prev];
              return [...next].sort(
                (a, b) => new Date(b.taken_at).getTime() - new Date(a.taken_at).getTime()
              );
            });
          }
        )
        .subscribe();
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [load]);

  const addOptimisticPin = useCallback((pin: Pin) => {
    setPins((prev) => [pin, ...prev]);
  }, []);

  return (
    <PinsContext.Provider value={{ pins, loading, userId, addOptimisticPin, refresh }}>
      {children}
    </PinsContext.Provider>
  );
}

export function usePins() {
  const ctx = useContext(PinsContext);
  if (!ctx) throw new Error("usePins는 PinsProvider 안에서만 사용할 수 있어요");
  return ctx;
}
