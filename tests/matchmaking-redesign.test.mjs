import test from 'node:test';
import assert from 'node:assert/strict';
import {matchmakingMarkup,matchmakingCards,waitingRoomMarkup} from '../src/matchmaking.js';
import {Online} from '../src/online.js';
import worker from '../cloudflare/worker.js';

const setup={map:'plains',difficulty:'easy'};
const room=(type,players=['Alice'])=>({
  config:{type,...setup},host:'alice',
  names:Object.fromEntries(players.map((name,i)=>[i?'bob':'alice',name]))
});
test('PvP and co-op matchmaking have separate mode-specific screens and never mix rooms',()=>{
  const pvp=matchmakingMarkup('pvp',setup,{loggedIn:false,enabled:true});
  const coop=matchmakingMarkup('coop',setup,{loggedIn:true,enabled:true});
  assert.match(pvp,/data-mode="pvp"/);
  assert.match(coop,/data-mode="coop"/);
  assert.match(pvp,/로그인 \/ 회원가입/);
  assert.match(pvp,/data-action="createRoom"/);
  assert.doesNotMatch(pvp,/data-action="createRoom" disabled/);
  assert.match(coop,/2~4명/);
  assert.match(coop,/최대 4명/);
  assert.match(pvp,/최대 2명/);
  assert.doesNotMatch(coop,/로컬 PvP 봇전/);
  assert.match(matchmakingCards([],'pvp'),/아직 열린 방이 없습니다/);
});
test('card grid shows actual player slots, JOIN controls and escapes user names',()=>{
  const pvp=[{code:'FIGHT1',name:'<script>alert(1)</script>',type:'pvp',map:'plains',difficulty:'easy',count:1,capacity:2,players:['Alice']}];
  const html=matchmakingCards(pvp,'pvp',true);
  assert.match(html,/JOIN →/);
  assert.match(html,/1 \/ 2 PLAYERS/);
  assert.match(html,/Alice/);
  assert.match(html,/빈 자리/);
  assert.doesNotMatch(html,/<script>/);
  assert.match(html,/&lt;script&gt;/);
  const coop=matchmakingCards([{...pvp,type:'coop',capacity:4,code:'COOP11',name:'Bob',players:['Bob','Carol'],count:2}],'coop',false);
  assert.match(coop,/2 \/ 4 PLAYERS/);
  assert.equal((coop.match(/class="mm-player /g)||[]).length,4);
  assert.match(coop,/로그인 후 JOIN/);
});
test('room host can start only when another player joins, and code sharing is visible',()=>{
  const initial=waitingRoomMarkup('FIGHT1',room('pvp'),'alice');
  assert.match(initial,/FIGHT1/);
  assert.match(initial,/data-action="copyRoomCode"/);
  assert.match(initial,/data-action="startRoom" disabled/);
  const ready=waitingRoomMarkup('FIGHT1',room('pvp',['Alice','Bob']),'alice');
  assert.match(ready,/data-action="startRoom" >/);
  assert.match(ready,/게임 시작/);
  const guest=waitingRoomMarkup('FIGHT1',room('pvp',['Alice','Bob']),'bob');
  assert.match(guest,/data-action="startRoom" disabled/);
});
test('anonymous GET /rooms is filtered, no profile secrets, and bad types fail safely',async()=>{
  const source=[
    {code:'FIGHT1',name:'Alice',type:'pvp',map:'plains',difficulty:'easy',count:1,capacity:2,players:['Alice'],profiles:{private:true}},
    {code:'COOP11',name:'Bob',type:'coop',map:'snow',difficulty:'normal',count:2,capacity:4,players:['Bob','Carol']},
    {code:'FIGHT2',name:'Full',type:'pvp',count:2,capacity:2,players:['Full','Guest']}
  ];
  const env={ROOMS:{idFromName:s=>s,get:()=>({fetch:async()=>new Response(JSON.stringify({ok:true,data:source}))})}};
  const res=await worker.fetch(new Request('https://example.test/rooms?mode=pvp'),env);
  assert.equal(res.status,200);
  const data=await res.json();
  assert.equal(data.ok,true);
  assert.deepEqual(data.data.map(r=>r.code),['FIGHT1']);
  assert.deepEqual(data.data[0].players,['Alice']);
  assert.equal(data.data[0].profiles,undefined);
  const coop=await worker.fetch(new Request('https://example.test/rooms?mode=coop'),env);
  assert.deepEqual((await coop.json()).data.map(r=>r.code),['COOP11']);
  const bad=await worker.fetch(new Request('https://example.test/rooms?mode=solo'),env);
  assert.equal(bad.status,400);
});
test('public listing works without Firebase credentials and uses GET instead of auth-only POST',async()=>{
  const client=new Online();
  client.api='https://shinsung.example.test';
  const original=globalThis.fetch,calls=[];
  try{
    globalThis.fetch=async(url,options)=>{
      calls.push({url,options});
      return new Response(JSON.stringify({ok:true,data:[]}),{status:200});
    };
    assert.deepEqual(await client.publicRooms('pvp'),[]);
    assert.equal(calls[0].url,'https://shinsung.example.test/rooms?mode=pvp');
    assert.equal(calls[0].options.method,'GET');
    assert.equal(calls[0].options.cache,'no-store');
    await assert.rejects(client.publicRooms('solo'),/잘못된/);
  }finally{globalThis.fetch=original;}
});
