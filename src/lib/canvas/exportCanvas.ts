export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = "image/png",
  quality = 0.95,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error(
                "Couldn't export this graphic — the canvas came back empty. Try again in a moment.",
              ),
            );
            return;
          }
          // Re-wrap so the MIME type is always explicit for clipboard consumers.
          resolve(new Blob([blob], { type: blob.type || type }));
        },
        type,
        quality,
      );
    } catch (caught) {
      reject(
        caught instanceof Error
          ? caught
          : new Error("Couldn't export this graphic. Try a different photo."),
      );
    }
  });
}

/** ClipboardItem must receive a Promise when blob creation is async (Safari + alpha). */
export async function writePngToClipboard(blobOrPromise: Blob | Promise<Blob>) {
  const pngPromise = Promise.resolve(blobOrPromise).then(
    (blob) => new Blob([blob], { type: "image/png" }),
  );
  await navigator.clipboard.write([
    new ClipboardItem({ "image/png": pngPromise }),
  ]);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/** X summary_large_image is ~1.91:1 (1200×628). Letterbox the export so nothing is cropped. */
export async function canvasToTwitterOgBlob(
  source: HTMLCanvasElement,
): Promise<Blob> {
  const OG_W = 1200;
  const OG_H = 628;
  const og = document.createElement("canvas");
  og.width = OG_W;
  og.height = OG_H;
  const ctx = og.getContext("2d");
  if (!ctx) {
    throw new Error("Couldn't build the X preview image.");
  }

  ctx.fillStyle = "#12332A";
  ctx.fillRect(0, 0, OG_W, OG_H);

  const pad = 28;
  const maxW = OG_W - pad * 2;
  const maxH = OG_H - pad * 2;
  const scale = Math.min(maxW / source.width, maxH / source.height);
  const dw = source.width * scale;
  const dh = source.height * scale;
  const dx = (OG_W - dw) / 2;
  const dy = (OG_H - dh) / 2;
  ctx.drawImage(source, dx, dy, dw, dh);

  return canvasToBlob(og);
}
