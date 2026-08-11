"use client";

import { ExportActions } from "@/components/generator/ExportActions";
import {
  FRAME_EXPORT_SIZE,
  FRAME_PROP_KINDS,
  RING_THEMES,
  contrastMarkColor,
  drawFrame,
  type FramePropKind,
  type RingTheme,
} from "@/lib/canvas/drawFrame";
import { MAX_FRAME_PROPS, useGeneratorStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const PROP_LABELS: Record<FramePropKind, string> = {
  stamp: "GOA",
  palm: "Palm",
  sun: "Sun",
  year: "2026",
  wave: "Wave",
};

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
  const name = useGeneratorStore((s) => s.builderDetails.name);
  const setBuilderDetails = useGeneratorStore((s) => s.setBuilderDetails);
  const frameProps = useGeneratorStore((s) => s.frameProps);
  const addFrameProp = useGeneratorStore((s) => s.addFrameProp);
  const moveFrameProp = useGeneratorStore((s) => s.moveFrameProp);
  const removeFrameProp = useGeneratorStore((s) => s.removeFrameProp);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragId = useRef<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawGen = useRef(0);
  const [ready, setReady] = useState(false);
  const [drawError, setDrawError] = useState<Error | null>(null);

  useEffect(() => {
    if (format !== "frame" || !croppedImageUrl) {
      setReady(false);
      setDrawError(null);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const gen = ++drawGen.current;
    setDrawError(null);
    void (async () => {
      try {
        const offscreen = document.createElement("canvas");
        offscreen.width = FRAME_EXPORT_SIZE;
        offscreen.height = FRAME_EXPORT_SIZE;
        const offCtx = offscreen.getContext("2d");
        if (!offCtx) {
          throw new Error("Couldn't open a drawing surface for this frame.");
        }
        await drawFrame(offCtx, croppedImageUrl, FRAME_EXPORT_SIZE, ringTheme, {
          name,
          placements: frameProps,
        });
        if (drawGen.current !== gen) return;
        ctx.clearRect(0, 0, FRAME_EXPORT_SIZE, FRAME_EXPORT_SIZE);
        ctx.drawImage(offscreen, 0, 0);
        setReady(true);
      } catch (caught) {
        if (drawGen.current !== gen) return;
        setDrawError(
          caught instanceof Error
            ? caught
            : new Error("Something went wrong rendering your image — try a different photo"),
        );
      }
    })();
  }, [format, croppedImageUrl, ringTheme, name, frameProps]);

  if (drawError) throw drawError;

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
        <div ref={stageRef} className="absolute inset-0 touch-none">
          {frameProps.map((prop) => (
            <div
              key={prop.id}
              className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-start justify-end"
              style={{ left: `${prop.x * 100}%`, top: `${prop.y * 100}%` }}
            >
              <button
                type="button"
                aria-label={`Move ${PROP_LABELS[prop.kind]}`}
                className="absolute inset-0 cursor-grab rounded-full active:cursor-grabbing"
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.currentTarget.setPointerCapture(event.pointerId);
                  dragId.current = prop.id;
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
      </div>

      <label htmlFor="frame-name" className="block space-y-1.5">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hh-cream/55">
          Name on the ring
        </span>
        <input
          id="frame-name"
          type="text"
          value={name}
          maxLength={28}
          placeholder="Optional — shows on the ring"
          onChange={(event) => setBuilderDetails({ name: event.target.value })}
          className="w-full rounded-xl border-2 border-hh-cream/20 bg-hh-green-900 px-3 py-2.5 font-mono text-sm text-hh-cream outline-none placeholder:text-hh-cream/35 focus:border-hh-yellow"
        />
      </label>

      <fieldset className="space-y-2">
        <legend className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hh-cream/55">
          Stickers
          {frameProps.length > 0
            ? ` · ${frameProps.length}/${MAX_FRAME_PROPS}`
            : ""}
        </legend>
        <div className="flex flex-wrap gap-2">
          {FRAME_PROP_KINDS.map((kind) => {
            const theme = RING_THEMES[ringTheme];
            const color = contrastMarkColor(
              theme,
              kind === "sun" || kind === "wave" ? "b" : "a",
            );
            const full = frameProps.length >= MAX_FRAME_PROPS;
            return (
              <button
                key={kind}
                type="button"
                disabled={full}
                onClick={() => addFrameProp(kind)}
                className="rounded-full border-2 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-hh-cream disabled:cursor-not-allowed disabled:opacity-40"
                style={{ borderColor: color, color }}
              >
                {PROP_LABELS[kind]}
              </button>
            );
          })}
        </div>
      </fieldset>

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
      <div id="export-actions">
        <ExportActions
          canvasRef={canvasRef}
          filenamePrefix="hh-goa-frame"
          ready={ready}
        />
      </div>
    </motion.div>
  );
}
