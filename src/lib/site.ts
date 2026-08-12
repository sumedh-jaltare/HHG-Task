const LOCAL_FALLBACK = "http://localhost:3000";

function isLocalOrigin(raw: string) {
  try {
    const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
    return url.hostname === "localhost" || url.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function withHttps(hostOrUrl: string) {
  return hostOrUrl.includes("://") ? hostOrUrl : `https://${hostOrUrl}`;
}

function resolveSiteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  // Ignore a localhost SITE_URL on Vercel — .env.example is often copied into prod.
  if (configured && !(process.env.VERCEL && isLocalOrigin(configured))) {
    return configured;
  }

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return withHttps(production);

  const deployment = process.env.VERCEL_URL?.trim();
  if (deployment) return withHttps(deployment);

  return configured || LOCAL_FALLBACK;
}

export function getSiteUrl() {
  try {
    return new URL(resolveSiteOrigin());
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
