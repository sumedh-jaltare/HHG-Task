"use client";

import {
  ASPECT_BY_FORMAT,
  type GeneratorFormat,
} from "@/lib/image/aspect";
import type { RingTheme } from "@/lib/canvas/drawFrame";
import { create } from "zustand";

export type { GeneratorFormat, RingTheme };

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
  setFormat: (format: GeneratorFormat) => void;
  setRawImage: (file: File) => void;
  setCroppedImageUrl: (url: string | null) => void;
  setCropSettings: (partial: Partial<CropSettings>) => void;
  setBuilderDetails: (partial: Partial<BuilderDetails>) => void;
  setRingTheme: (theme: RingTheme) => void;
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

  setFormat: (format) =>
    set({
      format,
      croppedImageUrl: null,
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
    });
  },
}));
