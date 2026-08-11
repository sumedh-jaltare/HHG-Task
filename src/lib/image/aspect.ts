export type GeneratorFormat = "frame" | "card";

export const ASPECT_BY_FORMAT: Record<GeneratorFormat, number> = {
  frame: 1,
  card: 3 / 4,
};

export const CROP_OUTPUT_SIZE = 1024;
