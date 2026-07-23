# Stage 4 — Frontend Fix Report (Cycle 2)

**Agent:** frontend | **Branch:** `feature/chicken-road` | **File under fix:** `index.html`
**Input:** `docs/TEST_REPORT_1.md` (5 defects, Cycle 1), `docs/DESIGN.md`

## Checklist

- [x] BUG-1 (Major, AC-10): reset score (and other per-run state) on restart before first frame renders
- [x] BUG-2 (Major): fix Train bell cadence guard so it rings ~once per 200ms blink, not ~87x/s
- [x] BUG-3 (Minor): guard QA URL hook against non-numeric `?stage=abc` to avoid uncaught TypeError
- [x] BUG-4 (Minor): restrict bus spawns to Stage 2 only per DESIGN.md
- [x] BUG-5 (Minor): make `hops=N` teleport hook land player on a safe/cleared tile
- [x] Re-verify: headless smoke check, no console errors, game runs across all 3 stages

All 5 bugs from `docs/TEST_REPORT_1.md` were reproducible root causes exactly as the tester
described. All 5 are fixed, each in its own commit on `feature/chicken-road`. No design
decisions were needed — none of these turned out to be non-defects.

## Per-bug detail

### BUG-1 — Score not reset on restart (Major, AC-10)
- **What was wrong:** `Game.startRun()` reset `stage`, `stageBase`, and `corn` but never
  `this.score`, so the HUD kept showing the prior run's score until the next hop's
  `onPlayerLanded()` recomputed it.
- **Fix:** `startRun()` now also sets `this.score = 0` and clears `this._deathCause` (so a
  stale death cause/flavor line can't leak into the next run's Game Over screen either),
  before `_startStage()` runs and before the first frame renders.
- **Commit:** `322b8cf` — `fix(game): reset score and death cause on restart (BUG-1)`
- **Regression test:** `tests/e2e/verify-fixes-cycle2.js` — "BUG-1 score/corn/row resets to 0
  immediately on restart" (forces a death via `killPlayer`, waits for Game Over, calls
  `startRun()`, asserts `score/corn/row` are all `0` with zero console errors).

### BUG-2 — Train warning bell fires ~87x/sec instead of ~5x/sec (Major)
- **What was wrong:** `Train.update()` set `this._belled = false` once on entering `warn`
  state but never set it back to `true` after ringing, nor reset it per blink half-cycle — the
  guard `if(on && !this._belled)` was permanently `false`, so `audio.bell()` fired on
  essentially every rendered frame during the "on" half of the blink instead of once per
  200ms flash (DESIGN.md §4.4: "Bell SFX syncs to each flash").
- **Fix:** replaced the `_belled` boolean with `_lastBlinkIdx`, tracking
  `Math.floor(this.blink/0.2)`; the bell now fires exactly once whenever that index changes
  (i.e. once per 200ms blink transition), reset to `-1` on entering `warn`.
- **Commit:** `120932e` — `fix(game): ring train warning bell once per 200ms blink, not per frame (BUG-2)`
- **Regression test:** `verify-fixes-cycle2.js` — "BUG-2 bell fires ~5x (not ~87x) over 1.0s
  warn window" (instruments `audio.bell`, forces a train into `warn` with `warnDur=1.0`,
  asserts call count is in `[4,7]`; observed consistently ~5).

### BUG-3 — QA hook crashes on non-numeric `?stage=abc` (Minor)
- **What was wrong:** boot script did `parseInt(q.get('stage')||'0',10)` straight into
  `Math.max(0, Math.min(2, ...))`. `parseInt('abc',10)` is `NaN`, and `Math.min`/`Math.max`
  with `NaN` both evaluate to `NaN`, so `game.stage = NaN`, `STAGES[NaN]` was `undefined`, and
  `_startStage()` threw `TypeError: Cannot read properties of undefined (reading 'scroll')`.
- **Fix:** both `stage` and `hops` params are now parsed and validated with
  `Number.isFinite()` before use, falling back to `0` (stage) / `0` (hops) on anything
  non-numeric, matching how `stage=99`/`stage=-5`/`hops=-99` were already handled gracefully.
- **Commit:** `ce5553a` — `fix(game): guard garbage ?stage= param and make hops= hook land safely (BUG-3, BUG-5)`
- **Regression test:** `verify-fixes-cycle2.js` — "BUG-3" block: loads `?stage=abc`, asserts
  zero console errors, `game.stage === 0`, `state === 'playing'`.

### BUG-4 — Buses spawn in Stage 3 (Minor / Cosmetic)
- **What was wrong:** the bus-kind roll used `this.stage>=1`, which (stages are 0-indexed)
  matches both Stage 2 (`index 1`) and Stage 3 (`index 2`). DESIGN.md §4.2 scopes buses to
  Stage 2 only.
- **Fix:** changed the condition to `this.stage===1`.
- **Commit:** `8ca090f` — `fix(game): restrict bus spawns to Stage 2 only (BUG-4)`
- **Regression test:** `verify-fixes-cycle2.js` — "BUG-4 no bus kind spawns in Stage 3"
  (regenerates lanes 60x on stage index 2, collects all vehicle kinds seen, asserts `'bus'` is
  never present).

### BUG-5 — `hops=N` QA hook teleports onto occupied hazard tiles (~39% of runs) (Minor)
- **What was wrong:** the boot script's `hops` loop set `player.row`/`player.x` directly with
  no regard for whether the landing lane/tile was currently occupied by a vehicle, train, or
  open water — so the dev-only QA teleport hook killed the player before its intended state
  could be observed.
- **Fix:** added `Game._ensureSafeLanding()`, called immediately after the teleport:
  - **road lane:** clears all vehicles in the landing lane (not just the one overlapping the
    player at that instant — a near-miss vehicle can still close the gap and kill the player a
    few frames later while they stand still, which is what made an initial narrower fix
    flaky under repeated testing).
  - **rail lane:** parks the train back in `idle` state with a fresh multi-second cooldown
    timer, so a `warn`/`pass` cycle can't begin immediately.
  - **river lane:** rides the player on whichever log currently carries their `x`, or — if
    none does — picks whichever log has the largest margin from either kill-edge
    (`WORLD_W-6`) and snaps the player onto its center, rather than blindly grabbing the first
    log (which could already be near an edge and sweep the player away within a frame).
- **Commit:** `ce5553a` — `fix(game): guard garbage ?stage= param and make hops= hook land safely (BUG-3, BUG-5)`
- **Regression test:** `verify-fixes-cycle2.js` — "BUG-5 hops= hook lands safely in all 18
  combos" (3 stages x 6 hop counts, `state==='playing'` ~150ms after load). Also
  stress-tested manually: 180 additional samples across `tests/e2e/debug-bug5.js` runs (3x60)
  plus a 63-sample run with a 600ms observation window — 0 unsafe landings in all of these.

## Re-verification

- `node tests/e2e/verify-fixes-cycle2.js` — new targeted regression script covering all 5
  bugs plus a 3-stage load/console-error smoke check. **17/17 checks pass**, run repeatedly
  (5x) with 0 flakiness after the BUG-5 fix was widened to clear the full lane / pick the
  safest log.
- `node tests/e2e/run-tests.js` — re-ran the tester's own Cycle-1 harness (left in the repo
  under `tests/e2e/`) against the fixed code: **34/38 pass**. The 3 remaining `FAIL` rows
  (`TC-AC2-04`, `TC-AC2-07`, `TC-BREAK-01`) are the exact same test-harness-artifact cases the
  tester already identified and closed out with corrected manual retests in
  `docs/TEST_REPORT_1.md` (§ "Rows marked with an asterisk") — not product defects, not
  something introduced by this cycle's fixes. `TC-AC10-03` (score reset) and `TC-BREAK-03`
  (garbage URL params) — the two rows this cycle's fixes directly target — now both **PASS**
  where they previously failed.
- Static syntax check (`new Function(...)` on the extracted `<script>` body) — OK.
- Manual code review confirms no other call sites relied on the removed `Train._belled` field
  or the pre-fix `this.stage>=1` bus condition.

## Branch state for tester (Cycle 2 re-verify)

Branch: `feature/chicken-road`, 5 new commits on top of `deef176` (the Cycle-1 test-report
commit):

```
322b8cf fix(game): reset score and death cause on restart (BUG-1)
120932e fix(game): ring train warning bell once per 200ms blink, not per frame (BUG-2)
8ca090f fix(game): restrict bus spawns to Stage 2 only (BUG-4)
ce5553a fix(game): guard garbage ?stage= param and make hops= hook land safely (BUG-3, BUG-5)
62cb76e test(frontend): add Cycle 2 fix-verification smoke scripts for BUG-1..BUG-5
```

Not pushed. `index.html` is the only production file changed (single-file game, per PRD
constraint) — no new dependencies, no build step introduced.

## 🟠 Issues

None. All 5 defects were confirmed real, root-caused exactly as reported, and fixed without
needing a design decision or scope change.
