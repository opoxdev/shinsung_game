import { WORLD } from './data.js';
import { STEP, pointOnPath } from './engine.js';

// Visual-only outskirts. Placement and enemy paths retain their original bounds.
export const TERRAIN_MARGIN = 420;
export function cameraLimits(width,height,fields=1){
  const worldWidth=WORLD.width+(fields-1)*2100;
  const base=Math.min(width/WORLD.width,height/WORLD.height);
  const minZoom=Math.max(.55,width/(worldWidth+2*TERRAIN_MARGIN)/base,height/(WORLD.height+2*TERRAIN_MARGIN)/base);
  return {base,minZoom,worldWidth};
}
export function constrainCamera(camera,width,height,fields=1){
  const {base,minZoom,worldWidth}=cameraLimits(width,height,fields);
  camera.zoom=Math.max(minZoom,Math.min(3.3,camera.zoom));
  const scale=base*camera.zoom,hx=width/(2*scale),hy=height/(2*scale);
  camera.x=Math.max(hx-TERRAIN_MARGIN,Math.min(worldWidth+TERRAIN_MARGIN-hx,camera.x));
  camera.y=Math.max(hy-TERRAIN_MARGIN,Math.min(WORLD.height+TERRAIN_MARGIN-hy,camera.y));
  return scale;
}
export function predictedProgress(enemy,time,ahead){
  // Integrate status expirations, rather than applying slow/rush for the whole snapshot gap.
  const end=time+ahead,breaks=[time,end];
  for(const until of [enemy.slowUntil,enemy.rushUntil])if(until>time&&until<end)breaks.push(until);
  breaks.sort((a,b)=>a-b);let progress=enemy.progress;
  for(let i=1;i<breaks.length;i++){
    const t=(breaks[i-1]+breaks[i])/2;
    progress+=(breaks[i]-breaks[i-1])*enemy.speed*(enemy.slowUntil>t?(enemy.slowFactor||1):1)*(enemy.rushUntil>t?(enemy.rushPower||1):1);
  }
  return progress;
}
export class MotionView {
  constructor(){this.previous=new Map();this.enemies=new Map();this.units=new Map();this.snapshot=null;this.view={};}
  capture(state){
    this.previous.clear();
    for(const e of state.enemies)this.previous.set(e.id,{progress:e.progress});
    for(const u of state.units)this.previous.set(u.id,{x:u.x,y:u.y});
  }
  sample(state,path,{online=false,ahead=0,alpha=1,dt=0,paused=false}={}){
    const changed=this.snapshot!==state,active=state.status==='playing'&&!paused;
    ahead=active?Math.min(2.2,Math.max(0,ahead)):0;
    alpha=active?Math.max(0,Math.min(1,alpha)):1;
    const decay=Math.exp(-dt*14),liveEnemies=new Set(),liveUnits=new Set();
    const enemies=state.enemies.map(e=>{
      liveEnemies.add(e.id);let v=this.enemies.get(e.id);
      const target=online?predictedProgress(e,state.time,ahead):e.progress;
      if(!v){v={...e,progress:target,correction:0};this.enemies.set(e.id,v);}
      if(online&&changed)v.correction=v.progress-target;
      const correction=active?v.correction*decay:0,previous=this.previous.get(e.id);
      const progress=online?target+correction:previous?previous.progress+(e.progress-previous.progress)*alpha:target;
      Object.assign(v,e,pointOnPath(path,progress),{progress,correction});return v;
    });
    // Summon targeting is O(1) per unit instead of scanning every enemy.
    const enemyById=new Map(enemies.map(e=>[e.id,e]));
    const units=state.units.map(u=>{
      liveUnits.add(u.id);let v=this.units.get(u.id);
      if(!v){v={...u,dx:0,dy:0};this.units.set(u.id,v);}
      let x=u.x,y=u.y;
      if(online&&active){
        const target=enemyById.get(u.target);
        if(target){const dx=target.x-x,dy=target.y-y,length=Math.hypot(dx,dy),ratio=Math.min(1,(u.speed||210)*ahead/(length||1));x+=dx*ratio;y+=dy*ratio;}
      }
      if(online&&changed){v.dx=v.x-x;v.dy=v.y-y;}
      const dx=active?v.dx*decay:0,dy=active?v.dy*decay:0,previous=this.previous.get(u.id);
      if(!online&&previous){x=previous.x+(x-previous.x)*alpha;y=previous.y+(y-previous.y)*alpha;}
      Object.assign(v,u,{x:x+(online?dx:0),y:y+(online?dy:0),dx,dy});return v;
    });
    for(const id of this.enemies.keys())if(!liveEnemies.has(id))this.enemies.delete(id);
    for(const id of this.units.keys())if(!liveUnits.has(id))this.units.delete(id);
    this.snapshot=state;
    return Object.assign(this.view,state,{enemies,units,time:online?state.time+ahead:Math.max(0,state.time-(active?STEP*(1-alpha):0))});
  }
}
