# TEST REPORT #2 — Chicken Road (Stage 4, Cycle 2 — Re-verification)

**Tester:** tester agent | **Branch:** `feature/chicken-road` | **Date:** 2026-07-23
**Build under test:** single-file `index.html` (66,864 bytes at test time), tip of `feature/chicken-road`
(commit `484387f`, 5 fix commits on top of the Cycle-1 test-report commit `deef176`).
**Environment:** macOS (Darwin 25.4.0), Node v23.5.0, Playwright 1.61.1 driving headless Chromium 149. Same
local Playwright install reused from Cycle 1 (already present in `node_modules`, confirmed functional — see
Environment note below). No server/build step — file opened via `file://` per PRD constraint.

**Scope:** verify BUG-1..BUG-5 (all reported in `docs/TEST_REPORT_1.md`, fixed per
`docs/reports/stage4-frontend-fixes.md`) are genuinely fixed, re-run the Cycle-1 harness, and run a regression
sweep of core flows (restart/score, train timing, stage transitions, vehicle spawns, corn, mobile swipe, mute).

---

## 🟢 Scope / TODO checklist (posted at START, all items closed out below)

- [x] Checkout `feature/chicken-road`, confirm environment boots (no `npm ci` needed — no lock file, local
      `node_modules`/Playwright already present and functional; see Environment note)
- [x] Re-run `tests/e2e/run-tests.js` (Cycle-1 harness), confirm TC-AC10-03 and TC-BREAK-03 now PASS
- [x] Re-confirm TC-AC2-04, TC-AC2-07, TC-BREAK-01 are still harness artifacts, not new regressions
- [x] Independently reproduce & verify BUG-1 (score/corn/row/deathCause reset on restart) — pure real gameplay,
      no QA hooks, own script
- [x] Independently reproduce & verify BUG-2 (train bell ring rate) — own script, different window (1.4s vs
      frontend's 1.0s); caught and diagnosed a false-positive in my own first attempt (see BUG-2 section)
- [x] Independently reproduce & verify BUG-3 (`?stage=` garbage values) — 9 variants, not just `abc`
- [x] Independently reproduce & verify BUG-4 (buses Stage-2-only) — 100 regenerations x3 stages
- [x] Independently reproduce & verify BUG-5 (`hops=N` safe landing) — 36 combos, 700ms observation window
      (longer than frontend's 150ms, to catch delayed near-miss kills)
- [x] Regression sweep: repeated restart cycles, high-score logic, natural train play, stage transitions, stage
      clear at row 30, corn pickup, mobile swipe, mute toggle
- [x] Full per-test-case table + updated defect ledger written to `docs/TEST_REPORT_2.md`
- [x] ISS-01/02/03 re-confirmed as human-playtest-only, not closable this cycle

**Environment note:** no `package-lock.json` exists and `package.json` declares no `devDependencies`, so a
destructive `rm -rf node_modules && npm ci` was not performed (would fail — no lock file — and would not
reinstall Playwright, which isn't declared). This is a pre-existing test-infra gap carried over unchanged from
Cycle 1 (Cycle 1 also relied on an ad-hoc local Playwright install), not something introduced this cycle. It
does **not** affect the shipped product: `index.html` itself remains a zero-dependency, zero-build single file
(re-confirmed this cycle — TC-NET-01/02 below, 0 external references, 0 network requests). Flagged as a minor
test-infra hygiene note, not a product defect — see BUG-6.

---

## Test-case table

Legend — Type: `auto` (Playwright script, deterministic), `manual` (one-off Playwright investigation script,
result inspected by tester), `regression` (Cycle-2 sweep of previously-passing behavior), `needs-human`
(cannot be verified headlessly).

| TC ID | Test case | Maps to AC | Type | Expected | Result | Status |
|---|---|---|---|---|---|---|
| TC-LOAD-01 | Open `index.html`, capture console/page errors | AC-1, AC-14 | auto | 0 errors | 0 errors | PASS |
| TC-LOAD-02 | Initial `game.state` on load | AC-1 | auto | `'title'` | `'title'` | PASS |
| TC-NET-01 | Network requests during load+idle | AC-14 | auto | `[]` | `[]` | PASS |
| TC-AC14-01 | Regex-scan for all 12 required classes | AC-14 | auto | all present | all present | PASS |
| TC-AC1-01 | Space on title | AC-1 | auto | `state→'playing'` | matched | PASS |
| TC-AC2-01 | ArrowUp hop row delta | AC-2 | auto | row +1 | 0→1 | PASS |
| TC-AC2-02 | Forward hop to new furthest → score increases | AC-2, AC-8 | auto | increases | 0→1 | PASS |
| TC-AC2-03 | ArrowDown hop row delta | AC-2 | auto | row −1 | 5→4 (via `hops=5` hook) | PASS |
| TC-AC2-04 | Backward hop after `hops=5` hook does not increase score (harness-driven, as scripted in `run-tests.js`) | AC-2 | auto | score unchanged | score 0→5 | **FAIL (re-confirmed harness artifact, not new)** |
| TC-AC2-04-ARTIFACT | Root-cause re-check: `hops=5` hook sets `row=5, furthest=5, score=0` directly (no sync); first subsequent hop (any direction) recomputes `score=furthest=5` at landing | AC-2 | manual | confirms hook/real-play mismatch, not a scoring defect | `{row:5, score:0, furthest:5}` immediately post-hook, confirmed | PASS (explains the FAIL above as non-defect) |
| TC-AC2-05 | Spam ArrowLeft at left wall | AC-2 | auto | `col≥0` | `col=0` | PASS |
| TC-AC2-06 | Spam ArrowRight at right wall | AC-2 | auto | `col≤6` | `col=6` | PASS |
| TC-AC2-07 | 5× ArrowUp at 40ms intervals → hop count | AC-2 | auto | matches single-slot buffer math | delta=2, matches Cycle-1 hand-traced expectation exactly | **FAIL (re-confirmed harness artifact, not new — see note)** |
| TC-AC2-08 | Obstacle collision code present | AC-2 | manual (static) | present | present | PASS |
| TC-STAGE-01/02/03 | `?stage=0/1/2` hook loads each stage, no errors | AC-9 | auto | matches, 0 errors | matched, 0 errors | PASS |
| TC-HOOK-clear/victory/over | `&screen=` hooks force correct state | dev tooling | auto | matched | matched | PASS |
| TC-AC8-01 | HUD fields exist during play | AC-8 | auto | all defined | `{score:0,corn:0,stage:0}` | PASS |
| TC-AC8-02 | Corn spawns on lanes | AC-8 | auto | found | found | PASS |
| TC-AC10-01 | `killPlayer('car')` → gameover | AC-10 | auto | `state='gameover'` | matched | PASS |
| TC-AC10-02 | Restart (Space) from Game Over → `playing` | AC-10 | auto | matched | matched | PASS |
| **TC-AC10-03** | **Restart → `score` resets to 0 (harness assertion)** | **AC-10** | **auto** | **`score===0`** | **`score=0`** | **PASS (was FAIL in Cycle 1 as TC-AC10-04; now fixed)** |
| TC-AC10-04 | High score unchanged when new run scores lower | AC-10 | auto | unchanged | unchanged (50) | PASS |
| TC-AC11-01 | `M` toggles mute | AC-11 | auto | flips | `false→true` | PASS |
| TC-AC11-02 | AudioContext resumes on first input | AC-11 | auto | `→'running'` | `null→'running'` | PASS |
| TC-AC13-01 | Mobile swipe-up hops forward | AC-13 | auto | row+1 | 0→1 | PASS |
| TC-AC13-02 | Mobile viewport, 0 console errors | AC-13 | auto | 0 errors | 0 errors | PASS |
| TC-AC13-03 | 360×640 viewport renders canvas | AC-13 | auto | non-zero | `360×617` | PASS |
| TC-AC13-04 | 1920×1080 viewport letterboxes, aspect preserved | AC-13 | auto | within tolerance | `630×1080` = target | PASS |
| TC-BREAK-01 | Reload page mid-run with `?autostart&hops=15` still in URL | destructive | auto | (mis-specified expectation, see note) | `state='playing'` after reload (hook re-fires; query persists across reload, this is browser behavior) | **FAIL (re-confirmed harness artifact, not new — see note)** |
| TC-BREAK-01-ARTIFACT | Corrected retest: real keyboard play (no query params) → `page.reload()` | destructive | manual | `state='title'`, 0 errors | `state='title'`, confirmed | PASS (explains the FAIL above as non-defect) |
| TC-BREAK-02 | `visibilitychange` mid-run, wait 2.5s | destructive | auto | no crash | 0 page errors | PASS |
| **TC-BREAK-03** | **Malformed URL params `?autostart=1&stage=abc&hops=-99&screen=bogus`** | **destructive** | **auto** | **no uncaught exception** | **0 page errors** | **PASS (was FAIL in Cycle 1; now fixed)** |
| TC-BREAK-04 | Rapid triple-press Space on title | destructive | auto | stable `playing`, no error | matched | PASS |
| TC-VERIFY-1 | Frontend's own `verify-fixes-cycle2.js` full run (17 checks: 3-stage load smoke + BUG-1..5) | BUG-1..5 | auto | 17/17 pass | **17/17 pass** | PASS |
| **TC-BUG1-01** | Independent BUG-1 repro (own script): pure real gameplay — 6 real ArrowUp hops (score=3, some hops dropped by buffer window, non-zero regardless), forced `killPlayer('car')`, wait for Game Over, restart, read `score/corn/row/state` in the very next `evaluate()` call (no extra wait) | AC-10 | manual (independent) | `score=0` immediately | `{state:'playing', score:0, row:0, corn:0}`, 0 page errors | **PASS — BUG-1 FIXED** |
| TC-BUG1-02 | Death-cause also clears (frontend claimed this was fixed alongside BUG-1, not originally reported by tester — verify no leak) | AC-10 (adjacent) | manual (independent) | `deathCause` null/cleared after restart, not stale `'water'` | before restart: `'water'`; immediately after restart: `null` | PASS |
| TC-BUG2-01 | Independent BUG-2 repro attempt #1 (own script, 1.4s warn window, global `audio.bell` override) | AC-6, AC-11 | manual (independent) | ~7 rings ±2 | **11 rings** — initially looked like still-failing | **FALSE POSITIVE, see TC-BUG2-02** |
| TC-BUG2-02 | Root-cause dig on TC-BUG2-01: per-call timestamp+blink log revealed non-monotonic `blinkIdx` repeats, tracked to **7 concurrent rail lanes on Stage 3** (`weights.rail=0.26` — high density) each running independent `Train` instances sharing the same `audio.bell()` hook — other trains entering `warn` on their own timers during my 1.6s window rang their own bells into my counter | AC-6, AC-11 | manual (independent) | — | confirmed 7 rail lanes with trains on stage index 2 at boot | Diagnostic (test-script bug in my own harness, not product) |
| **TC-BUG2-03** | Corrected BUG-2 repro: same 1.4s warn window, but all *other* trains on the stage are parked (`timer=9999`) so only the target train can ring; log every bell call's `blink` value + `Math.floor(blink/0.2)` index | AC-6, AC-11, DESIGN §4.4 | manual (independent, isolated) | exactly one ring per blink-index transition, indices strictly monotonic 0,1,2,...,7 (no repeats) over 1.4s | indices `[0,1,2,3,4,5,6,7]`, **8 calls, all monotonic, zero repeats** | **PASS — BUG-2 FIXED** |
| TC-BUG3-01 | Independent BUG-3 repro: 9 non-numeric `?stage=` variants (`abc`, `NaN`, empty, `%%`, `1e999`, `null`, `undefined`, `3.5.5`, `--1`), each in its own fresh page/context | AC-14 hygiene, BUG-3 spec | manual (independent) | no uncaught exception for any variant; falls back to a valid stage 0-2 | 0 errors across all 9; stage values `{0,0,0,0,1,0,0,2,0}` — all in valid `[0,2]` range, no crash | **PASS — BUG-3 FIXED** |
| TC-BUG4-01 | Independent BUG-4 repro: 100 lane regenerations × each of stage 0/1/2 (vs. frontend's 60×1) | AC-9, DESIGN §4.2 | manual (independent) | `bus` only in stage index 1 | stage0=`{car,truck}`, stage1=`{car,bus,truck}`, stage2=`{car,truck}` | **PASS — BUG-4 FIXED** |
| TC-BUG5-01 | Independent BUG-5 repro: 36 combos (3 stages × 12 hop counts, different set than frontend's), **700ms** observation window (vs. frontend's 150ms, to catch delayed near-miss kills as frontend's own writeup warned was a real failure mode of a narrower fix) | AC-2, BUG-5 spec | manual (independent) | `state==='playing'` in all 36 | **36/36 safe, 0 unsafe** | **PASS — BUG-5 FIXED** |
| TC-REG-01 | Regression: 3× repeated death→restart cycles in one session, `score/corn/row` all reset to 0 every time | AC-10 | regression | all 3 cycles reset cleanly | `[{0,0,0,playing},{0,0,0,playing},{0,0,0,playing}]`, 0 errors | PASS |
| TC-REG-02 | Regression: high score unaffected by a lower run, updates on a higher run, across the now-fixed restart path | AC-10 | regression | `50→50→80` | `hsLower=50, hsHigher=80` | PASS |
| TC-REG-03 | Regression: natural (non-forced) 4s of Stage-3 gameplay, no console errors, bell count not absurd | AC-6, AC-11 | regression | 0 errors, bell count sane (not ~87/s ≈ 350 over 4s) | 0 errors, `bellTotal=17` over 4s (plausible for multiple trains naturally cycling) | PASS |
| TC-REG-04 | Regression: `?stage=0/1/2` hook still loads correct stage/state | AC-9 | regression | matches | all 3 matched | PASS |
| TC-REG-05 | Regression: real progression to row 30 (Stage 1) → `stageclear` | AC-9 | regression | `state='stageclear'` | matched, 0 errors | PASS |
| TC-REG-06 | Regression: corn pickup still increments `corn` | AC-8 | regression | increases | `0→1` | PASS |
| TC-REG-07 | Regression: mobile swipe-up still hops forward | AC-13 | regression | row+1 | `0→1` | PASS |
| TC-REG-08 | Regression: mute toggle still flips `audio.muted` | AC-11 | regression | flips | `false→true` | PASS |
| TC-AC11-05 | Real audibility on real speakers | AC-11 | needs-human | audible, balanced | cannot verify headlessly | BLOCKED — needs human (unchanged from Cycle 1) |
| TC-AC12-03 | Sustained ~60fps on real display | AC-12 | needs-human | stable 60fps | cannot verify headlessly | BLOCKED — needs human (unchanged from Cycle 1) |
| TC-AC13-05 | Real physical touch device feel | AC-13 | needs-human | swipes register reliably | cannot verify headlessly | BLOCKED — needs human (unchanged from Cycle 1) |
| TC-AC2-FEEL | Subjective hop crispness / juice | AC-2, ISS-01 | needs-human | feels instant + satisfying | cannot verify by script | BLOCKED — needs human (unchanged from Cycle 1) |
| TC-AC7-FEEL | Camera-push tension / eagle dread | AC-7, ISS-01 | needs-human | feels escalating | cannot verify by script | BLOCKED — needs human (unchanged from Cycle 1) |

**Note on TC-AC2-04 / TC-AC2-07 / TC-BREAK-01:** these 3 rows are the exact same test-harness-artifact cases
identified and root-caused in Cycle 1 (`docs/TEST_REPORT_1.md`, asterisked rows). They fail *as scripted* in
`run-tests.js` because the harness script itself either (a) uses the `hops=` teleport QA hook in a way that
doesn't match real play (TC-AC2-04), (b) asserts a hop-count floor that doesn't match the by-design single-slot
input buffer window (TC-AC2-07), or (c) reloads a URL that still carries `?autostart&hops=`, which correctly
re-fires the autostart hook per browser reload semantics (TC-BREAK-01). All three were independently re-traced
this cycle (rows `TC-AC2-04-ARTIFACT`, `TC-AC2-07`'s own note, `TC-BREAK-01-ARTIFACT`) with the same root cause
as Cycle 1, confirming these are unchanged, pre-existing harness limitations — **not new regressions** and not
counted as product defects in the tallies below.

### Counts

- **Total distinct test cases logged this cycle:** 47
- **PASS:** 39 (includes 3 rows that explain/close out a "FAIL as scripted" row as a non-defect)
- **FAIL (harness artifact, re-confirmed non-defect, same as Cycle 1):** 3 (TC-AC2-04, TC-AC2-07, TC-BREAK-01)
- **FAIL (real product defect):** 0
- **Diagnostic/self-correcting (my own script's false positive, resolved same session):** 1 (TC-BUG2-01, superseded by TC-BUG2-03 PASS)
- **BLOCKED (needs human, unchanged from Cycle 1):** 5
- **SKIPPED:** 0

Combined with the frontend's own `verify-fixes-cycle2.js` (17/17 pass, independently re-run by me and matched)
and my 5 independent bug-specific repro scripts (all PASS), **every one of BUG-1..BUG-5 is confirmed fixed by
at least two independent methods** (frontend's regression script + my from-scratch repro).

---

## AC coverage summary (Cycle 2 delta vs. Cycle 1)

| AC | Cycle 1 | Cycle 2 | Notes |
|---|---|---|---|
| AC-1 Boot & title | Full | Full | unchanged, PASS |
| AC-2 Hop movement & feel | Partial (mechanics PASS, feel needs-human) | Partial (unchanged) | mechanics re-confirmed via regression sweep |
| AC-3..AC-5 | Full | Full | not re-walked in full this cycle (no code touched here per fix report); no regression signal found |
| AC-6 Railway lane | Full, with BUG-2 | **Full, BUG-2 fixed** | independently re-verified with isolated single-train script |
| AC-7 Camera & eagle | Partial (needs-human tension) | Partial (unchanged) | not touched by fixes; no regression signal |
| AC-8 Corn pickups & scoring | Full, with BUG-1 | **Full, BUG-1 fixed** | independently re-verified, plus 3x repeat-cycle regression |
| AC-9 Stages & stage-clear | Full, with BUG-4 | **Full, BUG-4 fixed** | independently re-verified at 100x sample per stage; stage-clear regression re-run |
| AC-10 Death, game over & restart | **Partial — FAILING (BUG-1)** | **Full** | BUG-1 fixed and independently confirmed; death-cause reset also verified |
| AC-11 Audio | Partial, with BUG-2 | Partial (BUG-2 fixed; audibility still needs-human) | |
| AC-12 Performance & delta-time | Partial (needs-human) | Partial (unchanged) | not touched by fixes |
| AC-13 Mobile/touch | Partial (needs-human device feel) | Partial (unchanged) | mechanics re-confirmed via regression sweep |
| AC-14 Code structure | Full | Full | unchanged |
| — QA/dev tooling (`?stage=`, `hops=N`) | FAILING (BUG-3, BUG-5) | **Fixed** | independently re-verified, wider samples than frontend's own tests |

No AC regressed. AC-6, AC-8, AC-9, AC-10 move from "Full/Partial, with defect" to clean "Full" this cycle.
AC-2, AC-7, AC-11 (audibility), AC-12, AC-13 (device feel) remain exactly where Cycle 1 left them — needs-human
gaps that no amount of headless automation can close, not defects.

---

## 🟠 Defect status — BUG-1..BUG-5

| ID | Cycle-1 severity | Fix commit | Cycle-2 verdict | Evidence |
|---|---|---|---|---|
| **BUG-1** | Major | `322b8cf` | **FIXED** | `TC-BUG1-01`/`02`, `TC-REG-01`/`02` — score/corn/row/deathCause all reset to 0/null immediately on restart across 3 repeated real-gameplay cycles, 0 console errors. Screenshot: `docs/reports/screenshots/cycle2-bug1-score-reset-fixed.png` (HUD reads "SCORE 0" right after restart). |
| **BUG-2** | Major | `120932e` | **FIXED** | `TC-BUG2-03` (isolated single-train instrumentation): bell fires exactly once per 200ms blink index, 8 calls over a 1.4s window, indices strictly `0,1,2,...,7`, zero repeats. My first pass (`TC-BUG2-01`, global un-isolated hook) produced a false "still-failing" 11-count reading — root-caused to **my own test script** not accounting for Stage 3's 7 concurrent rail lanes each independently entering `warn` on their own timers and sharing the same `audio.bell()` hook (test-methodology artifact, disclosed for transparency, not a product defect). `TC-REG-03` (natural, unforced 4s play) confirms bell volume stays sane (17 rings, nowhere near the original ~87/s spam rate). |
| **BUG-3** | Minor | `ce5553a` | **FIXED** | `TC-BUG3-01` — 9 non-numeric `?stage=` variants (broader than the original single `abc` repro), 0 uncaught exceptions in any, all fall back to a valid stage index in `[0,2]`. `TC-BREAK-03` (original harness repro combining `stage=abc&hops=-99&screen=bogus`) also now PASSes. |
| **BUG-4** | Minor | `8ca090f` | **FIXED** | `TC-BUG4-01` — 100 lane regenerations on each of Stage 1/2/3 (vs. frontend's 60x on Stage 3 only): `bus` kind appears **only** in stage index 1 (Stage 2); Stage 1 and Stage 3 both show only `car`/`truck` across 100 samples each. No regression — buses still spawn correctly in Stage 2. |
| **BUG-5** | Minor | `ce5553a` | **FIXED** | `TC-BUG5-01` — 36 stage×hop combos (different hop-count set than frontend's 18), observed with a **700ms** window (4.6x longer than frontend's 150ms, specifically to catch the "near-miss vehicle closes the gap a few frames later" failure mode the fix report itself called out as the reason a narrower first attempt was flaky): **0/36 unsafe landings.** |

**ISS-01 (game feel), ISS-02 (audio audibility remainder), ISS-03 (touch feel remainder):** re-confirmed this
cycle as **still OPEN and inherently un-closable by automation** — they require a human playtester with ears/a
physical touchscreen. Nothing in this cycle's fixes or regression sweep changes their status; they are **not**
new blockers introduced by this fix cycle, and were already correctly excluded from Cycle 1's FAIL tally as
"needs-human," not silently passed.

### New defects found this cycle

**BUG-6 — Test-infra: no `package-lock.json` / no declared `devDependencies` for the Playwright harness**
- **Severity:** Cosmetic (test-infra hygiene only, zero product impact)
- **Owner:** frontend (or whoever owns `package.json` for this repo) — **not a code-under-test defect**, does
  not affect `index.html`, does not block Stage 5 shipping.
- **Detail:** `package.json` has no `devDependencies` entry and there is no `package-lock.json`, yet
  `node_modules/playwright` is present and functional (confirmed working throughout this cycle and Cycle 1). A
  clean-room `npm ci` would fail (no lock file to install from); a clean-room `npm install` would not restore
  Playwright (not declared). This predates Cycle 2 — it was already the state of the repo when Cycle 1's
  harness was authored — so it is **not a regression**, just an untracked gap in the QA tooling's own
  reproducibility.
- **Suggested fix:** add `playwright` (and `@playwright/test` if desired) to `devDependencies` and commit a
  `package-lock.json`, so `npm ci` reproduces the test environment for future cycles. Purely a QA-tooling
  nice-to-have; the shipped game itself remains a zero-dependency single file (re-verified: `TC-NET-01`, 0
  external network requests).

---

## Screenshots (evidence, added this cycle)

`docs/reports/screenshots/cycle2-bug1-score-reset-fixed.png` — HUD showing "SCORE 0" immediately after restart
following a 6-hop / score-3 run and forced death, confirming BUG-1's fix visually (in addition to the
programmatic `TC-BUG1-01` evidence above).

---

## ✅ Verdict

**PASS** — all 5 Cycle-1 defects (BUG-1..BUG-5) independently confirmed fixed, by two separate methods each
(frontend's own regression script, re-run and matched, plus my own from-scratch repro scripts using different
parameters/sample sizes/observation windows than frontend used). Zero new product defects found in the
regression sweep across restart/score, train timing (both forced and natural play), stage transitions, stage
clear, corn pickup, mobile swipe, and mute. The 3 rows that still show FAIL in the raw `run-tests.js` output
(`TC-AC2-04`, `TC-AC2-07`, `TC-BREAK-01`) are the same pre-existing harness artifacts identified, root-caused,
and closed out as non-defects in Cycle 1 — re-verified this cycle to have the identical root cause, not a new
regression. One new Cosmetic, non-blocking test-infra note (BUG-6) is logged for future QA-tooling hygiene but
does not affect the shipped product.

**Ready for Stage 5 (ship): YES.**

**Caveats (not blockers):** ISS-01 (game feel), the audibility remainder of ISS-02, and the touch-feel
remainder of ISS-03 remain OPEN and require a human playtester — they were correctly excluded from both
cycles' FAIL tallies as inherently non-automatable, not silently passed, and do not block shipping per the
Cycle-1 recommendation. Recommend a human playtest pass post-ship (or pre-ship if the team wants extra
confidence) to close these out, but they are not release blockers on their own.

**Test-case counts this cycle:** 47 executed / 39 passed / 0 failed (real defects) / 3 failed-as-scripted
(harness artifacts, re-confirmed non-defects) / 1 self-corrected diagnostic / 5 blocked (needs-human,
unchanged) / 0 skipped.
