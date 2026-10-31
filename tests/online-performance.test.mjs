import test from 'node:test';
import assert from 'node:assert/strict';
import {visualPrediction} from '../src/online-prediction.js';
import {Core} from '../dist/cloudflare/core.js';
import {character,landscape} from '../src/art.js';
import {MAPS} from '../src/data.js';
const cfg={map:'plains',difficulty:'easy',type:'solo',modes:[]};
const player={id:'a',profile:Core.starterProfile()};
const make=()=>Core.createMatch(cfg,[player]);

test('online prediction advances a cloned simulation without mutating authoritative state',()=>{
  const original=make(),before=JSON.stringify(original);
  const predicted=visualPrediction(original,0.9);
  assert.notStrictEqual(predicted.state,original);
  assert.strictEqual(predicted.source,original);
  assert.equal(JSON.stringify(original),before);
  assert.ok(predicted.state.time>=0.85&&predicted.state.time<=0.95);
  assert.ok(predicted.state.enemies.length>original.enemies.length);
  const expected=JSON.parse(before);
  Core.advance(expected,0.9);
  assert.deepEqual(predicted.state,expected,'display prediction matches the same deterministic core on this horizon');
});

test('online prediction reuses its private state and resets on newer server snapshots',()=>{
  const source=make();
  const a=visualPrediction(source,0.3);
  const b=visualPrediction(source,0.6,a.state,a.source);
  assert.strictEqual(b.state,a.state);
  assert.ok(b.state.time>=0.55);
  assert.equal(source.time,0);
  Core.advance(source,0.9);
  const c=visualPrediction(source,0.1,b.state,b.source);
  assert.notStrictEqual(c.state,b.state);
  assert.strictEqual(c.source,source);
  assert.ok(c.state.time>=source.time);
});

test('prediction is bounded to prevent CPU spikes after suspended browser tabs',()=>{
  const source=make();
  const a=visualPrediction(source,9000);
  assert.ok(a.state.time<=0.61,'at most 12 fixed steps per render frame');
  assert.equal(source.time,0);
  let prior=a;
  for(let i=0;i<6;i++)prior=visualPrediction(source,9000,prior.state,prior.source);
  assert.ok(prior.state.time<=3.01,'only up to the bounded snapshot lookahead');
});

test('static portrait and map SVG output is cached for repeated UI navigation',()=>{
  assert.strictEqual(character('scout','default',1),character('scout','default',1));
  assert.strictEqual(landscape(MAPS[0]),landscape(MAPS[0]));
  assert.match(character('scout'),/<svg/);
  assert.match(landscape(MAPS[0]),/<svg/);
});
