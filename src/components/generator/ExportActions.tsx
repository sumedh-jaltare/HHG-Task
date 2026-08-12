"use client";

import { canvasToBlob, canvasToTwitterOgBlob, downloadBlob, writePngToClipboard } from "@/lib/canvas/exportCanvas";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Download, Loader2, Share2 } from "lucide-react";
import { useEffect, useState, type RefObject } from "react";

type ExportActionsProps = {
  canvasRef: RefObject<HTMLCanvasElement>;
  filenamePrefix: "hh-goa-frame" | "hh-goa-builder-id";
  ready?: boolean;
};

const SHARE_CAPTION =
  "Frame on. Title set. See you in Goa, 28–31 Oct. #FrameInGoa";

function isShareAbort(error: unknown) {
  if (!(error instanceof Error)) return false;
  return error.name === "AbortError" || /abort|cancel/i.test(error.message);
}

function isMobileDevice() {
  return (
    typeof navigator !== "undefined" &&
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  );
}

function canCopyImage() {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.clipboard?.write === "function" &&
    typeof ClipboardItem !== "undefined"
  );
}

function canNativeShare(file: File) {
  if (!isMobileDevice() || typeof navigator.canShare !== "function") {
    return false;
  }
  try {
    return !!navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

export function ExportActions({
  canvasRef,
  filenamePrefix,
  ready = true,
}: ExportActionsProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canCopy, setCanCopy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFrame = filenamePrefix === "hh-goa-frame";
  const caption = SHARE_CAPTION;
  const busy = downloading || sharing || copying;

  useEffect(() => {
    setCanCopy(canCopyImage());
  }, []);

  const handleDownload = async () => {
    const canvas = canvasRef.current;
    if (!canvas || busy) return;
    setError(null);
    setDownloading(true);
    try {
      const blob = await canvasToBlob(canvas);
      downloadBlob(blob, `${filenamePrefix}-${Date.now()}.png`);
      setDownloaded(true);
      window.setTimeout(() => setDownloaded(false), 1800);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Couldn't download that graphic. Try again.",
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas || busy) return;
    setError(null);
    setDownloaded(false);
    setSharing(true);
    try {
      const blob = await canvasToBlob(canvas);
      const file = new File([blob], "hhgoa.png", { type: "image/png" });

      if (canNativeShare(file) && typeof navigator.share === "function") {
        try {
          await navigator.share({ files: [file], text: caption });
          return;
        } catch (caught) {
          if (isShareAbort(caught)) return;
          throw caught;
        }
      }

      const form = new FormData();
      form.append("file", blob, "hhgoa.png");
      const ogBlob = await canvasToTwitterOgBlob(canvas);
      form.append("og", ogBlob, "hhgoa-og.png");
      const response = await fetch("/api/upload-share", {
        method: "POST",
        body: form,
      });
      const payload = (await response.json().catch(() => null)) as
        | { url?: string; ogUrl?: string; error?: string }
        | null;
      if (!response.ok || !payload?.url) {
        throw new Error(
          payload?.error ||
            "Couldn't upload that graphic. Just download and post it manually.",
        );
      }

      const sharePage = new URL("/s", window.location.origin);
      sharePage.searchParams.set("img", payload.url);
      if (payload.ogUrl) {
        sharePage.searchParams.set("og", payload.ogUrl);
      }
      sharePage.searchParams.set("caption", caption);
      sharePage.searchParams.set("h", String(canvas.height || (isFrame ? 1080 : 1440)));

      const intent = new URL("https://twitter.com/intent/tweet");
      // Put the link on its own line (X's separate `url` param often joins mid-line).
      intent.searchParams.set(
        "text",
        `${caption}\n\n${sharePage.toString()}`,
      );
      window.open(intent.toString(), "_blank", "noopener,noreferrer");
    } catch (caught) {
      if (isShareAbort(caught)) return;
      setError(
        caught instanceof Error
          ? caught.message
          : "Couldn't share that graphic. Just download and post it manually.",
      );
    } finally {
      setSharing(false);
    }
  };

  const handleCopy = async () => {
    const canvas = canvasRef.current;
    if (!canvas || busy || !canCopyImage()) return;
    setError(null);
    setCopied(false);
    setCopying(true);
    try {
      // Copy the visible canvas as-is so Clear/White/Green match Download.
      await writePngToClipboard(canvasToBlob(canvas));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Couldn't copy that graphic. Download it instead.",
      );
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="relative w-full space-y-3 pb-[env(safe-area-inset-bottom)]">
      <AnimatePresence>
        {downloaded ? (
          <motion.span
            key="stamp-burst"
            aria-hidden
            initial={{ scale: 1.6, opacity: 0, rotate: -18 }}
            animate={{ scale: 1, opacity: 1, rotate: -8 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 18 }}
            className="pointer-events-none absolute -right-1 -top-8 z-10 font-stamp text-2xl font-extrabold text-hh-pink"
          >
            गोवा
          </motion.span>
        ) : null}
      </AnimatePresence>
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={() => void handleDownload()}
          disabled={!ready || busy}
          className={cn(
            "ticket-stub inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-sm bg-hh-yellow px-3 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-hh-green-900 shadow-stamp transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-stamp-sm active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-x-0 disabled:hover:translate-y-0 sm:px-4",
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            {downloading ? (
              <motion.span
                key="dl-load"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="inline-flex items-center gap-2"
              >
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Saving…
              </motion.span>
            ) : downloaded ? (
              <motion.span
                key="dl-ok"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="inline-flex items-center gap-2"
              >
                <Check className="h-4 w-4" aria-hidden />
                Saved
              </motion.span>
            ) : (
              <motion.span
                key="dl-idle"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="inline-flex items-center gap-2"
              >
                <Download className="h-4 w-4" aria-hidden />
                Download
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {canCopy ? (
          <button
            type="button"
            onClick={() => void handleCopy()}
            disabled={!ready || busy}
            className={cn(
              "ticket-stub inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-sm border-2 border-hh-cream bg-transparent px-3 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-hh-cream shadow-stamp transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-hh-cream hover:text-hh-green-900 hover:shadow-stamp-sm active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:bg-transparent disabled:hover:text-hh-cream sm:px-4",
            )}
          >
            {copying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Copying…
              </>
            ) : copied ? (
              <>
                <Check className="h-4 w-4" aria-hidden />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden />
                Copy Image
              </>
            )}
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => void handleShare()}
          disabled={!ready || busy}
          className={cn(
            "ticket-stub inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-sm border-2 border-hh-pink bg-transparent px-3 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-hh-pink shadow-stamp transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-hh-pink hover:text-hh-cream hover:shadow-stamp-sm active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:bg-transparent disabled:hover:text-hh-pink sm:px-4",
          )}
        >
          {sharing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Sharing…
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" aria-hidden />
              Share to X
            </>
          )}
        </button>
      </div>

      <div aria-live="polite" className="min-h-[1.25rem]">
        {error ? (
          <p className="font-mono text-sm leading-relaxed text-red-300">
            {error}{" "}
            {!/download/i.test(error) ? (
              <span className="text-hh-cream/70">
                Just download and post it manually.
              </span>
            ) : null}
          </p>
        ) : downloaded ? (
          <p className="font-mono text-xs text-hh-yellow">PNG saved to your downloads.</p>
        ) : null}
      </div>
    </div>
  );
}
