"use client";

import { usePathname } from "next/navigation";
import BottomTabBar from "./BottomTabBar";

export default function ShellChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showTabBar = pathname === "/feed" || pathname === "/map" || pathname === "/dashboard";

  return (
    <>
      {children}
      {showTabBar && <BottomTabBar />}
    </>
  );
}
