"use client";

import { ExportActions } from "@/components/generator/ExportActions";
import {
  FRAME_EXPORT_SIZE,
  FRAME_PROP_KINDS,
  STICKER_INKS,
  drawFrame,
  type FramePropKind,
  type RingTheme,
} from "@/lib/canvas/drawFrame";
import { useGeneratorStore } from "@/lib/store";
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
  const name = useGeneratorStore((s) => s.builderDetails.name);
  const frameProps = useGeneratorStore((s) => s.frameProps);
  const moveFrameProp = useGeneratorStore((s) => s.moveFrameProp);
  const removeFrameProp = useGeneratorStore((s) => s.removeFrameProp);
  const selectedPropId = useGeneratorStore((s) => s.selectedFramePropId);
  const setSelectedPropId = useGeneratorStore((s) => s.setSelectedFramePropId);
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
      <div className="relative mx-auto w-full max-w-[320px]">
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
            "mx-auto aspect-square w-full rounded-full shadow-stamp",
            ready ? "opacity-100" : "opacity-0",
          )}
        />
        <div ref={stageRef} className="absolute inset-0 touch-none">
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

export function FrameControls() {
  const format = useGeneratorStore((s) => s.format);
  const croppedImageUrl = useGeneratorStore((s) => s.croppedImageUrl);
  const ringTheme = useGeneratorStore((s) => s.ringTheme);
  const setRingTheme = useGeneratorStore((s) => s.setRingTheme);
  const name = useGeneratorStore((s) => s.builderDetails.name);
  const setBuilderDetails = useGeneratorStore((s) => s.setBuilderDetails);
  const frameProps = useGeneratorStore((s) => s.frameProps);
  const frameInk = useGeneratorStore((s) => s.frameInk);
  const addFrameProp = useGeneratorStore((s) => s.addFrameProp);
  const recolorFrameProp = useGeneratorStore((s) => s.recolorFrameProp);
  const setFrameInk = useGeneratorStore((s) => s.setFrameInk);
  const selectedPropId = useGeneratorStore((s) => s.selectedFramePropId);

  if (format !== "frame" || !croppedImageUrl) return null;

  return (
    <div className="space-y-5 rounded-sm border border-hh-cream/10 bg-hh-green-700/40 p-4">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hh-yellow">
        Stamp kit
      </p>

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
          Stickers — tap to add, drag to place, × to remove
        </legend>
        <div className="flex flex-wrap gap-2">
          {FRAME_PROP_KINDS.map((kind) => (
              <motion.button
                key={kind}
                type="button"
                whileTap={{ scale: 0.9, y: 2 }}
                onClick={() => addFrameProp(kind)}
                className="rounded-full border-2 border-hh-cream/35 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-hh-cream shadow-stamp-sm hover:border-hh-yellow hover:text-hh-yellow"
              >
                {PROP_LABELS[kind]}
              </motion.button>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hh-cream/55">
          {selectedPropId
            ? "Sticker color — tap a swatch to recolor the selected badge"
            : "Sticker color — used for the next badge you add"}
        </legend>
        <div
          role="radiogroup"
          aria-label="Sticker color"
          className="flex flex-wrap gap-2"
        >
          {STICKER_INKS.map((ink) => {
            const selected = selectedPropId
              ? frameProps.find((prop) => prop.id === selectedPropId)?.color ===
                ink.hex
              : frameInk === ink.hex;
            return (
              <motion.button
                key={ink.id}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={ink.label}
                title={ink.label}
                whileTap={{ scale: 0.85 }}
                onClick={() => {
                  setFrameInk(ink.hex);
                  if (selectedPropId) recolorFrameProp(selectedPropId, ink.hex);
                }}
                className={cn(
                  "h-9 w-9 rounded-full border-2 shadow-stamp-sm",
                  selected
                    ? "scale-110 border-hh-yellow"
                    : "border-hh-cream/25 hover:border-hh-cream/60",
                )}
                style={{ backgroundColor: ink.hex }}
              />
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
    </div>
  );
}
