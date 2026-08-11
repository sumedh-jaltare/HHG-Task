"use client";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BuilderForm } from "@/components/generator/BuilderForm";
import { CardPreview } from "@/components/generator/CardPreview";
import { CropStage } from "@/components/generator/CropStage";
import { FormatToggle } from "@/components/generator/FormatToggle";
import { FramePreview } from "@/components/generator/FramePreview";
import { UploadZone } from "@/components/generator/UploadZone";
import { useGeneratorStore } from "@/lib/store";

export function GeneratorSection() {
  const rawImageUrl = useGeneratorStore((s) => s.rawImageUrl);
  const croppedImageUrl = useGeneratorStore((s) => s.croppedImageUrl);
  const format = useGeneratorStore((s) => s.format);

  return (
    <section
      id="generator"
      className="relative z-10 min-h-[40vh] border-t-2 border-hh-yellow/15 bg-hh-green-900 px-4 py-16 sm:py-24"
    >
      <div className="mx-auto w-full max-w-xl">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-hh-yellow">
          The studio
        </p>
        <h2 className="mt-3 font-display text-[clamp(2rem,8vw,3.25rem)] font-black leading-none tracking-[-0.03em] text-hh-yellow">
          Build yours
        </h2>
        <p className="mt-4 font-mono text-sm leading-relaxed text-hh-cream/70">
          Pick a format, drop a photo, crop it. The frame and Builder ID land
          next.
        </p>

        <div className="mt-8 space-y-6">
          <FormatToggle />
          <UploadZone />
          {rawImageUrl ? <CropStage /> : null}
          {format === "card" ? <BuilderForm /> : null}
          <div id="canvas-output">
            <ErrorBoundary key={`${format}:${croppedImageUrl ?? "empty"}`}>
              <FramePreview />
              <CardPreview />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </section>
  );
}
