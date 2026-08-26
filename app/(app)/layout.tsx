import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PinsProvider } from "@/components/PinsProvider";
import ShellChrome from "@/components/ShellChrome";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  return (
    <PinsProvider>
      <ShellChrome>{children}</ShellChrome>
    </PinsProvider>
  );
}
