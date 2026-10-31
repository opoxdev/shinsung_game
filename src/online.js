// Firebase Spark Auth + Cloudflare Workers Free / Durable Objects WebSockets.
// All game state mutations happen on the authenticated Cloudflare server.
export class Online {
  constructor(){
    this.config=globalThis.__FIREBASE_CONFIG__||null;
    this.api=(globalThis.__CLOUDFLARE_API__||'').replace(/\/$/,'');
    this.enabled=!!(this.config?.apiKey&&this.config.projectId&&/^https:\/\//.test(this.api));
    this.user=null;this.room=null;this.socket=null;this.seq=0;this.pending=new Map();this.nextId=0;
    this.retries=0;this.closed=true;this.serial=0;this.heartbeat=null;this.hostId=null;this.matchStatus='lobby';this.lastRoomPush=0;
  }
  async init(onUser){
    if(!this.enabled)return;
    const [app,auth]=await Promise.all([
      import('https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js')
    ]);
    const a=app.initializeApp(this.config);this.auth=auth.getAuth(a);this.authSDK=auth;
    auth.onAuthStateChanged(this.auth,async user=>{
      if(this.user?.uid!==user?.uid)this.stop();
      this.user=user;try{await onUser(user);}catch(e){this.onError?.(e);}
    });
  }
  async signIn(email,password,signup){if(!this.auth)throw Error('온라인 서버 설정이 필요합니다. DEPLOY.md를 확인하세요.');const credential=await (signup?this.authSDK.createUserWithEmailAndPassword(this.auth,email,password):this.authSDK.signInWithEmailAndPassword(this.auth,email,password));this.user=credential.user;return credential;}
  async signOut(){this.stop();if(this.auth)await this.authSDK.signOut(this.auth);}
  async apiCall(action,payload={}){
    if(!this.user)throw Error('먼저 계정에 로그인하세요.');
    const token=await this.user.getIdToken();
    const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),12000);
    try{
      const res=await fetch(this.api+'/api',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({action,payload}),signal:abort.signal});
      const r=await res.json();if(!res.ok||!r.ok)throw Error(r.error||'서버 통신 오류');return r.data;
    }catch(e){
      if(e.name==='AbortError')throw Error('서버 연결 시간이 초과되었습니다. 다시 시도해 주세요.');
      throw e;
    }finally{clearTimeout(timer);}
  }
  // Anonymous public discovery keeps room browsing independent of sign-in.
  async publicRooms(mode){
    if(!['pvp','coop'].includes(mode))throw Error('잘못된 방 목록 유형입니다.');
    if(!/^https:\/\//.test(this.api))throw Error('온라인 서버 주소가 설정되지 않았습니다.');
    const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),8000);
    try{
      const res=await fetch(this.api+'/rooms?mode='+mode,{method:'GET',cache:'no-store',signal:abort.signal});
      const result=await res.json();
      if(!res.ok||!result.ok)throw Error(result.error||'공개 방 목록 요청 실패');
      if(!Array.isArray(result.data))throw Error('방 목록 응답이 올바르지 않습니다.');
      return result.data;
    }catch(e){
      if(e.name==='AbortError')throw Error('서버 응답 시간이 초과되었습니다. 다시 시도해 주세요.');
      throw e;
    }finally{clearTimeout(timer);}
  }
  async call(action,payload={}){
    if(['command','pulse'].includes(action)&&this.room===payload.code&&this.socket?.readyState===WebSocket.OPEN){
      if(action==='pulse'){this.socket.send(JSON.stringify({type:'pulse'}));return {updated:true};}
      const id=++this.nextId;
      return new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>{this.pending.delete(id);reject(Error('명령 확인 시간 초과'));},6000);
        this.pending.set(id,{resolve,reject,timer});
        this.socket.send(JSON.stringify({type:'command',command:payload.command,id}));
      });
    }
    if(action==='pulse')return {updated:false}; // never poll GAS/HTTP on a broken socket
    return this.apiCall(action,payload);
  }
  async watch(code,callback,onError){
    this.stop();this.room=code;this.closed=false;this.cb=callback;this.err=onError;this.matchStatus='lobby';this.hostId=null;this.lastRoomPush=0;
    const serial=++this.serial;
    await this.connect(serial);
    // Heartbeats are independent of requestAnimationFrame. Background tabs
    // and expensive canvas frames must not stall authoritative match time.
    this.heartbeat=setInterval(()=>{
      if(this.closed||serial!==this.serial||this.socket?.readyState!==WebSocket.OPEN||this.matchStatus!=='playing')return;
      const host=this.hostId===this.user?.uid;
      if(!host&&Date.now()-this.lastRoomPush<4500)return;
      try{this.socket.send(JSON.stringify({type:'pulse'}));}catch(e){this.err?.(e);}
    },900);
  }
  async connect(serial){
    if(this.closed||serial!==this.serial||!this.user)return;
    try{
      const {ticket,code}=await this.apiCall('ticket',{code:this.room});
      if(this.closed||serial!==this.serial)return;
      const address=this.api.replace(/^http/,'ws')+'/socket?code='+encodeURIComponent(code)+'&ticket='+encodeURIComponent(ticket);
      const sock=new WebSocket(address);this.socket=sock;
      sock.onopen=()=>{this.retries=0;};
      sock.onmessage=e=>{
        try{
          const msg=JSON.parse(e.data);
          if(msg.type==='room'){this.hostId=msg.room?.host;this.matchStatus=msg.room?.status||'lobby';this.lastRoomPush=Date.now();this.cb(msg.room);}
          else if(msg.type==='ack'){
            const p=this.pending.get(msg.id);if(!p)return;
            clearTimeout(p.timer);this.pending.delete(msg.id);
            msg.error?p.reject(Error(msg.error)):p.resolve(msg.data);
          }else if(msg.type==='error')this.err?.(Error(msg.message));
        }catch(err){this.err?.(err);}
      };
      sock.onclose=()=>{
        if(this.socket===sock)this.socket=null;
        for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(Error('WebSocket 연결이 끊겼습니다.'));}this.pending.clear();
        if(!this.closed&&serial===this.serial){
          const delay=Math.min(12000,800*2**Math.min(4,++this.retries));
          setTimeout(()=>this.connect(serial).catch(e=>this.err?.(e)),delay);
        }
      };
      sock.onerror=()=>this.err?.(Error('실시간 서버 연결을 확인하세요.'));
    }catch(e){
      this.err?.(e);
      if(!this.closed&&serial===this.serial){const delay=Math.min(12000,800*2**Math.min(4,++this.retries));setTimeout(()=>this.connect(serial).catch(err=>this.err?.(err)),delay);}
    }
  }
  stop(){
    this.closed=true;this.serial++;if(this.heartbeat!==null){clearInterval(this.heartbeat);this.heartbeat=null;}
    this.socket?.close(1000,'Leaving');this.socket=null;this.room=null;
    for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(Error('방 연결 종료'));}this.pending.clear();
  }
}
