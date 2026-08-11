# HH Goa 2026 — Frame & Builder ID Generator

Upload a photo, get a branded Hacker House Goa 2026 X profile frame or Builder ID card in seconds.

Shortlisting submission for the HH Goa Open Trials `#FrameInGoa` task. Visual identity matches the official site: forest green, sunflower yellow, magenta stamp, Fraunces + Space Mono.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Zustand, `react-easy-crop`, `heic2any`
- Canvas export + Vercel Blob (Share to X link preview)

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

Landing hero, upload/crop, circular PFP frame, Builder ID card, PNG download, and Share to X are in place.

Post-deadline cleanup (not a Prompt 5/6 blocker): `drawStampMark` is copy-pasted in `drawFrame.ts` and `drawCard.ts` — extract `src/lib/canvas/goaStamp.ts`.

| Path | Role |
| --- | --- |
| `src/app/page.tsx` | Landing hero |
| `src/app/layout.tsx` | Fonts, metadata, grain overlay |
| `src/components/brand/` | `HeroIllustration`, `GoaStamp` |
| `src/components/generator/` | Format toggle, upload, crop, frame + card previews |
| `src/lib/store.ts` | Session-only Zustand generator state |
| `src/lib/canvas/` | `drawFrame` + `drawCard` + PNG export helpers |
| `src/app/s/page.tsx` | Share landing + OG/Twitter card for X |
| `src/app/api/upload-share/` | Vercel Blob upload for desktop share fallback |
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

Vercel is the intended host. After connecting the repo:

1. Attach a Blob store (`vercel blob store add`, or via the Vercel dashboard). That creates `BLOB_READ_WRITE_TOKEN`.
2. Set `NEXT_PUBLIC_SITE_URL` to the deployment origin (preview vs prod).
3. Optionally set `NEXT_PUBLIC_BLOB_HOSTNAME` to the store hostname (e.g. `xyz.public.blob.vercel-storage.com`) so `/s` only accepts that host as `og:image`.
4. For local desktop-share testing, run `vercel env pull`.

Without a Blob token, **Download** still works. **Share to X** uses the native share sheet on phones that support image attach; the desktop link-preview path needs the token.
