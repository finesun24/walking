import { MOOD_COLORS, MOOD_ORDER, WEEKDAYS } from "./moods";
import { deriveWeekdayKorean, formatKoreanDateShort } from "./datetime";
import type { Pin } from "./types";

export interface TagCloudEntry {
  tag: string;
  size: number;
  color: string;
}

export interface WeekdayBar {
  label: (typeof WEEKDAYS)[number];
  heightPct: number;
  color: string;
  labelWeight: number;
  labelColor: string;
}

export interface MoodLegendEntry {
  label: string;
  color: string;
  pct: number;
}

export interface DashboardData {
  isEmpty: boolean;
  doneCount: number;
  uniqueDays: number;
  tagsEmpty: boolean;
  tagCloud: TagCloudEntry[];
  weekdayBars: WeekdayBar[];
  weekdaySummary: string;
  moodDonutGradient: string;
  moodLegend: MoodLegendEntry[];
  moodCenterLabel: string;
}

export function computeDashboard(pins: Pin[]): DashboardData {
  const done = pins.filter((p) => p.caption_status === "done");
  const isEmpty = done.length < 3;
  const uniqueDays = new Set(pins.map((p) => formatKoreanDateShort(new Date(p.taken_at)))).size;

  const tagCounts: Record<string, number> = {};
  done.forEach((p) => p.tags.forEach((t) => (tagCounts[t] = (tagCounts[t] || 0) + 1)));
  const tagEntries = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
  const tagsEmpty = tagEntries.length < 5;
  const maxC = tagEntries.length ? tagEntries[0][1] : 1;
  const minC = tagEntries.length ? tagEntries[tagEntries.length - 1][1] : 1;
  const tagCloud: TagCloudEntry[] = tagEntries.map(([tag, count]) => {
    const ratio = maxC === minC ? 1 : (count - minC) / (maxC - minC);
    const size = Math.round(13 + ratio * 26);
    return { tag, size, color: ratio > 0.5 ? "#1C1B18" : "rgba(28,27,24,0.55)" };
  });

  const wdCounts: Record<string, number> = {};
  WEEKDAYS.forEach((w) => (wdCounts[w] = 0));
  pins.forEach((p) => {
    wdCounts[deriveWeekdayKorean(new Date(p.taken_at))]++;
  });
  const maxWd = Math.max(...Object.values(wdCounts), 1);
  const topWd = Object.entries(wdCounts).sort((a, b) => b[1] - a[1])[0][0];
  const weekdayBars: WeekdayBar[] = WEEKDAYS.map((w) => ({
    label: w,
    heightPct: Math.max((wdCounts[w] / maxWd) * 100, wdCounts[w] > 0 ? 14 : 6),
    color: w === topWd && wdCounts[w] > 0 ? "#1C1B18" : "rgba(28,27,24,0.15)",
    labelWeight: w === topWd ? 700 : 500,
    labelColor: w === topWd ? "#1C1B18" : "rgba(28,27,24,0.5)",
  }));
  const weekdaySummary =
    wdCounts[topWd] > 0 ? `${topWd}요일에 가장 많이 걸었어요` : "아직 요일 패턴이 보이지 않아요";

  const moodCounts: Record<string, number> = {};
  MOOD_ORDER.forEach((m) => (moodCounts[m] = 0));
  done.forEach((p) => {
    if (p.mood) moodCounts[p.mood]++;
  });
  const totalMood = done.length || 1;
  let acc = 0;
  const stops: string[] = [];
  const legendSrc = MOOD_ORDER.map((m) => ({ m, count: moodCounts[m] }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);
  legendSrc.forEach(({ m, count }) => {
    const deg = (count / totalMood) * 360;
    stops.push(`${MOOD_COLORS[m]} ${acc}deg ${acc + deg}deg`);
    acc += deg;
  });
  const moodDonutGradient = stops.length
    ? `conic-gradient(${stops.join(",")})`
    : "rgba(28,27,24,0.1)";
  const moodLegend: MoodLegendEntry[] = legendSrc.map(({ m, count }) => ({
    label: m,
    color: MOOD_COLORS[m],
    pct: Math.round((count / totalMood) * 100),
  }));
  const moodCenterLabel = legendSrc.length ? legendSrc[0].m : "-";

  return {
    isEmpty,
    doneCount: done.length,
    uniqueDays,
    tagsEmpty,
    tagCloud,
    weekdayBars,
    weekdaySummary,
    moodDonutGradient,
    moodLegend,
    moodCenterLabel,
  };
}
