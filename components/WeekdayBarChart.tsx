import type { WeekdayBar } from "@/lib/dashboard";

export default function WeekdayBarChart({
  weekdayBars,
  weekdaySummary,
}: {
  weekdayBars: WeekdayBar[];
  weekdaySummary: string;
}) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "18px 16px", display: "flex", flexDirection: "column", gap: 14, boxShadow: "0 1px 2px rgba(28,27,24,0.06)" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#1C1B18" }}>요일별 기록 수</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 110 }}>
        {weekdayBars.map((w) => (
          <div key={w.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 6, height: "100%" }}>
            <div style={{ width: "100%", maxWidth: 28, height: `${w.heightPct}%`, minHeight: 4, borderRadius: 6, background: w.color }} />
            <span style={{ fontSize: 11, fontWeight: w.labelWeight, color: w.labelColor }}>{w.label}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#1C1B18" }}>{weekdaySummary}</div>
    </div>
  );
}
