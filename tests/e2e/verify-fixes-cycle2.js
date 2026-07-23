/*
 * Cycle-2 fix verification smoke script (frontend agent, ad-hoc).
 * Not part of the tester's official harness — quick re-verification that
 * BUG-1..BUG-5 are fixed and the game still loads clean across all 3 stages.
 * Usage: node tests/e2e/verify-fixes-cycle2.js
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

  // --- Load/smoke check across all 3 stages, zero console errors ---
  for (const stage of [0, 1, 2]) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(`${FILE_URL}?autostart=1&stage=${stage}`);
    await page.waitForTimeout(300);
    const state = await page.evaluate(() => window.__game && window.__game.state);
    check(`LOAD stage=${stage} no console errors`, errors.length === 0, JSON.stringify(errors));
    check(`LOAD stage=${stage} state=playing`, state === 'playing', 'state=' + state);
    await page.close();
  }

  // --- BUG-1: score resets to 0 immediately on restart ---
  {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(`${FILE_URL}?autostart=1&stage=0`);
    await page.waitForTimeout(200);
    await page.evaluate(() => { window.__game.score = 6; window.__game.corn = 2; });
    await page.evaluate(() => { window.__game.killPlayer('car'); });
    await page.waitForTimeout(1800); // dying -> gameover
    const overState = await page.evaluate(() => window.__game.state);
    await page.evaluate(() => { window.__game.startRun(); });
    const afterRestart = await page.evaluate(() => ({
      score: window.__game.score, corn: window.__game.corn, row: window.__game.player.row, state: window.__game.state
    }));
    check('BUG-1 gameover reached before restart', overState === 'gameover', 'state=' + overState);
    check('BUG-1 score resets to 0 immediately on restart', afterRestart.score === 0, JSON.stringify(afterRestart));
    check('BUG-1 corn resets to 0 immediately on restart', afterRestart.corn === 0, JSON.stringify(afterRestart));
    check('BUG-1 row resets to 0 immediately on restart', afterRestart.row === 0, JSON.stringify(afterRestart));
    check('BUG-1 no console errors', errors.length === 0, JSON.stringify(errors));
    await page.close();
  }

  // --- BUG-2: bell cadence ~5 calls over a 1.0s warning window ---
  {
    const page = await browser.newPage();
    await page.goto(`${FILE_URL}?autostart=1&stage=2`);
    await page.waitForTimeout(200);
    const bellCount = await page.evaluate(async () => {
      const g = window.__game;
      const lane = g.lanes.find(l => l.type === 'rail' && l.train);
      if (!lane) return -1;
      let count = 0;
      const origBell = g.audio.bell.bind(g.audio);
      g.audio.bell = () => { count++; };
      lane.train.state = 'idle';
      lane.train.timer = 0.01;
      lane.train.warnDur = 1.0;
      await new Promise(r => setTimeout(r, 1300));
      g.audio.bell = origBell;
      return count;
    });
    check('BUG-2 bell fires ~5x (not ~87x) over 1.0s warn window', bellCount >= 4 && bellCount <= 7, 'count=' + bellCount);
    await page.close();
  }

  // --- BUG-3: garbage ?stage= param does not crash ---
  {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(`${FILE_URL}?autostart=1&stage=abc`);
    await page.waitForTimeout(300);
    const state = await page.evaluate(() => window.__game && window.__game.state);
    const stageVal = await page.evaluate(() => window.__game && window.__game.stage);
    check('BUG-3 no crash on ?stage=abc', errors.length === 0, JSON.stringify(errors));
    check('BUG-3 falls back to stage 0', stageVal === 0, 'stage=' + stageVal);
    check('BUG-3 state=playing', state === 'playing', 'state=' + state);
    await page.close();
  }

  // --- BUG-4: no buses in stage index 2 (Stage 3) across many regenerations ---
  {
    const page = await browser.newPage();
    await page.goto(`${FILE_URL}?autostart=1&stage=2`);
    await page.waitForTimeout(200);
    const kinds = await page.evaluate(() => {
      const g = window.__game;
      const found = new Set();
      for (let i = 0; i < 60; i++) {
        g._genLanes();
        for (const l of g.lanes) for (const v of (l.vehicles || [])) found.add(v.kind);
      }
      return [...found];
    });
    check('BUG-4 no bus kind spawns in Stage 3', !kinds.includes('bus'), 'kinds=' + JSON.stringify(kinds));
    await page.close();
  }

  // --- BUG-5: hops=N teleport hook reliably lands player alive ---
  {
    const combos = [];
    for (const stage of [0, 1, 2]) for (const hops of [3, 5, 8, 10, 15, 20]) combos.push([stage, hops]);
    let unsafe = 0;
    for (const [stage, hops] of combos) {
      const page = await browser.newPage();
      await page.goto(`${FILE_URL}?autostart=1&stage=${stage}&hops=${hops}`);
      await page.waitForTimeout(150);
      const state = await page.evaluate(() => window.__game.state);
      if (state !== 'playing') { unsafe++; console.log(`   -> unsafe combo stage=${stage} hops=${hops} state=${state}`); }
      await page.close();
    }
    check(`BUG-5 hops= hook lands safely in all ${combos.length} combos`, unsafe === 0, `${unsafe}/${combos.length} unsafe`);
  }

  await browser.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
})();
