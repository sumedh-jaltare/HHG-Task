"use client";

import { ASPECT_BY_FORMAT, CROP_OUTPUT_SIZE } from "@/lib/image/aspect";
import { getCroppedImg } from "@/lib/image/cropToDataUrl";
import { useGeneratorStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { useCallback, useEffect, useRef, useState } from "react";

export function CropStage() {
  const format = useGeneratorStore((s) => s.format);
  const rawImageUrl = useGeneratorStore((s) => s.rawImageUrl);
  const croppedImageUrl = useGeneratorStore((s) => s.croppedImageUrl);
  const cropSettings = useGeneratorStore((s) => s.cropSettings);
  const setCropSettings = useGeneratorStore((s) => s.setCropSettings);
  const setCroppedImageUrl = useGeneratorStore((s) => s.setCroppedImageUrl);

  const [cropPixels, setCropPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [frameHeight, setFrameHeight] = useState(360);

  const aspect = ASPECT_BY_FORMAT[format];

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const apply = () => {
      const width = el.clientWidth;
      if (!width) return;
      setFrameHeight(Math.min(340, Math.round(width / aspect)));
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => observer.disconnect();
  }, [aspect, rawImageUrl, croppedImageUrl]);

  useEffect(() => {
    setCropPixels(null);
  }, [format, rawImageUrl]);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCropPixels(croppedAreaPixels);
  }, []);

  const applyCrop = async () => {
    if (!rawImageUrl || !cropPixels) return;
    setBusy(true);
    setError(null);
    try {
      const dataUrl = await getCroppedImg(
        rawImageUrl,
        cropPixels,
        CROP_OUTPUT_SIZE,
        aspect,
      );
      setCroppedImageUrl(dataUrl);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Couldn't apply that crop. Try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (!rawImageUrl) return null;

  if (croppedImageUrl) {
    return (
      <div className="flex items-center gap-4 rounded-sm border border-hh-cream/15 bg-hh-green-700/50 p-3">
        <div className="shrink-0 rotate-[-3deg] bg-hh-cream p-1 shadow-stamp">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={croppedImageUrl}
            alt="Cropped preview"
            className={cn(
              "object-cover",
              format === "frame"
                ? "h-16 w-16 rounded-full"
                : "h-14 w-[4.1rem] rounded-sm",
            )}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-hh-yellow">
            Crop locked
          </p>
          <p className="mt-1 font-mono text-xs text-hh-cream/65">
            {format === "frame" ? "1:1 frame" : "Builder photo"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCroppedImageUrl(null)}
          className="shrink-0 rounded-full bg-hh-cream px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-hh-green-900 shadow-stamp-sm transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
        >
          Re-crop
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        ref={frameRef}
        className="crop-stage-frame"
        style={{ height: frameHeight }}
      >
        <Cropper
          image={rawImageUrl}
          crop={cropSettings.crop}
          zoom={cropSettings.zoom}
          aspect={aspect}
          minZoom={1}
          maxZoom={3}
          cropShape={format === "frame" ? "round" : "rect"}
          showGrid={false}
          objectFit="contain"
          onCropChange={(crop) => setCropSettings({ crop })}
          onZoomChange={(zoom) => setCropSettings({ zoom })}
          onCropComplete={onCropComplete}
          style={{
            containerStyle: {
              width: "100%",
              height: "100%",
              backgroundColor: "#0D2820",
            },
            cropAreaStyle: {
              border: "2px solid #F4D35E",
              color: "rgba(13, 40, 32, 0.62)",
            },
          }}
        />
      </div>

      <label className="block">
        <span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hh-cream/60">
          Zoom · film strip
        </span>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={cropSettings.zoom}
          onChange={(event) =>
            setCropSettings({ zoom: Number(event.target.value) })
          }
          className="crop-zoom w-full"
        />
      </label>

      {error ? (
        <p role="alert" className="font-mono text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => void applyCrop()}
        disabled={busy || !cropPixels}
        className="stamp-slam w-full rounded-sm bg-hh-yellow px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.18em] text-hh-green-900 shadow-stamp transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-stamp-sm active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Stamping…" : "Stamp this crop"}
      </button>
    </div>
  );
}
