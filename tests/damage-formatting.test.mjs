import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DIFFICULTIES,EVENTS,TOWERS,starterProfile,formatDamage,formatWholeStat,formatAttackInterval} from '../src/data.js';
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
  ])assert.equal(formatCombatNumber(value),label),assert.equal(formatDamage(value),label);
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
  // Balance patches make TOWERS.*.damage fractional; never interpolate it raw.
  assert.match(source,/피해량<b>\$\{t\.damage>0\?formatDamage\(t\.damage\)/);
  assert.doesNotMatch(source,/\$\{\s*t\.damage\s*(?:\}|\|\||\?\?)/,'raw damage must use integer UI formatter');
  for(const [id,tower] of Object.entries(TOWERS)){
    const displayed=formatDamage(tower.damage);
    assert.match(displayed,/^\d[\d,]*$/,'integer-only: '+id);
    assert.ok(!displayed.includes('.'),'no decimal point: '+id);
  }

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

test('attack speed, range and related tower stats never display a fractional number',()=>{
  for(const [seconds,display] of [
    [0,'0ms'],[.22,'220ms'],[.333333333333,'333ms'],
    [.35,'350ms'],[.91999999999,'920ms'],[1,'1초'],
    [1.23,'1,230ms'],[1.5,'1,500ms'],[2,'2초'],
    [2.832333333,'2,832ms'],[NaN,'0ms'],[Infinity,'0ms']
  ])assert.equal(formatAttackInterval(seconds),display,String(seconds));
  for(const [number,display] of [
    [123.2,'123'],[123.5,'124'],[345.555,'346'],[1276.111,'1,276']
  ])assert.equal(formatWholeStat(number),display);
  for(const [id,tower] of Object.entries(TOWERS)){
    for(const label of [formatAttackInterval(tower.interval),formatWholeStat(tower.range),formatDamage(tower.damage)]){
      assert.doesNotMatch(label,/\d\.\d/,'fractional stat displayed: '+id+' '+label);
      assert.match(label,/^[\d,]+(?:ms|초)?$/,'valid whole-number stat label: '+id);
    }
  }
});

test('tower collection and in-game inspector use the same integer-only stat formatter',()=>{
  const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
  assert.match(main,/공격 간격<b>\$\{formatAttackInterval\(t\.interval\)\}<\/b>/);
  assert.match(main,/사거리<b>\$\{formatWholeStat\(t\.range\)\}<\/b>/);
  assert.match(main,/compare\(stats\.interval,nextStats\?\.interval,'interval'\)/);
  assert.match(main,/const show=kind==='interval'\?formatAttackInterval:formatWholeStat/);
  assert.match(main,/formatAttackInterval\(stats\.interval\)/,'income interval is also a whole-number label');
  assert.match(main,/formatAttackInterval\(stats\.markTime\|\|3\)/,'mark duration shows whole-number time');
  assert.doesNotMatch(main,/\.interval\.toFixed\(/,'do not format an interval using decimal seconds');
  assert.doesNotMatch(main,/\$\{\s*(?:t|stats)\.(?:interval|range)\s*\}/,'raw interval/range text is forbidden');
  assert.doesNotMatch(main,/Number\(now\)\.toFixed/,'inspector old decimal formatter must not return');
});
