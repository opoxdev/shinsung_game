import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {starterProfile} from '../src/data.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
  const page=await browser.newPage({viewport:{width:1850,height:800},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+path.join(root,'dist/index.html'));
  const profile=starterProfile('Deck layout check');
  if(!profile.owned.includes('oldgod'))profile.owned.push('oldgod');
  profile.loadout=['oldgod',...profile.loadout.filter(x=>x!=='oldgod')].slice(0,5);
  await page.evaluate(p=>localStorage.setItem('shinsung.profile.v1',JSON.stringify(p)),profile);
  await page.reload();
  await page.waitForSelector('.loadout-bar svg[data-base="oldgod"]',{timeout:12000});
  const card=page.locator('.loadout-bar .loadout-slot:has(svg[data-base="oldgod"])');
  const art=card.locator('svg[data-base="oldgod"]');
  const metrics=await card.evaluate(el=>({
    card:el.getBoundingClientRect().width,
    art:el.querySelector('svg').getBoundingClientRect().width,
    number:!!el.querySelector('.slot-number'),
    name:!!el.querySelector('.slot-name'),
    clipped:getComputedStyle(el).overflowX,
  }));
  assert.ok(metrics.art>metrics.card*1.1,'Ancient God artwork should be bigger than deck card viewport');
  assert.ok(metrics.art>=140,'Ancient God deck art has actually been enlarged');
  assert.ok(metrics.number&&metrics.name,'image must preserve number and name layers');
  assert.equal(metrics.clipped,'hidden','large art stays inside card edges');

  // Extra simulated sidebar controls reproduce admin/expanded menus without
  // signing in; these must NEVER lengthen the entire document below the team dock.
  await page.evaluate(()=>{
    const sidebar=document.querySelector('.sidebar');
    for(let i=0;i<12;i++){
      const button=document.createElement('button');
      button.className='nav-item';
      button.textContent='확장 메뉴 '+i;
      sidebar.insertBefore(button,sidebar.querySelector('.sidebar-bottom'));
    }
  });
  for(const [width,height] of [[1850,800],[1280,720],[760,690]]){
    await page.setViewportSize({width,height});
    const dims=await page.evaluate(()=>{
      const doc=document.documentElement,shell=document.querySelector('.shell'),
        side=document.querySelector('.sidebar'),dock=document.querySelector('.loadout-bar');
      return {inner:innerHeight,doc:doc.scrollHeight,body:document.body.scrollHeight,
        shell:shell.getBoundingClientRect().height,dockBottom:dock.getBoundingClientRect().bottom,
        sidebarHeight:side.clientHeight,sidebarScrollHeight:side.scrollHeight,
        sidebarOverflow:getComputedStyle(side).overflowY,scrollbar:doc.scrollWidth};
    });
    assert.ok(dims.doc<=height+2,JSON.stringify({width,height,dims})+' document must not develop an extra bottom band');
    assert.ok(Math.abs(dims.shell-height)<=2,'shell exactly occupies viewport without overflow');
    assert.ok(Math.abs(dims.dockBottom-height)<=7,'team dock remains at viewport bottom (allow 5px shell border): '+JSON.stringify({width,height,dims}));
    assert.ok(dims.sidebarScrollHeight>dims.sidebarHeight,'many nav tabs should overflow only in sidebar');
    assert.equal(dims.sidebarOverflow,'auto','sidebar is its own scroll area');
    await page.locator('.sidebar').evaluate(el=>{el.scrollTop=el.scrollHeight;});
    assert.ok(await page.locator('.sidebar').evaluate(el=>el.scrollTop)>60,
      'sidebar is independently scrollable even with full navigation');
    assert.ok(dims.scrollbar<=width+2,'no horizontal body scrollbar');
  }
  assert.deepEqual(errors,[],'uncaught runtime errors');
  console.log('Deck/layout Chromium passed: god card larger, viewport height fixed, sidebar-only scroll, dock anchored at 3 resolutions.');
}finally{await browser.close();}
