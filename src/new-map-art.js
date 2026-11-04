// Four vector environments. All details are baked once into the existing
// terrain canvas; maps never add animation ticks, image fetches or asset files.
export const NEW_MAP_IDS=Object.freeze(['sakura','moonlake','skyisles','stardune']);
const pi=Math.PI*2;
const rnd=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const oval=(g,x,y,rx,ry,color)=>{g.beginPath();g.ellipse(x,y,rx,ry,0,0,pi);g.fillStyle=color;g.fill();};
const ring=(g,x,y,rx,ry,color,w=3)=>{g.beginPath();g.ellipse(x,y,rx,ry,0,0,pi);g.lineWidth=w;g.strokeStyle=color;g.stroke();};
const poly=(g,points,color,outline='',width=2)=>{
 g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();
 g.fillStyle=color;g.fill();if(outline){g.strokeStyle=outline;g.lineWidth=width;g.stroke();}
};
const line=(g,points,color,width=2)=>{
 g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));
 g.strokeStyle=color;g.lineWidth=width;g.stroke();
};
function sparkle(g,x,y,r,c,n=4){
 const p=[];for(let j=0;j<n*2;j++){const a=j*Math.PI/n,radius=j%2?r*.25:r;
  p.push([x+Math.cos(a)*radius,y+Math.sin(a)*radius]);}
 poly(g,p,c);
}
function tree(g,x,y,theme,scale=1){
 const sakura=theme==='sakura',moon=theme==='moonlake',sky=theme==='skyisles';
 const trunk=sakura?'#865f6d':moon?'#375b79':sky?'#857c7a':'#54798b';
 g.save();g.translate(x,y);g.scale(scale,scale);
 oval(g,8,17,51,12,'#182e4d44');
 poly(g,[[-10,15],[-9,-62],[6,-101],[13,-62],[13,15]],trunk,'#243c5b',3);
 for(let i=0;i<9;i++){
  const a=i*pi/9,x=Math.cos(a)*(35+i%3*9),y=-125+Math.sin(a)*32;
  oval(g,x,y,sakura?29:moon?23:35,sakura?26:moon?30:23,
   sakura?(i%3?'#f39fc5':'#ffe0e8'):moon?(i%2?'#68babf':'#9ad6c8'):(i%2?'#a7ead2':'#d9fff1'));
  if(i%2===0)oval(g,x-8,y-8,12,10,sakura?'#ffe7ef':moon?'#c2fff1':'#f8fff1');
 }
 if(moon)for(let i=0;i<6;i++)
  line(g,[[Math.cos(i)*28,-123],[Math.cos(i)*40,-60]],'#9bdad0',2);
 g.restore();
}
function pagoda(g,x,y,theme,s=1){
 const roof=theme==='sakura'?'#e897b5':theme==='moonlake'?'#709ec5':'#d6f3ce';
 const stone=theme==='sakura'?'#ae7283':theme==='moonlake'?'#4f6f98':'#81b9b2';
 g.save();g.translate(x,y);g.scale(s,s);oval(g,7,23,88,27,'#173a5b66');
 poly(g,[[-67,11],[68,11],[74,28],[-75,28]],stone,'#e4d4bd',4);
 for(const sx of [-47,-13,25,52]){
  g.fillStyle=stone;g.fillRect(sx-6,-73,12,87);
  g.lineWidth=2;g.strokeStyle='#ffeec7';g.strokeRect(sx-6,-73,12,87);
 }
 poly(g,[[-87,-64],[0,-122],[90,-64],[76,-57],[-79,-57]],roof,'#fff5d2',5);
 poly(g,[[-44,-88],[0,-127],[51,-88]],'#fff2d2',roof,3);
 sparkle(g,0,-132,9,'#fff7c6',6);
 g.restore();
}
function telescope(g,x,y,s=1){
 g.save();g.translate(x,y);g.scale(s,s);oval(g,7,20,87,26,'#352c5877');
 poly(g,[[-73,15],[-64,-32],[62,-32],[75,15]],'#695d83','#f8d4a5',4);
 ring(g,0,-41,56,24,'#ffd9a7',8);ring(g,0,-41,42,18,'#9ad7ed',3);
 g.save();g.translate(0,-65);g.rotate(-.35);
 ring(g,0,0,51,16,'#ffe4bc',7);ring(g,0,0,22,22,'#b2e7f0',5);
 sparkle(g,0,0,13,'#ffe9b0',7);g.restore();g.restore();
}
function flower(g,x,y,s=1){
 oval(g,x,y+7,21*s,10*s,'#336a7877');
 for(let i=0;i<6;i++){
  const a=i*pi/6;
  oval(g,x+Math.cos(a)*8*s,y+Math.sin(a)*5*s,8*s,5*s,i%2?'#ffe0f2':'#fff2fc');
 }
 oval(g,x,y,4*s,4*s,'#ffe899');
}
export function drawNewMapBackdrop(g,map){
 const id=map.id;if(!NEW_MAP_IDS.includes(id))return false;
 g.save();
 if(id==='sakura'){
  for(const [x,y,rx,ry] of [[1040,875,440,210],[1450,130,415,190]]){
   oval(g,x,y,rx+30,ry+25,'#468987');oval(g,x,y,rx,ry,'#6dc3bf');
   oval(g,x+17,y-8,rx*.86,ry*.81,'#8de5d7');
  }
  g.beginPath();g.moveTo(1150,885);g.bezierCurveTo(1600,665,1140,385,1390,140);
  g.lineCap='round';g.strokeStyle='#4b9798';g.lineWidth=145;g.stroke();
  g.strokeStyle='#82d9ca';g.lineWidth=121;g.stroke();
  g.strokeStyle='#cbffed';g.lineWidth=4;g.setLineDash([32,27]);g.stroke();g.setLineDash([]);
  for(let i=0;i<50;i++){
   const x=680+rnd(i*9+10)*1030,y=20+rnd(i*13+34)*1020;
   if(y>740||x>1180&&y<270)oval(g,x,y,6+i%3,2,'#e9fff4bb');
  }
  for(const [x,y] of [[850,826],[1060,941],[1360,153],[1530,210]])flower(g,x,y,1.1);
 }else if(id==='moonlake'){
  for(const [x,y,rx,ry] of [[545,820,555,315],[1190,910,470,260]]){
   oval(g,x,y,rx+15,ry+20,'#142e59');oval(g,x,y,rx,ry,'#306586');
   oval(g,x+20,y-9,rx*.87,ry*.84,'#4085a0');
   for(let i=1;i<=6;i++)ring(g,x,y,rx*i/8,ry*i/9,'#b5f3ff31',2);
  }
  for(let i=0;i<120;i++){
   const x=rnd(i*23+7)*1800,y=rnd(i*29+19)*1100;
   oval(g,x,y,1.7+i%3,1.3,'#c0faff54');
  }
  for(const [x,y] of [[270,755],[550,970],[900,840],[1130,875],[1390,966]])flower(g,x,y,1.1);
 }else if(id==='skyisles'){
  for(const [x,y,rx,ry] of [[440,930,500,250],[1510,965,510,220]]){
   oval(g,x,y,rx,ry,'#4e8fa8');oval(g,x-26,y-19,rx*.88,ry*.78,'#83c8ce');
  }
  for(let i=0;i<19;i++){
   const x=rnd(i*23+6)*1800,y=rnd(i*41+11)*1100,s=.6+(i%5)*.26;
   oval(g,x,y,88*s,19*s,'#e2ffff8a');oval(g,x-17*s,y-13*s,51*s,27*s,'#f3fffcaa');
  }
  for(const [x,y,w] of [[320,360,105],[1170,730,130],[1585,112,80]]){
   poly(g,[[x-w,y],[x+w,y],[x+w*.62,y+110],[x,y+165],[x-w*.5,y+90]],'#568a98','#a4d4cd',5);
   oval(g,x,y,w,37,'#b9e3c4');
   for(let j=0;j<3;j++)
    line(g,[[x+w*.2+j*14,y+10],[x+w*.37+j*14,y+75],[x+w*.1+j*18,y+170],[x+w*.3+j*18,y+280]],
     j%2?'#c9fbff':'#e5fff2',13-j*2);
  }
 }else if(id==='stardune'){
  for(let i=0;i<7;i++){
   const y=80+i*167;
   g.beginPath();g.moveTo(-160,y+115);
   g.bezierCurveTo(420,y-183,600,y+135,1070,y-70);
   g.bezierCurveTo(1400,y-184,1630,y+145,1970,y-68);
   g.lineTo(2000,y+170);g.lineTo(-160,y+170);g.closePath();
   g.fillStyle=i%2?'#dfb48a38':'#dfc1b42a';g.fill();
  }
  for(const [x,y,rx,ry] of [[350,205,260,138],[1670,865,310,160]]){
   oval(g,x,y,rx,ry,'#84738d');oval(g,x,y,rx*.8,ry*.69,'#ba9eac');
   for(let j=0;j<7;j++)ring(g,x,y,rx*.13+j*22,ry*.11+j*12,'#ffebd345',2);
  }
  for(let i=0;i<138;i++){
   const x=rnd(i*19+3)*1800,y=rnd(i*17+9)*1100;
   oval(g,x,y,i%12===0?3:1.3,1,'#ffefd17d');
  }
 }
 g.restore();return true;
}
export function drawNewMapDecor(g,map,distance){
 const id=map.id;if(!NEW_MAP_IDS.includes(id))return false;
 g.save();
 const open=(x,y,r=120)=>distance(map.path,x,y)>r;
 for(let i=0;i<85;i++){
  const x=40+rnd(i*19+39)*1720,y=40+rnd(i*37+53)*1010;
  if(!open(x,y,116))continue;
  if(id==='sakura'){
   if(i%4===0)tree(g,x,y,id,.5+rnd(i+2)*.35);
   else if(i%4===1){for(let k=0;k<6;k++)oval(g,x+rnd(k+i)*30,y+rnd(k+3+i)*28,4+k%3,2,k%2?'#fff0f4':'#ffb4d3');}
   else if(i%4===2)flower(g,x,y,.5);
   else sparkle(g,x,y,4,'#fff6d0',5);
  }else if(id==='moonlake'){
   if(i%3===0)tree(g,x,y,id,.55+rnd(i+8)*.3);
   else if(i%3===1){ring(g,x,y-15,16,16,'#b0f8fc',3);oval(g,x,y-15,5,5,'#eaffff');}
   else sparkle(g,x,y,4,'#ddffed',5);
  }else if(id==='skyisles'){
   if(i%3===0)tree(g,x,y,id,.52+rnd(i+8)*.37);
   else if(i%3===1){
    poly(g,[[x-15,y+8],[x-9,y-23],[x,y-42],[x+12,y-21],[x+17,y+8]],'#a5fff0','#f0fff9',2);
    poly(g,[[x,y-42],[x+12,y-21],[x+17,y+8],[x,y+3]],'#5acbd1');
   }else sparkle(g,x,y,5,'#fff8c7',6);
  }else{
   if(i%4===0){
    oval(g,x,y+13,37,9,'#372b516b');
    poly(g,[[x-10,y+12],[x-8,y-55],[x+4,y-66],[x+13,y+12]],'#5a7f91','#c9d6b2',3);
    line(g,[[x-8,y-30],[x-24,y-33],[x-26,y-53]],'#9ac2be',8);
    line(g,[[x+12,y-26],[x+25,y-29],[x+26,y-49]],'#9ac2be',8);
   }else if(i%4===1){
    poly(g,[[x-18,y+4],[x-8,y-35],[x+10,y-50],[x+26,y+5]],'#b4a6c1','#f6dbaa',3);
    poly(g,[[x+10,y-50],[x+26,y+5],[x-1,y-8]],'#e9c8b2');
   }else if(i%4===2)sparkle(g,x,y,5,'#ffe6b8',5);
   else line(g,[[x-25,y],[x,y-7],[x+24,y]],'#fbe6c169',2);
  }
 }
 const landmarks=id==='sakura'?[[470,880,1.1],[1520,445,.85],[1010,113,.75]]:
  id==='moonlake'?[[1030,106,1.15],[260,520,.8],[1600,555,.82]]:
  id==='skyisles'?[[755,104,.95],[1100,930,1.12],[190,740,.85]]:
  [[586,157,1.1],[1150,930,1.05],[1580,155,.84]];
 for(const [x,y,s] of landmarks)if(open(x,y,145)){
  if(id==='stardune')telescope(g,x,y,s);else pagoda(g,x,y,id,s);
 }
 // Make the biome legible even on a densely built map.
 if(id==='sakura')for(let j=0;j<22;j++){
  const x=80+rnd(j*43+3)*1600,y=70+rnd(j*17+9)*960;
  if(open(x,y,90))oval(g,x,y,5,3,'#ffe2eb');
 }
 if(id==='moonlake')for(let j=0;j<22;j++){
  const x=65+rnd(j*35+11)*1660,y=55+rnd(j*13+29)*985;
  if(open(x,y,90))sparkle(g,x,y,5,'#c3eaff',4);
 }
 g.restore();return true;
}
export function newMapLandscape(map){
 if(!NEW_MAP_IDS.includes(map.id))return null;
 const id=map.id;
 const route=map.path.map(([x,y],i)=>(i?'L':'M')+(x/1800*800).toFixed(1)+' '+(205+y/1100*245).toFixed(1)).join(' ');
 const colors={
  sakura:['#ffc9dc','#fceec8','#99cbbb','#4e918e','#f7e2c4','#ffb1d0'],
  moonlake:['#101e4e','#5a70b2','#305b83','#172e54','#bfd6ed','#b8f7ff'],
  skyisles:['#70c9f4','#d6fff5','#9bddcf','#4892aa','#f4e7bc','#fff2a2'],
  stardune:['#40335e','#c59ca4','#ba9fa2','#67537c','#f3d098','#fff2c8']
 };
 const c=colors[id],sky=c[0],light=c[1],ground=c[2],dark=c[3],road=c[4],shine=c[5];
 const special={
  sakura:'<circle cx="643" cy="87" r="67" fill="#fff8d2"/><path d="M0 227L95 117 188 203 299 90 418 234 550 134 684 223 739 156 800 223V480H0Z" fill="#c699ac" opacity=".6"/><ellipse cx="553" cy="392" rx="260" ry="91" fill="#69c7bd"/><ellipse cx="551" cy="387" rx="207" ry="65" fill="#a7eee0"/>',
  moonlake:'<circle cx="625" cy="97" r="58" fill="#fdf2d1"/><circle cx="646" cy="79" r="52" fill="#596dab"/><path d="M0 259L111 127 224 217 326 142 433 236 555 135 666 207 760 155 800 202V480H0Z" fill="#182952"/><ellipse cx="405" cy="389" rx="360" ry="96" fill="#2a6684"/><ellipse cx="610" cy="402" rx="174" ry="15" fill="#c8f7f9a1"/>',
  skyisles:'<circle cx="634" cy="105" r="74" fill="#fff7be"/><path d="M0 252Q120 171 265 245Q390 168 527 248Q683 172 800 231V480H0Z" fill="#d7fff5"/><ellipse cx="569" cy="330" rx="167" ry="30" fill="#a0e8c3"/><path d="M403 330H725L625 404 486 401Z" fill="#538aa2"/><path d="M580 333q-32 75 3 160m38-155q-13 72-5 133" fill="none" stroke="#ddffff" stroke-width="15"/>',
  stardune:'<circle cx="633" cy="92" r="72" fill="#ffe5b1"/><path d="M0 246L115 195 242 242 385 186 506 243 635 193 800 228V480H0Z" fill="#5b4a72"/><path d="M0 299Q168 212 288 306Q452 220 613 287Q700 239 800 270V480H0Z" fill="#a38da6"/><path d="M0 369Q150 262 307 351Q464 271 618 346Q714 278 800 323V480H0Z" fill="#e0b3a3"/>'
 }[id];
 const decor=id==='sakura'?Array.from({length:13},(_,i)=>{
  const x=30+i*63,y=300+i%3*38;
  return '<g transform="translate('+x+' '+y+')"><path d="M0 8v-48" stroke="#8b596d" stroke-width="8"/><circle cx="0" cy="-65" r="27" fill="#f39ebe"/><circle cx="-17" cy="-57" r="19" fill="#ffe1ed"/><circle cx="17" cy="-57" r="22" fill="#ffc3df"/></g>';
 }).join(''):
 id==='moonlake'?Array.from({length:35},(_,i)=>{
  const x=(i*109+17)%800,y=(i*53+11)%253;
  return '<circle cx="'+x+'" cy="'+y+'" r="'+(i%6===0?3:1.4)+'" fill="#d5f8ff"/>';
 }).join('')+'<path d="M70 383q35-68 82 0m423 0q35-68 79 0" stroke="#b9fbee" stroke-width="4" fill="none"/>':
 id==='skyisles'?Array.from({length:13},(_,i)=>{
  const x=(i*109+27)%810,y=169+(i*37)%174;
  return '<g transform="translate('+x+' '+y+')"><ellipse rx="49" ry="12" fill="#e8fffcab"/><ellipse cx="11" cy="-13" rx="37" ry="21" fill="#edfffa"/></g>';
 }).join(''):
 Array.from({length:24},(_,i)=>{
  const x=(i*101+23)%790,y=(i*79+15)%254;
  return '<path d="M'+x+' '+(y-5)+'l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#fff1dc"/>';
 }).join('')+'<g transform="translate(616 306)"><path d="M-31 44V-24H31V44M-49-25Q0-77 49-25" fill="#8d7590" stroke="#ffe1b8" stroke-width="6"/><ellipse cy="-23" rx="38" ry="19" fill="none" stroke="#ffe6bc" stroke-width="8"/></g>';
 const xml='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" aria-hidden="true" data-biome-art="'+id+'">'
  +'<defs><linearGradient id="sky-'+id+'" x2="0" y2="1"><stop stop-color="'+sky+'"/><stop offset="1" stop-color="'+light+'"/></linearGradient><linearGradient id="earth-'+id+'" x2="0" y2="1"><stop stop-color="'+ground+'"/><stop offset="1" stop-color="'+dark+'"/></linearGradient></defs>'
  +'<path d="M0 0H800V480H0Z" fill="url(#sky-'+id+')"/>'
  +special+'<path d="M0 309Q172 245 391 323Q598 239 800 294V480H0Z" fill="url(#earth-'+id+')" opacity=".64"/>'
  +decor+'<path d="'+route+'" transform="translate(0 7)" fill="none" stroke="'+dark+'" stroke-width="29" stroke-linecap="round" stroke-linejoin="round"/>'
  +'<path d="'+route+'" fill="none" stroke="'+road+'" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>'
  +'<path d="'+route+'" fill="none" stroke="'+shine+'" stroke-width="2" stroke-dasharray="8 9" opacity=".8"/>'
  +'</svg>';
 return xml;
}
