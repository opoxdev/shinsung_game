import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
await mkdir('screenshots/combat-overhaul',{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:5175');
 await page.evaluate(async()=>{const {Renderer}=await import('/src/render.js');const frame=Renderer.prototype.frame;Renderer.prototype.frame=function(...args){window.combatRenderer=this;return frame.apply(this,args);};});
 await page.locator('[data-action="start"]').click();await page.locator('[data-action="storyDismiss"]').click();
 await page.keyboard.press('1');
 const pt=await page.evaluate(()=>{const r=window.combatRenderer;return {x:r.width/2+(240-r.camera.x)*r.scale,y:r.height/2+(400-r.camera.y)*r.scale};});
 await page.mouse.click(pt.x,pt.y);await page.waitForTimeout(160);await page.mouse.click(pt.x,pt.y);
 await page.locator('[data-action="upgrade"]').waitFor();await page.keyboard.press('u');await page.waitForTimeout(160);
 assert.match(await page.locator('#tower-inspector').getAttribute('data-evolution-key'),/:1$/);
 await page.locator('[data-action="closeInspector"]').click();assert.equal(await page.locator('#tower-inspector').textContent(),'');
 await page.locator('[data-action="effects"]').click();assert.match(await page.locator('[data-action="effects"]').textContent(),/간소/);
 await page.locator('[data-action="intel"]').click();assert.equal(await page.locator('.battle.show-intel').count(),1);
 await page.screenshot({path:'screenshots/combat-overhaul/desktop.png'});
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(160);
 const a=await page.locator('.battle-tools').boundingBox(),b=await page.locator('#skip').boundingBox();assert.ok(a.x+a.width<=b.x||a.y+a.height<=b.y||b.y+b.height<=a.y,'tools must not cover skip');
 await page.screenshot({path:'screenshots/combat-overhaul/mobile.png'});
 await page.setViewportSize({width:1200,height:1000});
 await page.evaluate(async()=>{const {enemyPlate}=await import('/src/enemy-art.js'),{ENEMIES}=await import('/src/data.js');const c=document.createElement('canvas');c.width=1200;c.height=1000;document.body.replaceChildren(c);const g=c.getContext('2d');g.fillStyle='#172638';g.fillRect(0,0,c.width,c.height);Object.keys(ENEMIES).forEach((id,i)=>{const x=i%8*150,y=Math.floor(i/8)*165;g.drawImage(enemyPlate(id),x+20,y+4,110,135);g.font='12px sans-serif';g.fillStyle='#e6eff5';g.textAlign='center';g.fillText(ENEMIES[id].name,x+75,y+151);});});
 await page.screenshot({path:'screenshots/combat-overhaul/enemies.png'});assert.deepEqual(errors,[]);
 console.log('Combat controls, upgrade shortcut, mobile fit and all enemy plates passed.');
}finally{await browser.close();}
