import { COLORS, inkAlpha } from "@/lib/ui";

export default function SplashScreen() {
  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: COLORS.paper,
        gap: 10,
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.ink, letterSpacing: "-0.01em" }}>
        동네수집
      </div>
      <div style={{ fontSize: 14, color: inkAlpha(0.55) }}>
        우리 동네를 기록하는 가장 조용한 방법
      </div>
    </div>
  );
}
