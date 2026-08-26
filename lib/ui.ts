export const COLORS = {
  paper: "#FAF7F2",
  mapPaper: "#EDEAE0",
  ink: "#1C1B18",
  card: "#fff",
  error: "#B23B2E",
} as const;

export const inkAlpha = (a: number) => `rgba(28,27,24,${a})`;

export const safeTop = (px: number) => `calc(${px}px + env(safe-area-inset-top))`;
export const safeBottom = (px: number) => `calc(${px}px + env(safe-area-inset-bottom))`;
