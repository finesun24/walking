"use client";

import { COLORS, inkAlpha, safeBottom } from "@/lib/ui";

export default function LocationExplainer({
  onAllow,
  onLater,
}: {
  onAllow: () => void;
  onLater: () => void;
}) {
  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: COLORS.paper,
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          padding: "0 36px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "rgba(123,143,161,0.16)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              width: 20,
              height: 20,
              borderRadius: "50% 50% 50% 0",
              transform: "rotate(45deg)",
              background: "#7B8FA1",
            }}
          />
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.ink, lineHeight: 1.5 }}>
          찍은 장소를 지도에 남기려면
          <br />
          위치가 필요해요
        </div>
        <div style={{ fontSize: 14, color: inkAlpha(0.55), lineHeight: 1.5 }}>
          위치를 허용하지 않아도 사진은 저장돼요.
          <br />
          다만 지도에는 표시되지 않아요.
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          padding: `12px 24px ${safeBottom(28)}`,
          flexShrink: 0,
        }}
      >
        <button
          onClick={onAllow}
          style={{
            height: 52,
            borderRadius: 14,
            border: "none",
            background: COLORS.ink,
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          허용하기
        </button>
        <button
          onClick={onLater}
          style={{
            height: 44,
            borderRadius: 14,
            border: "none",
            background: "transparent",
            color: inkAlpha(0.55),
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          나중에
        </button>
      </div>
    </div>
  );
}
