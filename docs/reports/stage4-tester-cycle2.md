# Stage 4 — Tester Report (Chicken Road, Cycle 2 — Re-verification)

Owner: tester
Branch: `feature/chicken-road`
Deliverable under test: single self-contained `index.html`.
Inputs: `docs/TEST_REPORT_1.md` (Cycle-1 findings, 5 defects), `docs/reports/stage4-frontend-fixes.md`
(frontend's fix write-up, commit hashes), `docs/reports/ISSUES.md` (BUG-1..5 IN-PROGRESS).

## 🟢 START

**Cycle:** 2 (re-verification)

### TODO checklist
- [x] Read Cycle-1 report, frontend fix write-up, ISSUES.md
- [x] Checkout `feature/chicken-road`, confirm environment still boots (no destructive reinstall — see
      Environment note in `docs/TEST_REPORT_2.md`)
- [x] Re-run `tests/e2e/run-tests.js` — confirm TC-AC10-03 and TC-BREAK-03 now PASS
- [x] Re-confirm TC-AC2-04, TC-AC2-07, TC-BREAK-01 are the same harness artifacts as Cycle 1, not regressions
- [x] Independently reproduce & verify BUG-1 (own script, pure real gameplay, no QA hooks)
- [x] Independently reproduce & verify BUG-2 (own script, different window; caught + resolved a false positive
      in my own first attempt — see below)
- [x] Independently reproduce & verify BUG-3 (9 garbage `?stage=` variants)
- [x] Independently reproduce & verify BUG-4 (100x regenerations × 3 stages)
- [x] Independently reproduce & verify BUG-5 (36 combos, 700ms window)
- [x] Regression sweep: restart/score repeat cycles, high score, natural train play, stage transitions, stage
      clear, corn, mobile swipe, mute
- [x] Write full test-case table + defect status to `docs/TEST_REPORT_2.md`
- [x] Confirm ISS-01/02/03 remain human-playtest-only, not closable this cycle
- [x] Commit `docs/TEST_REPORT_2.md` + this report

## 🔵 PROGRESS

1. **Setup:** checked out `feature/chicken-road` (5 new commits on top of the Cycle-1 report commit, matching
   `docs/reports/stage4-frontend-fixes.md`'s stated branch state exactly). Existing `node_modules`/Playwright
   1.61.1 install reused (functional, confirmed by running both harnesses successfully) — flagged the missing
   `package-lock.json`/`devDependencies` declaration as a new Cosmetic test-infra note (BUG-6), not a blocker.
2. **Harness re-run:** `node tests/e2e/run-tests.js` → 34/38 pass (was 33/38 in Cycle 1, net +1 after BUG-1/BUG-3
   fixes moved TC-AC10-03 and TC-BREAK-03 from FAIL to PASS — Cycle 1's 5-real-defect list also included
   BUG-2/4/5 which aren't directly asserted by this harness, only by the frontend's targeted script and my own
   independent scripts). The 3 remaining FAIL rows (`TC-AC2-04`, `TC-AC2-07`, `TC-BREAK-01`) were individually
   re-traced to the exact same root causes documented in Cycle 1 — confirmed unchanged, not new regressions.
3. **Frontend's regression script:** `node tests/e2e/verify-fixes-cycle2.js` → 17/17 pass, matches frontend's
   own claim exactly.
4. **Independent bug-by-bug verification:** wrote 5 fresh Playwright scripts (not reusing frontend's fixtures)
   with different parameters, sample sizes, and observation windows than either the Cycle-1 report or
   frontend's fix-verification script used:
   - BUG-1: pure real-gameplay repro (6 real hops, forced death, restart, read state in the very next
     `evaluate()` call) — score/corn/row/deathCause all confirmed reset. **FIXED.**
   - BUG-2: first attempt (1.4s window, global bell-hook) produced a misleading "still failing" 11-count
     result. Dug into per-call timestamps and found Stage 3 runs 7 concurrent rail lanes, each with its own
     `Train` instance independently entering `warn` on its own timer and sharing the same global `audio.bell()`
     hook — my un-isolated instrumentation was summing multiple trains' independently-correct bell rings. Redid
     the test isolating all other trains; got a clean, strictly-monotonic 0..7 index sequence, 8 rings over
     1.4s, zero repeats. **FIXED** (disclosed the false-positive investigation in full in `TEST_REPORT_2.md`
     for transparency).
   - BUG-3: 9 non-numeric `stage=` variants (vs. the original single `abc` repro) — 0 crashes, all fall back to
     a valid stage. **FIXED.**
   - BUG-4: 100 regenerations × each of 3 stages (vs. frontend's 60× on stage 2 only) — buses confirmed
     stage-2-only, no regression on Stage 2's own bus spawns. **FIXED.**
   - BUG-5: 36 combos with a 700ms observation window (vs. frontend's 150ms) specifically to probe the
     "near-miss vehicle closes the gap a few frames later" failure mode the fix report itself flagged as the
     reason an earlier, narrower attempt was flaky — 0/36 unsafe. **FIXED.**
5. **Regression sweep:** 8 additional scripted checks (3x repeated restart cycles, high-score up/down logic,
   natural 4s Stage-3 play with instrumented bell count, all 3 stage-hook loads, real progression to
   stage-clear at row 30, corn pickup, mobile swipe, mute toggle) — all 10/10 PASS, zero new defects, zero
   console errors anywhere.

## 🟠 ISSUES

- **BUG-1..BUG-5: all FIXED**, each independently confirmed by at least two separate methods (frontend's own
  regression script + my from-scratch repro with different parameters). See per-bug evidence table in
  `docs/TEST_REPORT_2.md`.
- **BUG-6 (NEW, Cosmetic, test-infra only):** no `package-lock.json`, `playwright` not declared in
  `package.json` `devDependencies` — a clean-room `npm ci` would fail. Pre-existing since Cycle 1, not a
  regression, zero impact on the shipped product (still verified zero-dependency/zero-network). Non-blocking.
- **ISS-01 (game feel), ISS-02 (audio audibility remainder), ISS-03 (touch feel remainder):** re-confirmed
  still OPEN, inherently require a human playtester, unaffected by this cycle's fixes. Not something I can
  close by automation, and not a new blocker.

## ✅ DONE

**Verdict: PASS.** All 5 Cycle-1 defects (BUG-1..BUG-5) are genuinely fixed — independently reproduced and
confirmed, not just trusted from the fix report. Full regression sweep found zero new product defects. The 3
harness rows that still show raw FAIL (`TC-AC2-04`, `TC-AC2-07`, `TC-BREAK-01`) are re-confirmed as the same
pre-existing test-harness artifacts from Cycle 1, not regressions. One new Cosmetic test-infra note (BUG-6)
logged, non-blocking.

**Ready for Stage 5 (ship): YES**, with ISS-01/02/03 carried forward as human-playtest caveats (not blockers),
per the same recommendation Cycle 1 made and this cycle re-confirms.

**Report:** `docs/TEST_REPORT_2.md` (full per-test-case table, 47 cases logged, defect ledger, AC coverage
delta table).

**Test-case counts:** 47 executed / 39 passed / 0 failed (real defects) / 3 failed-as-scripted (harness
artifacts, re-confirmed non-defects, matches Cycle 1) / 1 self-corrected diagnostic (my own BUG-2 first-attempt
false positive) / 5 blocked (needs-human, unchanged from Cycle 1) / 0 skipped.

**AC coverage:** 14/14 ACs re-checked to the extent touched by this cycle's fixes; AC-6, AC-8, AC-9, AC-10 move
from "defect present" to clean; AC-2, AC-7, AC-11 (audibility), AC-12, AC-13 (device feel) unchanged
needs-human gaps, not defects, not regressions.

**Bug count by severity/owner:** 0 open Critical/Major/Minor product bugs (BUG-1..5 all closed this cycle,
owner: frontend). 1 new Cosmetic bug (BUG-6, test-infra, non-blocking).

**Recommendation for orchestrator/ISSUES.md ledger:** BUG-1 through BUG-5 → move from IN-PROGRESS to **FIXED**
(resolved date 2026-07-23, verified by tester Cycle 2). ISS-01/02/03 → remain OPEN (human-playtest-only,
unchanged). BUG-6 → new entry, Cosmetic, owner frontend (or whoever owns repo tooling), non-blocking for ship.
