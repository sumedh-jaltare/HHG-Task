import { DotField } from "@/components/brand/DotField";
import { FormatPosterCards } from "@/components/brand/FormatPosterCards";
import { WanderStamp } from "@/components/brand/WanderStamp";
import { HeroIllustration } from "@/components/brand/HeroIllustration";
import { StudioClock } from "@/components/brand/StudioClock";
import { GeneratorSection } from "@/components/generator/GeneratorSection";

export default function Home() {
  return (
    <div className="studio-cork relative min-h-svh w-full overflow-x-clip bg-hh-green-700">
      <DotField />
      <header className="sticky top-0 z-30 flex w-full items-center justify-between gap-2 border-b border-hh-cream/10 bg-hh-green-700/80 px-page-sm py-3 backdrop-blur-sm sm:gap-4">
        <span className="min-w-0 shrink font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-hh-cream sm:shrink-0 sm:tracking-[0.28em]">
          HH GOA<span className="hidden sm:inline"> STUDIO</span>
        </span>
        <StudioClock className="hidden min-[700px]:inline" />
        <nav className="flex shrink-0 items-center gap-2 sm:gap-5">
          <a
            href="#generator"
            className="rounded-full bg-hh-yellow px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-hh-green-900 shadow-stamp-sm transition-all duration-150 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none sm:px-5 sm:py-2 sm:tracking-[0.16em]"
          >
            The Studio
          </a>
        </nav>
      </header>

      <section className="relative isolate min-h-[calc(100svh-52px)] w-full overflow-hidden">
        <HeroIllustration className="pointer-events-none absolute inset-0 -z-10 h-full w-full" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-52px)] w-full max-w-3xl flex-col items-center justify-center px-page pb-[max(5rem,env(safe-area-inset-bottom))] pt-8 text-center sm:pt-6">
          <StudioClock className="mb-3 min-[700px]:hidden" />
          <div className="relative">
            <h1 className="headline-display font-display font-black leading-[0.84] tracking-[-0.035em] text-hh-yellow">
              <span className="block whitespace-nowrap text-[clamp(1.7rem,6.8vw,4.25rem)]">
                HACKER HOUSE
              </span>
              <span className="mt-1 block text-[clamp(2.35rem,9vw,4.75rem)]">
                GOA
              </span>
            </h1>
            <WanderStamp />
          </div>

          <p className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-hh-cream sm:mt-8 sm:text-xs sm:tracking-[0.28em]">
            GOA, INDIA · 28–31 OCT 2026
          </p>
          <p className="mt-3 max-w-md font-mono text-sm leading-relaxed text-hh-cream">
            Your pass to the beach. Upload a photo, get your Builder ID or PFP
            frame in seconds.
          </p>

          <FormatPosterCards />
        </div>
      </section>

      <GeneratorSection />

      <footer className="relative z-10 w-full border-t border-hh-cream/10 px-page py-8 pb-[max(2rem,env(safe-area-inset-bottom))] text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-hh-cream/55">
          Built for HH Goa 2026
        </p>
      </footer>
    </div>
  );
}
