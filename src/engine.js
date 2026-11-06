import { WORLD, MAPS, TOWERS, ENEMIES, MODES, DIFFICULTIES, PACKS, SKIN_STYLES, CRATES, BOSS_ABILITIES, COMBAT_SCALE, EVENTS, campaignOf, starterProfile, skinCandidates, availableCrateStyles } from './data.js';
import { evolutionAt } from './evolutions.js';
export const STEP = .05;
// Damage earnings are reduced and tied to nominal enemy HP, not multiplied
// by later waves' large health bars. Damage/overkill accounting stays intact.
export const DAMAGE_CASH_FACTOR = .60;
export function bounty(hp) {
  if (!Number.isFinite(hp) || hp <= 0) return 0;
  if (hp <= 10) return Math.max(1, Math.round(hp / 2));
  if (hp <= 5000) return Math.round(5 * (hp / 10) ** (Math.log(100) / Math.log(500)));
  return Math.round(500 * Math.sqrt(hp / 5000));
}
const dist = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
export function mapOf(s) { return MAPS.find(m=>m.id===s.config.map); }
const pathMetrics=new WeakMap();
export function pointOnPath(path,distance){
  let segments=pathMetrics.get(path);
  if(!segments){let total=0;segments=path.slice(1).map((b,i)=>{const a=path[i],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);const segment={a,dx,dy,length,start:total,end:total+length};total+=length;return segment;});pathMetrics.set(path,segments);}
  let lo=0,hi=segments.length-1;
  while(lo<hi){const mid=(lo+hi)>>1;if(distance<=segments[mid].end)hi=mid;else lo=mid+1;}
  const segment=segments[lo];
  if(!segment||distance>segment.end){const end=path.at(-1);return {x:end[0],y:end[1],end:true};}
  const ratio=segment.length?(distance-segment.start)/segment.length:0;
  return {x:segment.a[0]+segment.dx*ratio,y:segment.a[1]+segment.dy*ratio};
}
// Both teams share the authored road. Friendly walkers travel from the
// defender's base (path end) toward the enemy portal (path start).
const pathLengths=new WeakMap();
export function routeLength(path){
 let length=pathLengths.get(path);
 if(length===undefined){
  length=0;for(let i=1;i<path.length;i++)length+=Math.hypot(path[i][0]-path[i-1][0],path[i][1]-path[i-1][1]);
  pathLengths.set(path,length);
 }
 return length;
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
  if(!config||!['solo','coop','pvp'].includes(config.type))throw Error('잘못된 게임 유형입니다.');
  if(config.eventId!==undefined&&config.eventId!==null){
    const e=Object.hasOwn(EVENTS,config.eventId)?EVENTS[config.eventId]:null;
    if(!e||config.type==='pvp'||config.map!==e.map||!Array.isArray(config.modes)||config.modes.length
      ||config.difficulty!=='normal')throw Error('이벤트는 전용 맵에서 솔로·협동전으로만 진행합니다.');
    return {type:config.type,eventId:e.id,map:e.map,difficulty:'normal',modes:[]};
  }
  // All offered modes may be combined, including Dark Energy. Keep an
  // absolute bound for malformed/untrusted requests and reject duplicates.
  if(!Array.isArray(config.modes)||config.modes.length>Math.min(12,Object.keys(MODES).length)
    ||new Set(config.modes).size!==config.modes.length
    ||config.modes.some(id=>typeof id!=='string'||!Object.hasOwn(MODES,id)))
    throw Error('잘못된 모드 구성입니다.');
  if(!DIFFICULTIES.some(d=>d.id===config.difficulty)||!MAPS.some(m=>m.id===config.map&&!m.eventOnly))throw Error('맵 또는 난이도가 올바르지 않습니다.');
  return {map:config.map,difficulty:config.difficulty,type:config.type,modes:[...config.modes]};
}
export function createMatch(config, players) {
  config=validateConfig(config);
  if(!Array.isArray(players)||players.length<1||players.length>4||new Set(players.map(p=>p.id)).size!==players.length) throw Error('참가 인원이 올바르지 않습니다.');
  if(config.type==='pvp'&&players.length!==2||config.type==='solo'&&players.length!==1) throw Error('PvP는 2명, 솔로는 1명이 필요합니다.');
  const startMoney=campaignOf(config).startMoney;
  const startingHealth=config.modes.includes('laststand')?55:100;
  const s={version:1,config,players:{},fields:config.type==='pvp'?[startingHealth,startingHealth]:[startingHealth],towers:[],enemies:[],units:[],queue:[],events:[],wave:0,time:0,waveTime:0,spawnClock:0,nextId:1,status:'playing',votes:[],kills:0,winner:null};
  players.forEach((p,i)=>{
    const profile=p.profile||starterProfile();
    s.players[p.id]={id:p.id,name:String(profile.name).slice(0,20),field:config.type==='pvp'?i:0,money:startMoney,loadout:[...profile.loadout],pack:profile.pack,cooldowns:{},seq:0,skins:profile.equippedSkins||{},ach:{places:0,upgrades:0}};
  });
  nextWave(s); return s;
}
// Each tower instance resolves its own evolution; same-type siblings stay independent.
const resolvedStats=new Map();
export function towerStats(t) {
  const key=t.type+':'+(t.level||0);if(resolvedStats.has(key))return resolvedStats.get(key);
  const d=TOWERS[t.type];if(!d)throw Error('존재하지 않는 타워입니다.');
  const step=evolutionAt(t.type,t.level||0);
  const stats=Object.freeze({...d,...step,
    damage:d.damage*(step?.damageMult??1),
    interval:d.interval/(step?.rateMult??1),
    range:d.range*(step?.rangeMult??1),
    splash:step?.splash??d.splash??0,
    kind:step?.kind??d.kind,
    stageName:step?.name??'기본 장비'
  });
  resolvedStats.set(key,stats);return stats;
}
export function canPlace(s,field,x,y) {
  return Number.isFinite(x)&&Number.isFinite(y)&&x>=45&&y>=45&&x<=WORLD.width-45&&y<=WORLD.height-45&&pathDistance(mapOf(s).path,x,y)>WORLD.road/2+22&&!s.towers.some(t=>t.field===field&&Math.hypot(t.x-x,t.y-y)<50);
}
export function requiredVotes(s) {const n=Object.keys(s.players).length;return n===1?1:Math.max(2,Math.floor(n/2)+1);}
function event(s,e) {s.events.push({...e,id:s.nextId++,time:s.time});if(s.events.length>140)s.events.shift();}
function spawn(s,type,field,source='wave') {
  const d=ENEMIES[type],mods=modifiers(s.config),diff=campaignOf(s.config);
  // A monster has identical stats on wave 1 and wave 30. Difficulty and
  // challenge modes have static multipliers; waves get harder ONLY by
  // sending stronger enemy species and more elite formations.
  const hp=d.hp*mods.hp*diff.hp;
  const shield=(d.shield||0)*mods.hp*diff.hp;
  const unit={id:s.nextId++,type,field,hp,maxHp:hp,shield,maxShield:shield,rewardHpBase:hp,
    progress:0,x:mapOf(s).path[0][0],y:mapOf(s).path[0][1],
    speed:d.speed*mods.speed,source};
  s.enemies.push(unit);return unit;
}
function nextWave(s) {
  const d=campaignOf(s.config);
  if(s.wave>=d.waves.length)return;
  s.wave++;s.waveTime=0;s.votes=[];
  const w=d.waves[s.wave-1];
  Object.values(s.players).forEach(p=>{if(s.wave>1)p.money+=w.bonus;});
  let delay=0;
  // Keep old queued enemies when skipping. A skip cannot erase unspawned enemies.
  for(const [type,count] of w.groups)for(let i=0;i<count;i++) {
    s.fields.forEach((_,field)=>s.queue.push({type,field,at:s.time+delay}));delay+=w.spacing;
  }
  // Rift Reinforcements: extra speedy enemies on every third regular wave.
  // Scheduling them through the ordinary queue keeps skipping deterministic.
  if(!s.config.eventId&&s.config.modes.includes('rift')&&s.wave%3===0){
    const extra=Math.min(7,2+Math.floor(s.wave/4)),type=s.wave>=9?'sprinter':'runner';
    for(let i=0;i<extra;i++){
      s.fields.forEach((_,field)=>s.queue.push({type,field,at:s.time+delay}));
      delay+=Math.max(.28,w.spacing*.75);
    }
    s.fields.forEach((_,field)=>event(s,{kind:'rift',field,x:mapOf(s).path[0][0],y:mapOf(s).path[0][1],count:extra}));
  }
  // Eclipse mode introduces entirely NEW enemy species, not inflated stats.
  // It uses the same bounded wave queue, so online clients stay deterministic.
  if(!s.config.eventId&&s.config.modes.includes('eclipse')&&s.wave%4===0){
    const extra=Math.min(7,2+Math.floor(s.wave/7));
    const type=s.wave>=Math.ceil(d.waves.length*.5)?'phantom':'ghost';
    for(let i=0;i<extra;i++){
      s.fields.forEach((_,field)=>s.queue.push({type,field,at:s.time+delay}));
      delay+=Math.max(.3,w.spacing*.6);
    }
    s.fields.forEach((_,field)=>event(s,{kind:'eclipse',field,
      x:mapOf(s).path[0][0],y:mapOf(s).path[0][1],count:extra}));
  }
  // Never start the next timed wave before the current formation has finished arriving.
  s.waveDeadline=Math.max(w.duration,delay+8);
  event(s,{kind:'wave',wave:s.wave,deadline:s.waveDeadline});
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
    p.ach=p.ach||{places:0,upgrades:0};p.ach.places++;p.money-=d.cost;s.towers.push({id:s.nextId++,owner:playerId,field:p.field,type:c.type,x:c.x,y:c.y,level:0,cd:d.kind==='income'?d.interval:0,spent:d.cost,target:'first',skin:p.skins[c.type]||'default',shots:0});
  } else if(['upgrade','sell','target'].includes(c.kind)) {
    const t=s.towers.find(t=>t.id===c.id);if(!t||t.owner!==playerId)return fail('자신의 타워를 선택하세요.');
    if(c.kind==='upgrade') {
      const cost=TOWERS[t.type].upgrades[t.level];if(cost===undefined)return fail('최대 레벨입니다.');if(p.money<cost)return fail('전투 자금이 부족합니다.');
      p.ach=p.ach||{places:0,upgrades:0};p.ach.upgrades++;p.money-=cost;t.level++;t.spent+=cost;t.cd=Math.min(t.cd,towerStats(t).interval);event(s,{kind:'upgrade',x:t.x,y:t.y,field:t.field,type:t.type,level:t.level});
    } else if(c.kind==='sell') {p.money+=Math.floor(t.spent*7/10);s.towers=s.towers.filter(a=>a.id!==t.id);s.units=s.units.filter(u=>u.from!==t.id);}
    else {if(!['first','strong','near'].includes(c.target))return fail('잘못된 타겟입니다.');t.target=c.target;}
  } else if(c.kind==='skip') {
    if(s.waveTime<8)return fail('웨이브 시작 8초 후 스킵할 수 있습니다.');
    if(s.wave>=campaignOf(s.config).waves.length)return fail('마지막 웨이브입니다.');
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
// All combat effects are deterministic. Only the authoritative simulation awards money.
function damage(s,e,n,t,ignoreArmor=false) {
  if(e.hp<=0||!Number.isFinite(n)||n<=0)return;
  const def=towerStats(t);
  let value=n*(ignoreArmor||def.pierce?1:1-(ENEMIES[e.type].armor||0));
  if(e.markUntil>s.time&&e.markAmp>1)value*=e.markAmp;
  const absorbed=Math.min(e.shield||0,value);
  if(absorbed>0)e.shield-=absorbed;
  const hpLoss=Math.min(e.hp,Math.max(0,value-absorbed));
  if(hpLoss>0){
    e.hp-=hpLoss;
    // Pay for real health removed, never the attack's overkill or shield damage.
    // The per-enemy budget prevents healing/regen from minting infinite money.
    // Dark Energy donations can add a bounded amount of payable extra health.
    const maxPayable=Math.max(0,e.maxHp+(e.bonusDamageBudget||0));
    const eligible=Math.min(hpLoss,Math.max(0,maxPayable-(e.paidDamage||0)));
    if(eligible>0&&e.maxHp>0){
      e.paidDamage=(e.paidDamage||0)+eligible;
      const rate=e.damageCashRate??(e.damageCashRate=
        bounty((e.rewardHpBase||e.maxHp)*COMBAT_SCALE)*DAMAGE_CASH_FACTOR/e.maxHp);
      const team=Object.values(s.players).filter(p=>p.field===e.field);
      const share=eligible*rate/(team.length||1);
      for(const p of team)p.money+=share;
    }
  }
  // HP is correctly capped at zero, but floating damage numbers must show the
  // complete effective hit (after armor/mark), NEVER the target's remaining HP.
  // For example 10 damage against 1 HP displays 10, not 1.
  const displayedDamage=Math.max(0,value);
  // Aggregate poison DoT labels over 250ms; the health calculation above
  // remains authoritative and is not affected by presentation overkill.
  if(ignoreArmor){
    e.dotFloat=(e.dotFloat||0)+displayedDamage;
    if(s.time-(e.lastDotFloatAt??-1)>=.25||e.hp<=0){
      if(e.dotFloat>0)event(s,{kind:'damage',x:e.x,y:e.y,field:e.field,type:e.type,amount:e.dotFloat,dot:true});
      e.dotFloat=0;e.lastDotFloatAt=s.time;
    }
  }else if(displayedDamage>0)event(s,{kind:'damage',x:e.x,y:e.y,field:e.field,type:e.type,amount:displayedDamage,shield:absorbed>0});
  if(e.hp>0)return;
  e.hp=0;
  // All combat cash is earned on damage above, not on the kill itself.
  s.kills++;
  event(s,{kind:'kill',x:e.x,y:e.y,field:e.field,type:e.type,color:ENEMIES[e.type].color,split:!!ENEMIES[e.type].onDeath,size:ENEMIES[e.type].size||12});
  if(s.config.modes.includes('darkenergy')){
    // Share the deceased enemy's ORIGINAL max HP among surviving enemies in
    // the same field. Only killed enemies trigger this, never leaked enemies.
    const recipients=s.enemies.filter(other=>other!==e&&other.field===e.field&&other.hp>0);
    if(recipients.length){
      const amount=Math.max(1,e.maxHp/recipients.length);
      for(const other of recipients){
        other.hp+=amount;
        // The minimum-1 rule can create additional HP; only the original
        // donor's divided max HP extends the earnable damage budget.
        other.bonusDamageBudget=(other.bonusDamageBudget||0)+Math.min(amount,e.maxHp/recipients.length);
      }
      const stride=Math.ceil(recipients.length/14);
      const targets=recipients.filter((_,index)=>index%stride===0).slice(0,14)
        .map(other=>({x:other.x,y:other.y}));
      event(s,{kind:'dark-transfer',x:e.x,y:e.y,field:e.field,amount,count:recipients.length,targets});
    }
  }
  const offspring=ENEMIES[e.type].onDeath||[];
  for(const [type,count] of offspring)for(let i=0;i<count&&s.enemies.length<350;i++){
    const child=spawn(s,type,e.field,'split');
    child.progress=e.progress;child.x=e.x;child.y=e.y;
  }
}
function applyHit(s,e,n,t,stats,scale=1){
  if(!e||e.hp<=0)return;
  const def=towerStats(t);
  const crit=def.critChance&&((t.id*17+(t.shots||0)*31)%100)<def.critChance;
  const execute=def.execute&&e.hp/e.maxHp<=def.execute;
  // Heavy snipers charge their every-Nth shot; ordering is derived from the unit.
  const charged=def.chargeEvery&&t.shots>0&&t.shots%def.chargeEvery===0;
  if(charged)event(s,{kind:'charged',x:e.x,y:e.y,field:e.field,type:t.type});
  damage(s,e,n*scale*(crit?(def.critBonus||1.8):1)*(execute?(def.executeBonus||2):1)*(charged?(def.chargeBonus||2):1),t);
  if(e.hp<=0)return;
  if(def.markAmp){
    e.markAmp=Math.max(e.markUntil>s.time?(e.markAmp||1):1,def.markAmp);
    e.markUntil=Math.max(e.markUntil||0,s.time+(def.markTime||3));
    event(s,{kind:'mark',x:e.x,y:e.y,field:e.field,type:t.type});
  }
  if(def.dot){
    const dot=def.dot;
    if(!e.dotDps||dot>=e.dotDps){e.dotDps=dot;e.dotFrom=t.type;}
    e.dotUntil=Math.max(e.dotUntil||0,s.time+(def.dotTime||3));
  }
  if(def.slow){
    const factor=Math.max(.25,def.slow);
    if(!e.slowFactor||factor<e.slowFactor)e.slowFactor=factor;
    e.slowUntil=Math.max(e.slowUntil||0,s.time+(def.slowTime||2));
  }
}
export function tick(s,dt=STEP) {
  if(s.status!=='playing')return;
  if(!Number.isFinite(dt)||dt<=0||dt>.1)throw Error('고정 스텝은 0~0.1초여야 합니다.');
  s.time+=dt;s.waveTime+=dt;
  // Single-pass bounded wave spawner: no double full-array filtering per 50ms tick.
  // A long skipped-wave queue is kept intact; only due entries can enter the battlefield.
  const capacity=Math.max(0,350-s.enemies.length),ready=[],pending=[];
  for(const queued of s.queue){
    if(ready.length<capacity&&queued.at<=s.time)ready.push(queued);
    else pending.push(queued);
  }
  s.queue=pending;
  for(const queued of ready)spawn(s,queued.type,queued.field);
  // Boss casts are resolved on the authoritative fixed-step timeline.
  // Skill charging is attached to each enemy instance, never to a global boss type.
  for(const e of s.enemies){
    const ability=BOSS_ABILITIES[e.type];if(!ability||e.hp<=0)continue;
    if(e.castReady===undefined)e.castReady=s.time+ability.cooldown;
    if(s.time+1e-8<e.castReady)continue;
    e.castReady+=ability.cooldown;
    if(ability.kind==='rush'){
      e.rushUntil=s.time+ability.duration;e.rushPower=ability.power;
    }else if(ability.kind==='shield'){
      const amount=Math.round(e.maxHp*ability.power);
      e.shield=Math.min((e.maxShield||0)+amount,(e.shield||0)+amount);
    }else if(ability.kind==='jam'){
      for(const t of s.towers){
        if(t.field===e.field&&dist(t,e)<=ability.radius){
          t.jammedUntil=Math.max(t.jammedUntil||0,s.time+ability.power);
        }
      }
    }
    event(s,{kind:'boss-skill',x:e.x,y:e.y,field:e.field,type:e.type,skill:ability.kind,name:ability.name,radius:ability.radius||80});
  }
  // Enemy healing, regeneration and damage-over-time. 1 tick = 50ms.
  for(const e of s.enemies){
    const d=ENEMIES[e.type];
    if(e.dotUntil>s.time&&e.dotDps&&e.hp>0)damage(s,e,e.dotDps*dt,{type:e.dotFrom},true);
    if(e.hp<=0)continue;
    if(d.regen&&e.hp<e.maxHp)e.hp=Math.min(e.maxHp,e.hp+d.regen*dt);
    if(d.heal){
      e.healClock=(e.healClock||0)+dt;
      if(e.healClock>=1){
        e.healClock-=1;
        for(const ally of s.enemies)if(ally.field===e.field&&ally.hp>0&&ally.hp<ally.maxHp&&dist(ally,e)<=(d.healRange||100))ally.hp=Math.min(ally.maxHp,ally.hp+d.heal);
        event(s,{kind:'heal',x:e.x,y:e.y,field:e.field,type:e.type});
      }
    }
  }
  // Resolve tower evolution exactly once per 50ms step and reuse aura stats.
  // This avoids repeated allocations and evolution lookups for every shot.
  const resolvedTowers=s.towers.map(t=>({t,stats:towerStats(t)}));
  const auras=resolvedTowers.filter(entry=>entry.stats.kind==='buff');
  for(const {t,stats} of resolvedTowers) {
    if(t.jammedUntil>s.time)continue;
    if(stats.kind==='buff')continue;
    t.cd-=dt;
    if(stats.kind==='income'){
      if(t.cd<=0){
        const owner=s.players[t.owner];if(owner)owner.money+=(stats.income||0);
        t.cd=stats.interval;
        event(s,{kind:'income',x:t.x,y:t.y,field:t.field,type:t.type});
      }
      continue;
    }
    if(t.cd>0)continue;
    const candidates=s.enemies.filter(e=>e.field===t.field&&e.hp>0&&(stats.kind==='summon'&&stats.summonStyle==='lane'||(t.x-e.x)**2+(t.y-e.y)**2<=stats.range**2));
    const order=t.target==='strong'?(a,b)=>b.hp-a.hp:t.target==='near'?(a,b)=>(a.x-t.x)**2+(a.y-t.y)**2-(b.x-t.x)**2-(b.y-t.y)**2:(a,b)=>b.progress-a.progress;
    if(stats.kind==='melee'||(stats.multi||1)>1)candidates.sort(order);
    else {let best=0;for(let i=1;i<candidates.length;i++)if(order(candidates[i],candidates[best])<0)best=i;if(best)[candidates[0],candidates[best]]=[candidates[best],candidates[0]];}
    const e=candidates[0];if(!e)continue;
    // Each spawner maintains a bounded active squad, rather than emitting
    // unlimited suicide units once every shot cooldown.
    const current=stats.kind==='summon'?s.units.reduce((n,u)=>n+(u.from===t.id&&u.life>0?1:0),0):0;
    if(stats.kind==='summon'&&current>=Math.max(1,stats.summons||1)){t.cd=0;continue;}
    const buffs=auras.filter(({t:b,stats:bs})=>b.field===t.field&&dist(b,t)<=bs.range);
    // Strongest aura of each category wins; different kinds may coexist.
    const power=buffs.reduce((a,{t:b,stats:bs})=>Math.max(a,1+(bs.power??(b.type==='workshop'?.2:0))),1);
    const haste=buffs.reduce((a,{stats:bs})=>Math.max(a,1+(bs.haste||0)),1);
    t.cd=stats.interval/haste;t.shots=(t.shots||0)+1;
    t.angle=Math.atan2(e.y-t.y,e.x-t.x);
    event(s,{kind:stats.kind,from:t.id,x:t.x,y:t.y,tx:e.x,ty:e.y,field:t.field,type:t.type,level:t.level,
      ...(stats.kind==='beam'?{range:stats.range}:{})});
    if(stats.kind==='summon'){
      const count=Math.min((stats.summons||1)-current,80-s.units.length);
      const lane=stats.summonStyle==='lane';
      const path=mapOf(s).path,baseProgress=lane?routeLength(path):0;
      // Long event maps must not exhaust a squad's timer before it can
      // physically reach the enemy front. Endurance is route-aware and bounded.
      const lifetime=lane?Math.min(150,Math.max(stats.unitLife||36,
        baseProgress/Math.max(1,stats.unitSpeed||130)+7)):(stats.unitLife||9);
      for(let i=0;i<count;i++){
        const progress=lane?Math.max(0,baseProgress-i*19):0;
        const origin=lane?pointOnPath(path,progress):{x:t.x,y:t.y};
        s.units.push({
          id:s.nextId++,from:t.id,owner:t.owner,field:t.field,type:t.type,
          level:t.level,role:lane?'lane':'orbit',target:e.id,
          x:origin.x,y:origin.y,progress,phase:lane?'march':'launch',
          hp:lane?stats.summonHp||120:1,maxHp:lane?stats.summonHp||120:1,
          life:lifetime,maxLife:lifetime,speed:stats.unitSpeed||(lane?130:550),
          damage:stats.damage*power,attackCd:.25+(i%3)*.12,
          attackInterval:stats.unitAttackInterval||.8,
          attackRange:stats.unitAttackRange||80,
          angle:(t.id*.61+i*6.283185307179586/Math.max(1,count)),
          radius:(stats.orbitRadius||62)+i*7,
          orbitShotInterval:stats.orbitShotInterval||.75,
          explosionMult:stats.orbitExplosionMult||3,
          explosionRadius:stats.orbitSplash||90
        });
      }
      event(s,{kind:lane?'summon-march':'summon-launch',from:t.id,x:lane?path.at(-1)[0]:t.x,
        y:lane?path.at(-1)[1]:t.y,field:t.field,type:t.type,count,level:t.level});
    }else if(stats.kind==='judgement'){
      const hits=s.enemies.filter(a=>a.field===t.field&&a.hp>0&&dist(a,e)<=stats.splash);
      for(const target of hits){
        const boss=!!BOSS_ABILITIES[target.type]||ENEMIES[target.type].size>=35;
        applyHit(s,target,stats.damage*power*(boss?(stats.bossBonus||1):1),t,stats);
      }
      event(s,{kind:'divine',from:t.id,x:t.x,y:t.y,tx:e.x,ty:e.y,field:t.field,type:t.type,level:t.level});
    }else if(stats.kind==='splash'){
      const hits=s.enemies.filter(a=>a.field===t.field&&a.hp>0&&dist(a,e)<=stats.splash);
      for(const a of hits)applyHit(s,a,stats.damage*power,t,stats);
    }else if(stats.kind==='beam'){
      // Solar lance: a finite-width straight line through the selected
      // target, never an unlimited global hit. Reuse the in-range candidate
      // array instead of scanning the full enemy roster a second time.
      const vx=e.x-t.x,vy=e.y-t.y,mag=Math.hypot(vx,vy)||1;
      const ux=vx/mag,uy=vy/mag,half=(stats.beamWidth||45)*.5;
      let hit=0;
      for(const a of candidates){
        if(a.hp<=0)continue;
        const xx=a.x-t.x,yy=a.y-t.y,along=xx*ux+yy*uy;
        const perpendicular=Math.abs(xx*uy-yy*ux);
        if(along>=0&&along<=stats.range&&perpendicular<=half){
          applyHit(s,a,stats.damage*power,t,stats);
          if(++hit>=(stats.beamTargets||6))break;
        }
      }
    }else if(stats.kind==='pulse'){
      // A radial pulse hits every target already found in the tower's range;
      // no additional full-enemy scan, and slow effects follow applyHit().
      for(const a of candidates)if(a.hp>0)applyHit(s,a,stats.damage*power,t,stats);
    }else if(stats.kind==='melee'){
      for(const a of candidates.slice(0,stats.cleave||3))applyHit(s,a,stats.damage*power,t,stats);
    }else if(stats.kind==='chain'){
      const targets=[e],left=new Set([e.id]),max=stats.chain||3;
      while(targets.length<max){
        const prev=targets[targets.length-1];
        let next=null,bestDistance=(stats.chainRange||120)**2;for(const a of s.enemies){if(a.field!==t.field||a.hp<=0||left.has(a.id))continue;const distance=(a.x-prev.x)**2+(a.y-prev.y)**2;if(distance<=bestDistance&&(!next||distance<bestDistance)){next=a;bestDistance=distance;}}
        if(!next)break;targets.push(next);left.add(next.id);
      }
      targets.forEach((target,i)=>{
        applyHit(s,target,stats.damage*power,t,stats,Math.max(.35,1-i*.13));
        if(i>0)event(s,{kind:'arc',x:targets[i-1].x,y:targets[i-1].y,tx:target.x,ty:target.y,field:t.field,type:t.type});
      });
    }else{
      const hits=candidates.slice(0,stats.multi||1);
      for(const [i,target] of hits.entries()){
        applyHit(s,target,stats.damage*power,t,stats,i===0?1:.82);
        if(i>0)event(s,{kind:'ranged',from:t.id,x:t.x,y:t.y,tx:target.x,ty:target.y,field:t.field,type:t.type});
      }
    }
  }
  // Summon rework: bounded orbiting gunships and reverse-lane combat squads.
  // All state is serializable and all effects/damage are server-authoritative.
  const enemyById=new Map(s.enemies.map(e=>[e.id,e]));
  const ownerById=new Map(s.towers.map(t=>[t.id,t]));
  const road=mapOf(s).path;
  for(const u of s.units){
    u.life-=dt;
    if(u.role==='orbit'){
      const owner=ownerById.get(u.from),stats=owner?towerStats(owner):towerStats(u);
      let e=enemyById.get(u.target);
      if(!e||e.hp<=0||e.field!==u.field){
        e=null;let nearest=Infinity;
        for(const enemy of s.enemies){
          if(enemy.hp<=0||enemy.field!==u.field)continue;
          const radius=owner?stats.range:470;
          const distance=owner?(enemy.x-owner.x)**2+(enemy.y-owner.y)**2:(enemy.x-u.x)**2+(enemy.y-u.y)**2;
          if(distance<nearest&&distance<=radius*radius){nearest=distance;e=enemy;}
        }
        if(e)u.target=e.id;
      }
      if(u.life<=0){
        // Final suicide dive affects all foes in the blast radius, then
        // the tower launches a replacement automatically after a short pause.
        if(e&&e.hp>0){
          const hit=owner||u,radius=u.explosionRadius||90;
          for(const other of s.enemies){
            if(other.hp<=0||other.field!==u.field)continue;
            if((other.x-e.x)**2+(other.y-e.y)**2<=radius*radius)
              applyHit(s,other,u.damage*(u.explosionMult||3),hit,stats);
          }
          u.x=e.x;u.y=e.y;
          event(s,{kind:'summon-crash',x:e.x,y:e.y,field:u.field,type:u.type,
            level:u.level,radius,from:u.from});
        }
        u.life=0;
        if(owner)owner.cd=Math.min(Math.max(0,owner.cd),.36);
        continue;
      }
      if(!e)continue;
      u.angle+=(u.type==='phoenix'?2.6:3.7)*dt;
      const orbitX=e.x+Math.cos(u.angle)*(u.radius||62),
            orbitY=e.y+Math.sin(u.angle)*(u.radius||62)-12;
      const distance=Math.hypot(orbitX-u.x,orbitY-u.y),step=(u.speed||500)*dt;
      if(distance>step&&distance>0){u.x+=(orbitX-u.x)*step/distance;u.y+=(orbitY-u.y)*step/distance;}
      else {u.x=orbitX;u.y=orbitY;u.phase='orbit';}
      u.attackCd=(u.attackCd||0)-dt;
      if(u.phase==='orbit'&&u.attackCd<=0&&e.hp>0){
        u.attackCd=u.orbitShotInterval||.75;
        const hit=owner||u,shot=u.type==='phoenix'?u.damage*.78:u.damage*.52;
        event(s,{kind:'summon-shot',x:u.x,y:u.y,tx:e.x,ty:e.y,field:u.field,
          type:u.type,level:u.level,from:u.from});
        applyHit(s,e,shot,hit,stats);
        // Fireballs splash nearby and leave the Phoenix's burn effect.
        if(u.type==='phoenix'){
          for(const other of s.enemies)if(other!==e&&other.hp>0&&other.field===u.field
            &&(other.x-e.x)**2+(other.y-e.y)**2<=42*42)
            applyHit(s,other,shot*.36,hit,stats);
        }
      }
      continue;
    }
    if(u.role==='lane'){
      if(u.life<=0||u.hp<=0){u.life=0;continue;}
      const previous=u.progress??routeLength(road);
      u.progress=Math.max(0,previous-(u.speed||580)*dt);
      const point=pointOnPath(road,u.progress);u.x=point.x;u.y=point.y;
      let e=null,closest=Infinity;
      // Lane progress, rather than Euclidean distance, prevents soldiers
      // attacking enemies through the folds of a winding map.
      for(const enemy of s.enemies){
        if(enemy.field!==u.field||enemy.hp<=0)continue;
        const separation=Math.abs(enemy.progress-u.progress);
        if(separation<closest){closest=separation;e=enemy;}
      }
      if(e&&closest<=u.attackRange){
        u.attackCd=(u.attackCd||0)-dt;
        if(u.attackCd<=0&&closest>28){
          u.attackCd=u.attackInterval||.85;
          const owner=ownerById.get(u.from)||u;
          event(s,{kind:'summon-shot',x:u.x,y:u.y,tx:e.x,ty:e.y,field:u.field,
            type:u.type,level:u.level,from:u.from});
          applyHit(s,e,u.damage*.42,owner,towerStats(owner));
        }
        if(e.hp>0&&closest<=28){
          const owner=ownerById.get(u.from)||u;
          const pierce=towerStats(owner).pierce;
          const armorFactor=pierce?1:Math.max(.1,1-(ENEMIES[e.type].armor||0));
          const mark=e.markUntil>s.time&&e.markAmp>1?e.markAmp:1;
          const enemyEffectiveHP=(e.hp+(e.shield||0))/(armorFactor*mark);
          const hpBefore=u.hp;
          damage(s,e,hpBefore,owner);
          u.hp=Math.max(0,hpBefore-enemyEffectiveHP);
          event(s,{kind:'summon-clash',x:u.x,y:u.y,tx:e.x,ty:e.y,field:u.field,
            type:u.type,level:u.level,remaining:u.hp});
          if(u.hp<=.0001)u.life=0;
          else u.attackCd=.35;
        }
      }
      if(u.progress<=0){u.life=0;event(s,{kind:'summon-arrive',x:u.x,y:u.y,field:u.field,type:u.type});}
      continue;
    }
    // Backward compatibility for already-running older match snapshots;
    // newly spawned units always carry an explicit orbit/lane role.
    let e=enemyById.get(u.target);
    if(e?.hp<=0)e=null;
    if(!e){e=s.enemies.find(e=>e.field===u.field&&e.hp>0);if(e)u.target=e.id;}
    if(!e)continue;
    const distance=dist(u,e),move=(u.speed||210)*dt;
    if(distance<=move+10){
      applyHit(s,e,u.damage,u,{damage:u.damage});
      u.life=0;event(s,{kind:'melee',x:u.x,y:u.y,tx:e.x,ty:e.y,field:e.field,type:u.type});
    }else {u.x+=(e.x-u.x)*move/distance;u.y+=(e.y-u.y)*move/distance;}
  }
  s.units=s.units.filter(u=>u.life>0);
  s.enemies=s.enemies.filter(e=>e.hp>0);
  for(const e of s.enemies) {
    e.progress+=e.speed*dt*(e.slowUntil>s.time?(e.slowFactor||1):1)*(e.rushUntil>s.time?(e.rushPower||1):1);const pos=pointOnPath(mapOf(s).path,e.progress);e.x=pos.x;e.y=pos.y;
    if(pos.end){s.fields[e.field]=Math.max(0,s.fields[e.field]-ENEMIES[e.type].leak);e.hp=0;event(s,{kind:'leak',x:e.x,y:e.y,field:e.field});}
  }
  s.enemies=s.enemies.filter(e=>e.hp>0);
  const dead=s.fields.findIndex(h=>h<=0);
  if(dead>=0){s.status=s.config.type==='pvp'?'complete':'defeat';s.winner=s.config.type==='pvp'?1-dead:null;return;}
  const d=campaignOf(s.config);
  const clear=s.fields.map((_,i)=>!s.enemies.some(e=>e.field===i)&&!s.queue.some(e=>e.field===i));
  if(s.wave===d.waves.length) {
    if(clear.every(Boolean)){s.status='victory';s.winner=s.config.type==='pvp'?(s.fields[0]===s.fields[1]?null:s.fields[0]>s.fields[1]?0:1):0;}
  } else if((s.config.type==='pvp'?clear.some(Boolean):clear.every(Boolean))||s.waveTime>=(s.waveDeadline??d.waves[s.wave-1].duration)) {
    // Backpressure keeps pathological skip/timeout combinations bounded without deleting enemies.
    if(s.queue.length<900)nextWave(s);
  }
}
export function advance(s,seconds) {let n=Math.min(1200,Math.floor(seconds/STEP+1e-8));while(n-->0&&s.status==='playing')tick(s);return s;}
// Compact end-of-match metrics; no extra live network traffic.
export function achievementRun(s,id){
  const p=s.players?.[id];if(!p)return null;
  return {type:s.config.type,difficulty:s.config.eventId||s.config.difficulty,map:s.config.map,
    modes:[...s.config.modes],win:s.config.type==='pvp'?s.winner===p.field:s.status==='victory',
    kills:s.kills||0,places:p.ach?.places||0,upgrades:p.ach?.upgrades||0,
    flawless:s.status==='victory'&&s.fields[p.field]===100};
}
export function rewardFor(s,id) {
  const p=s.players[id];if(!p||s.status==='playing')return {coins:0,xp:0,sonic:false,aurora:false,voidwalker:false,meatlordPack:false,win:false,clearBonus:0};
  const win=s.config.type==='pvp'?s.winner===p.field:s.status==='victory';
  const d=campaignOf(s.config);
  // PvP cannot be used to trade losses for unlimited account currency.
  if(s.config.type==='pvp')return {coins:0,xp:0,sonic:false,aurora:false,voidwalker:false,meatlordPack:false,win,clearBonus:0};
  const maxWave=d.waves.length;
  const progress=Math.max(0,Math.min(1,s.wave/maxWave));
  // Full-clear rewards fund permanent unlocks and expensive higher-rarity
  // tower progression. Completion is worth 8x the former account-currency
  // payout and 3x XP; partial runs retain their modest participation payout.
  // Multiplayer co-op uses the exact same authoritative server formula.
  const baseCoins=Math.floor(d.reward*modifiers(s.config).reward);
  const totalCoins=baseCoins*8;
  const totalXp=maxWave*20*3;
  const clearBonus=Math.floor(totalCoins*.70),clearXp=Math.floor(totalXp*.50);
  const coins=win?totalCoins:Math.floor(baseCoins*.4*progress);
  const xp=win?totalXp:Math.floor(maxWave*20*.4*progress);
  return {coins,xp,clearBonus:win?clearBonus:0,
    sonic:!s.config.eventId&&win&&DIFFICULTIES.indexOf(d)>=3&&s.config.modes.includes('supersonic'),
    aurora:!s.config.eventId&&win&&d.id==='ruin'&&s.config.modes.includes('elite'),
    voidwalker:!s.config.eventId&&win&&DIFFICULTIES.indexOf(d)>=3&&s.config.modes.includes('darkenergy'),
    meatlordPack:!s.config.eventId&&win&&DIFFICULTIES.indexOf(d)>=3&&s.config.modes.includes('tank'),
    oldgod:!!s.config.eventId&&win,win};
}
export function applyReward(profile,reward) {
  profile.coins+=reward.coins;profile.xp+=reward.xp;if(reward.win)profile.wins++;
  if(reward.sonic&&!profile.owned.includes('sonic'))profile.owned.push('sonic');if(reward.aurora&&!profile.owned.includes('aurora'))profile.owned.push('aurora');if(reward.oldgod&&!profile.owned.includes('oldgod'))profile.owned.push('oldgod');if(reward.voidwalker&&!profile.owned.includes('voidwalker'))profile.owned.push('voidwalker');
  // Challenge pack is granted once, to both local and server-backed profiles.
  if(reward.meatlordPack){profile.packs=Array.isArray(profile.packs)?profile.packs:['basic'];if(!profile.packs.includes('meatlord'))profile.packs.push('meatlord');}
  return profile;
}
export function profileAction(profile,a) {
  if(!a||typeof a!=='object')throw Error('잘못된 요청입니다.');
  // Legacy profiles predate crates and can lack cosmetic dictionaries.
  profile.skins=profile.skins&&typeof profile.skins==='object'?profile.skins:{};
  profile.equippedSkins=profile.equippedSkins&&typeof profile.equippedSkins==='object'?profile.equippedSkins:{};
  const oldPity=Number.isSafeInteger(profile.cratePity)&&profile.cratePity>=0?profile.cratePity:0;
  if(!profile.cratePities||typeof profile.cratePities!=='object'||Array.isArray(profile.cratePities))
    profile.cratePities={wardrobe:oldPity};
  for(const id of Object.keys(CRATES))
    if(!Number.isSafeInteger(profile.cratePities[id])||profile.cratePities[id]<0)
      profile.cratePities[id]=id==='wardrobe'?oldPity:0;
  profile.cratePity=profile.cratePities.wardrobe;
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
    if(!p)throw Error('잘못된 팩입니다.');if(p.price===null)throw Error('탱크 추가모드를 익스트림 이상에서 클리어해야 획득합니다.');if(profile.packs.includes(a.id))throw Error('이미 보유한 팩입니다.');
    if(profile.coins<p.price)throw Error('코인이 부족합니다.');profile.coins-=p.price;profile.packs.push(a.id);
  } else if(a.kind==='pack') {if(!profile.packs.includes(a.id))throw Error('보유한 팩을 선택하세요.');profile.pack=a.id;}
  else if(a.kind==='skin') {
    if(!profile.owned.includes(a.id)||!(a.skin==='default'||Object.hasOwn(SKIN_STYLES,a.skin)))throw Error('사용할 수 없는 스킨입니다.');
    if(a.skin!=='default'&&!profile.skins?.[a.id+':'+a.skin])throw Error('먼저 상자에서 스킨을 획득하세요.');
    profile.equippedSkins[a.id]=a.skin;
  } else if(a.kind==='openCrate'){
    const crate=Object.hasOwn(CRATES,a.id)?CRATES[a.id]:null,count=a.count;
    if(!crate||![1,10].includes(count))throw Error('잘못된 상자 열기 요청입니다.');
    if(profile.coins<crate.price*count)throw Error('상자를 열 코인이 부족합니다.');
    const eligible=profile.owned.filter(id=>Object.hasOwn(TOWERS,id));
    if(!eligible.length)throw Error('상자를 열려면 타워를 한 개 이상 보유해야 합니다.');
    // Each hand-authored skin fits only designated towers. Probability weights
    // are renormalized over the currently obtainable styles and shown in UI.
    const options=availableCrateStyles(crate,eligible);
    if(!options.length)throw Error('이 상자에 맞는 타워를 먼저 보유해야 합니다.');
    const values=new Uint32Array(count*2);crypto.getRandomValues(values);
    const selectStyle=(value,options)=>{
      const total=options.reduce((n,key)=>n+crate.odds[key],0);
      let index=value%total;
      for(const style of options){index-=crate.odds[style];if(index<0)return style;}
      return options[0];
    };
    let pity=profile.cratePities[a.id];
    const rolls=[];
    profile.coins-=crate.price*count;
    for(let i=0;i<count;i++){
      const missing=options.filter(style=>skinCandidates(style,eligible).some(id=>!profile.skins[id+':'+style]));
      const guaranteed=pity>=9&&missing.length>0;
      const style=selectStyle(values[i*2],guaranteed?missing:options);
      const permitted=skinCandidates(style,eligible);
      const towers=guaranteed?permitted.filter(id=>!profile.skins[id+':'+style]):permitted;
      const id=towers[values[i*2+1]%towers.length];
      const key=id+':'+style,duplicate=!!profile.skins[key];
      const refund=duplicate?Math.min(SKIN_STYLES[style].refund,Math.floor(crate.price/2)):0;
      if(!duplicate){profile.skins[key]=true;pity=0;}
      else pity++;
      profile.coins+=refund;
      rolls.push({id,style,rarity:SKIN_STYLES[style].rarity,duplicate,refund,guaranteed});
    }
    profile.cratePities[a.id]=pity;
    profile.cratePity=profile.cratePities.wardrobe;
    profile.lastCrate={crate:a.id,price:crate.price,rolls,pity};
  } else throw Error('지원하지 않는 요청입니다.');
  return profile;
}
