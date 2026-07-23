# Stage 2 — UI/UX Design Report (Chicken Road)

Owner: uiux
Status: COMPLETE

## TODO Checklist (final status)

- [x] Consult `ui-ux-pro-max` skill for retro pixel-art arcade design system, palettes, font pairing
- [x] Define global visual language (pixel grid, tile size, scale, HUD type)
- [x] Chicken sprite spec (idle/hop/wing-flap/feather-death/splash-death)
- [x] Environment tile specs (grass/road/river/railway) + obstacles + vehicles + train + corn + eagle
- [x] Particle/juice specs (dust, feathers, splash, sparkle, shake, slow-mo)
- [x] 3 stage palettes (Countryside day / City night / Industrial hazard) + parallax direction
- [x] Screen specs: title, HUD, stage-clear, game-over, victory (+ mobile touch controls sizing)
- [x] Write docs/DESIGN.md (full art-direction bible)
- [x] Build design/style-guide.html (self-contained representative mockup)
- [x] Write docs/reports/stage2-uiux.md
- [x] Commit all with conventional messages

All items complete — none partial, none outstanding.

## Visual Direction Summary

**Direction: "Arcade Pixel."** Chunky, high-saturation 16×16-grid pixel art
(hard offset shadows, notched panel corners, zero anti-aliasing) wrapped in a
constant dark arcade-cabinet UI chrome, so the product identity holds steady
while the game world transforms across 3 stages. Grounded via the
`ui-ux-pro-max` `--design-system` lookup: **Pixel Art** style category,
**Press Start 2P / VT323** mood reference, **Arcade & Retro Game** color
system (dark navy chrome + red/blue/green accents) — reused directly as the
constant HUD/title/end-screen chrome palette.

**Chrome/meta palette** (title, HUD, stage-clear, game-over, victory —
constant across all stages): `#0F172A` bg, `#192134` panel, `#DC2626`
danger/restart, `#2563EB` secondary, `#22C55E` score accent, `#FFD23F`
gold (corn/high-score), `#FFB100` warning.

**Three stage palettes** (full hex tables in DESIGN.md §3):
- **Stage 1 — Countryside (Day):** bright saturated greens/blue —
  `#8FD3F4`→`#C9F2C0` sky, `#6ABE30` grass, `#3AA6D9` river, `#4A4A55` road.
  Cheerful, generous safe margins.
- **Stage 2 — City (Night, streetlights):** deep indigo night —
  `#1A1A2E`→`#16213E` sky, `#2B2B36` road, `#FFD866`/`#FFCB57` warm
  sodium-lamp glow pools, `#17E9E0` sparse neon accent.
- **Stage 3 — Industrial Zone (hazard-lit):** grimy desaturated browns —
  `#2A211C` sky, `#6B6153` ground, `#3A342E` road, `#FF2E2E`/`#FFB100`
  aggressive red/amber hazard lighting, no river (per PRD stage table).

Also specified: 16×16 chicken sprite (pixel grid + palette + idle/hop/
squash-stretch/wing-flap/feather-death/splash-death animation timings),
vehicles (car/truck/bus with headlight glow — the one deliberate soft-edge
exception in an otherwise hard-edged system), log/lily pad, train +
telegraph timing, spinning corn pickup, eagle swoop-grab, particle specs
(dust/feathers/splash/sparkle/shake/slow-mo with counts+durations), and full
per-screen layout specs (title/HUD/stage-clear/game-over/victory) with edge
cases (0-scores, 4+ digit scores, NEW BEST badge, auto-advancing stage-clear,
death-cause flavor text). Responsive strategy confirmed: fixed 336×576
virtual resolution (7×12 tiles @ 48px), scale-to-fit + letterbox, no reflow,
44px+ touch targets. A critical technical note is called out prominently:
the shipped game **must not** load Google Fonts/external assets (PRD hard
constraint) — two approved in-canvas text rendering techniques are specified
instead of the generic Press Start 2P recommendation.

`design/style-guide.html` implements this literally in inline canvas/CSS
(no network calls) — stage palette swatches, chicken (idle+hop, pixel-grid
accurate), car, truck, log+lily pad, spinning corn, train+signal, eagle,
particle demos, and all 5 screen mockups at native 336×576 (the actual
mobile-width preview). Rendered and visually verified via headless Chrome
screenshots during the session; one CSS bug was found and fixed (a
descendant selector `.frame canvas` was incorrectly matching the nested
title-screen chicken canvas, causing it to overlay the title text) — root
cause was scoping, fixed by changing to a direct-child selector `.frame >
canvas`; re-verified clean afterward.

## 🟠 ISSUES

None. No PRD gaps blocked any screen or sprite spec.

## Deliverables (file paths)

- `/Users/wl/wl/ai-workspace/projects/chicken-road/docs/DESIGN.md`
- `/Users/wl/wl/ai-workspace/projects/chicken-road/design/style-guide.html`
- `/Users/wl/wl/ai-workspace/projects/chicken-road/docs/reports/stage2-uiux.md` (this file)

## Handoff Notes for Frontend

See DESIGN.md §11 "Handoff Notes for Frontend" — summary: port palettes as
plain JS objects (not CSS vars) into per-stage config, treat the
`style-guide.html` `PIXEL_MAPS`/pixel-grid data as the literal chicken/corn
sprite source to copy, pick one of the two no-external-font text rendering
approaches before writing HUD code, and keep the headlight/streetlight glow
as the only allowed soft-edge exception in the pixel-art system.
