import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {starterProfile} from '../src/data.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
  const page=await browser.newPage({viewport:{width:1200,height:800}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+path.join(root,'dist/index.html'));
  const account=starterProfile('Achievement browser test');
  account.owned.push('archer','chef','chemist');
  account.achievementStats={wins:1,kills:120,places:60,upgrades:0,clears:{easy:1}};
  await page.evaluate(data=>localStorage.setItem('shinsung.profile.v1',JSON.stringify(data)),account);
  await page.reload();
  await page.locator('[data-action="events"]').click();
  assert.equal(await page.locator('.achievement-card').count(),35);
  const card=page.locator('.achievement-card').filter({hasText:'적을 막아라'});
  assert.match(await card.textContent(),/달성 완료/);
  const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('shinsung.profile.v1')).coins);
  await card.locator('[data-action="achievementClaim"]').click();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('shinsung.profile.v1')).claimedAchievements?.includes('kills_100'));
  const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('shinsung.profile.v1')).coins);
  assert.equal(after,before+120,'reward paid exactly once after a click');
  assert.match(await page.locator('.achievement-card').filter({hasText:'적을 막아라'}).textContent(),/수령 완료/);
  await page.reload();
  await page.locator('[data-action="events"]').click();
  assert.equal(await page.locator('.achievement-card').filter({hasText:'적을 막아라'}).locator('[data-action="achievementClaim"]').count(),0,
    'claimed achievement cannot pay twice after browser reload');
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('shinsung.profile.v1')).coins),after);
  await page.locator('[data-action="achievementFilter"][data-id="ready"]').first().click();
  assert.ok(await page.locator('.achievement-card.ready').count()>=1,'other earned rewards remain claimable');
  assert.deepEqual(errors,[]);
  console.log('Achievement Chromium passed: progress, claim once, persistent status, ready filter and zero JS errors.');
}finally{await browser.close();}
