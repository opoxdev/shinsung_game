// Focused release gate for the exact regression where the start screen enters
// battle but the Canvas render loop crashes, freezing waves and enemy spawns.
// Run against the actual inline browser bundle, not the individual ESM sources.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});
 const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto('file://'+path.join(root,'dist/index.html'),{waitUntil:'domcontentloaded'});
 await page.locator('[data-action="start"]').waitFor({timeout:15000});
 await page.locator('[data-action="start"]').click();
 await page.locator('#battlefield').waitFor({timeout:15000});
 // The first enemy should enter within a few seconds. If a ReferenceError
 // stops requestAnimationFrame, this assertion catches it reliably.
 await page.waitForFunction(()=>{
   const label=document.querySelector('#wave-clock')?.textContent||'';
   return Number(label.match(/적\\s+(\\d+)/)?.[1]||0)>0;
 },null,{timeout:15000});
 const first=await page.locator('#wave-clock').textContent();
 const progress=await page.locator('#wave-progress-fill').evaluate(el=>getComputedStyle(el).transform);
 assert.notEqual(progress,'none','wave progress element must be rendered');
 await page.waitForTimeout(1100);
 const second=await page.locator('#wave-clock').textContent();
 const firstLeft=Number(first.match(/(\\d+)s/)?.[1]);
 const secondLeft=Number(second.match(/(\\d+)s/)?.[1]);
 assert.ok(Number.isFinite(firstLeft)&&Number.isFinite(secondLeft));
 assert.ok(secondLeft<firstLeft,'wave clock must keep progressing after enemy spawn');
 assert.deepEqual(errors,[],'Browser runtime errors: '+errors.join(' | '));
 console.log('PASS: deployed game starts, enemies visibly spawn, wave advances, and no browser script exceptions occur.');
}finally {
 await browser.close();
}
