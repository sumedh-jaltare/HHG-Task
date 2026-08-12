import { canvasFamily, ensureCanvasFonts } from "@/lib/canvas/fonts";
import { drawPropMark, type FrameProp } from "@/lib/canvas/drawFrame";

export const CARD_EXPORT_WIDTH = 1080;
export const CARD_EXPORT_HEIGHT = 1440;

export type CardDetails = {
  name: string;
  role: string;
  title: string;
  handle: string;
};

export type CardTheme = "classic" | "night" | "punch";

export type CardThemeTokens = {
  field: string;
  panel: string;
  text: string;
  muted: string;
  header: string;
  accent: string;
  hairline: string;
  grid: string;
  photoBorder: string;
  photoFill: string;
  pillBg: string;
  pillFg: string;
  tagBg: string;
  tagFg: string;
  stamp: string;
  silhouette: string;
  pinA: string;
  pinB: string;
};

export const CARD_THEMES: Record<CardTheme, CardThemeTokens> = {
  classic: {
    field: "#12332A",
    panel: "#F5EFDF",
    text: "#0D2820",
    muted: "#1C4735",
    header: "#12332A",
    accent: "#E63888",
    hairline: "#F4D35E",
    grid: "rgba(45, 106, 79, 0.16)",
    photoBorder: "#E63888",
    photoFill: "#1C4735",
    pillBg: "#E63888",
    pillFg: "#F5EFDF",
    tagBg: "#F5EFDF",
    tagFg: "#E63888",
    stamp: "#E63888",
    silhouette: "#2D6A4F",
    pinA: "#E63888",
    pinB: "#F4D35E",
  },
  night: {
    field: "#0D2820",
    panel: "#1C4735",
    text: "#F5EFDF",
    muted: "#F4D35E",
    header: "#F5EFDF",
    accent: "#E63888",
    hairline: "#F4D35E",
    grid: "rgba(245, 239, 223, 0.1)",
    photoBorder: "#F4D35E",
    photoFill: "#0D2820",
    pillBg: "#E63888",
    pillFg: "#F5EFDF",
    tagBg: "#0D2820",
    tagFg: "#F4D35E",
    stamp: "#F4D35E",
    silhouette: "#2D6A4F",
    pinA: "#E63888",
    pinB: "#F4D35E",
  },
  punch: {
    field: "#E63888",
    panel: "#F5EFDF",
    text: "#0D2820",
    muted: "#12332A",
    header: "#12332A",
    accent: "#E63888",
    hairline: "#F4D35E",
    grid: "rgba(230, 56, 136, 0.14)",
    photoBorder: "#12332A",
    photoFill: "#1C4735",
    pillBg: "#12332A",
    pillFg: "#F4D35E",
    tagBg: "#F4D35E",
    tagFg: "#0D2820",
    stamp: "#12332A",
    silhouette: "#2D6A4F",
    pinA: "#F4D35E",
    pinB: "#12332A",
  },
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

function hashPinColor(name: string, theme: CardThemeTokens) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 2 === 0 ? theme.pinA : theme.pinB;
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

function layoutName(
  ctx: CanvasRenderingContext2D,
  text: string,
  family: string,
  maxWidth: number,
  maxSize: number,
  minSize: number,
): { lines: string[]; size: number } {
  ctx.font = `900 ${maxSize}px "${family}"`;
  if (ctx.measureText(text).width <= maxWidth) {
    return { lines: [text], size: maxSize };
  }

  const parts = text.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    let split = 1;
    let best = Infinity;
    for (let i = 1; i < parts.length; i += 1) {
      const left = parts.slice(0, i).join(" ");
      const right = parts.slice(i).join(" ");
      const score = Math.max(
        ctx.measureText(left).width,
        ctx.measureText(right).width,
      );
      if (score < best) {
        best = score;
        split = i;
      }
    }
    const lines = [
      parts.slice(0, split).join(" "),
      parts.slice(split).join(" "),
    ];
    let size = maxSize;
    while (size > minSize) {
      ctx.font = `900 ${size}px "${family}"`;
      if (lines.every((line) => ctx.measureText(line).width <= maxWidth)) {
        return { lines, size };
      }
      size -= 2;
    }
    return { lines, size: minSize };
  }

  let size = maxSize;
  while (size > minSize) {
    ctx.font = `900 ${size}px "${family}"`;
    if (ctx.measureText(text).width <= maxWidth) {
      return { lines: [text], size };
    }
    size -= 2;
  }
  return { lines: [text], size: minSize };
}

function drawPanelGrid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  gridColor: string,
) {
  ctx.save();
  roundedRect(ctx, x, y, w, h, r);
  ctx.clip();
  const step = Math.max(22, w * 0.038);
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let gx = x + step; gx < x + w; gx += step) {
    ctx.moveTo(gx + 0.5, y);
    ctx.lineTo(gx + 0.5, y + h);
  }
  for (let gy = y + step; gy < y + h; gy += step) {
    ctx.moveTo(x, gy + 0.5);
    ctx.lineTo(x + w, gy + 0.5);
  }
  ctx.stroke();
  ctx.restore();
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
  color: string,
) {
  const cx = x + w / 2;
  const headR = w * 0.16;
  ctx.fillStyle = color;
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
  cardTheme: CardTheme = "classic",
  placements: FrameProp[] = [],
): Promise<void> {
  const theme = CARD_THEMES[cardTheme];
  const displayFamily = canvasFamily("--font-fraunces", "Fraunces");
  const monoFamily = canvasFamily("--font-space-mono", "Space Mono");

  await ensureCanvasFonts([
    `900 72px "${displayFamily}"`,
    `700 28px "${monoFamily}"`,
    `400 22px "${monoFamily}"`,
  ]);

  const name = details.name.trim() || "YOUR NAME";
  const role = details.role.trim().toUpperCase();
  const title = details.title.trim() || "UNTITLED BUILDER";
  const handle = details.handle.trim().replace(/^@+/, "");

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = theme.field;
  ctx.fillRect(0, 0, width, height);

  const margin = width * 0.046;
  const panelX = margin;
  const panelY = margin * 1.08;
  const panelW = width - margin * 2;
  const panelH = height - margin * 2.05;
  const panelR = width * 0.034;

  ctx.fillStyle = theme.panel;
  roundedRect(ctx, panelX, panelY, panelW, panelH, panelR);
  ctx.fill();
  drawPanelGrid(ctx, panelX, panelY, panelW, panelH, panelR, theme.grid);

  ctx.strokeStyle = theme.hairline;
  ctx.lineWidth = Math.max(2, width * 0.0035);
  roundedRect(
    ctx,
    panelX + width * 0.012,
    panelY + width * 0.012,
    panelW - width * 0.024,
    panelH - width * 0.024,
    panelR * 0.78,
  );
  ctx.stroke();

  const pinColor = hashPinColor(details.name.trim(), theme);
  const pinX = width / 2;
  const pinY = panelY + width * 0.016;
  ctx.beginPath();
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.arc(pinX + 3, pinY + 5, width * 0.016, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = pinColor;
  ctx.arc(pinX, pinY, width * 0.018, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.arc(pinX - width * 0.005, pinY - width * 0.005, width * 0.005, 0, TAU);
  ctx.fill();

  const headerY = panelY + width * 0.068;
  ctx.fillStyle = theme.header;
  ctx.font = `700 ${Math.round(width * 0.018)}px "${monoFamily}"`;
  ctx.textBaseline = "middle";
  fillTextSpaced(
    ctx,
    "HH GOA · BUILDER ID · 2026",
    width / 2,
    headerY,
    width * 0.005,
  );

  drawStampMark(
    ctx,
    panelX + panelW - width * 0.078,
    headerY,
    width * 0.092,
    theme.stamp,
    monoFamily,
  );

  const photoX = panelX + width * 0.048;
  const photoW = panelW - width * 0.096;
  const photoY = panelY + width * 0.108;
  const photoH = height * 0.52;
  const photoR = width * 0.028;
  const border = Math.max(6, width * 0.008);

  ctx.fillStyle = "rgba(13,40,32,0.22)";
  roundedRect(ctx, photoX + 7, photoY + 8, photoW, photoH, photoR);
  ctx.fill();

  ctx.fillStyle = theme.photoBorder;
  roundedRect(
    ctx,
    photoX - border / 2,
    photoY - border / 2,
    photoW + border,
    photoH + border,
    photoR + 2,
  );
  ctx.fill();

  ctx.save();
  roundedRect(ctx, photoX, photoY, photoW, photoH, photoR);
  ctx.clip();
  ctx.fillStyle = theme.photoFill;
  ctx.fillRect(photoX, photoY, photoW, photoH);

  if (photoDataUrl) {
    try {
      const photo = await loadPhoto(photoDataUrl);
      drawCoverRect(ctx, photo, photoX, photoY, photoW, photoH);
    } catch {
      drawSilhouette(ctx, photoX, photoY, photoW, photoH, theme.silhouette);
    }
  } else {
    drawSilhouette(ctx, photoX, photoY, photoW, photoH, theme.silhouette);
  }
  ctx.restore();

  ctx.strokeStyle = theme.hairline;
  ctx.lineWidth = Math.max(1.5, width * 0.003);
  roundedRect(
    ctx,
    photoX + width * 0.01,
    photoY + width * 0.01,
    photoW - width * 0.02,
    photoH - width * 0.02,
    photoR * 0.72,
  );
  ctx.stroke();

  ctx.save();
  ctx.translate(photoX + width * 0.012, photoY - width * 0.004);
  ctx.rotate((-7 * Math.PI) / 180);
  ctx.font = `700 ${Math.round(width * 0.018)}px "${monoFamily}"`;
  const tag = "#FrameInGoa";
  const tagW = ctx.measureText(tag).width + width * 0.028;
  const tagH = width * 0.036;
  ctx.fillStyle = theme.tagBg;
  roundedRect(ctx, 0, -tagH / 2, tagW, tagH, tagH / 2);
  ctx.fill();
  ctx.strokeStyle = theme.tagFg;
  ctx.lineWidth = Math.max(2, width * 0.003);
  roundedRect(ctx, 0, -tagH / 2, tagW, tagH, tagH / 2);
  ctx.stroke();
  ctx.fillStyle = theme.tagFg;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(tag, tagW / 2, 1);
  ctx.restore();

  const colW = photoW * 0.48;
  const leftX = photoX;
  const rightX = photoX + photoW;
  const footerY = panelY + panelH - width * 0.048;

  const nameLayout = layoutName(
    ctx,
    name,
    displayFamily,
    photoW,
    width * 0.112,
    width * 0.048,
  );
  ctx.font = `900 ${nameLayout.size}px "${displayFamily}"`;
  const nameMetrics = ctx.measureText(nameLayout.lines[0] ?? name);
  const nameAscent =
    nameMetrics.actualBoundingBoxAscent || nameLayout.size * 0.8;
  const nameDescent =
    nameMetrics.actualBoundingBoxDescent || nameLayout.size * 0.22;
  const lineStep = nameAscent + nameDescent + width * 0.008;
  const identityY =
    photoY + photoH + width * 0.062 + nameAscent;

  ctx.fillStyle = theme.text;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  nameLayout.lines.forEach((line, index) => {
    ctx.fillText(line, leftX, identityY + index * lineStep);
  });

  let titleSize = Math.round(width * 0.02);
  ctx.font = `700 ${titleSize}px "${monoFamily}"`;
  while (
    titleSize > width * 0.014 &&
    ctx.measureText(title).width > colW - width * 0.06
  ) {
    titleSize -= 1;
    ctx.font = `700 ${titleSize}px "${monoFamily}"`;
  }
  const titlePadX = width * 0.022;
  const titleW = Math.min(
    colW,
    ctx.measureText(title).width + titlePadX * 2,
  );
  const titleH = width * 0.042;
  const titleY =
    identityY +
    (nameLayout.lines.length - 1) * lineStep +
    nameDescent +
    width * 0.022;
  ctx.fillStyle = theme.pillBg;
  roundedRect(ctx, leftX, titleY, titleW, titleH, titleH / 2);
  ctx.fill();
  ctx.fillStyle = theme.pillFg;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(title, leftX + titleW / 2, titleY + titleH / 2);

  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  let rightY = titleY + titleH / 2;
  if (role) {
    ctx.fillStyle = theme.muted;
    ctx.font = `700 ${Math.round(width * 0.022)}px "${monoFamily}"`;
    ctx.fillText(role, rightX, rightY);
    rightY += width * 0.036;
  }
  if (handle) {
    ctx.fillStyle = theme.header;
    ctx.font = `700 ${Math.round(width * 0.02)}px "${monoFamily}"`;
    ctx.fillText(`@${handle}`, rightX, role ? rightY : titleY + titleH / 2);
  }

  ctx.fillStyle = theme.header;
  ctx.font = `700 ${Math.round(width * 0.016)}px "${monoFamily}"`;
  fillTextSpaced(
    ctx,
    "GOA, INDIA · 28–31 OCT 2026",
    width / 2,
    footerY,
    width * 0.004,
  );

  const propSize = width * 0.1;
  for (const prop of placements) {
    drawPropMark(
      ctx,
      prop.kind,
      prop.x * width,
      prop.y * height,
      propSize,
      prop.color || theme.accent,
      monoFamily,
    );
  }
}
