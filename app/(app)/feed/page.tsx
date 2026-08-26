"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { usePins } from "@/components/PinsProvider";
import FeedCard from "@/components/FeedCard";
import { createClient } from "@/lib/supabase/client";
import { getSignedPhotoUrls } from "@/lib/storage";
import { formatKoreanDateFull, isSameDay } from "@/lib/datetime";
import { COLORS, inkAlpha, safeTop } from "@/lib/ui";

export default function FeedPage() {
  const router = useRouter();
  const { pins, loading } = usePins();
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const paths = pins.map((p) => p.image_path).filter(Boolean);
    if (paths.length === 0) return;
    const supabase = createClient();
    getSignedPhotoUrls(supabase, paths).then(setPhotoUrls);
  }, [pins]);

  const groups = useMemo(() => {
    const items: { headerLabel?: string; pin?: (typeof pins)[number] }[] = [];
    const today = new Date();
    pins.forEach((p, i) => {
      const taken = new Date(p.taken_at);
      const prevTaken = i > 0 ? new Date(pins[i - 1].taken_at) : null;
      if (!prevTaken || !isSameDay(taken, prevTaken)) {
        items.push({ headerLabel: isSameDay(taken, today) ? "오늘" : formatKoreanDateFull(taken) });
      }
      items.push({ pin: p });
    });
    return items;
  }, [pins]);

  const retry = async (pinId: string) => {
    const supabase = createClient();
    await supabase.from("pins").update({ caption_status: "pending" }).eq("id", pinId);
    fetch("/api/caption", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinId }),
    });
  };

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: COLORS.paper }}>
      <div
        style={{
          padding: `${safeTop(24)} 20px 14px`,
          flexShrink: 0,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.ink, letterSpacing: "-0.01em" }}>
            동네수집
          </div>
          <div style={{ fontSize: 13, color: inkAlpha(0.55), marginTop: 2 }}>
            {loading ? "" : `총 ${pins.length}개의 기록`}
          </div>
        </div>
      </div>

      {!loading && pins.length === 0 && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            padding: "0 40px 60px",
          }}
        >
          <div style={{ width: 150, height: 150, position: "relative" }}>
            <svg width="150" height="150" viewBox="0 0 150 150" style={{ position: "absolute", inset: 0 }}>
              <path
                d="M75 10c-24 0-42 18-42 42 0 30 42 78 42 78s42-48 42-78c0-24-18-42-42-42z"
                fill="none"
                stroke={inkAlpha(0.22)}
                strokeWidth={3}
                strokeDasharray="6 7"
              />
              <circle cx={75} cy={52} r={15} fill="none" stroke="#7B8FA1" strokeWidth={3} />
              <path d="M75 37 L75 30 M68 30 L82 30" stroke="#7B8FA1" strokeWidth={3} strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.ink }}>지금 첫 기록을 남겨보세요</div>
            <div style={{ fontSize: 14, color: inkAlpha(0.5) }}>
              산책하다 마음에 든 장면을 찍으면
              <br />
              여기에 쌓여요
            </div>
          </div>
          <button
            onClick={() => router.push("/capture")}
            style={{
              height: 48,
              padding: "0 24px",
              borderRadius: 14,
              border: "none",
              background: COLORS.ink,
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            촬영하기
          </button>
        </div>
      )}

      {!loading && pins.length > 0 && (
        <div style={{ flex: 1, padding: "0 16px 110px", display: "flex", flexDirection: "column", gap: 16 }}>
          {groups.map((item, i) =>
            item.headerLabel ? (
              <div
                key={`h-${i}`}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: inkAlpha(0.45),
                  padding: "6px 2px 0",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {item.headerLabel}
              </div>
            ) : (
              <FeedCard
                key={item.pin!.id}
                pin={item.pin!}
                photoUrl={photoUrls[item.pin!.image_path]}
                onOpen={() => router.push(`/pin/${item.pin!.id}`)}
                onRetry={(e) => {
                  e.stopPropagation();
                  retry(item.pin!.id);
                }}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
