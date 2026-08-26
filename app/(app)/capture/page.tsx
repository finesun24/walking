"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { usePins } from "@/components/PinsProvider";
import LocationExplainer from "@/components/LocationExplainer";
import { resizeToWebp } from "@/lib/image";
import { uploadPhoto } from "@/lib/storage";
import { COLORS, inkAlpha, safeTop, safeBottom } from "@/lib/ui";
import { PIN_COLUMNS, type Pin } from "@/lib/types";

const GEO_EXPLAINED_KEY = "geoExplained";
type Source = "camera" | "gallery";
type LocationStatus = "idle" | "locating" | "found" | "denied";

export default function CapturePage() {
  const router = useRouter();
  const { addOptimisticPin } = usePins();

  const [step, setStep] = useState<"select" | "explain" | "note">("select");
  const [pendingSource, setPendingSource] = useState<Source | null>(null);
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const close = () => router.push("/feed");

  const requestLocationAndOpenPicker = (source: Source, requestLocation: boolean) => {
    if (requestLocation && "geolocation" in navigator) {
      setLocationStatus("locating");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
          setLocationStatus("found");
        },
        () => setLocationStatus("denied"),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setLocationStatus("denied");
    }
    // 같은 탭 이벤트 안에서 동시에 실행해야 iOS에서 카메라가 열린다.
    const ref = source === "camera" ? cameraInputRef : galleryInputRef;
    ref.current?.click();
  };

  const chooseSource = (source: Source) => {
    const alreadyExplained = typeof window !== "undefined" && localStorage.getItem(GEO_EXPLAINED_KEY);
    if (!alreadyExplained) {
      setPendingSource(source);
      setStep("explain");
      return;
    }
    requestLocationAndOpenPicker(source, true);
  };

  const onAllowLocation = () => {
    localStorage.setItem(GEO_EXPLAINED_KEY, "1");
    if (pendingSource) requestLocationAndOpenPicker(pendingSource, true);
    setStep("select");
  };

  const onLaterLocation = () => {
    localStorage.setItem(GEO_EXPLAINED_KEY, "1");
    if (pendingSource) requestLocationAndOpenPicker(pendingSource, false);
    setStep("select");
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const { blob } = await resizeToWebp(file);
    setPhotoBlob(blob);
    setPreviewUrl(URL.createObjectURL(blob));
    setStep("note");
  };

  const save = async (withNote: boolean) => {
    if (!photoBlob || saving) return;
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    const imagePath = await uploadPhoto(supabase, user.id, photoBlob);
    const { data: inserted, error } = await supabase
      .from("pins")
      .insert({
        user_id: user.id,
        image_path: imagePath,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        accuracy: coords?.accuracy ?? null,
        taken_at: new Date().toISOString(),
        user_note: withNote && noteText.trim() ? noteText.trim() : null,
        caption_status: "pending",
      })
      .select(PIN_COLUMNS)
      .single();

    if (error || !inserted) {
      setSaving(false);
      return;
    }

    addOptimisticPin(inserted as Pin);
    router.push("/feed");
    fetch("/api/caption", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinId: inserted.id }),
    });
  };

  const locationLabel =
    locationStatus === "locating"
      ? "위치 찾는 중..."
      : locationStatus === "found" && coords
        ? `위치 확인됨 · 정확도 ${Math.round(coords.accuracy)}m`
        : locationStatus === "denied"
          ? "위치 없음"
          : "";

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", background: COLORS.paper }}>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFileSelected}
        style={{ display: "none" }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={onFileSelected}
        style={{ display: "none" }}
      />

      {step === "explain" && <LocationExplainer onAllow={onAllowLocation} onLater={onLaterLocation} />}

      {step === "select" && (
        <>
          <div style={{ padding: `${safeTop(24)} 20px 0`, display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={close}
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                border: "none",
                background: inkAlpha(0.08),
                fontSize: 12,
                color: COLORS.ink,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14, padding: "24px 24px 100px" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.ink, textAlign: "center", marginBottom: 8 }}>
              새 기록 남기기
            </div>
            <button
              onClick={() => chooseSource("camera")}
              style={{
                height: 120,
                borderRadius: 20,
                border: "none",
                background: COLORS.ink,
                color: "#fff",
                fontSize: 17,
                fontWeight: 700,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "3px solid #fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff" }} />
              </span>
              카메라로 찍기
            </button>
            <button
              onClick={() => chooseSource("gallery")}
              style={{
                height: 64,
                borderRadius: 16,
                border: `1.5px solid ${inkAlpha(0.15)}`,
                background: "#fff",
                color: COLORS.ink,
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              갤러리에서 고르기
            </button>
          </div>
        </>
      )}

      {step === "note" && (
        <>
          <div style={{ padding: `${safeTop(24)} 20px 0`, display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
            <button
              onClick={close}
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                border: "none",
                background: inkAlpha(0.08),
                fontSize: 12,
                color: COLORS.ink,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ width: "100%", height: 272, flexShrink: 0, borderRadius: 16, overflow: "hidden", background: inkAlpha(0.06) }}>
              {previewUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="촬영한 사진" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: inkAlpha(0.6) }}>한 줄 남기기 (선택)</div>
              <input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value.slice(0, 50))}
                placeholder="이 장면에 대해 한 마디"
                style={{
                  height: 48,
                  borderRadius: 12,
                  border: `1.5px solid ${inkAlpha(0.15)}`,
                  padding: "0 14px",
                  fontSize: 15,
                  color: COLORS.ink,
                  background: "#fff",
                }}
              />
              <div style={{ fontSize: 12, color: inkAlpha(0.4), textAlign: "right" }}>{noteText.length}/50</div>
            </div>
            {locationLabel && (
              <div style={{ fontSize: 13, color: inkAlpha(0.55), display: "flex", alignItems: "center", gap: 7 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50% 50% 50% 0",
                    transform: "rotate(45deg)",
                    background: inkAlpha(0.4),
                    flexShrink: 0,
                  }}
                />
                {locationLabel}
              </div>
            )}
          </div>
          <div style={{ padding: `12px 20px ${safeBottom(28)}`, display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
            <button
              onClick={() => save(true)}
              disabled={saving}
              style={{
                height: 52,
                borderRadius: 14,
                border: "none",
                background: COLORS.ink,
                color: "#fff",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              저장
            </button>
            <button
              onClick={() => save(false)}
              disabled={saving}
              style={{
                height: 44,
                borderRadius: 14,
                border: "none",
                background: "transparent",
                color: inkAlpha(0.55),
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              건너뛰고 저장
            </button>
          </div>
        </>
      )}
    </div>
  );
}
