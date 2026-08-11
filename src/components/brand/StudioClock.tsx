"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type StudioClockProps = {
  className?: string;
};

export function StudioClock({ className }: StudioClockProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const time = now
    ? new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(now)
    : "—:—";

  return (
    <time
      dateTime={now?.toISOString()}
      className={cn(
        "font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-hh-cream/70 sm:text-[11px] sm:tracking-[0.2em]",
        className,
      )}
    >
      {time} IST · Studio
    </time>
  );
}
