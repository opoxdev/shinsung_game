// Manual/CI Chromium smoke test: run after 'npm run build' with playwright installed.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
  const page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+path.join(root,'dist/index.html'),{waitUntil:'domcontentloaded'});
  await page.waitForSelector('[data-action="start"]',{timeout:10000});
  await page.click('[data-action="pvp"]');
  assert.equal(await page.locator('.mm-room-grid').getAttribute('data-mode'),'pvp');
  await page.waitForSelector('.mm-error',{timeout:8000});
  await page.click('[data-action="close"]');
  await page.click('[data-action="coop"]');
  assert.equal(await page.locator('.mm-room-grid').getAttribute('data-mode'),'coop');
  await page.click('[data-action="close"]');
  await page.click('[data-action="nav"][data-id="towers"]');
  assert.equal(await page.locator('.tower-card').count(),30);
  await page.click('[data-action="nav"][data-id="shop"]');
  assert.ok(await page.locator('.shop-tabs').count());
  await page.click('[data-action="nav"][data-id="home"]');
  await page.click('[data-action="start"]');
  await page.waitForSelector('#battlefield',{timeout:10000});
  await page.waitForFunction(()=>document.getElementById('wave-clock')?.textContent.includes('s'));
  const first=Number((await page.locator('#wave-clock').textContent()).match(/(\d+)s/)?.[1]);
  await page.waitForTimeout(1800);
  const after=Number((await page.locator('#wave-clock').textContent()).match(/(\d+)s/)?.[1]);
  assert.ok(after<first,'Wave countdown should progress smoothly in local battle');
  assert.deepEqual(errors,[],'Uncaught browser errors: '+errors.join('; '));
  console.log('Browser smoke passed: PvP / co-op separation, collection, shop, canvas and wave clock.');
}finally{await browser.close();}
