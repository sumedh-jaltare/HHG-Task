import { getSiteUrl, parseAllowedBlobImageUrl } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";

type ShareSearch = {
  img?: string;
  og?: string;
  caption?: string;
  h?: string;
};

type SharePageProps = {
  searchParams: ShareSearch;
};

const DEFAULT_TITLE = "HH Goa 2026 — Frame & Builder ID Generator";
const DEFAULT_DESCRIPTION =
  "Upload your photo, get a branded HH Goa 2026 X profile frame or Builder ID card in seconds.";

const OG_WIDTH = 1200;
const OG_HEIGHT = 628;

function shareCaption(raw: string | undefined) {
  return (raw ?? "").trim().slice(0, 280);
}

function shareHeight(raw: string | undefined) {
  return raw === "1440" ? 1440 : 1080;
}

export async function generateMetadata({
  searchParams,
}: SharePageProps): Promise<Metadata> {
  const img = parseAllowedBlobImageUrl(searchParams.img);
  const og = parseAllowedBlobImageUrl(searchParams.og) ?? img;
  const caption = shareCaption(searchParams.caption);
  const title = caption || DEFAULT_TITLE;
  const description = caption || DEFAULT_DESCRIPTION;
  const shareUrl = new URL("/s", getSiteUrl());
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string" && value) {
      shareUrl.searchParams.set(key, value);
    }
  }

  if (!og) {
    return {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      openGraph: {
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        url: shareUrl,
        images: [
          {
            url: "/og-default.png",
            width: OG_WIDTH,
            height: OG_HEIGHT,
            alt: DEFAULT_TITLE,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        images: ["/og-default.png"],
      },
    };
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: shareUrl,
      images: [
        {
          url: og.href,
          width: OG_WIDTH,
          height: OG_HEIGHT,
          alt: caption || "HH Goa 2026 graphic",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [og.href],
    },
  };
}

export default function SharePage({ searchParams }: SharePageProps) {
  const img = parseAllowedBlobImageUrl(searchParams.img);
  const caption = shareCaption(searchParams.caption);
  const height = shareHeight(searchParams.h);
  const isCard = height === 1440;

  return (
    <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-hh-yellow">
        HH Goa 2026
      </p>
      <h1 className="mt-3 font-display text-[clamp(2rem,8vw,3.25rem)] font-black leading-none tracking-[-0.03em] text-hh-yellow">
        {isCard ? "Builder ID" : "PFP Frame"}
      </h1>

      {img ? (
        // Plain <img> so the X crawler sees the graphic with no client JS.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={img.href}
          alt={caption || "HH Goa 2026 graphic"}
          width={1080}
          height={height}
          className={cn(
            "mt-10 w-full max-w-[420px] shadow-stamp",
            isCard
              ? "aspect-[3/4] rounded-2xl"
              : "aspect-square rounded-full",
          )}
        />
      ) : (
        <p className="mt-10 max-w-sm font-mono text-sm leading-relaxed text-hh-cream/70">
          This share link is missing a valid graphic. Make a new frame or
          Builder ID and try again.
        </p>
      )}

      {caption ? (
        <p className="mt-6 max-w-md font-mono text-sm leading-relaxed text-hh-cream">
          {caption}
        </p>
      ) : null}

      <Link
        href="/"
        className="mt-10 inline-flex w-full items-center justify-center rounded-full bg-hh-yellow px-8 py-4 font-mono text-xs font-bold uppercase tracking-[0.18em] text-hh-green-900 shadow-stamp transition-all duration-150 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-stamp-sm active:translate-x-1 active:translate-y-1 active:shadow-none sm:w-auto"
      >
        Make your own →
      </Link>
    </main>
  );
}
