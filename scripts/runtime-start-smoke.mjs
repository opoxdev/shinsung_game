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
 // Release gate: the seasonal event page must render, remain scrollable, and
 // launch its own dedicated Christmas-only battle without JS exceptions.
 const christmasPage=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});
 const christmasErrors=[];
 christmasPage.on('pageerror',error=>christmasErrors.push(error.message));
 await christmasPage.goto('file://'+path.join(root,'dist/index.html'),{waitUntil:'domcontentloaded'});
 await christmasPage.locator('[data-action="christmas"]').click();
 await christmasPage.locator('.christmas-page').waitFor({timeout:15000});
 assert.equal(await christmasPage.locator('.christmas-stage-card').count(),3);
 for(const id of ['christmas_village','christmas_station','christmas_kingdom']){
  const thumbnail=christmasPage.locator('.christmas-stage-map[data-christmas-map="'+id+'"]');
  assert.equal(await thumbnail.count(),1,'separate Christmas world preview: '+id);
  assert.equal(await thumbnail.locator('svg[data-biome-art="'+id+'"]').count(),1,
   'Chapter should show its own authored SVG route: '+id);
 }
 assert.equal(await christmasPage.locator('.christmas-pass-tier').count(),30);
 assert.equal(await christmasPage.locator('.christmas-monster').count(),16);
 assert.equal(await christmasPage.locator('[data-action="christmasStageSolo"][data-id="christmas_1"]').isEnabled(),true);
 assert.equal(await christmasPage.locator('[data-action="christmasStageSolo"][data-id="christmas_2"]').isEnabled(),false);
 const scroll=await christmasPage.locator('.content').evaluate(el=>({
  height:el.clientHeight,whole:el.scrollHeight,overflow:getComputedStyle(el).overflowY
 }));
 assert.ok(scroll.whole>scroll.height+250&&scroll.overflow==='auto',
  '30-level event pass must scroll inside the proper content panel');
 if(capture)await christmasPage.screenshot({path:path.join(shotsDir,'christmas-event.png'),animations:'disabled'});
 await christmasPage.locator('.christmas-switch').click();
 assert.equal(await christmasPage.locator('[data-action="christmasStageSolo"][data-id="christmas_1"]').isEnabled(),false,
  'Christmas toggle OFF must disable stage starts');
 await christmasPage.locator('.christmas-switch').click();
 assert.equal(await christmasPage.locator('[data-action="christmasStageSolo"][data-id="christmas_1"]').isEnabled(),true);
 await christmasPage.locator('[data-action="christmasStageSolo"][data-id="christmas_1"]').click();
 await christmasPage.locator('#battlefield').waitFor({timeout:15000});
 await christmasPage.waitForFunction(()=>{
  const label=document.querySelector('#wave-clock')?.textContent||'';
  return Number(label.match(/적\s+(\d+)/)?.[1]||0)>0;
 },null,{timeout:15000});
 if(capture)await christmasPage.screenshot({path:path.join(shotsDir,'christmas-battle.png'),animations:'disabled'});
 assert.deepEqual(christmasErrors,[],'Christmas event browser errors: '+christmasErrors.join(' | '));
 await christmasPage.close();
 // Release gate: chapters 2/3 must each actually enter the intended
 // battlefield, not only display different card artwork. Seed a valid LOCAL
 // tester profile; no cloud or account data is modified.
 for(const [chapter,mapId] of [[2,'christmas_station'],[3,'christmas_kingdom']]){
  const chapterPage=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});
  const chapterErrors=[];
  chapterPage.on('pageerror',error=>chapterErrors.push(error.message));
  await chapterPage.goto('file://'+path.join(root,'dist/index.html'),{waitUntil:'domcontentloaded'});
  await chapterPage.evaluate(()=>{
   const profile={name:'Christmas stage visual QA',schema:2,coins:99999,xp:0,wins:0,
    owned:['scout','blade'],loadout:['scout','blade'],packs:['basic'],pack:'basic',
    skins:{},equippedSkins:{},cratePity:0,cratePities:{wardrobe:0,forest:0,winter:0,cyber:0,astral:0},
    lastCrate:null,christmasPassXP:0,christmasPassClaimed:[],christmasCleared:[1,2]};
   localStorage.setItem('shinsung.profile.v1',JSON.stringify(profile));
   localStorage.setItem('shinsung.christmas.enabled','true');
  });
  await chapterPage.reload({waitUntil:'domcontentloaded'});
  await chapterPage.locator('[data-action="christmas"]').click();
  const stage=chapterPage.locator('[data-action="christmasStageSolo"][data-id="christmas_'+chapter+'"]');
  assert.equal(await stage.isEnabled(),true,'prerequisite clears must unlock chapter '+chapter);
  assert.equal(await chapterPage.locator('.christmas-stage-map[data-christmas-map="'+mapId+'"] svg[data-biome-art="'+mapId+'"]').count(),1);
  if(capture)await chapterPage.screenshot({
   path:path.join(shotsDir,'christmas-chapter-'+chapter+'-selection.png'),animations:'disabled'});
  await stage.click();
  await chapterPage.locator('#battlefield').waitFor({timeout:15000});
  await chapterPage.waitForFunction(()=>{
   const label=document.querySelector('#wave-clock')?.textContent||'';
   return Number(label.match(/적\\s+(\\d+)/)?.[1]||0)>0;
  },null,{timeout:18000});
  if(capture)await chapterPage.screenshot({
   path:path.join(shotsDir,'christmas-chapter-'+chapter+'-battle.png'),animations:'disabled'});
  assert.deepEqual(chapterErrors,[],'Christmas chapter '+chapter+' runtime errors: '+chapterErrors.join(' | '));
  await chapterPage.close();
 }
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
