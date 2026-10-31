// Chromium end-to-end test: signed-in user runs solo/shop with Cloudflare disabled.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
let html=await readFile(path.join(root,'dist/index.html'),'utf8');
const original="const $=s=>document.querySelector(s), app=$('#app'), online=new Online();";
assert.ok(html.includes(original),'compiled game bootstrapping should be found');
const fixture=original+[
 "online.enabled=true;",
 "online.user={uid:'fixture-school-account',email:'schoolmate@example.test',displayName:'테스트 학생',getIdToken:async()=>{throw Error('Solo must not fetch Firebase tokens');}};",
 "online.init=async callback=>{await callback(online.user);};",
 "online.apiCall=async()=>{throw Error('Unexpected Cloudflare API invocation in solo/shop');};"
].join('\n');
html=html.replace(original,fixture);
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
  const page=await browser.newPage({viewport:{width:1280,height:800}});
  const errors=[],remote=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(!r.url().startsWith('http://offline-first.test/'))remote.push(r.url());});
  await page.route('http://offline-first.test/',route=>route.fulfill({contentType:'text/html; charset=utf-8',body:html}));
  await page.goto('http://offline-first.test/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.body.textContent.includes('연결된 계정'));
  assert.equal(await page.locator('.wallet').count(),1);
  await page.locator('[data-action="nav"][data-id="shop"]').click();
  await page.locator('[data-action="buyTower"][data-id="archer"]').click();
  await page.waitForFunction(()=>document.querySelector('.wallet')?.textContent.includes('200'));
  const account=await page.evaluate(()=>JSON.parse(localStorage.getItem('shinsung.profile.account.v2.fixture-school-account')));
  assert.equal(account.coins,200);
  assert.ok(account.owned.includes('archer'));
  assert.equal(await page.evaluate(()=>localStorage.getItem('shinsung.profile.v1')),null,
    'account purchases must not leak into guest save');
  await page.locator('[data-action="nav"][data-id="towers"]').click();
  assert.ok(await page.locator('.tower-card[data-id="archer"]:not(.locked)').count());
  await page.locator('[data-action="nav"][data-id="home"]').click();
  await page.locator('[data-action="start"]').click();
  await page.waitForSelector('#battlefield',{timeout:10000});
  await page.waitForFunction(()=>document.querySelector('#wave-clock')?.textContent?.includes('s'));
  const t1=await page.locator('#wave-clock').textContent();
  await page.waitForTimeout(1800);
  const t2=await page.locator('#wave-clock').textContent();
  assert.notEqual(t1,t2,'solo wave clock must continue on local simulation');
  assert.deepEqual(remote,[],'logged-in solo and store must not cause remote network requests');
  assert.deepEqual(errors,[],'browser should have no JavaScript errors');
  console.log('Offline-first browser passed: logged-in store, isolated wallet, solo wave, zero remote requests.');
}finally{await browser.close();}
