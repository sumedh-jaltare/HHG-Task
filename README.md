# HH Goa 2026 — Frame & Builder ID Generator

Upload a photo, get a branded [Hacker House Goa 2026](https://hhgoa.com/) X profile frame or Builder ID card in seconds.

Shortlisting submission for the HH Goa Open Trials `#FrameInGoa` task. Visual identity matches the official site: forest green, sunflower yellow, magenta stamp, Fraunces + Space Mono.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Zustand, `react-easy-crop`, `heic2any`
- Canvas export + Vercel Blob (coming next)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run lint    # ESLint
npm run build   # production build
npm start       # serve the production build
```

## Project status

Landing hero and the shared upload/crop pipeline are in place. Canvas frame + Builder ID renderers are next.

| Path | Role |
| --- | --- |
| `src/app/page.tsx` | Landing hero |
| `src/app/layout.tsx` | Fonts, metadata, grain overlay |
| `src/components/brand/` | `HeroIllustration`, `GoaStamp` |
| `src/components/generator/` | Format toggle, upload zone, crop stage |
| `src/lib/store.ts` | Session-only Zustand generator state |
| `src/lib/image/` | HEIC normalize + crop-to-data-URL |
| `src/lib/utils.ts` | `cn()` classname helper |
| `tailwind.config.ts` | `hh.*` colors, display/mono fonts, stamp shadow |

## Brand tokens

| Token | Value |
| --- | --- |
| Green | `#12332A` / `#1C4735` |
| Yellow | `#F4D35E` |
| Pink | `#E63888` |
| Cream | `#F5EFDF` |
| Display | Fraunces 900 |
| UI | Space Mono |

## Deploy

Vercel is the intended host (Blob storage for generated assets). Connect the repo and deploy — no extra build config required yet.
