"use client";

import { ExportActions } from "@/components/generator/ExportActions";
import {
  CARD_EXPORT_HEIGHT,
  CARD_EXPORT_WIDTH,
  drawCard,
} from "@/lib/canvas/drawCard";
import { useGeneratorStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function CardPreview() {
  const format = useGeneratorStore((s) => s.format);
  const croppedImageUrl = useGeneratorStore((s) => s.croppedImageUrl);
  const name = useGeneratorStore((s) => s.builderDetails.name);
  const role = useGeneratorStore((s) => s.builderDetails.role);
  const title = useGeneratorStore((s) => s.builderDetails.title);
  const handle = useGeneratorStore((s) => s.builderDetails.handle);
  const cardTheme = useGeneratorStore((s) => s.cardTheme);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawGen = useRef(0);
  const [ready, setReady] = useState(false);
  const [drawError, setDrawError] = useState<Error | null>(null);

  useEffect(() => {
    if (format !== "card" || !croppedImageUrl) {
      setReady(false);
      setDrawError(null);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const gen = ++drawGen.current;
    setDrawError(null);
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const offscreen = document.createElement("canvas");
          offscreen.width = CARD_EXPORT_WIDTH;
          offscreen.height = CARD_EXPORT_HEIGHT;
          const offCtx = offscreen.getContext("2d");
          if (!offCtx) {
            throw new Error("Couldn't open a drawing surface for this card.");
          }
          await drawCard(
            offCtx,
            croppedImageUrl,
            { name, role, title, handle },
            CARD_EXPORT_WIDTH,
            CARD_EXPORT_HEIGHT,
            cardTheme,
          );
          if (drawGen.current !== gen) return;
          ctx.clearRect(0, 0, CARD_EXPORT_WIDTH, CARD_EXPORT_HEIGHT);
          ctx.drawImage(offscreen, 0, 0);
          setReady(true);
        } catch (caught) {
          if (drawGen.current !== gen) return;
          setDrawError(
            caught instanceof Error
              ? caught
              : new Error(
                  "Something went wrong rendering your image — try a different photo",
                ),
          );
        }
      })();
    }, 80);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    format,
    croppedImageUrl,
    name,
    role,
    title,
    handle,
    cardTheme,
  ]);

  if (drawError) throw drawError;

  if (format !== "card" || !croppedImageUrl) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-5"
    >
      <div className="relative mx-auto w-full max-w-[280px]">
        {!ready ? (
          <div
            aria-hidden
            className="absolute inset-0 animate-pulse rounded-2xl bg-hh-green-700"
          />
        ) : null}
        <canvas
          ref={canvasRef}
          width={CARD_EXPORT_WIDTH}
          height={CARD_EXPORT_HEIGHT}
          className={cn(
            "mx-auto aspect-[3/4] w-full rounded-sm shadow-stamp",
            ready ? "opacity-100" : "opacity-0",
          )}
        />
      </div>
      <p className="text-center font-mono text-xs leading-relaxed text-hh-cream/65">
        This is your Builder ID — download it or share straight to X below.
      </p>
      <div id="export-actions">
        <ExportActions
          canvasRef={canvasRef}
          filenamePrefix="hh-goa-builder-id"
          ready={ready}
        />
      </div>
    </motion.div>
  );
}
