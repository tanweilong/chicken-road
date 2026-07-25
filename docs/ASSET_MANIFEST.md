# ASSET MANIFEST — Milestone M7.0 (Asset Regeneration & Integration)

Status: SPEC ONLY — no assets generated in this task (ENV-01: subagent has no
working Hugging Face MCP tools). This document is the complete brief the
**orchestrator** executes against. uiux (this doc's author) curates the
results afterward in a new DESIGN.md §10.5 (M7.3).

**Revision note (2026-07-24, ENV-02 pivot):** Global Rule 1 below was revised
to pivot the mandated image-generation path from `lm555/game-asset-generator`
(unusable — ENV-02) to `evalstate/flux1_schnell` + the mandatory Rule 2
post-process, per PM decision recorded in `docs/reports/ISSUES.md` (ENV-02)
and `docs/PLAN.md` §7.9. Every per-asset prompt below was also checked/updated
so its ending explicitly requests a solid chroma-key backdrop (Rule 2a needs
something clean to key against — FLUX.1-Schnell does not produce native alpha
transparency the way `lm555`'s built-in op was expected to). Nothing else in
this document (asset list, validation criteria, validation batch, SFX
section) changed in this revision.

**Revision note (2026-07-24, ENV-02 per-asset key-color fix — M7.1 GO/NO-GO
follow-up):** `bg-s1-hill-far` FAILED the M7.1 validation batch on a
chroma-key collision, not a style-fit problem: its own approved fill
(`#A6DE7A`, pale green) sat too close to the universal `#00FF00` key, so
FLUX rendered the hill and the backdrop as one indistinguishable green
region and the flood-fill keyed out almost the entire image. Per PM's
CONDITIONAL-GO decision (`docs/reports/ISSUES.md` ENV-02 update,
`docs/PLAN.md` §7.10), the Global Rules section below now opens with an
explicit **per-asset key-color policy** note (unnumbered, sits above Rule 1
so it governs every rule/entry that mentions a chroma-key backdrop without
renumbering anything else in this document), and every entry whose own
palette is green-dominant has had its chroma-key backdrop instruction
swapped from the blanket `#00FF00` to an asset-specific color chosen to be
maximally distant from that asset's own hex list. Changed in this revision:
`bg-s1-hill-far`, `bg-s1-hill-near` (Section 8), `lily-pad` (Section 3), and
`corn-pickup` (Section 5) — all switched to `#FF00FF` magenta. See the 🟠
ISSUES note in this task's handoff for assets that were considered but
correctly left unchanged (ground tiles, logs, river tiles) and why. A1
(asset list), A3 (validation criteria), A4 (validation batch selection/
results), and the SFX section are unchanged in this revision — all their
existing "Global Rule N" cross-references still resolve correctly since the
numbered rules below keep their original numbers (1-10); only an unnumbered
policy note was added ahead of them.

**Revision note (2026-07-24, M7.1b — Option B FINAL re-baseline, SCOPE-03
RESOLVED/SCOPE-04, supersedes all hard-pixel-art framing below):** the
client locked **Option B (fully smooth/illustrated)** world art after a
3-way A/B comparison, explicitly accepting that this requires a separate
chrome/HUD/particle restyle (tracked as its own milestone, M7.7/SCOPE-04 —
NOT touched by this revision). This revision makes that FINAL, not draft:
Global Rule 5 (style prefix) drops all hard-pixel-art language; Global Rule 2
drops steps 2b (nearest-neighbor downscale) and 2c (palette-quantize),
keeping ONLY step 2a (chroma-key → transparency); Global Rule 4 (negative
baseline) drops now-contradictory anti-illustration terms and adds
Option-B-relevant ones; every per-asset "native size" becomes a **payload-
bound ceiling** (see the new Option-B Payload-Ceiling Framework below), not
a pixel-grid mandate; every per-asset hex list becomes a **hue-family guide**
(no hard ΔE snap); A3 checks #1/#2/#3/#7 are rewritten for the new style,
#4 (tiling) stays mandatory and UNCHANGED with an added heightened-risk
flag, #5/#6/#8 are lightly adapted. The per-asset chroma-key COLOR policy
above (which color to key against, per asset) is UNAFFECTED by this
revision — only the keying MECHANISM (Rule 2a) gets a technique correction
(see below), not the color-choice policy. See `docs/DESIGN.md` §0/§10.5 and
`docs/reports/ISSUES.md` SCOPE-03/SCOPE-04 for the full decision record.

Owner: uiux · Consumers: orchestrator (generation), frontend (integration)
Scope authority: PRD §5 (AMENDMENT #1 SCOPE-01, AMENDMENT #2 SCOPE-02),
DESIGN.md §0/§1/§6/§10, PLAN.md §7 (esp. §7.2 constraints, §7.3 full-scope
decision, §7.8 Q1/Q2 resolved, §7.9 ENV-02 pivot, §7.10 M7.1 validation
result), ISSUES.md (SCOPE-01/02 FIXED, ENV-01 OPEN, ENV-02 IN-PROGRESS).

Every "current implementation" citation below was read directly out of
`index.html` (not guessed) — line numbers refer to that file as of this task.

---

## Global rules that apply to every entry below

**Per-asset chroma-key color policy (added 2026-07-24, PM-approved fix for
the M7.1 `bg-s1-hill-far` validation failure — see
`docs/reports/ISSUES.md` ENV-02 update and `docs/PLAN.md` §7.10; this note is
intentionally unnumbered so Rules 1-10 below keep their existing numbers and
every existing cross-reference to them, e.g. in A3/A4, still resolves
correctly):** the chroma-key backdrop named in each entry below is chosen
PER ASSET, not one universal color for every image. Default remains
`#00FF00` (green). If an asset's OWN approved palette contains a green tone
close enough to risk a flood-fill collision with a green key — exactly what
happened to `bg-s1-hill-far`'s pale `#A6DE7A` hill fill, where the subject
and the backdrop keyed out as one region — that asset switches its key to
`#FF00FF` (magenta) instead. **Do not blanket-apply magenta either:** before
defaulting an asset to magenta, re-check that SAME asset's full palette for
a pink/magenta-adjacent tone too (e.g. a flower accent, a highlight). If one
is present, magenta is unsafe for that asset and it instead uses `#00FFFF`
(cyan) as a third option. Every entry below that needed a non-default key
states the color it actually uses in both its own prompt text and its own
"Backdrop:" note line — never assume `#00FF00` from this policy note alone
without checking the specific entry. Non-green assets are unaffected and
keep the default `#00FF00`. **Ground tiles (§Section 7) are exempt from this
entire policy** — they carry no chroma-key backdrop instruction at all
(full-fill opaque textures, A3 check #3 explicitly excludes them from the
transparency requirement, per the Section 7 note) — so there is nothing to
swap there regardless of how green a tile's palette is.

1. **Mandated image path (REVISED 2026-07-24, ENV-02 pivot — see
   `docs/reports/ISSUES.md` ENV-02 and `docs/PLAN.md` §7.9):**
   `evalstate/flux1_schnell` (proven, authenticated, returns retrievable
   files — the same space that generated `assets/test-stage1-hills-bg.webp`)
   as the SOURCE generator for ALL world/character image assets, used
   **together with, never without,** the **mandatory Global Rule 2
   post-process pipeline** below applied to every single generated image.
   **UPDATED 2026-07-24 (Option B FINAL re-baseline):** that pipeline is now
   chroma-key transparency ONLY (Rule 2a) — deliver the transparent PNG at
   up to its per-asset payload ceiling, no downscale, no quantize (Rules 2b/
   2c removed, see below).

   **This directly reverses, on purpose, the earlier DESIGN §10.2 finding
   that raw FLUX.1-Schnell output is a "style-fit failure" for this
   project.** That finding was correct FOR THE PIXEL-ART STYLE GUIDE THAT
   WAS IN FORCE AT THE TIME — `assets/test-stage1-hills-bg.webp`'s smooth,
   painterly, anti-aliased rendering failed the old hard-edge A3 checks
   #1/#2 because the style guide demanded a hard pixel grid the model
   doesn't produce natively. Under Option B, that exact rendering
   character (smooth, anti-aliased, painterly) is the DESIRED look, not a
   defect — so the same source model's natural output is now much closer
   to on-brief without any grid-forcing post-process at all. **Do not skip
   Rule 2a (chroma-key) on any asset regardless** — a clean, correctly-keyed
   transparent background is still required even though the pixel-grid/
   quantize steps are gone.

   **`lm555/game-asset-generator` is DEPRECATED FOR NOW, not deleted from
   this manifest.** The originally-mandated path is unusable per ENV-02: the
   authenticated MCP path's `/generate` call succeeds but returns a raw
   in-memory `PIL.Image` object with no file path/URL to extract bytes from;
   the anonymous `gradio_client` path fails on a generic AppError (quota/
   session issue); and manually attaching the account token to that
   unauthenticated client was correctly avoided (no raw-credential handling,
   per Security Rules). This is a tooling-access blocker, not a style/prompt
   problem. **Revisit `lm555/game-asset-generator` only if/when its MCP
   access is fixed** — if a future call confirms a retrievable-output path,
   it may be reconsidered as an alternative or additional source; until then
   `evalstate/flux1_schnell` + Rule 2 is the mandate for every image asset in
   this manifest.

   **R15 (risk register, PLAN §7.9) — known residual risk this pivot
   accepts, not a reason to withhold it:** aggressively downscaling a
   general-purpose FLUX.1-Schnell source to ~16×16 for the tiny SPRITES
   (chicken/vehicles/corn/eagle) may read muddier than the existing
   hand-authored `PIXEL_MAPS` — backgrounds and larger props are far more
   forgiving of this downscale than tiny transparent silhouettes are. This is
   exactly what the M7.1 validation batch (A4) is designed to catch before
   any full-scale spend. If a generated sprite reads worse than its
   hand-authored equivalent at the GO/NO-GO gate, **surface both the
   generated and hand-authored result to the user for a per-category
   decision** — e.g. keep hand-authored `PIXEL_MAPS` for sprites while still
   generating backgrounds/props — since fallback-first rendering (Global
   Rule 8 / PLAN Constraint 5) supports either outcome cleanly with no
   further code change required either way.

   **R15 UPDATE (2026-07-24, Option B re-baseline):** the specific muddiness
   risk described above was a consequence of the (now-dropped) aggressive
   nearest-neighbor downscale to a tiny 16×16-ish pixel grid — under Option
   B there is no such downscale (Global Rule 2b is removed), so this exact
   failure mode no longer applies. The GO/NO-GO judgment for Option B is
   instead about hue-family/mood fit (revised A3 #2) and clean rendering
   (revised A3 #1) at the new, much larger payload-ceiling sizes (see the
   Option-B Payload-Ceiling Framework below) — a different, generally lower,
   risk profile than the old tiny-grid crush. Fallback-first (Rule 8)
   remains available regardless.
2. **Mandatory post-process pipeline — REVISED 2026-07-24 (Option B FINAL
   re-baseline, drops steps 2b/2c):**
   a. Chroma-key / background removal → transparent alpha (sprites +
      tile/parallax units alike — tiles need transparency too where they sit
      over the lane's base fill, e.g. obstacle-free ground texture may be
      opaque full-tile, but any prop-like element should not carry a
      backdrop-color fringe). Key against whichever color that specific
      asset's prompt/Backdrop line actually specifies (per the per-asset
      key-color policy note above, UNAFFECTED by this style revision) — not
      always `#00FF00`. **Mechanism correction (found during this task's
      `chick-idle-styleB` adopt-review, see DESIGN.md §10.5):** a naive
      keying pass that only flood-fills the region connected to the image
      border leaves enclosed/concave background-color pockets un-keyed —
      e.g. a trapped patch of backdrop color between a subject's legs, under
      an arm, or inside any other concave silhouette gap — because those
      pixels are never contiguous with the canvas edge. The keying step must
      remove **every** pixel within a color-distance tolerance of the
      asset's specified key color **globally across the whole image**, not
      only the border-connected region. This is a correction to the
      technique, not to the per-asset key-COLOR choice (unaffected, see
      above).
   b. ~~Downscale to the native pixel grid size, nearest-neighbor~~ —
      **REMOVED under Option B.** There is no fixed low-res pixel grid to
      force anymore; the source model's natural resolution and smooth
      rendering technique IS the final look. (Struck through rather than
      deleted so the step lettering/history stays legible against the prior
      M7.0/ENV-02 revision notes above — not renumbering the list.)
   c. ~~Palette-quantize to the exact per-asset hex list~~ — **REMOVED under
      Option B.** See the Option-B Payload-Ceiling & Hue-Family-Guide
      Framework below: per-asset hex lists are retained throughout this
      manifest as informational mood/color anchors, not a hard nearest-color
      snap. Some natural gradient/shading variation and off-list
      intermediate tones from the model's smooth rendering are now expected
      and accepted, not a defect.
   d. Deliver the final transparent PNG at (or resized DOWN to, only if the
      raw output exceeds it) the per-asset **payload ceiling** given in the
      new Option-B framework below — no pre-upscale, ever. If a resize down
      is needed, use a normal smooth resample (bicubic/Lanczos) — **never**
      nearest-neighbor, which was only ever needed to preserve a hard pixel
      grid that no longer exists under Option B.
3. **Exact param names are unverified** for `evalstate/flux1_schnell` beyond
   what the existing test call already confirmed (prompt / negative_prompt /
   seed at minimum, per `assets/test-stage1-hills-bg.webp`'s generation) — the
   orchestrator should run `view_parameters` first and map the *semantic*
   values below (prompt / negative prompt / seed) onto whatever the actual
   Gradio field names turn out to be. Do not invent confidence about field
   names that hasn't been confirmed.
4. **Global negative prompt baseline (REVISED 2026-07-24, Option B FINAL
   re-baseline — drops now-contradictory anti-illustration terms, adds
   Option-B-relevant ones; append asset-specific negatives to this, don't
   replace it):**
   `3d render, photograph, hyperrealistic lighting, harsh hard-pixel edges,
   visible pixel grid, jaggy stair-step aliasing, heavy/motion blur, ground
   contact shadow or grass/dirt patch beneath the subject, noise, dithering,
   jpeg artifacts, text, watermark, signature, logo, multiple objects,
   cropped, out of frame, extra limbs, deformed, muddy or washed-out color`

   **Why the old baseline changed:** the pre-2026-07-24 baseline explicitly
   told the model to avoid `blurry, soft edges, anti-aliasing, gradient
   shading, painterly, watercolor, airbrush, smooth shading` — every one of
   those is now a DESIRED quality under Option B's smooth-illustration style
   (Global Rule 5 below), so keeping them as negatives would have directly
   fought the new style prefix. `ground contact shadow or grass/dirt patch
   beneath the subject` is new — added after this task's `chick-idle-styleB`
   review found the model baking in an unrequested grass/shadow ellipse
   under a standing character's feet despite an asset-level "no scenery, no
   shadow" instruction already being present (see DESIGN.md §10.5) — this is
   a general Option-B risk for any standing-pose sprite, not just that one
   asset, so it belongs in the shared baseline.
5. **Global style prefix (REVISED 2026-07-24, Option B FINAL re-baseline —
   drops ALL hard-pixel-art language; prepend to every image prompt):**
   `2D flat-illustration game character/prop art, smooth clean vector-style
   shading, soft anti-aliased edges, gentle rounded silhouette and forms,
   soft discrete shading bands for volume (not a single flat fill), clean
   thin outline, orthographic 2D side view, warm inviting mobile-game
   illustration quality, centered single subject`

   The old prefix (`16x16-grid 2D pixel art game sprite, hard 1px pixel
   edges, zero anti-aliasing, flat per-pixel color fill, no gradient blur,
   retro NES/16-bit arcade style, thick dark outline, ... no dithering, no
   soft shadow`) is fully retired for world/character art generation — every
   per-asset prompt in Sections 1-8 below is composed as "Style prefix +
   {asset detail}", so this single change cascades to all ~34 image rows
   without needing each row rewritten individually. Per-asset descriptive
   detail (subject description, pose, color mentions) is UNCHANGED and still
   valid — only the technique/rendering-style language prepended to it
   changes.
6. **The ONE allowed soft element (headlight/streetlight/train-headlamp
   glow) stays 100% programmatic** — never bake a light-glow into a
   generated raster (Vehicle.render lines 567-571, Train.render lines
   698-701). Reject/regenerate any asset that bakes its own glow.
7. **Sky gradients stay programmatic** — the existing 2-stop
   `ctx.createLinearGradient` sky fills (`_renderParallax` line 1416-1418,
   `_renderTitle` line 1507-1509) are NOT regenerated; only the foreground
   silhouette elements (hills/sun/skyline/buildings/smokestacks) become
   transparent-background raster units composited on top, exactly matching
   what the current code loops already draw (see §Parallax below).
8. **Fallback-first, always** (PLAN §7.2 Constraint 5): every entry below
   names the exact existing programmatic draw call it would replace. If an
   asset is rejected/absent, that call stays wired as-is — nothing in this
   manifest requires deleting the fallback path.
9. **SFX model:** `hkchengrex/MMAudio` `/text_to_audio` (proven, client-
   approved — the source of `assets/test-sfx-hop.flac`). Params below use
   the field names `prompt` / `negative_prompt` / `seed` / `num_steps` /
   `cfg_strength` / `duration` — confirm exact field names via the space's
   schema before calling; same honesty caveat as #3.
10. **SFX negative-prompt baseline:** `music, singing, voice, speech, humming,
    ambient room tone, reverb, hall echo, low quality, muffled, distorted
    clipping, silence`

---

## Option-B Payload-Ceiling & Hue-Family-Guide Framework (added 2026-07-24, M7.1b FINAL re-baseline)

This section is the single global reference that reinterprets EVERY
per-asset "Native size"/"Native authoring size" and "Palette lock" cell
throughout Sections 1-8 below. Rather than hand-editing all ~34 individual
rows to say the same thing, the specific size numbers that appear later in
this document for the categories below ARE the Option-B numbers (already
updated in place where practical); this section states the framework and
rationale once.

**Sizes are payload-bound ceilings, not pixel-grid requirements.** Recommend
generating at (or resizing DOWN to, smooth resample only) up to the ceiling
below — never a mandate to hit that exact resolution, and never a reason to
upscale a smaller natural output. Purpose is bounding the inlined base64
payload (Risk R11), nothing else.

| Category | Assets | Payload-ceiling | Rationale |
|---|---|---|---|
| Hero character sprites | `chick-idle`, `chick-hop`, `eagle-flying`, `eagle-grabbed` | **~128×128** (may extend proportionately wider, e.g. ~160×128, for a wing-flare/wing-extended silhouette bump) | Most-scrutinized, most-repeated assets (title hero, every idle frame, both death-pose transforms, fall-behind fail state) — most legibility/detail headroom of any category. `chick-idle-styleB`'s validated sample (22.7KB PNG at 128×128) confirms this ceiling keeps payload reasonable. |
| Vehicles | `veh-*-car` (~**96×64**), `veh-*-truck` (~**160×64**), `veh-s2-bus` (~**192×64**) | scaled per-kind, aspect-proportional to each vehicle's existing final in-game render size (44×30 / 74×30 / 96×30) | Secondary to the chicken/eagle hero read; kept smaller since there are 7 near-duplicate-shape rows (color-swap-from-one-canonical strategy unchanged, §Section 2) — bounds aggregate payload across all 7. |
| River objects | `log-s1`/`log-s2` (~**96×32**), `lily-pad` (~**64×32**) | Small stretchable props; current final on-screen size is modest (72-96px wide). |
| Train car / signal housing | `train-car` (~**96×96**), `signal-housing` (~**48×112**, tall pole+box aspect) | `train-car` repeats 5× per train plus alpha-stacked ghost-trail overlays — kept modest to bound the aggregate repeat cost. |
| Corn pickup | `corn-pickup` (~**64×64**) | Small collectible icon, final on-screen ~36×36. |
| Ground tiles | all 11 `tile-*` rows (~**128×128**) | Full-fill textures spanning the lane's full width at 3×; more surface area benefits the illustrated style's natural texture/shading, and gives the mandatory tiling check (A3 #4) enough resolution to actually judge edge continuity — see the heightened tiling-risk flag under A3 #4. |
| Parallax silhouettes | `bg-s1-hill-far`/`-near`, `bg-s2-skyline` (~**128×64**, wide arc/band units); `bg-s1-sun`, `bg-s2-building` (~**96×96**, roughly square units); `bg-s3-smokestack` (~**64×128**, tall pair) | Large, flat, most-forgiving category per R15 (least readability risk) — headroom spent generously here costs little. |

**Palette locks become hue-family guides, not hard hex snaps.** Every
per-asset "Palette lock" hex list that appears in Sections 1-8 below is
RETAINED VERBATIM as an informational **mood/hue-family anchor** (e.g.
`chick-idle`'s list still reads as "warm cream-and-tan feather tones with a
red comb accent") — it is no longer a nearest-color-quantize target (Rule 2c
is removed). Some natural gradient/shading variation and off-list
intermediate tones from the model's smooth rendering are expected and
accepted; adherence is now judged as a hue-family/mood visual call (revised
A3 check #2 below), not an exact ΔE match.

---

## A1 + A2 — ASSET MANIFEST with generation prompts/params

### Section 1 — Chicken (shared identical across all 3 stages, DESIGN §3)

| ID | Type | Native size | Frames | Stage(s) | Current implementation replaced |
|---|---|---|---|---|---|
| `chick-idle` | animation-frameset | ~128×128 ceiling (Option B; was 16×16 pixel-grid) | 4 | all | `CHICKEN_ROWS`/`CHICKEN_PAL` (lines 151-170) + `drawChickenSprite()` (173-191), invoked by `Player.render()` idle branch (896-909, headDy sequence `[0,1,2,1]` @180ms/frame) and `_renderTitle()` hero chicken (1518-1525) |
| `chick-hop` | animation-frameset | ~128×128 ceiling (stretch frame may extend proportionately wider, e.g. ~160×128, for the wing-flare silhouette bump; was 16×16, pad 20×16) | 2 (`squash`, `stretch`) | all | `Player.render()` hopping branch transform math (897-903) + `drawChickenSprite(ctx,headDy,wingOut)` wing-out block (185-190) |

**Design decision — no separate death-impact/death-water art needed.** The
shipped code does NOT draw unique death sprites: impact death reuses the
same base chicken art squashed via `ctx.scale` (`_drawBody(ctx,cam,1.4,0.4,...)`,
line 891) and water death scales the same base art down to 0 over 150ms
(lines 883-888). Full replacement therefore means: apply the identical
runtime transform to `chick-idle` Frame A. This is not a gap — it mirrors
the shipped technique exactly and avoids wasting 2 generation calls on
frames that are pure transforms of an existing frame.

**Prompts:**

`chick-idle` (generate as a 4-cell horizontal contact-sheet, cell-crop after,
OR 4 separate calls — orchestrator's choice; frames only differ by ~1-2px
head bob):
> Style prefix + `"a small plump farm chicken, cream-white body (#FFF3D6)
> with tan underside shading (#E8D5A8), red comb and wattle (#E8432B),
> orange beak and legs (#FFB020), small black eye with white 1px highlight,
> tan wing patch (#E0B876) visible on folded wing, standing pose facing
> right, single game character sprite, centered, pure solid #00FF00
> green-screen backdrop, flat and uniform, no gradient, no scenery, no
> shadow"`
- Palette lock: `#1B1611 (outline), #FFF3D6, #E8D5A8, #E8432B, #FFB020,
  #FFFFFF, #E0B876`
- Negative: baseline + `"multiple chickens, rooster tail feathers, hen house,
  farm background, ground, shadow, grass tuft, ground ellipse, contact
  shadow, standing on grass, dirt patch, ground plane"` (the last 6 terms
  added 2026-07-24, Option B re-baseline — the pre-existing "ground, shadow"
  terms were NOT sufficient to prevent a baked-in grass/ground ellipse under
  the feet on the `chick-idle-styleB` sample; see DESIGN.md §10.5 verdict)
- Backdrop: pure solid `#00FF00` green screen (chroma-keyed to transparency in
  post-process, Rule 2a) — none of this asset's palette is green, no
  collision risk, key unchanged. Seed: `1101`.

`chick-hop`:
> Style prefix + `"the same small illustrated chicken as a reference idle
> pose but mid-jump: squash-and-stretch pose, body stretched taller and
> narrower, wings flared outward and visibly extended above the body
> silhouette (wing-flap mid-hop), same color palette as idle, facing right,
> pure solid #00FF00 green-screen backdrop, flat and uniform, no gradient,
> no scenery, no shadow"` (was "pixel-art chicken" pre-Option-B; updated
> 2026-07-24 to match the new Global Rule 5 style prefix)
- Same palette lock + negative as `chick-idle`; add negative `"standing
  still, neutral pose"`. Backdrop: pure solid `#00FF00` green screen
  (unchanged — no green in this asset's palette). Seed: `1102`.
- Post-process note: crop/pad the canvas to include the flared wing without
  clipping (canvas may need to extend proportionately wider than the
  128×128 idle ceiling, e.g. ~160×128 — was "+4px vs the 16×16 idle grid"
  pre-Option-B).

---

### Section 2 — Vehicles (`Vehicle` class, lines 552-593)

**Color-variant strategy (spec decision):** each stage's `cars[]` array holds
3 body-color variants (§ STAGES config, lines 401-458) applied at spawn time
by recoloring the same silhouette. Regenerating 3 full diffusion calls per
{stage, kind} to reproduce 3 near-identical recolors would triple the
generation budget for zero shape difference. Instead: generate ONE canonical
silhouette per {stage, kind} in the stage's **primary** car color (array
index 0), and produce the other 1-2 color variants via a cheap **local
palette-swap post-process** (hue-remap the body-fill pixels only, keep
outline/window/wheel colors fixed) rather than new model calls. This is
noted here so frontend/orchestrator don't expect 3 separate generated files
per vehicle.

Canonical facing = **right** (`dir>0`); mirrored via `ctx.scale(-1,1)` for
left-moving traffic, same technique as the chicken (lines 565-592 — sprite
itself never needs a left-facing variant).

| ID | Type | Native authoring size ceiling (Option B; was logical px ÷ 3 pixel-grid) | Final in-game render size (already-3× virtual px, no further scaling) | Stage | Kind | Replaces |
|---|---|---|---|---|---|---|
| `veh-s1-car` | sprite | ~96×64 ceiling | 44×30 | 1 | car | `Vehicle` body/cabin/wheel draw (574-591), color `c.cars[0]='#E4572E'`, window `#BFE3FF` |
| `veh-s1-truck` | sprite | ~160×64 ceiling | 74×30 | 1 | truck | same, cab differentiation block (579-582) |
| `veh-s2-car` | sprite | ~96×64 ceiling | 44×30 | 2 | car | color `c.cars[0]='#464655'`, window `#FFF6D0`, tail `#FF3B3B` |
| `veh-s2-truck` | sprite | ~160×64 ceiling | 74×30 | 2 | truck | same |
| `veh-s2-bus` | sprite | ~192×64 ceiling | 96×30 | 2 (bus is Stage-2-ONLY per BUG-4 fix, line 1074 `this.stage===1`) | bus | boxy window-row block (583-584) |
| `veh-s3-car` | sprite | ~96×64 ceiling | 44×30 | 3 | car | color `c.cars[0]='#55524D'`, window `#FFD24D` |
| `veh-s3-truck` | sprite | ~160×64 ceiling | 74×30 | 3 | truck | same |

Prompt template (fill in `{kind}`, `{stage-mood}`, `{body-hex}`, `{win-hex}`):
> Style prefix + `"a blocky {kind} viewed from the side, {stage-mood}, body
> color {body-hex}, {win-hex} window cells, dark near-black wheels, facing
> right, no headlight glow (flat matte body only), single vehicle sprite,
> pure solid #00FF00 green-screen backdrop, flat and uniform, no gradient,
> no road/ground beneath it"`
- `{stage-mood}` values: S1 = `"cheerful bright daytime countryside car"`,
  S2 = `"sleek night-city car"`, S3 = `"grimy industrial hazard-zone
  vehicle, rougher rust-tinted panels"`.
- Palette lock per row: body hex above + outline `#1A1A1A` + window hex +
  (S2 only) taillight `#FF3B3B`.
- Negative: baseline + `"headlight beam, glow, light rays, motion blur,
  road, asphalt, ground shadow, multiple vehicles"`.
- Backdrop: pure solid `#00FF00` green screen (chroma-keyed in post-process)
  — none of the S1/S2/S3 body/window/taillight hexes above are green, no
  collision risk, key unchanged for all 7 rows.
- Seeds: `1201`(s1-car) `1202`(s1-truck) `1203`(s2-car) `1204`(s2-truck)
  `1205`(s2-bus) `1206`(s3-car) `1207`(s3-truck).

---

### Section 3 — River objects (`Log` class, lines 598-624) — Stage 1 & 2 only

Stage 3 has zero river weight (`STAGES[2].weights.river = 0.0`,
`logMin/logMax = 0`, line 443) — no river assets for Stage 3.

| ID | Type | Native size ceiling (Option B) | Stage(s) | Replaces |
|---|---|---|---|---|
| `log-s1` | sprite | ~96×32 ceiling, stretchable (was ~24×7) | 1 | `Log.render()` non-pad branch (617-621), `c.logBody='#A9743F'`/`logDark='#8A5C2E'`/`logHi='#C08F52'` |
| `log-s2` | sprite | ~96×32 ceiling | 2 | same, `c.logBody='#5a4632'`/`logDark='#3f3020'`/`logHi='#7a5c3a'` (grimier tone) |
| `lily-pad` | sprite | ~64×32 ceiling (was ~13×7) | 1 & 2 (shared — code hardcodes pad color regardless of stage, lines 613-616, does NOT read `c.*`) | `Log.render()` `isPad` branch, hardcoded `#3C9D45`/`#2C7A34` |

Logs are drawn at variable width in code (`w = 72 or 96` px) by stretching
one silhouette — generate at one canonical aspect ratio; frontend
`drawImage`-stretches horizontally exactly as it already varies `w` today
(acceptable raster-stretch for a plain wood-grain object, not subject to the
tiling check — tiling is reserved for ground tiles, §Section 7).

Prompts:
> `log-s1` / `log-s2`: Style prefix + `"a floating wooden log platform, side
> view, horizontal, wood-grain striations, stepped-block log-end caps (not
> rounded/curved), body {logBody-hex}, striation shade {logDark-hex},
> end-cap highlight {logHi-hex}, pure solid #00FF00 green-screen backdrop,
> flat and uniform, no gradient, no water beneath"`
- Negative: baseline + `"round smooth cylinder, bark texture noise, water,
  ripples, multiple logs"`. Backdrop: pure solid `#00FF00` green screen —
  both logs' palettes (`log-s1`: `#A9743F`/`#8A5C2E`/`#C08F52`; `log-s2`:
  `#5a4632`/`#3f3020`/`#7a5c3a`) are brown/tan tones, not green, so there is
  no collision risk and the key is unchanged for both rows.
  Seeds: `1301` (s1), `1302` (s2).

> `lily-pad`: Style prefix + `"a single stepped-octagon lily pad viewed from
> above at a slight angle, base green #3C9D45, darker vein lines #2C7A34,
> pure solid #FF00FF magenta-screen backdrop, flat and uniform, no water, no
> flower"`
- Negative: baseline + `"realistic lily pad, photo, pond, ripples, multiple
  pads, flower"`. Note: key color switched from `#00FF00` to `#FF00FF`
  magenta per the per-asset key-color policy note above — this asset's own
  base green/vein hexes (`#3C9D45`/`#2C7A34`) are exactly the kind of green
  tone that collided with the universal green key on `bg-s1-hill-far`, so a
  green key is unsafe here too. Checked for the magenta-collision risk PM
  flagged explicitly (a pink/flower accent would be magenta-adjacent): this
  asset's currently APPROVED palette carries **no flower/pink hex** — both
  the prompt and the negative prompt explicitly exclude a flower
  (`"no flower"`) — so there is nothing magenta-adjacent in scope today and
  `#FF00FF` is safe. If a pink flower accent is ever added to this asset's
  approved palette in a future revision, this key must be re-checked and
  likely switched to `#00FFFF` cyan instead. Backdrop: pure solid `#FF00FF`
  magenta screen. Seed: `1303`.

---

### Section 4 — Train + warning light (`Train` class, lines 629-703)

The 5-car train is drawn by looping ONE car unit 5× (`for i<5 cx=... i*32`,
lines 690-696) with fixed body color `#22201d` regardless of stage — only a
thin `col.railMetal` accent trim varies per stage, kept programmatic (same
"narrow exception" pattern as the glow). So ONE train-car sprite serves all
3 stages.

| ID | Type | Native size ceiling (Option B) | Stage(s) | Replaces |
|---|---|---|---|---|
| `train-car` | sprite | ~96×96 ceiling (was ~9×12) | all | `Train.render()` car-unit loop (690-696); motion-blur ghost trail (684-689, alpha-stacked repeats of this same sprite) and headlamp glow (698-701) stay 100% programmatic overlays on top |
| `signal-housing` | sprite | ~48×112 ceiling, tall pole+box aspect (was ~3×7) | all | `Train.renderSignal()` dark housing box (673-674); the actual red/amber ON/OFF lamp roundel color stays programmatic (676-678) — it's a 5×5px binary color flash already correctly per-stage-colored in code, not worth baking stage variants for |

Prompts:
> `train-car`: Style prefix + `"one dark metal train car unit, side view,
> body #22201d, one small lit window slit #C7C2B8, bottom rail-line trim
> strip, no wheels visible (cropped low), pure solid #00FF00 green-screen
> backdrop, flat and uniform, no gradient, no glow, no motion blur, single
> isolated car segment (this is one repeating unit of a longer train, not
> the whole train)"`
- Negative: baseline + `"full train, multiple cars, headlamp glow, light
  beam, tracks, motion blur streak"`. Backdrop: pure solid `#00FF00` green
  screen — no green in this asset's palette, key unchanged. Seed: `1401`.

> `signal-housing`: Style prefix + `"a small pole-mounted railway warning
> signal housing, dark metal box #171310 on a thin pole, two empty lamp
> sockets (unlit, no color — lamps are added separately), pure solid #00FF00
> green-screen backdrop, flat and uniform, no gradient"`
- Negative: baseline + `"lit lamp, glow, colored light, red or amber
  circle"`. Backdrop: pure solid `#00FF00` green screen — no green in this
  asset's palette, key unchanged. Seed: `1402`.

---

### Section 5 — Corn pickup (`Lane._drawCorn`, lines 537-546)

| ID | Type | Native size ceiling (Option B) | Stage(s) | Replaces |
|---|---|---|---|---|
| `corn-pickup` | sprite | ~64×64 ceiling (was 12×12) | all (shared — DESIGN §3 "corn shared across all stages", code fixed colors regardless of stage) | `_drawCorn()` kernel/husk fillRects (542-544) |

The existing spin animation (`ctx.scale(sq,1)` horizontal squash, line 541)
is a **runtime transform of one static image** — no separate spin frames
needed; the raster replacement plugs directly into the same transform.
Sparkle burst stays a `ParticleSystem` effect (277-283), not an image asset.

> Prompt: Style prefix + `"a small collectible corn cob cluster, 4-5 gold
> kernel blocks #FFD23F over a green husk base #7ABF4C, compact icon-like
> collectible, pure solid #FF00FF magenta-screen backdrop, flat and uniform,
> no gradient, centered, no sparkle effect baked in"`
- Negative: baseline + `"full corn cob, husk leaves wrapping around,
  sparkle, glow, multiple corn"`. Note: key color switched from `#00FF00` to
  `#FF00FF` magenta per the per-asset key-color policy note above — the husk
  base `#7ABF4C` is a green tone in this asset's own approved palette, which
  risks the same green-on-green flood-fill collision diagnosed for
  `bg-s1-hill-far`. Checked the rest of this asset's approved palette (only
  the gold kernel `#FFD23F`) for a magenta-adjacent collision risk — none
  found (gold is not pink/magenta-adjacent), so `#FF00FF` is safe. Backdrop:
  pure solid `#FF00FF` magenta screen. Seed: `1501`.

---

### Section 6 — Eagle (`Eagle` class, lines 708-747)

| ID | Type | Native size ceiling (Option B) | Stage(s) | Replaces |
|---|---|---|---|---|
| `eagle-flying` | sprite | ~128×128 ceiling, may extend wider (e.g. ~160×128) for fully-extended wingspan (was 24×24) | all (shared, fixed hex, no stage recolor) | `Eagle.render()` `!this.grabbed` branch (735: extra wing-flair blocks) |
| `eagle-grabbed` | sprite | ~128×128 ceiling (was 24×24) | all | `Eagle.render()` grabbed branch (omits wing-flair) |

The held-chicken-in-talons visual (742-745) reuses `chick-idle` Frame A
scaled 1.4× — no new asset.

> `eagle-flying`: Style prefix + `"a large bird of prey, spread-wing
> silhouette, wings fully extended horizontally, dark brown-grey body
> #4A3B32, cream head and neck #E8DCC8, amber eye #FFB020, orange talons
> #FFB020, generic bird-of-prey (not any specific protected species), swoop
> pose, pure solid #00FF00 green-screen backdrop, flat and uniform, no
> gradient"`
- Negative: baseline + `"real bald eagle, national symbol, americana,
  patriotic imagery, perched, folded wings, multiple birds"`. Backdrop: pure
  solid `#00FF00` green screen (chroma-keyed in post-process) — no green in
  this asset's palette, key unchanged. Seed: `1601`.

> `eagle-grabbed`: same prompt, swap `"wings fully extended horizontally"` →
> `"wings tucked in close to the body, talons extended downward in a grab
> pose"`. Backdrop unchanged (pure solid `#00FF00` green screen). Seed:
> `1602`.

---

### Section 7 — Environment ground tiles (`Lane.renderBase`, lines 488-515)

**⚠️ Highest-risk category (PLAN Risk R13) — every row here is
tiling-gated, and this risk is HEIGHTENED, not lowered, under Option B (see
A3 check #4 below for the full reasoning).** Each tile is generated at up to
the Option-B payload ceiling (~128×128 — see the Option-B Payload-Ceiling
Framework above; was a **native 16×16 single repeating unit** under the old
pixel-grid spec) as a single repeating unit, replacing what is currently a
single flat `fillRect(0,top,VW,TILE)` spanning the FULL lane width (336px) —
i.e., today there is no tiling at all, just a solid color fill; the raster
replacement must actually tile edge-to-edge across that full width, which is
the part diffusion models are worst at, and illustrated/smooth-shaded
textures are worse at than flat pixel fills were. **Any tile failing the A3
seamless-tiling check falls back to the existing programmatic fill for that
stage/type — no exceptions, per PLAN §7.3.**

Row alternating-shade (`this.row%2===0 ? safe : safeAlt`, applied per full
row) is kept as a **cheap post-generation tonal variant** — generate ONE
base (darker/"alt") tile per {stage,type} and have frontend apply a light
multiply/brightness overlay for the non-alt row, rather than doubling the
tile count for a 2-color row toggle.

Static per-tile texture (grass blade-ticks, rail ties/metal, road dashes/
hazard-tape) is FULLY BAKED into the tile art since none of it animates.
River shimmer (`shimmer` offset, animated every frame, lines 505-508) is the
ONE exception — that stays a programmatic overlay drawn on top of a static
river base tile, since baking a moving effect into a static image is
impossible.

**Note on backdrop instruction scope:** ground tiles are full-fill opaque
textures, not chroma-keyed sprites (A3 check #3 explicitly excludes them
from the transparency requirement) — no green-screen (or any other color)
backdrop instruction is added to the tile prompts below; they are unaffected
by the image-gen pivot AND by the per-asset key-color policy note above —
there is no chroma-key backdrop on any tile row to choose a color for, even
on the green-toned rows (`tile-s1-grass`, `tile-s2-grass`, `tile-s3-ground`).

| ID | Stage | Lane type | Visual detail baked in | Replaces (renderBase branch) |
|---|---|---|---|---|
| `tile-s1-grass` | 1 | grass | flat green + sparse blade ticks | 490-493, `safe`/`safeAlt`/`safeEdge` |
| `tile-s1-road` | 1 | road | asphalt + dashed lane marking (4px dash/4px gap) | 494-495, 499-501 |
| `tile-s1-river` | 1 | river | base water color only (no shimmer) | 502-504 base fill only |
| `tile-s1-rail` | 1 | rail | rail-bed + metal rails + tie ticks | 509-514 |
| `tile-s2-grass` | 2 | grass | desaturated night park-strip green | 490-493 |
| `tile-s2-road` | 2 | road | asphalt + brighter dashed marking (`#FFD866`) | 494-495, 499-501 |
| `tile-s2-river` | 2 | river | canal base color only | 502-504 |
| `tile-s2-rail` | 2 | rail | rail-bed + metal + ties | 509-514 |
| `tile-s3-ground` | 3 | grass (renders as "grimy ground" per DESIGN §3.3) | grimy brown-grey ground | 490-493 |
| `tile-s3-road` | 3 | road | **hazard tape edges, NOT dashed marking** — Stage 3 road uses a different branch (`if(this.game.stage===2)`, lines 496-497) than S1/S2 | 494-497 |
| `tile-s3-rail` | 3 | rail | rail-bed + metal + rust ties (highest rail frequency stage) | 509-514 |

(No `tile-s3-river` — Stage 3 has no river lanes.)

Prompt template:
> Style prefix + `"a single seamlessly-tileable {lane-type} ground texture
> tile, {detail}, designed to repeat edge-to-edge with no visible seam,
> {palette description}, top-down/flat game background tile, no
> perspective, no vignette, no border frame"`

Per-row fill-ins:
- `tile-s1-grass`: detail=`"sparse darker blade-tick marks scattered across
  the surface"`, palette=`"base #4F9A28, blade ticks #3E7A1F"`.
- `tile-s1-road`: detail=`"dashed yellow lane-marking line running through
  the center, 4px dash 4px gap"`, palette=`"asphalt #43434C, marking
  #F4E285"`.
- `tile-s1-river`: detail=`"flat calm water surface, no waves"`,
  palette=`"#2C86B0 base"`.
- `tile-s1-rail`: detail=`"two horizontal metal rail lines near top/bottom
  edges, evenly spaced perpendicular wooden tie/sleeper ticks between
  them"`, palette=`"bed #5B4A34, metal #C7C2B8, rust ties #8B5E3C"`.
- `tile-s2-grass`: detail=`"muted desaturated park-strip grass, subtle
  darker blade ticks"`, palette=`"base #24532F, ticks #1C3F24"`.
- `tile-s2-road`: detail=`"dashed bright-yellow lane-marking line"`,
  palette=`"asphalt #26262F, marking #FFD866"`.
- `tile-s2-river`: detail=`"dark moonlit canal water, flat"`,
  palette=`"#17394A base"`.
- `tile-s2-rail`: palette=`"bed #2b2b36, metal #C7C2B8, rust #5a4632"`
  (same detail as s1-rail).
- `tile-s3-ground`: detail=`"grimy industrial ground, small dark
  scuff/rubble specks"`, palette=`"base #5A5245, specks #463F34"`.
- `tile-s3-road`: detail=`"diagonal alternating black-and-amber hazard tape
  stripes along the tile, NOT a dashed center line"`, palette=`"asphalt
  #332E29, hazard stripes #FFB100 / #1A1A1A"`.
- `tile-s3-rail`: palette=`"bed #4A423A, metal #C7C2B8, rust #8B5E3C"`
  (same detail as s1-rail).

- Negative (all tile rows): baseline + `"visible seam, mismatched edge,
  discontinuity at border, vignette, drop shadow border, frame, single
  centered object, gradient"`.
- Seeds: `1701`-`1711` in the table row order above.

---

### Section 8 — Parallax foreground units (`_renderParallax`, lines 1414-1445)

**Restructured from "one big background image" to small transparent
repeatable units** — this maps 1:1 onto what the code already does (loops
drawing the SAME shape at spaced intervals with a scrolling offset,
`for(i=-1;i<4;i++) drawShapeAt(i*140+far, ...)`), so these are **not**
subject to the edge-to-edge tiling check (§Section 7) — they're discrete
spaced objects like vehicles, validated the same way (silhouette
readability, palette, transparency). The sky gradients themselves are NOT
regenerated (Global Rule 7) — only the foreground silhouette shapes below.

| ID | Stage | Native size ceiling (Option B — first explicit sizes for this section) | Replaces | Current loop it plugs into |
|---|---|---|---|---|
| `bg-s1-hill-far` | 1 | ~128×64 ceiling | far hill-arc silhouette (1423-1424) | `for(i=-1;i<4) arc(i*140+far,...)` |
| `bg-s1-hill-near` | 1 | ~128×64 ceiling | near hill-arc silhouette (1425-1426) | `for(i=-1;i<4) arc(i*120+near,...)` |
| `bg-s1-sun` | 1 | ~96×96 ceiling | static sun disc (1422) | drawn once, no loop |
| `bg-s2-skyline` | 2 | ~128×64 ceiling | distant skyline block (1430-1431) | `for(i=-1;i<6) rect(i*70+far,...)` |
| `bg-s2-building` | 2 | ~96×96 ceiling | near building row incl. lit window cells (1432-1437, static pattern — note below) | `for(i=-1;i<7) rect(i*56+near,...)` |
| `bg-s3-smokestack` | 3 | ~64×128 ceiling | smokestack pair silhouette (1439-1440) | `for(i=-1;i<4) rect(i*130+far,...)` |

**Two honest notes on DESIGN-vs-shipped-code drift (not this task's to fix,
flagging for the record):** (1) DESIGN §6 describes Stage-1 near-layer
"occasional small tree silhouette clusters" and Stage-3 near-layer
"chain-link-fence-suggestion" — neither is actually implemented in
`index.html` today (only the hill bands / smokestacks above exist). (2)
DESIGN §6 describes Stage-2 windows "occasionally flicker on/off" — the code
picks lit cells via a positional hash (`(wx*wy)%7<3`) with no time term, so
it's a fixed pattern, not actually flickering. Per PLAN §7 this milestone is
an **asset swap**, not a new-feature pass, so this manifest matches shipped
behavior 1:1 (no tree clusters, no fence, no flicker) rather than inventing
new scope. Star pixels (1428-1429) and ember particles (1441-1443) are tiny
single-pixel/time-animated effects — not worth a generation call, they stay
programmatic.

Prompts:
**Subject-rendering language REVISED 2026-07-24 (Option B FINAL
re-baseline) for all 6 rows below** — the previous prompts described the
hill/sun/skyline/building/smokestack SUBJECTS themselves with explicit
"hard edge"/"hard pixel edge"/"hard rectangular edges"/"no gradient"
language, which directly contradicts the new Global Rule 5 style prefix
(smooth illustration) if left in the per-asset text. Backdrop instructions
("pure solid `#COLOR` ... backdrop, flat and uniform") are UNCHANGED — those
describe the chroma-key BACKDROP, not the subject, and a flat uncluttered
backdrop is still exactly what clean keying needs regardless of world-art
style.

> `bg-s1-hill-far`: Style prefix + `"a single rolling hill silhouette, smoothly
> shaded illustrated form with a gentle highlight near the sun-catching crest
> and a soft natural shadow toward the base, base tone #A6DE7A, pure solid
> #FF00FF magenta-screen backdrop, flat and uniform, no sky, decorative
> background element, side profile"`. Negative: baseline + `"sky, sun,
> multiple hills, harsh grass-blade texture detail, harsh hard-pixel edge"`.
> Note: key color switched from `#00FF00` to `#FF00FF` magenta — this is the
> exact asset that FAILED the M7.1 validation batch on a chroma-key
> collision (its own fill `#A6DE7A` is a pale green too close to a green
> key, so FLUX rendered the hill and the backdrop as one region and the
> flood-fill keyed out almost the whole image). This asset's only palette
> color is `#A6DE7A`; no pink/magenta-adjacent tone is present, so `#FF00FF`
> has no collision risk and is maximally distant from this asset's palette.
> Backdrop: pure solid `#FF00FF` magenta screen. Seed `1801`.
> `bg-s1-hill-near`: same treatment, base tone `#7FC24C`. Note: key color
> also switched from `#00FF00` to `#FF00FF` magenta, for the same reason as
> `bg-s1-hill-far` — `#7FC24C` is likewise a green tone in this asset's own
> palette and risks the identical flood-fill collision (this asset wasn't
> in the M7.1 validation batch, but shares the same failure mode, so it's
> fixed proactively rather than waiting to fail its own gate). No
> pink/magenta-adjacent tone in this asset's palette, so `#FF00FF` is safe.
> Backdrop: pure solid `#FF00FF` magenta screen. Seed `1802`.
> `bg-s1-sun`: `"a simple circular sun disc, smoothly shaded illustrated
> form, clean smooth edge, warm fill #FFE066 with a subtle brighter soft
> highlight near center, no glow halo extending beyond the disc, no lens
> flare, no light rays, pure solid #00FF00 green-screen backdrop, flat and
> uniform"`. Negative: baseline + `"glow halo, rays, lens flare, harsh
> hard-pixel edge"`. Backdrop: pure solid `#00FF00` green screen (note: the
> sun's own fill `#FFE066` is a warm yellow, well clear of the `#00FF00` key
> — no color-collision risk here, key unchanged). Seed `1803`.
> `bg-s2-skyline`: `"a single distant city building block silhouette,
> smoothly shaded illustrated form, base fill #0F1024 with a subtle soft
> edge, pure solid #00FF00 green-screen backdrop, flat and uniform, no
> windows"`. Backdrop: pure solid `#00FF00` green screen — no green in this
> asset's palette, key unchanged. Seed `1804`.
> `bg-s2-building`: `"a single city building block, smoothly shaded
> illustrated form, base fill #23233A, with 3-4 small lit yellow window
> cells #FFCB57 scattered on its face, clean smooth edges, pure solid
> #00FF00 green-screen backdrop, flat and uniform"`. Backdrop: pure solid
> `#00FF00` green screen — no green in this asset's palette, key unchanged.
> Seed `1805`.
> `bg-s3-smokestack`: `"a pair of industrial smokestack silhouettes of
> differing height, smoothly shaded illustrated form, base fill #171310,
> clean smooth edges, pure solid #00FF00 green-screen backdrop, flat and
> uniform, no smoke"`. Backdrop: pure solid `#00FF00` green screen — no
> green in this asset's palette, key unchanged. Seed `1806`.

---

## A3 — STYLE VALIDATION CRITERIA (objective accept/reject checklist)

Apply ALL applicable checks to every generated asset before it's marked
accepted in DESIGN §10.5. Any single FAIL on a mandatory check → reject or
regenerate-with-tweaks; ground tiles additionally fall back to programmatic
on tiling failure specifically (not the other checks — a tile can still be
rejected outright for palette/edge failures too).

1. **Clean smooth-illustration rendering, no stray blur/noise (REVISED
   2026-07-24, Option B FINAL re-baseline — replaces "hard pixel edges /
   zero anti-aliasing"; mandatory, all assets).** Zoom to 400-800%. PASS =
   the silhouette and internal linework are clean and intentional — smooth,
   anti-aliased edges from the model's natural rendering are EXPECTED and
   CORRECT here, not a defect — but there is no unintended heavy/out-of-
   focus blur, motion-smear, jpeg-style compression noise, or a jagged/
   broken edge that reads as a rendering glitch rather than deliberate soft
   illustration linework. FAIL = visible grain/noise, heavy unintended blur,
   compression artifacts, or a glitchy/broken silhouette edge.
2. **Hue-family / mood adherence (REVISED 2026-07-24, Option B FINAL
   re-baseline — replaces the old hard hex-match check; mandatory, all
   assets, a visual judgment call, not an exact-match test).** Compare the
   generated image, at a glance, to the per-asset hex list given in its
   entry above (now a mood/hue-family ANCHOR, not a hard lock — see the
   Option-B Payload-Ceiling & Hue-Family-Guide Framework above). PASS = the
   asset's overall color mood/hue family visibly matches that reference
   (e.g. `chick-idle` reads as "warm cream-and-tan feather tones with a red
   comb accent," not a literal per-pixel hex match); natural shading
   gradients and off-list intermediate tones from smooth rendering are
   expected and acceptable. FAIL = the asset's overall mood clearly drifts
   to a different hue family than specified (e.g. a stage's "cool
   night-blue" vehicle rendering warm-orange instead), or looks visibly
   washed-out/muddy relative to the reference list.
3. **Transparent background (mandatory, all sprites, eagle, train, corn,
   vehicles, river objects, parallax units — NOT full-fill ground tiles).
   REVISED 2026-07-24 (Option B) to explicitly cover enclosed pockets, per a
   real defect found this task.** Alpha channel present; fully transparent
   (alpha = 0) everywhere outside the silhouette, **including enclosed/
   concave background-color pockets inside the silhouette's bounding box**
   (e.g. between legs, under an arm, inside any other silhouette gap) — not
   only the region touching the image border; inspect a 2px ring around the
   silhouette edge for leftover key-color fringe/halo after chroma-key
   removal. FAIL = any non-zero-alpha key-color residue anywhere in the
   image (border-connected OR enclosed/trapped), or a non-transparent
   background. (This enclosed-pocket clause was added after
   `chick-idle-styleB` was found to have exactly this defect — a fully
   opaque trapped key-color patch between the chicken's legs, invisible to
   a border-only flood-fill check; see DESIGN.md §10.5 and Global Rule 2a's
   matching mechanism fix above.)
4. **Seamless tiling (mandatory, ground tiles ONLY — §Section 7's 11
   entries; check itself UNCHANGED, risk HEIGHTENED under Option B — see
   note below).** Render the tile repeated in a **3×3 grid** at both 100%
   and 300% zoom. PASS = no visible seam line, color discontinuity, or
   repeating-pattern "tell" at any internal tile boundary. FAIL = any
   visible seam at either zoom level → **falls back to the existing
   programmatic fill for that stage/lane-type**, per PLAN §7.3/R13 (this is
   the one check with an explicit built-in fallback path rather than a
   simple reject/regen).
   **⚠️ Option B heightened-risk flag (2026-07-24) — read this as a BIGGER
   risk than before, not a lowered bar:** full-illustration ground textures
   (soft shading bands, painterly gradients, organic detail/noise) are
   architecturally MORE prone to visible seams than the old flat 2-3-color
   pixel fills were. A flat, mostly-uniform fill hides a boundary mismatch
   easily (there's very little detail to mismatch); a smoothly-shaded,
   texture-rich illustrated tile has continuous directional shading and
   organic detail that makes any edge discontinuity far more obvious at the
   tile boundary. Expect a HIGHER tile rejection/fallback rate under Option
   B than the M7.1 hard-pixel batch showed — this is an accepted, budgeted
   risk (the fallback path absorbs it with zero further code change), not a
   reason to relax check #4 itself.
5. **Silhouette readability at final in-game display size (mandatory, all
   sprites/eagle/train/vehicles/corn). Lightly adapted 2026-07-24 for
   Option B's variable ceiling sizes (no longer a fixed native×3
   formula).** Resize the test render DOWN to the asset's actual in-game
   display size (per DESIGN §4's established on-screen sprite dimensions,
   e.g. chicken ≈48×48, eagle ≈72×72; vehicles per Section 2's "Final
   in-game render size" column) using a normal smooth resample, and confirm
   the subject reads clearly against BOTH the lightest and darkest
   backgrounds it will appear over for that stage, at a glance (<1s, no
   staring). FAIL = silhouette ambiguity or melting into the background at
   final render size.
6. **Correct per-stage color identity (mandatory where an asset repeats
   across stages: tiles, vehicles).** Compare all same-role assets across
   stages side by side (e.g. the 3 car sprites). PASS = each stage's set is
   visibly distinct in hue/mood matching DESIGN §3 (S1 bright/saturated, S2
   cool/night, S3 desaturated/hazard-lit). FAIL = stages read as
   interchangeable/generic.
7. **No stray artifacts (mandatory, all assets). REVISED 2026-07-24
   (Option B) to explicitly call out a real defect found this task.** No
   partial second object, no text/watermark/signature, no cut-off
   silhouette edges, no unintended scenery/ground bleeding into a sprite's
   transparent canvas — **explicitly including a baked-in ground ellipse,
   grass tuft, or contact-shadow patch under a standing character's feet**
   (found on the `chick-idle-styleB` sample despite "no scenery, no shadow"
   already being present in its prompt/negative — see DESIGN.md §10.5 and
   the strengthened negative-prompt fix in Section 1/Global Rule 4 above;
   treat this as a known, recurring Option-B failure mode worth a stricter
   re-check on every standing-pose asset, not a one-off). FAIL = any of the
   above, including a baked ground/shadow/grass element.
8. **Glow exception respected (mandatory, vehicles + train-car +
   signal-housing).** The generated raster must NOT contain a baked-in
   light-glow/halo — that stays a separate programmatic radial-gradient
   overlay (Global Rule 6). FAIL = any baked glow (would double up or
   visually conflict with the runtime overlay).

---

## A4 — VALIDATION BATCH (M7.1 gate — run these FIRST, before the full run)

**PM's suggested 3 (chicken idle + one Stage-1 vehicle + Stage-1
background) are CONFIRMED as the mandatory minimum, with one addition
recommended below.**

Reasoning for confirming PM's picks:
- `chick-idle` is the single most-scrutinized, most-repeated asset in the
  game (title hero, every idle frame, base for both death poses via
  transform) — if this fails style-fit, nothing else is worth attempting.
- `veh-s1-car` is the simplest vehicle silhouette (no cab-block or
  window-row complexity like truck/bus) and Stage 1 is the brightest/most
  forgiving palette to sanity-check contrast and glow-overlay compatibility
  against — a good low-risk-but-representative first vehicle test.
- A Stage-1 background element is the most meaningful regression check
  available: **this exact concept (rolling hills + sun + blue sky) is the
  one that already failed style-fit** via `evalstate/flux1_schnell`
  (`assets/test-stage1-hills-bg.webp`, DESIGN §10.2) — **under the OLD
  pixel-art style guide that was in force at the time.** Re-running the same
  visual idea is still a direct before/after comparison, but now proves fit
  for the Option-B smooth-illustration path (2026-07-24 update) instead of
  the pixel-art path this rationale originally referred to — the concept
  choice is unaffected by which style is being validated, only the target
  style changed.

**Recommended 4th addition — `tile-s1-grass` (adjustment, with reasoning):**
none of PM's 3 original picks exercise **tiling** at all — tiling
(edge-to-edge seamless repetition) is an architecturally distinct failure
mode from style-fit (per PLAN Risk R13, diffusion models are specifically
bad at this even when their per-image style is otherwise fine), and it only
applies to the 11 ground-tile assets. Since ground tiles are explicitly
called out in PLAN §7.1/§7.3 as the riskiest category with its own
fallback safeguard, gating the full run on style-fit alone would leave the
tiling risk completely unvalidated until the full run — the worst time to
discover it. Recommend running `tile-s1-grass` as a 4th hero asset
alongside the mandatory 3 (same gate, same GO/NO-GO decision) since it's
cheap (one more generation call) and directly de-risks the single riskiest
category in the whole manifest.

### Ready-to-execute validation batch (4 assets)

**Batch descriptions REVISED 2026-07-24 (Option B FINAL re-baseline) —
sizes below are now payload ceilings, not forced pixel-grid outputs; post-
process is now chroma-key ONLY (Global Rule 2a), no downscale/quantize:**

1. **`chick-idle`** (Frame A only is sufficient for the gate — the other 3
   frames are near-identical head-bob offsets and don't need separate
   validation):
   - Prompt/negative/palette/seed: see Section 1 above (seed `1101`,
     negative prompt strengthened this task per DESIGN.md §10.5's finding).
   - Space: `evalstate/flux1_schnell` + Global Rule 2 post-process (chroma-
     key ONLY, Rule 2a — no downscale/quantize under Option B).
   - Payload ceiling: ~128×128 (Option B hero-sprite ceiling; no forced
     grid). **Status: already generated as `chick-idle-styleB` — see
     DESIGN.md §10.5 for the full adopt-vs-regenerate verdict (NOT
     adoptable as-is; 2 defects found, regeneration needed).**
   - Transparency: required (chroma-key per Global Rule 2a, keyed against
     the requested pure `#00FF00` backdrop, including enclosed pockets per
     revised A3 #3).

2. **`veh-s1-car`**:
   - Prompt/negative/palette/seed: see Section 2 above (seed `1201`).
   - Space: `evalstate/flux1_schnell` + Global Rule 2 post-process (chroma-
     key only).
   - Payload ceiling: ~96×64 (Option B vehicle-category ceiling; was ~15×10
     pixel-grid).
   - Transparency: required.

3. **`bg-s1-hill-far`** (chosen over `bg-s1-sun`/`bg-s1-hill-near` as the
   single representative Stage-1 background element, since it's the
   closest direct match to the concept that already failed):
   - Prompt/negative/palette/seed: see Section 8 above (seed `1801`, subject
     description revised this task for smooth-illustration rendering).
   - Space: `evalstate/flux1_schnell` + Global Rule 2 post-process (chroma-
     key only).
   - Payload ceiling: ~128×64 (Option B parallax ceiling), transparent, no
     sky fill baked in (Global Rule 7).
   - Transparency: required.

4. **`tile-s1-grass`** (recommended addition, tiling risk gate):
   - Prompt/negative/palette/seed: see Section 7 above (seed `1701`).
   - Space: `evalstate/flux1_schnell` + Global Rule 2 post-process (this row
     is a full-fill opaque tile — no chroma-key backdrop applies, per the
     Section 7 note above; no downscale/quantize under Option B either).
   - Payload ceiling: ~128×128 (Option B tile ceiling; was 16×16 pixel-grid).
   - **Run the A3 #4 tiling test (3×3 render) specifically on this asset
     before GO/NO-GO — under Option B this check carries a HEIGHTENED risk
     (see A3 #4's note above), not a lowered one; this is the check the
     other 3 assets don't exercise at all.**

**GO/NO-GO (REVISED 2026-07-24, Option B — check names/numbers updated to
match the A3 rewrite above):** all 4 must pass A3 checks #1 (clean
smooth-illustration rendering), #2 (hue-family/mood adherence), #3
(transparency, including enclosed pockets, for the 3 sprite/bg assets), #5
(silhouette readability); the tile additionally needs #4 (tiling, heightened
risk under Option B — see above). If `tile-s1-grass` fails tiling but the
other 3 pass everything else, that alone does NOT block the GO decision for
the full run — it confirms the fallback path (PLAN §7.3) will be needed for
some/all ground tiles, which is an accepted, already-planned outcome, not a
blocker (and, per the heightened-risk flag, an outcome to expect MORE often
than the old hard-pixel batch showed). A NO-GO is only warranted if the
**style-fit** checks (#1/#2/#5, not #4) fail on the core sprite/vehicle/
background assets — that would mean the `evalstate/flux1_schnell` + Rule 2a
pipeline itself is not fit for purpose and the whole image-generation plan
needs re-evaluation before spending the full budget. **The old R15 muddiness
risk (chicken/vehicle reading muddier than hand-authored art after a 16×16
crush) no longer applies under Option B** (see Global Rule 1's R15 update
above) since there is no more forced downscale — the comparable per-category
risk to escalate now is a hue-family/mood miss or a stray-artifact/enclosed-
transparency defect (revised A3 #2/#3/#7), exactly the kind found on
`chick-idle-styleB` this task (see DESIGN.md §10.5) — a per-asset finding to
escalate for a regenerate-with-tweaks decision, not an automatic
whole-pipeline NO-GO.

---

## SFX Manifest + Prompts (`hkchengrex/MMAudio` `/text_to_audio`)

| ID | Current implementation replaced | Status |
|---|---|---|
| `sfx-hop` | `AudioManager.hop()` (line 340) called by `Player._startHop()` (848) | replacement of existing synth |
| `sfx-corn` | `AudioManager.corn()` (341) called by `Game._collectCorn()` (1183) | replacement |
| `sfx-vehicle-death` | `AudioManager.death()` (344) called by `Game.killPlayer()` non-water branch (1216) — currently shared by **both** car AND train impact deaths | replacement (keep shared for car+train, matches shipped design) |
| `sfx-water-death` | `AudioManager.splash()` (345) called by `Game.killPlayer()` water branch (~1211) | replacement |
| `sfx-train-bell` | `AudioManager.bell()` (343) called by `Train.update()` warn-state blink loop (644-649), once per 200ms flash | replacement |
| `sfx-train-rush` | **NOT CURRENTLY IMPLEMENTED** — no audio call exists during `Train` state `'pass'` (655-664 has zero SFX). Genuinely new addition, not a replacement. | net-new; insertion point = the moment `state` is set to `'pass'` (line ~651-654, end of the `warn` branch) |
| `sfx-eagle-grab` | Currently reuses `AudioManager.death()` via `Game._checkFallBehind()` (line 1303) — no distinct sample exists today | distinct-ify (was previously sharing the generic death cue) |
| `sfx-game-over` | `AudioManager.gameover()` (347) called by `Game.gameOver()` (1226) | replacement |
| `sfx-stage-clear` | `AudioManager.clear()` (346) called by `Game._onStageReached()` stage-clear branch (1166) — **currently shares the exact same call/sample as victory** | replacement, differentiate from victory |
| `sfx-victory` | Same `AudioManager.clear()` call, victory branch (line 1158) — identical sample to stage-clear today | distinct-ify (grander/longer fanfare vs. stage-clear's shorter cue) |

Shared params unless noted: `num_steps: 25`, `cfg_strength: 4.5`. Negative
prompt = the global SFX baseline (Global Rule 10) for all rows.

- `sfx-hop`: prompt `"short 8-bit chiptune hop/jump blip, quick upward pitch
  sweep, punchy square wave, arcade game sound effect"`, duration `0.15s`,
  seed `2101`.
- `sfx-corn`: prompt `"bright 8-bit coin/pickup collect chime, two-note
  ascending sparkle, chiptune sine wave, cheerful arcade sound effect"`,
  duration `0.25s`, seed `2102`.
- `sfx-vehicle-death`: prompt `"8-bit arcade impact/death sound, punchy low
  square-wave thud combined with a short burst of crunchy noise, descending
  pitch, retro game-over-style hit"`, duration `0.4s`, seed `2103`.
- `sfx-water-death`: prompt `"8-bit arcade splash sound effect, filtered
  white-noise splash burst with a soft descending tone underneath, watery
  chiptune"`, duration `0.4s`, seed `2104`.
- `sfx-train-bell`: prompt `"short 8-bit warning bell/alarm ding, bright
  triangle-wave double chime, urgent telegraph-style alert, arcade game"`,
  duration `0.2s`, seed `2105`.
- `sfx-train-rush`: prompt `"fast 8-bit train rushing-past whoosh, rising
  then falling filtered noise sweep with a rhythmic clatter undertone,
  short and intense, chiptune arcade style"`, duration `0.6s`, seed `2106`.
- `sfx-eagle-grab`: prompt `"8-bit swoop and grab sound effect, quick
  descending whoosh followed by a sharp snatch/grab accent, dramatic but
  short, chiptune arcade style"`, duration `0.5s`, seed `2107`.
- `sfx-game-over`: prompt `"8-bit descending three-note game-over fanfare,
  square wave, somber/defeated arcade cadence"`, duration `0.9s`,
  seed `2108`.
- `sfx-stage-clear`: prompt `"8-bit ascending four-note success jingle,
  square wave, short triumphant arcade stage-clear cue"`, duration `0.7s`,
  seed `2109`.
- `sfx-victory`: prompt `"8-bit triumphant victory fanfare, longer ascending
  multi-note chiptune melody, grander and more celebratory than a short
  stage-clear jingle, arcade game finale"`, duration `1.6s`, seed `2110`.

---

## Summary counts

**Style status: Option B (fully smooth/illustrated) FINAL as of 2026-07-24,
M7.1b re-baseline — not draft. See DESIGN.md §0/§10.5 and
`docs/reports/ISSUES.md` SCOPE-03 (RESOLVED)/SCOPE-04 for the decision
record. M7.7 (chrome/HUD/particle restyle) is a separate, not-yet-started
milestone — this manifest covers world/character art generation only.**

- Image assets: 34 rows (chicken 2 framesets/6 frames, vehicles 7, river
  objects 3, train 2, corn 1, eagle 2, ground tiles 11, parallax units 6).
  Row count unchanged by the Option B re-baseline — only style prefix,
  post-process, size framing (ceiling not grid), and palette framing
  (hue-guide not lock) changed.
- SFX assets: 10 (8 replacements of existing synth cues, 2 net-new —
  `sfx-train-rush`, `sfx-eagle-grab` — flagged explicitly above, not silently
  invented). SFX is UNCHANGED by this revision (Option B applies to visual
  style only).
- Validation batch: 4 assets (`chick-idle`, `veh-s1-car`, `bg-s1-hill-far`,
  `tile-s1-grass`), ready to execute immediately with the exact
  prompts/params in the A4 section (updated for Option B this task).
  `chick-idle` specifically has already been trial-generated as
  `chick-idle-styleB` — see DESIGN.md §10.5 for the adopt-vs-regenerate
  verdict (NOT adoptable as-is, regeneration needed with a strengthened
  negative prompt + corrected keying technique).
