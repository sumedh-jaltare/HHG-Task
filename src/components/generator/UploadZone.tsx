"use client";

import { normalizeImageFile } from "@/lib/image/heic";
import { useGeneratorStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";

export const IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif";

export function UploadZone() {
  const rawImageUrl = useGeneratorStore((s) => s.rawImageUrl);
  const setRawImage = useGeneratorStore((s) => s.setRawImage);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      setError(null);
      setReading(true);
      try {
        const normalized = await normalizeImageFile(file);
        setRawImage(normalized);
      } catch (caught) {
        const message =
          caught instanceof Error
            ? caught.message
            : "Something went wrong reading that photo. Try another file.";
        setError(message);
      } finally {
        setReading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [setRawImage],
  );

  const openPicker = () => inputRef.current?.click();

  const onDrop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setDragging(false);
    void handleFile(event.dataTransfer.files[0]);
  };

  return (
    <div className="space-y-3">
      <label htmlFor="photo-upload" className="sr-only">
        Upload a photo
      </label>
      <input
        id="photo-upload"
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="sr-only"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />

      {rawImageUrl ? (
        <button
          type="button"
          onClick={openPicker}
          disabled={reading}
          className="rounded-full border-2 border-hh-cream/30 px-5 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-hh-cream transition-colors hover:border-hh-yellow hover:text-hh-yellow disabled:opacity-60"
        >
          {reading ? "Reading your photo…" : "Change photo"}
        </button>
      ) : (
        <motion.button
          type="button"
          onClick={openPicker}
          disabled={reading}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          animate={{ scale: dragging ? 1.02 : 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className={cn(
            "flex min-h-[200px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors",
            dragging
              ? "border-hh-yellow bg-hh-yellow/10"
              : "border-hh-cream/40 bg-hh-green-700/40 hover:border-hh-yellow/70",
          )}
        >
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-hh-yellow">
            {reading ? "Reading your photo…" : "Drop a photo"}
          </span>
          <span className="mt-3 max-w-xs font-mono text-sm leading-relaxed text-hh-cream/70">
            {reading
              ? "Hang tight — converting and checking the file."
              : "JPG, PNG, WebP, or HEIC. Tap to pick from your camera roll."}
          </span>
        </motion.button>
      )}

      {error ? (
        <div
          id="upload-error"
          role="alert"
          className="rounded-xl border-2 border-red-500/80 bg-red-950/40 px-4 py-3"
        >
          <p className="font-mono text-sm leading-relaxed text-hh-cream">
            {error}
          </p>
          <button
            type="button"
            onClick={() => {
              setError(null);
              openPicker();
            }}
            className="mt-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-hh-yellow underline-offset-4 hover:underline"
          >
            Try again
          </button>
        </div>
      ) : null}
    </div>
  );
}
