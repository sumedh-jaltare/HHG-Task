"use client";

import { pickRandomTitle } from "@/lib/builderTitles";
import { type CardTheme, useGeneratorStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const CARD_THEME_OPTIONS: { value: CardTheme; label: string }[] = [
  { value: "classic", label: "Classic" },
  { value: "night", label: "Night" },
  { value: "punch", label: "Punch" },
];

export function BuilderForm() {
  const format = useGeneratorStore((s) => s.format);
  const croppedImageUrl = useGeneratorStore((s) => s.croppedImageUrl);
  const details = useGeneratorStore((s) => s.builderDetails);
  const setBuilderDetails = useGeneratorStore((s) => s.setBuilderDetails);
  const cardTheme = useGeneratorStore((s) => s.cardTheme);
  const setCardTheme = useGeneratorStore((s) => s.setCardTheme);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    if (format !== "card") return;
    if (!croppedImageUrl || !details.name.trim() || details.title) return;
    setBuilderDetails({ title: pickRandomTitle() });
  }, [
    format,
    croppedImageUrl,
    details.name,
    details.title,
    setBuilderDetails,
  ]);

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
        <p
          id="builder-title-label"
          className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-hh-cream/60"
        >
          Builder title
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <p
            aria-labelledby="builder-title-label"
            className="min-h-[2.6rem] flex-1 rounded-xl border-2 border-hh-pink/40 bg-hh-green-900 px-3 py-2.5 font-mono text-sm text-hh-cream"
          >
            {details.title || "Add a name, then roll a title"}
          </p>
          <motion.button
            type="button"
            animate={{ rotate: spinning ? 360 : 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => {
              setSpinning(true);
              setBuilderDetails({ title: pickRandomTitle(details.title) });
              window.setTimeout(() => setSpinning(false), 450);
            }}
            className="shrink-0 rounded-sm bg-hh-yellow px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-hh-green-900 shadow-stamp-sm transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          >
            Roll a title
          </motion.button>
        </div>
      </div>
    </div>
  );
}
