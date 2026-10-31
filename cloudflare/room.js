import {Core} from '../dist/cloudflare/core.js';
const bad = message => new Response(JSON.stringify({ok:false,error:message}),{status:400,headers:{'content-type':'application/json'}});
const ok = data => new Response(JSON.stringify({ok:true,data}),{headers:{'content-type':'application/json'}});
const CODE_LIMIT=5000, ROOM_TTL=24*3600*1000, LOBBY_TTL=2*3600*1000;
// Budget: ~1 host tick per 3s/room; the clients smoothly predict between snapshots.
export const ROOM_PULSE_MS=2700, ROOM_FAILOVER_MS=8500, ROOM_SAVE_MS=18000, EFFECT_WINDOW=.8;
const DIRECTORY_KEY='PUBLIC_ROOM_DIRECTORY_V1';
export class GameRoom {
  constructor(ctx,env){
    this.ctx=ctx;this.env=env;this.room=null;this.lastSave=0;
    this.ctx.blockConcurrencyWhile(async()=>{this.room=await ctx.storage.get('room')||null;});
  }
  async persist(){this.room.lastSavedAt=Date.now();await this.ctx.storage.put('room',this.room);this.lastSave=this.room.lastSavedAt;}
  // One Durable Object acts as the authoritative public lobby index.
  // Room DOs publish only non-sensitive metadata after membership changes.
  async syncDirectory(room=this.room){
    if(!this.env?.ROOMS||!room?.code||room.config.type==='solo')return;
    const entry=room.status==='lobby'&&Object.keys(room.members).length<(room.config.type==='pvp'?2:4)?
      {code:room.code,name:room.names[room.host]||'방장',type:room.config.type,map:room.config.map,
       difficulty:room.config.difficulty,count:Object.keys(room.members).length,capacity:room.config.type==='pvp'?2:4,
       players:Object.keys(room.members).map(uid=>String(room.names[uid]||'모험가').slice(0,20)),createdAt:room.createdAt}:null;
    const stub=this.env.ROOMS.get(this.env.ROOMS.idFromName(DIRECTORY_KEY));
    const res=await stub.fetch('https://directory/action',{method:'POST',headers:{'content-type':'application/json'},
      body:JSON.stringify({action:'directorySync',payload:{code:room.code,entry}})});
    const result=await res.json();if(!result.ok)throw Error('방 목록 동기화 실패');
  }
  async directoryAction(name,p){
    // Concurrent creators may publish in the same millisecond. SQLite-backed
    // Durable Object storage transactions prevent lost directory entries.
    const operation=async storage=>{
      const now=Date.now();
      const entries=await storage.get('directory')||{};
      let changed=false;
      for(const [code,v] of Object.entries(entries))
        if(now-v.createdAt>LOBBY_TTL||v.count>=v.capacity){delete entries[code];changed=true;}
      if(name==='directorySync'){
        if(!/^[A-Z0-9]{6}$/.test(p.code||''))throw Error('잘못된 방 코드');
        if(p.entry&&p.entry.code===p.code&&p.entry.createdAt<=now&&now-p.entry.createdAt<LOBBY_TTL
          &&['pvp','coop'].includes(p.entry.type)&&p.entry.count>0&&p.entry.count<p.entry.capacity)
          entries[p.code]=p.entry;
        else delete entries[p.code];
        changed=true;
      }
      if(changed)await storage.put('directory',entries);
      if(name==='directoryList')return Object.values(entries)
        .sort((a,b)=>b.createdAt-a.createdAt).slice(0,100);
      return {updated:true};
    };
    return this.ctx.storage.transaction?
      this.ctx.storage.transaction(operation):operation(this.ctx.storage);
  }
  view(){
    const r=this.room;
    if(!r)return null;
    const {profiles,claimed,state,...visible}=r;
    return {...visible,stateJson:r.state?JSON.stringify(r.state):null};
  }
  broadcast(){const payload=JSON.stringify({type:'room',room:this.view()});for(const sock of this.ctx.getWebSockets())try{sock.send(payload);}catch{}}
  ensure(uid){if(!this.room?.members?.[uid])throw Error('이 방의 참가자가 아닙니다.');}
  advance(){
    const r=this.room;
    if(!r||r.status!=='playing')return false;
    const now=Date.now(),secs=Math.max(0,(now-r.lastPulse)/1000);
    const steps=Math.min(100,Math.floor(secs/Core.STEP+1e-7));
    if(!steps)return false;
    // A disconnected match pauses after a short bounded catch-up; no runaway CPU use.
    Core.advance(r.state,steps*Core.STEP);
    // These effects only render for <=450ms; old events have no gameplay impact.
    // Prune BEFORE persistence and broadcast, not just from the wire payload.
    r.state.events=r.state.events.filter(e=>r.state.time-e.time<=EFFECT_WINDOW);
    r.lastPulse=secs>5?now:r.lastPulse+steps*Core.STEP*1000;
    if(r.state.status!=='playing')r.status='finished';
    return true;
  }
  async action(name,p,user){
    if(name==='directoryList'||name==='directorySync')return this.directoryAction(name,p);
    const r=this.room,uid=user?.uid;
    // Called only by the authenticated Worker's admin handler, never exposed
    // as a normal /api or WebSocket command.
    if(name==='adminKick'){
      if(user?.admin!==true||typeof p.uid!=='string')throw Error('관리자 권한이 없습니다.');
      if(!r?.members?.[p.uid])return {removed:false};
      return this.action('leave',{}, {uid:p.uid});
    }
    if(name==='create'){
      if(r)throw Error('이미 사용 중인 방 코드입니다.');
      const cfg=Core.validateConfig(p.config);
      this.room={code:p.code||'',config:cfg,host:uid,createdAt:Date.now(),lastPulse:Date.now(),members:{[uid]:true},names:{[uid]:user.name},profiles:{[uid]:p.profile},status:'lobby',state:null};
      await this.persist();await this.syncDirectory().catch(e=>console.warn(e));return {created:true};
    }
    if(!r||name!=='leave'&&Date.now()-r.createdAt>ROOM_TTL)throw Error('존재하지 않거나 만료된 방입니다.');
    if(name==='join'){
      if(r.status!=='lobby'||r.config.type==='solo')throw Error('참가할 수 없는 대기실입니다.');
      if(Date.now()-r.createdAt>2*3600*1000)throw Error('대기실이 만료되었습니다.');
      if(!r.members[uid]&&Object.keys(r.members).length>=(r.config.type==='pvp'?2:4))throw Error('방이 가득 찼습니다.');
      r.code||=p.code||'';r.members[uid]=true;r.names[uid]=user.name;r.profiles[uid]=p.profile;
      await this.persist();await this.syncDirectory().catch(e=>console.warn(e));this.broadcast();return {joined:true};
    }
    this.ensure(uid);
    if(name==='ticket'){
      const ticket=crypto.randomUUID();
      await this.ctx.storage.put('ticket:'+ticket,{uid,until:Date.now()+30000});
      return {ticket};
    }
    if(name==='start'){
      if(r.host!==uid||r.status!=='lobby')throw Error('방장만 대기실에서 시작할 수 있습니다.');
      const ids=Object.keys(r.members);
      if(r.config.type==='coop'&&ids.length<2)throw Error('협동전에는 2명 이상 필요합니다.');
      r.state=Core.createMatch(r.config,ids.map(id=>({id,profile:r.profiles[id]})));
      r.status='playing';r.lastPulse=Date.now();
      await this.persist();await this.syncDirectory().catch(e=>console.warn(e));this.broadcast();return {started:true};
    }
    if(name==='pulse'){
      if(r.status!=='playing'||Date.now()-r.lastPulse<ROOM_PULSE_MS)return {updated:false};
      if(r.host!==uid && Date.now()-r.lastPulse<ROOM_FAILOVER_MS)return {updated:false};
      if(r.host!==uid)r.host=uid;
      if(!this.advance())return {updated:false};
      if(Date.now()-(r.lastSavedAt||0)>ROOM_SAVE_MS||r.status!=='playing'||r.state.wave!==r.lastSavedWave){r.lastSavedWave=r.state.wave;await this.persist();}
      this.broadcast();return {updated:true};
    }
    if(name==='command'){
      if(!p.command||JSON.stringify(p.command).length>CODE_LIMIT)throw Error('잘못된 명령입니다.');
      if(r.status!=='playing')throw Error('전투가 종료되었습니다.');
      this.advance();
      const result=Core.command(r.state,uid,p.command);
      await this.persist();this.broadcast();return result;
    }
    if(name==='reward'){
      if(!r.state||r.state.status==='playing')throw Error('전투가 끝나지 않았습니다.');
      return Core.rewardFor(r.state,uid);
    }
    if(name==='leave'){
      delete r.members[uid];delete r.names[uid];delete r.profiles[uid];
      const remaining=Object.keys(r.members);
      if(r.state&&r.status==='playing'){
        if(r.config.type==='pvp'){
          r.state.status='complete';r.state.winner=1-r.state.players[uid].field;r.status='finished';
        } else if(!remaining.length){r.state.status='defeat';r.status='finished';}
      }
      if(r.host===uid)r.host=remaining[0]||'';
      if(!remaining.length){this.room=null;await this.ctx.storage.delete('room');}else await this.persist();
      await this.syncDirectory(r).catch(e=>console.warn(e));
      for(const sock of this.ctx.getWebSockets())if(sock.deserializeAttachment()?.uid===uid)try{sock.close(1000,'Left room');}catch{}
      this.broadcast();return {left:true};
    }
    throw Error('지원하지 않는 방 요청입니다.');
  }
  async fetch(request){
    const url=new URL(request.url);
    if(url.pathname==='/socket'){
      if(request.headers.get('Upgrade')?.toLowerCase()!=='websocket')return bad('WebSocket 연결이 필요합니다.');
      const ticket=url.searchParams.get('ticket');if(!ticket||!/^[-a-f0-9]{36}$/.test(ticket))return bad('접속 권한이 없습니다.');
      const grant=await this.ctx.storage.get('ticket:'+ticket);
      if(!grant||grant.until<Date.now()||!this.room?.members?.[grant.uid])return bad('접속 권한이 만료되었습니다.');
      await this.ctx.storage.delete('ticket:'+ticket);
      const [client,server]=Object.values(new WebSocketPair());
      this.ctx.acceptWebSocket(server);server.serializeAttachment({uid:grant.uid,rateAt:0,rateCount:0});
      server.send(JSON.stringify({type:'room',room:this.view()}));
      return new Response(null,{status:101,webSocket:client});
    }
    if(request.method!=='POST')return bad('올바르지 않은 요청입니다.');
    try{
      const {action,payload,user}=await request.json();
      return ok(await this.action(action,payload||{},user));
    }catch(e){return bad(String(e.message||'방 처리 실패').slice(0,180));}
  }
  async webSocketMessage(socket,message){
    const a=socket.deserializeAttachment();
    if(!a||typeof message!=='string'||message.length>CODE_LIMIT+400)return;
    const now=Date.now();if(now-a.rateAt>5000){a.rateAt=now;a.rateCount=0;}
    if(++a.rateCount>30){socket.send(JSON.stringify({type:'error',message:'요청이 너무 빠릅니다.'}));return;}
    socket.serializeAttachment(a);
    let obj;
    try{obj=JSON.parse(message);if(!['command','pulse'].includes(obj.type))return;
      if(obj.type==='pulse'&&this.room?.host!==a.uid&&Date.now()-this.room?.lastPulse<ROOM_FAILOVER_MS)return;
      const data=await this.action(obj.type,obj.type==='command'?{command:obj.command}:{},{uid:a.uid});
      if(obj.id)socket.send(JSON.stringify({type:'ack',id:obj.id,data}));
    }catch(e){if(obj?.id)socket.send(JSON.stringify({type:'ack',id:obj.id,error:String(e.message).slice(0,180)}));}
  }
  async webSocketClose(){ /* hibernation-capable; no timers or in-memory sockets */ }
}
