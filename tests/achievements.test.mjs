import test from 'node:test';
import assert from 'node:assert/strict';
import {ACHIEVEMENTS,ACHIEVEMENT_CATEGORIES,achievementView,achievementProgress,
  achievementSummary,recordAchievementRun,claimAchievementReward} from '../src/achievements.js';
import {achievementPageMarkup} from '../src/achievement-page.js';
import {TOWERS,MODES,DIFFICULTIES,starterProfile} from '../src/data.js';
import {createMatch,command,achievementRun,rewardFor,applyReward} from '../src/engine.js';
import {Core} from '../dist/cloudflare/core.js';
import {claimSoloProfile,claimProfile,claimAchievementProfile} from '../cloudflare/profile.js';

function fakeDb(){
  let profile=starterProfile('Student'),version=0,writes=0,reads=0;
  return {
    db:{prepare(sql){
      let args=[];
      return {bind(...xs){args=xs;return this;},
        async first(){reads++;return {profile_json:JSON.stringify(profile),version};},
        async run(){
          if(sql.startsWith('INSERT'))return {meta:{changes:0}};
          if(!sql.startsWith('UPDATE profiles'))throw Error('Unexpected SQL: '+sql);
          if(args[3]!==version)return {meta:{changes:0}};
          profile=JSON.parse(args[0]);version++;writes++;return {meta:{changes:1}};
        }
      };
    }},
    profile:()=>profile,writes:()=>writes,reads:()=>reads
  };
}
const user={uid:'test',name:'Student'};

test('35 unique achievements span five categories, with owned tower rewards and meaningful goals',()=>{
  assert.equal(ACHIEVEMENTS.length,35);
  assert.equal(ACHIEVEMENT_CATEGORIES.length,5);
  assert.equal(new Set(ACHIEVEMENTS.map(a=>a.id)).size,ACHIEVEMENTS.length);
  for(const a of ACHIEVEMENTS){
    assert.ok(ACHIEVEMENT_CATEGORIES.some(c=>c.id===a.category),a.id);
    assert.ok(['common','rare','epic','legendary','mythic'].includes(a.grade),a.id);
    assert.ok(Number.isSafeInteger(a.goal)&&a.goal>0,a.id);
    assert.ok(a.title.length>=3&&a.description.length>=7,a.id);
    assert.ok(a.reward.tower?Object.hasOwn(TOWERS,a.reward.tower):a.reward.coins>0,a.id);
  }
  assert.ok(Object.hasOwn(TOWERS,'sonic')&&Object.hasOwn(TOWERS,'aurora'));
});

test('legacy accounts preserve wins and Sonic/Aurora ownership without fabricated early progress',()=>{
  const p=starterProfile('Veteran');p.wins=6;p.owned.push('sonic','aurora');
  const view=achievementView(p);
  assert.equal(view.find(a=>a.id==='veteran_5').status,'ready');
  assert.equal(view.find(a=>a.id==='sonic_trial').status,'claimed');
  assert.equal(view.find(a=>a.id==='aurora_trial').status,'claimed');
  assert.equal(view.find(a=>a.id==='clear_extreme').status,'locked');
  assert.equal(achievementSummary(p).total,35);
});

test('real game commands track placements and upgrades only on successful actions',()=>{
  const p=starterProfile('Student');
  const s=createMatch({map:'plains',difficulty:'easy',type:'solo',modes:[]},[{id:'local',profile:p}]);
  const place=command(s,'local',{kind:'place',type:'scout',x:250,y:440,seq:1});
  assert.equal(place.ok,true);
  assert.equal(command(s,'local',{kind:'place',type:'invalid',x:280,y:440}).ok,false);
  const upgrade=command(s,'local',{kind:'upgrade',id:s.towers[0].id,seq:2});
  assert.equal(upgrade.ok,true);
  const metrics=achievementRun(s,'local');
  assert.equal(metrics.places,1);
  assert.equal(metrics.upgrades,1);
  assert.equal(Core.achievementRun(s,'local').places,1);
});

test('one completed solo run updates gameplay rewards and progress in only one D1 transaction',async()=>{
  const f=fakeDb();
  const run={type:'solo',difficulty:'easy',map:'plains',modes:[],win:true,
    kills:140,places:42,upgrades:33,flawless:true};
  const reward={coins:180,xp:200,win:true,sonic:false,aurora:false};
  const id='9eb83cb3-b958-48f0-bfa0-9a513a0f6fc1';
  await claimSoloProfile(f.db,user,id,reward,run);
  assert.equal(f.writes(),1);
  const after=f.profile();
  assert.equal(after.coins,780);
  assert.equal(after.achievementStats.wins,1);
  assert.equal(after.achievementStats.kills,140);
  assert.equal(after.achievementStats.places,42);
  assert.equal(after.achievementStats.upgrades,33);
  for(const key of ['first_clear','clear_easy','kills_100','upgrade_30','flawless'])
    assert.equal(achievementView(after).find(a=>a.id===key).status,'ready',key);
  await claimSoloProfile(f.db,user,id,reward,run);
  assert.equal(f.writes(),1,'replay must not count or pay achievements again');
});

test('reward button grants exactly once, and blocked claims do not spend D1 writes',async()=>{
  const f=fakeDb();
  await assert.rejects(claimAchievementProfile(f.db,user,'kills_100'),/달성 조건/);
  assert.equal(f.writes(),0);
  const id='ed783cb3-b958-48f0-bfa0-9a513a0f6fc1';
  await claimSoloProfile(f.db,user,id,{coins:180,xp:200,win:true,sonic:false,aurora:false},
    {type:'solo',difficulty:'easy',map:'plains',modes:[],win:true,kills:120,places:1,upgrades:0,flawless:false});
  const claimed=await claimAchievementProfile(f.db,user,'kills_100');
  assert.equal(claimed.coins,600+180+120);
  assert.equal(achievementView(claimed).find(a=>a.id==='kills_100').status,'claimed');
  await assert.rejects(claimAchievementProfile(f.db,user,'kills_100'),/이미 수령/);
  assert.equal(f.writes(),2,'one result and one claim are the only writes');
});

test('PvP and coop progress can only be recorded once per authenticated room claim',async()=>{
  const f=fakeDb();
  const reward={coins:0,xp:0,win:true,sonic:false,aurora:false,
    achievementRun:{type:'pvp',difficulty:'easy',map:'plains',modes:[],win:true,kills:14,places:8,upgrades:2,flawless:false}};
  await claimProfile(f.db,user,'ROOM11',reward);
  await claimProfile(f.db,user,'ROOM11',reward);
  assert.equal(f.writes(),1);
  assert.equal(f.profile().achievementStats.pvpWins,1);
  assert.equal(achievementView(f.profile()).find(a=>a.id==='pvp_1').status,'ready');
  reward.achievementRun={...reward.achievementRun,type:'coop'};
  await claimProfile(f.db,user,'ROOM22',reward);
  assert.equal(f.profile().achievementStats.coopWins,1);
});

test('map exploration, elite, supersonic and flawless clears increment independently',()=>{
  const p=starterProfile('Traveler');
  for(const map of ['plains','mountains','crystal']){
    recordAchievementRun(p,{type:'solo',difficulty:'extreme',map,modes:['supersonic','elite'],win:true,kills:40,places:5,upgrades:4,flawless:true});
  }
  assert.equal(achievementProgress(p,ACHIEVEMENTS.find(a=>a.id==='explorer_3')),3);
  assert.equal(achievementProgress(p,ACHIEVEMENTS.find(a=>a.id==='sonic_trial')),1);
  assert.equal(achievementProgress(p,ACHIEVEMENTS.find(a=>a.id==='flawless')),3);
  assert.equal(achievementView(p).find(a=>a.id==='elite_mode').status,'ready');
  assert.equal(achievementView(p).find(a=>a.id==='aurora_trial').status,'locked');
  const s=achievementSummary(p);assert.ok(s.ready>=4);
});

test('achievement dashboard has filters, actual progress, claim buttons, mythic tower art, and no network dependencies',()=>{
  const p=starterProfile('Test');
  recordAchievementRun(p,{type:'solo',difficulty:'easy',map:'plains',modes:[],win:true,kills:101,places:1,upgrades:0,flawless:false});
  const html=achievementPageMarkup(p);
  assert.match(html,/data-action="achievementClaim"/);
  assert.match(html,/data-action="achievementFilter"/);
  assert.match(html,/data-action="achievementPrepare"/);
  assert.match(html,/data-base="sonic"/);
  assert.match(html,/progressbar/);
  assert.match(achievementPageMarkup(p,'ready'),/보상 수령 대기/);
  assert.doesNotMatch(html,/<script|<iframe|fonts\.googleapis\.com/);
  assert.match(achievementPageMarkup(p,'friends'),/멀티플레이/);
});

test('old Sonic earned instantly by rewardFor remains permanent; achievement does not double-award',()=>{
  const p=starterProfile('Legacy');
  applyReward(p,{coins:180,xp:100,win:true,sonic:true,aurora:false});
  assert.ok(p.owned.includes('sonic'));
  assert.equal(achievementView(p).find(a=>a.id==='sonic_trial').status,'claimed');
  assert.throws(()=>claimAchievementReward(p,'sonic_trial'),/이미 수령/);
});
