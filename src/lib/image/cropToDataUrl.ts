import type { Area } from "react-easy-crop";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () =>
      reject(new Error("Couldn't load this photo for cropping.")),
    );
    image.src = src;
  });
}

export async function getCroppedImg(
  imageSrc: string,
  cropPixels: Area,
  outputSize = 1024,
  aspect = 1,
): Promise<string> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const width = outputSize;
  const height = Math.max(1, Math.round(outputSize / aspect));
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Couldn't crop this photo. Try another browser.");
  }

  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    width,
    height,
  );

  return canvas.toDataURL("image/jpeg", 0.95);
}
