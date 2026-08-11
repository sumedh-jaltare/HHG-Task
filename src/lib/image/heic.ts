export const MAX_IMAGE_BYTES = 25 * 1024 * 1024;

const HEIC_TYPE = /image\/hei[cf]/i;
const HEIC_EXT = /\.hei[cf]$/i;
const RASTER_TYPE = /^image\/(jpeg|jpg|png|webp|gif|bmp|heic|heif)$/i;
const RASTER_EXT = /\.(jpe?g|png|webp|gif|bmp|hei[cf])$/i;

export class HeicConversionError extends Error {
  readonly name = "HeicConversionError";
  constructor(
    message = "Couldn't read this HEIC photo — try exporting it as JPG first or take a new photo in JPEG mode.",
  ) {
    super(message);
  }
}

export class InvalidFileError extends Error {
  readonly name = "InvalidFileError";
  constructor(
    message = "That file isn't a photo we can use. Try a JPG, PNG, WebP, or HEIC.",
  ) {
    super(message);
  }
}

export class FileTooLargeError extends Error {
  readonly name = "FileTooLargeError";
  constructor(
    message = "That photo is over 25MB. Try a smaller file or export it at a lower resolution.",
  ) {
    super(message);
  }
}

export function isHeicFile(file: File): boolean {
  return HEIC_TYPE.test(file.type) || HEIC_EXT.test(file.name);
}

function isRasterImage(file: File): boolean {
  if (file.type) return RASTER_TYPE.test(file.type);
  return RASTER_EXT.test(file.name);
}

async function convertHeicToJpeg(file: File): Promise<Blob> {
  // heic2any's bundled libheif cannot parse iPhone 15 / iOS 18+ HEIF.
  // heic-to tracks current libheif and is loaded only when a HEIC is uploaded.
  const { heicTo } = await import("heic-to/csp");
  return heicTo({
    blob: file,
    type: "image/jpeg",
    quality: 0.92,
  });
}

export async function normalizeImageFile(file: File): Promise<File> {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new FileTooLargeError();
  }

  let next = file;

  if (isHeicFile(file)) {
    try {
      const blob = await convertHeicToJpeg(file);
      const baseName = file.name.replace(HEIC_EXT, "") || "photo";
      next = new File([blob], `${baseName}.jpg`, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
    } catch (error) {
      if (error instanceof HeicConversionError) throw error;
      throw new HeicConversionError();
    }
  }

  if (next.size > MAX_IMAGE_BYTES) {
    throw new FileTooLargeError();
  }

  if (!isRasterImage(next)) {
    throw new InvalidFileError();
  }

  return next;
}
