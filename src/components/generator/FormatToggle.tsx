"use client";

import { cn } from "@/lib/utils";
import { useGeneratorStore, type GeneratorFormat } from "@/lib/store";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, type CSSProperties, type PointerEvent } from "react";

const OPTIONS: {
  value: GeneratorFormat;
  label: string;
  kicker: string;
  pin: string;
  rotate: string;
}[] = [
  {
    value: "frame",
    label: "PFP Frame",
    kicker: "A",
    pin: "#E63888",
    rotate: "-2deg",
  },
  {
    value: "card",
    label: "Builder ID",
    kicker: "B",
    pin: "#F4D35E",
    rotate: "2deg",
  },
];

function FormatNote({
  value,
  label,
  kicker,
  pin,
  rotate,
  active,
  onSelect,
}: (typeof OPTIONS)[number] & {
  active: boolean;
  onSelect: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 220, damping: 20 });
  const sy = useSpring(py, { stiffness: 220, damping: 20 });
  const rotateX = useTransform(sy, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-10, 10]);

  const onMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!active) return;
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    px.set((event.clientX - box.left) / box.width - 0.5);
    py.set((event.clientY - box.top) / box.height - 0.5);
  };

  const reset = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div
      className={cn("w-full min-w-0", active && "poster-tilt")}
      style={
        active ? ({ ["--poster-rot" as string]: rotate } as CSSProperties) : undefined
      }
    >
      <motion.button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={active}
        onPointerMove={onMove}
        onPointerLeave={reset}
        style={
          active
            ? { rotateX, rotateY, transformPerspective: 800 }
            : undefined
        }
        whileTap={{ scale: 0.97, x: 2, y: 2 }}
        onClick={onSelect}
        className={cn(
          "relative w-full rounded-sm px-3 pb-2.5 pt-4 text-left shadow-stamp transition-[colors,box-shadow]",
          active
            ? "bg-hh-cream text-hh-green-900 hover:shadow-stamp-sm"
            : "bg-hh-green-700/60 text-hh-cream/80 hover:bg-hh-green-700",
        )}
      >
        <span
          aria-hidden
          className="absolute left-1/2 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full shadow-stamp-sm"
          style={{ backgroundColor: pin, opacity: active ? 1 : 0.45 }}
        />
        <span
          aria-hidden
          className="absolute left-1/2 top-[9px] h-1 w-1 -translate-x-1/2 rounded-full bg-white/40"
          style={{ opacity: active ? 1 : 0 }}
        />
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] opacity-60">
          Format {kicker}
        </span>
        <span className="mt-0.5 block font-display text-base font-black tracking-[-0.03em]">
          {label}
        </span>
      </motion.button>
    </div>
  );
}

export function FormatToggle() {
  const format = useGeneratorStore((s) => s.format);
  const setFormat = useGeneratorStore((s) => s.setFormat);

  return (
    <div
      role="tablist"
      aria-label="Output format"
      className="grid grid-cols-2 gap-3"
    >
      {OPTIONS.map((option) => (
        <FormatNote
          key={option.value}
          {...option}
          active={format === option.value}
          onSelect={() => setFormat(option.value)}
        />
      ))}
    </div>
  );
}
