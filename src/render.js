import { MAPS, WORLD, TOWERS, ENEMIES, RARITIES } from './data.js';
import { pointOnPath, pathDistance, towerStats, canPlace } from './engine.js';
import { character } from './art.js';
import { makeTerrain } from './terrain.js';
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
export const formatCombatNumber=n=>Number.isFinite(n)?Math.round(Math.max(0,n)).toLocaleString('ko-KR'):'0';
const sprites=new Map();
function sprite(id,skin,level=0){const key=id+'|'+skin+'|'+level;if(!sprites.has(key)){const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(character(id,skin,level));sprites.set(key,img);}return sprites.get(key);}
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
        for(const e of state.enemies)if(e.field===f&&this.visible(e.x+offset,e.y))this.enemy(g,e,now,state.time);
        for(const u of state.units)if(u.field===f&&this.visible(u.x+offset,u.y))this.summon(g,u,now);
        for(const e of state.events){const age=state.time-e.time;if(e.field!==f||age<0||age>.45||!this.visible(e.x+offset,e.y,180))continue;g.globalAlpha=1-age/.45;g.strokeStyle=TOWERS[e.type]?.color||ENEMIES[e.type]?.color||'#ffd88c';g.lineWidth=e.type==='rail'?5:3;g.shadowColor=g.strokeStyle;g.shadowBlur=8;
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
            g.shadowBlur=5;g.shadowColor='#142944';
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
  enemy(g,e,time,clock=time){
    const d=ENEMIES[e.type],r=d.size||12;
    const mech=['mk1','mk2','chain','mecha','sentinel','overload'].includes(e.type);
    const giant=(d.size||12)>=21;
    const fast=(d.speed||0)>=105;
    const armored=(d.armor||0)>.1||(d.shield||0)>0;
    const pulse=Math.sin(time*6+e.id),leg=Math.sin(time*(fast?18:8)+e.id)*3;
    g.save();g.translate(e.x,e.y);
    if(d.eventOnly==='temple_of_ruin'){
      const royal=e.type==='temple_deity',boss=r>=35,pulse=Math.sin(time*3+e.id);
      g.translate(0,pulse*2);g.fillStyle='#140e2266';g.beginPath();g.ellipse(3,10,r*1.25,r*.5,0,0,7);g.fill();
      if(boss){g.shadowColor=royal?'#ffd45f':'#fa6585';g.shadowBlur=16;g.strokeStyle=royal?'#ffe9ae':'#bb779b';
        g.lineWidth=royal?7:4;g.beginPath();g.ellipse(0,-r*1.46,r*1.05,r*.24,0,0,7);g.stroke();g.shadowBlur=0;}
      g.fillStyle='#34283e';g.beginPath();g.moveTo(-r*.86,-r*.56);g.lineTo(-r*.99,r*.65);
      g.lineTo(r*.99,r*.65);g.lineTo(r*.86,-r*.56);g.fill();g.strokeStyle=d.color;g.lineWidth=boss?4:2.5;
      g.strokeRect(-r*.75,-r*.48,r*1.5,r*1.14);
      g.fillStyle=royal?'#fff0d3':d.color;g.beginPath();g.roundRect(-r*.56,-r*1.12,r*1.12,r*.87,r*.18);g.fill();
      for(let k=-1;k<=1;k++){g.beginPath();g.moveTo(k*r*.58,-r*.56);g.lineTo(k*r*.54-r*.2,-r*(boss?1.78:1.43));
        g.lineTo(k*r*.54+r*.2,-r*.56);g.fill();}
      g.fillStyle='#351a38';g.fillRect(-r*.4,-r*.85,r*.8,r*.13);
      g.fillStyle='#ffbd65';g.fillRect(-r*.3,-r*.83,r*.15,r*.1);g.fillRect(r*.15,-r*.83,r*.15,r*.1);
      g.shadowColor='#ff4d4d';g.shadowBlur=10;g.fillStyle='#ffc45a';g.beginPath();
      g.arc(0,-r*.1,r*(.2+pulse*.02),0,7);g.fill();g.shadowBlur=0;
      if(e.type==='temple_spore'){g.strokeStyle='#ffa4b0';g.lineWidth=3;for(let k=0;k<5;k++){
        const n=k*Math.PI*2/5+time*.4;g.beginPath();g.moveTo(Math.cos(n)*r*.6,Math.sin(n)*r*.6);
        g.lineTo(Math.cos(n)*r*1.5,Math.sin(n)*r*1.5);g.stroke();}}
      if(e.shield>0){g.strokeStyle='#ffeda180';g.lineWidth=3;g.beginPath();g.arc(0,-r*.36,r*1.27,0,7);g.stroke();}
      g.fillStyle='#210e21';g.fillRect(-r,-r*1.92,r*2,5);g.fillStyle=royal?'#ffe07a':'#fb7791';
      g.fillRect(-r,-r*1.92,r*2*Math.max(0,e.hp)/(e.maxHp||1),5);
      g.restore();return;
    }
    // Species-specific, deterministic walking/floating animation: no gameplay randomness.
    if(['ghost','phantom','harpy','warlock'].includes(e.type))g.translate(0,Math.sin(time*4+e.id)*5);
    if(['sprinter','mk2','harpy','overload'].includes(e.type))g.rotate(Math.sin(time*9+e.id)*.075);
    if(e.markUntil>clock){
      g.strokeStyle='#e5b1ff';g.lineWidth=2.5;g.globalAlpha=.85;
      g.beginPath();g.arc(0,-8,r+11+Math.sin(time*7+e.id)*2,0,7);g.stroke();
      g.fillStyle='#ecc1ff';g.font='bold 14px sans-serif';g.fillText('⌖',-6,-r-19);g.globalAlpha=1;
    }
    g.fillStyle='#09203966';g.beginPath();g.ellipse(3,10,r*1.15,r*.55,0,0,7);g.fill();
    if(['doom','apocalypse'].includes(e.type)){
      g.shadowColor=d.color;g.shadowBlur=15+Math.abs(pulse)*8;
      g.strokeStyle=d.color;g.globalAlpha=.55;g.lineWidth=3;
      g.beginPath();g.arc(0,-7,r+7+pulse*3,0,7);g.stroke();g.globalAlpha=1;
    }
    if(fast){g.strokeStyle=d.color;g.globalAlpha=.4;g.lineWidth=3;
      for(let i=0;i<3;i++){g.beginPath();g.moveTo(-r-8-i*8,-8+i*6);g.lineTo(-r-18-i*9,-8+i*6);g.stroke();}g.globalAlpha=1;}
    g.fillStyle=mech?'#536479':'#4b6158';
    g.fillRect(-r*.65,r*.4,r*.45,r*.6+leg);
    g.fillRect(r*.18,r*.4,r*.45,r*.6-leg);
    // Body silhouette: big rectangular brutes, robots with angular chassis, and classic round zombies.
    g.fillStyle=d.color;
    if(mech){g.beginPath();g.moveTo(-r*.95,-r*.6);g.lineTo(r*.8,-r*.8);g.lineTo(r*1.08,r*.45);g.lineTo(-r*.75,r*.7);g.closePath();g.fill();}
    else if(giant||armored){g.beginPath();g.roundRect(-r,-r*.65,r*2,r*1.45,armored?4:10);g.fill();}
    else {g.beginPath();g.ellipse(0,0,r*.78,r*.9,fast?-.18:0,0,7);g.fill();}
    g.fillStyle=mech?'#45536b':'#496a60';
    g.fillRect(-r-5,-r*.45,r*.3,r*.65+leg*.15);
    g.fillRect(r*.75,-r*.45,r*.3,r*.65-leg*.15);
    if(armored){g.fillStyle='#223b50';g.globalAlpha=.7;
      g.fillRect(-r*.7,-r*.25,r*1.4,r*.35);g.fillRect(-r*.65,r*.35,r*1.25,r*.18);g.globalAlpha=1;}
    const headY=-r*.62+pulse*1.1;
    g.fillStyle=mech?'#b3c7ce':giant?'#ded4a7':'#b6d6a3';
    if(mech){g.beginPath();g.moveTo(-r*.67,headY-r*.65);g.lineTo(r*.65,headY-r*.65);g.lineTo(r*.77,headY+r*.12);g.lineTo(-r*.7,headY+r*.2);g.closePath();g.fill();}
    else {g.beginPath();g.roundRect(-r*.65,headY-r*.7,r*1.3,r*.95,giant?5:3);g.fill();}
    if(e.type==='tank'||e.type==='mecha'||e.type==='apocalypse'){
      g.fillStyle='#34475d';g.fillRect(-r*.85,headY-r*.9,r*1.7,r*.38);
      g.fillStyle=d.color;g.fillRect(-r*.35,headY-r*.92,r*.7,r*.15);
    }
    if(e.type==='chain'){g.strokeStyle='#d7d8f7';g.lineWidth=2;
      for(let i=0;i<4;i++){g.beginPath();g.ellipse(-r*.5+i*r*.3,-r*.2+i*3,4,6,1,0,7);g.stroke();}}
    if(['doom','apocalypse'].includes(e.type)){
      g.fillStyle='#fa919e';for(let i=-1;i<=1;i++){g.beginPath();g.moveTo(i*r*.4,headY-r*.65);g.lineTo((i-.3)*r*.4,headY-r*1.25);g.lineTo((i+.3)*r*.4,headY-r*.65);g.fill();}}
    g.fillStyle=mech?'#79f7ff':giant?'#ff6a66':'#283f48';
    g.fillRect(-r*.35,headY-r*.35,r*.19,r*.2);
    g.fillRect(r*.15,headY-r*.35,r*.19,r*.2);
    // Distinctive enemy identities and movement: healing staff, ghost wisp,
    // splitting cores, frost antlers, fire particles and boss sigils.
    if(['ghost','phantom'].includes(e.type)){
      g.save();g.globalAlpha=.58+Math.sin(time*4+e.id)*.17;
      g.strokeStyle='#d6dfff';g.lineWidth=3;
      for(let j=0;j<3;j++){const phase=time*3+j*2;g.beginPath();g.arc((j-1)*r*.8,-r*.2+Math.sin(phase)*r*.5,r*.35,0,7);g.stroke();}
      g.restore();
    }
    if(['harpy','sprinter'].includes(e.type)){
      const wing=Math.sin(time*(e.type==='harpy'?13:20)+e.id)*r*.65;
      g.fillStyle=d.color;g.beginPath();
      g.moveTo(-r*.7,-r*.2);g.quadraticCurveTo(-r*2,-r*1.8+wing,-r*1.8,-r*.1);g.lineTo(-r*.7,r*.2);
      g.moveTo(r*.7,-r*.2);g.quadraticCurveTo(r*2,-r*1.8-wing,r*1.8,-r*.1);g.lineTo(r*.7,r*.2);g.fill();
    }
    if(['medic','warlock'].includes(e.type)){
      g.strokeStyle=e.type==='medic'?'#cbffd1':'#d4a2ff';g.lineWidth=4;
      g.beginPath();g.moveTo(r*.85,-r*.5);g.lineTo(r*1.2,-r*2.3);g.stroke();
      g.save();g.translate(r*1.2,-r*2.4);g.rotate(time*1.8);g.strokeRect(-6,-6,12,12);g.restore();
      for(let j=0;j<3;j++){const phase=time*2+j*2.1;g.fillStyle='#ddffc0';g.beginPath();g.arc(Math.cos(phase)*(r+10),-r+Math.sin(phase)*(r+8),3,0,7);g.fill();}
    }
    if(['splitter','bloater'].includes(e.type)){
      const pulse=Math.sin(time*5+e.id);
      g.fillStyle='#ffe68b';g.beginPath();g.arc(0,-r*.3,5+pulse*2,0,7);g.fill();
      g.strokeStyle='#f2c1ff';g.lineWidth=2;g.beginPath();g.arc(0,-r*.3,r*.53+pulse,0,7);g.stroke();
    }
    if(['frostling','warden','sentinel'].includes(e.type)){
      g.fillStyle='#d6f4ff';for(let side of [-1,1]){
        g.beginPath();g.moveTo(side*r*.65,-r*.45);g.lineTo(side*r*1.3,-r*1.5);g.lineTo(side*r*.82,-r*1.25);g.fill();
      }
    }
    if(['ember','doom','nemesis','oblivion'].includes(e.type)){
      const p=Math.sin(time*7+e.id);
      g.fillStyle=d.color;for(let i=0;i<4;i++){
        const x=(i-1.5)*r*.45,y=-r*.6-(i%2)*r*.4-Math.abs(p)*r*.3;
        g.beginPath();g.moveTo(x-4,y+9);g.quadraticCurveTo(x-5,y-10-Math.abs(p)*8,x+4,y-3);g.quadraticCurveTo(x+8,y+7,x-4,y+9);g.fill();
      }
    }
    if(['juggernaut','behemoth','colossus','apocalypse','nemesis','oblivion'].includes(e.type)){
      g.fillStyle='#37415e';g.beginPath();g.moveTo(-r*.75,-r);g.lineTo(-r*1.25,-r*1.8);g.lineTo(-r*.25,-r*1.4);
      g.moveTo(r*.75,-r);g.lineTo(r*1.25,-r*1.8);g.lineTo(r*.25,-r*1.4);g.fill();
      if(e.type==='oblivion'||e.type==='nemesis'){
        g.save();g.strokeStyle='#fb93da';g.lineWidth=3;g.translate(0,-r*.5);g.rotate(time*.7);
        g.strokeRect(-r*.55,-r*.55,r*1.1,r*1.1);g.restore();
      }
    }
    if(e.rushUntil>clock){
      g.strokeStyle='#ffcd81';g.lineWidth=4;g.globalAlpha=.65;
      g.beginPath();g.arc(0,-5,r+14+Math.sin(time*12)*3,0,7);g.stroke();g.globalAlpha=1;
    }
    if(e.shield>0){
      g.strokeStyle='#a1e6ff';g.lineWidth=2.7;g.shadowColor='#65d6ff';g.shadowBlur=8;
      g.beginPath();g.ellipse(0,-7,r+7,r+12,0,Math.PI*.1,Math.PI*1.9);g.stroke();g.shadowBlur=0;
      const pct=Math.max(0,Math.min(1,e.shield/(e.maxShield||1)));
      g.fillStyle='#173652';g.fillRect(-r,-r*2.65,r*2,4);
      g.fillStyle='#7ce8ff';g.fillRect(-r,-r*2.65,r*2*pct,4);
    }
    if(d.heal){g.strokeStyle='#c8ffad';g.lineWidth=3;g.beginPath();g.moveTo(-5,-r*1.9);g.lineTo(5,-r*1.9);g.moveTo(0,-r*2.2);g.lineTo(0,-r*1.6);g.stroke();}
    if(d.regen){g.fillStyle='#90efaa';g.beginPath();g.arc(r*.85,-r*.8,4+Math.sin(time*6+e.id),0,7);g.fill();}
    if(d.onDeath){for(let i=0;i<3;i++){g.fillStyle='#fff5b9';g.beginPath();g.arc(-7+i*7,r*.45,2.5,0,7);g.fill();}}
    if(e.slowUntil>0 && e.slowUntil>clock){g.strokeStyle='#a6eaffaa';g.lineWidth=3;g.beginPath();g.arc(0,-5,r+12,0,Math.PI*2);g.stroke();}
    if(e.hp<e.maxHp||giant||armored){
      const w=r*2.2,x=-w/2,y=headY-r*.99-8;
      g.fillStyle='#172a3d';g.fillRect(x-1,y-1,w+2,6);
      g.fillStyle=e.hp/e.maxHp>.45?'#95f1a0':'#ff9a7e';g.fillRect(x,y,w*Math.max(0,e.hp/e.maxHp),4);
    }
    g.restore();
  }
}
