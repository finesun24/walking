export const MOOD_COLORS: Record<string, string> = {
  고요: "#7B8FA1",
  설렘: "#F0836B",
  쓸쓸: "#5B6785",
  따뜻: "#E2A044",
  활기: "#E85D3A",
  몽롱: "#9B8AA6",
  청량: "#5FB3B3",
  아늑: "#B98D63",
};

export const MOOD_ORDER = ["고요", "설렘", "쓸쓸", "따뜻", "활기", "몽롱", "청량", "아늑"] as const;

export type Mood = (typeof MOOD_ORDER)[number];

export const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"] as const;

export function isMood(value: string | null | undefined): value is Mood {
  return !!value && (MOOD_ORDER as readonly string[]).includes(value);
}

export function rgba(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

export function moodColor(mood: string | null | undefined): string {
  return mood && MOOD_COLORS[mood] ? MOOD_COLORS[mood] : "#C9C4B8";
}
