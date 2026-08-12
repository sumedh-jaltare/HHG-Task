import { canvasFamily, ensureCanvasFonts } from "@/lib/canvas/fonts";

export const FRAME_EXPORT_SIZE = 1080;

export type RingTheme = "classic" | "night" | "punch";

export type FrameBackground = "transparent" | "white" | "green";

export type FramePropKind =
  | "stamp"
  | "palm"
  | "sun"
  | "year"
  | "wave"
  | "starfish"
  | "compass";

export type FrameProp = {
  id: string;
  kind: FramePropKind;
  x: number;
  y: number;
  color?: string;
};

export const STICKER_INKS = [
  { id: "yellow", hex: "#F4D35E", label: "Sunflower" },
  { id: "pink", hex: "#E63888", label: "Stamp" },
  { id: "cream", hex: "#F5EFDF", label: "Cream" },
  { id: "green", hex: "#12332A", label: "Forest" },
] as const;

export const FRAME_PROP_KINDS: FramePropKind[] = [
  "stamp",
  "palm",
  "sun",
  "year",
  "wave",
  "starfish",
  "compass",
];

export const FRAME_BACKGROUNDS: Record<
  Exclude<FrameBackground, "transparent">,
  string
> = {
  white: "#FFFFFF",
  green: "#12332A",
};

/** Marks sit on the outer ring — never paint them the same token as the ring. */
export function contrastMarkColor(
  theme: (typeof RING_THEMES)[RingTheme],
  preferred: "a" | "b" = "a",
) {
  const ground = theme.collar;
  const pick = preferred === "a" ? theme.markA : theme.markB;
  if (pick.toLowerCase() !== ground.toLowerCase()) return pick;
  if (theme.markA.toLowerCase() !== ground.toLowerCase()) return theme.markA;
  if (theme.markB.toLowerCase() !== ground.toLowerCase()) return theme.markB;
  return theme.text;
}

function inkLuma(hex: string) {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export function resolveMarkColor(
  theme: (typeof RING_THEMES)[RingTheme],
  ink?: string,
  preferred: "a" | "b" = "a",
) {
  if (
    ink &&
    ink.toLowerCase() !== theme.collar.toLowerCase() &&
    Math.abs(inkLuma(ink) - inkLuma(theme.collar)) >= 36
  ) {
    return ink;
  }
  return contrastMarkColor(theme, preferred);
}

export const FRAME_NAME_MAX_LENGTH = 20;

export function ringArcText(name: string) {
  const trimmed = name.trim().slice(0, FRAME_NAME_MAX_LENGTH);
  if (!trimmed) return "HH GOA 2026";
  return `HH GOA · ${trimmed.toUpperCase()}`;
}

export const RING_THEMES: Record<
  RingTheme,
  {
    collar: string;
    outer: string;
    inner: string;
    text: string;
    markA: string;
    markB: string;
  }
> = {
  classic: {
    collar: "#F5EFDF",
    outer: "#F4D35E",
    inner: "#E63888",
    text: "#0D2820",
    markA: "#E63888",
    markB: "#12332A",
  },
  night: {
    collar: "#1C4735",
    outer: "#F5EFDF",
    inner: "#F4D35E",
    text: "#F5EFDF",
    markA: "#F4D35E",
    markB: "#F5EFDF",
  },
  punch: {
    collar: "#F5EFDF",
    outer: "#E63888",
    inner: "#F4D35E",
    text: "#0D2820",
    markA: "#E63888",
    markB: "#12332A",
  },
};

const TAU = Math.PI * 2;
const photoCache = new Map<string, HTMLImageElement>();
const glyphCache = new Map<string, { widths: number[]; total: number }>();

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

function drawPalmFrond(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  angle: number,
  length: number,
  girth: number,
) {
  ctx.save();
  ctx.translate(ox, oy);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 1);
  ctx.bezierCurveTo(
    length * 0.22,
    -girth,
    length * 0.62,
    -girth * 0.25,
    length,
    girth * 0.55,
  );
  ctx.bezierCurveTo(
    length * 0.58,
    girth * 1.2,
    length * 0.2,
    girth * 0.75,
    0,
    1,
  );
  ctx.closePath();
  ctx.fill();
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
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(-6, 38);
  ctx.quadraticCurveTo(-9, 16, -3, -2);
  ctx.quadraticCurveTo(2, -16, 1, -22);
  ctx.lineTo(7, -22);
  ctx.quadraticCurveTo(9, -14, 5, 0);
  ctx.quadraticCurveTo(0, 18, 6, 38);
  ctx.closePath();
  ctx.fill();

  const crownX = 4;
  const crownY = -20;
  const fronds: [number, number, number][] = [
    [-2.85, 30, 7],
    [-2.35, 36, 8],
    [-1.85, 40, 9],
    [-1.35, 42, 9],
    [-0.85, 38, 8],
    [-0.35, 34, 8],
    [0.15, 28, 7],
  ];
  for (const [angle, length, girth] of fronds) {
    drawPalmFrond(ctx, crownX, crownY, angle, length, girth);
  }

  ctx.beginPath();
  ctx.arc(crownX - 4, crownY + 5, 3.2, 0, TAU);
  ctx.arc(crownX + 1, crownY + 7, 2.8, 0, TAU);
  ctx.fill();
  ctx.restore();
}

// TECHDEBT: duplicated in drawCard.ts — extract lib/canvas/goaStamp.ts after deadline.
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
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * TAU;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * size * 0.3, Math.sin(a) * size * 0.3);
    ctx.lineTo(Math.cos(a) * size * 0.48, Math.sin(a) * size * 0.48);
    ctx.stroke();
  }
  ctx.restore();
}

function drawYearMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  fontFamily: string,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((-6 * Math.PI) / 180);
  ctx.fillStyle = color;
  ctx.font = `800 ${Math.round(size * 0.34)}px "${fontFamily}"`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("2026", 0, 0);
  ctx.restore();
}

function drawWaveMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2.5, size * 0.08);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const offset of [-size * 0.08, size * 0.1]) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.42, offset);
    ctx.quadraticCurveTo(-size * 0.2, offset - size * 0.2, 0, offset);
    ctx.quadraticCurveTo(size * 0.2, offset + size * 0.2, size * 0.42, offset);
    ctx.stroke();
  }
  ctx.restore();
}

function drawStarfishMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.15);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(1.5, size * 0.04);
  ctx.beginPath();
  for (let i = 0; i < 5; i += 1) {
    const tip = -Math.PI / 2 + (i * TAU) / 5;
    const notch = tip + TAU / 10;
    const tipR = size * 0.46;
    const notchR = size * 0.18;
    const tx = Math.cos(tip) * tipR;
    const ty = Math.sin(tip) * tipR;
    const nx = Math.cos(notch) * notchR;
    const ny = Math.sin(notch) * notchR;
    if (i === 0) ctx.moveTo(tx, ty);
    else ctx.lineTo(tx, ty);
    ctx.lineTo(nx, ny);
  }
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.08, 0, TAU);
  ctx.fillStyle = "rgba(13,40,32,0.2)";
  ctx.fill();
  ctx.restore();
}

function drawCompassMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.055);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.arc(0, 0, size * 0.42, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.3, 0, TAU);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -size * 0.4);
  ctx.lineTo(size * 0.1, 0);
  ctx.lineTo(0, size * 0.4);
  ctx.lineTo(-size * 0.1, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(245,239,223,0.35)";
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.4);
  ctx.lineTo(size * 0.1, 0);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.06, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawKindMark(
  ctx: CanvasRenderingContext2D,
  kind: FramePropKind,
  x: number,
  y: number,
  size: number,
  color: string,
  fontFamily: string,
) {
  if (kind === "palm") {
    drawPalmMark(ctx, x, y, size, color, -0.2);
    return;
  }
  if (kind === "stamp") {
    drawStampMark(ctx, x, y, size, color, fontFamily);
    return;
  }
  if (kind === "sun") {
    drawSunMark(ctx, x, y, size, color);
    return;
  }
  if (kind === "year") {
    drawYearMark(ctx, x, y, size, color, fontFamily);
    return;
  }
  if (kind === "starfish") {
    drawStarfishMark(ctx, x, y, size, color);
    return;
  }
  if (kind === "compass") {
    drawCompassMark(ctx, x, y, size, color);
    return;
  }
  drawWaveMark(ctx, x, y, size, color);
}

export function drawPropMark(
  ctx: CanvasRenderingContext2D,
  kind: FramePropKind,
  x: number,
  y: number,
  size: number,
  color: string,
  fontFamily: string,
) {
  drawKindMark(ctx, kind, x, y, size, color, fontFamily);
}

export type DrawFrameExtras = {
  name?: string;
  placements?: FrameProp[];
  background?: FrameBackground;
};

export async function drawFrame(
  ctx: CanvasRenderingContext2D,
  photoDataUrl: string,
  size: number,
  ringTheme: RingTheme = "classic",
  extras: DrawFrameExtras = {},
): Promise<void> {
  const theme = RING_THEMES[ringTheme];
  const cx = size / 2;
  const cy = size / 2;
  const pad = size * 0.022;
  const outerR = size / 2 - pad;
  const innerR = outerR - size * 0.062;
  const photoRadius = innerR - size * 0.01;
  const fontFamily = canvasFamily("--font-space-mono", "Space Mono");
  const font = `700 ${Math.round(size * 0.026)}px "${fontFamily}"`;

  await ensureCanvasFonts([font]);
  const photo = await loadPhoto(photoDataUrl);

  ctx.clearRect(0, 0, size, size);

  const background = extras.background ?? "transparent";
  if (background !== "transparent") {
    ctx.fillStyle = FRAME_BACKGROUNDS[background];
    ctx.fillRect(0, 0, size, size);
  }

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.arc(cx + size * 0.006, cy + size * 0.008, outerR, 0, TAU);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, photoRadius, 0, TAU);
  ctx.clip();
  drawImageCover(ctx, photo, cx, cy, photoRadius);
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, TAU);
  ctx.arc(cx, cy, innerR, 0, TAU, true);
  ctx.fillStyle = theme.collar;
  ctx.fill();

  ctx.lineCap = "butt";
  ctx.strokeStyle = theme.outer;
  ctx.lineWidth = Math.max(4, size * 0.01);
  ctx.beginPath();
  ctx.arc(cx, cy, outerR - ctx.lineWidth / 2, 0, TAU);
  ctx.stroke();

  ctx.strokeStyle = theme.inner;
  ctx.lineWidth = Math.max(3, size * 0.007);
  ctx.beginPath();
  ctx.arc(cx, cy, innerR + ctx.lineWidth / 2, 0, TAU);
  ctx.stroke();

  ctx.setLineDash([size * 0.012, size * 0.016]);
  ctx.strokeStyle = theme.outer;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = Math.max(1.5, size * 0.0035);
  ctx.beginPath();
  ctx.arc(cx, cy, outerR + size * 0.01, 0, TAU);
  ctx.stroke();
  ctx.restore();

  const stampSize = size * 0.12;
  const propSize = size * 0.11;
  const markRadius = (innerR + outerR) / 2;
  const stampAngle = (150 * Math.PI) / 180;
  drawStampMark(
    ctx,
    cx + Math.cos(stampAngle) * markRadius,
    cy + Math.sin(stampAngle) * markRadius,
    stampSize,
    contrastMarkColor(theme, "a"),
    fontFamily,
  );

  for (const prop of extras.placements ?? []) {
    const preferred =
      prop.kind === "sun" || prop.kind === "wave" || prop.kind === "compass"
        ? "b"
        : "a";
    drawKindMark(
      ctx,
      prop.kind,
      prop.x * size,
      prop.y * size,
      propSize,
      resolveMarkColor(theme, prop.color, preferred),
      fontFamily,
    );
  }

  const arc = ringArcText(extras.name ?? "");
  const layout = measureGlyphs(ctx, arc, font);
  const textRadius = (innerR + outerR) / 2;
  const startAngle = Math.PI / 2 + layout.total / textRadius / 2;

  ctx.fillStyle = theme.text;
  drawTextOnArc(ctx, arc, cx, cy, textRadius, startAngle, font);
}
