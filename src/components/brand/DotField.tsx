"use client";

import { useEffect, useRef } from "react";

const GRID = 14;
const OFFSET = 7;
const BASE_R = 1;
const MAX_SCALE = 4;
const RADIUS = 95;
const RADIUS_SQ = RADIUS * RADIUS;
const LERP = 1;
const IDLE_EPS = 0.08;

const CREAM = { r: 245, g: 239, b: 223, a: 0.07 };
const GOLD = { r: 244, g: 211, b: 94, a: 0.04 };

function falloff(distSq: number) {
  if (distSq >= RADIUS_SQ) return 0;
  const t = 1 - Math.sqrt(distSq) / RADIUS;
  return t * t * (3 - 2 * t);
}

export function DotField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let running = true;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let targetX = -9999;
    let targetY = -9999;
    let cursorX = -9999;
    let cursorY = -9999;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawLayer = (
      originX: number,
      originY: number,
      color: typeof CREAM,
      cx: number,
      cy: number,
    ) => {
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      const minX = cx - RADIUS;
      const maxX = cx + RADIUS;
      const minY = cy - RADIUS;
      const maxY = cy + RADIUS;

      const startCol = Math.floor((minX + scrollX - originX) / GRID) - 1;
      const endCol = Math.ceil((maxX + scrollX - originX) / GRID) + 1;
      const startRow = Math.floor((minY + scrollY - originY) / GRID) - 1;
      const endRow = Math.ceil((maxY + scrollY - originY) / GRID) + 1;

      for (let col = startCol; col <= endCol; col += 1) {
        for (let row = startRow; row <= endRow; row += 1) {
          const x = col * GRID + originX - scrollX;
          const y = row * GRID + originY - scrollY;
          const dx = x - cx;
          const dy = y - cy;
          const distSq = dx * dx + dy * dy;
          const t = falloff(distSq);
          if (t <= 0.001) continue;

          const scale = 1 + (MAX_SCALE - 1) * t;
          const radius = BASE_R * scale;
          const alpha = color.a + (0.14 - color.a) * t;

          ctx.beginPath();
          ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${alpha})`;
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const frame = () => {
      if (!running) return;

      cursorX += (targetX - cursorX) * LERP;
      cursorY += (targetY - cursorY) * LERP;

      const settled =
        Math.abs(targetX - cursorX) < IDLE_EPS &&
        Math.abs(targetY - cursorY) < IDLE_EPS;

      ctx.clearRect(0, 0, width, height);

      if (cursorX > -4000) {
        drawLayer(0, 0, CREAM, cursorX, cursorY);
        drawLayer(OFFSET, OFFSET, GOLD, cursorX, cursorY);
      }

      if (!settled) {
        raf = window.requestAnimationFrame(frame);
      } else {
        raf = 0;
      }
    };

    const kick = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(frame);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      targetX = event.clientX;
      targetY = event.clientY;
      kick();
    };

    const onLeave = () => {
      targetX = -9999;
      targetY = -9999;
      kick();
    };

    resize();
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener("blur", onLeave);
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", kick, { passive: true });

    return () => {
      running = false;
      window.cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", kick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}
