"use client";

import { useMemo } from "react";
import { usePins } from "@/components/PinsProvider";
import { computeDashboard } from "@/lib/dashboard";
import TagCloud from "@/components/TagCloud";
import WeekdayBarChart from "@/components/WeekdayBarChart";
import MoodDonut from "@/components/MoodDonut";
import { COLORS, inkAlpha, safeTop } from "@/lib/ui";

export default function DashboardPage() {
  const { pins, loading } = usePins();
  const dash = useMemo(() => computeDashboard(pins), [pins]);

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: COLORS.paper }}>
      <div style={{ padding: `${safeTop(24)} 20px 14px`, flexShrink: 0 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.ink, letterSpacing: "-0.01em" }}>대시보드</div>
        <div style={{ fontSize: 13, color: inkAlpha(0.55), marginTop: 2 }}>
          {!loading && `총 ${dash.doneCount}개 핀 · ${dash.uniqueDays}일 산책`}
        </div>
      </div>

      {!loading && dash.isEmpty && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 40px 60px", textAlign: "center" }}>
          <div style={{ fontSize: 15, color: inkAlpha(0.5), lineHeight: 1.6 }}>
            기록이 조금 더 쌓이면
            <br />
            보여드릴게요
          </div>
        </div>
      )}

      {!loading && !dash.isEmpty && (
        <div style={{ flex: 1, padding: "0 16px 110px", display: "flex", flexDirection: "column", gap: 16 }}>
          <TagCloud tagsEmpty={dash.tagsEmpty} tagCloud={dash.tagCloud} />
          <WeekdayBarChart weekdayBars={dash.weekdayBars} weekdaySummary={dash.weekdaySummary} />
          <MoodDonut
            moodDonutGradient={dash.moodDonutGradient}
            moodLegend={dash.moodLegend}
            moodCenterLabel={dash.moodCenterLabel}
          />
        </div>
      )}
    </div>
  );
}
