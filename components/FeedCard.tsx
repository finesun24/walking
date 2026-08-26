"use client";

import { moodColor, rgba } from "@/lib/moods";
import { inkAlpha } from "@/lib/ui";
import { formatKoreanTime } from "@/lib/datetime";
import type { Pin } from "@/lib/types";

export default function FeedCard({
  pin,
  photoUrl,
  onOpen,
  onRetry,
}: {
  pin: Pin;
  photoUrl?: string;
  onOpen: () => void;
  onRetry: (e: React.MouseEvent) => void;
}) {
  const color = moodColor(pin.mood);
  const isDone = pin.caption_status === "done";
  const isPending = pin.caption_status === "pending";
  const isFailed = pin.caption_status === "failed";
  const moodLabel = pin.mood || (isPending ? "분석 중" : isFailed ? "캡션 실패" : "미분류");

  return (
    <div
      onClick={isDone ? onOpen : undefined}
      style={{
        background: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        flexShrink: 0,
        boxShadow: "0 1px 2px rgba(28,27,24,0.06),0 1px 0 rgba(28,27,24,0.04)",
        cursor: isDone ? "pointer" : "default",
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "4/3",
          flexShrink: 0,
          background: photoUrl ? `${inkAlpha(0.04)}` : rgba(color, 0.12),
        }}
      >
        {photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={pin.caption || "산책 사진"}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}
      </div>
      <div style={{ display: "flex", gap: 0 }}>
        <div style={{ width: 4, flexShrink: 0, background: color }} />
        <div
          style={{
            flex: 1,
            minWidth: 0,
            padding: "14px 16px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color,
                background: rgba(color, 0.14),
                padding: "4px 10px",
                borderRadius: 999,
              }}
            >
              {moodLabel}
            </span>
            <span style={{ marginLeft: "auto", fontSize: 12, color: inkAlpha(0.45) }}>
              {formatKoreanTime(new Date(pin.taken_at))}
            </span>
          </div>

          {isDone && (
            <>
              <div style={{ fontSize: 17, lineHeight: 1.45, color: "#1C1B18" }}>{pin.caption}</div>
              {pin.tags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {pin.tags.map((tag) => (
                    <span key={tag} style={{ fontSize: 13, color: inkAlpha(0.55) }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}

          {isPending && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[92, 60].map((w, i) => (
                <div
                  key={i}
                  style={{
                    height: 14,
                    borderRadius: 7,
                    width: `${w}%`,
                    background:
                      "linear-gradient(90deg,rgba(28,27,24,0.06),rgba(28,27,24,0.14),rgba(28,27,24,0.06))",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.4s ease-in-out infinite",
                  }}
                />
              ))}
            </div>
          )}

          {isFailed && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <span style={{ fontSize: 14, color: inkAlpha(0.6) }}>캡션을 만들지 못했어요</span>
              <button
                onClick={onRetry}
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#fff",
                  background: "#1C1B18",
                  border: "none",
                  borderRadius: 10,
                  padding: "7px 12px",
                  cursor: "pointer",
                }}
              >
                다시 시도
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
