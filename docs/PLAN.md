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
