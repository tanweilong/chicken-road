# Issue Ledger — chicken-road

Durable record of every issue found. Statuses: OPEN → IN-PROGRESS → FIXED (or WON'T-FIX + reason).

| ID | Description | Severity | Owner | Status | Found | Resolved |
|----|-------------|----------|-------|--------|-------|----------|
| BUG-1 | `score` not reset to 0 on restart — stale score persists (AC-10) | Major | frontend | FIXED (`322b8cf`, verified Cycle 2) | 2026-07-23 | 2026-07-23 |
| BUG-2 | Train warning bell fires ~87× instead of ~5× per warning | Major | frontend | FIXED (`120932e`, verified Cycle 2) | 2026-07-23 | 2026-07-23 |
| BUG-3 | QA hook crashes on non-numeric `?stage=abc` | Minor | frontend | FIXED (`ce5553a`, verified Cycle 2) | 2026-07-23 | 2026-07-23 |
| BUG-4 | Buses spawn in Stage 3 (spec: Stage 2 only) | Minor | frontend | FIXED (`8ca090f`, verified Cycle 2) | 2026-07-23 | 2026-07-23 |
| BUG-5 | `hops=N` QA hook teleports onto occupied hazard tiles | Minor | frontend | FIXED (`ce5553a`, verified Cycle 2) | 2026-07-23 | 2026-07-23 |
| BUG-6 | Test harness has no `package-lock.json` / declared devDependencies — clean-room `npm ci` for the QA scripts would fail | Cosmetic | frontend | WON'T-FIX (dev-tooling only; shipped `index.html` is zero-dependency/zero-network — does not affect product) | 2026-07-23 | 2026-07-23 |
| ISS-01 | Game feel (hop crispness, camera tension, death punch) — #1 brief priority, needs human playtest | Major | frontend | OPEN (human-playtest only) | 2026-07-23 | — |
| ISS-02 | Audio audibility + mute across desktop/mobile (AC-11) needs real-device verify | Minor | frontend | OPEN (human-playtest only) | 2026-07-23 | — |
| ISS-03 | Touch/swipe on a real device (AC-13); 24px swipe threshold may need tuning | Minor | frontend | OPEN (human-playtest only) | 2026-07-23 | — |
| ISS-04 | Canvas centering/crispness on real screens | Minor | tester | FIXED | 2026-07-23 | 2026-07-23 |

<!-- Stage 4 complete after 2 cycles: BUG-1..5 fixed & verified. BUG-6 cosmetic dev-tooling, won't-fix (not shipped). ISS-01/02/03 are human-playtest caveats, not ship blockers. No Critical/Major issue ships OPEN except ISS-01 which is inherently a human-judgement item, surfaced to the user. -->
