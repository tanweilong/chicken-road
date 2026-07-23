# PRD — Chicken Road (working title)

Status: DRAFT for approval (Stage 1)
Owner: pm
Type: Single-file browser arcade game (HTML5 Canvas + vanilla JS, no backend, no external assets)

---

## 1. Problem / Concept

A polished, self-contained "chicken crosses the road" arcade game in the Crossy
Road tradition. The player hops a pixel-art chicken forward through endlessly
scrolling lanes — grass, roads, rivers, railways — dodging vehicles, riding
logs, and outrunning a rising camera (and an eagle) while collecting corn for
bonus points. The entire game ships as ONE `.html` file with all art drawn
programmatically and all sound synthesized via the Web Audio API.

The bar is not "functional" — it is **game feel**. Hops must feel instant and
satisfying, with squash-and-stretch, dust puffs, screen shake, and juicy audio.

## 2. Target Feel (the north star)

- **Instant, tactile hops** — input registers immediately; the visible squash/
  stretch and dust puff sell the motion without delaying control.
- **Readable danger** — the player can always tell what will kill them (cars,
  water, trains) a beat before it does. Telegraphed hazards (train warning
  lights/bell) are mandatory.
- **Retro-arcade juice** — chunky pixel art, punchy chiptune-ish SFX, screen
  shake and a brief slow-motion flash on death.
- **Escalating tension** — the camera never stops rising; falling behind means
  the eagle.

## 3. Target Users

- Casual/arcade players on desktop (keyboard) and mobile (touch/swipe).
- Portfolio/demo audience judging polish and game feel.

## 4. Platforms & Responsive Strategy

- **Single HTML file**, runs by opening in any modern evergreen browser
  (Chrome, Firefox, Safari, Edge) — desktop and mobile.
- **Rendering model:** fixed *virtual/logical* resolution canvas
  (portrait-oriented play column) scaled to fit the viewport with
  `devicePixelRatio` awareness for crisp pixels; letterboxed on mismatched
  aspect ratios. This keeps gameplay identical across screen sizes (no layout
  reflow of the play field).
- **Responsive strategy: mobile-first play column.** The core play area is a
  tall portrait column that scales down on small phones and up (letterboxed,
  centered) on wide desktops. Pixel art uses integer-friendly scaling to avoid
  blur.
- **Target breakpoints (scale-to-fit, not layout reflow):**
  - Small phone: ~360×640 logical viewport
  - Large phone / small tablet: ~414×896
  - Desktop: canvas centered, capped play-column width with letterbox sides.
- **Input:** keyboard (Arrows + WASD) on desktop; tap-to-hop-forward and
  4-direction swipe on touch. Both always available; no device sniffing gates.

## 5. Technical Constraints (from brief — non-negotiable)

- ONE HTML file. No external images, fonts, audio files, or network calls.
- HTML5 Canvas 2D + vanilla JS only. No frameworks, no build step.
- All sprites/art drawn programmatically (pixel art via canvas primitives).
- All SFX synthesized via Web Audio API.
- 60fps game loop using `requestAnimationFrame` with **delta-time** movement so
  behavior is frame-rate independent.
- Code structured with classes: `Player`, `Lane`, `Vehicle`, `Log`, `Train`,
  `Particle`/particle system, `Camera` (plus supporting managers e.g. game
  state, audio, input, renderer).
- No backend, no API, no database. High score persists in a JS variable for the
  session only.

## 6. Art / Sprite Requirements (informs uiux)

- Chicken: 16×16 pixel sprite, rendered at 3× scale. Animation sets:
  - **Idle** — head bob / peck, 4 frames.
  - **Hop** — squash-and-stretch across a one-tile move, wings flapping mid-hop.
  - **Death (impact)** — feather-burst.
  - **Death (water)** — splash.
- Vehicles: pixel-art cars, trucks, buses per stage, with headlight glow.
- River objects: logs and lily pads (moving platforms).
- Train: multi-car fast train + warning light + bell telegraph.
- Pickups: corn with a spinning animation and sparkle.
- Environment: grass tiles (trees, rocks as obstacles), road tiles (lane
  markings), river tiles (water shimmer), railway tiles (tracks, signals),
  per-stage parallax background details.
- Eagle: swoop-in grab animation for the fall-behind fail state.

## 7. Gameplay Specification

### 7.1 Movement
- Grid-based. One input = one hop of exactly one tile: up (forward), down
  (back), left, right.
- Forward hops increase the row counter; the furthest row reached is the score
  basis. Backward hops do not reduce score but do not award it either.
- Movement is delta-time animated (a hop tween), but control feel is instant:
  the next input is accepted as soon as the current hop resolves (with a small
  input buffer so rapid taps feel responsive).
- Boundaries: the chicken cannot hop outside the horizontal play column.

### 7.2 Camera & fall-behind (eagle)
- Camera scrolls upward smoothly and continuously with easing, plus slight
  **lookahead** in the direction of movement.
- Camera scroll speed increases per stage.
- If the chicken falls below the bottom edge of the visible camera window, the
  **eagle swoops in, grabs the chicken (animated), and it is game over**.

### 7.3 Lane types
- **Grass** — safe. May contain trees/rocks as impassable obstacles (chicken
  cannot hop into an occupied tile).
- **Road** — cars/trucks/buses moving horizontally at varying speeds and
  directions. Collision with a vehicle = death (impact/feather-burst).
- **River** — water is lethal. Logs and lily pads move horizontally; the chicken
  must ride them. Standing on a log carries the chicken with it; being carried
  off the play column edge = death. Landing on water (a tile with no log/pad) =
  splash death.
- **Railway** — telegraphed: warning light + bell for a short window, then a
  fast train rushes across the lane. Being on the track when the train passes =
  death.

### 7.4 Scoring
- **Score = furthest row reached.**
- **Corn pickups** appear on lanes; collecting one adds bonus points and a
  sparkle + SFX. Corn spins (animated).
- HUD shows current score, corn collected, and current stage.
- Session **high score** kept in a JS variable; shown on title/game-over.

### 7.5 Stages (3, increasing difficulty)
Each stage spans rows until **row 30 (per stage)** is reached, which triggers a
**stage-clear screen** showing score + corn collected before advancing. After
Stage 3 clears, a **victory screen** is shown.

| # | Stage | Palette / mood | Traffic | River | Rail | Scroll |
|---|-------|----------------|---------|-------|------|--------|
| 1 | Countryside | Bright day greens | Slow cars, wide gaps | Occasional, slow logs | Rare | Slow |
| 2 | City | Night palette, streetlights | Faster traffic, buses/trucks | Quicker logs | Occasional | Medium |
| 3 | Industrial Zone | Grimy, hazard lights everywhere | Fast, dense | — | Frequent trains, narrow safe lanes | Fast |

Each stage has a distinct palette and parallax background detail.

### 7.6 Fail / restart
- Death causes: vehicle impact, water/river fall, train, eagle (fall behind).
- On death: feather-burst or splash animation + screen shake + brief slow-motion
  flash + death SFX (cluck), then **Game Over screen** with final score, corn,
  high score, and a restart control.
- Restart returns to a fresh run (Stage 1) — single life, no checkpoints.

## 8. Polish / Juice Requirements

- Title screen: animated idle chicken + "Press Space to Start" (and a tap
  prompt on touch).
- Camera easing + lookahead on movement.
- Particles: dust puff per hop, feather burst on impact death, water splash on
  river death, corn sparkle on pickup.
- Screen shake + slow-motion flash on getting hit.
- Web Audio SFX (all synthesized): hop, corn pickup, car horn, train bell,
  death cluck. A **mute toggle** is provided.
- 60fps delta-time loop.
- Mobile touch/swipe support.

## 9. Acceptance Criteria (Given / When / Then — tester executes literally)

> Note: "logical pixels" refers to the virtual canvas resolution. Timings that
> can't be frame-exact should be verified as "clearly perceptible / within ~1s".

### AC-1 Boot & title
- **Given** the HTML file is opened in a browser, **When** it loads, **Then** a
  title screen appears with an animated (idle-bobbing) chicken and a visible
  "Press Space to Start" prompt, with no console errors.
- **Given** the title screen on desktop, **When** the player presses Space,
  **Then** the game starts (Stage 1, chicken on the starting grass row).
- **Given** the title screen on touch, **When** the player taps the screen,
  **Then** the game starts.

### AC-2 Hop movement & feel
- **Given** an active game, **When** the player presses Up / W (or swipes up),
  **Then** the chicken hops exactly one tile forward and the row/score counter
  increases by 1 on reaching a new furthest row.
- **Given** an active game, **When** the player presses Down/Left/Right (or
  swipes that direction), **Then** the chicken hops exactly one tile in that
  direction; Left/Right/Down never increase the score.
- **Given** a hop is triggered, **When** it animates, **Then** a visible
  squash-and-stretch and a dust-puff particle appear, and a hop SFX plays.
- **Given** the chicken is at the left/right edge of the play column, **When**
  the player hops toward the wall, **Then** the chicken does not leave the play
  column (input ignored or blocked).
- **Given** a tile is occupied by a tree/rock obstacle, **When** the player hops
  toward it, **Then** the chicken does not enter that tile.
- **Given** rapid successive inputs, **When** the player taps a direction
  multiple times quickly, **Then** hops feel responsive (buffered) and do not
  drop below the intended count in a way that feels laggy.

### AC-3 Grass lane
- **Given** the chicken is on a grass lane with no obstacle, **When** it stands
  or hops there, **Then** it is safe (no death).

### AC-4 Road lane
- **Given** the chicken is on a road lane, **When** a car/truck/bus occupies the
  chicken's tile, **Then** the chicken dies with a feather-burst animation,
  screen shake, slow-motion flash, and death SFX.
- **Given** vehicles on a road lane, **When** observed, **Then** they move
  horizontally at varying speeds/directions and have a visible headlight glow.

### AC-5 River lane
- **Given** the chicken is on a river lane, **When** it lands on a water tile
  with no log/lily pad, **Then** it dies with a splash animation + splash SFX/
  particles.
- **Given** the chicken is standing on a moving log/lily pad, **When** the log
  moves, **Then** the chicken is carried along with it.
- **Given** the chicken is riding a log, **When** the log carries it past the
  play-column edge, **Then** the chicken dies (carried off screen).

### AC-6 Railway lane
- **Given** a railway lane is about to activate, **When** the train approaches,
  **Then** a warning light + bell (visual + audio) telegraph fires before the
  train arrives.
- **Given** the warning has fired, **When** the train rushes across, **Then** it
  moves noticeably faster than road vehicles, and a chicken on the track dies.
- **Given** the chicken is NOT on the track when the train passes, **Then** it
  survives.

### AC-7 Camera push & eagle
- **Given** an active game, **When** time passes without forward progress,
  **Then** the camera continues scrolling upward smoothly (with easing).
- **Given** the chicken falls below the visible camera window, **When** it goes
  off the bottom, **Then** an eagle swoops in (animated), grabs the chicken, and
  the game ends (Game Over).
- **Given** the player is moving, **When** hops happen, **Then** the camera shows
  a slight lookahead in the movement direction.

### AC-8 Corn pickups & scoring
- **Given** a corn pickup on a lane, **When** observed, **Then** it visibly
  spins/animates.
- **Given** the chicken enters a corn tile, **When** collected, **Then** bonus
  points are added, a sparkle particle + corn SFX fire, and the corn count in
  the HUD increments.
- **Given** any active game, **When** playing, **Then** the HUD shows current
  score (furthest row), corn collected, and current stage.

### AC-9 Stages & stage-clear
- **Given** Stage 1, **When** the chicken reaches row 30 of the stage, **Then** a
  stage-clear screen shows the score + corn collected, then advances to Stage 2.
- **Given** each stage, **When** playing, **Then** it has a visibly distinct
  palette and parallax background (Countryside day / City night with
  streetlights / Industrial with hazard lights).
- **Given** later stages, **When** compared to Stage 1, **Then** difficulty is
  higher (faster traffic/scroll, more trains, narrower safe lanes per the stage
  table).
- **Given** Stage 3 is cleared, **When** row 30 is reached, **Then** a victory
  screen is shown.

### AC-10 Death, game over & restart
- **Given** any death cause (car, water, train, eagle), **When** it occurs,
  **Then** the appropriate death animation + screen shake + slow-motion flash +
  death SFX play, followed by a Game Over screen showing final score, corn, and
  session high score.
- **Given** the Game Over screen, **When** the player triggers restart (key/tap),
  **Then** a fresh run starts at Stage 1 with score reset to 0.
- **Given** a session with a prior best, **When** a new game ends with a lower
  score, **Then** the displayed high score is unchanged; **When** it ends with a
  higher score, **Then** the high score updates.

### AC-11 Audio
- **Given** the game, **When** the player performs actions (hop, corn, near a
  car horn, train bell, death), **Then** the corresponding synthesized SFX play
  via Web Audio (no external files, no 404s).
- **Given** browser autoplay restrictions, **When** the first user input occurs,
  **Then** the audio context resumes and SFX are audible thereafter.
- **Given** a mute control, **When** toggled, **Then** all SFX mute/unmute.

### AC-12 Performance & delta-time
- **Given** the game running on a 60Hz display, **When** playing, **Then** it
  targets ~60fps with no persistent stutter under normal play.
- **Given** frame-rate variation (e.g. a throttled/120Hz display), **When**
  playing, **Then** gameplay speed (scroll, vehicles, hops) is consistent
  because movement is delta-time based, not per-frame constant.

### AC-13 Mobile / touch
- **Given** a touch device, **When** the player swipes up/down/left/right,
  **Then** the chicken hops in that direction; **When** the player taps, **Then**
  the chicken hops forward.
- **Given** a phone-sized viewport, **When** the game loads, **Then** the play
  column scales to fit (letterboxed if needed) and remains playable and crisp.

### AC-14 Code structure (static review)
- **Given** the single HTML file, **When** reviewed, **Then** it defines the
  classes `Player`, `Lane`, `Vehicle`, `Log`, `Train`, a particle system, and
  `Camera` (plus supporting managers), and contains no external asset references.

## 10. Out of Scope (v1)

- Backend, accounts, online leaderboards, or cross-session persistence
  (high score is session-only per brief).
- localStorage/cookies persistence (not required; session JS variable only).
- Multiplayer / character selection / unlockable skins.
- Music soundtrack (SFX only).
- Settings menu beyond a mute toggle (no volume slider, no key rebinding).
- Additional stages beyond the 3 specified, difficulty options, or endless mode
  past Stage 3 (victory screen ends the run).
- Gamepad support, internationalization, accessibility audit beyond basic
  readability/contrast in the design.
- Build tooling, bundlers, TypeScript, or automated unit-test frameworks (QA is
  a manual test plan against these acceptance criteria).

## 11. Success Metrics

- All AC-1 … AC-14 pass in tester's manual plan on at least one desktop and one
  mobile (or emulated touch) browser.
- Subjective game-feel bar met: hops feel instant + juicy; deaths feel punchy;
  three stages read as visually distinct.
- Stable ~60fps in normal play; no console errors; no external network requests.

## 12. Open Decisions / Defaults (confirm at approval gate)

1. **Stage/score model:** score = cumulative furthest row across all stages;
   each stage clears at 30 rows of that stage. *Default: cumulative rows.*
2. **Lives:** single life; death restarts at Stage 1. *Default: single life.*
3. **Persistence:** session JS variable only (no localStorage). *Default per
   brief.*
4. **Audio start:** context unlocked on first input; mute toggle available.
   *Default: unlock-on-input + mute button.*
5. **Rendering:** fixed virtual portrait resolution, scale-to-fit + letterbox.
   *Default as described in §4.*
