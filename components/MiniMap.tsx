"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { moodDivIcon } from "@/lib/leafletIcon";

export default function MiniMap({
  lat,
  lng,
  color,
}: {
  lat: number;
  lng: number;
  color: string;
}) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[lat, lng]} icon={moodDivIcon(color, 22)} />
    </MapContainer>
  );
}
