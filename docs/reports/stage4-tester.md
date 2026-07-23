# Stage 4 — Tester Report (Chicken Road, Cycle 1)

Owner: tester
Branch: `feature/chicken-road`
Deliverable under test: single self-contained `index.html` (HTML5 Canvas + vanilla JS, no server/build).

## 🟢 START

- **Environment:** macOS (Darwin 25.4.0), Node v23.5.0, Playwright 1.61.1 + headless Chromium 149 (installed
  fresh for this cycle: `npm install --no-save playwright` + `npx playwright install chromium --with-deps`).
  No server needed — game opened via `file://`. No existing test suite in the repo (expected per PRD §10); a
  Playwright harness was authored for this cycle at `tests/e2e/run-tests.js`.
- **Inputs read:** `docs/PRD.md` (AC-1…AC-14), `docs/DESIGN.md` (sprite/screen/palette specs),
  `docs/reports/stage3-frontend.md` (frontend's build + QA notes), `docs/reports/ISSUES.md` (ISS-01…ISS-04).
- **Cycle:** 1

### TODO checklist (posted at start)
- [x] Fresh load + self-contained check (grep for network/external references)
- [x] Console-error-free load; static AC-14 class-presence scan
- [x] Title screen render + all `?stage=`/`?screen=` QA hooks exercised
- [x] Execute AC-1…AC-14 as literally as headless automation allows
- [x] Verify ISS-01…ISS-04 individually, report updated status
- [x] Destructive testing: boundaries, rapid/buffered input, refresh mid-run, tab-away, tiny/huge/garbage
      viewports & URL params, double-submit, resize stress
- [x] Full test-case table + defect list written to `docs/TEST_REPORT_1.md`

## 🔵 PROGRESS (by phase)

1. **Install/load:** zero-build "install" confirmed (just opening the file); `grep` found zero
   `http/https/link/cdn/script src=` references — self-contained confirmed.
2. **Static/automated:** 38-case Playwright script (`tests/e2e/run-tests.js`) run headless — all 12 AC-14
   classes present, zero console/page errors on load, all QA URL hooks (`autostart/stage/hops/screen`) work.
3. **API surface:** N/A — this project has no backend/API per PRD (client-only game).
4. **AC walk:** all 14 ACs exercised via a mix of the automated harness plus ~15 targeted one-off Playwright
   investigation scripts (killPlayer/onPlayerLanded/instrumented-audio calls, etc.) to reach code paths a
   pure UI-driven script couldn't hit deterministically (e.g. forcing a river-edge carry-off death, forcing a
   train warning window with a short timer).
5. **Destructive:** boundary hops, rapid-tap input buffering (measured, matches design), refresh mid-run,
   tab-away (`visibilitychange`), garbage/malformed URL params, double/rapid-submit, extreme viewport resize —
   all executed, 3 real defects surfaced (see below), 2 initially-failing cases traced to test-harness
   artifacts and corrected.

## 🟠 ISSUES

New defects found this cycle (full repro/evidence in `docs/TEST_REPORT_1.md`):

- **BUG-1 (Major, frontend):** `score` is not reset to 0 immediately on restart — stale score from the
  previous run persists in the HUD until the player's first hop. Direct AC-10 violation. Reproduced with pure
  keyboard play, no QA hooks. Root cause identified: `Game.startRun()` never resets `this.score`.
- **BUG-2 (Major, frontend):** train warning bell fires on almost every animation frame instead of once per
  200ms blink (measured 87 calls vs ~5 expected in a 1s warning window) — audio spam/buzz instead of a clean
  telegraph. Violates DESIGN.md §4.4. Root cause identified: `Train._belled` flag guard never actually
  suppresses repeat calls.
- **BUG-3 (Minor, frontend):** the shipped QA/dev URL hook crashes with an uncaught `TypeError` when given
  `?stage=<non-numeric>` (e.g. `stage=abc`), due to unvalidated `parseInt` → `NaN` → `STAGES[NaN]`.
- **BUG-4 (Minor/Cosmetic, frontend):** bus vehicles spawn in Stage 3 (Industrial) as well as Stage 2, contrary
  to DESIGN.md §4.2's explicit "Bus (Stage 2 only)". Off-by-condition: `this.stage>=1` should be `===1`.
- **BUG-5 (Minor, frontend):** the QA/dev `hops=N` URL hook frequently (39% in an 18-run sample across all 3
  stages) teleports the player onto an already-occupied hazard tile, killing them before the tester can
  observe the intended state — undermines the hook's own stated QA purpose and was visually caught via
  automated screenshots that landed on an unintended Game Over screen instead of live gameplay.

Updated ISS-01…ISS-04 status (ledger update recommended — see `docs/TEST_REPORT_1.md` "Pre-logged issue
verification" section for full detail):

- **ISS-01** (game feel) — still OPEN, inherently needs human playtest; code-level timing constants confirmed
  to match DESIGN.md's documented tokens (no implementation error found).
- **ISS-02** (audio audibility) — mute/unlock now code-verified PASS; investigating it surfaced BUG-2 (should
  be tracked as its own item going forward); true audibility across real speakers remains OPEN/needs-human.
- **ISS-03** (touch/swipe) — substantially de-risked; swipe logic confirmed correct under full touch-emulation
  (real `pointerdown/pointerup` events, not synthetic clicks); real-finger feel remains OPEN/needs-human.
- **ISS-04** (canvas centering/crispness) — **recommend CLOSING**: confirmed via real viewport sizing (not
  screenshot cropping) at both 360×640 and 1920×1080 that the canvas scales/letterboxes correctly with the
  exact target aspect ratio (336:576).

No environment blockers encountered — Playwright + headless Chromium installed cleanly, game ran without a
server as expected.

## ✅ DONE

- **Verdict: ❌ FAIL** — not ready for Stage 5. 5 confirmed defects (2 Major: BUG-1, BUG-2; 3 Minor/Cosmetic:
  BUG-3, BUG-4, BUG-5), all owned by frontend. Recommend a fix cycle prioritizing BUG-1 and BUG-2 (both are
  small, precisely-located fixes — one-line score reset, and a one-line bell-guard fix).
- **Full report:** `docs/TEST_REPORT_1.md` (55 test cases logged, full table, AC coverage, defect repro steps,
  screenshots).
- **Test-case counts:** 55 executed / 43 passed / 5 failed (real defects) / 2 failed-then-corrected (harness
  artifacts, not counted as product defects) / 5 blocked (needs-human — explicitly not silently passed) / 0
  skipped.
- **AC coverage:** all 14 ACs exercised to the fullest extent automatable. AC-1/AC-3/AC-4/AC-5/AC-14 fully pass
  clean. AC-2/AC-7/AC-11/AC-12/AC-13 pass on the mechanical/code level but retain a needs-human remainder
  (game feel / real audio / real 60fps / real touch — none silently passed). AC-6/AC-9/AC-10 each pass on
  mechanics but carry an attached defect (BUG-2/BUG-4/BUG-1 respectively).
- **Artifacts left in repo for reuse:** `tests/e2e/run-tests.js` (38-case Playwright harness — rerun with
  `npm install --no-save playwright && node tests/e2e/run-tests.js`), `docs/reports/screenshots/*.png`
  (visual evidence for every screen/stage/viewport/bug).
- **Handoff:** route BUG-1…BUG-5 to frontend for fix cycle 2. On fix, re-run `tests/e2e/run-tests.js` plus a
  manual regression sweep of restart flow (BUG-1), train telegraph audio (BUG-2), and the 3 QA-hook edge cases
  (BUG-3/BUG-5) before re-submitting for Stage 4 cycle 2.
