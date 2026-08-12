"use client";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BuilderForm } from "@/components/generator/BuilderForm";
import { CardPreview } from "@/components/generator/CardPreview";
import { CropStage } from "@/components/generator/CropStage";
import { FormatToggle } from "@/components/generator/FormatToggle";
import { FrameControls, FramePreview } from "@/components/generator/FramePreview";
import { EmptyNotice, PinnedBoard } from "@/components/generator/PinnedBoard";
import { StudioProgress } from "@/components/generator/StudioProgress";
import { UploadZone } from "@/components/generator/UploadZone";
import { useGeneratorStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function GeneratorSection() {
  const rawImageUrl = useGeneratorStore((s) => s.rawImageUrl);
  const croppedImageUrl = useGeneratorStore((s) => s.croppedImageUrl);
  const format = useGeneratorStore((s) => s.format);

  return (
    <section
      id="generator"
      className={cn(
        "relative z-10 min-h-[40vh] w-full border-t-2 border-hh-yellow/15",
        croppedImageUrl &&
          "max-md:pb-[calc(5.25rem+env(safe-area-inset-bottom))]",
      )}
    >
      <div className="grid w-full md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
        <div className="order-1 space-y-5 px-page py-10 sm:py-14 md:col-start-1 md:order-none">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-hh-yellow">
              The studio
            </p>
            <h2 className="mt-2 font-display text-[clamp(1.85rem,5vw,2.75rem)] font-black leading-none tracking-[-0.03em] text-hh-yellow">
              Build yours
            </h2>
            <p className="mt-4 max-w-xl font-mono text-sm leading-relaxed text-hh-cream/70">
              Pin a format, drop a photo, crop it. The frame and Builder ID
              land on the board.
            </p>
          </div>
          <StudioProgress />
          <FormatToggle />
          <UploadZone />
          {rawImageUrl ? <CropStage /> : null}
        </div>

        <aside className="order-3 z-20 self-start md:sticky md:top-[max(4.5rem,env(safe-area-inset-top))] md:col-start-2 md:row-span-2 md:row-start-1 md:order-none">
          <PinnedBoard
            pin={format === "card" ? "yellow" : "pink"}
            className="rounded-none border-x-0 px-page pb-5 pt-7 md:min-h-full md:border-l md:border-r-0 md:bg-hh-green-700/50"
          >
            <div id="canvas-output">
              {!croppedImageUrl ? <EmptyNotice /> : null}
              <ErrorBoundary key={`${format}:${croppedImageUrl ?? "empty"}`}>
                <FramePreview />
                <CardPreview />
              </ErrorBoundary>
            </div>
          </PinnedBoard>
        </aside>

        <div
          className={cn(
            "order-2 min-w-0 space-y-5 px-page pb-10 pt-6 md:col-start-1 md:order-none md:pb-16 md:pt-0",
            croppedImageUrl && "max-md:pb-28",
          )}
        >
          {format === "card" ? <BuilderForm /> : null}
          <FrameControls />
        </div>
      </div>
    </section>
  );
}
