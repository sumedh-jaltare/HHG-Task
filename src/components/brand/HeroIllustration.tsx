"use client";

import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

type HeroIllustrationProps = {
  className?: string;
};

export function HeroIllustration({ className }: HeroIllustrationProps) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });

  const sunX = useTransform(sx, (v) => v * 14);
  const sunY = useTransform(sy, (v) => v * 10);
  const hillX = useTransform(sx, (v) => v * -8);
  const hillY = useTransform(sy, (v) => v * 5);
  const palmX = useTransform(sx, (v) => v * 18);
  const palmRotate = useTransform(sx, (v) => v * 4);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMove = (event: PointerEvent) => {
      if (reduce.matches) return;
      mx.set((event.clientX / window.innerWidth - 0.5) * 2);
      my.set((event.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my]);

  return (
    <svg
      viewBox="0 0 800 500"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden
      className={cn(className)}
    >
      <defs>
        <radialGradient id="hh-sun" cx="50%" cy="42%" r="62%">
          <stop offset="0%" stopColor="#C9A227" />
          <stop offset="58%" stopColor="#8F7318" />
          <stop offset="100%" stopColor="#5C4A12" />
        </radialGradient>
      </defs>

      <motion.g style={{ x: sunX, y: sunY }} className="origin-center">
        <g
          stroke="#6B5614"
          strokeWidth="1.7"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        >
          <line x1="400" y1="268" x2="400" y2="118" />
          <line x1="338" y1="282" x2="268" y2="168" />
          <line x1="462" y1="282" x2="532" y2="168" />
          <line x1="292" y1="318" x2="188" y2="248" />
          <line x1="508" y1="318" x2="612" y2="248" />
          <line x1="360" y1="258" x2="318" y2="128" />
          <line x1="440" y1="258" x2="482" y2="128" />
          <line x1="400" y1="250" x2="354" y2="96" />
        </g>
        <circle cx="400" cy="428" r="148" fill="url(#hh-sun)" />
      </motion.g>

      <motion.g style={{ x: hillX, y: hillY }}>
        <path
          d="M-30 392
           C70 328 160 348 250 372
           C350 398 430 328 530 348
           C640 370 730 338 840 378
           L840 520 L-30 520 Z"
          fill="#2D6A4F"
        />
        <path
          d="M-30 432
           C90 372 200 396 310 418
           C430 442 520 378 640 404
           C730 424 780 412 840 428
           L840 520 L-30 520 Z"
          fill="#1C4735"
        />
      </motion.g>

      <motion.g style={{ x: palmX, rotate: palmRotate }} fill="#0D2820">
        <path
          d="M96 498 C90 438 112 388 104 338 C100 312 116 288 124 274"
          fill="none"
          stroke="#0D2820"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path d="M124 276 C92 264 58 236 42 204 C78 242 106 264 124 276 Z" />
        <path d="M124 276 C108 248 98 204 106 166 C118 206 124 248 124 276 Z" />
        <path d="M124 276 C138 246 162 208 196 182 C158 216 136 254 124 276 Z" />
        <path d="M124 276 C150 268 188 264 224 256 C180 274 148 278 124 276 Z" />
        <path d="M124 276 C98 280 64 296 36 320 C72 296 102 282 124 276 Z" />
        <path d="M124 276 C144 286 168 312 184 346 C156 312 136 288 124 276 Z" />

        <path
          d="M704 498 C710 438 688 388 696 338 C700 312 684 288 676 274"
          fill="none"
          stroke="#0D2820"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path d="M676 276 C708 264 742 236 758 204 C722 242 694 264 676 276 Z" />
        <path d="M676 276 C692 248 702 204 694 166 C682 206 676 248 676 276 Z" />
        <path d="M676 276 C662 246 638 208 604 182 C642 216 664 254 676 276 Z" />
        <path d="M676 276 C650 268 612 264 576 256 C620 274 652 278 676 276 Z" />
        <path d="M676 276 C702 280 736 296 764 320 C728 296 698 282 676 276 Z" />
        <path d="M676 276 C656 286 632 312 616 346 C644 312 664 288 676 276 Z" />
      </motion.g>
    </svg>
  );
}
