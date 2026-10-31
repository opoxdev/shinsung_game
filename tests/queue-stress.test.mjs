import test from 'node:test';
import assert from 'node:assert/strict';
import { createMatch, tick } from '../src/engine.js';
import { starterProfile } from '../src/data.js';
const match=()=>{
 const s=createMatch({map:'plains',difficulty:'easy',type:'solo',modes:[]},[{id:'a',profile:starterProfile()}]);
 s.queue=[];s.enemies=[];return s;
};
test('large mixed-timestamp queues never lose or duplicate enemies at capacity',()=>{
 const s=match();
 s.queue=Array.from({length:900},(_,i)=>({type:i%2?'runner':'zombie',field:0,at:i%3===0?0:1000,id:i}));
 tick(s);
 assert.equal(s.enemies.length,300);
 assert.equal(s.queue.length,600);
 assert.equal(new Set(s.queue.map(x=>x.id)).size,600);
 const first=new Set(s.queue.map(x=>x.id));
 tick(s);
 assert.equal(s.enemies.length,300);
 assert.deepEqual(new Set(s.queue.map(x=>x.id)),first);
});
test('spawn backpressure leaves future arrivals queued and respects 350 unit cap',()=>{
 const s=match();
 s.queue=Array.from({length:700},(_,i)=>({type:'zombie',field:0,at:i<400?0:1000}));
 tick(s);
 assert.equal(s.enemies.length,350);
 assert.equal(s.queue.length,350);
 assert.equal(s.queue.filter(q=>q.at===0).length,50);
 assert.equal(s.queue.filter(q=>q.at===1000).length,300);
});
test('future entries are not starved by earlier delayed spawns',()=>{
 const s=match();
 s.queue=[{type:'zombie',field:0,at:1000},{type:'runner',field:0,at:0}];
 tick(s);assert.equal(s.enemies.length,1);assert.equal(s.enemies[0].type,'runner');
 assert.equal(s.queue.length,1);assert.equal(s.queue[0].type,'zombie');
});
