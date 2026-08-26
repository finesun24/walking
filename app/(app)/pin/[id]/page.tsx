"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { usePins } from "@/components/PinsProvider";
import { createClient } from "@/lib/supabase/client";
import { getSignedPhotoUrl, PHOTO_BUCKET } from "@/lib/storage";
import { moodColor, rgba } from "@/lib/moods";
import { formatKoreanDateFull, formatKoreanTime } from "@/lib/datetime";
import { COLORS, inkAlpha, safeTop } from "@/lib/ui";
import type { Pin } from "@/lib/types";

const MiniMap = dynamic(() => import("@/components/MiniMap"), { ssr: false });

export default function PinDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { pins, loading: pinsLoading } = usePins();
  const [pin, setPin] = useState<Pin | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fromContext = pins.find((p) => p.id === id);
    if (fromContext) {
      setPin(fromContext);
      return;
    }
    if (pinsLoading) return;
    let cancelled = false;
    const supabase = createClient();
    supabase
      .from("pins")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (!cancelled) setPin(data as Pin | null);
      });
    return () => {
      cancelled = true;
    };
  }, [id, pins, pinsLoading]);

  useEffect(() => {
    if (!pin) return;
    const supabase = createClient();
    getSignedPhotoUrl(supabase, pin.image_path).then(setPhotoUrl);
  }, [pin]);

  if (!pin) return null;

  const color = moodColor(pin.mood);
  const taken = new Date(pin.taken_at);

  const deletePin = async () => {
    if (!confirm("이 기록을 삭제할까요?")) return;
    const supabase = createClient();
    await supabase.storage.from(PHOTO_BUCKET).remove([pin.image_path]);
    await supabase.from("pins").delete().eq("id", pin.id);
    router.replace("/feed");
  };

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: COLORS.paper, position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 5,
          display: "flex",
          justifyContent: "space-between",
          padding: `${safeTop(20)} 16px 0`,
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "none",
            background: "rgba(255,255,255,0.85)",
            color: COLORS.ink,
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          ←
        </button>
        <button
          onClick={deletePin}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "none",
            background: "rgba(255,255,255,0.85)",
            color: COLORS.ink,
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          ⋯
        </button>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ width: "100%", height: 302, background: rgba(color, 0.12) }}>
          {photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt={pin.caption || "산책 사진"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )}
        </div>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color,
                background: rgba(color, 0.14),
                padding: "5px 12px",
                borderRadius: 999,
              }}
            >
              {pin.mood || "미분류"}
            </span>
          </div>
          <div style={{ fontSize: 19, lineHeight: 1.5, color: COLORS.ink }}>{pin.caption}</div>
          {pin.tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {pin.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 13,
                    color: inkAlpha(0.55),
                    background: inkAlpha(0.06),
                    padding: "4px 10px",
                    borderRadius: 8,
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          {pin.user_note && (
            <div style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 12, color: inkAlpha(0.45) }}>내가 남긴 한 줄</div>
              <div style={{ fontSize: 15, color: COLORS.ink }}>&quot;{pin.user_note}&quot;</div>
            </div>
          )}
          <div style={{ fontSize: 13, color: inkAlpha(0.45) }}>
            {formatKoreanDateFull(taken)} {formatKoreanTime(taken)}
          </div>
          {pin.lat != null && pin.lng != null && (
            <div style={{ height: 120, borderRadius: 14, overflow: "hidden" }}>
              <MiniMap lat={pin.lat} lng={pin.lng} color={color} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
