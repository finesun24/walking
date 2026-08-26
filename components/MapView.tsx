"use client";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useRouter } from "next/navigation";
import { usePins } from "@/components/PinsProvider";
import { createClient } from "@/lib/supabase/client";
import { getSignedPhotoUrl } from "@/lib/storage";
import { moodColor, rgba } from "@/lib/moods";
import { moodDivIcon } from "@/lib/leafletIcon";
import { COLORS, inkAlpha, safeTop, safeBottom } from "@/lib/ui";
import type { Pin } from "@/lib/types";

const DEFAULT_CENTER: [number, number] = [37.5665, 126.978];

function clusterIcon(count: number) {
  const size = count < 10 ? 34 : count < 50 ? 40 : 46;
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${COLORS.ink};color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;font-family:-apple-system,system-ui,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid #fff">${count}</div>`,
    iconSize: [size, size],
  });
}

function FitBounds({ pins }: { pins: Pin[] }) {
  const map = useMap();
  useEffect(() => {
    const withCoords = pins.filter((p) => p.lat != null && p.lng != null);
    if (withCoords.length > 0) {
      const bounds = L.latLngBounds(withCoords.map((p) => [p.lat!, p.lng!] as [number, number]));
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 16 });
    } else if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        map.setView([pos.coords.latitude, pos.coords.longitude], 14);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pins.length]);
  return null;
}

export default function MapView() {
  const router = useRouter();
  const { pins } = usePins();
  const [sheetPinId, setSheetPinId] = useState<string | null>(null);
  const [sheetPhotoUrl, setSheetPhotoUrl] = useState<string | null>(null);

  const mapPins = useMemo(
    () => pins.filter((p) => p.caption_status === "done" && p.lat != null && p.lng != null),
    [pins]
  );
  const sheetPin = mapPins.find((p) => p.id === sheetPinId) || null;

  useEffect(() => {
    if (!sheetPin) {
      setSheetPhotoUrl(null);
      return;
    }
    const supabase = createClient();
    getSignedPhotoUrl(supabase, sheetPin.image_path).then(setSheetPhotoUrl);
  }, [sheetPin]);

  const color = sheetPin ? moodColor(sheetPin.mood) : COLORS.ink;

  return (
    <div style={{ height: "100dvh", position: "relative", background: "#EDEAE0" }} onClick={() => setSheetPinId(null)}>
      <MapContainer center={DEFAULT_CENTER} zoom={13} style={{ height: "100%", width: "100%" }} zoomControl={false}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <FitBounds pins={mapPins} />
        <MarkerClusterGroup
          iconCreateFunction={(cluster: L.MarkerCluster) => clusterIcon(cluster.getChildCount())}
        >
          {mapPins.map((p) => (
            <Marker
              key={p.id}
              position={[p.lat!, p.lng!]}
              icon={moodDivIcon(moodColor(p.mood))}
              eventHandlers={{
                click: (e) => {
                  e.originalEvent.stopPropagation();
                  setSheetPinId(p.id);
                },
              }}
            />
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      <div style={{ position: "absolute", top: safeTop(24), left: 16, right: 16, display: "flex", justifyContent: "flex-start", pointerEvents: "none" }}>
        <div
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(6px)",
            padding: "8px 14px",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            color: COLORS.ink,
          }}
        >
          총 {mapPins.length}개 핀
        </div>
      </div>

      {mapPins.length === 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(250,247,242,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div style={{ fontSize: 15, color: inkAlpha(0.5), fontWeight: 600 }}>아직 핀이 없어요</div>
        </div>
      )}

      {sheetPin && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            bottom: safeBottom(104),
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            padding: 12,
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div style={{ width: 56, height: 56, borderRadius: 12, flexShrink: 0, background: rgba(color, 0.15), overflow: "hidden" }}>
            {sheetPhotoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sheetPhotoUrl} alt={sheetPin.caption || "산책 사진"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            )}
          </div>
          <div
            onClick={() => router.push(`/pin/${sheetPin.id}`)}
            style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4, cursor: "pointer" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.ink }}>{sheetPin.mood}</span>
            </div>
            <div style={{ fontSize: 14, color: COLORS.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {sheetPin.caption}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
