import test from 'node:test';
import assert from 'node:assert/strict';
import {ENEMIES,PACKS,TOWERS,MODES,DIFFICULTIES,starterProfile} from '../src/data.js';
import {createMatch,command,rewardFor,applyReward,profileAction} from '../src/engine.js';
import {monsterPortrait} from '../src/art.js';
import {MEAT_MONSTERS,meatMonsterPortrait,drawMeatPlate} from '../src/meat-art.js';
import {enemyStyle,enemyPlate} from '../src/enemy-art.js';

const cfg=(over={})=>({type:'solo',map:'plains',difficulty:'extreme',modes:['tank'],...over});
const game=(over={})=>createMatch(cfg(over),[{id:'a',profile:starterProfile()}]);

test('Meat Lord pack is an unlock-only, slow health-heavy five-unit roster with distinct silhouettes',()=>{
  assert.equal(PACKS.meatlord.name,'고기군주');
  assert.equal(PACKS.meatlord.price,null);
  assert.equal(MODES.tank.name,'탱크');
  assert.deepEqual(PACKS.meatlord.monsters.map(([id])=>id),MEAT_MONSTERS);
  const artworks=new Set();
  for(const [id,cost,cooldown] of PACKS.meatlord.monsters){
    const e=ENEMIES[id],portrait=monsterPortrait(id);
    assert.ok(e.hp>=ENEMIES.boss.hp,id+' must be tougher than a boss');
    assert.ok(e.speed<=25,id+' must be very slow');
    assert.ok(cost>=500&&cooldown>=12,id+' must be priced for strong HP pressure');
    assert.equal(enemyStyle(id),'flesh');
    assert.equal(portrait,meatMonsterPortrait(id));
    assert.match(portrait,new RegExp('data-meat-creature="'+id+'"'));
    assert.match(portrait,/viewBox="0 0 160 188"/);
    assert.ok(portrait.length>600,id+' needs detailed authored art');
    artworks.add(portrait.replace(/aria-label="[^"]*"/g,''));
  }
  assert.equal(artworks.size,5,'all five monsters need original designs');
  assert.deepEqual(ENEMIES.flesh_nest.onDeath,[['meatling',2]]);
});

test('five species use their own cached battle drawings rather than a recolored zombie',()=>{
  const prev=globalThis.OffscreenCanvas;
  const drawn=[];
  class FakeCanvas{
    constructor(width,height){this.width=width;this.height=height;}
    getContext(){
      const ctx={};
      for(const key of ['scale','translate','save','restore','beginPath','moveTo','lineTo','closePath','fill','stroke','ellipse','quadraticCurveTo'])
        ctx[key]=(...args)=>{if(['ellipse','lineTo','quadraticCurveTo'].includes(key))drawn.push(key);};
      return ctx;
    }
    transferToImageBitmap(){return {battleArt:true};}
  }
  try{
    globalThis.OffscreenCanvas=FakeCanvas;
    for(const id of MEAT_MONSTERS){
      const before=drawn.length;
      assert.ok(enemyPlate(id).battleArt);
      assert.ok(drawn.length>before,id+' should generate an illustrated canvas plate');
      assert.strictEqual(enemyPlate(id),enemyPlate(id),'cache should prevent repeated drawing');
    }
    assert.equal(drawMeatPlate({},'zombie'),false,'normal zombies should use their existing art');
  }finally{
    if(prev===undefined)delete globalThis.OffscreenCanvas;
    else globalThis.OffscreenCanvas=prev;
  }
});

test('Extreme+, Tank, and actual victory are all required for one permanent pack unlock',()=>{
  for(const difficulty of DIFFICULTIES.map(d=>d.id)){
    const s=game({difficulty});s.status='victory';
    const prize=rewardFor(s,'a');
    assert.equal(!!prize.meatlordPack,DIFFICULTIES.findIndex(d=>d.id===difficulty)>=3,difficulty);
  }
  for(const options of [{modes:[]},{modes:['elite']},{eventId:'temple_of_ruin',map:'temple_ruin',difficulty:'normal',modes:[]}]){
    const s=game(options);s.status='victory';assert.equal(rewardFor(s,'a').meatlordPack,false);
  }
  const loss=game();loss.status='defeat';assert.equal(rewardFor(loss,'a').meatlordPack,false);
  const pvp=createMatch(cfg({type:'pvp'}),[{id:'a',profile:starterProfile()},{id:'b',profile:starterProfile()}]);
  pvp.status='complete';pvp.winner=0;
  assert.equal(rewardFor(pvp,'a').meatlordPack,false);
  const s=game();s.status='victory';const reward=rewardFor(s,'a'),p=starterProfile();
  applyReward(p,reward);applyReward(p,reward);
  assert.deepEqual(p.packs,['basic','meatlord']);
  profileAction(p,{kind:'pack',id:'meatlord'});
  assert.equal(p.pack,'meatlord');
});

test('challenge pack is never purchasable through the store for free',()=>{
  const p=starterProfile();p.coins=1000000;
  assert.throws(()=>profileAction(p,{kind:'buyPack',id:'meatlord'}),/탱크/);
  assert.equal(p.coins,1000000);
  assert.deepEqual(p.packs,['basic']);
  assert.throws(()=>profileAction(p,{kind:'pack',id:'meatlord'}),/보유한 팩/);
});

test('individual limits are loosened for ordinary towers while extremes remain bounded',()=>{
  assert.equal(TOWERS.oldgod.cap,1);
  assert.equal(TOWERS.sonic.cap,2);
  assert.equal(TOWERS.rail.cap,3);
  assert.equal(TOWERS.aurora.cap,2);
  for(const id of ['scout','archer','blade','soldier','chef','icewitch','scrap','hunter','spirit','marker'])
    assert.ok(TOWERS[id].cap>=12,id+' should allow a flexible build');
  for(const id of ['summoner','firefly','knight','drone','lullaby','papercrane'])
    assert.ok(TOWERS[id].cap>=10,id);
  assert.ok(TOWERS.banker.cap<=8,'income stacking should still be bounded');
  const s=game({difficulty:'ruin'});
  s.players.a.loadout=['hunter','oldgod'];s.players.a.money=1000000;
  for(let i=0;i<6;i++){
    const result=command(s,'a',{kind:'place',type:'hunter',x:100+(i%3)*110,y:100+Math.floor(i/3)*110});
    assert.equal(result.ok,true,'the '+(i+1)+'th hunter should be placeable: '+result.error);
  }
  assert.equal(command(s,'a',{kind:'place',type:'oldgod',x:440,y:100}).ok,true);
  assert.equal(command(s,'a',{kind:'place',type:'oldgod',x:550,y:100}).ok,false);
  const limited=game({modes:['shortage']});
  limited.players.a.money=1000000;limited.players.a.loadout=['scout'];
  for(let i=0;i<5;i++)assert.equal(command(limited,'a',{kind:'place',type:'scout',x:100+i*110,y:100}).ok,true);
  assert.equal(command(limited,'a',{kind:'place',type:'scout',x:650,y:100}).ok,false,'global limit must remain five');
});
