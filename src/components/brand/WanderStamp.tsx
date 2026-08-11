"use client";

import { GoaStamp } from "@/components/brand/GoaStamp";
import { useState } from "react";

const SPOTS = [
  { left: "56%", top: "46%", rotate: "-8deg" },
  { left: "12%", top: "14%", rotate: "7deg" },
  { left: "90%", top: "18%", rotate: "-14deg" },
  { left: "16%", top: "88%", rotate: "11deg" },
  { left: "86%", top: "82%", rotate: "-3deg" },
] as const;

export function WanderStamp() {
  const [index, setIndex] = useState(0);
  const spot = SPOTS[index];

  return (
    <button
      type="button"
      aria-label="Stamp the next spot"
      onClick={() => setIndex((current) => (current + 1) % SPOTS.length)}
      className="absolute z-20 h-[3.6rem] w-[5.8rem] cursor-pointer sm:h-[5rem] sm:w-[8rem]"
      style={{
        left: spot.left,
        top: spot.top,
        transform: `translate(-50%, -50%) rotate(${spot.rotate})`,
      }}
    >
      <GoaStamp className="h-full w-full" />
    </button>
  );
}
