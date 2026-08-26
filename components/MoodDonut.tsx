import type { MoodLegendEntry } from "@/lib/dashboard";

export default function MoodDonut({
  moodDonutGradient,
  moodLegend,
  moodCenterLabel,
}: {
  moodDonutGradient: string;
  moodLegend: MoodLegendEntry[];
  moodCenterLabel: string;
}) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "18px 16px", display: "flex", flexDirection: "column", gap: 14, boxShadow: "0 1px 2px rgba(28,27,24,0.06)" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#1C1B18" }}>무드 분포</div>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            flexShrink: 0,
            background: moodDonutGradient,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: 4,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1C1B18", lineHeight: 1.3 }}>{moodCenterLabel}</span>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
          {moodLegend.map((m) => (
            <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: m.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "#1C1B18", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {m.label}
              </span>
              <span style={{ fontSize: 12, color: "rgba(28,27,24,0.5)" }}>{m.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
