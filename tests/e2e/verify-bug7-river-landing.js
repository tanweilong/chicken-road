/*
 * BUG-7 regression check (frontend agent, ad-hoc — same pattern as
 * verify-fixes-cycle2.js): "hard to jump on the wood or the leaves."
 *
 * Root cause: Log.carries(px) had ZERO forgiveness margin
 * (`Math.abs(px - this.x) < this.w/2`), unlike Vehicle.hits(px) which already
 * adds a +12 margin for the death check. Because the player always lands
 * snapped to a tile's exact column-center (colCenterX) while logs/pads drift
 * continuously, a lily pad (w=40, narrower than TILE=48) parked near a tile
 * boundary was a MATHEMATICALLY GUARANTEED miss (up to 24px offset > 20px
 * tolerance) even with pixel-perfect human timing. Compounded by Game.update()
 * calling player.update(dt) (which resolves the landing check) BEFORE
 * lane.update(dt) advanced that frame's log positions, so the check ran
 * against a one-frame-stale log/pad location.
 *
 * Fix: (1) Log.carries() now adds LOG_LANDING_MARGIN (14px, matching/
 * exceeding the vehicle danger-check's forgiveness), (2) Game.update()'s
 * PLAYING branch now advances lanes before the player each frame so the
 * landing/carry check always reads the current frame's real log position.
 *
 * Usage: node tests/e2e/verify-bug7-river-landing.js
 */
const { chromium } = require('playwright');
const path = require('path');

const FILE_URL = 'file://' + path.resolve(__dirname, '../../index.html');
let pass = 0, fail = 0;

function check(name, cond, detail) {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { fail++; console.log(`FAIL  ${name}${detail ? ' — ' + detail : ''}`); }
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(`${FILE_URL}?autostart=1&stage=0`);
  await page.waitForTimeout(200);

  // --- 1. Worst-case tile-boundary lily pad: pre-fix this was a guaranteed
  //     miss for BOTH neighboring columns (24px offset > old 20px tolerance).
  {
    const r = await page.evaluate(() => {
      const g = window.__game;
      g.player.dead = false; g.player.hopping = false; g.player.ridingLog = null;
      g.player.row = 5; g.player.x = colCenterX(3);
      const grass = new Lane(g, 5, 'grass');
      const river = new Lane(g, 6, 'river');
      const boundaryX = colCenterX(3) + 24; // exactly between col3 and col4 centers
      const pad = new Log(boundaryX, 0, 1, 40, { logDark:'#000', logBody:'#111', logHi:'#222' }, true);
      river.logs.push(pad);
      g.lanes[5] = grass; g.lanes[6] = river;
      g.player.tryHop('up');
      for (let i = 0; i < 12 && g.player.hopping; i++) g.update(1/60);
      g.update(1/60);
      return { dead: g.player.dead, ridingLog: !!g.player.ridingLog };
    });
    check('BUG-7 worst-case tile-boundary pad landing succeeds', !r.dead && r.ridingLog, JSON.stringify(r));
  }

  // --- 2. Perfectly-timed jumps onto narrow pads and wide logs across all
  //     3 stages' log speed ranges should always succeed (sanity baseline).
  {
    const scenarios = [
      { width: 40, isPad: true,  speed: 26 },  // stage1 pad, slow
      { width: 40, isPad: true,  speed: 44 },  // stage1 pad, fast
      { width: 40, isPad: true,  speed: 70 },  // stage2 pad, fast
      { width: 72, isPad: false, speed: 70 },  // stage2 log, fast
    ];
    let allOk = true;
    const details = [];
    for (const sc of scenarios) {
      const r = await page.evaluate(async ({ width, isPad, speed }) => {
        const g = window.__game;
        g.player.dead = false; g.player.hopping = false; g.player.ridingLog = null;
        g.player.row = 5; g.player.x = colCenterX(3);
        const grass = new Lane(g, 5, 'grass');
        const river = new Lane(g, 6, 'river');
        const targetX = colCenterX(3);
        const bestT = 0.31; // arbitrary phase; log placed so it aligns at bestT
        const startX = targetX - speed*bestT;
        const log = new Log(startX, speed, 1, width, { logDark:'#000', logBody:'#111', logHi:'#222' }, isPad);
        river.logs.push(log);
        g.lanes[5] = grass; g.lanes[6] = river;
        const STEP = 1/60; let t = 0;
        while (t + STEP <= bestT) { g.update(STEP); t += STEP; }
        if (bestT - t > 0) g.update(bestT - t);
        g.player.tryHop('up');
        for (let i = 0; i < 20 && g.player.hopping; i++) g.update(1/60);
        for (let i = 0; i < 3; i++) g.update(1/60);
        return { dead: g.player.dead, ridingLog: !!g.player.ridingLog };
      }, sc);
      if (r.dead || !r.ridingLog) allOk = false;
      details.push(`w${sc.width}${sc.isPad?'pad':'log'}@${sc.speed}=${r.dead?'DEAD':(r.ridingLog?'OK':'??')}`);
    }
    check('BUG-7 perfectly-timed jumps land on all pad/log/speed combos', allOk, details.join(', '));
  }

  // --- 3. Regression guard: true open water (no log/pad at all) must still
  //     be lethal — the fix must not make water universally safe.
  {
    const r = await page.evaluate(() => {
      const g = window.__game;
      g.player.dead = false; g.player.hopping = false; g.player.ridingLog = null;
      g.player.row = 5; g.player.x = colCenterX(3);
      const grass = new Lane(g, 5, 'grass');
      const river = new Lane(g, 6, 'river'); // no logs at all
      g.lanes[5] = grass; g.lanes[6] = river;
      g.player.tryHop('up');
      for (let i = 0; i < 12 && g.player.hopping; i++) g.update(1/60);
      g.update(1/60);
      return { dead: g.player.dead, deathKind: g.player.deathKind };
    });
    check('BUG-7 regression: true open water still kills', r.dead && r.deathKind === 'water', JSON.stringify(r));
  }

  check('BUG-7 no console errors', errors.length === 0, JSON.stringify(errors));

  await browser.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
})();
