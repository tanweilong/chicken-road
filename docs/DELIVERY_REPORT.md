# Chicken Road — Delivery Report

**Prepared by:** Project Manager (AI software team)
**Release:** 2.0 — Visual Overhaul (Milestone M7: Asset Regeneration & Option-B Restyle)
**Status:** Prepared for ship — QA PASS. PR #3 open (`feature/asset-regen`); awaiting the client's explicit go-ahead to MERGE (outward-facing, per Hard Rule). One item finalizes at ship: the M7 resource tally (§10), pending the orchestrator's per-task token data.
**Date:** 2026-07-25
**Build:** single-file `index.html` (~0.58 MB, up from 65 KB — the increase is almost entirely the inlined AI-generated artwork), branch `feature/asset-regen`
**Live URL:** https://tanweilong.github.io/chicken-road/ *(GitHub Pages project page — reflects the new 2.0 build after the PR is merged)*

---

## 0. What changed in Release 2.0 (M7) — read this first

Release 1.0 shipped the complete, tested game with **all art hand-drawn in code** as
chunky pixel-art and **all sound synthesized** in the browser. Release 2.0 is a
**visual overhaul** driven by two client decisions during this cycle:

1. **AI-generated artwork.** At the client's direction, the game's visuals were
   regenerated as **AI-generated illustrations** (via Hugging Face image models),
   replacing the hand-drawn pixel sprites and tiles with a **smooth, clearly-readable
   illustrated look** ("Option B" — chosen by the client after seeing a side-by-side
   comparison of the original pixel style, a cleaner-retro option, and the fully
   illustrated option).
2. **Same single-file, still offline.** Every generated image is **baked directly into
   the one `index.html` file** (as inlined data), so the game remains a **single
   self-contained file that makes zero network calls while you play** — exactly as
   before. Nothing is fetched from the internet at runtime.

Alongside the art, this release also includes:
- A **gameplay fix** to river crossings (landing on logs/lily pads was too hard — now
  fair), reported by the client and already merged.
- A **UI/chrome restyle** so the score bar, panels, and particle effects harmonize with
  the new illustrated art instead of clashing with it.

**One deliberate deferral:** the client also asked for AI-generated **sound effects**.
One sample was approved, but the audio-generation service proved unreachable through a
safe (no-credential-handling) path in this cycle, so **generated SFX are deferred to a
fast-follow update**. The game keeps its existing, fully-working synthesized sound in
the meantime — so there is **no loss of audio**, the sounds simply haven't changed yet.
See §8 and §9.

---

## 1. Executive Summary

**Chicken Road** is a polished, arcade "cross the road" game that runs entirely in a web
browser — no installation, no account, no download. You guide a chicken forward through
a scrolling world of grass, roads, rivers, and railways, dodging cars and trains, riding
logs across water, and grabbing corn for bonus points — all while a camera that never
stops rising keeps the pressure on. Fall too far behind and an eagle swoops in to end the
run.

The game is built in the tradition of *Crossy Road* / *Frogger*, with three distinct
themed stages of escalating difficulty: a bright **Countryside** by day, a neon-lit
**City** at night, and a grimy, hazard-lit **Industrial Zone**. Clear all three and you
win. As of Release 2.0, the world is rendered in a **smooth, hand-illustrated art style**
(AI-generated, then baked into the single file), while the game still ships as **one HTML
file that loads nothing from the internet while you play**.

**Who it's for:** casual and arcade players on both desktop (keyboard) and mobile
(touch), and a portfolio/demo audience judging polish and "game feel."

---

## 2. Feature List (everything delivered, in player terms)

### Character & animation
- **Illustrated chicken** (Release 2.0) — the hero character is now a smooth,
  clearly-readable illustration, the same character across all three stages (only the
  world re-skins).
- **Idle animation** on the title screen and at rest — the chicken bobs so the game feels
  alive before you even start.
- **Squash-and-stretch hop** — the chicken squashes on take-off, stretches at the top of
  its arc, and squashes again on landing, so every hop reads as springy and tactile.
- **Two death animations** — a feather-burst when hit by a vehicle or train, and a
  shrinking splash-sink when it falls into water.
- **Eagle swoop** — a larger bird-of-prey dives in from the top, grabs the chicken, and
  carries it off-screen when you fall behind the camera.

### Movement & controls
- **One tap = one hop of exactly one tile** in any of four directions on a grid.
- **Instant, responsive control** with a small input buffer so rapid taps don't feel
  dropped.
- **Wall clamping** — the chicken can never hop out of the play column.
- **Obstacle blocking** — trees and rocks occupy tiles the chicken can't enter.
- **Score only counts forward progress** — hopping backward, left, or right never adds to
  or subtracts from your score.

### Lane types & hazards
- **Grass / safe ground** — no hazards, but may contain impassable trees and rocks.
- **Road** — cars, trucks, and buses move horizontally at varying speeds and directions,
  each with a glowing headlight. Touching one is fatal.
- **River** — open water is lethal; **logs float across** as moving platforms. Stand on a
  log and it carries you along — but ride it off the edge of the screen and you drown.
  *(Release 2.0 fixed a bug that made landing on logs/lily pads unfairly hard — see §6.)*
- **Railway** — a **telegraphed warning** (flashing signal light + bell) fires before a
  **fast train** rushes across the lane. Be off the track when it passes.

### The three stages (escalating difficulty)
- **Stage 1 — Countryside (Day):** bright, cheerful greens, rolling hills, gentle
  traffic, slow scroll, wide safe margins.
- **Stage 2 — City (Night):** cooler night palette, streetlights, a building skyline,
  faster and busier traffic including buses, medium scroll.
- **Stage 3 — Industrial Zone:** grimy browns and greys with red/amber hazard lighting,
  smokestacks, the densest and fastest traffic, the most frequent trains, no rivers,
  narrower safe lanes, and the fastest scroll.
- Each stage is cleared by reaching **row 30** of that stage.

### Scoring & corn
- **Score = furthest row reached** (carried forward across stages) plus a bonus for corn.
- **Corn pickups** spin on the lanes; collecting one adds bonus points, fires a sparkle
  burst, and pulses the corn counter in the HUD.
- **Session high score ("BEST")** is tracked and shown on the title and end screens, with
  a **"NEW BEST!"** badge when you beat it.

### Screens
- **Title screen** with the animated chicken, adaptive start prompt (both keyboard and
  tap), and your session best.
- **In-game HUD** showing score, corn count, current stage, and a mute button —
  **restyled in Release 2.0** to sit cleanly over the illustrated world.
- **Stage-clear screen** between stages showing score + corn.
- **Game-over screen** with a death-cause flavor line, final stats, and best.
- **Victory screen** after clearing Stage 3, with celebratory confetti.

### Audio (synthesized — unchanged this release)
- Distinct sound effects for **hopping, collecting corn, the train warning bell, death,
  water splash, obstacle bump, stage clear, and game over**, all generated live in the
  browser via the Web Audio API.
- **Mute toggle** — click/tap the speaker button in the HUD, or press **M**.
- Audio unlocks automatically on your first interaction (browser autoplay compliance).
- *(AI-generated SFX are a planned fast-follow — see §8/§9.)*

### Particles & "juice"
- **Dust puffs** on every hop, **feather burst** on impact death, **water splash** with an
  expanding ring on river death, **corn sparkle** on pickup — restyled in Release 2.0 to
  match the illustrated look (soft round dust/splash; crisp feathers/sparkle retained).
- **Screen shake** on hard-impact deaths and a **slow-motion white flash** on any death.
- **Ambient particles** per stage (city window flicker, industrial embers, victory
  confetti).

### Mobile support
- **Tap to hop forward, swipe in any direction to steer.**
- The play area **scales to fit any screen** (letterboxed as needed) and stays crisp, from
  small phones to large desktops — the same portrait play column everywhere.

---

## 3. Screen-by-Screen Walkthrough

*(The orchestrator surfaces the current Release-2.0 stage screenshots inline in chat —
`docs/reports/screenshots/m7.4-stage{1,2,3}-*.png` — as part of delivering this report.)*

- **Title screen:** the Countryside scene sits behind the interface; **CHICKEN ROAD** near
  the top, the idle-animated chicken as a hero element, and a blinking prompt showing both
  "PRESS SPACE TO START" and "TAP TO START". A gold **BEST: n** line appears once you've
  scored. Nothing plays sound until your first input — by design.
- **In-game HUD:** a slim top bar — **SCORE** (left), **STAGE n/3** badge (center), and
  **corn count + mute button** (right) — now restyled to read cleanly over the illustrated
  world.
- **Stage-clear screen:** reaching row 30 freezes the scene behind a scrim; a panel shows
  **STAGE n CLEAR!** with SCORE and CORN, then auto-advances.
- **Game-over screen:** the last frame freezes behind a red-tinted scrim; **GAME OVER**
  plus a one-line cause — **SQUASHED!**, **STRUCK BY TRAIN!**, **SWEPT AWAY!**, or
  **SNATCHED BY AN EAGLE!** — then SCORE, BEST, a NEW BEST! badge if earned, and a blinking
  restart prompt.
- **Victory screen:** after clearing Stage 3, **VICTORY!** in gold over a warm scrim with
  drifting confetti, final SCORE and BEST, and a "PLAY AGAIN" prompt.

---

## 4. User Flow

1. **Title** → press Space or tap to begin.
2. **Stage 1 (Countryside)** → hop forward across grass/road/river lanes, grabbing corn,
   until row 30.
3. **Stage-clear** → score + corn shown → auto-advances.
4. **Stage 2 (City)** → harder and faster → row 30 → stage-clear.
5. **Stage 3 (Industrial)** → hardest, train-heavy → row 30.
6. **Victory** → "PLAY AGAIN" restarts a fresh run from Stage 1.

At any point, a death (vehicle, water, train, or falling behind to the eagle) ends the run
→ **Game-over** → restart begins a **fresh single-life run at Stage 1 with score reset to
0** (no checkpoints, no extra lives). The session high score carries across restarts until
the tab is closed or reloaded.

---

## 5. Tech & Architecture (in brief, accessible terms)

- **One self-contained file.** The entire game — code, graphics, and sound — lives in a
  single `index.html`. There are **no network calls while you play**; nothing is fetched
  from the internet at runtime. QA re-verified this in Release 2.0 (only the initial file
  load, zero runtime requests).
- **How the artwork works now (Release 2.0).** The world's visuals are **AI-generated
  illustrations** (produced with a Hugging Face image model, then processed to cut out
  clean transparent edges) and **baked directly into the HTML file as inlined data** — so
  they load instantly with the file and never touch the network at play time. **30 of 34**
  planned assets are the new illustrations; **4** (one truck variant and three ground-tile
  textures) automatically **fall back to the original code-drawn versions** because the
  generated versions didn't meet the quality bar — a seamless, invisible-to-the-player
  safety net that guarantees nothing is ever missing or broken on screen.
- **Synthesized sound.** Every sound effect is still generated live in the browser via the
  Web Audio API (no audio files). The audio system was restructured so AI-generated sound
  samples can slot in later without further rework (the fast-follow in §9).
- **Clean class structure.** The code is organized into clear building blocks — `Player`,
  `Lane`, `Vehicle`, `Log`, `Train`, `Eagle`, `Particle`/`ParticleSystem`, `Camera`,
  `AudioManager`, `InputManager`, and a central `Game` controller — with a new asset
  registry layer added for Release 2.0 that tries the generated art first and falls back to
  code-drawn art if needed.
- **Smooth, frame-rate-independent motion.** A ~60fps loop uses **delta-time** movement, so
  everything moves at a consistent real-world speed at 60Hz or 120Hz. QA measured a
  sustained ~120fps with no performance cost from the larger file or the new effects.
- **Responsive by scaling.** The game renders at a fixed internal portrait resolution and
  scales-to-fit with letterboxing, keeping the presentation consistent across phones and
  desktops.

---

## 6. Quality & Testing

Release 2.0 was tested by the dedicated QA engineer using the same Playwright-driven
headless-Chromium harness as Release 1.0, against the shipped single file opened directly.

### The river-landing gameplay fix (client-reported)
The client reported that **landing on logs/lily pads was unfairly hard**. Root cause: the
"you're safely on the platform" check had **zero forgiveness margin** while the "you died"
check had a +12px margin — backwards, which mathematically guaranteed a miss at certain
positions (worst on the smaller lily pads). A secondary timing issue read the platform's
position one frame stale. Both were fixed, a new regression test passes, and the fix is
**already merged to the main line** (PR #2). Landing now feels fair without becoming
sticky or too easy.

### Release 2.0 QA result — PASS
- **Full acceptance-criteria regression (AC-1 … AC-14):** no regressions; the game passes
  everything it passed at Release 1.0, now with the new artwork.
- **New-artwork checks:** all 30 generated assets confirmed rendering correctly per stage;
  all 4 fallback assets confirmed rendering their clean code-drawn versions; a
  force-disable test (deliberately corrupting asset entries mid-game) confirmed the fallback
  path engages with **zero errors** — no broken or missing images possible.
- **UI restyle checks:** the restyled score bar, panels, mute button, and particles were
  verified pixel-level (via zoomed screenshots and forced-triggering every particle type) —
  clean, legible over the illustrated backgrounds, no clipping or overflow even with the
  longest death message.
- **Offline / single-file:** zero runtime network requests independently re-confirmed.
- **Performance:** ~120fps sustained; negligible load-time impact from the larger file.
- **Automated suites:** the full test runner reports **37/38 pass, 1 informational, 0
  fails**; three dedicated regression suites (river-fix, new-art integration, and the
  Release-1.0 fix suite) were **independently re-run and all pass** (4/4, 10/10, 17/17).
- **Verdict:** **PASS — 0 Critical/Major/Minor product defects.** The 3 non-passing
  automated checks were traced to the **test harness itself** (a debug URL shortcut, an
  input-buffer test threshold, and a reload-URL quirk), proven not to be product problems by
  replaying them against an earlier build; two were then fixed in the harness.

---

## 7. How to Access

- **Play online (after merge):** **https://tanweilong.github.io/chicken-road/** — the live
  page updates to the Release 2.0 build once the PR is merged.
- **Play locally:** open **`index.html`** in any modern browser (Chrome, Firefox, Safari,
  Edge) — no install, no server, no build step.
- **Source:** [PR #3](https://github.com/tanweilong/chicken-road/pull/3) on branch
  `feature/asset-regen` — open, pending the client's explicit merge go-ahead.

**Controls**
- **Desktop:** Arrow keys or **WASD** to hop; **Space** to start / restart; **M** to
  mute/unmute (or click the speaker button).
- **Mobile:** **tap** to hop forward, **swipe** to steer; tap the speaker button to mute.

---

## 8. Known Limitations (honest list)

- **AI-generated sound effects deferred to a fast-follow (ENV-03).** The client approved a
  generated SFX sample, but the proven audio-generation service could not be reached through
  a **safe path that avoids handling raw account credentials** (a boundary we deliberately
  did not cross), and the free/anonymous path was rate-limited. **Decision:** ship the new
  visuals now; keep the existing, fully-working synthesized sound; add generated SFX in a
  follow-up once an account-authenticated or alternative service path is available. **No
  audio is lost** — the sounds simply haven't changed this release.
- **4 of 34 world assets use the original code-drawn art (invisible to players).** One truck
  variant (a stray shadow artifact) and three ground-tile textures (didn't tile seamlessly)
  fall back to the Release-1.0 code-drawn versions. This is by design and looks clean — it's
  noted only for full transparency.
- **ISS-01 — Game feel not yet human-confirmed (the brief's #1 priority).** Timing values
  match the design in code, but "does it *feel* great" is a subjective judgment a script
  can't make. A human playtest is recommended. *Carried from Release 1.0; open
  (human-playtest only).*
- **ISS-02 / ISS-03 — Real-device audio and touch feel.** Audio wiring/mute and swipe/tap
  logic are verified under emulation; perceived loudness and real-finger swipe sensitivity
  need a physical device. *Carried from Release 1.0; open (human-playtest only).*
- **Session-only high score.** Your best is remembered only for the current browser session;
  reloading resets it. Cross-session saving was intentionally out of scope.
- **No music.** By design — sound effects only.

*No Critical or Major defect ships open. The only Major-tagged open item, ISS-01, is by
nature a human-judgment item and is surfaced here for a playtest, not a code defect.*

---

## 9. Roadmap / Next Steps

1. **AI-generated SFX (committed fast-follow).** Wire the generated sound effects in once
   the audio-generation service is reachable via an authenticated (non-credential-handling)
   path or a suitable alternative; the audio system is already structured to accept them.
2. **Game-feel tuning pass (highest priority for polish).** Human playtest against ISS-01;
   fine-tune hop timing, camera easing, and death punch.
3. **Persistent high score.** Add `localStorage` so a best survives reloads (small,
   self-contained).
4. **Real-device audio & touch tuning.** Close ISS-02/ISS-03 on real phones and speakers.
5. **More content.** Additional stages, lane layouts, vehicle/obstacle variety, or an
   optional endless mode past Stage 3.
6. **Optional revisit of the 4 fallback assets.** Regenerate the truck variant and the three
   ground tiles to the quality bar so they can join the illustrated set.

---

## 10. Resource Usage

Output-token consumption per task. **Release 1.0** figures are final; **Release 2.0 (M7)**
figures are to be completed from the orchestrator's per-task usage data at ship (see the
note under the table).

### Release 1.0 (original delivery)
| Task | Agent | Model | Tokens |
|------|-------|-------|--------|
| Requirements & Plan (PRD/PLAN) | pm | Opus 4.8 | 24,870 |
| Art direction + style-guide | uiux | Sonnet 5 | 150,108 |
| Game build — single-file index.html | frontend | Opus 4.8 | 167,860 |
| QA test pass — Stage 4 Cycle 1 (55 cases, 5 defects) | tester | Sonnet 5 | 154,540 |
| Fix cycle — BUG-1..5 (Stage 4 Cycle 2) | frontend | Sonnet 5 | 99,303 |
| QA re-verify — Stage 4 Cycle 2 (47 cases) | tester | Sonnet 5 | 94,544 |
| Delivery report (Stage 5) | pm | Opus 4.8 | 76,103 |

### Release 2.0 (M7 — asset regeneration & Option-B restyle)
| Task | Agent | Model | Tokens |
|------|-------|-------|--------|
| M7 scoping + PRD/PLAN amendments (SCOPE-02/03/04, ENV-01/02/03) | pm | Opus 4.8 | *pending* |
| Asset manifest + prompts + curation (A1–A5) | uiux | Sonnet 5 | *pending* |
| Style reconciliation (M7.1b, Option A/B proposal) | uiux | Sonnet 5 | *pending* |
| Chrome/HUD/particle restyle design (M7.7) | uiux | Sonnet 5 | *pending* |
| Asset generation + post-process (validation batch + full run) | orchestrator | Opus 4.8 | *pending* |
| BUG-7 river-landing fix | frontend | Sonnet 5 | *pending* |
| M7.4 asset integration + M7.7 chrome impl | frontend | Sonnet 5 | *pending* |
| M7.5 + post-M7.7 regression QA | tester | Sonnet 5 | *pending* |

> **Resource-accounting note:** per-task Release 2.0 token counts are pending the
> orchestrator appending the M7 rows to `docs/reports/USAGE.md` from each task's completion
> data. Once populated, the per-model subtotals and grand total below are recomputed to
> include both releases.

**Release 1.0 per-model subtotals:** Opus 4.8 = 268,833 · Sonnet 5 = 498,495 ·
**R1.0 total ≈ 767,328** (output-token counts; relative effort, not billing-exact).
**Combined R1.0 + R2.0 total:** *to be finalized once M7 rows are populated.*

---

*End of Delivery Report — Release 2.0 draft, prepared for ship pending the client's PR
go-ahead and the M7 resource tally.*
