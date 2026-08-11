"use client";

import {
  FRAME_EXPORT_SIZE,
  drawFrame,
  type RingTheme,
} from "@/lib/canvas/drawFrame";
import { useGeneratorStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const THEMES: { value: RingTheme; label: string }[] = [
  { value: "classic", label: "Classic" },
  { value: "night", label: "Night" },
  { value: "punch", label: "Punch" },
];

export function FramePreview() {
  const format = useGeneratorStore((s) => s.format);
  const croppedImageUrl = useGeneratorStore((s) => s.croppedImageUrl);
  const ringTheme = useGeneratorStore((s) => s.ringTheme);
  const setRingTheme = useGeneratorStore((s) => s.setRingTheme);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawGen = useRef(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (format !== "frame" || !croppedImageUrl) {
      setReady(false);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const gen = ++drawGen.current;
    void (async () => {
      const offscreen = document.createElement("canvas");
      offscreen.width = FRAME_EXPORT_SIZE;
      offscreen.height = FRAME_EXPORT_SIZE;
      const offCtx = offscreen.getContext("2d");
      if (!offCtx) return;
      await drawFrame(offCtx, croppedImageUrl, FRAME_EXPORT_SIZE, ringTheme);
      if (drawGen.current !== gen) return;
      ctx.clearRect(0, 0, FRAME_EXPORT_SIZE, FRAME_EXPORT_SIZE);
      ctx.drawImage(offscreen, 0, 0);
      setReady(true);
    })();
  }, [format, croppedImageUrl, ringTheme]);

  if (format !== "frame" || !croppedImageUrl) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-5"
    >
      <div className="relative mx-auto w-full max-w-[420px]">
        {!ready ? (
          <div
            aria-hidden
            className="absolute inset-0 animate-pulse rounded-full bg-hh-green-700"
          />
        ) : null}
        <canvas
          ref={canvasRef}
          width={FRAME_EXPORT_SIZE}
          height={FRAME_EXPORT_SIZE}
          className={cn(
            "mx-auto aspect-square w-full max-w-[420px] rounded-full shadow-stamp",
            ready ? "opacity-100" : "opacity-0",
          )}
        />
      </div>

      <fieldset className="space-y-2">
        <legend className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hh-cream/55">
          Ring color
        </legend>
        <div
          role="radiogroup"
          aria-label="Ring color"
          className="flex rounded-full border border-hh-cream/20 p-1"
        >
          {THEMES.map((theme) => {
            const active = ringTheme === theme.value;
            return (
              <button
                key={theme.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setRingTheme(theme.value)}
                className={cn(
                  "flex-1 rounded-full px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] transition-colors",
                  active
                    ? "bg-hh-yellow text-hh-green-900"
                    : "text-hh-cream/75 hover:text-hh-cream",
                )}
              >
                {theme.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <p className="text-center font-mono text-xs leading-relaxed text-hh-cream/65">
        This is your final PFP — download it or share straight to X below.
      </p>
      <div id="export-actions" />
    </motion.div>
  );
}
