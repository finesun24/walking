"use client";

import { usePathname, useRouter } from "next/navigation";
import { COLORS, inkAlpha, safeBottom } from "@/lib/ui";

export default function BottomTabBar() {
  const pathname = usePathname();
  const router = useRouter();

  const feedActive = pathname === "/feed";
  const mapActive = pathname === "/map";
  const dashActive = pathname === "/dashboard";

  const feedColor = feedActive ? COLORS.ink : inkAlpha(0.4);
  const mapColor = mapActive ? COLORS.ink : inkAlpha(0.4);
  const dashColor = dashActive ? COLORS.ink : inkAlpha(0.4);

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        paddingBottom: safeBottom(26),
        paddingTop: 10,
        background: "rgba(250,247,242,0.92)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 12,
        paddingRight: 12,
        borderTop: `1px solid ${inkAlpha(0.08)}`,
        zIndex: 10,
      }}
    >
      <button
        onClick={() => router.push("/feed")}
        style={{
          width: 56,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        <span style={{ width: 22, height: 16, borderRadius: 3, border: `2px solid ${feedColor}` }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: feedColor }}>피드</span>
      </button>

      <button
        onClick={() => router.push("/map")}
        style={{
          width: 56,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            width: 16,
            height: 16,
            borderRadius: "50% 50% 50% 0",
            transform: "rotate(45deg)",
            border: `2px solid ${mapColor}`,
          }}
        />
        <span style={{ fontSize: 11, fontWeight: 600, color: mapColor }}>지도</span>
      </button>

      <button
        onClick={() => router.push("/capture")}
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: COLORS.ink,
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(28,27,24,0.35)",
          marginTop: -18,
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <span style={{ width: 22, height: 22, borderRadius: "50%", border: "2.5px solid #fff" }} />
      </button>

      <button
        onClick={() => router.push("/dashboard")}
        style={{
          width: 56,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            width: 16,
            height: 16,
            border: `2px solid ${dashColor}`,
            borderRadius: 3,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 2,
            paddingBottom: 1,
          }}
        >
          <span style={{ width: 2.5, height: 5, background: dashColor }} />
          <span style={{ width: 2.5, height: 8, background: dashColor }} />
          <span style={{ width: 2.5, height: 3, background: dashColor }} />
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, color: dashColor }}>대시보드</span>
      </button>

      <div style={{ width: 56, flexShrink: 0 }} />
    </div>
  );
}
