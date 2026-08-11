"use client";

import { useGeneratorStore, type GeneratorFormat } from "@/lib/store";
import type { ReactNode } from "react";

type SetFormatLinkProps = {
  format: GeneratorFormat;
  href?: string;
  className?: string;
  children: ReactNode;
};

export function SetFormatLink({
  format,
  href = "#generator",
  className,
  children,
}: SetFormatLinkProps) {
  const setFormat = useGeneratorStore((s) => s.setFormat);

  return (
    <a href={href} className={className} onClick={() => setFormat(format)}>
      {children}
    </a>
  );
}
