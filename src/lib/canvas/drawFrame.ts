export const FRAME_EXPORT_SIZE = 1080;

export type RingTheme = "classic" | "night" | "punch";

export const RING_THEMES: Record<
  RingTheme,
  {
    outer: string;
    inner: string;
    text: string;
    markA: string;
    markB: string;
  }
> = {
  classic: {
    outer: "#F4D35E",
    inner: "#E63888",
    text: "#0D2820",
    markA: "#E63888",
    markB: "#F4D35E",
  },
  night: {
    outer: "#F5EFDF",
    inner: "#2D6A4F",
    text: "#12332A",
    markA: "#1C4735",
    markB: "#F4D35E",
  },
  punch: {
    outer: "#E63888",
    inner: "#F4D35E",
    text: "#0D2820",
    markA: "#F4D35E",
    markB: "#F5EFDF",
  },
};

const TAU = Math.PI * 2;
const ARC_TEXT = "HH GOA 2026";
const photoCache = new Map<string, HTMLImageElement>();
const glyphCache = new Map<string, { widths: number[]; total: number }>();
let fontsReady: Promise<void> | null = null;

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

export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource & { width?: number; naturalWidth?: number; height?: number; naturalHeight?: number },
  cx: number,
  cy: number,
  radius: number,
) {
  const iw = image.naturalWidth ?? image.width ?? 1;
  const ih = image.naturalHeight ?? image.height ?? 1;
  const diameter = radius * 2;
  const srcAspect = iw / ih;
  let dw: number;
  let dh: number;
  if (srcAspect > 1) {
    dh = diameter;
    dw = diameter * srcAspect;
  } else {
    dw = diameter;
    dh = diameter / srcAspect;
  }
  ctx.drawImage(image, cx - dw / 2, cy - dh / 2, dw, dh);
}

function readCanvasFontFamily() {
  if (typeof document === "undefined") {
    return '"Space Mono", ui-monospace, monospace';
  }
  const fromVar = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-space-mono")
    .trim();
  return fromVar || getComputedStyle(document.body).fontFamily;
}

type GlyphLayout = { widths: number[]; total: number };

function measureGlyphs(
  ctx: CanvasRenderingContext2D,
  text: string,
  font: string,
): GlyphLayout {
  const key = `${font}::${text}`;
  const hit = glyphCache.get(key);
  if (hit) return hit;

  ctx.save();
  ctx.font = font;
  const widths = Array.from(text).map((ch) => ctx.measureText(ch).width);
  ctx.restore();
  const tracking = text.length > 1 ? widths[0] * 0.12 : 0;
  const total =
    widths.reduce((sum, w) => sum + w, 0) + tracking * (text.length - 1);
  const layout = { widths, total };
  glyphCache.set(key, layout);
  return layout;
}

export function drawTextOnArc(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  font: string,
) {
  const layout = measureGlyphs(ctx, text, font);
  const tracking = text.length > 1 ? layout.widths[0] * 0.12 : 0;

  ctx.save();
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  let angle = startAngle;
  for (let i = 0; i < text.length; i += 1) {
    const width = layout.widths[i];
    const charAngle = width / radius;
    const mid = angle - charAngle / 2;

    ctx.save();
    ctx.translate(
      centerX + Math.cos(mid) * radius,
      centerY + Math.sin(mid) * radius,
    );
    ctx.rotate(mid - Math.PI / 2);
    ctx.fillText(text[i], 0, 0);
    ctx.restore();

    angle -= charAngle + tracking / radius;
  }
  ctx.restore();
}

function drawPalmMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  rotation: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(size / 80, size / 80);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 36);
  ctx.quadraticCurveTo(-6, 8, 3, -18);
  ctx.stroke();
  const fronds: [number, number][] = [
    [-28, -30],
    [2, -46],
    [30, -28],
    [-22, -6],
    [24, -4],
    [8, 8],
  ];
  for (const [fx, fy] of fronds) {
    ctx.beginPath();
    ctx.moveTo(3, -16);
    ctx.quadraticCurveTo((fx + 3) * 0.45, (fy - 16) * 0.4 - 6, fx, fy);
    ctx.quadraticCurveTo((fx + 3) * 0.55, (fy - 16) * 0.55, 3, -16);
    ctx.fill();
  }
  ctx.restore();
}

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
  ctx.font = `800 ${Math.round(size * 0.28)}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("GOA", 0, 1);
  ctx.restore();
}

function drawSunMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.5, size * 0.06);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.22, 0, TAU);
  ctx.fill();
  for (let i = 0; i < 7; i += 1) {
    const a = (i / 7) * Math.PI - Math.PI * 0.08;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * size * 0.3, Math.sin(a) * size * 0.3);
    ctx.lineTo(Math.cos(a) * size * 0.46, Math.sin(a) * size * 0.46);
    ctx.stroke();
  }
  ctx.restore();
}

export async function drawFrame(
  ctx: CanvasRenderingContext2D,
  photoDataUrl: string,
  size: number,
  ringTheme: RingTheme = "classic",
): Promise<void> {
  const theme = RING_THEMES[ringTheme];
  const cx = size / 2;
  const cy = size / 2;
  const frameWidth = size * 0.045;
  const innerWidth = size * 0.01;
  const photoRadius = size / 2 - frameWidth;
  const fontFamily = readCanvasFontFamily();
  const font = `700 ${Math.round(size * 0.028)}px ${fontFamily}`;

  if (typeof document !== "undefined") {
    fontsReady ??= document.fonts.ready.then(() => undefined);
    await fontsReady;
  }
  const photo = await loadPhoto(photoDataUrl);

  ctx.clearRect(0, 0, size, size);

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, photoRadius, 0, TAU);
  ctx.clip();
  drawImageCover(ctx, photo, cx, cy, photoRadius);
  ctx.restore();

  ctx.save();
  ctx.lineCap = "butt";
  ctx.beginPath();
  ctx.strokeStyle = theme.outer;
  ctx.lineWidth = frameWidth;
  ctx.arc(cx, cy, photoRadius, 0, TAU);
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = theme.inner;
  ctx.lineWidth = innerWidth;
  ctx.arc(cx, cy, photoRadius - frameWidth * 0.28, 0, TAU);
  ctx.stroke();
  ctx.restore();

  const markSize = size * 0.072;
  const markRadius = photoRadius;
  const marks: Array<{ angle: number; kind: "palm" | "stamp" | "sun" }> = [
    { angle: -Math.PI / 2, kind: "palm" },
    { angle: (150 * Math.PI) / 180, kind: "stamp" },
    { angle: (30 * Math.PI) / 180, kind: "sun" },
    { angle: (210 * Math.PI) / 180, kind: "palm" },
  ];

  for (const mark of marks) {
    const x = cx + Math.cos(mark.angle) * markRadius;
    const y = cy + Math.sin(mark.angle) * markRadius;
    if (mark.kind === "palm") {
      drawPalmMark(ctx, x, y, markSize, theme.markA, mark.angle + Math.PI / 2);
    } else if (mark.kind === "stamp") {
      drawStampMark(ctx, x, y, markSize * 0.95, theme.markA, fontFamily);
    } else {
      drawSunMark(ctx, x, y, markSize * 0.85, theme.markB);
    }
  }

  const layout = measureGlyphs(ctx, ARC_TEXT, font);
  const textRadius = photoRadius;
  const totalAngle = layout.total / textRadius;
  const startAngle = Math.PI / 2 + totalAngle / 2;

  ctx.fillStyle = theme.text;
  drawTextOnArc(ctx, ARC_TEXT, cx, cy, textRadius, startAngle, font);
}
