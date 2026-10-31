// Chromium regression: D1-backed account, local-only solo ticks, one-shot settlement.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {starterProfile} from '../src/data.js';
import {profileAction,applyReward} from '../src/engine.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
let html=await readFile(path.join(root,'dist/index.html'),'utf8');
const original="const $=s=>document.querySelector(s), app=$('#app'), online=new Online();";
assert.ok(html.includes(original));
const fixture=original+[
  "online.enabled=true;",
  "online.user={uid:'school-test',email:'schoolmate@example.test',displayName:'Test Student',getIdToken:async()=> 'test-token'};",
  "online.init=async callback=>{await callback(online.user);};",
  "online.apiCall=async(action,payload={})=>await window.__mockD1({action,payload});",
  "window.__finishTestSolo=async()=>{state.status='victory';state.wave=DIFFICULTIES.find(d=>d.id===state.config.difficulty).waves.length;await finish();};"
].join('\n');
html=html.replace(original,fixture);
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
let server=starterProfile('Test Student'),actions=[],claims=new Set();
try{
  const page=await browser.newPage({viewport:{width:1280,height:800},acceptDownloads:true});
  const errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(!r.url().startsWith('http://localhost:8484/'))external.push(r.url());});
  await page.exposeFunction('__mockD1',async ({action,payload})=>{
    actions.push(action);
    if(action==='profile')return structuredClone(server);
    if(action==='profileAction'){profileAction(server,payload);return structuredClone(server);}
    if(action==='soloReward'){
      if(!claims.has(payload.runId)){
        claims.add(payload.runId);
        applyReward(server,{coins:1200,xp:200,sonic:false,aurora:false,win:true});
      }
      return structuredClone(server);
    }
    throw Error('Unexpected cloud action: '+action);
  });
  await page.route('http://localhost:8484/',route=>route.fulfill({contentType:'text/html; charset=utf-8',body:html}));
  await page.goto('http://localhost:8484/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('.wallet')?.textContent.includes('600'));
  assert.deepEqual(actions,['profile'],'D1 profile read only on login');
  await page.locator('.sidebar .nav-item[data-action="nav"][data-id="shop"]').click();
  await page.locator('[data-action="buyTower"][data-id="archer"]').click();
  await page.waitForFunction(()=>document.querySelector('.wallet')?.textContent.includes('200'));
  assert.ok(server.owned.includes('archer'));
  assert.deepEqual(actions,['profile','profileAction'],'purchase must write D1, not browser storage');
  assert.equal(await page.evaluate(()=>localStorage.getItem('shinsung.profile.account.v2.school-test')),null);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('.wallet')?.textContent.includes('200'));
  assert.ok(actions.includes('profile'));
  await page.locator('.sidebar .nav-item[data-action="nav"][data-id="home"]').click();
  const before=actions.length;
  await page.locator('[data-action="start"]').click();
  await page.waitForSelector('#battlefield');
  await page.waitForFunction(()=>document.querySelector('#wave-clock')?.textContent?.includes('s'));
  const startClock=await page.locator('#wave-clock').textContent();
  await page.waitForTimeout(1700);
  assert.notEqual(await page.locator('#wave-clock').textContent(),startClock);
  assert.equal(actions.length,before,'local solo simulation never contacts Cloudflare');
  await page.evaluate(()=>window.__finishTestSolo());
  await page.waitForSelector('.result-reward');
  assert.equal(actions.at(-1),'soloReward','exactly one result claim after local battle');
  assert.equal(server.coins,1400);
  assert.equal(actions.filter(a=>a==='soloReward').length,1);
  assert.equal(actions.filter(a=>['createRoom','start','pulse','ticket','command'].includes(a)).length,0);
  assert.deepEqual(external,[],'no third-party font/network calls during local solo and shop');
  assert.deepEqual(errors,[],'no browser JS errors');
  console.log('Cloud profile + local solo browser passed: D1 purchase, login reload, zero combat network, one settlement.');
}finally{await browser.close();}
