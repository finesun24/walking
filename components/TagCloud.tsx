import type { TagCloudEntry } from "@/lib/dashboard";
import { inkAlpha } from "@/lib/ui";

export default function TagCloud({ tagsEmpty, tagCloud }: { tagsEmpty: boolean; tagCloud: TagCloudEntry[] }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "18px 16px", display: "flex", flexDirection: "column", gap: 12, boxShadow: "0 1px 2px rgba(28,27,24,0.06)" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#1C1B18" }}>자주 남긴 태그</div>
      {tagsEmpty ? (
        <div style={{ fontSize: 13, color: inkAlpha(0.45) }}>태그가 더 모이면 보여드릴게요</div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 10px", alignItems: "baseline" }}>
          {tagCloud.map((t) => (
            <span key={t.tag} style={{ fontSize: t.size, fontWeight: 700, color: t.color }}>
              #{t.tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
