import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type PinnedBoardProps = {
  children: ReactNode;
  className?: string;
  pin?: "pink" | "yellow";
};

export function PinnedBoard({
  children,
  className,
  pin = "pink",
}: PinnedBoardProps) {
  return (
    <div
      className={cn(
        "relative rounded-sm border border-hh-cream/10 bg-hh-green-700/50 px-4 pb-5 pt-8 shadow-stamp",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute left-1/2 top-2 h-4 w-4 -translate-x-1/2 rounded-full shadow-stamp-sm",
          pin === "yellow" ? "bg-hh-yellow" : "bg-hh-pink",
        )}
      />
      <span
        aria-hidden
        className="absolute left-1/2 top-[11px] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/35"
      />
      {children}
    </div>
  );
}

export function EmptyNotice() {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center px-4 py-8 text-center">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hh-yellow">
        Notice board
      </p>
      <p className="mt-2 font-display text-2xl font-black tracking-[-0.03em] text-hh-cream">
        Nothing pinned yet
      </p>
      <p className="mt-3 max-w-[16rem] font-mono text-xs leading-relaxed text-hh-cream/60">
        Drop a photo and lock the crop — your PFP or Builder ID pins here.
      </p>
    </div>
  );
}
