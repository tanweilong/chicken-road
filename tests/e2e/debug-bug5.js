const { chromium } = require('playwright');
const path = require('path');
const FILE_URL = 'file://' + path.resolve(__dirname, '../../index.html');

(async () => {
  const browser = await chromium.launch();
  for (let trial = 0; trial < 60; trial++) {
    const page = await browser.newPage();
    const stage = [0,1,2][trial % 3];
    const hops = [3,5,8,10,15,20][trial % 6];
    await page.goto(`${FILE_URL}?autostart=1&stage=${stage}&hops=${hops}`);
    await page.waitForTimeout(150);
    const info = await page.evaluate(() => {
      const g = window.__game;
      const lane = g.laneAt(g.player.row);
      return {
        state: g.state, deathCause: g._deathCause, row: g.player.row,
        laneType: lane && lane.type,
        px: g.player.x,
        vehicles: lane && lane.vehicles ? lane.vehicles.map(v=>({x:Math.round(v.x),w:v.w,speed:Math.round(v.speed),dir:v.dir})) : null,
        ridingLog: !!g.player.ridingLog,
      };
    });
    if (info.state !== 'playing') {
      console.log(trial, 'stage='+stage, 'hops='+hops, JSON.stringify(info));
    }
    await page.close();
  }
  await browser.close();
})();
