export type GeneratorFormat = "frame" | "card";

/** Layout ratios for Builder ID photo window (relative to card width / height). */
export const CARD_LAYOUT = {
  /** Horizontal margin as fraction of card width. */
  marginX: 0.046,
  /** Horizontal inset of photo from panel edges (total both sides) as fraction of card width. */
  photoInsetX: 0.096,
  /** Photo height as fraction of card height. */
  photoHeightY: 0.52,
  /** Card height / width (3:4 portrait). */
  cardAspectHW: 4 / 3,
} as const;

/** Photo window width / height — crop aspect must match so cover-draw doesn't re-crop. */
export const CARD_PHOTO_ASPECT =
  (1 - 2 * CARD_LAYOUT.marginX - CARD_LAYOUT.photoInsetX) /
  (CARD_LAYOUT.cardAspectHW * CARD_LAYOUT.photoHeightY);

export const ASPECT_BY_FORMAT: Record<GeneratorFormat, number> = {
  frame: 1,
  card: CARD_PHOTO_ASPECT,
};

export const CROP_OUTPUT_SIZE = 1024;
