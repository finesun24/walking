import { WEEKDAYS } from "./moods";

const WEEKDAY_KO = ["일", "월", "화", "수", "목", "금", "토"];

export function deriveSeason(date: Date): string {
  const m = date.getMonth() + 1;
  if (m === 12 || m <= 2) return "겨울";
  if (m <= 5) return m <= 4 ? "봄" : "늦봄";
  if (m <= 8) return m <= 7 ? "여름" : "늦여름";
  return m <= 10 ? "가을" : "늦가을";
}

export function deriveTimeOfDay(date: Date): string {
  const h = date.getHours();
  if (h < 5) return "새벽";
  if (h < 9) return "아침";
  if (h < 12) return "오전";
  if (h < 14) return "낮";
  if (h < 17) return "오후";
  if (h < 19) return "해질녘";
  if (h < 22) return "저녁";
  return "밤";
}

export function deriveWeekdayKorean(date: Date): (typeof WEEKDAYS)[number] {
  const idx = date.getDay(); // 0=Sun
  const map: Record<number, (typeof WEEKDAYS)[number]> = {
    0: "일",
    1: "월",
    2: "화",
    3: "수",
    4: "목",
    5: "금",
    6: "토",
  };
  return map[idx];
}

export function formatKoreanDateFull(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const wd = WEEKDAY_KO[date.getDay()];
  return `${y}년 ${m}월 ${d}일 (${wd})`;
}

export function formatKoreanDateShort(date: Date): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${m}/${d}`;
}

export function formatKoreanTime(date: Date): string {
  let h = date.getHours();
  const min = date.getMinutes();
  const period = h < 12 ? "오전" : "오후";
  h = h % 12;
  if (h === 0) h = 12;
  return `${period} ${h}:${String(min).padStart(2, "0")}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
