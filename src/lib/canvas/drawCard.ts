import { canvasFamily, ensureCanvasFonts } from "@/lib/canvas/fonts";

export const CARD_EXPORT_WIDTH = 1080;
export const CARD_EXPORT_HEIGHT = 1440;

export type CardDetails = {
  name: string;
  role: string;
  title: string;
  handle: string;
};

const TAU = Math.PI * 2;
const photoCache = new Map<string, HTMLImageElement>();

async function loadPhoto(src: string): Promise<HTMLImageElement> {
  const cached = photoCache.get(src);
  if (cached?.complete && cached.naturalWidth > 0) return cached;

  const image = new Image();
  image.src = src;
  await image.decode();

  if (photoCache.size > 4) {
    const oldest = photoCache.keys().next().value;
    if (oldest) photoCache.delete(oldest);
  }
  photoCache.set(src, image);
  return image;
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function hashPinColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 2 === 0 ? "#E63888" : "#F4D35E";
}

function fillTextSpaced(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  tracking: number,
) {
  const chars = Array.from(text);
  if (chars.length === 0) return;
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const total =
    widths.reduce((sum, w) => sum + w, 0) + tracking * (chars.length - 1);
  let cursor = x - total / 2;
  const prevAlign = ctx.textAlign;
  ctx.textAlign = "left";
  chars.forEach((ch, i) => {
    ctx.fillText(ch, cursor, y);
    cursor += widths[i] + tracking;
  });
  ctx.textAlign = prevAlign;
}

function fitNameSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  family: string,
  maxWidth: number,
  maxSize: number,
  minSize: number,
) {
  let size = maxSize;
  while (size > minSize) {
    ctx.font = `900 ${size}px "${family}"`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 2;
  }
  ctx.font = `900 ${minSize}px "${family}"`;
  return minSize;
}

function drawCoverRect(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource & {
    width?: number;
    height?: number;
    naturalWidth?: number;
    naturalHeight?: number;
  },
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const iw = image.naturalWidth ?? image.width ?? 1;
  const ih = image.naturalHeight ?? image.height ?? 1;
  const srcAspect = iw / ih;
  const dstAspect = w / h;
  let dw: number;
  let dh: number;
  if (srcAspect > dstAspect) {
    dh = h;
    dw = h * srcAspect;
  } else {
    dw = w;
    dh = w / srcAspect;
  }
  ctx.drawImage(image, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function drawSilhouette(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const cx = x + w / 2;
  const headR = w * 0.16;
  ctx.fillStyle = "#2D6A4F";
  ctx.beginPath();
  ctx.arc(cx, y + h * 0.38, headR, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.28, y + h * 0.92);
  ctx.quadraticCurveTo(cx - w * 0.26, y + h * 0.58, cx, y + h * 0.56);
  ctx.quadraticCurveTo(cx + w * 0.26, y + h * 0.58, cx + w * 0.28, y + h * 0.92);
  ctx.closePath();
  ctx.fill();
}

// TECHDEBT: duplicated from drawFrame.ts — extract lib/canvas/goaStamp.ts after deadline.
function drawStampMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  fontFamily: string,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((-8 * Math.PI) / 180);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.06);
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.48, size * 0.32, 0, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.38, size * 0.24, 0, 0, TAU);
  ctx.stroke();
  ctx.font = `800 ${Math.round(size * 0.28)}px "${fontFamily}"`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("GOA", 0, 1);
  ctx.restore();
}

export async function drawCard(
  ctx: CanvasRenderingContext2D,
  photoDataUrl: string | null,
  details: CardDetails,
  width: number,
  height: number,
): Promise<void> {
  const displayFamily = canvasFamily("--font-fraunces", "Fraunces");
  const monoFamily = canvasFamily("--font-space-mono", "Space Mono");

  await ensureCanvasFonts([
    `900 64px "${displayFamily}"`,
    `700 28px "${monoFamily}"`,
    `400 22px "${monoFamily}"`,
  ]);

  const name = details.name.trim() || "YOUR NAME";
  const role = details.role.trim().toUpperCase();
  const title = details.title.trim() || "UNTITLED BUILDER";
  const handle = details.handle.trim().replace(/^@+/, "");

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#12332A";
  ctx.fillRect(0, 0, width, height);

  const margin = width * 0.055;
  const panelX = margin;
  const panelY = margin * 1.15;
  const panelW = width - margin * 2;
  const panelH = height - margin * 2.1;
  const panelR = width * 0.04;

  ctx.fillStyle = "#F5EFDF";
  roundedRect(ctx, panelX, panelY, panelW, panelH, panelR);
  ctx.fill();

  const pinColor = hashPinColor(details.name.trim());
  const pinX = width / 2;
  const pinY = panelY + width * 0.018;
  ctx.beginPath();
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.arc(pinX + 3, pinY + 5, width * 0.018, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = pinColor;
  ctx.arc(pinX, pinY, width * 0.02, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.arc(pinX - width * 0.006, pinY - width * 0.006, width * 0.006, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "#12332A";
  ctx.font = `700 ${Math.round(width * 0.022)}px "${monoFamily}"`;
  ctx.textBaseline = "middle";
  fillTextSpaced(
    ctx,
    "HH GOA · BUILDER ID · 2026",
    width / 2,
    panelY + width * 0.07,
    width * 0.006,
  );

  const photoSize = width * 0.55;
  const photoX = (width - photoSize) / 2;
  const photoY = panelY + width * 0.12;
  const photoR = photoSize * 0.08;
  const border = 8;

  ctx.fillStyle = "rgba(0,0,0,0.25)";
  roundedRect(ctx, photoX + 6, photoY + 6, photoSize, photoSize, photoR);
  ctx.fill();

  ctx.fillStyle = "#E63888";
  roundedRect(ctx, photoX - border / 2, photoY - border / 2, photoSize + border, photoSize + border, photoR + 2);
  ctx.fill();

  ctx.save();
  roundedRect(ctx, photoX, photoY, photoSize, photoSize, photoR);
  ctx.clip();
  ctx.fillStyle = "#1C4735";
  ctx.fillRect(photoX, photoY, photoSize, photoSize);

  if (photoDataUrl) {
    try {
      const photo = await loadPhoto(photoDataUrl);
      drawCoverRect(ctx, photo, photoX, photoY, photoSize, photoSize);
    } catch {
      drawSilhouette(ctx, photoX, photoY, photoSize, photoSize);
    }
  } else {
    drawSilhouette(ctx, photoX, photoY, photoSize, photoSize);
  }
  ctx.restore();

  const textMax = width * 0.85;
  const nameY = photoY + photoSize + width * 0.075;
  const nameSize = fitNameSize(
    ctx,
    name,
    displayFamily,
    textMax,
    width * 0.074,
    width * 0.032,
  );
  ctx.fillStyle = "#0D2820";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `900 ${nameSize}px "${displayFamily}"`;
  ctx.fillText(name, width / 2, nameY);

  let cursorY = nameY + nameSize * 0.85;
  if (role) {
    ctx.fillStyle = "#1C4735";
    ctx.font = `700 ${Math.round(width * 0.024)}px "${monoFamily}"`;
    fillTextSpaced(ctx, role, width / 2, cursorY, width * 0.007);
    cursorY += width * 0.055;
  } else {
    cursorY += width * 0.03;
  }

  let titleSize = Math.round(width * 0.024);
  ctx.font = `700 ${titleSize}px "${monoFamily}"`;
  while (titleSize > width * 0.016 && ctx.measureText(title).width > textMax * 0.82) {
    titleSize -= 1;
    ctx.font = `700 ${titleSize}px "${monoFamily}"`;
  }
  const titleWidth = Math.min(
    textMax,
    ctx.measureText(title).width + width * 0.07,
  );
  const titleH = width * 0.055;
  const titleX = (width - titleWidth) / 2;
  ctx.fillStyle = "#E63888";
  roundedRect(ctx, titleX, cursorY - titleH / 2, titleWidth, titleH, titleH / 2);
  ctx.fill();
  ctx.fillStyle = "#F5EFDF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(title, width / 2, cursorY);

  const footerY = panelY + panelH - width * 0.055;
  ctx.fillStyle = "#12332A";
  ctx.font = `700 ${Math.round(width * 0.02)}px "${monoFamily}"`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  if (handle) {
    ctx.fillText(`@${handle}`, panelX + width * 0.045, footerY - width * 0.042);
  }
  ctx.font = `700 ${Math.round(width * 0.018)}px "${monoFamily}"`;
  fillTextSpaced(
    ctx,
    "GOA, INDIA · 28–31 OCT 2026",
    width / 2 - width * 0.04,
    footerY,
    width * 0.004,
  );

  drawStampMark(
    ctx,
    panelX + panelW - width * 0.08,
    footerY,
    width * 0.1,
    "#E63888",
    monoFamily,
  );
}
