"use client";

import { canvasToBlob, downloadBlob } from "@/lib/canvas/exportCanvas";
import { useGeneratorStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Download, Loader2, Share2 } from "lucide-react";
import { useState, type RefObject } from "react";

type ExportActionsProps = {
  canvasRef: RefObject<HTMLCanvasElement>;
  filenamePrefix: "hh-goa-frame" | "hh-goa-builder-id";
  ready?: boolean;
};

const FRAME_CAPTION =
  "Just made my HH Goa 2026 PFP frame 🌴 See you on the beach, builders. #FrameInGoa";

function builderCaption(title: string) {
  const trimmed = title.trim().slice(0, 48);
  const label = trimmed || "untitled builder";
  return `My HH Goa 2026 Builder ID is ready — ${label} incoming. #FrameInGoa`;
}

function isShareAbort(error: unknown) {
  if (!(error instanceof Error)) return false;
  return error.name === "AbortError" || /abort|cancel/i.test(error.message);
}

function canShareImage(file: File) {
  if (typeof navigator === "undefined" || typeof navigator.canShare !== "function") {
    return false;
  }
  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

export function ExportActions({
  canvasRef,
  filenamePrefix,
  ready = true,
}: ExportActionsProps) {
  const title = useGeneratorStore((s) => s.builderDetails.title);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFrame = filenamePrefix === "hh-goa-frame";
  const caption = isFrame ? FRAME_CAPTION : builderCaption(title);
  const busy = downloading || sharing;

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

      if (canShareImage(file) && typeof navigator.share === "function") {
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
      const response = await fetch("/api/upload-share", {
        method: "POST",
        body: form,
      });
      const payload = (await response.json().catch(() => null)) as
        | { url?: string; error?: string }
        | null;
      if (!response.ok || !payload?.url) {
        throw new Error(
          payload?.error ||
            "Couldn't upload that graphic. Just download and post it manually.",
        );
      }

      const sharePage = new URL("/s", window.location.origin);
      sharePage.searchParams.set("img", payload.url);
      sharePage.searchParams.set("caption", caption);
      sharePage.searchParams.set("h", String(canvas.height || (isFrame ? 1080 : 1440)));

      const intent = new URL("https://twitter.com/intent/tweet");
      intent.searchParams.set("text", caption);
      intent.searchParams.set("url", sharePage.toString());
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

  return (
    <div className="space-y-3 pb-[env(safe-area-inset-bottom)]">
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => void handleDownload()}
          disabled={!ready || busy}
          className={cn(
            "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-hh-yellow px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.18em] text-hh-green-900 shadow-stamp transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-stamp-sm active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-x-0 disabled:hover:translate-y-0 sm:flex-1",
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

        <button
          type="button"
          onClick={() => void handleShare()}
          disabled={!ready || busy}
          className={cn(
            "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-hh-pink bg-transparent px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.18em] text-hh-pink shadow-stamp transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-hh-pink hover:text-hh-cream hover:shadow-stamp-sm active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:bg-transparent disabled:hover:text-hh-pink sm:flex-1",
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
