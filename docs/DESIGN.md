# DESIGN.md — Chicken Road Art Direction Bible

Status: READY FOR REVIEW (Stage 2)
Owner: uiux
Consumers: frontend (implements exactly what is specified here)

---

## 0. Direction & Rationale

**Direction: "Arcade Pixel" — a chunky, high-saturation 16×16-grid pixel-art
world (NES/16-bit-adjacent) wrapped in a dark, neon-accented arcade-cabinet
UI chrome.** Gameplay palettes shift dramatically per stage (bright day →
neon night → grimy hazard-lit industrial) while the HUD/title/end-screen
chrome stays constant, so the game always *reads* as one product even as the
world around it transforms. This was grounded via the `ui-ux-pro-max`
`--design-system` lookup for "retro pixel-art arcade crossing game," which
returned the **Pixel Art** style category, the **Press Start 2P / VT323**
pairing, and an **Arcade & Retro Game** color system (dark navy chrome + red/
blue/green accents) — all directly reused below. Hard offset shadows, notched
"pixel-corner" panels, and zero anti-aliasing are used everywhere instead of
soft shadows/rounded corners, because blur and gradients read as generic-web,
not arcade — the entire point is danger must be instantly legible at a
glance, and chunky, high-contrast pixel silhouettes deliver that better than
anything softer.

**Critical technical constraint (overrides the generic ui-ux-pro-max font
recommendation):** the PRD forbids external fonts/images/network calls in the
shipped single HTML file. **Do not `@import` or `<link>` Google Fonts
(Press Start 2P/VT323) inside the actual game.** They are referenced here
only as the *mood reference* for the bitmap-font look to emulate. See §2.3
for the two approved in-game text rendering techniques. (The reference
mockup `design/style-guide.html` is a separate review artifact, not the
shipped game, and is also kept network-free — see §9.)

---

## 1. Global Visual Language

### 1.1 Grid & virtual resolution
- **Base tile = 48 logical px** (matches the chicken's 16×16 native art at
  the PRD-mandated 3× scale: 16 × 3 = 48).
- **Virtual/logical canvas = 336 × 576px** (7 tiles wide × 12 tiles tall).
  This is the fixed internal resolution the game always renders at
  internally; it is then scaled-to-fit + letterboxed to the real viewport
  per PRD §4 (integer-friendly scale factors preferred — 1×, 1.5×, 2×, 3× —
  to keep pixels crisp; non-integer scale is acceptable but the renderer
  must keep `imageSmoothingEnabled = false` / `image-rendering: pixelated`
  at all scales).
- 7-tile width gives a tight, readable "single lane of traffic" column per
  PRD's portrait play-column requirement while leaving room for obstacle
  variety per row.
- HUD occupies a fixed **48px-tall overlay strip** pinned to the top of the
  virtual canvas (one full tile row) — see §7.2.

### 1.2 Spacing scale
`4 / 8 / 12 / 16 / 24 / 32 / 48` logical px (8px rhythm; 48 = 1 tile). Used
for all HUD padding, panel padding, and inter-element gaps on overlay
screens.

### 1.3 Radius / corner treatment
**No rounded corners.** Panels use a **pixel-notch** corner (an 8px square
notch cut from each of the 4 corners via `clip-path: polygon(...)`), the
classic blocky-UI-panel silhouette. Buttons/badges use hard 0-radius
rectangles only.

### 1.4 Shadows
**Hard offset shadows only, no blur:** `4px 4px 0 rgba(0,0,0,0.6)` for
panels and primary buttons, `2px 2px 0 rgba(0,0,0,0.6)` for small badges/
chips. Pressed state collapses the offset to `0 0` and translates the
element by the same amount (mechanical-press feel).

### 1.5 Type scale (semantic sizes, in logical px equivalent)
| Token | Size | Use |
|---|---|---|
| `--fs-label` | 8px glyph height | HUD micro-labels ("SCORE", "CORN", "STAGE") |
| `--fs-value` | 12px glyph height | HUD numbers, corn count |
| `--fs-prompt` | 10px glyph height | Blinking prompts ("PRESS SPACE TO START") |
| `--fs-body` | 14px glyph height | Stat rows on stage-clear/game-over |
| `--fs-title` | 24px glyph height | Screen titles ("GAME OVER", "STAGE 2 CLEAR!") |

All type is **uppercase**, monospaced-cadence (fixed advance width per
glyph), letter-spacing +1px.

### 1.6 In-game text rendering (no external fonts — pick ONE approach)
1. **Preferred: offscreen low-res text buffer.** Render HUD/screen text with
   a system monospace stack (`ui-monospace, 'Courier New', monospace`) at a
   small integer pixel size (e.g. 8px) onto an **offscreen low-resolution
   canvas**, then `drawImage` that buffer onto the main canvas scaled up by
   an integer factor with `imageSmoothingEnabled = false`. This fakes a
   crisp blocky bitmap-font look with zero external assets and minimal code.
2. **Alternative: hand-drawn bitmap font.** A small `fillRect`-based 5×7
   glyph table for digits 0-9, A-Z, and punctuation `: ! ' space`. Higher
   fidelity, more code. Not required for v1 — flag as a stretch/nice-to-have
   if time allows in M4.
- **Global rule:** every piece of in-canvas text gets a **1–2px dark outline
  or drop shadow** (`rgba(0,0,0,0.7)`) so it stays legible over any of the
  three busy, high-detail stage backgrounds (see §8 Accessibility).

### 1.7 Motion tokens
| Token | Value |
|---|---|
| Hop duration | 140–160ms total |
| Idle bob cycle | 720ms (4 frames × 180ms), looping |
| Screen shake | 6–10px amplitude, ~200ms, decaying |
| Slow-mo flash | timescale → 0.3 for 150–250ms + white flash overlay 0→0.6→0 opacity over 150ms |
| Panel enter | 250ms scale 0.9→1 + fade |
| Panel exit | 150ms fade (faster than enter, per standard exit<enter easing) |
| Prompt blink | 500ms on / 500ms off |

---

## 2. Chrome / Meta Palette (title, HUD, stage-clear, game-over, victory)

This palette wraps every non-gameplay-world surface and stays constant
across all 3 stages so the product identity never wavers.

```css
:root {
  --chrome-bg:        #0F172A; /* overlay/scrim base */
  --chrome-panel:      #192134; /* solid panel fill */
  --chrome-panel-a:    rgba(15, 23, 42, 0.82); /* HUD bar — min opacity, see §8 */
  --chrome-border:     rgba(255, 255, 255, 0.10);
  --chrome-fg:          #FFFFFF; /* primary text */
  --chrome-fg-muted:   #94A3B8; /* secondary text */
  --chrome-primary:    #DC2626; /* danger / game-over / restart accent */
  --chrome-secondary:  #2563EB; /* links, mute icon, secondary controls */
  --chrome-accent:     #22C55E; /* score green, "go" state */
  --chrome-gold:        #FFD23F; /* corn / high-score / victory accent */
  --chrome-warning:    #FFB100; /* shared hazard amber (also Stage 3) */
}
```

---

## 3. Stage Palettes (gameplay world)

Each stage defines: sky/background, grass (safe lane), road (+ markings),
river (where present), railway, obstacle colors, vehicle skin, and a unique
accent used for that stage's signature lighting effect.

### 3.1 Stage 1 — Countryside (Day)
```css
--s1-sky-top:        #8FD3F4;
--s1-sky-bottom:     #C9F2C0;
--s1-sun:              #FFE066;
--s1-hill-far:        #A6DE7A;
--s1-hill-near:       #7FC24C;
--s1-grass:           #6ABE30;
--s1-grass-alt:       #4F9A28;  /* alternating row stripe for depth read */
--s1-grass-edge:      #3E7A1F;
--s1-road:             #4A4A55;
--s1-road-alt:        #43434C;
--s1-lane-marking:    #F4E285;
--s1-river:            #3AA6D9;
--s1-river-dark:      #2C86B0;
--s1-river-foam:      #BEEFFF;
--s1-tree-canopy:     #2E7D32;
--s1-tree-trunk:      #6B4226;
--s1-rock:              #9C9C9C;
--s1-rock-shadow:     #6E6E6E;
--s1-car-red:          #E4572E;
--s1-car-blue:         #3C91E6;
--s1-car-yellow:      #FFC93C;
--s1-headlight-glow:  #FFF4B8;
```
Mood: bright, saturated, cheerful, generous safe margins. Lowest danger
density per PRD stage table.

### 3.2 Stage 2 — City (Night, Streetlights)
```css
--s2-sky-top:        #1A1A2E;
--s2-sky-bottom:     #16213E;
--s2-skyline:          #0F1024;
--s2-star:              #E8E8F0;
--s2-building:        #23233A;
--s2-window-lit:      #FFCB57;
--s2-window-dark:     #14141F;
--s2-grass:           #2F6B3D;    /* park strip, desaturated for night */
--s2-grass-alt:       #24532F;
--s2-road:             #2B2B36;
--s2-road-alt:        #26262F;
--s2-lane-marking:    #FFD866;   /* brighter than S1 to read under streetlight */
--s2-river:            #1D4E63;   /* canal */
--s2-river-dark:      #17394A;
--s2-river-foam:      #7FD8E8;   /* moonlit shimmer */
--s2-streetlight-glow: #FFD866;
--s2-streetlight-pole: #3A3A44;
--s2-obstacle-barrel:  #545461;
--s2-car-body:        #464655;
--s2-car-taxi:         #F4C430;
--s2-headlight-glow:  #FFF6D0;   /* stronger halo at night */
--s2-taillight:        #FF3B3B;
--s2-neon-accent:     #17E9E0;   /* used sparingly on 1–2 signage props */
```
Mood: cooler, moodier, higher contrast between dark base and warm sodium-
lamp glow pools. Traffic reads busier (per stage table: faster, buses/
trucks added).

### 3.3 Stage 3 — Industrial Zone (Hazard-lit)
```css
--s3-sky-top:         #2A211C;
--s3-sky-bottom:      #1B1613;
--s3-smokestack:       #171310;
--s3-ember:              #FF7A29;   /* drifting spark particle */
--s3-ground:            #6B6153;   /* grimy safe platform, replaces "grass" */
--s3-ground-alt:       #5A5245;
--s3-road:               #3A342E;
--s3-road-alt:          #332E29;
--s3-hazard-stripe-a:  #FFB100;   /* diagonal hazard tape, alternating */
--s3-hazard-stripe-b:  #1A1A1A;
--s3-rail-bed:          #4A423A;
--s3-rail-metal:       #C7C2B8;
--s3-rail-rust:         #8B5E3C;
--s3-signal-red:       #FF2E2E;
--s3-signal-amber:    #FFB100;
--s3-obstacle-barrel:  #C0392B;
--s3-obstacle-rust:    #7A2418;
--s3-crate:              #8A6D3B;
--s3-truck-body:       #55524D;
--s3-truck-cab:         #3A3733;
--s3-headlight-glow:  #FFD24D;
```
Mood: desaturated browns/greys punctuated by aggressive red/amber hazard
light — the palette itself communicates danger before any hazard even
moves. **No river in Stage 3** per PRD stage table (river hex vars omitted
intentionally); safe lanes are narrower and rail frequency is highest.

**Shared across all stages:** corn pickup is `#FFD23F` kernel / `#7ABF4C`
husk (matches `--chrome-gold`, ties HUD and pickup together visually);
chicken palette (§4.1) is identical in all 3 stages — the character never
re-skins, only the world does.

---

## 4. Sprite Specs

All sprites are drawn on a **16×16 native pixel grid**, then scaled 3× in
canvas (`ctx.imageSmoothingEnabled = false`). Grids below use a legend +
column-range shorthand so frontend can translate directly into
`fillRect(col, row, 1, 1)` calls (also implemented literally as pixel-grid
canvases in `design/style-guide.html` — treat that file as the executable
source of truth for exact pixel placement; this section is the semantic
spec/rationale).

### 4.1 Chicken (16×16, canonical facing = right)
**Design decision:** the chicken always faces right; when hopping left,
frontend mirrors the sprite via `ctx.scale(-1, 1)` (no separate left-facing
frames needed). Up/down hops keep the last horizontal facing (default
right). This halves sprite-authoring work with no readability cost.

Palette:
| Key | Role | Hex |
|---|---|---|
| `O` | outline | `#1B1611` |
| `B` | body cream | `#FFF3D6` |
| `S` | body shade (underside) | `#E8D5A8` |
| `C` | comb / wattle | `#E8432B` |
| `K` | beak | `#FFB020` |
| `E` | eye | `#1B1611` |
| `P` | eye highlight | `#FFFFFF` |
| `W` | wing patch | `#E0B876` |
| `L` | leg / feet | `#FFB020` |

Silhouette anatomy (row = y 0–15 top→bottom, col = x 0–15 left→right):
- Rows 0–2: small red **comb**, cols 10–13 (peaked triangle).
- Rows 3–6: **head**, cols 8–14; **eye** at col 12–13/row 4 with a 1px
  white highlight at row 3; **beak** protrudes cols 14–15, rows 5–6.
- Rows 5–12: **body**, an oval that bulges widest (cols 2–13) at rows
  7–9, tapering to a narrower **tail** at cols 1–3 (rows 6–10) and
  narrowing again toward the belly (rows 11–12, cols 4–12).
- Wing patch `W`: cols 4–8, rows 7–9, sits inside the body fill as a
  visible tonal patch (not a separate silhouette piece in idle/ground
  frames).
- Rows 13–14: two 2px-wide **leg** nubs at cols 5–6 and 9–10.
- 1px `O` outline traces the entire outer silhouette for readability
  against any of the 3 busy stage backgrounds.

**Animation sets** (all frames are palette-identical redraws with offsets —
no new colors):
1. **Idle (4 frames, loop, 180ms/frame = 720ms cycle):** head-bob. Frame A
   = neutral. Frame B = head/beak shift +1px down (peck start). Frame C =
   head/beak at lowest point +2px down, beak touches ground line (peck).
   Frame D = head returns to +1px (rebound) before looping to A.
2. **Hop (one tile, 140–160ms total), squash-and-stretch:**
   - **0–20% (takeoff):** squash — scaleY 0.85 / scaleX 1.15, wings `W`
     patch extends 2px outward on both sides (flap-out). Spawn dust puff
     (§5.1) at origin tile.
   - **20–80% (apex/mid-air):** stretch — scaleY 1.15 / scaleX 0.9, sprite
     lifts −8px on the Y axis (arc peak), wings fully extended
     (wing-flap-mid-hop pose — `W` patch pushed to a distinct silhouette
     bump above the body, not just a tonal patch).
   - **80–100% (landing):** quick squash — scaleY 0.8 / scaleX 1.2 for the
     final ~20ms, then snap to neutral idle Frame A. Spawn dust puff at
     destination tile.
   - Input buffer: next hop may begin queuing during the final 30% of the
     current hop's landing so rapid taps never feel dropped (per PRD AC-2).
3. **Death — impact (feather-burst):** chicken sprite freezes at a
   "squashed flat" pose (scaleY 0.4, scaleX 1.4) for 1 frame, then hides;
   see feather particle spec §5.2. Total beat before Game Over screen
   fade-in: 500–700ms (includes shake + slow-mo, §5.5–5.6).
4. **Death — water (splash):** chicken sprite scales down to 0 over
   150ms (sinking) at the water tile position; see splash particle spec
   §5.3. Same 500–700ms beat before Game Over.

### 4.2 Vehicles (car / truck / bus)
Simple geometric pixel silhouettes, not organic — easy to keep crisp at
small scale and instantly readable as "moving hazard."
- **Car** (2 tiles wide × 1 tile tall body footprint): rounded-rect body
  (drawn as a stepped/blocky rect, no true border-radius), 2 window cells
  (lighter tint of body color), 2 wheel squares (near-black `#1A1A1A`),
  and a **headlight glow**: a soft-edged radial gradient blob (stage-
  specific glow hex, see §3) extending ~6px ahead of the vehicle in its
  direction of travel — this is the ONE allowed soft/gradient element in
  the whole art system (headlights + streetlights are the deliberate
  exception to the hard-edge rule, because glow = the universal "light
  source" visual language and needs to read as light, not paint).
- **Truck** (3 tiles wide): cab block (darker shade) + longer cargo box
  (base color), same wheel/headlight treatment, 4 wheels.
- **Bus** (Stage 2 only, 3 tiles wide): boxier silhouette, row of 3–4
  small lit window cells along the side, same headlight treatment.
- Direction: vehicles moving right use the mirrored sprite of vehicles
  moving left (headlight glow flips side accordingly) — same mirroring
  technique as the chicken.
- Speed/direction vary per lane per PRD §7.3 (data-driven, not visual).

### 4.3 Log & Lily Pad (river)
- **Log:** horizontal brown rect, 2 tiles wide × ~0.6 tile tall, wood-grain
  suggested via 2–3 darker horizontal 1px striations, rounded log-ends
  via a stepped-corner block (not a smooth curve) — cut corner pixels
  stepwise (2px, 1px) to fake a cylinder end without anti-aliasing.
  Colors: body `#A9743F`, striation `#8A5C2E`, end-cap highlight `#C08F52`.
- **Lily pad:** circular-ish (stepped-octagon) pad, 1 tile diameter, base
  `#3C9D45`, vein lines `#2C7A34`, small pink accent dot flower optional
  `#F2A6C8` (decorative, non-functional, omit under time pressure).
- Both **bob** vertically ±1px on a slow 1.2s sine cycle for "floating"
  life even when not moving horizontally.
- When the chicken stands on a log/pad, it **dips** the chicken sprite by
  1px and the log gets a subtle 1px "weighted" compression frame — small
  detail, nice-to-have, not blocking.

### 4.4 Train + Warning Light + Bell Telegraph
- **Warning signal:** a small pole-mounted light box at the lane edge,
  2 lamp roundels (stepped-circle, not true circle) — alternates
  `--s3-signal-red` / off (or amber in Stage 1–2's rarer rail lanes) at a
  **200ms flash interval** for a **telegraph window of 1.2–1.5s** (Stage
  1–2) or **0.8–1.0s** (Stage 3, tighter reaction window per difficulty
  table). Bell SFX (audio, frontend/backend-of-audio scope) syncs to each
  flash.
- **Train:** multi-car sprite, 3–4 segments each ~1.5 tiles wide, dark
  metal body (`#3A3733`-family per stage) with a bright **headlamp glow**
  on the leading car (same glow technique as vehicles) and 1–2 lit window
  slits per car. Crosses the full lane width in **300–500ms** — noticeably
  faster than any road vehicle (PRD AC-6), leaving a brief motion-blur
  streak (3–4 semi-transparent trailing copies of the leading car, opacity
  stepping 0.5→0.2→0.1) to sell the speed without true blur filters.
- After the train fully exits, the lane returns to a normal (safe)
  railway-tile state until the next telegraph cycle begins.

### 4.5 Corn Pickup
- 1×1-tile sprite, kernel cluster of 4–5 small gold `#FFD23F` blocks over
  a green husk `#7ABF4C` base, 12×12 native grid (smaller than the
  chicken to read as "small collectible").
- **Spin animation:** 4-frame horizontal-squash cycle simulating a Y-axis
  spin (frame widths 100% → 60% → 15% (edge-on) → 60% → 100%), 120ms/
  frame (480ms full spin loop) — classic 2D "spinning coin" fake-3D trick.
- **On collect:** corn scales to 130% over 80ms then instantly hides;
  triggers sparkle burst (§5.4) + HUD corn-counter pulse (§7.2).

### 4.6 Eagle (fall-behind fail state)
- Larger sprite than the chicken (~24×24 native grid, scaled 3× = 72px),
  dark brown-grey body `#4A3B32`, cream head/neck `#E8DCC8` (bald-eagle-
  coded silhouette without depicting a real protected species literally —
  keep it generic "bird of prey"), amber eye `#FFB020`, spread-wing
  silhouette (wings full-span horizontally, easiest read at speed).
- **Swoop-grab sequence (600–900ms total):** enters from the top edge of
  the visible camera window on a diagonal, scaling from 40%→100% size as
  it "approaches" (distance cue), aligns over the chicken's last position,
  a single-frame "grab" pose (talons down, wings tucked), then both eagle
  + chicken (small, held) exit off the top edge together over the final
  ~200ms. Screen shake NOT used here (it's a miss-driven fail, not an
  impact) — instead a **quick top-down vignette darken** (0→40% black,
  200ms) sells the "swoop" without feeling like a collision.

### 4.7 Environment / Obstacles
- **Grass tile:** flat fill + 1px darker blade-tick marks scattered
  sparsely (4–6 per tile) for texture without noise.
- **Tree obstacle** (grass lane, impassable): trunk block (1×1 tile,
  bottom-anchored) + canopy block (1.5×1.5 tile, overlapping upward into
  the tile above) — canopy uses 2-tone shading (base + 1 highlight patch)
  for volume.
- **Rock obstacle:** irregular stepped-polygon blob, base + shadow tone,
  smaller footprint than tree (fits fully in 1 tile) so it reads as a
  lower obstacle at a glance.
- **Road tile:** flat asphalt + alternating-row shade (`--*-road` /
  `--*-road-alt`) for scroll-depth cue + dashed lane-marking line
  (`--*-lane-marking`) centered, 4px dash / 4px gap.
- **River tile:** base water fill + horizontal shimmer bands (2px, offset
  animating slowly to the right, ~1.5s cycle per band) using the stage's
  `-foam` color at low opacity for a "flowing" read without a real shader.
- **Railway tile:** rail-bed fill + 2 metal rail lines (horizontal, near
  tile edges) + evenly spaced tie/sleeper ticks (perpendicular, every
  ~12px) in a rust tone.

---

## 5. Particle / Juice Specs

All particles are simple filled squares/small polys (no images), spawned
from a shared lightweight particle-system class per PRD §5 (`Particle`).

### 5.1 Dust puff (hop)
- 3–5 particles, 2×2–3×3px, neutral tan-grey (`#C9BFA6` on grass,
  `#8A8A94` on road — tint by current lane type so it never clashes),
  radiate outward from the hop origin/landing tile at low velocity with
  slight upward drift, fading opacity 1→0 over **200–300ms**, no gravity.

### 5.2 Feather burst (impact death)
- 6–10 small elongated feather-shaped particles (2–3px wide "leaf" quads,
  approximable as thin rects), colors drawn from the chicken palette
  (`B`, `S`, `W`), fly outward radially from impact point at moderate
  velocity, **gravity-affected** (arc downward), 1px/frame rotation
  wobble, fade out over **500–700ms** (roughly matches the death beat).

### 5.3 Water splash
- 8–12 small circular/square droplet particles in `--*-river-foam` +
  `--*-river` tones, burst upward-and-outward then fall with gravity,
  **plus** one expanding ring: a stroked circle scaling 1×→3× radius while
  fading opacity 0.6→0 over **400–600ms**, centered on the splash tile.

### 5.4 Corn sparkle
- 4–6 small plus/star-shaped particles in `--chrome-gold` + white,
  burst outward from the corn tile at short range, fade over **250–
  350ms**; paired with a **HUD corn-counter pulse**: counter scales to
  115% with a gold flash-outline for 150ms.

### 5.5 Screen shake (on any death by impact/train)
- Camera/render-offset jitter: amplitude **6–10px**, decaying
  exponentially, duration **~200ms**, randomized X/Y per frame (not a
  fixed sine) for a punchier feel. Not used for water-splash or
  eagle-grab deaths (those get their own softer cues, §4.3/§4.6) — shake
  is reserved for hard-impact deaths (vehicle, train) to keep it meaningful
  rather than constant.

### 5.6 Slow-motion flash (on any death)
- Global timescale drops to **~0.3×** for **150–250ms** immediately on
  the death-triggering event, synchronized with a full-canvas white flash
  overlay fading **0 → 0.6 → 0 opacity over 150ms**. Timescale then
  ramps back to 1× as the death animation (feather/splash/eagle) plays
  out, leading into the Game Over screen transition.

---

## 6. Parallax Background Direction (per stage)

Each stage has **2 parallax layers behind the lane grid**, scrolling
slower than gameplay (far layer ~25% camera speed, near layer ~50%) to
sell depth without any 3D:

- **Stage 1 (Countryside):** far layer = soft rolling hill silhouettes
  (`--s1-hill-far`) + a static sun disc high in the sky; near layer =
  slightly darker hill band (`--s1-hill-near`) with occasional small tree
  silhouette clusters. Sky is a vertical gradient (`--s1-sky-top` →
  `--s1-sky-bottom`).
- **Stage 2 (City):** far layer = distant building skyline silhouette
  (`--s2-skyline`) + scattered static star pixels; near layer = closer
  building row (`--s2-building`) with randomly-lit window cells
  (`--s2-window-lit`) that occasionally flicker on/off (single-cell
  toggle every few seconds, cheap "living city" cue) and 1–2 sparse
  neon sign accents (`--s2-neon-accent`).
- **Stage 3 (Industrial):** far layer = smokestack silhouettes
  (`--s3-smokestack`) venting slow-drifting smoke puffs; near layer =
  chain-link-fence-suggestion (sparse diagonal-cross tick pattern) and
  occasional drifting ember particles (`--s3-ember`, tiny glowing dots
  rising and fading, ambient — separate from the death particle system).

---

## 7. Screen Specs

### 7.1 Title Screen
- **Layout (336×576 virtual canvas):** Stage 1 (Countryside) background
  visible immediately behind everything — establishes tone before the
  player even starts. Centered vertical stack: game title
  `CHICKEN ROAD` (`--fs-title`, `--chrome-fg` with a `--chrome-primary`
  drop-shadow outline for pop) near the top third; **idle-animated
  chicken** (§4.1 idle 4-frame loop) centered mid-screen, scaled up
  slightly (4× instead of 3×) as a hero element; blinking prompt text
  below it (`--fs-prompt`) — **adaptive copy:** `PRESS SPACE TO START` on
  keyboard-capable contexts, `TAP TO START` on touch-capable contexts (show
  both stacked if both input types are plausible, per PRD's "always
  available, no device sniffing gates" — detect capability, don't assume
  exclusivity). If session high score > 0, show a small
  `BEST: {n}` line in `--chrome-gold` beneath the prompt.
- **Edge cases:** first paint before any input — AudioContext is not yet
  unlocked (PRD AC-11); no audio plays until first input, this is
  expected/silent by design, not an error state. No console errors is a
  hard AC.

### 7.2 In-Game HUD
- **Layout:** fixed 48px-tall bar pinned to the top of the virtual canvas,
  `background: var(--chrome-panel-a)` (semi-transparent, min opacity
  0.82 — see §8), full width, 3-zone flex layout with 12px horizontal
  padding:
  - **Left:** `SCORE` label (`--fs-label`, `--chrome-fg-muted`) stacked
    above the score value (`--fs-value`, `--chrome-fg`, tabular/fixed-
    width digits so it never jitters as digits change).
  - **Center:** `STAGE {n}/3` badge, small pixel-notch chip,
    `--chrome-secondary` background.
  - **Right:** corn icon + count (`--chrome-gold` value), and a **44×44px
    mute toggle button** (speaker icon default state / speaker-with-slash
    when muted) as the rightmost element — this is the one persistent
    interactive HTML/canvas control at all times, sized to the PRD/ux
    44px touch-target minimum.
- **States:** score/corn counters pulse (§5.4) on increment; stage badge
  flashes `--chrome-accent` briefly on stage transition; mute button has
  default / muted / pressed (scale 0.9, shadow collapse) / focus-visible
  (2px `--chrome-secondary` outline ring, keyboard-reachable) states.
- **Edge cases:** 4+ digit scores must not overflow — score value is
  right-aligned in a flexible-width zone, label truncation never needed
  since values are numeric-only.

### 7.3 Stage-Clear Screen
- **Trigger:** row 30 of the active stage (PRD §7.5).
- **Layout:** current stage scene freezes behind a 60%-black scrim; a
  centered pixel-notch panel (`--chrome-panel`, hard shadow) shows:
  `STAGE {n} CLEAR!` title (`--fs-title`, `--chrome-accent`), then two
  stat rows — `SCORE {n}` and `CORN {n}` (`--fs-body`) — then a thin
  progress bar that fills over **1.5–2s** before auto-advancing to the
  next stage (no input required; this keeps flow non-blocking per the
  PRD's "shows score + corn before advancing" requirement — no dead-end
  state). After Stage 3, this screen is replaced by the Victory screen
  (§7.5) instead of advancing.
- **Edge case:** if corn count is 0, still show `CORN 0` (never hide the
  row) — consistency over cleverness.

### 7.4 Game-Over Screen
- **Trigger:** any of the 4 death causes (PRD §7.6).
- **Layout:** last stage frame frozen behind a red-tinted 55% scrim
  (`--chrome-primary` at low opacity over black) for a "danger" mood
  distinct from stage-clear's neutral dim. Centered panel:
  `GAME OVER` title (`--fs-title`, `--chrome-primary`), a small
  **death-cause flavor line** directly under the title (`--fs-body`,
  `--chrome-fg-muted`) — e.g. *"Squashed!"* / *"Swept away!"* / *"Struck
  by train!"* / *"Snatched by an eagle!"* (max ~24 chars; this is a
  fixed enum of 4 strings tied 1:1 to death cause, not free text, so no
  truncation logic is ever needed) — then stat rows `SCORE {n}`,
  `CORN {n}`, `BEST {n}`. If the just-ended run beat the prior session
  high score, show a `NEW BEST!` badge in `--chrome-gold` with a gentle
  pulse next to the BEST row (PRD AC-10). Below the stats, a restart
  prompt (`--fs-prompt`, blinking): `PRESS SPACE / TAP TO RESTART`.
- **Edge cases:** score of 0 (died on the very first hop attempt/starting
  tile edge case) still renders `SCORE 0` cleanly; BEST always shows even
  on a player's very first run (BEST = current score in that case, no
  "N/A" state needed since session high score initializes to 0).

### 7.5 Victory Screen
- **Trigger:** Stage 3 cleared (row 30 of Stage 3).
- **Layout:** same panel structure as Game-Over but celebratory instead
  of punitive — `VICTORY!` title in `--chrome-gold`, background scrim
  is a warm gold-tinted 40% overlay (not red), a light confetti-style
  ambient particle drift (small squares in `--chrome-primary` /
  `--chrome-secondary` / `--chrome-accent` / `--chrome-gold` falling
  slowly, reuses the particle system, not death-triggered), same stat
  rows (`SCORE`, `CORN`, `BEST` with `NEW BEST!` badge logic identical
  to §7.4), and a `PRESS SPACE / TAP TO PLAY AGAIN` restart prompt.

---

## 8. Responsive & Accessibility

- **Responsive strategy confirmed from PRD §4:** mobile-first fixed
  virtual resolution (336×576, §1.1), scale-to-fit + letterbox, never
  reflows the play column. Integer-friendly scale factors preferred at
  common breakpoints (360×640 phone ≈ 1.05× down... in practice render at
  the largest integer/near-integer scale that fits, then letterbox the
  remainder — frontend's call at implementation, this doc fixes the
  *source* resolution only).
- **Touch targets:** mute button and restart control are both ≥44×44
  logical px (mute is exactly 48px = 1 tile, comfortably over minimum).
  Title/game-over/victory "tap to continue" targets are the **entire
  screen** (large, forgiving, no small-target risk).
- **Contrast:** HUD bar uses `--chrome-panel-a` (rgba(15,23,42,0.82)) —
  at this opacity, `--chrome-fg` (#FFFFFF) text stays ≥7:1 contrast even
  layered over Stage 1's brightest sky color, comfortably clearing WCAG
  AA (4.5:1) in the worst-case (brightest-background) stage. All other
  overlay panels use fully-opaque `--chrome-panel` (#192134) behind
  `--chrome-fg`/`--chrome-fg-muted` text — computed contrast: white on
  #192134 ≈ 14.8:1 (AAA), muted `#94A3B8` on #192134 ≈ 5.7:1 (AA).
  `--chrome-primary` (#DC2626) on `--chrome-panel` ≈ 4.6:1 — passes AA
  for the `GAME OVER` title at `--fs-title` size (large text, needs only
  3:1, so this clears with margin).
- **In-canvas world text/HUD-over-gameplay rule (§1.6):** every piece of
  canvas text carries a dark outline/drop-shadow regardless of the
  background — this is the primary defense against the 3 stage
  backgrounds' varying brightness, since text there sits directly over
  animated art rather than a flat chrome panel.
- **Color is never the only signal:** train telegraph = light flash +
  bell audio + (implicit) the rails/track lane itself; corn = shape +
  spin animation, not just gold color; danger states pair icon/shape
  changes with color changes throughout.
- **Reduced motion:** out of PRD scope (§10 explicitly excludes an
  accessibility audit beyond basic readability/contrast) — noting here
  only as a non-blocking future improvement, not a requirement for v1.

---

## 9. Component Inventory (states)

| Component | Default | Hover (desktop) | Pressed | Disabled | Loading | Error/Empty |
|---|---|---|---|---|---|---|
| Mute button | speaker icon | scale 1.05 + border brighten | scale 0.9, shadow collapses | n/a (always available) | n/a | n/a |
| Start/Restart prompt | blinking text, 500ms cadence | n/a (full-screen tap target, no discrete hover) | brief scale-down flash on activation | n/a | n/a | n/a |
| Score/Corn counter | static digits | n/a | n/a | n/a | n/a | shows `0`, never blank |
| Stage badge | `STAGE n/3` | n/a | n/a | n/a | transition flash (`--chrome-accent`, 200ms) | n/a |
| Warning signal (rail) | off/dim | n/a | n/a | n/a | flashing (telegraph window) | n/a |
| Corn pickup | idle spin loop | n/a | collect burst (§5.4) then removed | n/a | n/a | n/a (never spawns overlapping an obstacle — generation rule for frontend) |
| Log/lily pad | idle float bob | n/a | occupied-dip (chicken aboard) | n/a | n/a | n/a |
| Stat panel (clear/over/victory) | entrance anim (250ms) | n/a | n/a | n/a | n/a | 0-value rows always shown, never hidden |

---

## 10. Asset Generation Note

**No Hugging Face / external raster asset generation was used or is
needed for this project.** PRD §5 is explicit and non-negotiable: "No
external images, fonts, audio files, or network calls" and "all
sprites/art drawn programmatically." Every visual in this spec is
described as canvas primitives (`fillRect`/simple polys) for frontend to
implement directly in code — this is an intentional, PRD-mandated
deviation from the general asset-generation workflow, not an oversight.
The `design/style-guide.html` reference mockup (§ below) likewise draws
every sprite with inline canvas/CSS, no image files, to stay consistent
with how the shipped game will actually render.

---

## 11. Handoff Notes for Frontend

1. Copy the two `:root` token blocks (§2 Chrome, §3 Stage palettes) as
   JS config objects (e.g. `STAGES[0].colors`) — they're written as CSS
   custom properties here for easy visual reference in the mockup, but in
   the actual canvas game they should live as a plain JS palette table
   per stage, not CSS variables (canvas fill/stroke calls take raw hex).
2. Build the chicken and corn sprites as literal pixel-grid data (array of
   16 row-strings using the legend in §4.1) — treat
   `design/style-guide.html`'s `PIXEL_MAPS` object as the exact reference
   to port, not just inspiration.
3. Text rendering: pick ONE of the two §1.6 approaches before writing HUD
   code — do not fall back to plain unstyled `ctx.fillText` with a raw
   system font at full size, it will look off-brand.
4. Headlights/streetlights are the *only* place gradients/soft edges are
   allowed — keep that exception narrow so the pixel-art identity stays
   consistent.
5. All 6 stat/prompt screens (title, HUD, stage-clear ×1 pattern reused
   per stage, game-over, victory) share one panel component — build it
   once, themed via the chrome tokens, not 4 bespoke layouts.
