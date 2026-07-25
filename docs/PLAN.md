# PLAN — Chicken Road

Status: DRAFT for approval (Stage 1)
Owner: pm
Team shape: **uiux → frontend → tester** (NO backend — single-file client-only
game with no API/DB/contract).

---

## 1. Team & Ownership

| Role | Participates | Owns |
|------|--------------|------|
| pm | Stage 1 + final sign-off | docs/PRD.md, docs/PLAN.md, docs/FINAL_REPORT.md |
| uiux | Stage 2 | docs/DESIGN.md, design/ mockups (art direction, palettes, sprite/anim specs, screen specs) |
| frontend | Stage 3 | the single game HTML file (entire build), owns it exclusively |
| tester | Stage 4 | docs/TEST_REPORT_<n>.md (manual plan vs PRD acceptance criteria) |
| backend | — | **Not used on this project.** |

File-ownership note: because there is one deliverable file, frontend is the sole
owner of it; no parallel two-dev build is needed. Team-mode parallel build does
NOT apply here.

## 2. Milestones

- **M0 — Requirements & Plan (this stage, pm):** PRD + PLAN approved by user.
- **M1 — Design / Art Direction (uiux):** DESIGN.md + HTML/CSS (or canvas)
  mockups: palettes per stage, sprite sheets/animation specs drawn as reference,
  screen layouts (title, HUD, stage-clear, game-over, victory). HUMAN GATE.
- **M2 — Core loop (frontend):** canvas + delta-time loop, grid, camera,
  Player class with hop tween + squash/stretch, input (keyboard + touch/swipe),
  grass lanes, HUD skeleton. Playable "hop up an empty field" vertical slice.
- **M3 — Hazard systems (frontend):** Road (Vehicle), River (Log/lily pad
  carrying), Railway (Train + telegraph), collision + death states, particles
  (dust/feathers/splash), screen shake + slow-mo, corn pickups + scoring.
- **M4 — Stages, screens & audio (frontend):** 3 stage configs + palettes +
  parallax, stage-clear at row 30, victory, title + game-over + restart, eagle
  fall-behind, Web Audio SFX + mute, high-score session var.
- **M5 — QA loop (tester ⇄ frontend):** execute AC-1…AC-14, bug reports, fixes
  (max 3 cycles). PASS gate.
- **M6 — Ship (pm):** PR, FINAL_REPORT.md, human approval to merge.

## 3. Task Breakdown

### 3.1 uiux (Stage 2 — M1)
- U1. Define global visual language: pixel grid, base tile size, 3× chicken
  scale, HUD typography (bitmap-style), color usage rules.
- U2. Chicken sprite + animation spec: idle (4 frames head-bob/peck), hop
  squash/stretch keyframes, wing-flap mid-hop, feather-burst death, splash
  death. Deliver as annotated pixel reference (grid + hex per pixel or drawn
  swatches frontend can translate to code).
- U3. Environment tile specs: grass (+ tree/rock obstacles), road (+ lane
  markings), river (water shimmer, log, lily pad), railway (tracks, signal,
  bell). Vehicle set: car/truck/bus with headlight glow. Train multi-car. Corn
  pickup (spin frames + sparkle). Eagle swoop.
- U4. Three stage palettes + parallax background specs: Countryside (day), City
  (night + streetlights), Industrial (hazard lights). Provide hex palettes.
- U5. Screen specs/mockups: title (animated chicken + prompt), in-game HUD
  (score/corn/stage + mute button), stage-clear, game-over, victory.
- U6. Confirm responsive strategy from PRD §4 (mobile-first portrait play
  column, scale-to-fit + letterbox) in DESIGN.md and note safe-area/touch
  target sizing for mobile controls.
- Deliverable: `docs/DESIGN.md` + reference mockups in `design/`. HUMAN GATE.

### 3.2 frontend (Stage 3 — M2→M4, single HTML file)
Engine / core (M2):
- F1. Project skeleton: single HTML, canvas sizing with virtual resolution +
  devicePixelRatio, scale-to-fit + letterbox, resize handling.
- F2. Game loop: `requestAnimationFrame` + delta-time; fixed logical-speed
  movement; game-state machine (Title / Playing / StageClear / GameOver /
  Victory).
- F3. `Camera` class: smooth easing scroll, per-stage speed, lookahead.
- F4. Grid + `Lane` base class + lane generation/recycling as camera scrolls.
- F5. `Player` class: grid hop with tween, squash-and-stretch, wing flap, input
  buffer; boundary + obstacle blocking.
- F6. Input: keyboard (Arrows + WASD), touch tap (forward) + 4-dir swipe.
- F7. Grass lanes with tree/rock obstacles; HUD skeleton (score/corn/stage).

Hazards & juice (M3):
- F8. `Vehicle` class + Road lanes (varying speed/direction, headlight glow),
  collision → impact death.
- F9. `Log`/lily pad + River lanes: carrying logic, water death, carried-off-edge
  death, splash particles.
- F10. `Train` class + Railway lanes: warning light + bell telegraph, fast pass,
  track death.
- F11. Particle system: dust puff, feather burst, water splash, corn sparkle.
- F12. Death flow: screen shake + slow-motion flash + death animation + SFX.
- F13. Corn pickups (spin) + scoring (furthest-row score + bonus) + HUD wiring.

Stages, screens, audio (M4):
- F14. Three stage configs (difficulty params from PRD table) + palettes +
  parallax backgrounds.
- F15. Stage-clear at row 30 (show score + corn), advance; victory after Stage 3.
- F16. Title screen (animated chicken + Space / tap prompt); Game-over screen
  (final score, corn, high score, restart); restart flow.
- F17. Eagle fall-behind: swoop-in grab animation → game over.
- F18. Web Audio SFX manager (hop, corn, car horn, train bell, death cluck),
  unlock-on-first-input, mute toggle.
- F19. Session high-score variable + display.
- F20. Structure/cleanup pass: ensure required classes exist and are readable;
  remove any external references; self-review against AC-14.
- Deliverable: the single playable HTML game file, committed on `feature/chicken-road`.

### 3.3 tester (Stage 4 — M5)
- T1. Build a manual test plan mapping every AC (AC-1…AC-14) to concrete steps.
- T2. Execute on desktop (keyboard) — movement/feel, all lane win/lose cases,
  camera+eagle, corn/scoring, 3 stages + stage-clear@30, death/restart, audio,
  no console errors.
- T3. Execute on mobile or emulated touch — tap/swipe hops, scale-to-fit, crisp
  rendering.
- T4. Delta-time/perf check: verify consistent speed across frame rates and
  target ~60fps; static check for the required classes and no external assets.
- T5. Log defects with severity in `docs/TEST_REPORT_<n>.md`; route to frontend;
  re-test after fixes (max 3 cycles, escalate on cycle 3).

## 4. Dependencies

- M1 (uiux) blocks M2–M4: frontend needs palettes + sprite/anim specs +
  screen layouts before final art, though F1–F6 engine work can start against
  placeholder art in parallel if the approval gate is passed early.
- Within frontend: F1–F2 precede everything; F5 (Player) precedes F8–F10
  collisions; F11 (particles) precedes F12 (death juice) polish; F14 stage
  configs depend on hazard systems F8–F10 existing.
- M5 (tester) depends on a feature-complete M4 build.
- M6 (ship) depends on tester PASS + human PR approval.

## 5. Risk Register

| ID | Risk | Impact | Likelihood | Mitigation |
|----|------|--------|------------|------------|
| R1 | Game feel underwhelms (hops feel laggy) despite meeting functional AC | High | Med | Prioritize F5 hop tween + input buffer + dust/squash early; playtest the M2 slice before adding hazards; treat feel as a gate, not a nice-to-have. |
| R2 | Single-file size/complexity becomes unmaintainable | Med | Med | Enforce class structure (PRD §5/AC-14); keep config data in tables; frontend does F20 structure pass. |
| R3 | Web Audio autoplay blocked until user gesture (silent game) | Med | High | Unlock AudioContext on first input; visible mute/unmute state; tester verifies AC-11 explicitly. |
| R4 | Mobile scaling blurs pixel art or breaks touch targets | Med | Med | Fixed virtual resolution + integer-friendly scale + devicePixelRatio; uiux specifies touch target sizes; tester runs AC-13. |
| R5 | Frame-rate dependence sneaks in (movement tied to frames) | High | Med | Delta-time from F2 onward; tester AC-12 checks speed consistency across refresh rates. |
| R6 | River carrying logic edge cases (log boundaries, partial tiles) feel unfair | Med | Med | Define carry + off-edge death precisely (AC-5); playtest; snap/tolerance tuning. |
| R7 | Train telegraph too short/long → feels unfair or trivial | Low | Med | Tune warning window per stage; tester validates telegraph-before-train (AC-6). |
| R8 | 3-cycle QA loop insufficient for feel-tuning polish | Med | Low | Separate functional bugs (must-fix in loop) from subjective polish (log as known limitations if time-boxed); escalate per CLAUDE.md. |
| R9 | Programmatic pixel art volume (many sprites) inflates M1/M2 time | Med | Med | uiux prioritizes chicken + core hazards first; secondary decoration (trees, parallax) can be simpler; scope decoration to "readable" not "elaborate". |

## 6. Definition of Done (project)

- Single HTML file plays end-to-end: title → 3 stages → victory, with all lane
  types, corn, eagle, and death/restart working.
- All AC-1…AC-14 pass in tester's plan (or exceptions signed off as known
  limitations by the user).
- No console errors, no external network requests, required classes present.
- FINAL_REPORT.md posted; PR approved by user before merge.

---

## 7. AMENDMENT — Milestone M7: Asset Regeneration & Integration (added 2026-07-24)

**Status:** APPROVED / FINALIZED 2026-07-24. Client decision (verbatim: "Yes
replace with the new assets"): Q1 = FULL replacement of ALL assets incl.
per-stage environment tiles; Q2 = CONFIRMED (proceed with the SCOPE-02
generated-audio amendment, PRD §5 AMENDMENT #2). uiux may start M7.0.
**Owner:** pm (this plan) → uiux + orchestrator + frontend + tester.
**Type:** an asset-pipeline + rendering/audio-integration initiative layered on
the SHIPPED, MERGED game (PR #1). The core game and the base PRD stand — this is
NOT a new PRD from scratch. New feature branch `feature/asset-regen`; never touch
`main` directly.

### 7.1 What changed and why
The client authorized (a) HF MCP-generated **raster art** (SCOPE-01, PRD §5
AMENDMENT #1) and now (b) HF MCP-generated **audio SFX** (SCOPE-02, PRD §5
AMENDMENT #2), and wants BOTH actually wired into the shipped game — replacing
the current canvas-drawn (`fillRect`/`PIXEL_MAPS`) art and Web Audio
oscillator-synthesized SFX with generated assets — not just kept as reference
files.

### 7.2 Hard constraints downstream agents MUST honor (do not re-discover)
1. **Subagents cannot call HF MCP tools (ENV-01).** Only the orchestrator's main
   session can generate. Therefore: uiux SPECS the asset list + prompts + params
   + accept/reject criteria; the ORCHESTRATOR EXECUTES every generation call;
   uiux then CURATES/reviews the returned files. No plan step assumes uiux (or
   any subagent) generates anything itself.
2. **Style-fit is unproven at scale.** The one FLUX.1-Schnell test
   (`assets/test-stage1-hills-bg.webp`, DESIGN §10.2) came out smooth/painterly,
   NOT the hard-edged pixel-art the style guide mandates — a STYLE MISMATCH, not
   usable. The proven-appropriate path is the `lm555/game-asset-generator` Space
   (FLUX + pixel-art color-quantization) — but it is UNTESTED (a test call was
   interrupted). So a small **VALIDATION BATCH (2-3 hero assets) is a hard gate
   BEFORE the full run** to catch style/quality problems early.
3. **SFX generation** works via `hkchengrex/MMAudio` (text_to_audio) — proven
   once, client-approved for `assets/test-sfx-hop.flac`.
4. **Single-file / zero runtime network calls still binding.** Every generated
   image AND audio asset ships INLINED as a base64 `data:` URI in `index.html`;
   images loaded via `Image()` from the data URI, audio via
   `decodeAudioData` to an in-memory buffer. NO runtime fetch of any asset.
5. **Never regress the shipped game.** Rendering/audio integration is
   FALLBACK-FIRST: if a generated asset is absent/rejected/failed, the existing
   programmatic `fillRect` draw / oscillator synthesis path is used, so a missing
   asset can never break gameplay. Web Audio stays the playback + mute engine.

### 7.3 Scope breadth (Q1 — RESOLVED 2026-07-24)

**CLIENT DECISION:** FULL replacement — generate replacements for EVERY asset
in the list below, INCLUDING the per-stage environment tiles (grass/road/river/
railway ×3 stages). The hero-first fallback is NOT the chosen scope. All target
assets are in scope for generation.
Full target list per PRD §6 / DESIGN §6: chicken (idle/hop/death-impact/
death-water), vehicles per stage (car/truck/bus), logs, lily pads, train +
warning light + bell, corn pickup, environment tiles (grass/road/river/railway
per stage), eagle grab; SFX: hop, corn collect, vehicle-collision death, water
splash death, train warning bell, train rush, eagle grab, game-over, stage-clear,
victory.

**Execution safeguard (retained, NOT a scope reduction):** repeating
environment tiles (grass/road/river/rail) are in scope for generation, but each
generated tile must PASS the seamless-tiling check in §7.5 A3 before it ships;
any tile that tiles with visible seams FALLS BACK to its existing programmatic
draw and is reported (Risk R13). This protects the "readable danger" quality
bar — diffusion models tile poorly — without dropping any asset from the
generation attempt. Same fallback-first rule as every other asset (Constraint 5).

### 7.4 Milestones
- **M7.0 — Spec & prompts (uiux):** asset manifest + per-asset prompts/params +
  accept/reject criteria + validation-batch selection. No generation.
- **M7.1 — Validation batch (orchestrator ⇄ uiux, HUMAN GO/NO-GO GATE):**
  generate 2-3 hero assets via the pixel-art path; surface renders to user;
  uiux judges against criteria; GO/NO-GO before any full run.
- **M7.2 — Full generation (orchestrator):** on GO, generate the approved
  manifest (images via pixel-art path, SFX via MMAudio); post-process
  (downscale + palette-quantize + nearest-neighbor) where needed; produce base64
  payloads.
- **M7.3 — Curation (uiux):** accept/reject/regenerate per asset; document the
  final approved set + any fall-back-to-programmatic decisions in DESIGN §10.5.
- **M7.4 — Integration (frontend):** asset registry + fallback-first rendering +
  buffer-based audio, on `feature/asset-regen`.
- **M7.5 — Regression + new-asset QA (tester):** full AC re-run + zero-network
  assertion + audio/visual/perf checks.
- **M7.6 — Ship (pm + orchestrator):** PR from `feature/asset-regen`; ⛔ USER
  CONFIRM before push/PR/merge/deploy (outward-facing).

### 7.5 Task breakdown per role

**uiux (M7.0, M7.3 — specs & curates; CANNOT generate, per ENV-01):**
- A1. Authoritative ASSET MANIFEST: enumerate every target asset (per §7.3 +
  client Q1 answer) with id, type (sprite / anim-frameset / background / tile /
  sfx), native grid/size, frame count, target stage(s), and the exact
  programmatic source in `index.html` it would replace.
- A2. Per-asset generation PROMPTS + params (space/model, seed, negative prompts,
  palette + transparency constraints) tuned to the "Arcade Pixel" guide (§0/§1),
  explicitly incorporating the FLUX.1-Schnell style-miss lesson (DESIGN §10.2):
  mandate the pixel-art path (`lm555/game-asset-generator`) and/or a
  post-process quantization pass — do NOT re-attempt generic FLUX for pixel art.
- A3. STYLE VALIDATION CRITERIA (objective accept/reject checklist): hard-edged
  grid / zero anti-aliasing, palette adherence, transparent bg for sprites,
  **seamless tiling** for any tile, silhouette readability at 3× scale, correct
  per-stage palette. This is the bar the orchestrator's outputs are judged on.
- A4. Select the VALIDATION BATCH: 2-3 hero assets (recommend chicken idle +
  one Stage-1 vehicle + Stage-1 background) for the M7.1 go/no-go gate.
- A5 (post-generation). Review/curate returned files against A3; mark
  accept / reject / regenerate-with-tweaks per asset; record the final approved
  set and any fall-back-to-programmatic decisions in a NEW DESIGN.md §10.5.

**orchestrator (M7.1, M7.2 — executes all generation, per ENV-01):**
- O1. Run the validation batch (A4) via HF MCP using A2 prompts/params; save to
  `assets/gen/`; relay renders to uiux + user for the M7.1 GO/NO-GO gate.
- O2. On GO: execute the full run per the approved manifest — images via the
  pixel-art path, SFX via `hkchengrex/MMAudio`; save raw outputs to `assets/gen/`.
- O3. Post-process where needed (downscale → palette-quantize → nearest-neighbor
  upscale per DESIGN §10.2) and produce the final base64 `data:` URI payloads for
  frontend handoff.
- O4. Log every generation call in `docs/reports/USAGE.md` (asset, space/model,
  tokens/credits, date).

**frontend (M7.4 — integration, sole owner of `index.html`):**
- I1. ASSET REGISTRY in `index.html`: `id → data:` URI maps for images and audio;
  images decoded via `Image()`, audio via `decodeAudioData` at unlock time.
- I2. Refactor the renderer so each sprite/background draw checks the registry
  first and draws the generated image (`imageSmoothingEnabled=false`), FALLING
  BACK to the existing `fillRect`/`PIXEL_MAPS` path if the asset is absent
  (never regress — Constraint 5).
- I3. Refactor `AudioManager` to play decoded buffers for covered SFX through the
  existing gain/mute graph; keep oscillator synthesis as the per-SFX fallback;
  preserve unlock-on-first-input + mute-all (AC-11).
- I4. Keep the shipped artifact a SINGLE self-contained `index.html` with ZERO
  runtime network calls — all assets inlined base64, no new external refs.
- I5. Small conventional commits on NEW branch `feature/asset-regen`; do not
  touch `main`; do not pull `assets/test-stage1-hills-bg.webp` (rejected, §10.3).

**tester (M7.5 — regression + new-asset verification):**
- V1. Re-run the FULL AC-1…AC-14 manual plan (regression): the game must still
  pass everything it passed at ship, with generated assets in place.
- V2. Assert AC-14/§11: ZERO runtime network requests fire (data: URIs only); no
  external asset references.
- V3. AC-11 with generated audio: each SFX audible + correct sample per event;
  mute toggles ALL SFX; unlock-on-first-input still works; fallback synth path
  works when a sample is force-disabled.
- V4. Visual regression: each generated sprite/background renders crisp
  (pixelated), correct per stage, no broken/missing-image placeholders; confirm
  the programmatic fallback renders when an asset is force-disabled.
- V5. Perf/size: report the shipped `index.html` size delta from base64 inlining;
  confirm load/parse is acceptable and ~60fps holds (AC-12).

### 7.6 Dependencies
A1–A4 → O1 (validation batch) → **M7.1 human GO/NO-GO** → O2/O3 → A5 curation →
I1–I5 → V1–V5 → M7.6 ship. Human gates: (1) validation-batch go/no-go (surface
renders in chat), (2) PR push/merge/deploy (outward-facing, USER CONFIRM).

### 7.7 Risk register additions (extend §5)
| ID | Risk | Impact | Likelihood | Mitigation |
|----|------|--------|------------|------------|
| R10 | Pixel-art path (`lm555/game-asset-generator`) also fails style-fit at scale | High | Med | 2-3 hero validation batch GATES the full run; per-asset fallback to programmatic art; never wire a reject. |
| R11 | base64 inlining bloats `index.html` (load/parse, mobile) | Med | Med | Budget a size cap; prefer compact/quantized formats; report size delta (V5); drop to programmatic if an asset's payload isn't worth it. |
| R12 | Regression on a shipped/tested/merged product | High | Med | Fallback-first rendering/audio (Constraint 5); full AC re-run before PR; work isolated on `feature/asset-regen`. |
| R13 | Seamless tiling of generated environment tiles is hard for diffusion models | Med | High | Default repeating tiles stay programmatic unless a generated tile passes A3's seamless-tiling check; hero sprites + backgrounds are the primary targets (§7.3 default). |
| R14 | ENV-01 subagent HF tool gap blocks self-serve generation | High | Certain | By design, ALL generation routes through the orchestrator (O1–O4); uiux specs + curates only. |

### 7.8 Open product questions (client-owned — see PM report)
- **Q1 (scope breadth):** RESOLVED 2026-07-24 → FULL replacement of all assets
  incl. per-stage tiles (client: "Yes replace with the new assets"). Tiles keep
  the §7.3 seamless-tiling safeguard (fallback to programmatic on failure).
- **Q2 (audio amendment):** RESOLVED 2026-07-24 → CONFIRMED. PRD §5 AMENDMENT #2
  / SCOPE-02 is now client-approved, no longer provisional.

### 7.9 Pipeline decision — image-gen tool pivot (2026-07-24, ENV-02)

The manifest-mandated pixel-art space `lm555/game-asset-generator` is unusable
(ENV-02): the authenticated MCP path returns a raw non-retrievable `PIL.Image`;
the anonymous `gradio_client` path fails on quota; and manually attaching the
account token to `gradio_client` is correctly refused (no raw-credential
handling, per Security Rules). This is a TOOLING blocker, not a style/product
problem, so it is resolved on PM/execution judgment — the client's product
decision (generated pixel-art assets, full replacement) is unchanged.

**Decision (PROVEN-tools-only):** image pipeline = `evalstate/flux1_schnell`
(authenticated, returns retrievable files) as the SOURCE generator + the
manifest's already-mandatory **Global Rule 2 post-process** (chroma-key →
downscale to native grid → palette-quantize to the EXACT per-asset DESIGN §3
hex list → nearest-neighbor upscale → native-grid transparent PNG). The Rule 2
quantization step is what imposes the hard-edged discrete pixel grid — in OUR
code, deterministically — so it does not depend on the source model producing
grid structure. This is exactly the remediation path DESIGN §10.2 already
sanctioned ('post-process pixelation/quantization on top of a FLUX.1-Schnell
source'); it is NOT a reversal of the §10.2 finding that generic FLUX alone is
insufficient — the difference is the mandatory Rule 2 pass. `lm555` is retained
in the manifest only as 'revisit if its access is fixed.'

**Ownership of the change:** uiux owns ASSET_MANIFEST.md — uiux revises Global
Rule 1 (image path → FLUX.1-Schnell + mandatory Rule 2) and, per asset, ensures
prompts request a solid chroma-key backdrop (e.g. pure `#00FF00`) so Rule 2a
keys cleanly. Orchestrator then RE-RUNS the M7.1 validation batch via the new
pipeline. The GO/NO-GO gate is unchanged and is the intended place to catch the
known residual risk below (R15) before any full run.

| ID | Risk | Impact | Likelihood | Mitigation |
|----|------|--------|------------|------------|
| R15 | Aggressive downscale-to-16×16 + chroma-key of a general-model source yields muddy SPRITES (chicken/vehicles/corn/eagle) — backgrounds are far more forgiving than tiny transparent silhouettes | High | Med | The validation batch (chick-idle + a vehicle + a background) exposes this AT the GO/NO-GO gate; if generated sprites read worse than the existing hand-authored `PIXEL_MAPS`, surface both to the user and let them decide per-category (keep hand-authored sprites, generate backgrounds/large props) — fallback-first rendering (Constraint 5) means either choice ships cleanly. |

### 7.10 M7.1 validation-batch result (2026-07-24)

Ran 4 assets through the pivoted pipeline. **3/4 PASS** (chick-idle — exact
7-color palette/hard edges/transparent, borderline-muddy per R15 but usable;
veh-s1-car — clean; tile-s1-grass — PASSES the A3 seamless-tiling check, exact
palette, only a minor non-functional 'busier than sparse blade-ticks' brief
deviation, acceptable / uiux may lightly tune the prompt on the full run).
**1 FAIL** (bg-s1-hill-far) — a chroma-key bug, NOT style-fit: the hill's own
target green (#A6DE7A) is too close to the #00FF00 key backdrop, so it keyed
out with the background. **Fix:** per-asset key color absent from + maximally
distant from that asset's own palette (magenta #FF00FF for green-dominant
assets — grass/river/lily/corn-husk; chosen per asset, since e.g. lily also
carries a pink flower). Re-run bg-s1-hill-far ONLY. **PM verdict: CONDITIONAL
GO** — on the hill re-run passing, M7.1 is a clean GO; proceed to M7.2 full
generation. R15 did not trigger a per-category client escalation (no sprite
read worse than hand-authored).
Reference files: `assets/gen/final/*.png`, `assets/gen/preview/*.png`,
`assets/gen/raw/*.webp` — nothing wired into index.html (reference-only).

### 7.11 Style-direction change — M7.1b reconciliation (2026-07-24, SCOPE-03)

Reacting to the M7.1 previews, the client asked for LESS pixelated / clearer
art ("so the user can still see the object clearly"). This reverses the
established hard-edge "Arcade Pixel" direction, so **M7.2 full generation is
HALTED and the M7.1 conditional-GO is PAUSED** until the direction is resolved
(no mass generation at a rejected style — protects cost/R11 and rework).

**Intent fork (must confirm with client on a VISIBLE A/B, not in the abstract):**
- (A) *Still-retro-but-clearer* — keep the game's pixel/retro identity, but bump
  hero-asset native grid (16x16 → ~32 or 48), soften the downscale, and relax
  "zero anti-aliasing" to "minimal controlled edge-softening / higher color
  count where it aids readability." Cheapest, keeps coherence. **PM recommends.**
- (B) *Fully smooth / illustrated* — drop hard pixel-art for a smooth rendered
  look. Bigger DESIGN.md identity change; also forces a decision on the still-
  hard-edged programmatic chrome/HUD/particles + any programmatic-fallback
  sprites (consistency), and index.html's `imageSmoothingEnabled=false`.

**M7.1b tasks:**
- uiux: produce the design-system reconciliation PROPOSAL (revised native sizes,
  AA rule, A3 check #1, and how generated art stays consistent with the
  programmatic chrome/particles/fallback layer). Specify prompts/params for a
  1-2 asset A/B (recommend chick-idle + bg-s1-hill-far) at the softer setting.
- orchestrator: generate the A/B via the pivoted pipeline (per ENV-02) at the
  new settings; surface original-vs-softer to the client in chat.
- client: confirm (A) vs (B) on sight.
- Then: uiux re-baselines ASSET_MANIFEST.md (Global Rule 5, A3, per-asset native
  sizes) + DESIGN.md §0/§1/§10 to the chosen direction; M7.2 resumes.

BUG-7 (river landing) is INDEPENDENT and proceeds in parallel regardless.

### 7.12 Option B locked — re-baseline + M7.7 chrome restyle + resume (2026-07-24, SCOPE-03/04)

Client locked **Option B (fully smooth/illustrated)** after a 3-way A/B,
acknowledging the chrome clash first. Sequencing:

1. **uiux re-baseline (blocks M7.2 resume):** update DESIGN.md §0/§1/§10 and
   ASSET_MANIFEST.md (Global Rule 5, A3 check #1, every per-asset native size +
   palette) to Option B per proposal §2 — no fixed low-res grid (~128px working
   ceiling for hero sprites, proportional otherwise, for base64-payload reasons
   only), drop Rule 2b/2c downscale+quantize (keep ONLY chroma-key transparency;
   the model's smooth output IS the final look), replace the tight per-asset hex
   LOCK with a looser hue-family guide (no hard ΔE snap). ENV-02 per-asset
   key-color rule still applies. Adopt the existing `assets/gen/m7.1b-styleB/`
   chick-idle render as production IF it conforms to the finalized manifest,
   else regenerate (uiux's call — avoid needless regen cost).
2. **M7.2 full generation RESUMES** at the confirmed Option-B style once (1) is
   done. The M7.1 GATE is satisfied by the B A/B; no separate re-gate needed.

**### M7.7 — Chrome / HUD / particle restyle (SCOPE-04, REQUIRED for B):**
- uiux: redesign the chrome/UI language (panels §1.3/1.4, in-game text §1.6, HUD
  §7.2, and the particle look §5) to harmonize with smooth illustrated world art
  instead of hard-pixel — decide the new panel/edge/text treatment and whether
  particles soften too. Update DESIGN.md accordingly.
- frontend: reimplement the restyled chrome/HUD/particles in index.html
  (index.html is frontend-owned; this is the same file as M7 asset integration —
  sequence M7.7 impl WITH or AFTER M7.4 integration on `feature/asset-regen`, not
  a competing branch, to avoid self-conflict).
- tester: verify chrome/HUD readability + consistency at M7.5 (fold into the
  regression pass; add readability/contrast checks over the new smooth backgrounds).
- Design work can run in PARALLEL with M7.2 generation; implementation lands with
  or after M7.4. Client already authorized the tradeoff (SCOPE-03), so this is
  required work, not a new approval gate — report progress, don't block.

**BUG-7:** fixed on `fix/river-landing`, now routed to TESTER for verification
(CLAUDE.md: tester verifies before PR). Runs parallel to the uiux re-baseline;
merges (USER CONFIRM for push/PR) BEFORE M7.4 integration touches index.html.

### 7.13 M7.2 generation results + SFX decision + integration sequencing (2026-07-24)

**Images: 34/34 generated** (chicken 2, vehicles 7, river/train/corn/eagle 8,
ground tiles 11, parallax bg 6) → `assets/gen/m7.2/{raw,final,preview}/`.
chick-idle regenerated clean (already client-implicitly-approved via the B pick).

- **uiux A5 CURATION pass (DESIGN §10.6) — do now, in parallel:** run the FORMAL
  A3 3x3 tiling check on EVERY tile (orchestrator only spot-checked by eye given
  volume). The 2 flagged (`tile-s3-road` uneven hazard stripes, `tile-s3-rail`
  vertically asymmetric) → CONFIRM reject → PROGRAMMATIC fallback per §7.3
  (fallback-first means a rejected tile simply isn't wired; the existing fill
  renders). Judge the minor prompt-adherence misses (window/socket counts,
  dashed-vs-solid markings, non-exact hex) — under Option B's hue-family guide
  non-exact hex is EXPECTED; default ACCEPT, uiux flags only any it wants redone.
  Produce the accept/reject/regen list + payload-size note (R11) in DESIGN §10.6.

- **SFX (ENV-03):** duration floor → accept 1.0s clips, frontend trims/fast-fades
  at playback. Quota wall → retry MMAudio via the ACCOUNT-AUTHENTICATED MCP path
  (as FLUX used), NOT anonymous gradio_client; NO raw-token handling (declined,
  Security). If still blocked → DEFER generated SFX to a follow-up; ship
  images-first with the existing synthesized SFX as live fallback (zero product
  risk; SCOPE-02 kept synthesis as fallback). Report defer to client as a
  fast-follow, not a drop.

- **Integration sequencing:** images and SFX are INDEPENDENT — do not block image
  integration on SFX. Order: BUG-7 merges first (same file) → frontend M7.4 builds
  the asset-registry + fallback-first render/audio plumbing and wires the
  uiux-APPROVED image set (curation runs in parallel, lands ~same time) →
  generated SFX wired whenever ENV-03 clears (may be a later increment) → M7.7
  chrome restyle impl with/after M7.4 → tester M7.5 regression. uiux curation can
  start immediately; frontend integration starts once BUG-7 is merged.

### 7.14 M7.2 curation complete + M7.4 integration dispatch (2026-07-24)

BUG-7 MERGED (PR #2, c2e0fcc) — index.html is clear for M7.4. Curation done:
**33/34 images are integration candidates** (25 straight ACCEPT + 2 accept-with-
note + 4 fixed rejects: bg-s2-skyline [post-process script fixed to border-pixel
MODE vs corner-averaging], veh-s2-truck & veh-s3-truck [regen + keep-largest-
component], eagle-grabbed [regen to a folded-wing dive silhouette]); **3 tiles
programmatic-fallback** (tile-s2-road, tile-s3-road, tile-s3-rail — zero risk).
SFX deferred (ENV-03).

**Sequencing decision — parallel, no idle time:**
- uiux: ONE final registry SYNC pass on DESIGN §10.6.11 so the 2 fixed trucks
  read ACCEPT and the authoritative id→file/native-size/fallback table matches
  the true final state. Fast confirmation, not re-curation. This is the source
  frontend consumes, so it must be authoritative before assets are WIRED.
- frontend M7.4: DISPATCH NOW — build the integration SCAFFOLD in parallel
  (asset-registry mechanism, base64 `data:` inlining, fallback-first render [I2]
  + audio plumbing [I3, buffers deferred/synth-fallback for now], single-file /
  zero-runtime-network [I4]), on feature/asset-regen off the freshly-merged main.
  WIRE the final approved asset set once uiux's registry sync lands. M7.7 chrome
  restyle impl lands with/after M7.4.
- Net: scaffold + registry sync run concurrently; frontend finalizes wiring on
  the synced registry. Then tester M7.5 regression.

### 7.15 Final authoritative registry — 30/34 (2026-07-24)

uiux's registry sync (independent multi-threshold connected-component re-verify)
finalized DESIGN §10.6.11: **30/34 generated assets ACCEPTED** (28 ACCEPT + 2
ACCEPT-WITH-NOTE), all 30 file paths verified on disk. `veh-s2-truck` correctly
flipped to REJECT — a genuine pale shadow-band defect under the wheels (2
components at alpha≥50; only merged at near-zero threshold), NOT a false
positive. **4 programmatic fallbacks total (zero product risk):** veh-s2-truck +
tile-s2-road + tile-s3-road + tile-s3-rail. This 30-asset set is the
authoritative input to frontend M7.4 wiring — veh-s2-truck must NOT be wired,
its existing programmatic draw renders. Frontend scaffold/wiring still running.

### 7.16 M7.5 PASS → proceed to M7.7 chrome restyle (2026-07-24)

Tester M7.5: **PASS** — 51/55 checks pass, 3 = test-harness artifacts (ISS-07
RESOLVED, proven NOT a regression via replay against pre-BUG-7 2d3e23a), 1 info.
0 Critical/Major/Minor PRODUCT defects. Zero-network independently re-verified;
all 30 wired assets render per stage; all 4 programmatic fallbacks render clean;
force-disable (corrupt registry mid-session) falls back with 0 errors; audio
fallback + mute intact (generated-SFX slot empty per ENV-03); ~120fps, negligible
load impact from the 593KB file.

**Now: M7.7 — chrome/HUD/particle restyle (SCOPE-04, the last coherence gap for
an Option-B ship).** Inputs to fold in: SCOPE-04 core (panels §1.3/1.4, in-game
text §1.6, HUD §7.2, particles §5 → harmonize with smooth illustrated art),
ISS-06 (smoothing-flag doc reconciliation — frontend's runtime split stands),
and the mute button's rounded corners (fix to match — or intentionally re-define
— the corner rule). Plus 3 low-priority TEST-harness fixes (hook score-sync =
frontend; buffer threshold + strip-query-before-reload = tester).
After M7.7 impl lands on feature/asset-regen → tester RE-RUNS the M7.5
regression to cover the restyled chrome → then PR (USER CONFIRM). Do NOT PR
before M7.7 + its re-test, unless the client requests an images-only interim.
