"use client";

import { cn } from "@/lib/utils";
import { useGeneratorStore, type GeneratorFormat } from "@/lib/store";
import { motion } from "framer-motion";

const OPTIONS: {
  value: GeneratorFormat;
  label: string;
  kicker: string;
  pin: string;
}[] = [
  { value: "frame", label: "PFP Frame", kicker: "A", pin: "#E63888" },
  { value: "card", label: "Builder ID", kicker: "B", pin: "#F4D35E" },
];

export function FormatToggle() {
  const format = useGeneratorStore((s) => s.format);
  const setFormat = useGeneratorStore((s) => s.setFormat);

  return (
    <div
      role="tablist"
      aria-label="Output format"
      className="grid grid-cols-2 gap-3"
    >
      {OPTIONS.map((option) => {
        const active = format === option.value;
        return (
          <motion.button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            whileTap={{ scale: 0.97, x: 2, y: 2 }}
            onClick={() => setFormat(option.value)}
            className={cn(
              "relative rounded-sm px-3 pb-2.5 pt-4 text-left shadow-stamp transition-colors",
              active
                ? "bg-hh-cream text-hh-green-900"
                : "bg-hh-green-700/60 text-hh-cream/80 hover:bg-hh-green-700",
            )}
          >
            <span
              aria-hidden
              className="absolute left-1/2 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full shadow-stamp-sm"
              style={{ backgroundColor: option.pin, opacity: active ? 1 : 0.45 }}
            />
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] opacity-60">
              Format {option.kicker}
            </span>
            <span className="mt-0.5 block font-display text-base font-black tracking-[-0.03em]">
              {option.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
