"use client";

import { cn } from "@/lib/utils";
import { useGeneratorStore, type GeneratorFormat } from "@/lib/store";

const OPTIONS: { value: GeneratorFormat; label: string }[] = [
  { value: "frame", label: "PFP Frame" },
  { value: "card", label: "Builder ID" },
];

export function FormatToggle() {
  const format = useGeneratorStore((s) => s.format);
  const setFormat = useGeneratorStore((s) => s.setFormat);

  return (
    <div
      role="tablist"
      aria-label="Output format"
      className="flex rounded-full border-2 border-hh-cream/20 bg-hh-green-700/60 p-1"
    >
      {OPTIONS.map((option) => {
        const active = format === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setFormat(option.value)}
            className={cn(
              "flex-1 rounded-full px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] transition-colors",
              active
                ? "bg-hh-yellow text-hh-green-900 shadow-stamp-sm"
                : "bg-transparent text-hh-cream/80 hover:text-hh-cream",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
