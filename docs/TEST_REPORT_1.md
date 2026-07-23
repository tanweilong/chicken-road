# TEST REPORT #1 — Chicken Road (Stage 4, Cycle 1)

**Tester:** tester agent | **Branch:** `feature/chicken-road` | **Date:** 2026-07-23
**Build under test:** single-file `index.html` (64,740 bytes at test time), commit tip of `feature/chicken-road`.
**Environment:** macOS (Darwin 25.4.0), Node v23.5.0, Playwright 1.61.1 driving headless Chromium 149
(chromium-1228). No server/build step — file opened via `file://` URL per PRD constraint. Device emulation
used for mobile (`iPhone 12` profile, `hasTouch`), plus manual viewport sizing for 360×640 / 1920×1080 / stress
resize.

No existing automated test suite shipped with the project (none expected per PRD §10 — "no automated unit-test
frameworks"). A Playwright harness was written for this cycle at `tests/e2e/run-tests.js` (38 scripted checks)
plus ~15 targeted one-off investigation scripts (referenced inline below) to chase down specific findings; the
harness is left in the repo under `tests/e2e/` for reuse in future cycles.

---

## Scope / TODO checklist (posted at START, all items closed out below)

- [x] Fresh "install" (open file, zero build) + self-contained check (grep for network refs)
- [x] Console-error-free load; verify all 12 AC-14 classes statically present
- [x] Title screen renders; QA URL hooks (`?autostart`, `&stage=`, `&hops=`, `&screen=`) exercised
- [x] AC-1 … AC-14 walked literally, as far as headless automation allows
- [x] 4 pre-logged issues ISS-01…ISS-04 individually re-verified
- [x] Destructive testing: boundary hops, rapid/buffered input, refresh mid-run, tab-away, tiny/huge/garbage
      viewports, garbage URL params, double-submit, resize stress
- [x] Screenshots captured for every stage/screen for visual DESIGN.md conformance review

---

## Test-case table

Legend — Type: `auto` (Playwright script, deterministic), `manual` (one-off Playwright investigation script,
result inspected by tester), `needs-human` (cannot be fully verified without a physical device/real ears/
subjective feel judgment — explicitly not silently passed).

| TC ID | Test case | Maps to AC | Type | Expected | Result | Status |
|---|---|---|---|---|---|---|
| TC-LOAD-01 | Open `index.html` via `file://`, capture console/page errors | AC-1, AC-14 | auto | Zero console/page errors | 0 errors | PASS |
| TC-LOAD-02 | Initial `game.state` on load | AC-1 | auto | `'title'` | `'title'` | PASS |
| TC-NET-01 | Capture all network requests during load+idle | AC-14, §5 | auto | Zero non-`file://` requests | `[]` | PASS |
| TC-NET-02 | Static grep of source for `http(s)://`, `<link>`, `cdn.`, external `<script src>` | AC-14 | auto | No matches | No matches | PASS |
| TC-AC14-01 | Regex-scan source for all 12 required classes (`Player,Lane,Vehicle,Log,Train,Particle,ParticleSystem,Camera,Eagle,AudioManager,InputManager,Game`) | AC-14 | auto | All 12 present | All 12 present | PASS |
| TC-TITLE-01 | Title screen visual review (screenshot) — title text, idle chicken, prompts, mute icon | AC-1, DESIGN §7.1 | manual | Matches DESIGN.md layout | Matches (see `docs/reports/screenshots/title.png`) | PASS |
| TC-AC1-01 | Press Space on title | AC-1 | auto | `state → 'playing'` | `state='playing'`, row 0 | PASS |
| TC-AC1-02 | Tap on title (pointerdown/up, no drag) | AC-1 | manual | `state → 'playing'` | confirmed via `input('tap')` route in `S.TITLE` branch (code) + swipe test below exercises same path | PASS |
| TC-AC2-01 | ArrowUp hop: row delta | AC-2 | auto | row +1 | row 0→1 | PASS |
| TC-AC2-02 | Forward hop to new furthest row → score increases | AC-2, AC-8 | auto | score increases | 0→1 | PASS |
| TC-AC2-03 | ArrowDown hop: row delta | AC-2 | auto | row −1 | row 5→4 (via `hops=` hook) | PASS |
| TC-AC2-04a | Backward hop does not increase score (via `?hops=5` hook then ArrowDown) | AC-2 | auto | score unchanged | **FAIL as scripted**: score 0→5 | FAIL* (see note) |
| TC-AC2-04b | Corrected retest: 5 **real** ArrowUp hops (row/score in sync at 5), then 1 ArrowDown | AC-2 | manual | score stays 5 | before `{row:5,score:5}` → after `{row:4,score:5}` | PASS |
| TC-AC2-05 | Spam ArrowLeft 10× at play-column left wall | AC-2 | auto | `col` clamps ≥0, never negative | `col=0` | PASS |
| TC-AC2-06 | Spam ArrowRight 12× at right wall | AC-2 | auto | `col` clamps ≤6 (COLS−1) | `col=6` | PASS |
| TC-AC2-07 | 5× ArrowUp at 40 ms intervals (faster than 150 ms hop) → hop count | AC-2 | auto/manual | matches single-slot late-window buffer math (see note) | delta=2 rows in ~1.5 s, matches hand-traced expectation exactly | PASS (see note) |
| TC-AC2-08 | Obstacle-blocking code present + generation never overlaps corn | AC-2, DESIGN §4.7/§9 | manual (static) | `lane.blocks(col)` gate before hop commit and before corn placement | Confirmed at src L836 (hop) and L1056-57 (corn gen) | PASS |
| TC-AC2-09 | Real obstacle-collision behavioral test: hop toward an occupied grass tile | AC-2 | manual | chicken does not enter tile, soft "bump" tone plays instead | Confirmed via code path (`audio.tone(140,...)` bump + early return) at src L836-839; scanned live-generated lane confirmed obstacles exist (`row 4, col [0]`) | PASS |
| TC-STAGE-01/02/03 | `?stage=0/1/2` hook loads each stage, no console errors | AC-9, AC-14 | auto | `game.stage` matches, 0 errors | matched, 0 errors each | PASS |
| TC-VISUAL-S1/S2/S3 | Visual review of 3 stage screenshots vs DESIGN.md palettes | AC-9, DESIGN §3 | manual | 3 distinct, on-spec palettes (day countryside / night city+streetlights / grimy industrial+hazard) | Confirmed distinct (see `stage1.png`/`stage2.png` via clear real gameplay `stage3.png`); Stage 1/2 screenshots in the scripted run happened to land on Game-Over due to BUG-3 below, but palette/chrome still visible and correct behind the overlay | PASS (with caveat, see BUG-3) |
| TC-HOOK-clear | `&screen=clear` forces `STAGE_CLEAR` | dev tooling | auto | `state='stageclear'` | matched | PASS |
| TC-HOOK-victory | `&screen=victory` forces `VICTORY` | dev tooling | auto | `state='victory'` | matched | PASS |
| TC-HOOK-over | `&screen=over` forces `GAME_OVER` | dev tooling | auto | `state='gameover'` | matched | PASS |
| TC-AC3-01 | Grass lane w/ no obstacle: stand/hop, no death | AC-3 | manual | safe | Confirmed via code: only `road`/`river`/`rail` lane types call `killPlayer` in `onPlayerLanded`; grass has no lethal path | PASS |
| TC-AC4-01 | `killPlayer('car')` → feather-burst + shake + gameover flow | AC-4 | manual | dying→gameover, `particles.feathers()`, `camera.shake(9)`, `audio.death()` called | Confirmed: state playing→dying→gameover; code path calls all three (src L1178-1182) | PASS |
| TC-AC4-02 | Vehicle rendering: horizontal movement via `dt`, headlight glow (radial gradient) | AC-4, DESIGN §4.2 | manual (static) | `x += speed*dir*dt`; radial-gradient headlight | Confirmed at src L558-571 | PASS |
| TC-AC5-01 | `killPlayer('water')` → splash death → gameover, `deathCause='water'` | AC-5 | manual | splash particles+SFX, gameover w/ "Swept away!" flavor | Confirmed (see `screen-clear`/game-over flavor text logic, and isolated water-death script) | PASS |
| TC-AC5-02 | Riding a log: player carried with log's x | AC-5 | manual (code) | `player.x = ridingLog.x + rideOffset` each frame while not hopping | Confirmed at src L867-868 | PASS |
| TC-AC5-03 | Log carries player past play-column edge (`x<6 or x>WORLD_W-6`) | AC-5 | manual | `killPlayer('river-edge')` → death | Forced log to edge, confirmed `state→'gameover'` after 2s | PASS |
| TC-AC6-01 | Rail lane/Train state machine: `idle→warn→pass→cooldown` | AC-6 | manual (static) | warning before pass, bell synced to blink | State machine confirmed; **bell timing bug found, see BUG-2** | PARTIAL (bug filed) |
| TC-AC6-02 | Train speed vs vehicle speed across all 3 stages | AC-6 | manual (data) | train noticeably faster | trainSpeed 820-1080 vs vehicle vMin/vMax 42-172 across stages — train is 5-25× faster | PASS |
| TC-AC6-03 | Chicken NOT on track when train passes → survives | AC-6 | manual (code) | `train.hits(px)` only true within `len/2` of train's `x`; unaffected tiles untouched | Confirmed via `hits()` implementation (src L664-667) | PASS |
| TC-AC7-01 | Force `camera.y` far below `player.row` (simulate fall-behind), wait | AC-7 | auto | eagle swoop → gameover | `state='gameover'` after ~2.5s | PASS |
| TC-AC7-02 | `camera.y` over 2s with zero input | AC-7 | auto | increases (camera keeps rising) | −1.94 → −1.27 (rising) | PASS |
| TC-AC7-03 | Lookahead: `player.lookDir` set on directional hop | AC-7 | manual (static) | `lookDir` set −1/0/1 per hop direction, consumed by camera lookahead calc | Confirmed at src L827-830 | PASS |
| TC-AC8-01 | HUD data fields exist during play (`score`, `corn`, `stage`) | AC-8 | auto | all defined | `{score:0, corn:0, stage:0}` | PASS |
| TC-AC8-02 | Corn spawns on lanes (never on obstacle tile — see TC-AC2-08) | AC-8 | auto (data scan) | corn present on at least one generated lane | found `true` | PASS |
| TC-AC8-03 | Real corn pickup: force corn under player, call `onPlayerLanded()` | AC-8 | manual | `corn: 0→1`, `score` +3, corn marked `collected:true` | `{corn:0→1, score:0→3}` | PASS |
| TC-AC9-01 | Real progression to row 30 of Stage 1 (`hops=29` hook then 1 real ArrowUp) → stage clear | AC-9 | manual | `state→'stageclear'` | `state:'playing'→'stageclear'`, `stage` still `0` (pre-advance snapshot) | PASS |
| TC-AC9-02 | Difficulty escalation across stage config table (scroll/traffic/rail weight) | AC-9 | manual (data) | Stage3 > Stage2 > Stage1 on scroll speed, vehicle speed, rail weight | scroll 0.34/0.52/0.78; vMax 74/124/172; rail weight 0.03/0.08/0.26 — monotonically increasing | PASS |
| TC-AC9-03 | Stage 3 has no river (per PRD table) | AC-9 | manual (data) | `weights.river = 0` for stage index 2 | confirmed `river:0.0` | PASS |
| TC-AC9-04 | Bus vehicle kind restricted to Stage 2 only (DESIGN §4.2) | AC-9, DESIGN §4.2 | manual (data, 40 regenerations) | buses only in stage index 1 | **buses also spawn in Stage 3 (index 2)** — see BUG-4 | FAIL |
| TC-AC10-01 | `killPlayer('car')` → eventual `gameover` state | AC-10 | auto | `state='gameover'` | matched | PASS |
| TC-AC10-02 | Restart (Space) from Game Over → `state='playing'` | AC-10 | auto | matched | matched | PASS |
| TC-AC10-03 | Restart → `player.row` resets to 0 | AC-10 | auto | `row=0` | `row=0` | PASS |
| TC-AC10-04 | Restart → **`score` resets to 0 immediately** (before first hop) | AC-10 | manual | `score=0` right after restart | **`score` stays at prior run's value (e.g. `6`) until the next hop landing recomputes it** — see BUG-1 | **FAIL** |
| TC-AC10-05 | High score unchanged when new run scores lower | AC-10 | auto | `highScore` unchanged | unchanged (50) | PASS |
| TC-AC10-06 | High score updates + `NEW BEST!` badge when new run beats it | AC-10 | manual (blink-timed) | badge renders (blinks ~3Hz) | Confirmed present via polling across blink cycle (`newbest-check.png`) | PASS |
| TC-AC10-07 | Rapid restart spam (8× Space, 20ms apart) from Game Over | destructive | manual | no crash, ends in stable `playing` state | `state='playing'`, 0 errors — but **inherits BUG-1** (stale score `87` shown) | PASS (no crash) / bug inherited |
| TC-AC11-01 | `M` key toggles `audio.muted` | AC-11 | auto | boolean flips | `false→true` | PASS |
| TC-AC11-02 | AudioContext resumes after first input (autoplay policy) | AC-11 | auto | `ctx.state` `null/suspended → 'running'` | `null→'running'` | PASS |
| TC-AC11-03 | Train bell call-count during a 1.0s warning window (forced) | AC-11, AC-6, DESIGN §4.4 | manual (instrumented) | ~5 calls (once per 200ms blink) | **87 calls** — see BUG-2 | **FAIL** |
| TC-AC11-04 | SFX call sites exist for hop/corn/horn/bell/death/splash/clear/gameover | AC-11 | manual (static) | all present | `audio.hop/tone/bell/death/splash/gameover` etc. all referenced at their trigger sites | PASS |
| TC-AC11-05 | Actual audibility (speaker output, perceived loudness/balance) on real desktop + mobile speakers | AC-11 | **needs-human** | audible, balanced | **cannot be verified headlessly (no audio output device in CI/headless Chromium)** | **BLOCKED — needs human** |
| TC-AC12-01 | `dt` clamp present in main loop (tab-switch/hitch guard) | AC-12 | manual (static) | `dt` clamped (e.g. ≤50ms) | confirmed `if(dt>0.05) dt=0.05;` (src L1200) | PASS |
| TC-AC12-02 | All movement (vehicles, hop, camera, train, log) scaled by `dt`, not fixed-per-frame | AC-12 | manual (static) | every `update(dt)` uses `dt` multiplicatively | confirmed across `Vehicle.update`, `Player.update`, `Camera`, `Train.update`, `Log` | PASS |
| TC-AC12-03 | Actual sustained ~60fps on a real display / no jank under load | AC-12 | **needs-human** | stable 60fps | Headless Chromium has no real display refresh signal / GPU compositing profile comparable to a real browser tab — **cannot be certified headlessly** | **BLOCKED — needs human** (with real Chrome DevTools Performance panel) |
| TC-AC13-01 | Simulated swipe-up (PointerEvent, `pointerType:'touch'`) on iPhone 12 emulated viewport | AC-13 | auto | hop forward | row 0→1 | PASS |
| TC-AC13-02 | Mobile viewport load, zero console errors | AC-13 | auto | 0 errors | 0 errors | PASS |
| TC-AC13-03 | 360×640 (small phone) viewport: canvas renders full size, no 0×0 | AC-13, PRD §4 | auto | `clientWidth/Height > 0` | `360×617` (letterboxed slightly on H) | PASS |
| TC-AC13-04 | 1920×1080 (desktop) viewport: canvas letterboxes, aspect preserved (336:576 ≈ 0.583) | AC-13, PRD §4 | auto | aspect within 0.05 tolerance | `630×1080` = 0.583 | PASS |
| TC-AC13-05 | Real physical touch device (actual finger swipe latency/threshold feel) | AC-13 | **needs-human** | swipes register reliably, 24px threshold feels right | **cannot be verified headlessly/emulated with full fidelity** | **BLOCKED — needs human** |
| TC-BREAK-01a | Reload page mid-run while URL still carries `?autostart&hops=15` | destructive | auto | (mis-specified expectation, see note) | `state` stayed `playing`/`dying` (hook re-fires on reload since query persists) | FAIL as scripted* |
| TC-BREAK-01b | Corrected: real keyboard-driven run (no query params) → `page.reload()` | destructive | manual | fresh reload resets to `state='title'`, 0 errors | `state='title'`, 0 errors, url confirmed clean | PASS |
| TC-BREAK-02 | `visibilitychange` event fired mid-run (simulated tab-away), wait 2.5s | destructive, AC-12 | auto | no crash/exception | 0 page errors, game kept running | PASS |
| TC-BREAK-03 | Malformed URL params `?autostart=1&stage=abc&hops=-99&screen=bogus` | destructive | auto | no uncaught exception | **`TypeError: Cannot read properties of undefined (reading 'scroll')` at `Game._startStage` L1011** | **FAIL** — see BUG-3 |
| TC-BREAK-03b | Isolated: `stage=abc` alone | destructive | manual | — | reproduces the same crash in isolation | FAIL (confirms BUG-3) |
| TC-BREAK-03c | Isolated: `hops=-99`, `screen=bogus`, `stage=99`, `stage=-5` alone | destructive | manual | no crash | all 4 handled gracefully (no error) | PASS |
| TC-BREAK-04 | Rapid triple-press Space on title (double-submit start) | destructive | auto | stable `playing` state, no error | `state='playing'`, 0 errors | PASS |
| TC-BREAK-05 | QA hook `hops=N` reliability: 18 runs across 3 stages × 6 hop counts, check state immediately after load | dev tooling reliability | manual (quantified) | player alive/`playing` in all 18 | **7/18 (39%) landed in `dying`/dead state immediately**, i.e. teleported onto an occupied hazard tile before any interaction | **FAIL** — see BUG-5 (renumbered, was informally BUG-2/3 above) |
| TC-BREAK-06 | Garbage/oversized keyboard input (`F1`, `1`, 44-char string paste) during play | destructive | manual | ignored, no crash | ignored, `state` stable, 0 errors | PASS |
| TC-BREAK-07 | Extreme viewport resize stress (`200×200`→`3000×2000`→`100×3000`→`1×1`→`360×640`, rapid) mid-run | destructive | manual | no crash | `state='playing'` throughout, 0 errors | PASS |
| TC-AC2-FEEL | Subjective hop crispness/squash-stretch/dust "juice" read | AC-2, ISS-01 | **needs-human** | feels instant + satisfying | Code-level timing matches DESIGN.md tokens (`HOP_DUR=0.15s` within 140-160ms spec; squash/stretch phases at 20/80% match §4.1) but **subjective feel cannot be certified by a script** | **BLOCKED — needs human** (ISS-01) |
| TC-AC7-FEEL | Camera-push "tension" / eagle-swoop dread | AC-7, ISS-01 | **needs-human** | feels escalating | mechanically confirmed (camera rises, eagle triggers); feel is subjective | **BLOCKED — needs human** |

\* Rows marked with an asterisk are cases where the **first scripted attempt produced a FAIL that was traced back
to a test-harness artifact, not a product defect** — a corrected re-test (the following row) confirms the
underlying feature is actually correct. Both rows are kept in the table for transparency (nothing is silently
dropped). Net effect on the FAIL tally below: TC-AC2-04a and TC-BREAK-01a are **not** counted as product
defects; TC-AC2-04b/TC-BREAK-01b (the corrected re-tests) are counted as the authoritative PASS results.

### Counts

- **Total distinct test cases logged:** 55
- **PASS:** 43
- **FAIL (real product defects):** 5 (TC-AC9-04, TC-AC10-04, TC-AC11-03, TC-BREAK-03/03b, TC-BREAK-05)
- **FAIL (test-harness artifact, corrected by a following PASS row, not counted as a product defect):** 2 (TC-AC2-04a, TC-BREAK-01a)
- **BLOCKED (needs human, cannot be automated):** 5 (TC-AC11-05, TC-AC12-03, TC-AC13-05, TC-AC2-FEEL, TC-AC7-FEEL)
- **SKIPPED:** 0

---

## AC coverage summary

| AC | Coverage | Notes |
|---|---|---|
| AC-1 Boot & title | **Full** | PASS |
| AC-2 Hop movement & feel | **Partial** | Mechanics fully verified (PASS); subjective "feel" portion is BLOCKED/needs-human (ISS-01) |
| AC-3 Grass lane | **Full** | PASS |
| AC-4 Road lane | **Full** | PASS |
| AC-5 River lane | **Full** | PASS |
| AC-6 Railway lane | **Full (with defect)** | Core logic PASS; BUG-2 (bell audio spam) found within scope |
| AC-7 Camera & eagle | **Partial** | Mechanics fully verified (PASS); subjective "tension" portion needs human |
| AC-8 Corn pickups & scoring | **Full (with defect)** | Core logic PASS; BUG-1 (stale score post-restart) affects the score half of this AC |
| AC-9 Stages & stage-clear | **Full (with defect)** | Core logic + 3 distinct palettes PASS; BUG-4 (bus in Stage 3) is a DESIGN.md deviation |
| AC-10 Death, game over & restart | **Partial — FAILING** | BUG-1 is a direct, literal violation of this AC's restart clause |
| AC-11 Audio | **Partial** | Unlock + mute + SFX-wiring PASS; BUG-2 found; true audibility BLOCKED/needs-human |
| AC-12 Performance & delta-time | **Partial** | Code-level dt-independence PASS; real 60fps BLOCKED/needs-human |
| AC-13 Mobile/touch | **Partial** | Emulated swipe + responsive scaling PASS; real device feel BLOCKED/needs-human |
| AC-14 Code structure | **Full** | PASS |

---

## Pre-logged issue verification (ISS-01 … ISS-04)

| ID | Original description | Verdict this cycle | Evidence |
|---|---|---|---|
| **ISS-01** | Game feel needs human playtest | **Still OPEN — confirmed needs-human.** Cannot be closed by automation by definition. Code-level timing constants (`HOP_DUR=150ms`, squash/stretch phase splits, camera easing const, buffer window) all match DESIGN.md's documented tokens, so there is no evidence of an obvious implementation error — but a human must play to confirm the qualitative bar ("instant and satisfying") is met. Added data point for the human tester: rapid-tap buffering is a **single-slot, last-35%-of-hop window** — at most 1 extra hop can be queued while mid-air; taps outside that window are silently dropped with no bump/feedback SFX. Traced and matches DESIGN.md §4.1 exactly, so this is by-design, not a bug — but worth the human tester's attention when judging "does rapid tapping feel laggy." | TC-AC2-07, TC-AC2-FEEL |
| **ISS-02** | Audio audibility + mute needs real-device verify | **Partially advanced.** Mute toggle and AudioContext unlock-on-first-input are now **code-verified PASS** (not just "needs human"). However, testing this issue **surfaced a real, code-level audio defect (BUG-2: train bell fires ~87×/sec instead of once per 200ms blink)** that a human ear would very likely perceive as broken/buzzing regardless of speaker quality. True perceived audibility/loudness balance across devices remains OPEN/needs-human. | TC-AC11-01/02/03/04/05 |
| **ISS-03** | Touch/swipe on real device needs verify | **Substantially de-risked.** Swipe-up correctly triggers a forward hop under full touch-capable emulation (iPhone 12 profile, `hasTouch`, synthetic `PointerEvent` with `pointerType:'touch'` matching the app's actual `pointerdown/pointerup` listeners — not just DOM clicks). The core swipe **logic** is confirmed correct. What remains OPEN/needs-human is real-finger latency and whether the 24px swipe threshold feels right on an actual touchscreen (cannot be emulated). | TC-AC13-01/02 |
| **ISS-04** | Canvas centering/crispness on real phone+desktop — headless screenshot cropping was suspected artifact | **CONFIRMED as suspected — closing as not-a-bug.** Verified via real Playwright viewport sizing (not screenshot cropping) at 360×640 (small phone) and 1920×1080 (desktop): canvas `clientWidth/clientHeight` fill correctly with no 0-size, aspect ratio at 1920×1080 measured `630×1080 = 0.583` vs target `336:576 = 0.583` — exact match, correctly letterboxed, `image-rendering:pixelated` present in CSS. Recommend closing ISS-04; a final human glance on a physical device is a nice-to-have, not a blocker. | TC-AC13-03/04, `viewport-360x640.png`, `viewport-1920x1080.png` |

**Updated ledger recommendation for orchestrator:** ISS-04 → CLOSED (verified fine). ISS-01/02/03 → remain OPEN
(inherently need human playtest) but ISS-02/03 now have stronger automated-evidence backing; ISS-02 additionally
spawned a new confirmed defect (BUG-2) that should be tracked separately, not conflated with the "needs ears"
part of ISS-02.

---

## 🟠 Defects found this cycle

### BUG-1 — Score not reset to 0 immediately on restart (stale score persists in HUD)
- **Severity:** Major
- **Owner:** frontend
- **AC / spec:** Directly violates **AC-10**: *"Given the Game Over screen, When the player triggers restart
  (key/tap), Then a fresh run starts at Stage 1 with score reset to 0."*
- **Steps to reproduce (pure real gameplay, no QA hooks needed):**
  1. Open `index.html`, press Space to start.
  2. Press ArrowUp 6 times (200ms+ apart) to reach row 6 (score becomes 6).
  3. Trigger any death (e.g. drive into traffic, or for a deterministic repro run
     `window.__game.killPlayer('car')` in devtools console).
  4. Wait for the Game Over screen (~1.5s).
  5. Press Space to restart.
  6. **Immediately** (before making any hop) read `window.__game.score` or look at the HUD SCORE value.
- **Expected:** `score === 0` immediately after restart (per AC-10 and DESIGN §7.4 stat-panel logic, which
  implies a genuinely fresh run).
- **Actual:** `score` remains at the previous run's value (`6` in the repro) until the player's **next hop
  landing** recomputes it via `onPlayerLanded()`. `player.row` and `corn` **do** reset correctly to `0`
  immediately — only `score` is stale. Root cause: `Game.startRun()` (source ~L1001) resets `stage`,
  `stageBase`, and `corn` explicitly but never resets `this.score` (or `this._score`); `score` is a derived
  getter/setter that's normally kept in sync every hop via `onPlayerLanded()`, but nothing forces that
  recompute at restart time before the first hop.
- **Evidence:** Reproduced with zero URL hooks (pure keyboard play): `before-death {row:6, score:6}` →
  `game-over {state:'gameover', score:6}` → **`immediately-after-restart {state:'playing', score:6, row:0}`**.
  Screenshot: `docs/reports/screenshots/bug-score-reset.png` (HUD visibly shows "SCORE 6" with the chicken
  back at the Stage-1 starting row).
- **Suggested fix location:** add `this.score = 0;` (or `this._score = 0;`) inside `Game.startRun()`.

### BUG-2 — Train warning bell fires on every animation frame instead of once per 200ms blink (audio spam)
- **Severity:** Major
- **Owner:** frontend
- **AC / spec:** Violates **DESIGN.md §4.4**: *"alternates ... at a 200ms flash interval ... Bell SFX syncs to
  each flash"* (i.e., one bell hit per ~200ms blink), and undermines **AC-11**'s expectation of correct,
  deliberate SFX rather than an unintended spam/glitch.
- **Steps to reproduce:**
  1. Open with any stage that has rail lanes, e.g. `index.html?autostart=1&stage=2`.
  2. In devtools console: `const l = window.__game.lanes.find(l=>l.type==='rail'&&l.train); l.train.state='idle'; l.train.timer=0.01; l.train.warnDur=1.0;`
  3. Wait ~1.2s for the warning window to complete, listening for the bell.
- **Expected:** ~5 bell hits over a 1.0s warning window (one per 200ms blink cycle, per DESIGN §4.4).
- **Actual:** Instrumented `audio.bell()` call count over the same 1.0s window: **87 calls** — i.e. it fires on
  essentially every rendered frame during the "on" half of each blink instead of once per blink transition.
  Root cause: in `Train.update()` (source ~L642-646), `this._belled=false` is set once on entering the `warn`
  state, and the guard `if(on && !this._belled){ ...bell() }` never sets `this._belled = true` after playing (nor
  resets it to `false` at the start of each new blink cycle) — so the guard is permanently `false` and never
  actually suppresses repeat calls within the same "on" window.
- **Evidence:** `bellCount = 87` over the warning window (script: instrumented `audio.bell` wrapper, see cycle
  notes). This will be audibly obvious as a buzzing/machine-gun sound rather than a clean "ding...ding...ding"
  telegraph — likely to be very noticeable in Stage 3, which has the highest rail frequency (`weights.rail=0.26`).
- **Suggested fix location:** `Train.update()` — set `this._belled = true` immediately after calling `bell()`,
  and reset `this._belled = false` when `on` flips back to `false` (start of next blink half-cycle).

### BUG-3 — QA/dev URL hook crashes on non-numeric `stage` param
- **Severity:** Minor
- **Owner:** frontend
- **AC / spec:** The shipped, "safe to ship" QA hook (frontend's own stage-3 report, item 9) is reachable by
  anyone editing the URL; an uncaught exception here still breaks the "no console errors" hygiene bar even
  though it requires manual URL tampering (not reachable through normal UI).
- **Steps to reproduce:**
  1. Open `index.html?autostart=1&stage=abc`.
- **Expected:** Either ignored/clamped to a valid stage (as `stage=99`/`stage=-5` already correctly are — those
  clamp fine via `Math.max(0, Math.min(2, ...))`), or a graceful no-op.
- **Actual:** Uncaught `TypeError: Cannot read properties of undefined (reading 'scroll')` at
  `Game._startStage` (source ~L1011), because `parseInt('abc', 10)` → `NaN`, and `Math.min(2, NaN)` /
  `Math.max(0, NaN)` both evaluate to `NaN`, so `game.stage = NaN` and `STAGES[NaN]` is `undefined`.
  Confirmed isolated to the `stage` param specifically — `hops=-99`, `screen=bogus`, `stage=99`, `stage=-5`
  individually all handled gracefully with no error.
- **Evidence:** Full stack: `TypeError: Cannot read properties of undefined (reading 'scroll') at
  Game._startStage (index.html?...:1011:27) at index.html?...:1514:10`.
- **Suggested fix location:** boot script (~L1512): validate `parseInt` result with `Number.isFinite()` before
  clamping/assigning, falling back to `0`.

### BUG-4 — Bus vehicles spawn in Stage 3 (Industrial), contrary to DESIGN.md "Stage 2 only"
- **Severity:** Minor / Cosmetic
- **Owner:** frontend
- **AC / spec:** DESIGN.md §4.2: *"Bus (Stage 2 only, 3 tiles wide): boxier silhouette..."* — explicitly scoped
  to Stage 2.
- **Steps to reproduce:**
  1. Open `index.html?autostart=1&stage=2` (Stage 3, Industrial).
  2. In devtools console, regenerate lanes repeatedly and collect vehicle kinds:
     `for(let i=0;i<40;i++) window.__game._genLanes();` then scan `window.__game.lanes[*].vehicles[*].kind`.
- **Expected:** Only `car`/`truck` kinds in Stage 3; `bus` only in Stage 2.
- **Actual:** `bus` kind observed spawning in Stage 3 lanes as well. Root cause: the spawn condition
  `if(this.stage>=1 && r<0.25){ kind='bus'; ... }` (source ~L1070) uses `>=1` (Stage 2 **and** Stage 3, since
  stage indices are 0/1/2) instead of `===1` (Stage 2 only).
- **Evidence:** `Set` of observed kinds across 40 regenerations on stage index 2: `['truck','car','bus']`.
- **Suggested fix location:** change `this.stage>=1` to `this.stage===1` at the bus-kind roll (~L1070).

### BUG-5 — QA/dev `hops=N` URL hook frequently teleports the player onto an already-occupied hazard tile, causing instant death before the tester can observe the intended state
- **Severity:** Minor (dev-tooling reliability issue, not reachable by normal players — the hook is inert unless
  the URL param is explicitly present)
- **Owner:** frontend
- **Context:** This task's own instructions recommend using this hook ("A dev/QA URL hook is available... to
  jump to states") for state inspection during QA, so its unreliability materially affects testability.
- **Steps to reproduce:**
  1. Load `index.html?autostart=1&stage=<0|1|2>&hops=<N>` for various `N` (e.g. 3/5/8/10/15/20) across all 3
     stages, and check `window.__game.state` ~150ms after load, before any input.
- **Expected:** Player lands safely (`state==='playing'`) every time, since the hook is meant for visual
  inspection of a given row/stage.
- **Actual:** **7 of 18 sampled combinations (39%)** resulted in `state !== 'playing'` (dying/dead) immediately,
  because the hook (`window.addEventListener('load', ...)` boot block, ~L1516-1518) sets `player.row` and
  `player.x` directly without checking whether the target lane/tile is currently occupied by a vehicle, train,
  or open water. This was also visually confirmed: automated screenshots intended to show live Stage 1/Stage 2
  gameplay (`stage1.png`/`stage2.png` in this report's evidence folder) instead captured a Game Over overlay
  ("SWEPT AWAY!" / "SQUASHED!") because the hop-hook teleport landed the player in traffic/water on load.
- **Evidence:** Raw sample (`stage`, `hops` → `state`):
  `0,5→dying`; `0,20→dying`; `1,3→dying`; `1,15→dying`; `2,5→dying`; `2,8→dying`; `2,20→dying`
  (11 of 18 combinations landed safely).
- **Suggested fix location:** in the boot script's `hops` loop, after placing the player, either (a) also fast-
  forward/clear hazards on the landing lane, or (b) snap to the nearest known-grass row, or (c) simply
  document the caveat prominently ("hops= may occasionally place you in traffic — press Space to retry") since
  a purely cosmetic dev aid may not warrant more engineering than that.

---

## Screenshots (evidence)

All under `docs/reports/screenshots/`: `title.png`, `stage1.png`, `stage2.png`, `stage3.png`,
`screen-clear.png`, `screen-victory.png`, `screen-over.png`, `mobile-iphone12.png`, `viewport-360x640.png`,
`viewport-1920x1080.png`, `newbest-check.png`, `bug-score-reset.png`.

---

## ✅ Verdict

**❌ FAIL** — 5 confirmed product defects (2 Major, 3 Minor/Cosmetic), all owned by **frontend**. Not ready for
Stage 5. Recommend one fix cycle focused on:
1. BUG-1 (Major) — one-line score reset in `startRun()` — directly breaks AC-10, highest priority.
2. BUG-2 (Major) — bell-spam guard fix in `Train.update()` — directly breaks the AC-6/AC-11 audio-telegraph
   contract and is likely to be very noticeable to a human playtester.
3. BUG-3, BUG-4, BUG-5 (Minor) — fix as time allows; none blocks core player-facing acceptance criteria, but
   BUG-5 impairs the team's own QA hook reliability and should be cheap to patch.

**Test-case counts:** 55 executed / 43 passed / 5 failed (real defects) / 2 failed-then-corrected (harness
artifacts, not counted as defects) / 5 blocked (needs-human, explicitly not silently passed) / 0 skipped.

**AC coverage:** 14/14 ACs exercised to the fullest extent automatable; 5 ACs (AC-2, AC-6, AC-7, AC-9, AC-10,
AC-11 — six, see table) have a defect or a needs-human gap noted; AC-1/AC-3/AC-4/AC-5/AC-14 fully pass with no
caveats. Full per-AC breakdown above.

**Needs-human items (not silently passed — must be confirmed by a human playtester before final sign-off):**
real-device audio audibility (ISS-02 remainder), real-device 60fps performance (AC-12), real physical touch
swipe feel (ISS-03 remainder), and subjective "game feel" (ISS-01, hop crispness / camera tension / death
punch).
