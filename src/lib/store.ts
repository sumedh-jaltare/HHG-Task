"use client";

import {
  ASPECT_BY_FORMAT,
  type GeneratorFormat,
} from "@/lib/image/aspect";
import {
  STICKER_INKS,
  type FrameProp,
  type FramePropKind,
  type RingTheme,
} from "@/lib/canvas/drawFrame";
import { create } from "zustand";

export type { FrameProp, FramePropKind, GeneratorFormat, RingTheme };

const RING_PROP_RADIUS = 0.455;

function slot(
  kind: FramePropKind,
  angleDeg: number,
  color: string,
): FrameProp {
  const angle = (angleDeg * Math.PI) / 180;
  return {
    id: `starter-${kind}`,
    kind,
    color,
    x: 0.5 + Math.cos(angle) * RING_PROP_RADIUS,
    y: 0.5 + Math.sin(angle) * RING_PROP_RADIUS,
  };
}

export function defaultFrameProps(): FrameProp[] {
  return [
    slot("palm", -90, "#E63888"),
    slot("sun", 30, "#F4D35E"),
    slot("wave", 210, "#12332A"),
  ];
}

export type CropSettings = {
  crop: { x: number; y: number };
  zoom: number;
  aspect: number;
};

export type BuilderDetails = {
  name: string;
  role: string;
  title: string;
  handle: string;
};

type GeneratorState = {
  format: GeneratorFormat;
  rawImageFile: File | null;
  rawImageUrl: string | null;
  croppedImageUrl: string | null;
  cropSettings: CropSettings;
  builderDetails: BuilderDetails;
  ringTheme: RingTheme;
  frameProps: FrameProp[];
  frameInk: string;
  setFormat: (format: GeneratorFormat) => void;
  setRawImage: (file: File) => void;
  setCroppedImageUrl: (url: string | null) => void;
  setCropSettings: (partial: Partial<CropSettings>) => void;
  setBuilderDetails: (partial: Partial<BuilderDetails>) => void;
  setRingTheme: (theme: RingTheme) => void;
  addFrameProp: (kind: FramePropKind) => void;
  moveFrameProp: (id: string, x: number, y: number) => void;
  recolorFrameProp: (id: string, color: string) => void;
  removeFrameProp: (id: string) => void;
  setFrameInk: (color: string) => void;
  reset: () => void;
};

const defaultCropSettings: CropSettings = {
  crop: { x: 0, y: 0 },
  zoom: 1,
  aspect: ASPECT_BY_FORMAT.frame,
};

const defaultBuilderDetails: BuilderDetails = {
  name: "",
  role: "",
  title: "",
  handle: "",
};

function revokeIfObjectUrl(url: string | null) {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export const useGeneratorStore = create<GeneratorState>((set, get) => ({
  format: "frame",
  rawImageFile: null,
  rawImageUrl: null,
  croppedImageUrl: null,
  cropSettings: defaultCropSettings,
  builderDetails: defaultBuilderDetails,
  ringTheme: "classic",
  frameProps: defaultFrameProps(),
  frameInk: STICKER_INKS[1].hex,

  setFormat: (format) =>
    set({
      format,
      croppedImageUrl: null,
      frameProps: format === "frame" ? defaultFrameProps() : [],
      cropSettings: {
        crop: { x: 0, y: 0 },
        zoom: 1,
        aspect: ASPECT_BY_FORMAT[format],
      },
    }),

  setRawImage: (file) => {
    revokeIfObjectUrl(get().rawImageUrl);
    set({
      rawImageFile: file,
      rawImageUrl: URL.createObjectURL(file),
      croppedImageUrl: null,
      cropSettings: {
        crop: { x: 0, y: 0 },
        zoom: 1,
        aspect: ASPECT_BY_FORMAT[get().format],
      },
    });
  },

  setCroppedImageUrl: (url) => set({ croppedImageUrl: url }),

  setCropSettings: (partial) =>
    set({
      cropSettings: { ...get().cropSettings, ...partial },
    }),

  setBuilderDetails: (partial) =>
    set({
      builderDetails: { ...get().builderDetails, ...partial },
    }),

  setRingTheme: (ringTheme) => set({ ringTheme }),

  addFrameProp: (kind) => {
    const current = get().frameProps;
    const angle = -Math.PI / 2 + (current.length + 1) * 0.85;
    set({
      frameProps: [
        ...current,
        {
          id: crypto.randomUUID(),
          kind,
          color: get().frameInk,
          x: 0.5 + Math.cos(angle) * RING_PROP_RADIUS,
          y: 0.5 + Math.sin(angle) * RING_PROP_RADIUS,
        },
      ],
    });
  },

  moveFrameProp: (id, x, y) =>
    set({
      frameProps: get().frameProps.map((prop) =>
        prop.id === id
          ? {
              ...prop,
              x: Math.min(0.92, Math.max(0.08, x)),
              y: Math.min(0.92, Math.max(0.08, y)),
            }
          : prop,
      ),
    }),

  recolorFrameProp: (id, color) =>
    set({
      frameProps: get().frameProps.map((prop) =>
        prop.id === id ? { ...prop, color } : prop,
      ),
    }),

  removeFrameProp: (id) =>
    set({
      frameProps: get().frameProps.filter((prop) => prop.id !== id),
    }),

  setFrameInk: (frameInk) => set({ frameInk }),

  reset: () => {
    revokeIfObjectUrl(get().rawImageUrl);
    set({
      format: "frame",
      rawImageFile: null,
      rawImageUrl: null,
      croppedImageUrl: null,
      cropSettings: defaultCropSettings,
      builderDetails: defaultBuilderDetails,
      ringTheme: "classic",
      frameProps: defaultFrameProps(),
      frameInk: STICKER_INKS[1].hex,
    });
  },
}));
