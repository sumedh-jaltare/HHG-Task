"use client";

import {
  ASPECT_BY_FORMAT,
  type GeneratorFormat,
} from "@/lib/image/aspect";
import type { FrameProp, FramePropKind, RingTheme } from "@/lib/canvas/drawFrame";
import { create } from "zustand";

export type { FrameProp, FramePropKind, GeneratorFormat, RingTheme };

export const MAX_FRAME_PROPS = 3;

const PROP_SLOTS: Array<{ x: number; y: number }> = [
  { x: 0.5 + Math.cos(Math.PI / 6) * 0.455, y: 0.5 + Math.sin(Math.PI / 6) * 0.455 },
  { x: 0.5 + Math.cos((210 * Math.PI) / 180) * 0.455, y: 0.5 + Math.sin((210 * Math.PI) / 180) * 0.455 },
  { x: 0.5 + Math.cos(-Math.PI / 2) * 0.455, y: 0.5 + Math.sin(-Math.PI / 2) * 0.455 },
];

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
  setFormat: (format: GeneratorFormat) => void;
  setRawImage: (file: File) => void;
  setCroppedImageUrl: (url: string | null) => void;
  setCropSettings: (partial: Partial<CropSettings>) => void;
  setBuilderDetails: (partial: Partial<BuilderDetails>) => void;
  setRingTheme: (theme: RingTheme) => void;
  addFrameProp: (kind: FramePropKind) => void;
  moveFrameProp: (id: string, x: number, y: number) => void;
  removeFrameProp: (id: string) => void;
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
  frameProps: [],

  setFormat: (format) =>
    set({
      format,
      croppedImageUrl: null,
      frameProps: [],
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
    if (current.length >= MAX_FRAME_PROPS) return;
    const taken = current.map((prop) => `${prop.x.toFixed(2)}:${prop.y.toFixed(2)}`);
    const slot =
      PROP_SLOTS.find((s) => !taken.includes(`${s.x.toFixed(2)}:${s.y.toFixed(2)}`)) ??
      PROP_SLOTS[current.length % PROP_SLOTS.length];
    set({
      frameProps: [
        ...current,
        {
          id: crypto.randomUUID(),
          kind,
          x: slot.x,
          y: slot.y,
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

  removeFrameProp: (id) =>
    set({
      frameProps: get().frameProps.filter((prop) => prop.id !== id),
    }),

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
      frameProps: [],
    });
  },
}));
