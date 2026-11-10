// Focused release gate for the exact regression where the start screen enters
// battle but the Canvas render loop crashes, freezing waves and enemy spawns.
// Run against the actual inline browser bundle, not the individual ESM sources.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {mkdirSync} from 'node:fs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const capture=process.env.CAPTURE_MAP_SCREENSHOTS==='1';
const shotsDir=path.join(root,'screenshots');
if(capture)mkdirSync(shotsDir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});
 const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto('file://'+path.join(root,'dist/index.html'),{waitUntil:'domcontentloaded'});
 await page.locator('[data-action="start"]').waitFor({timeout:15000});
 // Browser-level coverage for content, challenge combinations and render startup.
 await page.locator('.sidebar [data-action="nav"][data-id="towers"]').click();
 for(const id of ['pulsekeeper','duskarcher','crystalspider','sunlancer','graviturge','thornkeeper']){
  const card=page.locator('.tower-card[data-id="'+id+'"]');
  assert.equal(await card.count(),1,'new tower missing from collection: '+id);
  assert.equal(await card.locator('svg[data-base="'+id+'"]').count(),1,'new tower portrait missing: '+id);
 }
 await page.locator('.sidebar [data-action="nav"][data-id="home"]').click();
 // Map selection must NOT replace the horizontal scroll rail or reset its
 // horizontal position. Previously home() rebuilt the entire mission layout.
 const mapRail=page.locator('.map-picker');
 const railWidth=await mapRail.evaluate(el=>el.scrollWidth-el.clientWidth);
 assert.ok(railWidth>50,'map choices should need horizontal scrolling');
 await mapRail.evaluate(el=>{el.dataset.preserveRail='original';});
 assert.match(await page.locator('.defeat-reward-note').textContent(),/5웨이브부터/);
 // Every new map must be selectable through the actual scrolling map rail.
 for(const id of ['sakura','moonlake','stardune','skyisles']){
  const button=page.locator('.map-pick[data-id="'+id+'"]');
  await button.scrollIntoViewIfNeeded();
  const leftBefore=await mapRail.evaluate(el=>el.scrollLeft);
  await button.click();
  assert.equal(await mapRail.evaluate(el=>el.dataset.preserveRail),'original',
    'map selection replaced the scroll rail and reset the player scroll position');
  const leftAfter=await mapRail.evaluate(el=>el.scrollLeft);
  assert.ok(Math.abs(leftAfter-leftBefore)<8,
    'map selection jumped the horizontal scroll from '+leftBefore+' to '+leftAfter);
  assert.equal(await page.locator('.map-stage.biome-'+id).count(),1,'map is not selected: '+id);
  assert.equal(await page.locator('.world-art svg[data-biome-art="'+id+'"]').count(),1,'bespoke SVG did not load: '+id);
  if(capture){
   await page.locator('.world-art svg[data-biome-art="'+id+'"]').waitFor();
   await page.screenshot({path:path.join(shotsDir,id+'-selection.png'),animations:'disabled'});
  }
 }
 // The live map preview also exercises full Canvas terrain baking.
 await page.locator('[data-action="mapPreview"]').click();
 await page.locator('canvas.terrain-preview').waitFor({timeout:15000});
 await page.waitForTimeout(200);
 if(capture)await page.screenshot({path:path.join(shotsDir,'skyisles-terrain-preview.png'),animations:'disabled'});
 await page.locator('.modal [data-action="close"]').click();
 for(const id of ['darkenergy','tank','rift','eclipse','laststand']){
  const previousRailLeft=await mapRail.evaluate(el=>el.scrollLeft);
  await page.locator('[data-action="mode"][data-id="'+id+'"]').click();
  assert.ok(Math.abs((await mapRail.evaluate(el=>el.scrollLeft))-previousRailLeft)<8,
    'mode selection lost the map rail horizontal position');
  assert.ok(await page.locator('[data-action="mode"][data-id="'+id+'"]').evaluate(el=>el.classList.contains('selected')),'challenge mode did not remain selected: '+id);
 }
 await page.locator('[data-action="start"]').click();
 await page.locator('#battlefield').waitFor({timeout:15000});
 // The first enemy should enter within a few seconds. If a ReferenceError
 // stops requestAnimationFrame, this assertion catches it reliably.
 await page.waitForFunction(()=>{
   const label=document.querySelector('#wave-clock')?.textContent||'';
   return Number(label.match(/적\s+(\d+)/)?.[1]||0)>0;
 },null,{timeout:15000});
 if(capture)await page.screenshot({path:path.join(shotsDir,'skyisles-battle.png'),animations:'disabled'});
 const first=await page.locator('#wave-clock').textContent();
 const progress=await page.locator('#wave-progress-fill').evaluate(el=>getComputedStyle(el).transform);
 assert.notEqual(progress,'none','wave progress element must be rendered');
 await page.waitForTimeout(1100);
 const second=await page.locator('#wave-clock').textContent();
 const firstLeft=Number(first.match(/(\d+)s/)?.[1]);
 const secondLeft=Number(second.match(/(\d+)s/)?.[1]);
 assert.ok(Number.isFinite(firstLeft)&&Number.isFinite(secondLeft));
 assert.ok(secondLeft<firstLeft,'wave clock must keep progressing after enemy spawn');
 assert.deepEqual(errors,[],'Browser runtime errors: '+errors.join(' | '));
 console.log('PASS: deployed game starts, enemies visibly spawn, wave advances, and no browser script exceptions occur.');
}finally {
 await browser.close();
}
