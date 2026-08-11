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
          resolve(blob);
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
