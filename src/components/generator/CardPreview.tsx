"use client";

import { ExportActions } from "@/components/generator/ExportActions";
import {
  CARD_EXPORT_HEIGHT,
  CARD_EXPORT_WIDTH,
  CARD_THEMES,
  drawCard,
} from "@/lib/canvas/drawCard";
import { type FramePropKind } from "@/lib/canvas/drawFrame";
import { useGeneratorStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type PointerEvent } from "react";

const PROP_LABELS: Record<FramePropKind, string> = {
  stamp: "GOA",
  palm: "Palm",
  sun: "Sun",
  year: "2026",
  wave: "Wave",
  starfish: "Star",
  compass: "Compass",
};

export function CardPreview() {
  const format = useGeneratorStore((s) => s.format);
  const croppedImageUrl = useGeneratorStore((s) => s.croppedImageUrl);
  const name = useGeneratorStore((s) => s.builderDetails.name);
  const role = useGeneratorStore((s) => s.builderDetails.role);
  const title = useGeneratorStore((s) => s.builderDetails.title);
  const handle = useGeneratorStore((s) => s.builderDetails.handle);
  const cardTheme = useGeneratorStore((s) => s.cardTheme);
  const frameProps = useGeneratorStore((s) => s.frameProps);
  const moveFrameProp = useGeneratorStore((s) => s.moveFrameProp);
  const removeFrameProp = useGeneratorStore((s) => s.removeFrameProp);
  const selectedPropId = useGeneratorStore((s) => s.selectedFramePropId);
  const setSelectedPropId = useGeneratorStore((s) => s.setSelectedFramePropId);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const dragId = useRef<string | null>(null);
  const drawGen = useRef(0);
  const [ready, setReady] = useState(false);
  const [drawError, setDrawError] = useState<Error | null>(null);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 220, damping: 20 });
  const sy = useSpring(py, { stiffness: 220, damping: 20 });
  const rotateX = useTransform(sy, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-10, 10]);

  const onTiltMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragId.current) return;
    const box = tiltRef.current?.getBoundingClientRect();
    if (!box) return;
    px.set((event.clientX - box.left) / box.width - 0.5);
    py.set((event.clientY - box.top) / box.height - 0.5);
  };

  const resetTilt = () => {
    px.set(0);
    py.set(0);
  };

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
            frameProps,
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
    frameProps,
  ]);

  if (drawError) throw drawError;

  if (format !== "card" || !croppedImageUrl) return null;

  const previewMatte = CARD_THEMES[cardTheme].previewMatte;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-5"
    >
      <div
        className="poster-tilt mx-auto w-full max-w-[220px] sm:max-w-[280px]"
        style={{ ["--poster-rot" as string]: "2deg" }}
      >
        <motion.div
          ref={tiltRef}
          onPointerMove={onTiltMove}
          onPointerLeave={resetTilt}
          style={{
            rotateX,
            rotateY,
            transformPerspective: 800,
            backgroundColor: previewMatte,
          }}
          className="relative overflow-hidden rounded-sm shadow-stamp transition-[box-shadow] hover:shadow-stamp-sm"
        >
          {!ready ? (
            <div
              aria-hidden
              className="absolute inset-0 animate-pulse bg-hh-green-700"
            />
          ) : null}
          <canvas
            ref={canvasRef}
            width={CARD_EXPORT_WIDTH}
            height={CARD_EXPORT_HEIGHT}
            className={cn(
              "relative z-[1] mx-auto aspect-[3/4] w-full",
              ready ? "opacity-100" : "opacity-0",
            )}
          />
          <div ref={stageRef} className="absolute inset-0 z-[2] touch-none">
            {frameProps.map((prop) => (
              <div
                key={prop.id}
                className={cn(
                  "absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-start justify-end rounded-full",
                  selectedPropId === prop.id &&
                    "ring-2 ring-hh-yellow ring-offset-2 ring-offset-hh-green-900",
                )}
                style={{ left: `${prop.x * 100}%`, top: `${prop.y * 100}%` }}
              >
                <button
                  type="button"
                  aria-label={`Move ${PROP_LABELS[prop.kind]}`}
                  aria-pressed={selectedPropId === prop.id}
                  className="absolute inset-0 cursor-grab rounded-full active:cursor-grabbing"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    event.currentTarget.setPointerCapture(event.pointerId);
                    dragId.current = prop.id;
                    setSelectedPropId(prop.id);
                    resetTilt();
                  }}
                  onPointerMove={(event) => {
                    if (!dragId.current || !stageRef.current) return;
                    const box = stageRef.current.getBoundingClientRect();
                    moveFrameProp(
                      dragId.current,
                      (event.clientX - box.left) / box.width,
                      (event.clientY - box.top) / box.height,
                    );
                  }}
                  onPointerUp={() => {
                    dragId.current = null;
                  }}
                  onPointerCancel={() => {
                    dragId.current = null;
                  }}
                />
                <button
                  type="button"
                  aria-label={`Remove ${PROP_LABELS[prop.kind]}`}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => removeFrameProp(prop.id)}
                  className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full bg-hh-green-900 text-[10px] font-bold text-hh-yellow"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </motion.div>
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
