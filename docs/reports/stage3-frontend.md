# Stage 3 — Frontend Build Report (Chicken Road)

Owner: frontend
Branch: `feature/chicken-road`
Deliverable: single self-contained `index.html` at project root (HTML5 Canvas + vanilla JS, no external assets/libraries/network).

## Build Checklist — FINAL

- [x] 1. Scaffold: canvas + DPR scale-to-fit + letterbox, delta-time RAF loop, state machine, input (keys+touch), Web Audio, bitmap font
- [x] 2. Player + chicken pixel-art, idle(4-frame bob/peck)/hop(squash-stretch+wing-flap)/feather-death/splash-death, hop feel + input buffer, dust particles
- [x] 3. Lane class + weighted generation, 3-stage palettes + parallax, grass tree/rock obstacles, eased camera push + lookahead, Eagle fall-behind
- [x] 4. Vehicle (headlight glow) / Log + lily pad (ride/splash/carry-off-edge) / Train (warning light + bell telegraph, fast pass), per-lane collision/death
- [x] 5. Particles (dust/feathers/splash/sparkle) + screen shake + slow-mo timescale + white flash
- [x] 6. 3 stages distinct palettes + parallax + escalating difficulty + stage-clear@row30 + auto-advance + victory
- [x] 7. Animated title, HUD (score/stage/corn+pulse), game-over + restart, session high score, tappable mute toggle, all SFX wired
- [x] 8. Verify headless (load + functional smoke test + live per-stage run), report

## How to run

Open `index.html` in any modern browser (double-click, or serve statically). No build step, no server required.
- Desktop: Arrow keys or WASD to hop; Space/Enter to start & restart; `M` to mute; click the speaker icon to mute.
- Mobile: tap = hop forward; swipe up/down/left/right = directional hop; tap the speaker to mute.
- Dev/QA aid (harmless URL params, safe to ship): `index.html?autostart=1&stage=0..2&hops=N` starts mid-field;
  `&screen=clear|victory|over` forces an overlay for visual review.

## Verification performed (automated)

- Headless Chrome load on every chunk: no console errors, canvas renders.
- Static AC-14 scan: classes Player, Lane, Vehicle, Log, Train, Particle, ParticleSystem, Camera, Eagle,
  AudioManager, InputManager, Game all present; zero external asset / network references.
- Functional smoke test (drives real game logic in a headless copy): 16/16 PASS — start->PLAYING, hop scoring,
  corn collect, killPlayer->DYING + feather particles, gameOver + high-score update, restart reset, mute toggle,
  final-stage->VICTORY, train wiring.
- Live per-stage playthrough (~4s real RAF each, stages 1/2/3): no runtime errors.
- Screenshots reviewed: title, stage 1 (countryside), stage 2 (city night, headlight glow, canal+logs),
  stage 3 (industrial hazard), stage-clear, game-over, victory — all match DESIGN.md.

## ISSUES / notes for tester (real-browser QA required)

Severity legend: [minor] cosmetic/tuning, [info] by-design, [qa] needs human playtest.

1. [qa] Game FEEL is the #1 priority per brief and CANNOT be validated headlessly. A human must playtest:
   hop crispness/timing (140-160ms), input-buffer responsiveness on rapid taps, camera push tension,
   squash-stretch + dust read, screen-shake/slow-mo punch on death. Tune values live if needed
   (HOP_DUR, HOP_LIFT, camera easing constant `7`, `scroll` per stage).
2. [qa] AUDIO is unlocked on first user input (browser autoplay policy). Headless can't verify audibility —
   tester must confirm on desktop + mobile that hop/corn/horn/bell/death/clear/gameover SFX play and that
   the mute toggle silences everything (AC-11).
3. [qa] TOUCH/SWIPE (AC-13): pointer events are wired (tap=forward, 4-dir swipe, mute hit-test) but must be
   verified on a real touch device / emulator — swipe threshold is 24px, may need tuning per device.
4. [info] Headless screenshots letterbox/crop when the OS window is smaller than the 336x576 virtual canvas;
   this is a screenshot artifact, NOT a layout bug. In-browser the play column is flex-centered and scales
   to fit with crisp `image-rendering: pixelated`. Verify centering/crispness on real phone + desktop widths.
5. [info] Scoring model = cumulative furthest rows across stages + corn x3 bonus (PRD §12 default). Each stage
   clears at 30 rows; final score after victory includes all 90 rows + corn.
6. [info] High score is a session JS variable only (no localStorage), per PRD §10 — resets on page reload.
7. [minor] River exists only in stages 1-2 (stage 3 has no river per PRD stage table); stage 3 emphasises
   frequent trains instead. Confirm rail frequency feels "highest" in stage 3.
8. [minor] Train bell fires per warning blink; if a stage generates many rail lanes close together the bells
   can overlap. Not a defect, but note for audio-density feel.
9. [info] The `?autostart/&screen` dev params are intentionally shipped as a QA convenience and are inert
   unless explicitly present in the URL. Remove before public release if undesired.

## Handoff

Feature branch `feature/chicken-road` (NOT pushed). Logical commits: scaffold -> chunks 2-7 -> this report.
Tester: execute the AC-1...AC-14 manual plan on one desktop (keyboard) and one mobile/emulated-touch browser.
