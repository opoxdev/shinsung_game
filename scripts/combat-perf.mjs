// Optional browser benchmark: PLAYWRIGHT_MODULE may point to an existing installation.
import {writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1280,height:800}});
 await page.goto(process.env.GAME_URL||'http://127.0.0.1:5175');
 await page.evaluate(async()=>{const {Renderer}=await import('/src/render.js');const original=Renderer.prototype.frame;window.paintTimes=[];Renderer.prototype.frame=function(...args){window.paintTimes.push(performance.now());return original.apply(this,args);};});
 await page.locator('[data-action="start"]').click();await page.waitForTimeout(2200);
 const cadence=await page.evaluate(()=>{const a=window.paintTimes.slice(5),d=a.slice(1).map((v,i)=>v-a[i]).sort((a,b)=>a-b);return {medianMs:d[Math.floor(d.length*.5)],p95Ms:d[Math.floor(d.length*.95)],paints:a.length};});
 await page.goto(process.env.GAME_URL||'http://127.0.0.1:5175');
 const workloads=await page.evaluate(async()=>{
   const {Renderer}=await import('/src/render.js'),{MAPS,ENEMIES,starterProfile}=await import('/src/data.js'),{createMatch,pointOnPath}=await import('/src/engine.js');
   const canvas=document.createElement('canvas');canvas.style.cssText='width:1280px;height:800px';document.body.replaceChildren(canvas);
   const r=new Renderer(canvas),s=createMatch({type:'solo',map:'plains',difficulty:'easy',modes:[]},[{id:'a',profile:starterProfile()}]);s.time=10;s.events=[];s.queue=[];
   const types=Object.keys(ENEMIES),results=[];
   for(const count of [100,350]){
     s.enemies=Array.from({length:count},(_,i)=>{const type=types[i%types.length],d=ENEMIES[type],progress=i/count*2000;return {id:i+100,type,field:0,...pointOnPath(MAPS[0].path,progress),progress,hp:d.hp*.8,maxHp:d.hp,speed:d.speed,shield:d.shield||0,maxShield:d.shield||0};});
     for(let i=0;i<20;i++)r.frame(s,'plains','a',1/60,i/60);
     const samples=[];for(let i=0;i<90;i++){const start=performance.now();r.frame(s,'plains','a',1/60,i/60);samples.push(performance.now()-start);if(i%15===0)await new Promise(requestAnimationFrame);}
     samples.sort((a,b)=>a-b);results.push({enemies:count,medianMs:samples[45],p95Ms:samples[85]});
   }r.dispose();return results;
 });
 const report={cadence,workloads,note:'Headless Chromium CPU submission times; not a guarantee of device FPS.'};
 console.log(JSON.stringify(report));if(process.argv[2])await writeFile(process.argv[2],JSON.stringify(report,null,2));
}finally{await browser.close();}
