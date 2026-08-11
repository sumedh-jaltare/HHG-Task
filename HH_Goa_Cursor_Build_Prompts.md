# HH Goa 2026 — Frame / ID Generator: Cursor Build Playbook

**Goal:** ship a live link before 11:59pm, 13 Aug 2026, that beats https://builder-pass.vercel.app/ on speed, on-brand feel, and share quality.
**Stack:** Next.js 14 (App Router) + TypeScript + Tailwind + Zustand + native Canvas API + Vercel Blob.
**How to use this doc:** paste each prompt into Cursor (Agent/Composer mode) in order. Test and `git commit` after each one before moving to the next. Don't skip ahead — later prompts assume earlier files exist.

---

## PROMPT 1 — Project scaffold, brand design system, landing hero

```
Set up a new Next.js 14 project (App Router, TypeScript, Tailwind CSS, ESLint) called
"hhgoa-frame-generator" in the current directory. Use `npx create-next-app@latest . --typescript
--tailwind --app --eslint --src-dir --import-alias "@/*"` conventions if starting fresh.

Install these dependencies:
- zustand
- react-easy-crop
- heic2any
- @vercel/blob
- framer-motion
- lucide-react
- clsx
- tailwind-merge

GOAL: build the design system and landing hero for a tool that turns an uploaded photo into a
branded HH Goa 2026 graphic (X profile picture frame, or event ID badge). This is a hackathon
shortlisting submission — the visual identity must feel unmistakably like the official HH Goa
site, not a generic gradient SaaS page.

BRAND REFERENCE (recreate this feeling, don't just reuse generic Tailwind defaults):
- Background: deep forest green (#12332A base, #1C4735 secondary panel green)
- Primary accent: bright sunflower yellow (#F4D35E) — used for the huge headline text and CTA buttons
- Secondary accent: hot magenta/pink (#E63888) — used sparingly for one "stamp" element and tags,
  outlined style (2-3px stroke, transparent or dark fill, like a rubber-stamp mark), often
  slightly rotated (-6deg to 8deg) for a hand-stamped feel
- Card/paper color: warm off-white cream (#F5EFDF) for any "notice board" style card components
- Typography: pair a BIG, tall, slightly-condensed serif display font (use "Fraunces" from Google
  Fonts, weight 900, with `font-variation-settings` or optical sizing turned up) for hero headlines,
  with a monospace font (use "Space Mono" or "JetBrains Mono" from Google Fonts) for all UI chrome:
  labels, buttons, timestamps, nav items, small caps tracking-wide text
- Overall texture: flat vector illustration style, not photographic. Think retro travel-poster /
  screen-print aesthetic — hard edges, no soft gradients except the sun.

TASKS:

1. Configure `tailwind.config.ts`:
   - extend `colors.hh` = { green: { 900: '#0D2820', 700: '#12332A', 500: '#1C4735', 300: '#2D6A4F' },
     yellow: { DEFAULT: '#F4D35E', dark: '#E6BE3A' }, pink: { DEFAULT: '#E63888', dark: '#C22872' },
     cream: '#F5EFDF' }
   - extend `fontFamily.display` = ['var(--font-fraunces)'], `fontFamily.mono` = ['var(--font-space-mono)']
   - add a `boxShadow.stamp` utility for a subtle hard drop shadow (offset, no blur — like a print
     registration shadow, e.g. `4px 4px 0px rgba(0,0,0,0.25)`)

2. In `app/layout.tsx`:
   - Load Fraunces (weights 400,600,900) and Space Mono (weights 400,700) via `next/font/google`,
     expose as CSS variables `--font-fraunces` and `--font-space-mono`
   - Set metadata: title "HH Goa 2026 — Frame & Builder ID Generator", description mentioning
     "Upload your photo, get a branded HH Goa 2026 X profile frame or Builder ID card in seconds.",
     and a default `openGraph`/`twitter` image pointing at `/og-default.png` (create a placeholder
     note as a comment — real OG generation comes in Prompt 5)
   - viewport meta for mobile (width=device-width, initial-scale=1, no user-scalable lock)

3. Build `components/brand/HeroIllustration.tsx`:
   - An inline SVG (viewBox ~ "0 0 800 500"), absolutely positioned, recreating a simplified
     sunset-over-hills scene in the palette above: a large yellow circle (sun) at ~50% height with
     6-8 thin radiating line "rays" of varying length around its top half, two soft rounded hill
     silhouettes in a mid-green behind it, and 2 simple palm-tree silhouettes (trunk = thin curved
     path, 5-6 frond leaf shapes) anchored bottom-left and bottom-right, all in flat fills, no
     gradients except optionally the sun. Keep it lightweight (pure SVG, no images). Make it accept
     a `className` prop so it can be sized/positioned by the parent.

4. Build `components/brand/GoaStamp.tsx`: a small reusable component rendering "गोवा" (or "GOA" if
   Devanagari font support is inconsistent — try Devanagari first via a Google Font like "Baloo 2"
   or "Hind" loaded alongside, fallback to styled "GOA") inside a hand-drawn-style rounded-blob
   outline in `hh-pink`, rotated -8deg, meant to overlap other text as an accent stamp.

5. Build the landing hero in `app/page.tsx` (just the hero section for now — the generator tool
   comes in later prompts, leave a `<section id="generator">` placeholder div):
   - Sticky top bar: small mono-font badge top-left ("HH GOA STUDIO" or similar), nav-style links
     top-right (can be non-functional anchors for now: "Check Hype", and a filled yellow pill button
     "Get Started" that smooth-scrolls to `#generator`)
   - Hero: HeroIllustration as full-bleed background (behind content, z-0), on top a massive headline
     using Fraunces 900 reading "HACKER HOUSE" on one line and "GOA" on the next (or similar), with a
     GoaStamp overlapping between the words the way a rubber stamp overlaps a poster
   - Below headline: mono-font small caps line "GOA, INDIA · 28–31 OCT 2026", and the tagline
     "Your pass to the beach. Upload a photo, get your Builder ID or PFP frame in seconds."
   - Two big CTA buttons: "Make my PFP Frame" and "Make my Builder ID" (both scroll to `#generator`
     for now, format selection logic comes later) — style as chunky yellow/cream buttons with the
     stamp shadow, hover state = translate 2px + shadow shrink (satisfying "press" feel)
   - Fully responsive: on mobile (<640px) stack the headline smaller (use clamp() font sizing,
     e.g. `text-[clamp(2.5rem,12vw,5rem)]`), buttons full-width stacked

6. Add a subtle grain/noise texture over the whole page via a fixed-position absolutely positioned
   div with a repeating SVG noise pattern at low opacity (~4%), so flat colors don't look sterile.

7. Set up `lib/utils.ts` with a `cn()` helper (clsx + tailwind-merge) for conditional classnames,
   used everywhere going forward.

Do NOT build the upload/crop/canvas generator logic yet — that's the next prompt. Just get the
scaffold, design tokens, and landing hero pixel-solid and responsive. Run the dev server and
confirm it renders correctly at 375px, 768px, and 1440px widths before finishing.
```

---

## PROMPT 2 — Shared state, upload, HEIC handling, crop stage

```
Now build the shared upload/crop pipeline that both Format A (PFP Frame) and Format B (Builder ID)
will consume. This is the foundation both generators sit on top of — get it rock solid.

1. Create `lib/store.ts` using Zustand. Define a single store `useGeneratorStore` with:
   - `format: 'frame' | 'card'` (default 'frame')
   - `rawImageFile: File | null`
   - `rawImageUrl: string | null` (object URL of the raw uploaded/converted image, pre-crop)
   - `croppedImageUrl: string | null` (final cropped image as a data URL or object URL, this is
     what gets drawn onto the export canvas)
   - `cropSettings: { crop: {x:number,y:number}, zoom: number, aspect: number } `
   - `builderDetails: { name: string; role: string; title: string; handle: string }` (used by
     Format B only, but keep it in the shared store so switching formats doesn't lose data)
   - actions: `setFormat`, `setRawImage(file: File)`, `setCroppedImageUrl(url: string)`,
     `setCropSettings(partial)`, `setBuilderDetails(partial)`, `reset()`
   - Persist nothing to localStorage (privacy — photos shouldn't linger), it's session-only state.

2. Create `lib/image/heic.ts` exporting `async function normalizeImageFile(file: File): Promise<File>`:
   - Detect HEIC/HEIF by MIME type OR file extension (Safari/iOS often reports an empty or generic
     MIME type for HEIC, so check `.heic`/`.heif` extension as a fallback)
   - If HEIC/HEIF, dynamically `import('heic2any')` (don't bundle it eagerly — it's heavy) and
     convert to a JPEG Blob (quality 0.92), wrap back into a `File` with a `.jpg` name
   - If not HEIC, return the file unchanged
   - Wrap the heic2any call in try/catch; on failure, throw a typed error `HeicConversionError`
     with a user-readable message ("Couldn't read this HEIC photo — try exporting it as JPG first
     or take a new photo in JPEG mode.")
   - Also validate: reject files that aren't image/* (after HEIC normalization) and files over 25MB,
     throwing typed `InvalidFileError` / `FileTooLargeError`

3. Build `components/generator/UploadZone.tsx`:
   - A drag-and-drop + click-to-select zone, full width, dashed border in `hh-cream/40`, hover/drag-
     over state highlights border to `hh-yellow` with a slight scale-up (framer-motion)
   - Accepts `image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif` via file input
   - On file selected: show an inline loading state ("Reading your photo…") while `normalizeImageFile`
     runs, then call `setRawImage` with the resulting file and generate an object URL via
     `URL.createObjectURL`, store via `setRawImage`/store into `rawImageUrl`
   - On error (HeicConversionError / InvalidFileError / FileTooLargeError / generic), show an inline
     red-bordered alert with the specific message and a "Try again" affordance — never a raw
     JS error or blank failure
   - Mobile: also expose a `capture="environment"` variant hint isn't required, but ensure the zone
     is comfortably tappable (min-height 200px) and the file input works from the iOS/Android photo
     picker (native `<input type="file" accept="...">` handles this — don't over-engineer)
   - Clean up: revoke previous object URLs when a new file replaces an old one (avoid memory leaks)
   - Once a raw image exists in the store, this component should visually collapse into a small
     "Change photo" pill rather than showing the big dropzone again

4. Build `components/generator/CropStage.tsx` using `react-easy-crop`:
   - Only renders when `rawImageUrl` is set
   - Aspect ratio depends on `format` from the store: 1:1 for 'frame', and a portrait-ish ratio like
     3:4 for 'card' (badges are usually taller than wide) — read this from a small constant map
     `ASPECT_BY_FORMAT` so later prompts can tune it
   - Wrap `<Cropper>` in a fixed-height container (e.g. h-[360px] on mobile, h-[420px] on desktop),
     rounded corners, background `hh-green-900`
   - Zoom slider below it (styled to match brand — yellow track/thumb), range 1 to 3, step 0.01
   - "Use this crop" button: on click, render the crop to an actual pixel-accurate output using an
     offscreen canvas (write a helper `lib/image/cropToDataUrl.ts` exporting
     `getCroppedImg(imageSrc: string, cropPixels: Area, outputSize = 1024): Promise<string>` that
     draws the cropped region of the source image onto a canvas sized `outputSize x outputSize`
     (or the correct aspect for 'card') and returns a `toDataURL('image/jpeg', 0.95)` string), then
     call `setCroppedImageUrl` with the result
   - Show a live small circular (for frame) or rounded-rect (for card) preview mask overlay on the
     cropper via the `cropShape` and `showGrid={false}` props from react-easy-crop, so users see
     roughly what will be visible in the final composite while cropping
   - Once cropped, collapse this stage too and show a compact thumbnail with a "Re-crop" button

5. Build `components/generator/FormatToggle.tsx`: a two-option segmented control (pill-shaped,
   yellow active state, cream/transparent inactive) switching `format` between 'frame' and 'card'
   in the store — both options always visible, switching does NOT clear the uploaded photo, only
   changes which downstream generator renders (that logic lands in Prompts 3 & 4).

6. Wire `#generator` section in `app/page.tsx`: heading "Build yours", the `FormatToggle`, then
   `UploadZone`, then conditionally `CropStage`. Leave a placeholder `<div id="canvas-output" />`
   below where Prompts 3/4 will render the actual generator canvas.

Test explicitly: upload a JPG, upload a PNG, and (if you have one) a HEIC file. Test on a narrow
mobile viewport that the cropper is usable with touch (pinch zoom / drag). Confirm object URLs are
being revoked (check devtools memory) when photos are replaced.
```

---

## PROMPT 3 — Format A: PFP Frame renderer

```
Build the Format A generator: a circular HH Goa branded frame that wraps the user's cropped photo
into a ready-to-use X profile picture. This must render entirely client-side on a <canvas> — no
server round trip — because it needs to feel instant.

1. Create `lib/canvas/drawFrame.ts` exporting:
   `async function drawFrame(ctx: CanvasRenderingContext2D, photoDataUrl: string, size: number): Promise<void>`

   Composition (canvas is `size x size`, e.g. 1080x1080 for export quality, scaled down for on-
   screen preview via CSS not canvas resolution — always render the export canvas at full 1080px
   internally and just display it smaller with `width`/`height` CSS attributes, so the download is
   always high-res regardless of screen size):

   a. Fill background circle: full canvas is transparent (profile pictures on X are square but
      Twitter/X crops to a circle client-side — so ALSO physically clip to a circle here so it looks
      correct as a flat image anywhere, not just on X). Use `ctx.save()`, clip a circular path at
      center with radius `size/2 - frameWidth`, draw the user's photo (load via `Image()`,
      `await img.decode()`) covering that inner circle using cover-fit math (compare photo aspect
      to 1:1, crop centered — though the photo is already square from CropStage, so this is mostly
      a safety net), `ctx.restore()`.
   b. Draw a ring frame around that circle: outer ring in `hh-yellow` (~ `size * 0.045` thick),
      inner thin ring in `hh-pink` (~`size * 0.01` thick) just inside it, both concentric strokes
      centered on the circle edge (use `ctx.arc` + `ctx.lineWidth` + `ctx.strokeStyle`, NOT filled
      shapes, so it reads as a clean ring).
   c. Add 3-4 small brand marks around the ring at fixed angles (e.g. top, bottom-left, bottom-right):
      a tiny palm-leaf glyph and/or the GoaStamp motif redrawn in canvas (simple bezier curves,
      filled `hh-pink`/`hh-yellow`) — keep these SMALL (no more than ~8% of canvas size each) so
      they read as texture, not clutter, and never overlap the visible face area.
   d. Along the bottom arc of the ring, draw curved text "HH GOA 2026" following the circle's
      curvature (implement a small helper `drawTextOnArc(ctx, text, centerX, centerY, radius,
      startAngle, font)` that positions each character by rotating the canvas per-glyph) in the
      mono font, `hh-green-900` color on the yellow ring so it's legible.
   e. Everything must be deterministic and re-run cheaply — this function will be called on every
      relevant state change (photo re-crop), so keep it under ~50ms on a mid-range phone. Avoid
      unnecessary `Image()` reloads: cache the loaded photo Image object outside the draw call when
      possible, or accept it's fine to reload since photos are small (1024px).

2. Create `components/generator/FramePreview.tsx`:
   - Only renders when `format === 'frame'` in the store and `croppedImageUrl` is set
   - Renders a `<canvas ref={canvasRef} width={1080} height={1080} className="w-full max-w-[420px]
     aspect-square rounded-full shadow-stamp mx-auto" />` (rounded-full on the CSS element too, so
     even before JS finishes drawing it visually reads as a circle)
   - `useEffect` that calls `drawFrame(ctx, croppedImageUrl, 1080)` whenever `croppedImageUrl`
     changes, with a loading skeleton (pulsing circle) shown until the first draw resolves
   - Below the canvas, small mono-font helper text: "This is your final PFP — download it or share
     straight to X below." (the actual download/share buttons are built in Prompt 5, just leave a
     `<div id="export-actions" />` placeholder here for now)
   - Wrap the whole preview in a subtle framer-motion fade/scale-in on first successful render so it
     doesn't just pop in abruptly

3. Add a tiny "regenerate look" affordance: since Format A has no user-editable fields besides the
   photo, add a single toggle — "Ring color" — letting the user flip between 2-3 preset ring
   colorways (e.g. Classic = yellow/pink as above, Night = cream/green inverted, Punch = pink/yellow
   swapped) stored as `ringTheme: 'classic' | 'night' | 'punch'` in the store (add this field to
   `lib/store.ts`), and read it inside `drawFrame` to pick the two ring colors. Keep this OPTIONAL
   and lightweight — do not build a full theme picker like the competitor's 11-theme system, this
   is a single small delighter, not the main feature.

4. Performance check: confirm re-drawing on ring-theme toggle or re-crop feels instant (no visible
   flash/delay beyond a frame or two). If `drawTextOnArc` is slow, precompute glyph positions once
   per size rather than per draw.

Test on a real narrow photo (e.g. a landscape screenshot) and a real portrait phone photo to confirm
the cover-fit cropping never stretches or leaves gaps in the circle.
```

---

## PROMPT 4 — Format B: Builder ID Card renderer

```
Build the Format B generator: a shareable event-badge-style card with the user's photo, name, role,
and a generated "builder title", styled as an HH Goa 2026 ID card. Like Prompt 3, this renders on a
<canvas>, fully client-side, instant.

1. Create `components/generator/BuilderForm.tsx`:
   - Only renders when `format === 'card'` in the store
   - Three inputs, all writing to `builderDetails` in the store on change (debounce isn't needed,
     canvas redraw is cheap — but DO debounce the actual redraw call ~80ms so fast typing doesn't
     thrash the canvas):
     - "Name" (text, required, max 28 chars, placeholder "Your name")
     - "Stack / Role" (text, max 24 chars, placeholder "e.g. Frontend Engineer, Solidity, Design")
     - X handle (optional, prefixed with a fixed "@" in the UI, strip any leading @ the user types,
       max 20 chars)
   - "Builder title" is NOT a free text field — it's generated. Add a "🎲 Generate my title" button
     next to a read-only display of the current title. Clicking cycles to a new random pick.
   - Create `lib/builderTitles.ts` exporting a curated array of ~40 short (2-4 word), Goa/beach/
     builder-themed fun titles, e.g. "Coastal Code Wizard", "Beachside Ship Captain", "Sunset Deploy
     Master", "Palm Tree Full-Stacker", "Late Night Merge Surfer", "Goa Growth Hacker", "Tide &
     Terminal", "Founder of Chaos, CEO of Vibes" — keep them genuinely fun and on-theme, not generic
     corporate titles. Export `pickRandomTitle(exclude?: string): string` that avoids repeating the
     current one twice in a row. On first photo+name entry, auto-pick one so the field is never
     empty by the time the user reaches export.
   - Inline validation: don't block generation on empty fields, but show placeholder text on the
     canvas itself ("YOUR NAME") if name is empty, so the card never looks broken — real-time
     preview should tolerate partial input gracefully at every step.

2. Create `lib/canvas/drawCard.ts` exporting:
   `async function drawCard(ctx: CanvasRenderingContext2D, photoDataUrl: string | null, details: {
   name: string; role: string; title: string; handle: string }, width: number, height: number): Promise<void>`

   Layout (card canvas e.g. 1080 wide x 1440 tall, portrait, export-resolution — same "render big,
   display small via CSS" approach as Prompt 3):

   a. Background: fill `hh-green-700`, then a large inset rounded-rect panel in `hh-cream`
      (rounded corners ~ width*0.04) leaving a green margin border — mimics the "notice board card"
      look from the reference screenshots (cream card pinned on green background). Add a small
      colored "pin" circle (pink or yellow, alternate based on a hash of the name so repeat cards
      feel varied) at top-center of the card, like the pinned notice cards.
   b. Header strip inside the cream card: small mono-font kicker text "HH GOA · BUILDER ID · 2026"
      centered, letter-spaced, in `hh-green-700`.
   c. Photo: a rounded-square photo frame (NOT circular this time — differentiate from Format A)
      roughly centered, ~55% of card width, with a 6-8px `hh-pink` border and the stamp shadow. Cover-
      fit the photo into it same as Prompt 3's approach. If `photoDataUrl` is null (shouldn't happen
      in practice since CropStage is required before this renders, but guard anyway), draw a placeholder
      silhouette icon instead of crashing.
   d. Name: below the photo, in Fraunces (load via canvas — see note below), large bold, `hh-green-900`,
      centered, auto-shrink font size if the name is long (measure with `ctx.measureText` in a loop,
      stepping font size down until it fits within 85% of card width).
   e. Role: directly below name, mono font, smaller, `hh-green-500`, uppercase, letter-spaced.
   f. Builder title: displayed inside a small pill/badge shape in `hh-pink` with cream text, like a
      "tag" — positioned below role.
   g. X handle (if provided): small mono text bottom-left of the card, "@handle".
   h. Footer strip: bottom of the card, mono small caps, "GOA, INDIA · 28–31 OCT 2026" plus a tiny
      redraw of the GoaStamp motif (reuse the same bezier-drawn stamp shape from Prompt 3's palm/
      stamp marks, in canvas form) bottom-right, slightly rotated via `ctx.rotate`.

   FONT LOADING NOTE: canvas text needs fonts loaded before drawing or it silently falls back to a
   system font. Before drawing text, `await document.fonts.load('900 64px Fraunces')` and similarly
   for the mono font weight/sizes actually used, so the very first render already has the correct
   fonts (avoids an ugly flash-of-wrong-font on the FIRST card, since Prompt 1 already loads these
   fonts globally via next/font — this is just an extra safety wait specifically for canvas which
   doesn't inherit next/font the same way the DOM does).

3. Create `components/generator/CardPreview.tsx`:
   - Mirrors `FramePreview.tsx` from Prompt 3 structurally: canvas ref, correct width/height (1080x1440),
     CSS-scaled display (`w-full max-w-[360px] aspect-[3/4] rounded-2xl shadow-stamp mx-auto`),
     loading skeleton, debounced redraw effect keyed on `croppedImageUrl` + all `builderDetails`
     fields + format, framer-motion entrance animation
   - Leave `<div id="export-actions" />` placeholder here too, matching Prompt 3 (Prompt 5 will
     build ONE shared export component used by both previews)

4. Wire both `FramePreview` and `CardPreview` into `app/page.tsx` under `#canvas-output`,
   conditionally rendering based on `format` from the store, plus render `BuilderForm` above
   `CardPreview` only when `format === 'card'`.

Test: empty name/role (should show graceful placeholders, not broken layout), a very long name
(should shrink to fit, not overflow the card), and rapid typing (should feel smooth, not janky).
```

---

## PROMPT 5 — Export (download) + Share to X

```
Build the shared export flow used by BOTH Format A and Format B: download the canvas as a real PNG
file, and a working "Share to X" button with a pre-filled caption and #FrameInGoa hashtag, where
the link preview on X actually shows the generated graphic (not a blank/default thumbnail). Prefer
true image-attach sharing on mobile over the link fallback wherever the browser supports it.

1. Create `lib/canvas/exportCanvas.ts`:
   - `function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/png', quality = 0.95):
     Promise<Blob>` — wraps `canvas.toBlob` in a Promise, rejects with a clear error if it returns
     null
   - `function downloadBlob(blob: Blob, filename: string): void` — creates an object URL, a
     temporary `<a download>`, clicks it, revokes the URL after

2. Set up Vercel Blob:
   - Create `app/api/upload-share/route.ts`, a POST route handler that accepts the exported PNG as
     `request.formData()` (field name `file`), validates it's `image/png` and under 8MB, then uses
     `put()` from `@vercel/blob` with a random-ish filename (`shares/${crypto.randomUUID()}.png`),
     `access: 'public'`, `addRandomSuffix: false`, and returns `{ url: blob.url }` as JSON. Wrap in
     try/catch returning a 500 with a clear error message on failure. Note in a comment that this
     requires a `BLOB_READ_WRITE_TOKEN` env var configured in the Vercel project settings (created
     automatically when a Blob store is attached to the project — instruct the user to run
     `vercel blob store add` or attach via the Vercel dashboard before this route works in prod; it
     will fail locally without a token unless `vercel env pull` has been run).

3. Create the share landing route `app/s/page.tsx` (searchParams-based, no database needed):
   - Reads `img` (the Vercel Blob URL of the generated PNG) and `caption` from `searchParams`
   - `export async function generateMetadata({ searchParams })`: builds full OG/Twitter metadata
     with `openGraph.images = [{ url: img, width: 1080, height: <1080 or 1440 depending>, alt: caption }]`
     and `twitter.card = 'summary_large_image'`, `twitter.images = [img]`. Falls back to the default
     OG image from Prompt 1 if `img` is missing/invalid (validate it's a proper URL, don't trust
     the query param blindly — guard against it being used to inject arbitrary og:image URLs by
     checking it starts with the expected Vercel Blob storage hostname, read from an env var
     `NEXT_PUBLIC_BLOB_HOSTNAME` or hardcode after first deploy once you know the store hostname)
   - Page body: server-rendered simple centered page — the actual graphic (as a plain `<img>`, not
     canvas), the caption text, and a big yellow "Make your own →" button linking back to `/`. This
     page is what a human sees if they click through from X, and what the X crawler reads for the
     preview — keep it fast and simple, no client JS required for it to work as a crawler target.

4. Create `components/generator/ExportActions.tsx` — the shared component both `FramePreview` and
   `CardPreview` render inside their `#export-actions` div, taking a `canvasRef` prop and a
   `filenamePrefix` prop ('hh-goa-frame' or 'hh-goa-builder-id'):

   a. "Download" button (primary, yellow, icon from lucide-react): on click, `canvasToBlob` the
      canvas, `downloadBlob` it as `${filenamePrefix}-${Date.now()}.png`. Show a brief success toast
      /checkmark micro-animation (framer-motion) on completion.

   b. "Share to X" button (secondary, pink outline): on click:
      - First, `canvasToBlob` the canvas to get the PNG blob
      - Build the caption string: for Format A, something like "Just made my HH Goa 2026 PFP frame 🌴
        See you on the beach, builders. #FrameInGoa"; for Format B, "My HH Goa 2026 Builder ID is
        ready — {title} incoming. #FrameInGoa" (interpolate the generated title). Keep captions
        under ~200 chars to leave room for the link X appends.
      - MOBILE / WEB SHARE API PATH (preferred when available): check
        `navigator.canShare && navigator.canShare({ files: [new File([blob], 'hhgoa.png', {type:
        'image/png'})] })`. If true, call `navigator.share({ files: [...], text: caption })` — this
        opens the native share sheet with the actual image attached, and on iOS/Android the X app
        will attach it directly to a new tweet compose. Wrap in try/catch (user cancelling counts as
        a rejected promise, don't show an error toast for that — only for genuine failures).
      - DESKTOP / FALLBACK PATH: POST the blob to `/api/upload-share` as FormData, get back `{ url }`,
        construct the share page URL `${window.location.origin}/s?img=${encodeURIComponent(url)}
        &caption=${encodeURIComponent(caption)}`, then open
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}&url=${encodeURIComponent(sharePageUrl)}`
        in a new tab. Show a loading spinner on the button while the upload is in-flight (should be
        1-2s max), disable double-clicks.
      - Handle upload failure gracefully: show an inline error with a "Just download and post it
        manually" fallback message rather than a dead end.

   c. Both buttons full-width on mobile, side-by-side on desktop, with the stamp-shadow press
      interaction from Prompt 1's CTA buttons for consistency.

5. Update `app/layout.tsx`'s default metadata (from Prompt 1) to also set
   `metadataBase: new URL('https://your-deployed-domain.vercel.app')` (use an env var
   `NEXT_PUBLIC_SITE_URL` so this is correct in preview vs prod deployments) — required for Next.js
   to resolve relative OG image URLs correctly, and to build correct absolute URLs in the share flow.

Test end-to-end on an actual phone (not just devtools device emulation) before considering this
done: upload → crop → download works → share opens the native sheet with the image attached. Then
test the desktop fallback path in a normal browser and confirm pasting the resulting /s link into
Twitter's card validator (or just posting it) shows the real graphic, not a blank card.
```

---

## PROMPT 6 — Polish, edge cases, performance, deploy

```
Final pass: harden edge cases, tighten mobile UX, verify performance, and ship to Vercel. Go through
this checklist methodically — this is what separates a shortlisted submission from a rejected one.

1. LOADING & EMPTY STATES:
   - Before any photo is uploaded, `#canvas-output` should show a friendly placeholder illustration/
     state (not a blank gap) explaining "Upload a photo above to see your frame/card appear here" —
     reuse a small variant of HeroIllustration or a simple line-drawn camera icon
   - Every async step (HEIC conversion, crop confirm, canvas draw, blob upload) needs a visible
     loading indicator — audit `UploadZone`, `CropStage`, `FramePreview`, `CardPreview`,
     `ExportActions` for any state where the user could be waiting with no feedback

2. ERROR RESILIENCE:
   - Wrap the whole `#generator` section's canvas-drawing logic in error boundaries (a simple React
     error boundary component `components/ErrorBoundary.tsx`) so a canvas drawing exception doesn't
     white-screen the whole page — falls back to "Something went wrong rendering your image — try a
     different photo" with a reset button that calls the store's `reset()`
   - Confirm every `catch` block in the codebase (heic.ts, cropToDataUrl.ts, upload-share route,
     ExportActions) surfaces a specific, human-readable message — grep for generic `catch (e) {
     console.log(e) }` patterns and fix them

3. MOBILE PASS (test on a real phone, both iOS Safari and Android Chrome if possible):
   - Confirm tap targets are >= 44px, form inputs don't cause iOS zoom-on-focus (font-size >= 16px
     on all inputs)
   - Confirm the crop stage works with touch gestures (pinch-zoom, single-finger pan) via react-
     easy-crop's built-in touch support — don't fight it with custom touch handlers
   - Confirm sticky/fixed elements don't overlap the iOS Safari bottom toolbar; add safe-area
     padding (`env(safe-area-inset-bottom)`) to the bottom of the export actions bar if it's sticky
   - Confirm the page doesn't have horizontal scroll at 360px width (a very common bug from fixed-
     width canvas elements — audit every canvas/image for `max-w-full`)

4. PERFORMANCE:
   - Confirm the heic2any import stays dynamic (`import('heic2any')`) and doesn't bloat the main
     bundle — check with `next build` output / bundle analyzer if time permits
   - Confirm canvas redraws are debounced appropriately (Prompt 4's typing-triggered redraws) and
     that switching Format A ⇄ Format B doesn't re-run expensive work unnecessarily (only the active
     format's preview component should be mounted/drawing at a time — verify with React DevTools
     profiler or just console.time around draw calls)
   - Lazy-load anything not needed for first paint (e.g. `next/dynamic` for CropStage since it's
     only needed post-upload)

5. ACCESSIBILITY BASELINE:
   - All interactive elements keyboard-reachable and focus-visible (Tailwind `focus-visible:ring-2
     focus-visible:ring-hh-yellow` on buttons/inputs)
   - All images/icons have appropriate `alt` text or `aria-hidden` if purely decorative
   - Form inputs have associated `<label>`s (visually can be small mono-caps labels matching the
     brand, don't rely on placeholder-as-label)
   - Color contrast check: verify text-on-yellow and text-on-cream combos meet at least AA for body
     text size (green-900 on yellow/cream should already pass — double check green-500 on cream)

6. FINAL CONTENT PASS:
   - Re-read every user-facing string (buttons, labels, error messages, captions) once for typos and
     tone — should read confident and fun, matching the beach/builder vibe, not corporate
   - Confirm the #FrameInGoa hashtag and event dates (28–31 Oct 2026) are consistent everywhere
   - Add a tiny footer: "Built for HH Goa 2026" with a link back to the official hhgoa.com or
     wherever the team wants to point it

7. DEPLOY:
   - Push to a GitHub repo, connect it to Vercel (or run `vercel` from the CLI)
   - In Vercel project settings, attach a Blob store (Storage tab → Create → Blob) so
     `BLOB_READ_WRITE_TOKEN` is auto-populated as an env var
   - Set `NEXT_PUBLIC_SITE_URL` env var to the real production domain once known (needed for correct
     OG metadata resolution from Prompt 5)
   - Set `NEXT_PUBLIC_BLOB_HOSTNAME` env var to the actual blob storage hostname (visible in the
     first successful upload's returned URL, or in the Vercel Storage dashboard) for the `/s` route's
     URL validation guard
   - Redeploy after setting env vars (env var changes require a new deployment to take effect)
   - Do a full clean run-through on the LIVE deployed URL, not localhost: upload → crop → both
     formats → download → share (mobile + desktop) — this is your actual submission, test it exactly
     as a judge would use it

8. SUBMISSION:
   - Confirm the live link loads fast on a cold visit (no login wall, no signup gate, matches the
     task's explicit requirement)
   - Submit the live link at https://forms.gle/jM5hTaGvsrfEfixPA before the deadline (11:59pm, 13
     Aug 2026) — don't leave this for the last five minutes in case Vercel Blob env vars need a
     redeploy to kick in.
```

---

## Notes for you and your team while running this

- **Order matters.** Prompt 2's store shape is the contract everything else depends on — if you deviate from it while working with Cursor, keep it consistent across prompts or the later ones will reference fields that don't exist.
- **Commit after each prompt.** If Prompt 4 makes a mess, you want to be able to `git reset` to the end of Prompt 3 rather than losing the whole session.
- **The Web Share API mobile path (Prompt 5) is your single biggest differentiator** from builder-pass — test it for real on a phone early, don't leave it to the last hour. If it doesn't work on a given browser, the desktop fallback still satisfies the task's requirement, so it's not launch-blocking, but it's the thing worth showing off in your submission notes.
- **Don't build the 11-theme system** they have — one small ring-color toggle (Prompt 3) is enough. Depth on the one real theme beats breadth of ten mediocre ones for a shortlisting review.
