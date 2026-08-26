import L from "leaflet";

export function moodDivIcon(color: string, size = 26) {
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;transform:rotate(45deg);background:${color};box-shadow:0 2px 6px rgba(0,0,0,0.25);border:2px solid #fff"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
}
