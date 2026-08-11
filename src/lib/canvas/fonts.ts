function readCssVar(name: string) {
  if (typeof document === "undefined") return "";
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

/** First family from a next/font CSS variable (skip the fallback face). */
export function canvasFamily(cssVarName: string, fallback: string) {
  const raw = readCssVar(cssVarName);
  const primary = raw.split(",")[0]?.trim().replace(/^["']|["']$/g, "");
  return primary || fallback;
}

export async function ensureCanvasFonts(specs: string[]) {
  if (typeof document === "undefined") return;
  await document.fonts.ready;
  await Promise.all(specs.map((spec) => document.fonts.load(spec)));
}
