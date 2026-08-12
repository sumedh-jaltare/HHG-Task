"use client";

import { suggestBuilderTitle } from "@/lib/builderTitles";
import {
  FRAME_PROP_KINDS,
  STICKER_INKS,
  type FramePropKind,
} from "@/lib/canvas/drawFrame";
import { type CardTheme, useGeneratorStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const CARD_THEME_OPTIONS: { value: CardTheme; label: string }[] = [
  { value: "classic", label: "Classic" },
  { value: "night", label: "Night" },
  { value: "punch", label: "Punch" },
];

const PROP_LABELS: Record<FramePropKind, string> = {
  stamp: "GOA",
  palm: "Palm",
  sun: "Sun",
  year: "2026",
  wave: "Wave",
  starfish: "Star",
  compass: "Compass",
};

export function BuilderForm() {
  const format = useGeneratorStore((s) => s.format);
  const croppedImageUrl = useGeneratorStore((s) => s.croppedImageUrl);
  const details = useGeneratorStore((s) => s.builderDetails);
  const setBuilderDetails = useGeneratorStore((s) => s.setBuilderDetails);
  const cardTheme = useGeneratorStore((s) => s.cardTheme);
  const setCardTheme = useGeneratorStore((s) => s.setCardTheme);
  const frameProps = useGeneratorStore((s) => s.frameProps);
  const frameInk = useGeneratorStore((s) => s.frameInk);
  const addFrameProp = useGeneratorStore((s) => s.addFrameProp);
  const recolorFrameProp = useGeneratorStore((s) => s.recolorFrameProp);
  const setFrameInk = useGeneratorStore((s) => s.setFrameInk);
  const selectedPropId = useGeneratorStore((s) => s.selectedFramePropId);

  if (format !== "card") return null;

  return (
    <div className="space-y-4 rounded-sm border border-hh-cream/15 bg-hh-green-700/40 p-4">
      <fieldset className="space-y-2">
        <legend className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-hh-cream/60">
          Card style
        </legend>
        <div
          role="radiogroup"
          aria-label="Card style"
          className="flex rounded-full border border-hh-cream/20 p-1"
        >
          {CARD_THEME_OPTIONS.map((theme) => {
            const active = cardTheme === theme.value;
            return (
              <button
                key={theme.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setCardTheme(theme.value)}
                className={cn(
                  "flex-1 rounded-full px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] transition-colors",
                  active
                    ? "bg-hh-yellow text-hh-green-900"
                    : "text-hh-cream/75 hover:text-hh-cream",
                )}
              >
                {theme.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <label htmlFor="builder-name" className="block space-y-1.5">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-hh-cream/60">
          Name
        </span>
        <input
          id="builder-name"
          type="text"
          value={details.name}
          maxLength={28}
          placeholder="What should we call you?"
          onChange={(event) => setBuilderDetails({ name: event.target.value })}
          className="w-full rounded-xl border-2 border-hh-cream/20 bg-hh-green-900 px-3 py-2.5 font-mono text-sm text-hh-cream outline-none placeholder:text-hh-cream/35 focus:border-hh-yellow"
        />
      </label>

      <label htmlFor="builder-role" className="block space-y-1.5">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-hh-cream/60">
          Stack / Role
        </span>
        <input
          id="builder-role"
          type="text"
          value={details.role}
          maxLength={24}
          placeholder="Frontend, Solidity, Design…"
          onChange={(event) => setBuilderDetails({ role: event.target.value })}
          className="w-full rounded-xl border-2 border-hh-cream/20 bg-hh-green-900 px-3 py-2.5 font-mono text-sm text-hh-cream outline-none placeholder:text-hh-cream/35 focus:border-hh-yellow"
        />
      </label>

      <label htmlFor="builder-handle" className="block space-y-1.5">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-hh-cream/60">
          X handle
        </span>
        <div className="flex overflow-hidden rounded-xl border-2 border-hh-cream/20 bg-hh-green-900 focus-within:border-hh-yellow">
          <span className="flex items-center px-3 font-mono text-sm text-hh-yellow">
            @
          </span>
          <input
            id="builder-handle"
            type="text"
            value={details.handle}
            maxLength={20}
            placeholder="username"
            autoComplete="username"
            onChange={(event) =>
              setBuilderDetails({
                handle: event.target.value.replace(/^@+/, ""),
              })
            }
            className="w-full bg-transparent py-2.5 pr-3 font-mono text-sm text-hh-cream outline-none placeholder:text-hh-cream/35"
          />
        </div>
      </label>

      <div className="space-y-1.5">
        <label
          htmlFor="builder-title"
          className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-hh-cream/60"
        >
          Builder title
        </label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            id="builder-title"
            type="text"
            value={details.title}
            maxLength={40}
            placeholder="Your builder title"
            onChange={(event) =>
              setBuilderDetails({ title: event.target.value })
            }
            className="min-h-[2.6rem] w-full flex-1 rounded-xl border-2 border-hh-cream/20 bg-hh-green-900 px-3 py-2.5 font-mono text-sm text-hh-cream outline-none placeholder:text-hh-cream/35 focus:border-hh-yellow"
          />
          <button
            type="button"
            onClick={() =>
              setBuilderDetails({
                title: suggestBuilderTitle({
                  name: details.name,
                  role: details.role,
                  exclude: details.title,
                }),
              })
            }
            className="shrink-0 rounded-sm bg-hh-yellow px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-hh-green-900 shadow-stamp-sm transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          >
            Suggest
          </button>
        </div>
      </div>

      {croppedImageUrl ? (
        <div className="space-y-4 border-t border-hh-cream/10 pt-4">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hh-yellow">
            Stamp kit
          </p>

          <fieldset className="space-y-2">
            <legend className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hh-cream/55">
              Stickers — tap to add, drag to place, × to remove
            </legend>
            <div className="flex flex-wrap gap-2">
              {FRAME_PROP_KINDS.map((kind) => (
                <motion.button
                  key={kind}
                  type="button"
                  whileTap={{ scale: 0.9, y: 2 }}
                  onClick={() => addFrameProp(kind)}
                  className="rounded-full border-2 border-hh-cream/35 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-hh-cream shadow-stamp-sm hover:border-hh-yellow hover:text-hh-yellow"
                >
                  {PROP_LABELS[kind]}
                </motion.button>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-hh-cream/55">
              {selectedPropId
                ? "Sticker color — tap a swatch to recolor the selected badge"
                : "Sticker color — used for the next badge you add"}
            </legend>
            <div
              role="radiogroup"
              aria-label="Sticker color"
              className="flex flex-wrap gap-2"
            >
              {STICKER_INKS.map((ink) => {
                const selected = selectedPropId
                  ? frameProps.find((prop) => prop.id === selectedPropId)
                      ?.color === ink.hex
                  : frameInk === ink.hex;
                return (
                  <motion.button
                    key={ink.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={ink.label}
                    title={ink.label}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => {
                      setFrameInk(ink.hex);
                      if (selectedPropId) {
                        recolorFrameProp(selectedPropId, ink.hex);
                      }
                    }}
                    className={cn(
                      "h-9 w-9 rounded-full border-2 shadow-stamp-sm",
                      selected
                        ? "scale-110 border-hh-yellow"
                        : "border-hh-cream/25 hover:border-hh-cream/60",
                    )}
                    style={{ backgroundColor: ink.hex }}
                  />
                );
              })}
            </div>
          </fieldset>
        </div>
      ) : null}
    </div>
  );
}
