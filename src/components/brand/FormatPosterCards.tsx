"use client";

import { SetFormatLink } from "@/components/generator/SetFormatLink";
import type { GeneratorFormat } from "@/lib/store";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, type PointerEvent } from "react";

const CARDS: {
  format: GeneratorFormat;
  kicker: string;
  title: string;
  blurb: string;
  pin: string;
  rotate: string;
}[] = [
  {
    format: "frame",
    kicker: "Format A",
    title: "PFP Frame",
    blurb: "Ring, stickers, your name on the collar.",
    pin: "#E63888",
    rotate: "-2deg",
  },
  {
    format: "card",
    kicker: "Format B",
    title: "Builder ID",
    blurb: "Name, stack, and a beach-ready title.",
    pin: "#F4D35E",
    rotate: "2deg",
  },
];

function TiltCard({
  format,
  kicker,
  title,
  blurb,
  pin,
  rotate,
}: (typeof CARDS)[number]) {
  const ref = useRef<HTMLSpanElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 220, damping: 20 });
  const sy = useSpring(py, { stiffness: 220, damping: 20 });
  const rotateX = useTransform(sy, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-10, 10]);

  const onMove = (event: PointerEvent<HTMLSpanElement>) => {
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
      className="poster-tilt w-full min-w-0 sm:max-w-[22rem] sm:flex-1"
      style={{ ["--poster-rot" as string]: rotate }}
    >
      <SetFormatLink format={format} className="block">
      <motion.span
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={reset}
        style={{ rotateX, rotateY, transformPerspective: 800 }}
        whileTap={{ scale: 0.97, x: 3, y: 3 }}
        className={cn(
          "relative block rounded-sm bg-hh-cream px-6 pb-6 pt-8 text-left shadow-stamp transition-[box-shadow] hover:shadow-stamp-sm",
        )}
      >
        <span
          aria-hidden
          className="absolute left-1/2 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full shadow-stamp-sm"
          style={{ backgroundColor: pin }}
        />
        <span
          aria-hidden
          className="absolute left-1/2 top-[9px] h-1 w-1 -translate-x-1/2 rounded-full bg-white/40"
        />
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-hh-green-500">
          {kicker}
        </span>
        <span className="mt-2 block font-display text-[1.7rem] font-black tracking-[-0.03em] text-hh-green-900">
          {title}
        </span>
        <span className="mt-2 block font-mono text-sm leading-snug text-hh-green-700/80">
          {blurb}
        </span>
        <span className="mt-5 inline-block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-hh-pink">
          Pin this →
        </span>
      </motion.span>
      </SetFormatLink>
    </div>
  );
}

export function FormatPosterCards() {
  return (
    <div className="mt-8 flex w-full max-w-[46rem] flex-col items-stretch justify-center gap-5 sm:mt-10 sm:flex-row sm:items-stretch">
      {CARDS.map((card) => (
        <TiltCard key={card.format} {...card} />
      ))}
    </div>
  );
}
