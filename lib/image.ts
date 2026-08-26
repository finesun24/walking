const MAX_EDGE = 1600;

export interface ResizedImage {
  blob: Blob;
  width: number;
  height: number;
}

export async function resizeToWebp(file: File, maxEdge = MAX_EDGE): Promise<ResizedImage> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas context를 가져올 수 없어요");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("이미지 변환에 실패했어요"))),
      "image/webp",
      0.85
    );
  });

  return { blob, width, height };
}
