# DESIGN.md — Chicken Road Art Direction Bible

Status: READY FOR REVIEW (Stage 2)
Owner: uiux
Consumers: frontend (implements exactly what is specified here)

---

## 0. Direction & Rationale

**STATUS UPDATE (2026-07-24, M7.1b re-baseline — SCOPE-03 RESOLVED / FINAL,
not draft).** The client explicitly reversed the world-art rendering
technique described below after reviewing a live 3-way comparison (original
hard-pixel, a clearer-retro option, and a fully illustrated option) and
picking **Option B — fully smooth/illustrated** world art, having been told
in advance that this choice requires a matching chrome/HUD/particle restyle
to avoid an unintentional visual mismatch, and accepting that tradeoff
explicitly ("Lock in Option B"). This section previously described a single
unified hard-edge pixel-art identity end-to-end; it now describes a
**deliberately sequenced two-track identity**, not an unresolved
contradiction:

- **World/environment/character art (chicken, eagle, vehicles, river props,
  train, corn, ground tiles, parallax silhouettes) — Option B, illustrated:**
  smooth, clean, warm 2D flat-illustration game art with soft anti-aliased
  edges and gentle shading for volume, replacing the hard 16×16-grid
  zero-anti-aliasing pixel-art rendering technique described in the original
  paragraph below. See `docs/ASSET_MANIFEST.md` (Global Rules 2/4/5,
  re-baselined this same task) for the exact generation spec, and §10.5
  below for the decision log and the `chick-idle` adopt-vs-regenerate
  verdict.
- **Chrome/HUD/panels/in-game text/particles — UNCHANGED for now, tracked as
  its own milestone.** Everything described from §1.3 (radius/corner
  treatment) through §1.4 (shadows), §1.6 (in-game text), and §5 (particle
  specs) still specifies the original hard-edge, zero-anti-aliasing,
  hard-offset-shadow arcade-cabinet language. This is **not** an oversight or
  an internal inconsistency in this document — it is an explicitly scoped,
  explicitly sequenced follow-up milestone: **M7.7 / SCOPE-04**
  (`docs/reports/ISSUES.md`), a *separate* uiux dispatch that redesigns the
  chrome/HUD/particle language to harmonize with the new illustrated world
  art. The client was told this restyle is a required consequence of picking
  Option B (not optional) before confirming, so its absence here is a known,
  scheduled gap, not a silent side-effect. **Until M7.7 lands, treat every
  chrome/HUD/particle spec below (§1.3/1.4/1.6, §2, §5, §7.2-7.5) as
  still-current for implementation purposes, but explicitly
  superseded-pending-redesign** — frontend should keep building the
  currently-specified chrome as-is until M7.7 delivers its replacement, per
  `docs/PLAN.md` §7.12.

**Original direction (world-art portion now superseded by Option B above;
kept for history and because it still governs the chrome track until
M7.7):** "Arcade Pixel" — a chunky, high-saturation 16×16-grid pixel-art
world (NES/16-bit-adjacent) wrapped in a dark, neon-accented arcade-cabinet
UI chrome. Gameplay palettes shift dramatically per stage (bright day →
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
anything softer. **This rationale is now retained specifically as the design
intent for the CHROME track only, pending M7.7's harmonized replacement** —
it no longer describes the world/character art, which follows Option B
above.

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
- **Base tile = 48 logical px** (originally derived from the chicken's
  16×16 native pixel-art grid at the PRD-mandated 3× scale: 16 × 3 = 48).
  **Note (2026-07-24, M7.1b Option B re-baseline):** the chicken's SOURCE art
  is no longer authored on a 16×16 pixel grid (see ASSET_MANIFEST.md's
  Option-B payload-ceiling framework, ~128×128) — that specific derivation
  is now historical. The 48px tile / 336×576 virtual canvas / integer-scale
  runtime constants below are RETAINED as-is for this task (this is an
  asset-generation-spec task, not a runtime-rendering-pipeline change); how
  the new higher-resolution illustrated source art gets fit into this
  existing grid at runtime (e.g. whether `imageSmoothingEnabled` stays
  `false` for the new art) is explicitly part of M7.7's scope
  (`docs/reports/ISSUES.md` SCOPE-04), not decided here.
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

**Status update, 2026-07-24 (supersedes the original "no HF generation
used or needed" note below the line).** PRD §5 was amended the same day
(client-directed scope change, see `docs/reports/ISSUES.md` SCOPE-01) to
permit Hugging Face MCP-generated raster assets for chicken-road, provided
any that ship are inlined as base64 `data:` URIs in the single HTML file
with zero runtime network calls. This section records the first real
connectivity test of that pipeline and its honest result.

### 10.1 Pipeline verification — CONFIRMED WORKING END-TO-END

The Hugging Face MCP image-generation pipeline is now verified functional
for this project, at the orchestrator/session level:

- **MCP server:** `hugging-face`
- **Space:** `evalstate/flux1_schnell` (FLUX.1 Schnell text-to-image)
- **Exact prompt used:**
  > "retro 16-bit pixel-art countryside background, rolling green hills,
  > bright blue sky gradient, cheerful sun, flat colors, crisp pixel edges,
  > no anti-aliasing, side-scrolling arcade game backdrop, palette of sky
  > blue, pale green, sun yellow, grass green"
- **Seed:** `42`
- **Output:** 512×512 WEBP, 11,598 bytes, saved to
  `assets/test-stage1-hills-bg.webp`

This confirms the connection, authentication, and generate→save round
trip all work for this project. **Important caveat on how it was run:**
this specific test image was generated by the orchestrator directly,
*not* by a uiux (or any) subagent — two independent uiux subagent spawns
for this project attempted to call the Hugging Face MCP tools themselves
and found none of the expected `mcp__hugging-face__*` tools present in
their runtime tool schema, even though the MCP server shows as connected/
authenticated at the session level (see `docs/reports/
uiux-hf-tool-availability-test.md`, and §10.3 below). So: the underlying
HF space/model pipeline is proven reachable and correct for this project's
use case, but subagent-level tool access to it is still an open gap — see
the 🟠 ISSUE in this task's report.

### 10.2 Honest visual assessment — does NOT match the pixel-art style guide as-is

Looking at the actual saved file: it renders as a **smooth, painterly
flat-vector illustration** — soft vertical sky gradient (pale blue to
lighter blue-white near the horizon), a sun rendered as a soft radial
glow/blur (no hard disc edge), and rolling hills built from several
overlapping soft-edged color bands (yellow-green near sun-side ridge,
mid and dark greens layering toward the foreground) with a light dusting
of small flower/grass-tuft details at the very bottom edge. Colors
themselves are reasonably close to the requested palette (sky blue, pale/
mid green, sun yellow, grass green all present and legible), but the
*rendering technique* is the opposite of what was asked for and what this
project's style guide requires:

- No visible pixel grid; edges are anti-aliased and soft throughout
  (gradients, blurred sun glow, smoothly blended hill boundaries).
- Reads as generic "flat design / mobile-game-icon" illustration style,
  not the chunky 16×16-grid, zero-anti-aliasing "Arcade Pixel" language
  defined in §0/§1 of this document (hard offset shadows, notched panels,
  crisp non-blurred edges everywhere except the one deliberate headlight/
  streetlight-glow exception in §4.2/§4.4 — a sky/hill background is not
  that exception).
- FLUX.1 Schnell is a general-purpose fast text-to-image model; despite
  "pixel-art," "crisp pixel edges," and "no anti-aliasing" all being
  explicit in the prompt, the model defaulted to its native smooth-
  gradient illustration style rather than quantizing to a hard pixel
  grid. This is a known limitation of general-purpose diffusion models
  for pixel-art prompts — they tend to evoke pixel-art *color mood*
  without the discrete-grid structure that actually reads as pixel art.

**Conclusion: this specific image does NOT match chicken-road's
established pixel-art style guide well enough to use as-is.** To get an
on-brief result from this pipeline, a follow-up attempt would need
either (a) a pixel-art-specialized model/LoRA (several exist on the Hub
specifically fine-tuned for hard-edged pixel-art output), or (b) a
post-process pixelation/color-quantization pass (downscale to a small
grid — e.g. 64–128px — with nearest-neighbor resampling, then quantize
to a fixed palette, then upscale with `image-rendering: pixelated`) on
top of a FLUX.1-Schnell-generated painterly source. Neither has been
attempted yet.

### 10.3 Disposition — TEST asset only, do not wire in

`assets/test-stage1-hills-bg.webp` is a **connectivity-proof / test
artifact only**. It is not referenced anywhere in `index.html`, must not
be inlined as a base64 `data:` URI or wired into the game, and should not
be treated as approved stage-1 background art. Programmatically-drawn
parallax backgrounds per §6 remain the actual, on-brief spec for what
frontend implements for Stage 1's countryside background. If the team
later wants to pursue HF-generated raster backgrounds for real (per the
SCOPE-01 amendment), that requires a new, explicitly-approved generation
pass using a pixel-art-appropriate model/LoRA or a post-processing
pixelation step — not this file.

### 10.4 Original pre-amendment note (superseded, kept for history)

> "No Hugging Face / external raster asset generation was used or is
> needed for this project. PRD §5 is explicit and non-negotiable: 'No
> external images, fonts, audio files, or network calls' and 'all
> sprites/art drawn programmatically.' Every visual in this spec is
> described as canvas primitives (`fillRect`/simple polys) for frontend
> to implement directly in code — this is an intentional, PRD-mandated
> deviation from the general asset-generation workflow, not an oversight.
> The `design/style-guide.html` reference mockup likewise draws every
> sprite with inline canvas/CSS, no image files, to stay consistent with
> how the shipped game will actually render."

This is superseded by §10.1–10.3 above following the 2026-07-24 PRD
amendment, but the underlying recommendation for THIS shipped game is
unchanged in practice: `design/style-guide.html` and the shipped
`index.html` should continue to use programmatically-drawn canvas
primitives per §1–§7 of this document, because no HF-generated asset has
yet been produced that actually matches the required pixel-art style.

### 10.5 FINAL style decision — Option B locked, manifest re-baselined (M7.1b, 2026-07-24)

**This entry supersedes §10.2/§10.3's "does not match the style guide"
verdict as a REJECTION of smooth/illustrated rendering** — it did not match
the *pixel-art* style guide that was in force at the time, correctly. That
style guide itself has since changed. Sequence of events, added to this log
rather than replacing it, per this task's instruction to preserve history:

1. **SCOPE-03 (client feedback):** the client reviewed the M7.1 validation
   batch (hard-pixel `chick-idle`, `bg-s1-hill-far`, etc.) and reported the
   art was "too hard pixel edges... please make it less pixelated," wanting
   the subject to read clearly. `docs/reports/ISSUES.md` SCOPE-03.
2. **uiux proposal (`docs/reports/m7.1b-uiux-style-reconciliation.md`):**
   forked the resolution into Option (A) still-retro-but-clearer (higher-res,
   bounded anti-aliasing exception, PM's recommendation) vs. Option (B) fully
   smooth/illustrated (drop the pixel grid entirely), and explicitly flagged
   that (B) — unlike (A) — creates a real chrome/HUD/particle identity clash
   requiring its own restyle milestone if chosen.
3. **Client decision (final):** shown a live 3-way A/B (original hard-pixel,
   Option A, Option B), the client picked **Option B**, explicitly
   acknowledging the chrome-clash tradeoff first ("Lock in Option B").
   `docs/PLAN.md` §7.12 records the sequencing: uiux re-baselines
   DESIGN.md/ASSET_MANIFEST.md to Option B (this task, M7.1b), M7.2 full
   generation resumes, and M7.7/SCOPE-04 (separate milestone) restyles the
   chrome/HUD/particles to harmonize.
4. **This task (M7.1b re-baseline, FINAL):** `docs/ASSET_MANIFEST.md`
   Global Rules 2/4/5, every per-asset size (now a payload ceiling, not a
   pixel-grid mandate), every per-asset palette (now a hue-family guide, not
   a hard hex lock), and A3 validation checks #1/#2/#3/#7 (rewritten) / #4
   (heightened tiling-risk flag added, check itself unchanged) are all
   re-baselined to Option B in this same task. §0 above records the
   resulting two-track (illustrated world / still-hard-edge chrome)
   identity and its explicit M7.7 follow-up.

**`chick-idle` adopt-vs-regenerate verdict (this task, against the
finalized manifest):** `assets/gen/m7.1b-styleB/final/chick-idle-styleB.png`
(128×128 RGBA, chroma-keyed, no downscale/quantize applied — generated ahead
of this re-baseline as a same-seed style-B sample) was checked against the
finalized Option-B manifest spec. **Verdict: NOT adoptable as-is — 2 concrete
defects found, regeneration required, not a reprocess-only fix for both:**

1. **Baked-in ground/shadow element (fails revised A3 check #7).** The
   rendered chicken stands on a visible painted grass/ground ellipse (with
   its own soft shading and a partially-transparent feathered edge — this is
   genuine model-drawn content, not a leftover keying artifact), despite the
   prompt already containing "no scenery, no shadow." This is a known
   Option-B failure mode (illustrated/cartoon models like to ground a
   standing character on an implied surface even when told not to) — expect
   it on other standing-pose sprites (eagle, if given a standing variant;
   any future character) too, not just this one asset.
   **Fix (requires a fresh generation call, not just reprocessing):** add
   explicit negative terms beyond the existing "no scenery, no shadow" —
   `"grass tuft, ground ellipse, contact shadow, standing on grass, dirt
   patch, ground plane"` — to `chick-idle`'s negative prompt in
   ASSET_MANIFEST.md Section 1 (already updated there this task). Same seed
   (`1101`) can be reused for comparability.
2. **Un-keyed trapped background-color pocket between the legs (fails
   revised A3 check #3).** A fully opaque (alpha=255) patch of the
   background's key-color family sits between the chicken's legs — a classic
   border-connected-flood-fill limitation: that pocket isn't contiguous with
   the image border, so a simple edge-flood-fill keying pass never reaches
   it. **This specific defect IS fixable by reprocessing the existing raw
   source** (`assets/gen/m7.1b-styleB/raw/chick-idle-styleB.webp`) with the
   corrected Global Rule 2a keying technique (whole-image color-distance
   keying, not border-flood-fill only — see ASSET_MANIFEST.md Global Rule 2a,
   revised this task) — no new model call needed for this defect alone.

Because defect #1 requires a fresh generation call regardless, the practical
recommendation is: **regenerate `chick-idle` once, in one pass, using the
strengthened negative prompt AND the corrected global chroma-key technique
together** (seed `1101` reused) — rather than reprocessing now and
regenerating again later. **Flagged to the orchestrator per this task's
instructions — uiux does not have working Hugging Face MCP tools (ENV-01
still open) and is not regenerating this asset itself.**

**Resolution note (M7.2 full run, this task):** the M7.2 full-generation pass
re-ran `chick-idle` with the strengthened negative prompt + corrected
whole-image chroma-key. The A5 curation below (§10.6) confirms both defects
are gone on the new file — clean transparency (no leg-pocket residue), no
baked ground ellipse. `chick-idle`/`chick-hop` are ACCEPTED as generated.

---

## 10.6 M7.2 FULL-GENERATION CURATION (A5) — formal A3 pass, all 34 assets (2026-07-24)

**Scope & method.** This is the formal curation pass PLAN §7.13/§7.5 A5
calls for, run against every one of the 34 images in
`assets/gen/m7.2/final/*.png` (the orchestrator's generation-time review was
a spot-check only, given volume). Two complementary methods were used
together, not eyeballing alone:
1. **Pixel-level inspection** (Python/Pillow) of every `final/*.png`'s alpha
   channel — transparency completeness, enclosed key-color residue/fringe
   (color-distance-to-key vs distance-to-interior-color on every partial-alpha
   edge pixel), and connected-component analysis (stray disconnected opaque
   islands = potential artifacts).
2. **Visual inspection** at 300-600% zoom (checkerboard-composited to reveal
   alpha honestly, since a plain white/grey composite can hide a translucent
   fringe) of every asset, plus a downscale-to-actual-in-game-size readability
   check against both a light and a dark stage background for the hero
   sprites (chicken, eagle, a representative vehicle set).
3. **Ground tiles (all 11, mandatory, no sampling):** an actual 3×3 tile
   composite was rendered and inspected at both native and zoomed scale for
   every single tile — not just the 2 the orchestrator flagged by eye. A
   numeric edge-continuity signal (mean pixel difference between the tile's
   opposite edges, both a 1px and a 3px-strip measurement, normalized against
   the tile's own overall contrast) was computed for every tile as a
   cross-check, then every tile with a non-trivial signal (or, per PLAN §7.13,
   the 2 pre-flagged ones regardless of signal) was additionally rendered as a
   1×2 zoomed vertical/horizontal seam crop for a final visual call — the
   numeric signal alone is not trusted as the sole basis for a reject, only as
   a flag for where to look closer (it produced at least one false alarm,
   noted in the per-asset reasoning below, and correctly located one FAIL the
   orchestrator's spot-check hadn't caught).

**Overall result: 25 ACCEPT / 2 ACCEPT-WITH-NOTE / 3 REJECT-FALLBACK-TO-PROGRAMMATIC (tiles) / 4 REJECT-REGENERATE-NEEDED.**
Aggregate payload of the 34 `final/*.png` files as generated: **512KB** raw
(≈680KB once base64-inlined) — comfortably inside the R11 budget concern even
before dropping the 7 non-accepted assets' bytes; no payload-driven rejection
was needed on any asset.

### 10.6.1 Ground tiles — mandatory full 3×3 tiling check, all 11 (Section 7)

| ID | Verdict | A3 check(s) | Reasoning |
|---|---|---|---|
| `tile-s1-grass` | ACCEPT | #1,#2,#4 | 3×3 composite is clean at both 100%/300% zoom; sparse blade-tick texture has enough natural irregularity to hide the repeat boundary entirely. Base/tick hues match the S1 bright-green anchor. |
| `tile-s1-road` | ACCEPT | #4 | Dashed lane-marking runs continuously across every tile boundary in the 3×3 render, left-right and top-bottom; only a barely-perceptible vertical join line in the flat asphalt fill, well under the "visible seam" bar. |
| `tile-s1-river` | ACCEPT | #4 | Flat-water texture with subtle ripple striations tiles seamlessly in both directions; no boundary discontinuity at any zoom level. |
| `tile-s1-rail` | ACCEPT | #4 | Vertical wood-tie striations and both horizontal metal rail lines align perfectly at every 3×3 boundary — the cleanest tile in the set. |
| `tile-s2-grass` | ACCEPT | #4,#2 | Busy dark park-strip texture tiles well; a faint periodic "tell" is visible on close inspection but not a seam/discontinuity, and the texture's own busyness (matching DESIGN §3.2's desaturated-night mood) keeps it from reading as a repeat at gameplay speed/scroll. |
| `tile-s2-road` | **REJECT-FALLBACK-TO-PROGRAMMATIC** | **#4 — NEW FAIL, not in the orchestrator's original 2-item flag list** | A vertical 1×2 stack render shows a clear top-to-bottom internal gradient (lighter/cooler near the top edge, darker toward the bottom) baked into the tile that **resets abruptly at every vertical tile boundary**, producing a visible repeating horizontal "banding" pattern — confirmed both visually and numerically (top/bottom edge mean pixel diff ≈28, vs. the tile's own std of ≈30, i.e. the seam is nearly as large as the tile's total internal contrast). Left-right (dash continuity) is fine; it's specifically the vertical repeat that fails. **This is a confirmed formal finding this task adds beyond the 2 pre-flagged tiles** — falls back to the existing programmatic S2-road fill per PLAN §7.3/R13. |
| `tile-s2-river` | ACCEPT | #4 | Near-solid flat dark canal color (matches "flat, moonlit" spec) — trivially seamless; lowest edge-diff signal of any tile in the set. |
| `tile-s2-rail` | ACCEPT | #4 | Same clean tie/rail alignment as `tile-s1-rail`; tiles perfectly in both directions. |
| `tile-s3-ground` | **ACCEPT-WITH-NOTE** | #4 | 3×3 composite has no hard seam or color break, but a soft mirrored "mottling" motif repeats with just-perceptible regularity, and a 1×2 vertical zoom shows a very faint horizontal tonal line at the boundary. Judged acceptable (no discontinuity, only a mild repeat-tell) given this is a low-scrutiny full-fill ground layer mostly occluded by obstacles/chicken during play — not a REJECT, but noted for a possible future polish pass (e.g. a second offset variant to break the mirror symmetry). |
| `tile-s3-road` | **REJECT-FALLBACK-TO-PROGRAMMATIC (CONFIRMED)** | #4, #1 | Orchestrator's spot-check flag CONFIRMED by formal check: the 3×3 render shows the diagonal hazard stripes are inconsistent within the tile itself — one stripe pair renders crisp/solid, the other renders as a soft, blurred, shorter smudge — producing an uneven, non-uniform hazard-tape rhythm once tiled (both a #4 tiling "repeating-pattern tell/uneven" fail and borderline #1 clean-rendering issue on the blurred stripe). Falls back to the existing programmatic S3-road hazard-stripe fill. |
| `tile-s3-rail` | **REJECT-FALLBACK-TO-PROGRAMMATIC (CONFIRMED)** | #4 | Orchestrator's spot-check flag CONFIRMED: unlike `tile-s1-rail`/`tile-s2-rail` (rail lines symmetric near top/bottom edges), this tile's rail/tie structure is asymmetric — a nearly-empty rust-plank band occupies the top ~15% while a dense cross-tie/bolt structure fills the rest. A 1×2 vertical zoom shows this produces an obvious horizontal banding seam (empty band directly abutting dense structure at every repeat) — a textbook vertical-tiling fail. Falls back to the existing programmatic S3-rail fill (highest rail frequency stage per spec — the programmatic fallback already renders this correctly). |

**Tiles: 8 ACCEPT (7 clean + 1 with-note) / 3 REJECT-FALLBACK.** Confirms
both orchestrator flags and adds one the spot-check missed
(`tile-s2-road`) — in line with the manifest's own "expect a HIGHER
tile-rejection rate under Option B" heightened-risk note (A3 #4). All 3
fallbacks are zero-risk per PLAN §7.3/Constraint 5: the existing
programmatic fill for that stage/lane-type is already wired and simply stays
active; no code change is required to ship this result.

### 10.6.2 Chicken (Section 1)

| ID | Verdict | A3 check(s) | Reasoning |
|---|---|---|---|
| `chick-idle` | ACCEPT | #1,#2,#3,#5,#7 | Both defects found on the earlier `chick-idle-styleB` pre-sample (DESIGN §10.5) are CONFIRMED FIXED on this M7.2 file: zoomed feet/leg inspection shows clean transparency between the legs (no trapped key-color pocket) and no baked ground ellipse/shadow. Clean cream/tan/red-comb silhouette, reads clearly at 48×48 against both light and dark test backgrounds. |
| `chick-hop` | ACCEPT | #1,#2,#3,#5,#7 | Same clean result — wing-flare silhouette bump present and readable, single leg extended in hop pose, no ground element, no key residue. |

### 10.6.3 Vehicles (Section 2)

| ID | Verdict | A3 check(s) | Reasoning |
|---|---|---|---|
| `veh-s1-car` | ACCEPT | all | Clean bright-orange S1 car, transparent, no artifacts. |
| `veh-s1-truck` | ACCEPT | all | Clean, cab/cargo differentiation reads well, no ground element. |
| `veh-s2-bus` | ACCEPT | all,#6 | Clean dark-teal night bus with warm-yellow window row, correctly reads cooler/nighttime vs. S1. |
| `veh-s2-car` | ACCEPT | #3 (double-checked) | An automated color-distance metric flagged a possible fringe on this near-black-bodied sedan; a dedicated checkerboard zoom found it to be a false positive (near-black interior colors sit numerically "close" to any saturated key in Euclidean RGB space without any visible tint) — no actual green fringe visible on inspection. Clean. |
| `veh-s2-truck` | **REJECT-REGENERATE-NEEDED (CONFIRMED STILL FAILING — final independent re-check, 2026-07-24)** | **#7** | **Final re-verification of the orchestrator's 3rd-round fix (seed 1209 regeneration + connected-component post-process claim):** the earlier blue-grey ellipse is gone from this newest file, but independent pixel/connected-component analysis (native 107×64) at the standard alpha>200 opacity threshold finds it REPLACED, not eliminated — a pale grey-white shadow blob (506px, rows 57-63, spanning x=3-105, i.e. nearly the full 107px width) remains a SEPARATE opaque region from the truck body (4489px, rows 0-55), bridged only by one row (row 56) of faint partial alpha (max 53/255, mean 6/255) — not a real structural connection. This explains the discrepancy with the orchestrator's report: a near-zero/`>0` alpha threshold treats that thin AA bridge as connective tissue and reports "1 component", but independently re-run at thresholds 50/127/200 the two blobs separate cleanly every time. Direct 8×-zoomed checkerboard inspection AND in-context composites over both a mid-tone S2 road grey and a dark asphalt tone show an unambiguous pale horizontal shadow band spanning the full width beneath both wheels — clearly distinct in shape/position from the wheel-rim hub circles above it (small, circular, centered per-wheel, not a continuous underbody strip). **This is NOT the "wheel-rim highlight" false positive the automated grey-pixel heuristic suggested** — the defect's geometry (a wide flat band under the whole vehicle) is inconsistent with legitimate rim coloring and matches every prior ground-contact-shadow failure (same A3 check #7 family). **VERDICT: REJECT stands, independently re-confirmed.** Recommend a 3rd regeneration attempt, or the same keep-largest-connected-component post-process that fixed `veh-s3-truck` below — note it will need a lower connectivity threshold (e.g. treat alpha<80 as background before labeling) since a naive `>0` pass under-reports this file's shadow as already-merged with the body. |
| `veh-s3-car` | ACCEPT | #2 (cosmetic) | Reads as a plain grey rather than the prompt's "rougher rust-tinted" grimy-industrial mood — a cosmetic hue-intensity miss under Option B's loosened hue-family guide, not a wrong hue family. Default ACCEPT per curation instruction (no real defect). |
| `veh-s3-truck` | **ACCEPT (fixed by keep-largest-connected-component post-process, confirmed 2026-07-24)** | **#7 (resolved)** | **Final re-verification of the orchestrator's mechanical post-process fix:** independent connected-component scan (native 94×53) finds exactly ONE opaque component at every alpha threshold tested (0/10/50/127/200) — 3909px at threshold 200, bbox rows 0-51 — where the prior file had two (4111px body + 375px shadow blob). Per-row alpha profile tapers cleanly from 254/255 at row 41 down to 0.5/255 by row 52 (the last row) with no reappearing opaque band and no stray islands at any threshold. 8×-zoomed checkerboard crop and an in-context composite over a dark-asphalt tone both show a clean, unshadowed underbody — the disconnected tan/beige ellipse from the prior re-verification pass is gone. **VERDICT: ACCEPT, independently confirmed.** Promoted into the registry (§10.6.11) — the only asset moving from REJECT to ACCEPT in this final pass. |

### 10.6.4 River objects (Section 3)

| ID | Verdict | A3 check(s) | Reasoning |
|---|---|---|---|
| `log-s1` | ACCEPT | all | Clean wood-grain log with stepped (not rounded) end-caps as specified, transparent, no artifacts. |
| `log-s2` | ACCEPT | all | Clean, visibly grimier/darker tone matching S2 vs. `log-s1`. |
| `lily-pad` | ACCEPT | #3 (double-checked) | Magenta key (used because the pad's own base/vein hexes are green) produced a clean result on inspection — no pink/magenta residue at the edge; the automated distance metric's ~15% "closer to key" reading was a false positive from the green-subject/magenta-key color-space ambiguity, not an actual visible fringe. No flower baked in, per spec. |

### 10.6.5 Train + signal (Section 4)

| ID | Verdict | A3 check(s) | Reasoning |
|---|---|---|---|
| `train-car` | ACCEPT | #3,#8 | An automated metric initially flagged a high "closer to key" score for this near-black car body; a dedicated nearest-neighbor zoom found the edge is a clean anti-aliased black-to-transparent gradient with no visible green tint — same near-black false-positive pattern as `veh-s2-car`. No baked headlamp glow (#8 respected). Cosmetic-only note: wheels are visible though the prompt requested "no wheels visible, cropped low" — minor prompt-adherence miss, default ACCEPT (the programmatic ghost-trail overlay still composites fine over this). |
| `signal-housing` | ACCEPT | #3,#8 | Clean dark pole+box, transparent, no lit lamp baked in (glow exception respected — the red/amber flash stays programmatic as specified). |

### 10.6.6 Corn (Section 5)

| ID | Verdict | A3 check(s) | Reasoning |
|---|---|---|---|
| `corn-pickup` | ACCEPT | all | Clean gold-kernel/green-husk cluster, no sparkle baked in (sparkle stays a `ParticleSystem` effect per spec), transparent, magenta key clean. |

### 10.6.7 Eagle (Section 6)

| ID | Verdict | A3 check(s) | Reasoning |
|---|---|---|---|
| `eagle-flying` | ACCEPT | all | Clean full-wingspan swoop silhouette, reads clearly at ~72×72 in-game size against both light/dark test backgrounds; no ground element (flying pose has none to bake in), no artifacts (the 8 "connected components" the automated check found on the *grabbed* variant do not appear here). |
| `eagle-grabbed` | **ACCEPT (re-verified 2026-07-24, fixed on 2nd regeneration attempt)** | **#1,#3,#7** | **Re-verification of the M7.2.1 regenerated file confirms both prior defects are gone.** Ground-shadow patch (A3 #7): pixel scan of the bottom 15 rows shows a clean, smooth taper from 56 opaque px down to 0 by the last row, with only expected anti-aliased partial-alpha talon-edge pixels remaining (max 47px partial) — no reappearing opaque band, no separate connected component (single 8000px blob total, confirmed via full connected-component scan, 0 stray islands). Pose distinctiveness (the first regen attempt's other defect, spread wings reading too similar to `eagle-flying`): this file's wings are clearly swept back/folded tight against the body in a diving posture, visually distinct in silhouette from `eagle-flying`'s full horizontal spread-wing pose — confirmed side by side. Talons extended downward, grab-pose reads clearly. Clean magenta/green-key transparency, no residue. |

### 10.6.8 Parallax silhouettes (Section 8)

| ID | Verdict | A3 check(s) | Reasoning |
|---|---|---|---|
| `bg-s1-hill-far` | ACCEPT | #3 (double-checked) | Full-image zoom confirms the crest "highlight" is a natural lighter-green shading band as specified, not magenta key residue — the automated metric's ~17% "closer to key" reading is a false positive from comparing a green subject against a magenta key in RGB-distance space (both are far from most greys, so mid-tone highlight pixels can land statistically "closer" to either without actually carrying that hue). No visible pink/magenta fringe anywhere on inspection. Clean magenta key overall. |
| `bg-s1-hill-near` | ACCEPT | #3 | Same result as `-far` — clean, darker-green near-layer tone correctly distinct from `-far`. |
| `bg-s1-sun` | ACCEPT | #3 (double-checked) | A corner-crop zoom at 6× confirms a clean anti-aliased orange-to-transparent edge with no green tint anywhere — an earlier low-res preview read was a false visual impression, not a real fringe. No glow halo baked in (matches negative). |
| `bg-s2-skyline` | **ACCEPT (re-verified 2026-07-24, fixed by reprocess)** | **#3** | **Re-verification confirms the reprocess fix worked.** The corrected border-pixel-MODE keying (vs. the original 4-corner-average, which this asset's bottom-touching silhouette corrupted) now yields ~45.5% transparent pixels (was 0%), a single connected silhouette component, and 0% of fully-opaque pixels within color-distance 60 of the `#00FF00` key — no un-keyed residue. The prior ~3% un-keyed "window gap" secondary defect is also resolved: an enclosed-hole flood-fill scan (border-connected transparent/partial region vs. isolated pockets) finds only 3 stray pixels (0.07% of canvas) not reachable from the border, down from the earlier ~3% — well within normal anti-aliasing noise, not a defect. Clean skyline silhouette, spire and building-block massing both read clearly against the transparent backdrop. |
| `bg-s2-building` | ACCEPT | #2 (cosmetic) | Clean navy/purple building block, transparent; only 1 lit window cell rendered vs. the prompt's "3-4 window cells" — a cosmetic count miss under Option B's loosened guide, default ACCEPT. |
| `bg-s3-smokestack` | **ACCEPT-WITH-NOTE** | #3 | A 6× zoom of the smokestack's right edge shows a thin (~1-2px) green key-color fringe line, distinct from the smokestack's own near-black/grey palette — a real but minor residual-key defect, not a fabricated one (confirmed by both the automated edge-color metric and direct visual zoom, unlike the false positives above). Judged ACCEPT rather than reject given its severity: at this asset's ~64×128 payload size, further scaled down for a distant parallax layer, a 1-2px fringe will shrink toward sub-pixel and is very unlikely to read as an error at gameplay viewing distance. Noted for an easy future re-key/erosion-pass touch-up, not blocking. |

### 10.6.9 Summary count

**Original pass: 25 ACCEPT · 2 ACCEPT-WITH-NOTE (`tile-s3-ground`, `bg-s3-smokestack`) · 3 REJECT-FALLBACK-TO-PROGRAMMATIC (`tile-s2-road`, `tile-s3-road`, `tile-s3-rail`) · 4 REJECT-REGENERATE-NEEDED (`veh-s2-truck`, `veh-s3-truck`, `eagle-grabbed`, `bg-s2-skyline`).**

**Updated after re-verification pass, 2026-07-24 (§10.6.10): 27 ACCEPT · 2
ACCEPT-WITH-NOTE · 3 REJECT-FALLBACK-TO-PROGRAMMATIC · 2 STILL
REJECT-REGENERATE-NEEDED (`veh-s2-truck`, `veh-s3-truck`) · 0 pending
(`eagle-grabbed`, `bg-s2-skyline` now ACCEPT).**

Of the original 4 regenerate-needed assets, 2 are now confirmed fixed:
`bg-s2-skyline` (reprocess-only fix, corrected border-pixel-MODE keying)
and `eagle-grabbed` (regenerated with a corrected pose + ground-patch
negative prompt, took 2 regeneration attempts). The other 2
(`veh-s2-truck`, `veh-s3-truck`) were regenerated once with a strengthened
ground/shadow negative prompt, which removed the ORIGINAL green-patch/
tan-ellipse defect, but re-verification found a recurring contact-shadow
artifact still baked into both files (recolored — pale blue-grey on
`veh-s2-truck`, tan/beige on `veh-s3-truck` — but the same underlying A3
check #7 failure mode). See §10.6.10 for full re-verification detail and
recommended next fix per asset. None of the 3 tile fallbacks need any
generation work at all — they simply stay on the existing programmatic
fill, per PLAN §7.3's zero-risk-by-design fallback path.

**FINAL tally after the orchestrator's mechanical-fix round + this task's
independent re-check, 2026-07-24: 28 ACCEPT · 2 ACCEPT-WITH-NOTE · 3
REJECT-FALLBACK-TO-PROGRAMMATIC (tiles) · 1 STILL REJECT-REGENERATE-NEEDED
(`veh-s2-truck`) · 0 pending.** `veh-s3-truck` is now CONFIRMED FIXED (the
orchestrator's keep-largest-connected-component post-process resolved the
disconnected shadow blob; independently re-verified by pixel/
connected-component scan and visual composite, see updated §10.6.3 row) and
moves to ACCEPT. `veh-s2-truck` was regenerated once more (seed 1209) and
a post-process pass was attempted, but independent re-verification still
finds a real, separately-connected shadow blob under the wheels (full
detail in the updated §10.6.3 row) — it remains the SOLE asset still
excluded from the registry on a genuine-defect basis (the 3 tile fallbacks
are zero-risk-by-design, not defects awaiting a fix). **Final
accepted/registry-eligible count: 30 of 34 assets.**

### 10.6.10 Re-verification of the 4 regenerated/reprocessed assets (2026-07-24)

**Scope & method.** Follow-up to §10.6.3/§10.6.7/§10.6.8's 4
REJECT-REGENERATE-NEEDED verdicts. The orchestrator reprocessed
`bg-s2-skyline` (corrected border-pixel-MODE chroma-key, same raw file) and
regenerated `veh-s2-truck`/`veh-s3-truck`/`eagle-grabbed` (strengthened
negative prompts; `eagle-grabbed` took a 2nd attempt after its 1st still
showed spread wings + a ground patch). This is a targeted re-run of the
SAME A3 checks used in the original A5 pass against only these 4 updated
`final/*.png` files (not a redo of the other 30) — pixel-level alpha/
transparency scan, key-color-residue distance check on both partial- and
full-alpha pixels, connected-component analysis (stray islands / disconnected
blobs), and checkerboard-composited visual zoom, plus an in-context
composite over representative light and dark stage-background tones for the
vehicle rows specifically (to judge real in-game visibility, not just
checkerboard visibility).

**Result: 2 of 4 now ACCEPT, 2 of 4 still fail and remain
REJECT-REGENERATE-NEEDED.**

- **`bg-s2-skyline` — ACCEPT.** Confirmed fixed: 45.5% transparent (was 0%),
  single connected silhouette, 0% opaque-pixel key residue, enclosed-hole
  scan down to 0.07% (was ~3%). See updated §10.6.8 row.
- **`eagle-grabbed` — ACCEPT.** Confirmed fixed: pose now clearly reads as
  swept-back/folded wings in a diving posture, visually distinct from
  `eagle-flying`'s spread-wing silhouette; smooth alpha taper to 0 at the
  feet with no reappearing opaque band; single connected component, 0 stray
  islands. See updated §10.6.7 row.
- **`veh-s2-truck` — STILL REJECT.** The original opaque green grass patch
  is gone, but a solid (mean alpha 234/255), pale blue-grey contact-shadow
  ellipse is now baked in under the wheels instead — same A3 check #7
  failure family, different color. It stays opaque even at an alpha>200
  threshold and remains a single connected blob with the vehicle body (not a
  separable stray island), and is clearly visible when composited over both
  a mid-tone road grey and a dark asphalt tone, not just checkerboard. Needs
  either a further negative-prompt/seed iteration, or a careful bottom-row
  alpha-erase (harder here than for `veh-s3-truck` because the shadow is
  alpha-fused to the wheel-contact pixels, not a clean separable region).
  See updated §10.6.3 row.
- **`veh-s3-truck` — STILL REJECT.** Same underlying defect, worse in one
  sense (more obviously a baked shadow, since it's a fully separate opaque
  tan/beige blob floating below the truck body with a transparent gap in
  between) but easier to fix in another sense: because it's a genuinely
  disconnected connected-component (confirmed via full connected-component
  scan: 4111px body + 375px shadow blob, spatially separated), a simple
  post-process step that keeps only the largest opaque connected component
  and discards the rest would remove it with no new generation call needed.
  See updated §10.6.3 row.

**Net effect on the accepted set:** 25 → 27 ACCEPT (the 2 newly fixed
assets), registry count in §10.6.11 below grows from 27 to 29. The 2 tile
counts and the 3 tile fallback verdicts are unchanged (out of scope for
this re-verification pass). `veh-s2-truck`/`veh-s3-truck` remain excluded
from the registry and their existing programmatic `Vehicle` draw calls stay
wired, unchanged, per the fallback-first design.

### 10.6.11 Asset registry — accepted set, for frontend integration (M7.4)

**FINAL SYNC, 2026-07-24 (this task).** Below is the filtered,
ACCEPT/ACCEPT-WITH-NOTE subset — **30 of 34** — with its exact file path,
native pixel size, and what it replaces in `index.html`
(cross-referenced from `ASSET_MANIFEST.md` Sections 1-8, filtered to only
the assets cleared by this curation pass). This supersedes the prior
29-asset registry: `veh-s3-truck` is added (independently re-verified
ACCEPT, see updated §10.6.3 row and §10.6.9 final tally) alongside the
`bg-s2-skyline`/`eagle-grabbed` additions from the previous pass. Every
`path` below was checked to exist on disk at
`assets/gen/m7.2/final/*.png` as of this sync. The 3 REJECT-FALLBACK tiles
and the 1 still-open REJECT-REGENERATE asset (`veh-s2-truck`) are
DELIBERATELY OMITTED from this registry — frontend should not wire them;
the existing programmatic draw call stays active for all 4 (PLAN §7.2
Constraint 5 / Global Rule 8), exactly as if they were never generated.

```json
{
  "chick-idle":      { "path": "assets/gen/m7.2/final/chick-idle.png",      "size": "81x128",  "replaces": "CHICKEN_ROWS/CHICKEN_PAL + drawChickenSprite() idle branch (Player.render ~896-909); also _renderTitle() hero chicken (~1518-1525)", "mode": "full-replacement" },
  "chick-hop":       { "path": "assets/gen/m7.2/final/chick-hop.png",       "size": "104x128", "replaces": "Player.render() hopping branch transform + drawChickenSprite() wing-out block (~897-903/185-190)", "mode": "full-replacement" },
  "veh-s1-car":      { "path": "assets/gen/m7.2/final/veh-s1-car.png",      "size": "96x46",   "replaces": "Vehicle body/cabin/wheel draw (574-591), S1 car color", "mode": "full-replacement" },
  "veh-s1-truck":    { "path": "assets/gen/m7.2/final/veh-s1-truck.png",    "size": "122x64",  "replaces": "Vehicle draw, S1 truck cab-differentiation block (579-582)", "mode": "full-replacement" },
  "veh-s2-bus":      { "path": "assets/gen/m7.2/final/veh-s2-bus.png",      "size": "130x64",  "replaces": "Vehicle draw, S2-only boxy window-row block (583-584)", "mode": "full-replacement" },
  "veh-s2-car":      { "path": "assets/gen/m7.2/final/veh-s2-car.png",      "size": "96x33",   "replaces": "Vehicle draw, S2 car color/window/taillight", "mode": "full-replacement" },
  "veh-s3-car":      { "path": "assets/gen/m7.2/final/veh-s3-car.png",      "size": "96x62",   "replaces": "Vehicle draw, S3 car color/window", "mode": "full-replacement" },
  "veh-s3-truck":    { "path": "assets/gen/m7.2/final/veh-s3-truck.png",    "size": "94x53",   "replaces": "Vehicle draw, S3 truck cab-differentiation block", "mode": "full-replacement — ADDED 2026-07-24 final registry sync, previously excluded (§10.6.10/§10.6.3: keep-largest-connected-component post-process confirmed fixed, independently re-verified)" },
  "log-s1":          { "path": "assets/gen/m7.2/final/log-s1.png",          "size": "96x25",   "replaces": "Log.render() non-pad branch, S1 body/dark/hi colors (617-621)", "mode": "full-replacement (horizontal stretch to variable w, as code already varies today)" },
  "log-s2":          { "path": "assets/gen/m7.2/final/log-s2.png",          "size": "96x18",   "replaces": "Log.render() non-pad branch, S2 grimier body/dark/hi colors", "mode": "full-replacement (stretch)" },
  "lily-pad":        { "path": "assets/gen/m7.2/final/lily-pad.png",        "size": "32x32",   "replaces": "Log.render() isPad branch, hardcoded pad colors (613-616)", "mode": "full-replacement" },
  "train-car":       { "path": "assets/gen/m7.2/final/train-car.png",       "size": "96x49",   "replaces": "Train.render() car-unit loop (690-696) — 1 sprite, looped 5x; ghost-trail (684-689) + headlamp glow (698-701) stay programmatic overlays on top", "mode": "full-replacement" },
  "signal-housing":  { "path": "assets/gen/m7.2/final/signal-housing.png",  "size": "43x112",  "replaces": "Train.renderSignal() dark housing box (673-674); lamp roundel color stays programmatic (676-678)", "mode": "full-replacement" },
  "corn-pickup":     { "path": "assets/gen/m7.2/final/corn-pickup.png",     "size": "50x64",   "replaces": "Lane._drawCorn() kernel/husk fillRects (542-544); spin transform (541) + sparkle ParticleSystem (277-283) stay programmatic", "mode": "full-replacement" },
  "eagle-flying":    { "path": "assets/gen/m7.2/final/eagle-flying.png",    "size": "160x108", "replaces": "Eagle.render() !this.grabbed branch (~735)", "mode": "full-replacement" },
  "eagle-grabbed":   { "path": "assets/gen/m7.2/final/eagle-grabbed.png",   "size": "125x128", "replaces": "Eagle.render() this.grabbed branch (~742-745, held-chicken overlay stays programmatic on top)", "mode": "full-replacement — added 2026-07-24 re-verification, previously excluded" },
  "tile-s1-grass":   { "path": "assets/gen/m7.2/final/tile-s1-grass.png",   "size": "128x128", "replaces": "Lane.renderBase() 490-493, S1 safe/safeAlt/safeEdge fill", "mode": "full-replacement (tiled across 336px lane width; row-alt shade via brightness overlay per existing plan)" },
  "tile-s1-road":    { "path": "assets/gen/m7.2/final/tile-s1-road.png",    "size": "128x128", "replaces": "Lane.renderBase() 494-495/499-501, S1 dashed marking", "mode": "full-replacement (tiled)" },
  "tile-s1-river":   { "path": "assets/gen/m7.2/final/tile-s1-river.png",   "size": "128x128", "replaces": "Lane.renderBase() 502-504 base fill (shimmer overlay 505-508 stays programmatic on top)", "mode": "full-replacement (tiled)" },
  "tile-s1-rail":    { "path": "assets/gen/m7.2/final/tile-s1-rail.png",    "size": "128x128", "replaces": "Lane.renderBase() 509-514, S1 rail-bed/metal/ties", "mode": "full-replacement (tiled)" },
  "tile-s2-grass":   { "path": "assets/gen/m7.2/final/tile-s2-grass.png",   "size": "128x128", "replaces": "Lane.renderBase() 490-493, S2 desaturated park-strip fill", "mode": "full-replacement (tiled)" },
  "tile-s2-river":   { "path": "assets/gen/m7.2/final/tile-s2-river.png",   "size": "128x128", "replaces": "Lane.renderBase() 502-504, S2 canal base (shimmer stays programmatic)", "mode": "full-replacement (tiled)" },
  "tile-s2-rail":    { "path": "assets/gen/m7.2/final/tile-s2-rail.png",    "size": "128x128", "replaces": "Lane.renderBase() 509-514, S2 rail-bed/metal/ties", "mode": "full-replacement (tiled)" },
  "tile-s3-ground":  { "path": "assets/gen/m7.2/final/tile-s3-ground.png",  "size": "128x128", "replaces": "Lane.renderBase() 490-493, S3 grimy-ground fill", "mode": "full-replacement (tiled) — ACCEPT-WITH-NOTE, faint repeat-tell, monitor in playtest" },
  "bg-s1-hill-far":  { "path": "assets/gen/m7.2/final/bg-s1-hill-far.png",  "size": "128x25",  "replaces": "_renderParallax() far hill-arc silhouette loop (1423-1424)", "mode": "full-replacement (discrete repeated unit, not tiling-gated per §Section 8 note)" },
  "bg-s1-hill-near": { "path": "assets/gen/m7.2/final/bg-s1-hill-near.png", "size": "127x16",  "replaces": "_renderParallax() near hill-arc silhouette loop (1425-1426)", "mode": "full-replacement" },
  "bg-s1-sun":       { "path": "assets/gen/m7.2/final/bg-s1-sun.png",       "size": "96x96",   "replaces": "_renderParallax() static sun disc (1422)", "mode": "full-replacement" },
  "bg-s2-building":  { "path": "assets/gen/m7.2/final/bg-s2-building.png",  "size": "53x96",   "replaces": "_renderParallax() near building row loop incl. lit window cells (1432-1437)", "mode": "full-replacement" },
  "bg-s3-smokestack":{ "path": "assets/gen/m7.2/final/bg-s3-smokestack.png","size": "64x119",  "replaces": "_renderParallax() smokestack pair silhouette loop (1439-1440)", "mode": "full-replacement — ACCEPT-WITH-NOTE, thin edge fringe, cosmetic only at this render size" },
  "bg-s2-skyline":   { "path": "assets/gen/m7.2/final/bg-s2-skyline.png",   "size": "71x64",   "replaces": "_renderParallax() distant skyline block loop (1430-1431)", "mode": "full-replacement — added 2026-07-24 re-verification (reprocess fix), previously excluded" }
}
```

**NOT in the registry — programmatic fallback stays wired as-is, no frontend action needed:**
`tile-s2-road`, `tile-s3-road`, `tile-s3-rail` (tiling fail → existing
`Lane.renderBase()` fill for that stage/lane stays active, permanent
zero-risk fallback per PLAN §7.3); `veh-s2-truck` (real ground-contact-
shadow defect, CONFIRMED STILL PRESENT on this task's final independent
re-check — recolored across 2 regeneration attempts but never eliminated —
existing `Vehicle` draw call stays active until a corrected file lands in
a follow-up increment, at which point it slots into the registry above
with zero other code change, per the fallback-first design). `veh-s3-truck`
was CONFIRMED FIXED this task (keep-largest-connected-component
post-process eliminated the disconnected shadow blob, independently
re-verified) and has been ADDED to the registry above. `eagle-grabbed` and
`bg-s2-skyline` were confirmed FIXED on the prior re-verification pass and
remain in the registry (no longer excluded).

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
6. **Do not** pull in `assets/test-stage1-hills-bg.webp` — per §10, it's a
   pipeline-connectivity test only, does not match the pixel-art style
   guide as generated, and is not approved art. Stage 1's background
   remains the programmatic parallax spec in §6.
7. **M7.2 asset registry (§10.6.11, FINAL SYNC 2026-07-24):** wire the 30
   ACCEPT/ACCEPT-WITH-NOTE generated images per the JSON registry — `id →
   data:` URI (base64-inline the listed `final/*.png` files),
   `imageSmoothingEnabled = false` unless/until M7.7 says otherwise,
   draw-call fallback-first (registry present → draw image; absent → keep
   the existing programmatic call, no deletion). Do NOT wire the 3 fallback
   tiles (`tile-s2-road`, `tile-s3-road`, `tile-s3-rail`) or the 1
   still-open reject-regenerate asset (`veh-s2-truck`) listed as excluded
   in §10.6.11 — their existing programmatic draws stay live untouched.
   `veh-s3-truck` is NEW in this final sync (independently re-verified
   ACCEPT — the shadow-blob defect is fixed) — wire it along with the
   other 29 (which includes `eagle-grabbed`/`bg-s2-skyline` added in the
   prior pass).
</content>
