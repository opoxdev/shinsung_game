import { MAPS, WORLD, TOWERS, ENEMIES, RARITIES, formatDamage } from './data.js';
import { pointOnPath, pathDistance, towerStats, canPlace } from './engine.js';
import { character } from './art.js';
import { makeTerrain } from './terrain.js';
import { drawEnemy, drawEnemyOverlay } from './enemy-art.js';
import { TERRAIN_MARGIN, constrainCamera } from './presentation.js';
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
      const c=typeof OffscreenCanvas==='function'?new OffscreenCanvas(256,300):document.createElement('canvas');c.width=256;c.height=300;
      c.getContext('2d').drawImage(img,0,0,256,300);
      entry.source=typeof c.transferToImageBitmap==='function'?c.transferToImageBitmap():c;entry.ready=true;
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
      const offset=f*2100;g.save();g.translate(offset,0);
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
        let damageLabels=0;
        for(const e of state.events){if(e.kind==='damage'&&e.field===f&&(this.reducedEffects||damageLabels++>=24))continue;const age=state.time-e.time;if(e.field!==f||age<0||age>.45||!this.visible(e.x+offset,e.y,180))continue;g.globalAlpha=1-age/.45;g.strokeStyle=TOWERS[e.type]?.color||ENEMIES[e.type]?.color||'#ffd88c';g.lineWidth=e.type==='rail'?5:3;g.shadowColor=g.strokeStyle;g.shadowBlur=0;
          if(e.kind==='divine'){
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
          }else if(e.kind==='mark'||e.kind==='charged'){
            const isMark=e.kind==='mark';
            g.strokeStyle=isMark?'#d6a4ff':'#ffe695';
            g.lineWidth=isMark?3:7;
            g.beginPath();g.arc(e.x,e.y,8+age*(isMark?56:125),0,Math.PI*2);g.stroke();
            if(isMark){g.fillStyle='#efd1ff';g.font='bold 18px sans-serif';g.fillText('⌖',e.x-9,e.y-25-age*36);}
            else{g.fillStyle='#ffe9a4';g.font='bold 23px sans-serif';g.fillText('✦',e.x-12,e.y-28-age*45);}
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
    if(['buff','summon','chain'].includes(stats.kind)||t.type==='sonic'){g.strokeStyle=c+'99';g.beginPath();g.ellipse(0,3,29+Math.sin(time*3)*5,14,0,0,7);g.stroke();}
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
    const img=sprite(t.type,t.skin||'default',lev),size=(t.type==='oldgod'?132:75)+lev*3,bob=Math.sin(time*(t.type==='sonic'?5:2)+t.x)*1.6;
    if(img.complete&&img.naturalWidth){
      // Keep tactical weapons pointing toward their actual targets, rather
      // than leaving non-melee fighters aiming right while they shoot left.
      // Buildings and stationary relics remain orientation-independent.
      const stationary=['banker','workshop','starseed'].includes(t.type);
      const mirror=!stationary&&Number.isFinite(t.angle)&&Math.cos(t.angle)<-1e-6;
      if(mirror){g.save();g.scale(-1,1);}
      g.drawImage(img,-size*.5,-size*.87+bob,size,size*210/180);
      if(mirror)g.restore();
    }
    g.fillStyle='#ffe892';for(let i=0;i<lev;i++)g.fillRect(-8+i*7,25,4,4);g.restore();
  }
  summon(g,u,time){
    const bob=Math.sin(time*11+u.id)*3;
    g.save();g.translate(u.x,u.y+bob);
    g.fillStyle='#17343c55';g.beginPath();g.ellipse(0,13,16,6,0,0,7);g.fill();
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
