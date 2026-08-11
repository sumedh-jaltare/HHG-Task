const LOCAL_FALLBACK = "http://localhost:3000";

export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || LOCAL_FALLBACK;
  try {
    return new URL(raw);
  } catch {
    return new URL(LOCAL_FALLBACK);
  }
}

const VERCEL_BLOB_HOST = /(\.public)?\.blob\.vercel-storage\.com$/i;

function expectedBlobHostname() {
  const raw = process.env.NEXT_PUBLIC_BLOB_HOSTNAME?.trim();
  if (!raw) return null;
  try {
    if (raw.includes("://")) return new URL(raw).hostname.toLowerCase();
  } catch {
    return null;
  }
  return raw.replace(/\/+$/, "").toLowerCase();
}

/** Only allow Vercel Blob URLs as og:image — never trust an arbitrary query param. */
export function parseAllowedBlobImageUrl(value: string | undefined | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    const host = url.hostname.toLowerCase();
    const expected = expectedBlobHostname();
    if (expected) {
      if (host !== expected) return null;
    } else if (!VERCEL_BLOB_HOST.test(host)) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}
