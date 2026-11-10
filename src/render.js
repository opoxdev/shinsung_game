import { MAPS, WORLD, TOWERS, ENEMIES, RARITIES, formatDamage } from './data.js';
import { pointOnPath, pathDistance, towerStats, canPlace } from './engine.js';
import { character } from './art.js';
import { makeTerrain } from './terrain.js';
import { drawEnemy, drawEnemyOverlay } from './enemy-art.js';
import { drawTowerAttackEffect, drawTowerPresence, isTowerAttackEffect } from './combat-fx.js';
import { TERRAIN_MARGIN, constrainCamera } from './presentation.js';
// Streaming culling avoids per-frame array copies. Crucially, quota accounting
// happens only AFTER age, field, and screen-visibility checks.
export function* combatEventsToRender(events,time,field,isVisible,reduced=false){
  let damage=0,attacks=0;
  for(let i=events.length-1;i>=0;i--){
    const e=events[i],age=time-e.time;
    if(e.field!==field||age<0||age>.45||!isVisible(e))continue;
    if(e.kind==='damage'&&(reduced||damage++>=32))continue;
    if(isTowerAttackEffect(e)&&++attacks>(reduced?32:90))continue;
    yield e;
  }
}
export const portrait=character;
export { landscape } from './art.js';
// Aim is a continuous world-space angle, not a 4/8-direction sprite choice.
export function drawMelee(g,e,age){
  const dx=(e.tx??e.x)-e.x,dy=(e.ty??e.y)-e.y;
  const angle=Math.atan2(dy,dx),distance=Math.hypot(dx,dy);
  const reach=20+(Math.max(24,distance)-20)*Math.min(1,Math.max(0,age/.17));
  const halfWidth=Math.min(43,Math.max(18,distance*.31));
  g.save();g.translate(e.x,e.y);g.rotate(angle);
  g.lineJoin='round';g.lineCap='round';
  g.fillStyle=e.type==='blade'?'#ffb6d3':e.type==='knight'?'#d2c6ff':'#e8f8ff';
  g.strokeStyle=e.type==='blade'?'#ff648b':e.type==='knight'?'#a6a6ff':'#b0ecff';
  g.lineWidth=e.type==='knight'?5:3;
  // A directional sword wave, transformed toward the actual enemy position.
  g.beginPath();g.moveTo(14,-halfWidth*.28);
  g.quadraticCurveTo(reach*.48,-halfWidth*1.12,reach+8,-halfWidth*.27);
  g.quadraticCurveTo(reach+halfWidth*.39,0,reach+8,halfWidth*.27);
  g.quadraticCurveTo(reach*.48,halfWidth*1.12,14,halfWidth*.28);
  g.quadraticCurveTo(reach*.26,0,14,-halfWidth*.28);
  g.closePath();g.fill();g.stroke();
  g.strokeStyle='#ffffff';g.lineWidth=2;g.beginPath();
  g.moveTo(21,-halfWidth*.2);
  g.quadraticCurveTo(reach*.6,-halfWidth*.71,reach+6,-halfWidth*.12);
  g.stroke();g.restore();
}
export const formatCombatNumber=n=>formatDamage(n);
const sprites=new Map();
function sprite(id,skin,level=0){
  const key=id+'|'+skin+'|'+level;
  if(!sprites.has(key)){
    const img=new Image(),entry={source:null,ready:false};sprites.set(key,entry);
    img.onload=()=>{
      try{
        const c=typeof OffscreenCanvas==='function'?new OffscreenCanvas(256,300):document.createElement('canvas');c.width=256;c.height=300;
        c.getContext('2d').drawImage(img,0,0,256,300);
        entry.source=typeof c.transferToImageBitmap==='function'?c.transferToImageBitmap():c;
      }catch{
        // A failed raster-cache conversion must never hide a placed tower.
        entry.source=img;
      }
      entry.ready=true;
    };
    img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(character(id,skin,level));
  }
  return sprites.get(key);
}
// World-space hit testing uses the same offset as the renderer's PvP fields.
export function enemyUnderCursor(enemies,point,scale=1){
  let closest=null,min=Infinity;
  for(const e of enemies){
    if(e.hp<=0)continue;
    const radius=Math.max((ENEMIES[e.type]?.size||13)+11,20/Math.max(.01,scale));
    const distance=Math.hypot(e.x+(e.field||0)*2100-point.x,e.y-point.y);
    if(distance<=radius&&distance<min){closest=e;min=distance;}
  }
  return closest;
}
// Adaptive raster scale cuts high-DPI fill/shadow workload on small devices.
const canvasDpr=()=>Math.min(devicePixelRatio||1,window.innerWidth<700?1.2:1.4);
export class Renderer {
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.cache=new Map();this.camera={x:900,y:550,zoom:1};this.keys=new Set();this.pointer=null;this.pointerScreen=null;this.preview=null;this.selected=null;this.width=1;this.height=1;this.resize();this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas);}
  dispose(){this.observer.disconnect();this.cache.clear();this.keys.clear();}
  resize(){const r=this.canvas.getBoundingClientRect(),dpr=canvasDpr();this.width=Math.max(1,r.width);this.height=Math.max(1,r.height);if(this.canvas.width!==Math.round(this.width*dpr)||this.canvas.height!==Math.round(this.height*dpr)){this.canvas.width=Math.round(this.width*dpr);this.canvas.height=Math.round(this.height*dpr);}this.dpr=dpr;}
  zoomBy(factor){this.camera.zoom*=factor;this.scale=constrainCamera(this.camera,this.width,this.height,this.fields||1);}
  visible(x,y,pad=100){return Math.abs(x-this.camera.x)<this.width/(2*this.scale)+pad&&Math.abs(y-this.camera.y)<this.height/(2*this.scale)+pad;}
  screenToWorld(x,y){const scale=this.scale||1;return {x:(x-this.width/2)/scale+this.camera.x,y:(y-this.height/2)/scale+this.camera.y};}
  enemyAt(state,screen){return enemyUnderCursor(state?.enemies||[],this.screenToWorld(screen.x,screen.y),this.scale||1);}
  frame(state,mapId,playerId,dt,now,lobby=false){
    if(this.dpr!==canvasDpr())this.resize();const g=this.ctx;g.setTransform(this.dpr,0,0,this.dpr,0,0);
    const map=MAPS.find(m=>m.id===mapId)||MAPS[0],field=state?.players[playerId]?.field||0;
    this.fields=state?.fields.length||1;
    g.fillStyle=map.ground;g.fillRect(0,0,this.width,this.height);
    if(!lobby){this.camera.zoom*=Math.exp((+this.keys.has('e')-this.keys.has('r'))*dt*1.4);const speed=650*dt/this.camera.zoom;this.camera.x+=(+this.keys.has('d')-this.keys.has('a'))*speed;this.camera.y+=(+this.keys.has('s')-this.keys.has('w'))*speed;}
    this.scale=constrainCamera(this.camera,this.width,this.height,this.fields);
    if(this.pointerScreen)this.pointer=this.screenToWorld(this.pointerScreen.x,this.pointerScreen.y);
    g.save();g.translate(this.width/2,this.height/2);g.scale(this.scale,this.scale);g.translate(-this.camera.x,-this.camera.y);
    if(!this.cache.has(map.id)){this.cache.clear();this.cache.set(map.id,makeTerrain(map));}
    for(let f=0;f<(state?.fields.length||1);f++){
      const offset=f*2100;
      // In PvP the other 1800px world is usually outside the viewport.
      // Skip its terrain, all towers, enemies and effects completely rather
      // than clipping/rasterizing a second huge map every display frame.
      const viewHalfWidth=this.width/(2*this.scale);
      if(offset+WORLD.width+TERRAIN_MARGIN<this.camera.x-viewHalfWidth
        ||offset-TERRAIN_MARGIN>this.camera.x+viewHalfWidth)continue;
      g.save();g.translate(offset,0);
      // Partition overlapping outskirts at the midpoint between PvP fields.
      g.save();g.beginPath();const left=f===0?-TERRAIN_MARGIN:-150,right=f===this.fields-1?WORLD.width+TERRAIN_MARGIN:1950;
      g.rect(left,-TERRAIN_MARGIN,right-left,WORLD.height+2*TERRAIN_MARGIN);g.clip();
      g.drawImage(this.cache.get(map.id),-TERRAIN_MARGIN,-TERRAIN_MARGIN);g.restore();
      if(state?.config.type==='pvp'){g.fillStyle=f===field?'#bcd994':'#f6a498';g.font='bold 30px sans-serif';g.fillText(f===field?'아군 방어 구역':'상대 방어 구역',60,75);}
      if(!state){const length=map.path.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p[0]-map.path[i][0],p[1]-map.path[i][1]),0);for(let i=0;i<9;i++){const p=pointOnPath(map.path,(now*45+i*length/9)%length);this.enemy(g,{...p,type:i%3?'zombie':'runner',hp:18,maxHp:18,id:i},now);}}
      else {
        const selected=state.towers.find(t=>t.id===this.selected&&t.field===f);
        if(selected){g.fillStyle='#f1db8420';g.strokeStyle='#f1db8470';g.lineWidth=2;g.beginPath();g.arc(selected.x,selected.y,towerStats(selected).range,0,7);g.fill();g.stroke();}
        for(const t of state.towers)if(t.field===f&&this.visible(t.x+offset,t.y))this.tower(g,t,now,state.time);
        g.imageSmoothingEnabled=this.scale>=1;
        for(const e of state.enemies)if(e.field===f&&this.visible(e.x+offset,e.y))drawEnemy(g,e,now,state.time,false);
        g.imageSmoothingEnabled=true;
        for(const e of state.enemies)if(e.field===f&&this.visible(e.x+offset,e.y))drawEnemyOverlay(g,e,state.time);
        for(const u of state.units)if(u.field===f&&this.visible(u.x+offset,u.y))this.summon(g,u,now);
        for(const e of combatEventsToRender(state.events,state.time,f,
          ev=>this.visible(ev.x+offset,ev.y,180),this.reducedEffects)){
          const age=state.time-e.time;
          g.globalAlpha=1-age/.45;g.strokeStyle=TOWERS[e.type]?.color||ENEMIES[e.type]?.color||'#ffd88c';g.lineWidth=e.type==='rail'?5:3;g.shadowColor=g.strokeStyle;g.shadowBlur=0;
          if(e.kind==='summon-shot'){
            const p=Math.min(1,age/.25),fromX=e.x,fromY=e.y-20,toX=e.tx??e.x,toY=e.ty??e.y;
            const px=fromX+(toX-fromX)*p,py=fromY+(toY-fromY)*p;
            const fiery=e.type==='phoenix';
            g.save();g.strokeStyle=fiery?'#ffab63':e.type==='spirit'?'#87faff':'#dfffc5';
            g.lineWidth=fiery?4:3;g.shadowColor=g.strokeStyle;
            if(!this.reducedEffects)g.shadowBlur=7;
            g.beginPath();g.moveTo(fromX,fromY);g.lineTo(px,py);g.stroke();
            g.fillStyle=fiery?'#ffe3a0':'#eaffff';
            g.beginPath();g.arc(px,py,fiery?6:3.5,0,Math.PI*2);g.fill();
            g.restore();
          }else if(e.kind==='summon-crash'){
            const p=Math.min(1,age/.45),fiery=e.type==='phoenix',radius=e.radius||88;
            g.save();g.strokeStyle=fiery?'#ffa65c':'#73edff';g.shadowColor=g.strokeStyle;
            if(!this.reducedEffects)g.shadowBlur=13;
            g.lineWidth=8*(1-p)+1;g.beginPath();g.arc(e.x,e.y,10+radius*p,0,7);g.stroke();
            g.strokeStyle=fiery?'#ffda92':'#f0ffff';g.lineWidth=4*(1-p)+.5;
            g.beginPath();g.arc(e.x,e.y,6+radius*p*.65,0,7);g.stroke();
            if(!this.reducedEffects)for(let j=0;j<8;j++){
              const a=j*Math.PI/4+e.id*.27,rr=radius*p;
              g.beginPath();g.moveTo(e.x+Math.cos(a)*rr*.45,e.y+Math.sin(a)*rr*.45);
              g.lineTo(e.x+Math.cos(a+.1)*rr,e.y+Math.sin(a+.1)*rr);g.stroke();
            }
            g.restore();
          }else if(e.kind==='eclipse'){
            const p=Math.min(1,age/.45);g.save();
            g.strokeStyle='#c1a1ff';g.lineWidth=6*(1-p)+1;
            g.shadowColor='#a68aff';g.shadowBlur=this.reducedEffects?0:10;
            g.beginPath();g.ellipse(e.x,e.y-17,20+p*60,30+p*75,0,0,Math.PI*2);g.stroke();
            g.fillStyle='#efe2ff';g.font='bold 18px sans-serif';
            g.fillText('☾ 월식 기습',e.x+32,e.y-65-p*18);g.restore();
          }else if(e.kind==='cookie-shatter'){
            // Burst baked gingerbread fragments, icing and candy sprinkles.
            const p=Math.min(1,age/.45),colors=['#b97552','#fef0dc','#f38e9f','#a2efbc','#fff1a2'];
            g.save();g.globalAlpha=1-p;
            for(let i=0;i<14;i++){
              const a=i*Math.PI*2/14+(e.variant||0)*.3,dist=(12+p*85)*(i%3+2)/4;
              const x=e.x+Math.cos(a)*dist,y=e.y+Math.sin(a)*dist;
              g.save();g.translate(x,y);g.rotate(p*7+i);
              g.fillStyle=colors[i%colors.length];g.fillRect(-4,-4,8+(i%3)*3,6+(i%3)*2);g.restore();
            }
            g.restore();
          }else if(e.kind==='christmas-gift'){
            const p=Math.min(1,age/.45);
            g.save();g.globalAlpha=1-p;
            g.strokeStyle=e.outcome==='heal'?'#b9ffd0':e.outcome==='candy-blast'?'#ff9cae':'#ffe4a1';
            g.lineWidth=6*(1-p)+1;g.beginPath();g.arc(e.x,e.y-18,16+p*68,0,7);g.stroke();
            g.font='bold 22px sans-serif';g.fillStyle='#fff7e9';
            g.fillText(e.outcome==='heal'?'♥':e.outcome==='blessing'?'✦':e.outcome==='candy-blast'?'✸':'🎁',e.x-10,e.y-49-p*30);
            g.restore();
          }else if(e.kind==='christmas-freeze'){
            const p=Math.min(1,age/.45);
            g.save();g.strokeStyle='#d8fbff';g.globalAlpha=1-p;g.lineWidth=4;
            for(let i=0;i<6;i++){
              const a=i*Math.PI/3;
              g.beginPath();g.moveTo(e.x+Math.cos(a)*5,e.y+Math.sin(a)*5);
              g.lineTo(e.x+Math.cos(a)*(12+p*42),e.y+Math.sin(a)*(12+p*42));g.stroke();
            }g.restore();
          }else if(e.kind==='summon-clash'){
            const p=Math.min(1,age/.45);g.save();g.strokeStyle='#f6ffd4';g.lineWidth=4*(1-p)+1;
            g.beginPath();g.arc(e.x,e.y,12+p*44,0,7);g.stroke();
            for(let i=0;i<5;i++){const a=i*Math.PI*2/5+e.id;
              g.beginPath();g.moveTo(e.x+Math.cos(a)*16,e.y+Math.sin(a)*16);
              g.lineTo(e.x+Math.cos(a)*(22+p*37),e.y+Math.sin(a)*(22+p*37));g.stroke();}
            g.restore();
          }else if(e.kind==='summon-march'||e.kind==='summon-launch'){
            const p=age/.45;g.save();g.strokeStyle=e.kind==='summon-march'?'#7dffbd':'#b1eaff';
            g.lineWidth=5*(1-p)+1;g.beginPath();g.ellipse(e.x,e.y,12+p*55,7+p*26,0,0,7);g.stroke();g.restore();
          }else if(isTowerAttackEffect(e)){
            const rarity=TOWERS[e.type]?.rarity;
            drawTowerAttackEffect(g,e,age,this.reducedEffects?0:rarity==='mythic'?2:1);
          }else if(e.kind==='divine'){
            const p=age/.45,rad=20+p*160;g.save();g.shadowColor='#ffce42';g.shadowBlur=23;
            g.strokeStyle='#fff2b4';g.lineWidth=16*(1-p)+2;g.beginPath();g.moveTo(e.tx-18,e.ty-270);g.lineTo(e.tx,e.ty);g.stroke();
            g.strokeStyle='#fa5771';g.lineWidth=9*(1-p)+2;g.beginPath();g.moveTo(e.tx+25,e.ty-230);g.lineTo(e.tx+6,e.ty);g.stroke();
            for(let k=0;k<4;k++){g.strokeStyle=k%2?'#ff597b':'#ffe995';g.lineWidth=5*(1-p)+1;g.beginPath();g.arc(e.tx,e.ty,rad+k*19,0,7);g.stroke();}
            g.translate(e.tx,e.ty);g.rotate(age*6);g.strokeStyle='#fff2b4';g.lineWidth=3;
            for(let k=0;k<8;k++){const n=k*Math.PI/4;g.beginPath();g.moveTo(Math.cos(n)*22,Math.sin(n)*22);g.lineTo(Math.cos(n)*(90+p*75),Math.sin(n)*(90+p*75));g.stroke();}
            g.restore();
          }else if(e.kind==='damage'){
            const amount=e.amount||0;
            const label=formatCombatNumber(amount);
            const rise=age*90,spread=((e.id%5)-2)*6;
            g.save();g.textAlign='center';g.textBaseline='middle';g.font='900 24px system-ui,sans-serif';
            g.shadowBlur=0;g.shadowColor='#142944';
            g.lineWidth=5;g.strokeStyle='#122139';
            g.strokeText(label,e.x+spread,e.y-25-rise);
            g.fillStyle=e.dot?'#a1f2a1':e.shield?'#85d9ff':'#fff2a5';
            g.fillText(label,e.x+spread,e.y-25-rise);
            g.restore();
          }else if(e.kind==='boss-skill'){
            const r=Math.min(260,e.radius||85)*Math.min(1,age/.3);
            g.strokeStyle=e.skill==='jam'?'#e7a2ff':e.skill==='shield'?'#80eeff':'#ffc47e';
            g.lineWidth=7*(1-age/.45);
            g.beginPath();g.arc(e.x,e.y,r,0,Math.PI*2);g.stroke();
            g.font='bold 17px sans-serif';g.fillStyle=g.strokeStyle;
            g.fillText(e.name||'BOSS SKILL',e.x-60,e.y-42-age*25);
          }else if(e.kind==='dark-transfer'){
            // Bounded purple strands travel from the fallen enemy to survivors.
            const phase=Math.min(1,age/.45),progress=Math.min(1,phase*1.65);
            g.save();g.strokeStyle='#bb6cff';g.shadowColor='#a249f1';g.shadowBlur=10;
            g.lineWidth=3.5*(1-phase)+1;
            for(const target of e.targets||[]){
              const x=e.x+(target.x-e.x)*progress,y=e.y+(target.y-e.y)*progress;
              g.beginPath();g.moveTo(e.x,e.y-7);
              g.quadraticCurveTo((e.x+target.x)/2,(e.y+target.y)/2-32,x,y);g.stroke();
              g.beginPath();g.fillStyle='#e7b5ff';g.arc(x,y,3.5+4*(1-phase),0,7);g.fill();
            }
            g.strokeStyle='#e4a2ff';g.lineWidth=4*(1-phase);
            g.beginPath();g.arc(e.x,e.y,9+phase*90,0,7);g.stroke();
            g.shadowBlur=0;
            g.fillStyle='#f0cfff';g.font='bold 18px sans-serif';
            g.fillText('+'+formatCombatNumber(e.amount)+' HP',e.x-12,e.y-26-age*52);
            g.restore();
          }else if(e.kind==='mark'||e.kind==='charged'){
            const isMark=e.kind==='mark';
            g.strokeStyle=isMark?'#d6a4ff':'#ffe695';
            g.lineWidth=isMark?3:7;
            g.beginPath();g.arc(e.x,e.y,8+age*(isMark?56:125),0,Math.PI*2);g.stroke();
            if(isMark){g.fillStyle='#efd1ff';g.font='bold 18px sans-serif';g.fillText('⌖',e.x-9,e.y-25-age*36);}
            else{g.fillStyle='#ffe9a4';g.font='bold 23px sans-serif';g.fillText('✦',e.x-12,e.y-28-age*45);}
          }else if(e.kind==='rift'){
            const phase=Math.min(1,age/.45);
            g.save();g.strokeStyle='#c27aff';g.fillStyle='#e3baff';
            g.lineWidth=7*(1-phase)+1;g.shadowColor='#bb68ff';g.shadowBlur=10;
            g.beginPath();g.ellipse(e.x,e.y,13+65*phase,33+90*phase,phase*.55,0,Math.PI*2);g.stroke();
            g.font='bold 19px sans-serif';g.fillText('✦ 균열 증원',e.x+25,e.y-32-phase*30);
            g.restore();
          }else if(e.kind==='kill'){
            const pieces=e.split?9:e.size>=28?13:5;
            g.strokeStyle=e.color||'#fff3b9';g.lineWidth=2+Math.max(0,4-age*10);
            g.beginPath();g.arc(e.x,e.y,5+age*(e.size>=28?100:60),0,7);g.stroke();
            for(let j=0;j<pieces;j++){
              const angle=6.283*j/pieces+e.id*.4,rad=(12+age*(e.split?88:115))*(e.size>=28?1.4:1);
              g.fillStyle=j%2?'#e6f8ff':e.color||'#ffde9e';
              g.beginPath();g.arc(e.x+Math.cos(angle)*rad,e.y-7+Math.sin(angle)*rad,Math.max(1,(e.split?5:3)*(1-age/.45)),0,7);g.fill();
            }
          }else if(e.kind==='upgrade'){
            g.strokeStyle=e.level>=4?'#94fff3':'#ffdf8a';g.lineWidth=7-age*9;
            g.beginPath();g.arc(e.x,e.y,16+age*120,0,7);g.stroke();
            for(let j=0;j<7;j++){const a=age*8+j*6.28/7;g.fillStyle='#fff4b3';g.beginPath();g.arc(e.x+Math.cos(a)*(21+age*50),e.y-20+Math.sin(a)*(21+age*50),4,0,7);g.fill();}
          }else if(e.kind==='arc'){
            g.strokeStyle=e.type==='aurora'?'#72ffde':'#a4ebff';g.lineWidth=e.type==='aurora'?5:3;
            g.beginPath();g.moveTo(e.x,e.y-13);
            for(let j=1;j<=6;j++){const a=j/6;g.lineTo(e.x+(e.tx-e.x)*a+(j%2?-11:11),e.y-13+(e.ty-e.y)*a);}
            g.lineTo(e.tx,e.ty);g.stroke();
          }else if(e.kind==='income'){
            g.fillStyle='#ffe890';g.font='bold 27px sans-serif';g.fillText('✦',e.x-8,e.y-20-age*55);
          }else if(e.kind==='heal'){
            g.strokeStyle='#b4f6a3';g.lineWidth=5;g.beginPath();g.moveTo(e.x-14,e.y-24);g.lineTo(e.x+14,e.y-24);g.moveTo(e.x,e.y-38);g.lineTo(e.x,e.y-10);g.stroke();
          }else if(e.type==='soldier'){g.beginPath();g.moveTo(e.x,e.y-20);for(let j=1;j<7;j++)g.lineTo(e.x+(e.tx-e.x)*j/7+(j%2?8:-8),e.y-20+(e.ty-e.y+20)*j/7);g.lineTo(e.tx,e.ty);g.stroke();}
          else if(e.type==='rail'){g.beginPath();g.moveTo(e.tx-40,e.ty-100);g.lineTo(e.tx,e.ty);g.stroke();g.save();g.translate(e.tx,e.ty);g.rotate(age*6);g.fillStyle='#fff7b6';g.beginPath();for(let j=0;j<8;j++){const a=j*Math.PI/4,rad=j%2?6:24;g.lineTo(Math.cos(a)*rad,Math.sin(a)*rad);}g.closePath();g.fill();g.restore();}
          else if(e.type==='sonic'){for(let j=0;j<3;j++){g.beginPath();g.arc(e.tx,e.ty,6+age*120+j*10,0,7);g.stroke();}}
          else if(e.kind==='melee'){drawMelee(g,e,age);}
          else if(e.kind==='ranged'){const f=Math.min(1,age/.15);g.fillStyle='#fff3bf';g.beginPath();g.arc(e.x+(e.tx-e.x)*f,e.y-20+(e.ty-e.y+20)*f,5,0,7);g.fill();}
          else if(e.kind==='splash'){g.lineWidth=5;g.beginPath();g.arc(e.tx,e.ty,12+age*100,0,7);g.stroke();for(let j=0;j<6;j++){const a=j*6.28/6;g.fillStyle='#ffdd83';g.fillRect(e.tx+Math.cos(a)*age*120,e.ty+Math.sin(a)*age*120,5,5);}}
          else {g.beginPath();g.arc(e.tx??e.x,e.ty??e.y,8+age*70,0,7);g.stroke();}g.globalAlpha=1;g.shadowBlur=0;}
        if(this.preview&&this.pointer&&f===field){const p={x:this.pointer.x-offset,y:this.pointer.y},ok=canPlace(state,field,p.x,p.y);g.fillStyle=ok?'#9ccf7922':'#eb807b33';g.strokeStyle=ok?'#c1e08c':'#ed887d';g.beginPath();g.arc(p.x,p.y,TOWERS[this.preview].range,0,7);g.fill();g.stroke();g.globalAlpha=.65;this.tower(g,{...p,type:this.preview,level:0},now);g.globalAlpha=1;}
      }
      g.restore();
    }
    g.restore();
    if(lobby){const grad=g.createLinearGradient(0,0,0,this.height);grad.addColorStop(0,'#101b1230');grad.addColorStop(.45,'#101b1200');grad.addColorStop(1,'#18234780');g.fillStyle=grad;g.fillRect(0,0,this.width,this.height);}
  }
  tower(g,t,time,clock=time){const d=TOWERS[t.type],c=d.color,lev=t.level||0,stats=towerStats(t);g.save();g.translate(t.x,t.y);g.fillStyle='#18294b55';g.beginPath();g.ellipse(4,6,25,13,0,0,7);g.fill();g.strokeStyle=RARITIES[d.rarity].color;g.lineWidth=2;g.beginPath();g.ellipse(0,3,25,12,0,0,7);g.stroke();
    drawTowerPresence(g,t,time,stats,this.reducedEffects?0:1);
    if(['buff','summon','chain'].includes(stats.kind)||t.type==='sonic'){g.strokeStyle=c+'99';g.beginPath();g.ellipse(0,3,29+Math.sin(time*3)*5,14,0,0,7);g.stroke();}
    if(t.type==='frieza'){
      const phase=time*1.4,level=t.level||0;
      g.save();g.shadowColor='#be6cff';g.shadowBlur=11+level*3;
      for(let k=0;k<3;k++){
        g.strokeStyle=k%2?'#f1beff':'#9042ed';g.lineWidth=2.3+level*.45;
        g.beginPath();g.ellipse(0,-27,31+k*6+Math.sin(phase+k)*3,12+k*2.4,phase*.25+k*.4,0,Math.PI*2);g.stroke();
      }
      if(level>=2)for(let i=0;i<4+level;i++){
        const a=phase*.64+i*Math.PI*2/(4+level);
        g.fillStyle=i%2?'#f3baff':'#9150e9';
        g.beginPath();g.arc(Math.cos(a)*(39+level*2),-30+Math.sin(a)*26,2+level*.45,0,Math.PI*2);g.fill();
      }
      g.restore();
    }
    if(t.type==='oldgod'){
      const phase=time*1.2;g.save();g.shadowColor='#ffcf61';g.shadowBlur=15;g.lineWidth=3;
      for(let k=0;k<3;k++){g.strokeStyle=k%2?'#f1587cbb':'#ffde89cc';g.beginPath();
        g.ellipse(0,-25,47+k*9+Math.sin(phase+k)*3,13+k*4,phase*.22+k*.3,0,7);g.stroke();}
      for(let k=0;k<7;k++){const ang=phase*.7+k*Math.PI*2/7;g.fillStyle=k%2?'#ff6476':'#ffe36a';
        g.beginPath();g.arc(Math.cos(ang)*55,-29+Math.sin(ang)*22,3.5,0,7);g.fill();}
      g.restore();
    }
    if(lev){
      const phase=time*(1+lev*.15)+t.id;
      g.save();g.globalAlpha=.22+Math.sin(phase*3)*.08;
      g.strokeStyle=lev>=4?'#91fff0':lev>=3?'#ffdf94':c;g.lineWidth=1+lev*.6;
      g.beginPath();g.ellipse(0,6,31+lev*3+Math.sin(phase)*2,17+lev*1.6,0,0,Math.PI*2);g.stroke();
      if(lev>=3){for(let i=0;i<lev;i++){const ang=phase+i*Math.PI*2/lev;g.fillStyle=i%2?'#ffefb5':'#a9ecff';g.beginPath();g.arc(Math.cos(ang)*(32+lev*2),-28+Math.sin(ang)*(20+lev*2),3+lev*.3,0,7);g.fill();}}
      g.restore();
    }
    if(t.jammedUntil>clock){
      g.strokeStyle='#ef9dff';g.lineWidth=3;g.beginPath();g.arc(0,-20,30,0,7);g.stroke();
      g.fillStyle='#fcceff';g.font='bold 20px sans-serif';g.fillText('⚡',-10,-54);
    }
    const img=sprite(t.type,t.skin||'default',lev),size=(t.type==='oldgod'?132:t.type==='frieza'?112:75)+lev*3,bob=Math.sin(time*(t.type==='sonic'?5:2)+t.x)*1.6;
    // sprite() returns a raster-cache entry, not the HTMLImageElement itself.
    if(img.ready&&img.source){
      // Keep tactical weapons pointing toward their actual targets, rather
      // than leaving non-melee fighters aiming right while they shoot left.
      // Buildings and stationary relics remain orientation-independent.
      const stationary=['banker','workshop','starseed'].includes(t.type);
      const mirror=!stationary&&Number.isFinite(t.angle)&&Math.cos(t.angle)<-1e-6;
      if(mirror){g.save();g.scale(-1,1);}
      g.drawImage(img.source,-size*.5,-size*.87+bob,size,size*210/180);
      if(mirror)g.restore();
    }
    g.fillStyle='#ffe892';for(let i=0;i<lev;i++)g.fillRect(-8+i*7,25,4,4);g.restore();
  }
  summonReworked(g,u,time){
    const level=u.level||0,tint=u.type==='spirit'?'#82faff':u.type==='phoenix'?'#ffbe74':
      u.type==='papercrane'?'#fff1cc':u.type==='crystalspider'?'#94ffed':'#b8efa0';
    const bob=Math.sin(time*(u.role==='orbit'?14:9)+u.id)*2.8;
    const drawPath=(points,fill,stroke='#30435d',width=2)=>{
      g.beginPath();g.moveTo(points[0][0],points[0][1]);
      for(let i=1;i<points.length;i++)g.lineTo(points[i][0],points[i][1]);
      g.closePath();g.fillStyle=fill;g.fill();g.strokeStyle=stroke;g.lineWidth=width;g.stroke();
    };
    const glow=(x,y,r,color)=>{
      g.fillStyle=color;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();
    };
    g.save();g.translate(u.x,u.y+bob);
    // The foot shadow and aura show lane travel versus aerial orbiting.
    g.globalAlpha=.36;g.fillStyle='#18293c';g.beginPath();
    g.ellipse(0,u.role==='orbit'?17:14,u.role==='orbit'?21:16,5,0,0,Math.PI*2);g.fill();g.globalAlpha=1;
    if(u.role==='orbit'&&u.type==='spirit'){
      const rot=Math.sin(time*55+u.id),size=1+level*.085;
      g.save();g.scale(size,size);
      if(!this.reducedEffects){g.shadowColor='#6cecff';g.shadowBlur=level>=3?13:5;}
      // Swept three-dimensional hull, side rotors, and progressively larger guns.
      drawPath([[-21,-22],[-9,-29],[13,-29],[25,-19],[18,-5],[-15,-4]],'#29435c','#8ee4f2',3);
      drawPath([[-26,-22],[-41,-26],[-36,-15],[-23,-11]],'#2c3c58','#9fd1e3',2);
      drawPath([[24,-22],[42,-26],[35,-13],[22,-11]],'#2c3c58','#9fd1e3',2);
      for(const x of [-34,34]){
        g.strokeStyle='#bffeff';g.lineWidth=2+level*.17;g.beginPath();
        g.ellipse(x,-24,14+rot*2,3.5,0,0,Math.PI*2);g.stroke();
        glow(x,-24,3.6,'#5fe8ff');
      }
      drawPath([[-12,-23],[0,-32],[17,-21],[12,-8],[-8,-8]],'#4a7690','#bbfcff',2);
      g.fillStyle='#adffff';g.fillRect(-8,-19,19,4);
      g.fillStyle='#16374d';g.fillRect(-9,-7,17,12);
      g.strokeStyle='#eaffff';g.lineWidth=3+Math.min(3,level);
      g.beginPath();g.moveTo(0,2);g.lineTo(0,18);g.stroke();
      glow(0,17,3.5+level*.55,'#8dffff');
      if(level>=2){drawPath([[-25,-5],[-37,3],[-8,8]],'#448dae','#e4ffff',2);
        drawPath([[25,-5],[38,3],[9,8]],'#448dae','#e4ffff',2);}
      if(level>=3){for(const x of [-17,17]){g.fillStyle='#a0ffff';g.fillRect(x-4,5,8,10);}}
      if(level>=5){g.strokeStyle='#fff7c4';g.lineWidth=2;g.beginPath();g.arc(0,-14,39,0,Math.PI*2);g.stroke();}
      g.restore();
    }else if(u.role==='orbit'&&u.type==='phoenix'){
      const flap=Math.sin(time*12+u.id)*10;
      if(!this.reducedEffects){g.shadowColor='#ff8759';g.shadowBlur=level>=3?16:9;}
      drawPath([[-8,-19],[-32,-34-flap],[-35,-6],[-16,-8],[-9,1]],'#f67855','#ffc774',2.5);
      drawPath([[8,-19],[34,-34-flap],[35,-6],[16,-8],[9,1]],'#f67855','#ffc774',2.5);
      drawPath([[-5,-4],[-17,18],[-2,9],[5,21],[11,2]],'#ffb057','#ffe18b',2);
      drawPath([[-11,-22],[0,-34],[12,-21],[8,-5],[-8,-5]],'#ff9460','#ffe39a',2.5);
      drawPath([[-7,-29],[0,-43-level*2],[9,-28]],'#ffe8a0','#ffffff',2);
      glow(0,-18,6+level*.65,'#ffe99f');glow(-4,-22,2,'#983c56');glow(5,-22,2,'#983c56');
      if(level>=2){for(const x of [-28,28])glow(x,-14,3+level*.3,'#ffd576');}
      if(level>=3){g.strokeStyle='#fff0a2';g.lineWidth=2;g.beginPath();g.arc(0,-19,28+level*3,0,Math.PI*2);g.stroke();}
      if(level>=5){for(let i=0;i<6;i++){const a=time*3+i*Math.PI/3;glow(Math.cos(a)*33,-20+Math.sin(a)*19,3,'#fff1b7');}}
    }else if(u.type==='summoner'){
      // Reverse marching goblin infantry with expanding shield and helm.
      g.fillStyle='#2a614c';g.fillRect(-12,-1,9,17);g.fillRect(5,-1,9,17);
      drawPath([[-13,-25],[-20,-15],[-14,0],[13,0],[18,-18],[10,-29]],'#578868','#294b48',2);
      glow(-5,-26,10+level*.65,'#83bc76');
      drawPath([[-15,-33],[-8,-42],[9,-42],[17,-33]],level>=3?'#b5c2ad':'#536d5c','#314852',2);
      g.fillStyle='#32464b';g.fillRect(-10,-28,6,4);g.fillRect(5,-28,6,4);
      const shield=10+level*2;
      drawPath([[-24,-18],[-24-shield,-15],[-22-shield,2],[-19,7]],level>=2?'#b9da9c':'#729a75','#e3f2ba',2.4);
      g.strokeStyle='#f3e5af';g.lineWidth=3;
      g.beginPath();g.moveTo(20,-17);g.lineTo(28+level*2,-32-level);g.stroke();
      if(level>=3)glow(28+level*2,-32-level,4,'#d9ffa5');
    }else if(u.type==='papercrane'){
      const wings=Math.sin(time*10+u.id)*8,size=1+level*.11;
      g.save();g.scale(size,size);
      drawPath([[-5,-8],[-29,-22-wings],[-36,-6],[-12,-1]],'#fff7e8','#bea8a3',2);
      drawPath([[5,-8],[29,-22-wings],[36,-6],[12,-1]],'#fff7e8','#bea8a3',2);
      drawPath([[-12,-17],[4,-30],[17,-12],[2,3]],'#fffef5','#d6bcb4',2);
      drawPath([[3,-28],[11,-42],[12,-17]],'#f4e8d0','#b8a5a5',2);
      drawPath([[-4,-4],[0,15],[10,-4]],'#efe0c8','#c9b5af',2);
      g.strokeStyle='#c7a9b3';g.lineWidth=1.6;
      g.beginPath();g.moveTo(-10,-15);g.lineTo(12,-12);g.lineTo(1,-27);g.stroke();
      if(level>=2){g.strokeStyle='#ffe8a3';g.lineWidth=2;g.beginPath();g.arc(0,-17,23,0,Math.PI*2);g.stroke();}
      g.restore();
    }else if(u.type==='crystalspider'){
      const spread=level*1.1;
      g.strokeStyle='#7cefe1';g.lineWidth=3+level*.2;
      for(let i=0;i<4;i++){
        const py=-23+i*7,offset=Math.sin(time*11+i+u.id)*3;
        g.beginPath();g.moveTo(-6,py);g.lineTo(-21-spread,py-11+offset);
        g.lineTo(-27-spread,py+3+offset);
        g.moveTo(6,py);g.lineTo(21+spread,py-11+offset);
        g.lineTo(27+spread,py+3+offset);g.stroke();
      }
      drawPath([[0,-39-level*2],[14+level,-19],[0,6],[-14-level,-19]],'#4fc7bc','#dbfff8',3);
      drawPath([[0,-33],[9,-17],[0,-6],[-9,-17]],'#affff3','#e8ffff',2);
      glow(-5,-17,3,'#fff');glow(5,-17,3,'#fff');
      if(level>=2){g.strokeStyle='#86fff1';g.lineWidth=2;g.beginPath();g.ellipse(0,-17,23+level*3,30+level,0,0,Math.PI*2);g.stroke();}
      if(level>=4){for(let i=0;i<5;i++){const a=i*Math.PI*2/5+time;glow(Math.cos(a)*19,-19+Math.sin(a)*24,2.5,'#a2fff2');}}
    }
    if(u.role==='lane'&&u.maxHp>0){
      const ratio=Math.max(0,Math.min(1,(u.hp||0)/u.maxHp));
      g.fillStyle='#102537d9';g.fillRect(-21,23,42,6);
      g.fillStyle=ratio>.5?'#8ef8a2':ratio>.25?'#f1cf75':'#f47c89';
      g.fillRect(-19,24,38*ratio,3.6);
      g.strokeStyle='#e1fbef';g.lineWidth=1;g.strokeRect(-21,23,42,6);
    }
    // Equipment rank has a small, legible grade halo instead of massive VFX.
    if(level>0){g.fillStyle=tint;for(let i=0;i<Math.min(level,5);i++)glow(-15+i*7,-48,2.5,tint);}
    g.restore();
  }
  christmasCookie(g,u,time){
    const bob=u.phase==='firing'?0:Math.sin(time*8+u.id)*2;
    const variant=u.cookieVariant||0,level=u.level||0;
    g.save();g.translate(u.x,u.y+bob);g.scale(.85+level*.035,.85+level*.035);
    g.fillStyle='#273a4d44';g.beginPath();g.ellipse(0,13,24,8,0,0,7);g.fill();
    // Four genuinely different cookie silhouettes; newly introduced as
    // the cookie house evolves. Frosted ginger / star / cocoa / peppermint.
    const outline='#fff1db';g.lineJoin='round';
    if(variant===1){
      const pts=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?12:28;pts.push([Math.cos(a)*r,Math.sin(a)*r-15]);}
      g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();
      g.fillStyle='#dfb777';g.fill();g.strokeStyle=outline;g.lineWidth=4;g.stroke();
    }else if(variant===2){
      g.fillStyle='#80503d';g.beginPath();g.roundRect(-22,-41,44,56,10);g.fill();
      g.strokeStyle='#d3a78f';g.lineWidth=4;g.stroke();
      g.strokeStyle='#fff3e7';g.lineWidth=5;
      g.beginPath();g.moveTo(-17,-33);g.lineTo(17,-33);g.moveTo(-16,8);g.lineTo(16,8);g.stroke();
    }else if(variant===3){
      g.fillStyle='#f6e1c9';g.beginPath();g.arc(0,-17,27,0,7);g.fill();
      g.strokeStyle='#dc697c';g.lineWidth=8;for(let i=0;i<6;i++){
        const a=i*Math.PI/3;g.beginPath();g.moveTo(0,-17);g.lineTo(Math.cos(a)*25,-17+Math.sin(a)*25);g.stroke();
      }
    }else{
      // Traditional gingerbread soldier as in reference 3.
      g.fillStyle='#bf8458';g.beginPath();
      g.arc(0,-42,15,0,7);g.fill();
      const pts=[[-15,-32],[-31,-25],[-27,-10],[-14,-14],[-12,13],[0,15],[11,13],[14,-15],[28,-9],[32,-24],[14,-32]];
      g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();
      g.strokeStyle=outline;g.lineWidth=3.6;g.stroke();
      g.strokeStyle=outline;g.beginPath();g.arc(0,-42,15,0,7);g.stroke();
      g.strokeStyle='#fff1e1';g.lineWidth=2.7;g.beginPath();
      g.moveTo(-24,-23);g.lineTo(-19,-20);g.lineTo(-22,-16);g.moveTo(23,-24);g.lineTo(18,-21);g.lineTo(22,-17);g.stroke();
    }
    g.fillStyle='#fff8ed';for(const x of [-7,7]){g.beginPath();g.arc(x,-27,2.5,0,7);g.fill();}
    g.strokeStyle='#fff1dc';g.lineWidth=2.5;g.beginPath();g.arc(0,-19,8,.2,Math.PI-.2);g.stroke();
    for(const [x,y,c] of [[0,-8,'#fa8292'],[0,1,'#a1e3a2']]){g.fillStyle=c;g.beginPath();g.arc(x,y,3.5,0,7);g.fill();}
    if(u.phase==='firing'){
      g.strokeStyle='#ffedae';g.lineWidth=2;g.beginPath();g.arc(0,-20,30+Math.sin(time*5)*3,0,7);g.stroke();
    }
    if(u.maxHp>0){
      const ratio=Math.max(0,Math.min(1,u.hp/u.maxHp));
      g.fillStyle='#2e3345';g.fillRect(-23,22,46,6);
      g.fillStyle=ratio>.5?'#abf5a5':'#ee929e';g.fillRect(-21,23,42*ratio,4);
    }
    g.restore();
  }
  summon(g,u,time){
    if(u.role==='cookie'){this.christmasCookie(g,u,time);return;}
    if(u.role==='orbit'||u.role==='lane'){this.summonReworked(g,u,time);return;}
    const bob=Math.sin(time*11+u.id)*3;
    g.save();g.translate(u.x,u.y+bob);
    g.fillStyle='#17343c55';g.beginPath();g.ellipse(0,13,16,6,0,0,7);g.fill();
    if(u.type==='crystalspider'){
      // The spiders are crystalline arachnids, not generic goblin placeholders.
      g.fillStyle='#59c8c0';g.strokeStyle='#c7fff5';g.lineWidth=3;
      for(let i=0;i<4;i++){
        const py=-11+i*6;
        g.beginPath();g.moveTo(-6,py);g.lineTo(-24-i%2*4,py-11+i*3);
        g.moveTo(6,py);g.lineTo(24+i%2*4,py-11+i*3);g.stroke();
      }
      g.beginPath();g.moveTo(0,-27);g.lineTo(12,-9);g.lineTo(0,13);g.lineTo(-12,-9);
      g.closePath();g.fill();g.stroke();
      g.fillStyle='#efffff';g.fillRect(-6,-11,4,4);g.fillRect(4,-11,4,4);
      g.restore();return;
    }
    if(u.type==='spirit'){
      // The former lantern ghost is now a lightweight tactical scouting drone.
      g.shadowColor='#86cde5';g.shadowBlur=9;
      g.fillStyle='#304c62';g.strokeStyle='#82b8ca';g.lineWidth=3;
      g.beginPath();g.roundRect(-14,-18,28,18,5);g.fill();g.stroke();
      g.fillStyle='#78c6d3';g.fillRect(-7,-13,14,6);
      g.strokeStyle='#637c8b';g.lineWidth=4;
      g.beginPath();g.moveTo(-9,-18);g.lineTo(-23,-23);
      g.moveTo(9,-18);g.lineTo(23,-23);g.stroke();
      g.strokeStyle='#a7f0e7';g.lineWidth=3;
      g.beginPath();g.ellipse(-23,-24,13,4,0,0,7);g.stroke();
      g.beginPath();g.ellipse(23,-24,13,4,0,0,7);g.stroke();
      g.shadowBlur=0;g.restore();return;
    }
    if(u.type==='phoenix'){
      g.shadowColor='#ffaf69';g.shadowBlur=13;
      g.fillStyle='#ff9e63';g.beginPath();g.moveTo(-3,-6);g.lineTo(-25,-20);g.lineTo(-19,6);g.lineTo(-7,3);
      g.lineTo(0,19);g.lineTo(7,3);g.lineTo(20,6);g.lineTo(25,-20);g.lineTo(4,-6);g.fill();
      g.fillStyle='#ffe08a';g.beginPath();g.arc(0,-7,10,0,7);g.fill();
      g.fillStyle='#61485f';g.fillRect(-4,-8,3,3);g.fillRect(3,-8,3,3);
      g.shadowBlur=0;g.restore();return;
    }
    g.fillStyle='#5b8750';g.fillRect(-8,2,6,12);g.fillRect(2,2,6,12);
    g.fillStyle='#7ac77a';g.beginPath();g.moveTo(-8,-7);g.lineTo(-19,-13);g.lineTo(-14,4);g.lineTo(-8,2);g.moveTo(8,-7);g.lineTo(19,-13);g.lineTo(14,4);g.lineTo(8,2);g.fill();
    g.fillStyle='#96eb80';g.beginPath();g.arc(0,-5,11,0,7);g.fill();
    g.fillStyle='#243e55';g.fillRect(-7,-8,4,4);g.fillRect(3,-8,4,4);
    g.strokeStyle='#c9fb9c';g.lineWidth=2;g.beginPath();g.moveTo(-2,1);g.lineTo(2,1);g.stroke();
    g.restore();
  }
  enemy(g,e,time,clock=time){drawEnemy(g,e,time,clock);}
}
