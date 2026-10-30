import { WORLD, MAPS, TOWERS, ENEMIES, MODES, DIFFICULTIES, PACKS, starterProfile } from './data.js';
export const STEP = .05;
export function bounty(hp) {
  if (!Number.isFinite(hp) || hp <= 0) return 0;
  if (hp <= 10) return Math.max(1, Math.round(hp / 2));
  if (hp <= 5000) return Math.round(5 * (hp / 10) ** (Math.log(100) / Math.log(500)));
  return Math.round(500 * Math.sqrt(hp / 5000));
}
const dist = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
export function mapOf(s) { return MAPS.find(m=>m.id===s.config.map); }
export function pointOnPath(path, distance) {
  for (let i=1;i<path.length;i++) {
    const a=path[i-1],b=path[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);
    if(distance<=len) return {x:a[0]+(b[0]-a[0])*distance/len,y:a[1]+(b[1]-a[1])*distance/len};
    distance-=len;
  }
  const end=path[path.length-1]; return {x:end[0],y:end[1],end:true};
}
export function pathDistance(path,x,y) {
  let min=Infinity;
  for(let i=1;i<path.length;i++) {
    const a=path[i-1],b=path[i],dx=b[0]-a[0],dy=b[1]-a[1];
    const t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));
    min=Math.min(min,Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy));
  }
  return min;
}
export function modifiers(config) {
  return (config.modes||[]).reduce((a,id)=>{const m=MODES[id];a.hp*=m.hp;a.speed*=m.speed;a.reward*=m.reward;a.cap=Math.min(a.cap,m.cap||20);return a;},{hp:1,speed:1,reward:1,cap:20});
}
export function validateConfig(config) {
  if(!config || !MAPS.some(m=>m.id===config.map) || !DIFFICULTIES.some(d=>d.id===config.difficulty)) throw Error('맵 또는 난이도가 올바르지 않습니다.');
  if(!['solo','coop','pvp'].includes(config.type)) throw Error('잘못된 게임 유형입니다.');
  if(!Array.isArray(config.modes)||config.modes.length>5||new Set(config.modes).size!==config.modes.length||config.modes.some(id=>!Object.hasOwn(MODES,id))) throw Error('잘못된 모드 구성입니다.');
  return { map:config.map,difficulty:config.difficulty,type:config.type,modes:[...config.modes] };
}
export function createMatch(config, players) {
  config=validateConfig(config);
  if(!Array.isArray(players)||players.length<1||players.length>4||new Set(players.map(p=>p.id)).size!==players.length) throw Error('참가 인원이 올바르지 않습니다.');
  if(config.type==='pvp'&&players.length!==2||config.type==='solo'&&players.length!==1) throw Error('PvP는 2명, 솔로는 1명이 필요합니다.');
  const s={version:1,config,players:{},fields:config.type==='pvp'?[100,100]:[100],towers:[],enemies:[],units:[],queue:[],events:[],wave:0,time:0,waveTime:0,spawnClock:0,nextId:1,status:'playing',votes:[],kills:0,winner:null};
  players.forEach((p,i)=>{
    const profile=p.profile||starterProfile();
    s.players[p.id]={id:p.id,name:String(profile.name).slice(0,20),field:config.type==='pvp'?i:0,money:500,loadout:[...profile.loadout],pack:profile.pack,cooldowns:{},seq:0,skins:profile.equippedSkins||{}};
  });
  nextWave(s); return s;
}
export function towerStats(t) {
  const d=TOWERS[t.type],l=t.level;
  return {damage:d.damage*(1+l*.8+l*l*.15),interval:d.interval/(1+l*.13),range:d.range*(1+l*.10),splash:(d.splash||0)*(1+l*.1)};
}
export function canPlace(s,field,x,y) {
  return Number.isFinite(x)&&Number.isFinite(y)&&x>=45&&y>=45&&x<=WORLD.width-45&&y<=WORLD.height-45&&pathDistance(mapOf(s).path,x,y)>WORLD.road/2+22&&!s.towers.some(t=>t.field===field&&Math.hypot(t.x-x,t.y-y)<50);
}
export function requiredVotes(s) {const n=Object.keys(s.players).length;return n===1?1:Math.max(2,Math.floor(n/2)+1);}
function event(s,e) {s.events.push({...e,id:s.nextId++,time:s.time});if(s.events.length>70)s.events.shift();}
function spawn(s,type,field,source='wave') {
  const d=ENEMIES[type],mods=modifiers(s.config),diff=DIFFICULTIES.find(d=>d.id===s.config.difficulty);
  const hp=d.hp*mods.hp*diff.hp;
  s.enemies.push({id:s.nextId++,type,field,hp,maxHp:hp,progress:0,x:mapOf(s).path[0][0],y:mapOf(s).path[0][1],speed:d.speed*mods.speed,source});
}
function nextWave(s) {
  const d=DIFFICULTIES.find(d=>d.id===s.config.difficulty);
  if(s.wave>=d.waves.length)return;
  s.wave++;s.waveTime=0;s.votes=[];
  const w=d.waves[s.wave-1];
  Object.values(s.players).forEach(p=>{if(s.wave>1)p.money+=w.bonus;});
  let delay=0;
  // Keep old queued enemies when skipping. A skip cannot erase unspawned enemies.
  for(const [type,count] of w.groups)for(let i=0;i<count;i++) {
    s.fields.forEach((_,field)=>s.queue.push({type,field,at:s.time+delay}));delay+=w.spacing;
  }
  event(s,{kind:'wave',wave:s.wave});
}
export function command(s,playerId,c) {
  if(s.status!=='playing')return {ok:false,error:'전투가 종료되었습니다.'};
  const p=s.players[playerId];if(!p)return {ok:false,error:'참가자가 아닙니다.'};
  if(!c||typeof c!=='object')return {ok:false,error:'잘못된 명령입니다.'};
  if(c.seq!==undefined) {
    if(!Number.isSafeInteger(c.seq)||c.seq<=p.seq)return {ok:false,error:'이미 처리한 명령입니다.'};
    p.seq=c.seq;
  }
  const fail=error=>({ok:false,error});
  if(c.kind==='place') {
    const d=Object.hasOwn(TOWERS,c.type)?TOWERS[c.type]:null;
    if(!d||!p.loadout.includes(c.type))return fail('장착한 타워만 배치할 수 있습니다.');
    if(s.towers.filter(t=>t.field===p.field).length>=modifiers(s.config).cap)return fail('필드 전체 타워 한도에 도달했습니다.');
    if(s.towers.filter(t=>t.field===p.field&&t.type===c.type).length>=d.cap)return fail('이 타워의 배치 한도에 도달했습니다.');
    if(p.money<d.cost)return fail('전투 자금이 부족합니다.');
    if(!canPlace(s,p.field,c.x,c.y))return fail('도로와 다른 타워를 피해 배치하세요.');
    p.money-=d.cost;s.towers.push({id:s.nextId++,owner:playerId,field:p.field,type:c.type,x:c.x,y:c.y,level:0,cd:0,spent:d.cost,target:'first',skin:p.skins[c.type]||'default'});
  } else if(['upgrade','sell','target'].includes(c.kind)) {
    const t=s.towers.find(t=>t.id===c.id);if(!t||t.owner!==playerId)return fail('자신의 타워를 선택하세요.');
    if(c.kind==='upgrade') {
      const cost=TOWERS[t.type].upgrades[t.level];if(cost===undefined)return fail('최대 레벨입니다.');if(p.money<cost)return fail('전투 자금이 부족합니다.');
      p.money-=cost;t.level++;t.spent+=cost;event(s,{kind:'upgrade',x:t.x,y:t.y,field:t.field});
    } else if(c.kind==='sell') {p.money+=Math.floor(t.spent*7/10);s.towers=s.towers.filter(a=>a.id!==t.id);}
    else {if(!['first','strong','near'].includes(c.target))return fail('잘못된 타겟입니다.');t.target=c.target;}
  } else if(c.kind==='skip') {
    if(s.waveTime<8)return fail('웨이브 시작 8초 후 스킵할 수 있습니다.');
    if(s.wave>=DIFFICULTIES.find(d=>d.id===s.config.difficulty).waves.length)return fail('마지막 웨이브입니다.');
    if(s.queue.length>=900)return fail('대기 중인 적이 너무 많습니다. 현재 적을 먼저 처치하세요.');
    if(!s.votes.includes(playerId))s.votes.push(playerId);
    if(s.votes.length>=requiredVotes(s))nextWave(s);
  } else if(c.kind==='send') {
    if(s.config.type!=='pvp')return fail('PvP에서만 소환할 수 있습니다.');
    const entry=PACKS[p.pack]?.monsters.find(m=>m[0]===c.type);
    if(!entry)return fail('장착한 팩에 없는 몬스터입니다.');
    if((p.cooldowns[c.type]||0)>s.time)return fail('소환 재사용 대기 중입니다.');
    if(p.money<entry[1])return fail('전투 자금이 부족합니다.');
    if(s.enemies.length+s.queue.length>=500)return fail('현재 전장 수용 한도입니다.');
    p.money-=entry[1];p.cooldowns[c.type]=s.time+entry[2];spawn(s,c.type,1-p.field,'pvp');
  } else return fail('알 수 없는 명령입니다.');
  return {ok:true};
}
function damage(s,e,n,t) {
  if(e.hp<=0)return;
  e.hp-=n*(TOWERS[t.type].pierce?1:1-(ENEMIES[e.type].armor||0));
  if(e.hp<=0) {
    const team=Object.values(s.players).filter(p=>p.field===e.field);
    const reward=bounty(e.maxHp)/team.length;
    team.forEach(p=>p.money+=reward);s.kills++;
    event(s,{kind:'kill',x:e.x,y:e.y,field:e.field,color:ENEMIES[e.type].color});
  }
}
export function tick(s,dt=STEP) {
  if(s.status!=='playing')return;
  if(!Number.isFinite(dt)||dt<=0||dt>.1)throw Error('고정 스텝은 0~0.1초여야 합니다.');
  s.time+=dt;s.waveTime+=dt;
  const ready=s.queue.filter(q=>q.at<=s.time).slice(0,Math.max(0,350-s.enemies.length));
  const set=new Set(ready);s.queue=s.queue.filter(q=>!set.has(q));ready.forEach(q=>spawn(s,q.type,q.field));
  for(const t of s.towers) {
    const d=TOWERS[t.type];if(d.kind==='buff')continue;
    t.cd-=dt;if(t.cd>0)continue;
    const stats=towerStats(t),candidates=s.enemies.filter(e=>e.field===t.field&&e.hp>0&&dist(t,e)<=stats.range);
    candidates.sort(t.target==='strong'?(a,b)=>b.hp-a.hp:t.target==='near'?(a,b)=>dist(a,t)-dist(b,t):(a,b)=>b.progress-a.progress);
    const e=candidates[0];if(!e)continue;
    const buff=s.towers.filter(b=>b.field===t.field&&TOWERS[b.type].kind==='buff'&&dist(b,t)<=towerStats(b).range).reduce((a,b)=>Math.max(a,1.2+b.level*.1),1);
    t.cd=stats.interval;t.angle=Math.atan2(e.y-t.y,e.x-t.x);
    event(s,{kind:d.kind,from:t.id,x:t.x,y:t.y,tx:e.x,ty:e.y,field:t.field,type:t.type});
    if(d.kind==='summon')s.units.push({id:s.nextId++,x:t.x,y:t.y,field:t.field,target:e.id,damage:stats.damage*buff,type:t.type,life:8});
    else if(d.kind==='splash')s.enemies.filter(a=>a.field===t.field&&dist(a,e)<=stats.splash).forEach(a=>damage(s,a,stats.damage*buff,t));
    else if(d.kind==='melee')candidates.slice(0,3).forEach(a=>damage(s,a,stats.damage*buff,t));
    else damage(s,e,stats.damage*buff,t);
  }
  for(const u of s.units) {
    u.life-=dt;let e=s.enemies.find(e=>e.id===u.target&&e.hp>0);
    if(!e){e=s.enemies.find(e=>e.field===u.field&&e.hp>0);if(e)u.target=e.id;}
    if(!e)continue;
    const distance=dist(u,e),move=210*dt;
    if(distance<=move+10){damage(s,e,u.damage,u);u.life=0;event(s,{kind:'melee',x:e.x,y:e.y,tx:e.x,ty:e.y,field:e.field,type:u.type});}
    else {u.x+=(e.x-u.x)*move/distance;u.y+=(e.y-u.y)*move/distance;}
  }
  s.units=s.units.filter(u=>u.life>0);
  s.enemies=s.enemies.filter(e=>e.hp>0);
  for(const e of s.enemies) {
    e.progress+=e.speed*dt;const pos=pointOnPath(mapOf(s).path,e.progress);e.x=pos.x;e.y=pos.y;
    if(pos.end){s.fields[e.field]=Math.max(0,s.fields[e.field]-ENEMIES[e.type].leak);e.hp=0;event(s,{kind:'leak',x:e.x,y:e.y,field:e.field});}
  }
  s.enemies=s.enemies.filter(e=>e.hp>0);
  const dead=s.fields.findIndex(h=>h<=0);
  if(dead>=0){s.status=s.config.type==='pvp'?'complete':'defeat';s.winner=s.config.type==='pvp'?1-dead:null;return;}
  const d=DIFFICULTIES.find(d=>d.id===s.config.difficulty);
  const clear=s.fields.map((_,i)=>!s.enemies.some(e=>e.field===i)&&!s.queue.some(e=>e.field===i));
  if(s.wave===d.waves.length) {
    if(clear.every(Boolean)){s.status='victory';s.winner=s.config.type==='pvp'?(s.fields[0]===s.fields[1]?null:s.fields[0]>s.fields[1]?0:1):0;}
  } else if((s.config.type==='pvp'?clear.some(Boolean):clear.every(Boolean))||s.waveTime>=d.waves[s.wave-1].duration) {
    // Backpressure keeps pathological skip/timeout combinations bounded without deleting enemies.
    if(s.queue.length<900)nextWave(s);
  }
}
export function advance(s,seconds) {let n=Math.min(1200,Math.floor(seconds/STEP+1e-8));while(n-->0&&s.status==='playing')tick(s);return s;}
export function rewardFor(s,id) {
  const p=s.players[id];if(!p||s.status==='playing')return {coins:0,xp:0,sonic:false,win:false};
  const win=s.config.type==='pvp'?s.winner===p.field:s.status==='victory';
  const d=DIFFICULTIES.find(d=>d.id===s.config.difficulty);
  // PvP opponents must not be usable as a repeatable currency faucet in this alpha.
  const coins=s.config.type==='pvp'?0:win?Math.floor(d.reward*modifiers(s.config).reward):0;
  return {coins,xp:s.config.type==='pvp'?0:win?d.waves.length*20:0,sonic:win&&s.config.type!=='pvp'&&DIFFICULTIES.indexOf(d)>=3&&s.config.modes.includes('supersonic'),win};
}
export function applyReward(profile,reward) {
  profile.coins+=reward.coins;profile.xp+=reward.xp;if(reward.win)profile.wins++;
  if(reward.sonic&&!profile.owned.includes('sonic'))profile.owned.push('sonic');return profile;
}
export function profileAction(profile,a) {
  if(!a||typeof a!=='object')throw Error('잘못된 요청입니다.');
  if(a.kind==='equip') {
    if(!profile.owned.includes(a.id))throw Error('보유하지 않은 타워입니다.');
    if(profile.loadout.includes(a.id)){if(profile.loadout.length===1)throw Error('타워를 최소 1개 장착하세요.');profile.loadout=profile.loadout.filter(x=>x!==a.id);}
    else {if(profile.loadout.length>=5)throw Error('최대 5개까지 장착할 수 있습니다.');profile.loadout.push(a.id);}
  } else if(a.kind==='buyTower') {
    const t=Object.hasOwn(TOWERS,a.id)?TOWERS[a.id]:null;
    if(!t||t.price===null)throw Error('상점에서 구매할 수 없습니다.');
    if(profile.owned.includes(a.id))throw Error('이미 보유한 타워입니다.');
    if(profile.coins<t.price)throw Error('코인이 부족합니다.');profile.coins-=t.price;profile.owned.push(a.id);
  } else if(a.kind==='buyPack') {
    const p=Object.hasOwn(PACKS,a.id)?PACKS[a.id]:null;
    if(!p)throw Error('잘못된 팩입니다.');if(profile.packs.includes(a.id))throw Error('이미 보유한 팩입니다.');
    if(profile.coins<p.price)throw Error('코인이 부족합니다.');profile.coins-=p.price;profile.packs.push(a.id);
  } else if(a.kind==='pack') {if(!profile.packs.includes(a.id))throw Error('보유한 팩을 선택하세요.');profile.pack=a.id;}
  else if(a.kind==='skin') {
    if(!profile.owned.includes(a.id)||!['default','arctic'].includes(a.skin))throw Error('사용할 수 없는 스킨입니다.');
    const key=a.id+':arctic';if(a.skin==='arctic'&&!profile.skins[key]){if(profile.coins<300)throw Error('코인이 부족합니다.');profile.coins-=300;profile.skins[key]=true;}
    profile.equippedSkins[a.id]=a.skin;
  } else throw Error('지원하지 않는 요청입니다.');
  return profile;
}
