import { GoaStamp } from "@/components/brand/GoaStamp";
import { HeroIllustration } from "@/components/brand/HeroIllustration";
import { GeneratorSection } from "@/components/generator/GeneratorSection";
import { SetFormatLink } from "@/components/generator/SetFormatLink";
import { cn } from "@/lib/utils";

const ctaClass =
  "inline-flex w-full items-center justify-center rounded-full px-8 py-4 font-mono text-xs font-bold uppercase tracking-[0.18em] text-hh-green-900 shadow-stamp transition-all duration-150 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-stamp-sm active:translate-x-1 active:translate-y-1 active:shadow-none sm:w-auto";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-hh-green-700">
      <header className="sticky top-0 z-30 flex w-full max-w-[100vw] items-center justify-between gap-2 border-b border-hh-cream/10 bg-hh-green-700/80 px-3 py-3 backdrop-blur-sm sm:gap-4 sm:px-8">
        <span className="min-w-0 shrink font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-hh-cream sm:shrink-0 sm:text-[11px] sm:tracking-[0.28em]">
          HH GOA<span className="hidden sm:inline"> STUDIO</span>
        </span>
        <nav className="flex shrink-0 items-center gap-2 sm:gap-5">
          <a
            href="#check-hype"
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-hh-cream/80 transition-colors hover:text-hh-yellow sm:tracking-[0.18em]"
          >
            Check Hype
          </a>
          <a
            href="#generator"
            className="rounded-full bg-hh-yellow px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-hh-green-900 shadow-stamp-sm transition-all duration-150 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none sm:px-5 sm:py-2 sm:tracking-[0.16em]"
          >
            Get Started
          </a>
        </nav>
      </header>

      <section className="relative isolate min-h-[calc(100svh-52px)] overflow-hidden">
        <HeroIllustration className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[46%] w-full sm:h-[55%]" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-52px)] max-w-5xl flex-col items-center justify-center px-4 pb-36 pt-8 text-center sm:px-8 sm:pb-40 sm:pt-6">
          <div className="relative">
            <h1 className="headline-display font-display font-black leading-[0.82] tracking-[-0.035em] text-hh-yellow">
              <span className="block origin-center scale-x-[0.92] whitespace-nowrap text-[clamp(1.85rem,9.4vw,5rem)] sm:scale-x-95 sm:text-[clamp(3.25rem,9vw,7.25rem)]">
                HACKER HOUSE
              </span>
              <span className="mt-1 block text-[clamp(2.5rem,12vw,5rem)] sm:mt-0 sm:text-[clamp(3.75rem,10vw,7.25rem)]">
                GOA
              </span>
            </h1>
            <GoaStamp className="absolute left-[56%] top-[46%] z-10 h-[4.4rem] w-[7.1rem] -translate-x-1/2 -translate-y-1/2 sm:h-[6.2rem] sm:w-[10rem] md:h-[7.2rem] md:w-[11.5rem]" />
          </div>

          <p className="mt-8 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-hh-cream sm:mt-10 sm:text-xs">
            GOA, INDIA · 28–31 OCT 2026
          </p>
          <p className="mt-4 max-w-xl text-balance font-mono text-sm leading-relaxed text-hh-cream/80 sm:text-base">
            Your pass to the beach. Upload a photo, get your Builder ID or PFP
            frame in seconds.
          </p>

          <div className="mt-10 flex w-full max-w-md flex-col items-stretch gap-3 sm:mt-12 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4">
            <SetFormatLink
              format="frame"
              className={cn(ctaClass, "bg-hh-yellow")}
            >
              Make my PFP Frame
            </SetFormatLink>
            <SetFormatLink
              format="card"
              className={cn(ctaClass, "bg-hh-cream")}
            >
              Make my Builder ID
            </SetFormatLink>
          </div>
        </div>
      </section>

      <GeneratorSection />

      <div id="check-hype" className="sr-only" />
    </div>
  );
}
