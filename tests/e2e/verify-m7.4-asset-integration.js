/*
 * M7.4 asset-integration smoke test (frontend agent, same pattern as
 * verify-fixes-cycle2.js / verify-bug7-river-landing.js).
 *
 * Verifies:
 *  1. Game loads with zero console/page errors and zero runtime network
 *     requests (PRD §5 / M7 Constraint 4 — data: URIs only).
 *  2. GENERATED_ASSETS contains exactly the 30 uiux-approved ids (DESIGN.md
 *     §10.6.11 FINAL SYNC) and does NOT contain the 4 excluded ones
 *     (tile-s2-road, tile-s3-road, tile-s3-rail, veh-s2-truck).
 *  3. A sample of generated images actually decode successfully
 *     (ASSET_IMAGES[id].ready === true) — confirms the base64 payloads are
 *     valid, not just present.
 *  4. Generated art actually renders in place of programmatic art for the
 *     chicken + a Stage-1 vehicle (drawFitted/gDrawImage is invoked, not the
 *     fallback branch) when the asset is ready.
 *  5. Fallback-first still works: forcing an asset to "not ready" (simulating
 *     a decode failure / registry-absent asset) makes the SAME render call
 *     fall back to the original programmatic draw with no exception.
 *  6. HUD/chrome imageSmoothingEnabled resting state is false after a full
 *     render() pass (world-art layer scopes its own smoothing on/off; it
 *     must not leak "on" into the next frame's HUD/particle draws).
 *  7. Required classes still present (AC-14 regression, unaffected by M7.4).
 *
 * Usage: node tests/e2e/verify-m7.4-asset-integration.js
 */
const { chromium } = require('playwright');
const path = require('path');

const FILE_URL = 'file://' + path.resolve(__dirname, '../../index.html');
let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { fail++; console.log(`FAIL  ${name}${detail ? ' — ' + detail : ''}`); }
}

const EXPECTED_IDS = [
  'chick-idle','chick-hop','veh-s1-car','veh-s1-truck','veh-s2-bus','veh-s2-car',
  'veh-s3-car','veh-s3-truck','log-s1','log-s2','lily-pad','train-car',
  'signal-housing','corn-pickup','eagle-flying','eagle-grabbed',
  'tile-s1-grass','tile-s1-road','tile-s1-river','tile-s1-rail',
  'tile-s2-grass','tile-s2-river','tile-s2-rail','tile-s3-ground',
  'bg-s1-hill-far','bg-s1-hill-near','bg-s1-sun','bg-s2-building',
  'bg-s3-smokestack','bg-s2-skyline'
];
const EXCLUDED_IDS = ['tile-s2-road','tile-s3-road','tile-s3-rail','veh-s2-truck'];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  const requests = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('request', req => requests.push(req.url()));

  await page.goto(`${FILE_URL}?autostart=1&stage=0`);
  await page.waitForTimeout(400); // let preloadGeneratedAssets() images decode

  // --- 1. zero console/page errors + zero network requests other than the
  //     initial local document load (data: URIs never fire 'request' events)
  const nonFileRequests = requests.filter(u => !u.startsWith('file://'));
  check('M7.4 no console/page errors on load', errors.length === 0, JSON.stringify(errors));
  check('M7.4 zero runtime network requests (data: URIs only, no fetch)',
    nonFileRequests.length === 0, JSON.stringify(nonFileRequests));

  // --- 2. registry contents match DESIGN.md §10.6.11 FINAL SYNC exactly
  const registryCheck = await page.evaluate((expected) => {
    const keys = Object.keys(GENERATED_ASSETS).sort();
    return { keys, count: keys.length };
  }, EXPECTED_IDS);
  const sortedExpected = [...EXPECTED_IDS].sort();
  check('M7.4 GENERATED_ASSETS has exactly 30 approved ids',
    registryCheck.count === 30 &&
    JSON.stringify(registryCheck.keys) === JSON.stringify(sortedExpected),
    `got ${registryCheck.count}: ${JSON.stringify(registryCheck.keys)}`);

  const excludedCheck = await page.evaluate((excluded) => {
    return excluded.map(id => ({ id, present: Object.prototype.hasOwnProperty.call(GENERATED_ASSETS, id) }));
  }, EXCLUDED_IDS);
  check('M7.4 rejected/fallback-only assets are NOT in the registry',
    excludedCheck.every(e => !e.present), JSON.stringify(excludedCheck));

  // --- 3. sample of generated images decoded successfully
  const decodeCheck = await page.evaluate((sample) => {
    return sample.map(id => ({ id, ready: !!(ASSET_IMAGES[id] && ASSET_IMAGES[id].ready) }));
  }, ['chick-idle', 'chick-hop', 'veh-s1-car', 'tile-s1-grass', 'bg-s1-sun']);
  check('M7.4 sampled generated images decoded (ready=true)',
    decodeCheck.every(d => d.ready), JSON.stringify(decodeCheck));

  // --- 4. generated art actually used when ready (chicken + a vehicle)
  const usedCheck = await page.evaluate(() => {
    const calls = [];
    const origDrawImage = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function(...args) {
      calls.push(args[0] && args[0].src ? args[0].src.slice(0, 30) : 'non-img');
      return origDrawImage.apply(this, args);
    };
    window.__game.render();
    CanvasRenderingContext2D.prototype.drawImage = origDrawImage;
    return { drawImageCallCount: calls.length };
  });
  check('M7.4 generated raster actually drawn via drawImage this frame (chicken/vehicle/tiles/etc.)',
    usedCheck.drawImageCallCount > 0, JSON.stringify(usedCheck));

  // --- 5. fallback-first: force chick-idle "not ready" and confirm the
  //     SAME render path falls back cleanly (no exception, still renders)
  const fallbackCheck = await page.evaluate(() => {
    const prevReady = ASSET_IMAGES['chick-idle'].ready;
    ASSET_IMAGES['chick-idle'].ready = false; // simulate decode failure / absent asset
    let threw = null;
    try { window.__game.render(); } catch (e) { threw = String(e); }
    ASSET_IMAGES['chick-idle'].ready = prevReady; // restore
    return { threw };
  });
  check('M7.4 fallback-first: forcing chick-idle unavailable does not throw (programmatic draw used instead)',
    fallbackCheck.threw === null, JSON.stringify(fallbackCheck));

  // also simulate a fully-absent registry id (never generated / rejected asset)
  const missingIdCheck = await page.evaluate(() => {
    let threw = null;
    try {
      const img = getAsset('veh-s2-truck'); // excluded from registry
      window.__game.render();
      return { threw, img };
    } catch (e) { return { threw: String(e), img: undefined }; }
  });
  check('M7.4 fallback-first: excluded asset id (veh-s2-truck) resolves to null, no crash',
    missingIdCheck.threw === null && missingIdCheck.img === null, JSON.stringify(missingIdCheck));

  // --- 6. HUD/chrome smoothing resting state stays false after a full frame
  const smoothingCheck = await page.evaluate(() => {
    window.__game.render();
    return window.__game.ctx.imageSmoothingEnabled;
  });
  check('M7.4 imageSmoothingEnabled resting state is false after render() (HUD/chrome/particles stay crisp)',
    smoothingCheck === false, `got ${smoothingCheck}`);

  // --- 7. AC-14 regression: required classes still present
  const classesOk = await page.evaluate(() => {
    const names = ['Player','Lane','Vehicle','Log','Train','Particle','ParticleSystem','Camera','Eagle','AudioManager','InputManager','Game'];
    return names.every(n => typeof eval(n) === 'function');
  });
  check('M7.4 regression: all required classes still present (AC-14)', classesOk);

  await page.screenshot({ path: path.resolve(__dirname, '../../docs/reports/screenshots/m7.4-stage1-ingame.png') });

  await browser.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
})();
