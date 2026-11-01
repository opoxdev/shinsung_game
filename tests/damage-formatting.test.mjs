import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DIFFICULTIES,EVENTS,TOWERS,starterProfile} from '../src/data.js';
import {createMatch} from '../src/engine.js';
import {formatCombatNumber} from '../src/render.js';
import {Core} from '../dist/cloudflare/core.js';

const make=(difficulty,type='solo')=>createMatch({map:'plains',difficulty,type,modes:[]},
  (type==='solo'?['p']:['p','friend']).map(id=>({id,profile:starterProfile(id)})));

test('floating damage displays are always whole numbers, rounded to nearest integer',()=>{
  for(const [value,label] of [
    [0.0001,'0'],[0.333333333333,'0'],[0.5,'1'],[1.333333333333,'1'],
    [1.6,'2'],[12.333333333333,'12'],[12.5,'13'],[1234.66666,'1,235'],
    [2999.9999,'3,000'],[NaN,'0'],[Infinity,'0']
  ])assert.equal(formatCombatNumber(value),label);
  const source=readFileSync(new URL('../src/render.js',import.meta.url),'utf8');
  assert.match(source,/const label=formatCombatNumber\(amount\)/);
  assert.doesNotMatch(source,/const label=amount<1\?/);
  // This is UI-only rounding. The engine still reports the complete actual
  // damage amount after armor instead of remaining enemy HP.
  const engine=readFileSync(new URL('../src/engine.js',import.meta.url),'utf8');
  assert.match(engine,/const displayedDamage=Math.max\(0,value\)/);
});

test('main player stats and HP both use nearest-integer formatting',()=>{
  const source=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
  assert.match(source,/const fmt=n=>Number.isFinite\(Number\(n\)\)\?Math.round/);
  assert.match(source,/const fmtHp=n=>Number.isFinite\(n\)\?Math.round/);
  assert.match(source,/compare\(stats.damage,nextStats\?\.damage\)/);
});

test('higher difficulties have a steeply increasing starting wallet, shared by all matchmaking types',()=>{
  const amounts=Object.fromEntries(DIFFICULTIES.map(d=>[d.id,d.startMoney]));
  assert.deepEqual(amounts,{
    easy:500,normal:850,hard:2200,extreme:4500,hell:9000,ruin:16000
  });
  const original={easy:500,normal:650,hard:850,extreme:1100,hell:1400,ruin:1800};
  const order=['easy','normal','hard','extreme','hell','ruin'];
  for(let i=1;i<order.length;i++){
    assert.ok(amounts[order[i]]>amounts[order[i-1]],'money must rise strictly by difficulty');
    if(i>=2)assert.ok(amounts[order[i]]/original[order[i]]>amounts[order[i-1]]/original[order[i-1]],
      'increase must be proportionally larger at higher difficulty');
  }
  for(const difficulty of order){
    for(const type of ['solo','coop','pvp']){
      const s=make(difficulty,type);
      const cloud=Core.createMatch({map:'plains',difficulty,type,modes:[]},
        Object.keys(s.players).map(id=>({id,profile:starterProfile(id)})));
      for(const id of Object.keys(s.players)){
        assert.equal(s.players[id].money,amounts[difficulty]);
        assert.equal(cloud.players[id].money,amounts[difficulty]);
      }
    }
  }
  assert.ok(amounts.ruin>=TOWERS.oldgod.cost);
});

test('separate Temple event remains unchanged at 4,200 starting coins',()=>{
  const evt=EVENTS.temple_of_ruin;
  assert.equal(evt.startMoney,4200);
  const config={map:evt.map,difficulty:'normal',type:'solo',modes:[],eventId:evt.id};
  assert.equal(createMatch(config,[{id:'p',profile:starterProfile()}]).players.p.money,4200);
  assert.equal(Core.createMatch(config,[{id:'p',profile:starterProfile()}]).players.p.money,4200);
});
