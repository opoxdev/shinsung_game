import { MAPS, WORLD, TOWERS, ENEMIES, RARITIES } from './data.js';
import { pointOnPath, pathDistance, towerStats, canPlace } from './engine.js';
import { character } from './art.js';
import { makeTerrain } from './terrain.js';
export const portrait=character;
export { landscape } from './art.js';
const sprites=new Map();
function sprite(id,skin){const key=id+skin;if(!sprites.has(key)){const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(character(id,skin));sprites.set(key,img);}return sprites.get(key);}
export class Renderer {
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.cache=new Map();this.camera={x:900,y:550,zoom:1};this.keys=new Set();this.pointer=null;this.preview=null;this.selected=null;this.width=1;this.height=1;}
  resize(){const r=this.canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);this.width=r.width;this.height=r.height;if(this.canvas.width!==Math.round(r.width*dpr)||this.canvas.height!==Math.round(r.height*dpr)){this.canvas.width=Math.round(r.width*dpr);this.canvas.height=Math.round(r.height*dpr);}this.dpr=dpr;}
  screenToWorld(x,y){const scale=this.scale||1;return {x:(x-this.width/2)/scale+this.camera.x,y:(y-this.height/2)/scale+this.camera.y};}
  frame(state,mapId,playerId,dt,now,lobby=false){
    this.resize();const g=this.ctx;g.setTransform(this.dpr,0,0,this.dpr,0,0);g.clearRect(0,0,this.width,this.height);
    const map=MAPS.find(m=>m.id===mapId)||MAPS[0],field=state?.players[playerId]?.field||0;
    this.scale=Math.min(this.width/1800,this.height/1100)*(lobby?1.23:this.camera.zoom);
    if(!lobby){const speed=650*dt/this.camera.zoom;this.camera.x+=(+this.keys.has('d')-this.keys.has('a'))*speed;this.camera.y+=(+this.keys.has('s')-this.keys.has('w'))*speed;this.camera.x=Math.max(0,Math.min(state?.config.type==='pvp'?3900:1800,this.camera.x));this.camera.y=Math.max(0,Math.min(1100,this.camera.y));}
    g.save();g.translate(this.width/2,this.height/2);g.scale(this.scale,this.scale);g.translate(-this.camera.x,-this.camera.y);
    if(!this.cache.has(map.id))this.cache.set(map.id,makeTerrain(map));
    for(let f=0;f<(state?.fields.length||1);f++){
      const offset=f*2100;g.save();g.translate(offset,0);g.drawImage(this.cache.get(map.id),0,0);
      if(state?.config.type==='pvp'){g.fillStyle=f===field?'#bcd994':'#f6a498';g.font='bold 30px sans-serif';g.fillText(f===field?'아군 방어 구역':'상대 방어 구역',60,75);}
      if(!state){for(let i=0;i<9;i++){const p=pointOnPath(map.path,(now*15+i*185)%2900);this.enemy(g,{...p,type:i%3?'zombie':'runner',hp:18,maxHp:18,id:i},now);}for(const [x,y,id]of [[270,410,'scout'],[810,620,'soldier'],[1130,650,'cannon']])this.tower(g,{x,y,type:id,level:2,angle:Math.sin(now*.4)},now);}
      else {
        const selected=state.towers.find(t=>t.id===this.selected&&t.field===f);
        if(selected){g.fillStyle='#f1db8420';g.strokeStyle='#f1db8470';g.lineWidth=2;g.beginPath();g.arc(selected.x,selected.y,towerStats(selected).range,0,7);g.fill();g.stroke();}
        state.towers.filter(t=>t.field===f).forEach(t=>this.tower(g,t,now));
        state.enemies.filter(e=>e.field===f).forEach(e=>this.enemy(g,e,now));
        state.units.filter(e=>e.field===f).forEach(e=>this.summon(g,e,now));
        for(const e of state.events){const age=state.time-e.time;if(e.field!==f||age<0||age>.45)continue;g.globalAlpha=1-age/.45;g.strokeStyle=TOWERS[e.type]?.color||'#ffd88c';g.lineWidth=e.type==='rail'?5:3;g.shadowColor=g.strokeStyle;g.shadowBlur=8;
          if(e.type==='soldier'){g.beginPath();g.moveTo(e.x,e.y-20);for(let j=1;j<7;j++)g.lineTo(e.x+(e.tx-e.x)*j/7+(j%2?8:-8),e.y-20+(e.ty-e.y+20)*j/7);g.lineTo(e.tx,e.ty);g.stroke();}
          else if(e.type==='rail'){g.beginPath();g.moveTo(e.tx-40,e.ty-100);g.lineTo(e.tx,e.ty);g.stroke();g.save();g.translate(e.tx,e.ty);g.rotate(age*6);g.fillStyle='#fff7b6';g.beginPath();for(let j=0;j<8;j++){const a=j*Math.PI/4,rad=j%2?6:24;g.lineTo(Math.cos(a)*rad,Math.sin(a)*rad);}g.closePath();g.fill();g.restore();}
          else if(e.type==='sonic'){for(let j=0;j<3;j++){g.beginPath();g.arc(e.tx,e.ty,6+age*120+j*10,0,7);g.stroke();}}
          else if(e.kind==='melee'){g.lineWidth=7;g.beginPath();g.arc(e.x,e.y,12+age*90,-1.5,1.4);g.stroke();}
          else if(e.kind==='ranged'){const f=Math.min(1,age/.15);g.fillStyle='#fff3bf';g.beginPath();g.arc(e.x+(e.tx-e.x)*f,e.y-20+(e.ty-e.y+20)*f,5,0,7);g.fill();}
          else if(e.kind==='splash'){g.lineWidth=5;g.beginPath();g.arc(e.tx,e.ty,12+age*100,0,7);g.stroke();for(let j=0;j<6;j++){const a=j*6.28/6;g.fillStyle='#ffdd83';g.fillRect(e.tx+Math.cos(a)*age*120,e.ty+Math.sin(a)*age*120,5,5);}}
          else {g.beginPath();g.arc(e.tx||e.x,e.ty||e.y,8+age*70,0,7);g.stroke();}g.globalAlpha=1;g.shadowBlur=0;}
        if(this.preview&&this.pointer&&f===field){const p={x:this.pointer.x-offset,y:this.pointer.y},ok=canPlace(state,field,p.x,p.y);g.fillStyle=ok?'#9ccf7922':'#eb807b33';g.strokeStyle=ok?'#c1e08c':'#ed887d';g.beginPath();g.arc(p.x,p.y,TOWERS[this.preview].range,0,7);g.fill();g.stroke();g.globalAlpha=.65;this.tower(g,{...p,type:this.preview,level:0},now);g.globalAlpha=1;}
      }
      g.restore();
    }
    g.restore();
    if(lobby){const grad=g.createLinearGradient(0,0,0,this.height);grad.addColorStop(0,'#101b1230');grad.addColorStop(.45,'#101b1200');grad.addColorStop(1,'#18234780');g.fillStyle=grad;g.fillRect(0,0,this.width,this.height);}
  }
  tower(g,t,time){const d=TOWERS[t.type],c=d.color,lev=t.level||0;g.save();g.translate(t.x,t.y);g.fillStyle='#18294b55';g.beginPath();g.ellipse(4,6,25,13,0,0,7);g.fill();g.strokeStyle=RARITIES[d.rarity].color;g.lineWidth=2;g.beginPath();g.ellipse(0,3,25,12,0,0,7);g.stroke();
    if(['buff','summon'].includes(d.kind)||t.type==='sonic'){g.strokeStyle=c+'99';g.beginPath();g.ellipse(0,3,29+Math.sin(time*3)*5,14,0,0,7);g.stroke();}
    const img=sprite(t.type,t.skin||'default'),size=75+lev*3,bob=Math.sin(time*(t.type==='sonic'?5:2)+t.x)*1.6;
    if(img.complete&&img.naturalWidth)g.drawImage(img,-size*.5,-size*.87+bob,size,size*210/180);
    g.fillStyle='#ffe892';for(let i=0;i<lev;i++)g.fillRect(-8+i*7,25,4,4);g.restore();
  }
  summon(g,u,time){
    // Animated goblin familiar, distinct from towers and enemies.
    const bob=Math.sin(time*11+u.id)*2;
    g.save();g.translate(u.x,u.y+bob);
    g.fillStyle='#17343c55';g.beginPath();g.ellipse(0,13,15,6,0,0,7);g.fill();
    g.fillStyle='#5b8750';g.fillRect(-8,2,6,12);g.fillRect(2,2,6,12);
    g.fillStyle='#7ac77a';g.beginPath();g.moveTo(-8,-7);g.lineTo(-19,-13);g.lineTo(-14,4);g.lineTo(-8,2);g.moveTo(8,-7);g.lineTo(19,-13);g.lineTo(14,4);g.lineTo(8,2);g.fill();
    g.fillStyle='#96eb80';g.beginPath();g.arc(0,-5,11,0,7);g.fill();
    g.fillStyle='#243e55';g.fillRect(-7,-8,4,4);g.fillRect(3,-8,4,4);
    g.strokeStyle='#c9fb9c';g.lineWidth=2;g.beginPath();g.moveTo(-2,1);g.lineTo(2,1);g.stroke();
    g.restore();
  }
  enemy(g,e,time){
    const d=ENEMIES[e.type],r=d.size||12;
    const mech=['mk1','mk2','chain','mecha'].includes(e.type);
    const giant=['boss','fastboss','doom','apocalypse'].includes(e.type);
    const fast=['runner','fastboss','mk2'].includes(e.type);
    const armored=['heavy','tank','chain','mecha','doom','apocalypse'].includes(e.type);
    const pulse=Math.sin(time*6+e.id),leg=Math.sin(time*(fast?18:8)+e.id)*3;
    g.save();g.translate(e.x,e.y);
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
    if(e.hp<e.maxHp||giant||armored){
      const w=r*2.2,x=-w/2,y=headY-r*.99-8;
      g.fillStyle='#172a3d';g.fillRect(x-1,y-1,w+2,6);
      g.fillStyle=e.hp/e.maxHp>.45?'#95f1a0':'#ff9a7e';g.fillRect(x,y,w*Math.max(0,e.hp/e.maxHp),4);
    }
    g.restore();
  }
}
