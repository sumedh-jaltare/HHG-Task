"use client";

import { useGeneratorStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "photo", label: "Photo" },
  { id: "make", label: "Make" },
  { id: "export", label: "Export" },
] as const;

export function StudioProgress() {
  const rawImageUrl = useGeneratorStore((s) => s.rawImageUrl);
  const croppedImageUrl = useGeneratorStore((s) => s.croppedImageUrl);

  const done = {
    photo: Boolean(rawImageUrl),
    make: Boolean(croppedImageUrl),
    export: Boolean(croppedImageUrl),
  };

  return (
    <ol className="flex items-center justify-between gap-2">
      {STEPS.map((step, index) => {
        const stamped = done[step.id];
        return (
          <li key={step.id} className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 font-mono text-[10px] font-bold",
                  stamped
                    ? "rotate-[-8deg] border-hh-yellow bg-hh-yellow text-hh-green-900 shadow-stamp-sm"
                    : "border-hh-cream/25 text-hh-cream/40",
                )}
              >
                {stamped ? "✓" : String(index + 1).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "hidden font-mono text-[10px] font-bold uppercase tracking-[0.18em] min-[420px]:inline",
                  stamped ? "text-hh-yellow" : "text-hh-cream/45",
                )}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "h-px flex-1",
                  stamped ? "bg-hh-yellow/50" : "bg-hh-cream/15",
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
