"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import SplashScreen from "@/components/SplashScreen";

const MIN_SPLASH_MS = 900;
const ONBOARDING_KEY = "onboarding_v1";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    const start = Date.now();

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const elapsed = Date.now() - start;
      const wait = Math.max(0, MIN_SPLASH_MS - elapsed);
      await new Promise((resolve) => setTimeout(resolve, wait));
      if (cancelled) return;

      if (!session) {
        router.replace("/login");
        return;
      }
      const onboarded = typeof window !== "undefined" && localStorage.getItem(ONBOARDING_KEY);
      router.replace(onboarded ? "/feed" : "/onboarding");
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return <SplashScreen />;
}
