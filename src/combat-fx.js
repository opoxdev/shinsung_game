// Battle VFX v2. Entirely visual and deterministic: no simulation state,
// random particles, network images or per-frame particle allocations.
// All 32 tower species have deliberately differentiated palettes and shapes.
const COLORS={
 scout:['#ffca75','#fff4bc','bolt'],soldier:['#65f8ec','#f1ffff','lightning'],
 blade:['#ff6eaa','#ffe5f1','slash'],cannon:['#ff824e','#ffe19c','blast'],
 summoner:['#a9ff82','#efffc7','portal'],workshop:['#a0ffaa','#eaffd8','flora'],
 rail:['#95c7ff','#ffffff','meteor'],oldgod:['#ffc960','#fff7cc','divine'],
 voidwalker:['#b96aff','#f1c6ff','void'],sonic:['#f477d9','#ffe6fa','sound'],
 archer:['#a7f5ab','#f0ffe8','arrow'],chef:['#ffae83','#fff4b2','blast'],
 chemist:['#a1ff75','#f0ffd4','poison'],icewitch:['#8ceaff','#eaffff','frost'],
 spirit:['#92f4ff','#ffffff','portal'],firefly:['#ff7449','#fff2a1','flame'],
 knight:['#adb1ff','#f5f3ff','slash'],drone:['#57fff0','#eefffc','lightning'],
 clockmaker:['#ffd88d','#fff6d4','clock'],banker:['#ffdd6c','#fffbcc','coin'],
 mermaid:['#70ffdf','#e0fffa','tide'],prism:['#b3a2ff','#ffffff','prism'],
 reaper:['#cf87ff','#fff1ff','scythe'],storm:['#79b7ff','#f4f9ff','storm'],
 phoenix:['#ff667c','#ffe599','phoenix'],aurora:['#58ffe1','#f4fffd','aurora'],
 starseed:['#ffafd7','#fff0fc','star'],hunter:['#a0b7ff','#ffffff','sniper'],
 scrap:['#ffac74','#fff0cb','blast'],lullaby:['#adb9ff','#f0f4ff','sound'],
 papercrane:['#ffe0ad','#ffffff','origami'],marker:['#c995ff','#fff9ff','target']
};
const PROFILES=Object.freeze(Object.fromEntries(Object.entries(COLORS).map(([id,[primary,core,shape]])=>
 [id,Object.freeze({primary,core,shape})])));
export const towerEffectProfile=type=>PROFILES[type]||Object.freeze({primary:'#aee4ff',core:'#fff',shape:'bolt'});
export const EFFECT_TYPES=Object.freeze(Object.keys(PROFILES));
export const isTowerAttackEffect=e=>!!e&&(
 ['ranged','melee','splash','chain','summon','mark','judgement','divine','arc','income','buff','charged'].includes(e.kind)
 &&!!PROFILES[e.type]);
const TAU=Math.PI*2;
const clamp=n=>Math.max(0,Math.min(1,n));
function line(g,x,y,X,Y,color,width=2){
 g.strokeStyle=color;g.lineWidth=width;g.beginPath();g.moveTo(x,y);g.lineTo(X,Y);g.stroke();
}
function circle(g,x,y,r,color,fill=false,width=2){
 if(r<=0)return;g.beginPath();g.arc(x,y,r,0,TAU);
 if(fill){g.fillStyle=color;g.fill();}else{g.strokeStyle=color;g.lineWidth=width;g.stroke();}
}
function ellipse(g,x,y,rx,ry,color,width=2){
 g.beginPath();g.ellipse(x,y,rx,ry,0,0,TAU);
 g.strokeStyle=color;g.lineWidth=width;g.stroke();
}
function star(g,x,y,r,n,color,width=2,rotation=0){
 g.strokeStyle=color;g.lineWidth=width;g.beginPath();
 for(let i=0;i<n;i++){const a=TAU*i/n+rotation;
  g.moveTo(x+Math.cos(a)*r*.28,y+Math.sin(a)*r*.28);
  g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);
 }g.stroke();
}
function diamond(g,x,y,r,color,fill=true){
 g.beginPath();g.moveTo(x,y-r);g.lineTo(x+r*.7,y);g.lineTo(x,y+r);
 g.lineTo(x-r*.7,y);g.closePath();
 if(fill){g.fillStyle=color;g.fill();}else{g.strokeStyle=color;g.lineWidth=2;g.stroke();}
}
function arcSweep(g,x,y,r,start,end,color,width=3){
 g.strokeStyle=color;g.lineWidth=width;g.beginPath();g.arc(x,y,r,start,end);g.stroke();
}
function burst(g,x,y,r,p,c,seed=0,count=7){
 for(let i=0;i<count;i++){
  const a=TAU*i/count+seed*1.73,dr=r*(.55+.22*(i%3));
  const xx=x+Math.cos(a)*dr,yy=y+Math.sin(a)*dr;
  line(g,xx,yy,xx+Math.cos(a)*(8+16*(1-p)),yy+Math.sin(a)*(8+16*(1-p)),
   i%3===0?'#fff':c,1.3+1.9*(1-p));
 }
}
function shock(g,x,y,age,color,core,radius=78,quality=1){
 const p=clamp(age/.44),fade=1-p;
 if(fade<=0)return;
 circle(g,x,y,8+p*radius,color,false,2+5*fade);
 if(quality>0)circle(g,x,y,4+p*(radius+13),core,false,1.6*fade);
 if(p<.65){circle(g,x,y,18*(1-p)+5,core,true);}
 if(quality>0)burst(g,x,y,16+p*radius,p,color,Math.round(x+y),quality>1?10:6);
}
function projectile(g,e,age,profile,quality){
 const x=e.x,y=e.y-22,tx=e.tx??x,ty=e.ty??y;
 const dx=tx-x,dy=ty-y,dist=Math.hypot(dx,dy)||1;
 const p=clamp(age/(profile.shape==='sniper'?.1:.19));
 const px=x+dx*p,py=y+dy*p;
 const nx=dx/dist,ny=dy/dist;
 const tail=Math.min(68,dist*.26)*(.55+.45*p);
 if(profile.shape==='meteor'){
  line(g,tx-34,ty-175,tx,ty,profile.primary,13*(1-p)+3);
  line(g,tx-34,ty-175,tx,ty,profile.core,3);
  shock(g,tx,ty,age,profile.primary,profile.core,98,quality);return;
 }
 if(profile.shape==='sniper'){
  line(g,x,y,tx,ty,profile.primary,6*(1-p)+1);
  line(g,x,y,tx,ty,profile.core,1.8);
  circle(g,tx,ty,10+age*75,profile.primary,false,3*(1-p));
  if(quality)star(g,tx,ty,28*(1-p),4,profile.core,2);return;
 }
 if(profile.shape==='arrow'||profile.shape==='origami'){
  line(g,px-nx*tail,py-ny*tail,px,py,profile.primary,4);
  line(g,px-nx*tail*.7,py-ny*tail*.7,px,py,profile.core,1.6);
  if(profile.shape==='origami'){
   diamond(g,px,py,8,profile.core,false);
   line(g,px-ny*10,py+nx*10,px,py,profile.primary,2);
  }else{
   line(g,px-nx*11-ny*5,py-ny*11+nx*5,px,py,profile.core,2);
   line(g,px-nx*11+ny*5,py-ny*11-nx*5,px,py,profile.core,2);
  }
 }else{
  // Element-specific projectiles stay distinct even without a dedicated asset.
  if(profile.shape==='lightning'){
   line(g,px-nx*tail,py-ny*tail,px-nx*tail*.5-ny*9,py-ny*tail*.5+nx*9,profile.primary,4+quality);
   line(g,px-nx*tail*.5-ny*9,py-ny*tail*.5+nx*9,px,py,profile.core,2.5);
   star(g,px,py,9,4,profile.core,2,age*6);
  }else if(profile.shape==='poison'){
   line(g,px-nx*tail*.6,py-ny*tail*.6,px,py,'#668e4b',3);
   circle(g,px,py,7,profile.primary,true);
   circle(g,px-2,py-2,3,profile.core,true);
   if(quality>0)for(let i=0;i<3;i++)circle(g,px-nx*(10+i*9)+ny*(i-1)*5,py-ny*(10+i*9)-nx*(i-1)*5,2.2+i*.6,profile.primary,true);
  }else if(profile.shape==='frost'){
   line(g,px-nx*tail,py-ny*tail,px,py,profile.primary,5);
   diamond(g,px,py,9,profile.core,false);
   star(g,px,py,11,6,profile.primary,1.8,age*3);
  }else{
   line(g,px-nx*tail,py-ny*tail,px,py,profile.primary,5+quality);
   line(g,px-nx*tail*.65,py-ny*tail*.65,px,py,profile.core,2);
   circle(g,px,py,5,profile.primary,true);
   circle(g,px,py,2.4,profile.core,true);
  }
 }
 if(p>=.65){g.globalAlpha*=clamp((p-.6)*2.5);circle(g,tx,ty,5+age*35,profile.primary,false,2);}
}
function beam(g,e,age,profile,quality){
 const x=e.x,y=e.y-20,tx=e.tx??x,ty=e.ty??y;
 const p=clamp(age/.4),fade=1-p,dx=tx-x,dy=ty-y;
 if(profile.shape==='aurora'){
  for(let s=-1;s<=1;s+=2){
   g.strokeStyle=s===-1?'#70f9ff':'#a2ffd7';g.lineWidth=(6+quality*2)*fade+1;
   g.beginPath();g.moveTo(x,y);
   for(let j=1;j<=12;j++){const q=j/12,offset=Math.sin(q*12-age*24+s)*18*(1-q);
    g.lineTo(x+dx*q-dy/Math.max(1,Math.hypot(dx,dy))*offset,
             y+dy*q+dx/Math.max(1,Math.hypot(dx,dy))*offset);
   }g.stroke();
  }
 }else{
  g.strokeStyle=profile.primary;g.lineWidth=(5+quality)*fade+1;g.beginPath();g.moveTo(x,y);
  const n=7;
  for(let i=1;i<n;i++){
   const q=i/n,wiggle=(i%2?1:-1)*12*(1-p*.6);
   g.lineTo(x+dx*q-dy/(Math.hypot(dx,dy)||1)*wiggle,
    y+dy*q+dx/(Math.hypot(dx,dy)||1)*wiggle);
  }
  g.lineTo(tx,ty);g.stroke();
  if(profile.shape==='prism'){
   for(let k=0;k<3;k++)diamond(g,x+dx*(k+1)/4,y+dy*(k+1)/4,9+2*k,profile.core,false);
  }else if(profile.shape==='lightning'||profile.shape==='storm'){
   g.strokeStyle=profile.core;g.lineWidth=1.6;g.beginPath();g.moveTo(x,y);
   for(let i=1;i<n;i++){let q=i/n;g.lineTo(x+dx*q+(i%2?-4:4),y+dy*q);}
   g.lineTo(tx,ty);g.stroke();
  }
 }
 circle(g,tx,ty,9+p*37,profile.primary,false,2+2*fade);
 if(quality>0)star(g,tx,ty,10+24*fade,5,profile.core,1.8,p*3);
}
function slash(g,e,age,profile,quality){
 const x=e.x,y=e.y-18,dx=(e.tx??x)-e.x,dy=(e.ty??y)-e.y+18;
 const direction=Math.atan2(dy,dx),dist=Math.hypot(dx,dy)||42;
 const radius=Math.min(144,Math.max(48,dist*.9));
 const p=clamp(age/.37);
 g.save();g.translate(x,y);g.rotate(direction);
 const spread=profile.shape==='scythe'?1.2:.9;
 g.strokeStyle=profile.primary;g.lineWidth=(profile.shape==='scythe'?12:8)*(1-p)+2;
 g.beginPath();g.arc(0,0,radius, -spread/2+p*.28, spread/2+p*.28);g.stroke();
 g.strokeStyle=profile.core;g.lineWidth=2.6*(1-p)+1;
 g.beginPath();g.arc(0,0,radius+5,-spread/2+p*.28,spread/2+p*.28);g.stroke();
 if(quality>0){
  for(let j=0;j<3;j++){const a=-spread/2+(j+1)*spread/4+p*.28;
   diamond(g,Math.cos(a)*(radius+16),Math.sin(a)*(radius+16),3+6*(1-p),profile.core);
  }
 }
 if(profile.shape==='scythe'){
  line(g,15,-radius*.5,radius*.68,0,profile.primary,4*(1-p)+1);
 }
 g.restore();
 shock(g,e.tx??x,e.ty??y,age,profile.primary,profile.core,29,0);
}
function explosion(g,e,age,profile,quality){
 const x=e.tx??e.x,y=e.ty??e.y,shape=profile.shape;
 const p=clamp(age/.44),q=1-p;
 const radius=shape==='sound'?92:shape==='void'?135:
  shape==='storm'?112:shape==='star'?62:shape==='flame'?95:86;
 if(shape==='sound'){
  for(let j=0;j<(quality?4:2);j++){
   const r=12+p*(radius+j*19);
   circle(g,x,y,r,j%2?profile.core:profile.primary,false,(4-j*.55)*q+1);
  }
  arcSweep(g,x,y,25+p*radius,-Math.PI*.55,Math.PI*.45,profile.core,3*q+1);
 }else if(shape==='void'){
  g.save();g.translate(x,y);g.rotate(age*3);
  for(let j=0;j<(quality?7:4);j++){
   const a=TAU*j/(quality?7:4);
   arcSweep(g,0,0,16+p*radius,a,a+.65, j%2?profile.core:profile.primary,6*q+1);
  }
  circle(g,0,0,23*q+5,profile.primary,true);
  diamond(g,0,0,28*q+5,profile.core,false);g.restore();
  if(quality>0)burst(g,x,y,34+p*radius,p,'#eacaff',e.id,9);
 }else if(shape==='storm'){
  shock(g,x,y,age,'#8cbeff',profile.core,radius,quality);
  for(let k=0;k<(quality?5:3);k++){
   const a=TAU*k/5+e.id,ox=x+Math.cos(a)*(25+p*radius),oy=y+Math.sin(a)*(25+p*radius);
   line(g,ox-9,oy-16,ox,oy,profile.core,3*q+1);
   line(g,ox,oy,ox+8,oy+9,profile.primary,2*q+1);
  }
 }else{
  shock(g,x,y,age,profile.primary,profile.core,radius,quality);
  if(shape==='star'){
   star(g,x,y,12+p*52,5,profile.core,3*q+1,age*2);
   diamond(g,x,y,12*q+3,profile.primary,false);
  }else if(shape==='frost'){
   star(g,x,y,10+p*76,6,profile.core,2.5*q+1);
  }else if(shape==='flame'){
   for(let j=0;j<5;j++){
    const a=TAU*j/5;
    line(g,x+Math.cos(a)*(15+p*65),y+Math.sin(a)*(15+p*65),
       x+Math.cos(a+.18)*(32+p*85),y+Math.sin(a+.18)*(27+p*75),
       j%2?profile.primary:profile.core,4*q+1);
   }
  }else if(shape==='poison'){
   for(let j=0;j<5;j++)circle(g,x+Math.cos(j*2.4)*(10+p*60),
      y+Math.sin(j*2.4)*(10+p*60),2+q*5,profile.primary,true);
  }
 }
}
function portal(g,e,age,profile,quality){
 const p=clamp(age/.42),q=1-p,cy=e.y-13;
 g.save();g.translate(e.x,cy);
 g.rotate(age*(profile.shape==='phoenix'?6:-5));
 for(let i=0;i<(quality?3:2);i++){
  const radius=12+p*37+i*10;
  g.strokeStyle=i%2?profile.core:profile.primary;
  g.lineWidth=(5-i)*q+1;
  g.beginPath();g.ellipse(0,0,radius,radius*.42,i*.25,Math.PI*.12,Math.PI*1.82);g.stroke();
 }
 for(let j=0;j<(quality?7:4);j++){
  const a=TAU*j/(quality?7:4);
  diamond(g,Math.cos(a)*(22+p*37),Math.sin(a)*(11+p*16),3+2*q,profile.core);
 }
 if(profile.shape==='phoenix'){
  star(g,0,-32*(1-p),26*q,6,'#ffeab5',2.6);
  for(let i=0;i<3;i++){
   const a=TAU*i/3+age*4;
   line(g,Math.cos(a)*13,-20+Math.sin(a)*13,
    Math.cos(a+.25)*35,-37+Math.sin(a+.25)*23,i%2?'#ffe4b0':'#ff7280',3*q+1);
  }
 }else if(profile.shape==='origami'){
  diamond(g,0,-27,18*q+4,profile.core,false);
  line(g,-22,-21,0,-37,profile.core,2);
  line(g,22,-21,0,-37,profile.primary,2);
 }else if(e.type==='spirit'){
  circle(g,0,-26,13+9*p,'#bcfaff',false,2);
  for(let i=0;i<4;i++){
   const a=i*TAU/4+age*5;
   line(g,Math.cos(a)*14,-26+Math.sin(a)*14,Math.cos(a)*22,-26+Math.sin(a)*22,profile.primary,2);
  }
 }else if(e.type==='summoner'){
  for(let i=0;i<4;i++){
   const a=i*TAU/4+age*4;
   line(g,Math.cos(a)*16,-9+Math.sin(a)*9,Math.cos(a+.2)*45,-9+Math.sin(a+.2)*25,profile.primary,3*q+1);
  }
 }
 g.restore();
}
function reticle(g,e,age,profile,quality){
 const x=e.tx??e.x,y=e.ty??e.y,p=clamp(age/.43),r=16+p*19;
 for(let k=0;k<4;k++){
  const a=TAU*k/4+age*.6;
  arcSweep(g,x,y,r,a,a+.43,profile.primary,3*(1-p)+1);
 }
 if(quality>0)star(g,x,y,r+13,4,profile.core,1.5);
 diamond(g,x,y,5+7*(1-p),profile.core,false);
 line(g,e.x,e.y-22,x,y,profile.primary,1.5*(1-p));
}
function divine(g,e,age,profile,quality){
 const p=clamp(age/.44),q=1-p,x=e.tx??e.x,y=e.ty??e.y;
 if(e.kind==='judgement'){
  circle(g,x,y,20+p*67,profile.primary,false,4*q+1);
  star(g,x,y,24+p*43,8,profile.core,2*q+1,p*2);return;
 }
 // Huge but bounded judgment, two sky strikes + halo + radiant spokes.
 line(g,x-33,y-250,x,y,profile.primary,20*q+2);
 line(g,x-33,y-250,x,y,profile.core,6*q+1);
 line(g,x+33,y-200,x+4,y+4,'#ff6486',10*q+1);
 for(let k=0;k<3;k++)circle(g,x,y,17+p*(125+k*28),k%2?'#ff7189':profile.primary,false,(7-k)*q+1);
 star(g,x,y,38+p*110,quality?12:6,profile.core,4*q+1,p*6);
 if(quality>0)burst(g,x,y,32+p*150,p,profile.primary,e.id,10);
}
function coin(g,e,age,profile,quality){
 const p=clamp(age/.44),q=1-p;
 for(let k=0;k<(quality?5:3);k++){
  const a=TAU*k/(quality?5:3)+.35;
  const x=e.x+Math.cos(a)*(7+p*33),y=e.y-28-p*39+Math.sin(a)*12;
  diamond(g,x,y,(5+6*q),profile.primary,true);
  line(g,x-2,y-3,x+2,y+3,profile.core,1.5);
 }
 star(g,e.x,e.y-43,20*q,5,profile.core,2);
}
function charged(g,e,age,profile,quality){
 const x=e.x,y=e.y,p=clamp(age/.44),q=1-p;
 for(let j=0;j<2;j++)circle(g,x,y-20,17+p*(55+j*20),profile.primary,false,4*q+1);
 star(g,x,y-20,22+p*40,8,profile.core,3*q+1,age*4);
}
// quality 0 = reduced effects, 1 = normal, 2 = high rarity spotlight
export function drawTowerAttackEffect(g,e,age,quality=1){
 if(!isTowerAttackEffect(e))return false;
 if(age<0||age>.45)return true;
 const profile=towerEffectProfile(e.type),q=Math.max(0,Math.min(2,quality));
 g.save();
 const fade=clamp(1-age/.46);
 g.globalAlpha*=Math.max(.12,fade);
 // Only elite effects get small shadows; never trigger a giant full-screen blur.
 if(q>=2){g.shadowColor=profile.primary;g.shadowBlur=8;}
 if(e.kind==='divine'||e.kind==='judgement')divine(g,e,age,profile,q);
 else if(e.kind==='charged')charged(g,e,age,profile,q);
 else if(e.kind==='arc'||e.kind==='chain')beam(g,e,age,profile,q);
 else if(e.kind==='melee')slash(g,e,age,profile,q);
 else if(e.kind==='splash')explosion(g,e,age,profile,q);
 else if(e.kind==='ranged')projectile(g,e,age,profile,q);
 else if(e.kind==='summon')portal(g,e,age,profile,q);
 else if(e.kind==='mark')reticle(g,e,age,profile,q);
 else if(e.kind==='income')coin(g,e,age,profile,q);
 else if(e.kind==='buff')portal(g,e,age,profile,q);
 g.restore();return true;
}
// Subtle continuous presence for every tower; mythic runes and specialist aura
// are distinct without overlapping silhouettes or dominating the map.
export function drawTowerPresence(g,t,time,stats,quality=1){
 const profile=towerEffectProfile(t.type);
 const lvl=t.level||0,phase=time*(stats.kind==='income'?.6:1.5)+(t.id||0)*.41;
 const rare=['legendary','mythic'].includes(stats.rarity);
 const strong=stats.rarity==='mythic';
 if(!quality&&!rare)return;
 const pul=Math.sin(phase*2),size=(rare?36:31)+lvl*2.8;
 g.save();g.globalAlpha*=quality?.3+.13*(pul+1):.15;
 g.strokeStyle=profile.primary;g.lineWidth=rare?2.6:1.6;
 if(stats.kind==='buff'||stats.kind==='income'||stats.kind==='summon'){
  ellipse(g,0,3,size+4+pul*2,13+lvl*.7,profile.primary,2.2);
  if(quality)ellipse(g,0,3,size-7,8,profile.core,1);
 }else{
  ellipse(g,0,3,size,14+lvl,profile.primary,rare?2.3:1.3);
 }
 if(quality&&rare){
  const n=strong?7:5,rr=strong?size+6:size+3;
  for(let i=0;i<n;i++){
   const a=TAU*i/n+phase*.44;
   diamond(g,Math.cos(a)*rr,Math.sin(a)*rr*.43+3,strong?3.9:2.8,i%2?profile.primary:profile.core);
  }
 }
 if(quality&&stats.kind==='buff'){
  const count=t.type==='mermaid'?5:4;
  for(let i=0;i<count;i++){
   const a=TAU*i/count+phase*.53;
   const x=Math.cos(a)*23,y=-22+Math.sin(a)*11;
   if(t.type==='clockmaker'){
    line(g,x-3,y-3,x+3,y+3,profile.core,1.6);
    line(g,x-3,y+3,x+3,y-3,profile.primary,1.6);
   }else if(t.type==='mermaid'){
    circle(g,x,y,2.8+i%2*2,profile.core,false,1.3);
   }else if(t.type==='lullaby'){
    arcSweep(g,x,y,3+i%2*2,Math.PI*1.2,Math.PI*1.9,profile.core,1.6);
   }else{
    circle(g,x,y,2.5,profile.core,true);
   }
  }
 }
 if(quality&&stats.kind==='income'){
  for(let i=0;i<3;i++){
   const a=TAU*i/3-phase*.5;
   diamond(g,Math.cos(a)*26,-29+Math.sin(a)*13,3,profile.core);
  }
 }
 if(quality&&t.type==='starseed'){
  star(g,0,-31,12+lvl+2*Math.sin(phase*2),5,profile.core,1.8,phase*.3);
 }
 if(quality&&strong&&(t.type==='aurora'||t.type==='voidwalker'||t.type==='phoenix'||t.type==='sonic')){
  for(let i=0;i<3;i++){
   const a=phase*.72+i*TAU/3;
   diamond(g,Math.cos(a)*(size+7),-32+Math.sin(a)*(18+lvl*2),2.8+lvl*.45,profile.core);
  }
 }
 g.restore();
}
