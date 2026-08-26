export type CaptionStatus = "pending" | "done" | "failed";

export interface Pin {
  id: string;
  user_id: string;
  image_path: string;
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  taken_at: string;
  user_note: string | null;
  caption: string | null;
  tags: string[];
  mood: string | null;
  caption_status: CaptionStatus;
  created_at: string;
}

export const PIN_COLUMNS =
  "id,user_id,image_path,lat,lng,accuracy,taken_at,user_note,caption,tags,mood,caption_status,created_at";
