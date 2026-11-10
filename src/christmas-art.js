// Christmas Expedition's hand-authored Christmas-only 2D assets.
// Terrain is baked once; animated actors use small deterministic vector primitives.
export const CHRISTMAS_ENEMY_IDS=Object.freeze([
 'snow_sprite','candy_imp','snow_golem','ornament_wisp','frost_bell','winter_witch',
 'gift_mimic','toy_soldier','reindeer_guard','gift_guardian','gift_conductor',
 'ginger_warrior','peppermint_wraith','cookie_knight','ginger_general','ginger_king'
]);
const grain=n=>{const x=Math.sin(n*81.13+15.7)*71738.41;return x-Math.floor(x);};
const xm=(g,a,fill,stroke='#3e4e62',w=2)=>{g.beginPath();g.moveTo(...a[0]);for(let i=1;i<a.length;i++)g.lineTo(...a[i]);g.closePath();g.fillStyle=fill;g.fill();if(stroke){g.strokeStyle=stroke;g.lineWidth=w;g.stroke();}};
const ellipse=(g,x,y,rx,ry,fill)=>{g.fillStyle=fill;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill();};
const line=(g,coords,c,w)=>{g.strokeStyle=c;g.lineWidth=w;g.beginPath();g.moveTo(...coords[0]);for(let i=1;i<coords.length;i++)g.lineTo(...coords[i]);g.stroke();};
function fir(g,x,y,s=1){
 g.save();g.translate(x,y);g.scale(s,s);
 ellipse(g,12,17,42,13,'#5a829a44');
 g.fillStyle='#866d67';g.fillRect(-7,-16,14,32);
 for(let i=0;i<4;i++){
  const h=16+i*30,spread=39-i*7;
  xm(g,[[-spread,7-i*23],[0,-h-65],[spread,7-i*23]],i%2?'#4e817f':'#3f706f','#325766',2);
  line(g,[[-spread+6,5-i*23],[0,-h-65],[spread-8,5-i*23]],'#e9f8f7',5);
  ellipse(g,-spread*.44,-12-i*25,13,5,'#dff4f7');
  ellipse(g,spread*.56,-6-i*25,13,5,'#dff4f7');
 }
 ellipse(g,0,-150,4,6,'#f4fbff');
 g.restore();
}
function cottage(g,x,y,s=1,roof='#dcebf1'){
 g.save();g.translate(x,y);g.scale(s,s);
 ellipse(g,9,25,96,20,'#4e6f8166');
 xm(g,[[-75,-8],[57,-17],[72,22],[-76,25]],'#7e6255','#5f554d',3);
 xm(g,[[-76,-63],[-17,-109],[77,-76],[58,-15],[-75,-7]],'#8e7568','#776360',3);
 xm(g,[[-85,-61],[-18,-120],[88,-73],[80,-51],[-18,-99],[-83,-40]],roof,'#f6fffc',5);
 line(g,[[-76,-60],[-18,-107],[77,-70]],'#f7ffff',7);
 for(const dx of [-50,-12,32]){
  g.fillStyle='#5b4446';g.fillRect(dx,-50,20,32);
  g.fillStyle='#ffdc86';g.fillRect(dx+4,-45,12,21);
  line(g,[[dx+10,-45],[dx+10,-23]],'#fff2bc',2);
  ellipse(g,dx+10,-39,7,6,'#ffe9ab66');
 }
 g.fillStyle='#896f64';g.fillRect(-8,-121,24,37);
 ellipse(g,4,-121,12,6,'#f9ffff');
 for(let k=0;k<7;k++){
  const dx=-53+k*17,y=-68-(k%3)*7;
  ellipse(g,dx,y,4,3,k%2?'#ffe5ad':'#ff8b85');
 }
 g.restore();
}
function tunnel(g,x,y,side=1){
 g.save();g.translate(x,y);g.scale(side,1);
 ellipse(g,0,20,142,48,'#6f899488');
 xm(g,[[-105,38],[-119,-77],[-72,-118],[54,-120],[113,-66],[112,37]],'#8fa5ac','#dae8ea',8);
 xm(g,[[-69,32],[-72,-60],[-50,-90],[50,-93],[79,-64],[82,32]],'#263d51','#bed5da',6);
 ellipse(g,1,-13,51,64,'#172b3d');
 ellipse(g,1,-16,35,56,'#0c2337');
 g.strokeStyle='#cfeff1';g.lineWidth=8;g.beginPath();g.arc(1,-11,61,Math.PI,0);g.stroke();
 for(let k=-3;k<=3;k++){g.strokeStyle='#d9e7e9aa';g.lineWidth=2;g.beginPath();g.moveTo(-101+k*25,-96);g.lineTo(-111+k*25,-72);g.stroke();}
 g.restore();
}
function streetLamp(g,x,y,s=1){
 g.save();g.translate(x,y);g.scale(s,s);
 g.strokeStyle='#4b565d';g.lineWidth=5;g.beginPath();g.moveTo(0,12);g.lineTo(0,-60);g.lineTo(13,-66);g.stroke();
 ellipse(g,14,-68,12,9,'#ffe6a3');
 ellipse(g,14,-68,20,16,'#ffe6a344');
 g.fillStyle='#fff7cb';g.fillRect(8,-72,13,6);
 g.restore();
}
export function drawChristmasVillageBack(g){
 g.save();
 // Snow dunes, slate cliffs and a dense pine-line reminiscent of the
 // reference's angled winter mining-village scene.
 g.fillStyle='#b5cbd0';g.fillRect(0,0,1800,1100);
 for(let k=0;k<12;k++){
  const x=k*175-110,y=30+(k%3)*15;
  xm(g,[[x,y+62],[x+50,y-52],[x+160,y-36],[x+205,y+76]],k%2?'#91a6b2':'#a1b5be','#bfcdd1',2);
  xm(g,[[x+15,y+35],[x+50,y-52],[x+90,y+1]],'#e6f2f4','',0);
 }
 for(let k=0;k<28;k++){
  const x=(k*127+31)%1800,y=90+(k*191)%970;
  ellipse(g,x,y,70+(k%4)*22,22+(k%3)*10,k%2?'#e7f2f45b':'#eff9fa57');
 }
 for(let k=0;k<420;k++){
  const x=grain(k*23+1)*1800,y=grain(k*67+2)*1100;
  ellipse(g,x,y,1.1+(k%4)*.5,.9,'#f9ffff5d');
 }
 g.restore();return true;
}
export function drawChristmasVillageDecor(g,map,pathDistance){
 if(map.id!=='christmas_village')return false;
 g.save();
 // Only out-of-road areas get buildings and firs. Decorative meshes never
 // affect collision, tower placement or path navigation.
 const occupied=[[0,230],[1800,150],[280,370],[500,105],[910,300],[1090,100],[1490,560],
  [1380,990],[870,920],[480,810],[1090,520]];
 for(let i=0;i<125;i++){
  const x=45+grain(i*21+13)*1710,y=90+grain(i*35+19)*950;
  if(pathDistance(map.path,x,y)<105||occupied.some(p=>Math.hypot(p[0]-x,p[1]-y)<90))continue;
  if(i%8===0)streetLamp(g,x,y,.65+(i%4)*.09);
  else fir(g,x,y,.56+(i%6)*.085);
 }
 const homes=[[290,395,.75],[515,105,.87],[905,295,.92],[1090,98,.71],[1490,556,1],[1380,997,.89],[864,920,.66],[470,815,.8],[1100,500,.75]];
 for(const [x,y,s] of homes)if(pathDistance(map.path,x,y)>92)cottage(g,x,y,s);
 // Train-rail style tunnel entries, not two flat colored circles.
 tunnel(g,57,224,1);tunnel(g,1743,145,-1);
 for(const [x,y] of [[182,460],[664,486],[922,577],[1310,417],[1631,687],[1070,840]])streetLamp(g,x,y,.9);
 // Little candy-cane posts along clearings.
 for(let i=0;i<14;i++){
  const x=90+grain(i*41+3)*1620,y=90+grain(i*43+5)*930;
  if(pathDistance(map.path,x,y)<60||pathDistance(map.path,x,y)>170)continue;
  line(g,[[x,y+8],[x,y-33],[x+13,y-39],[x+23,y-30]],'#ffffff',7);
  line(g,[[x,y-16],[x,y-22]],'#ed6575',5);
  line(g,[[x+7,y-37],[x+14,y-39]],'#ed6575',5);
 }
 g.restore();return true;
}
export function christmasVillagePreview(){
 const route=[[0,230],[280,230],[420,370],[630,280],[790,425],[570,560],[320,520],[190,690],[330,930],[610,960],[780,735],[1040,650],[1250,850],[1590,770],[1650,510],[1450,340],[1180,260],[1390,130],[1800,150]]
  .map(([x,y],i)=>(i?'L':'M')+(x*800/1800).toFixed(0)+' '+(205+y*265/1100).toFixed(0)).join(' ');
 const trees=Array.from({length:27},(_,i)=>{
  const x=28+(i*163+17)%748,y=188+(i*101)%238,sc=.57+(i%4)*.15;
  return '<g transform="translate('+x+' '+y+') scale('+sc+')"><path d="M0-109l-35 75h15l-29 42H46L21-34h15Z" fill="#4f8482" stroke="#c7eeee" stroke-width="5"/><path d="M0-109L0 8H46L21-34h15Z" fill="#305e72"/><path d="M-19-57L0-109 25-57M-26-21l27-66 30 65" fill="none" stroke="#eefbfa" stroke-width="5"/></g>';
 }).join('');
 const cabins=Array.from({length:8},(_,i)=>{
  const x=60+(i*97)%700,y=242+(i*103)%194,sc=.56+(i%3)*.1;
  return '<g transform="translate('+x+' '+y+') scale('+sc+')"><path d="M-57 3H62v61H-57Z" fill="#806454" stroke="#513e46" stroke-width="5"/><path d="M-69 4L0-54 73 4l-9 7L0-36-62 15Z" fill="#eff9fa" stroke="#b5d5df" stroke-width="7"/><path d="M-31 28h22v22h-22zm41 0h22v22H10Z" fill="#ffe2a0" stroke="#735359" stroke-width="4"/><path d="M0-55l-47 50" stroke="#fff" stroke-width="6"/></g>';
 }).join('');
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" data-biome-art="christmas_village">'
  +'<defs><linearGradient id="winter-night" x2="0" y2="1"><stop stop-color="#667b93"/><stop offset="1" stop-color="#b4d4dc"/></linearGradient></defs>'
  +'<rect width="800" height="480" fill="url(#winter-night)"/>'
  +'<path d="M0 206L76 60 153 190 263 32 367 169 493 42 605 187 716 57 800 142V450H0Z" fill="#758b99"/>'
  +'<path d="M0 207L76 60 103 107 67 93 34 175 153 190 263 32 293 93 264 77 227 135 367 169 493 42 518 89 489 72 441 139 605 187 716 57 752 130 715 111 680 153 800 142" fill="#dcecf0"/>'
  +'<path d="M0 260Q190 185 398 272Q600 190 800 245V480H0Z" fill="#b5d5da"/>'
  +trees+'<path d="'+route+'" fill="none" stroke="#687784" stroke-width="31" stroke-linejoin="round" stroke-linecap="round"/>'
  +'<path d="'+route+'" fill="none" stroke="#e6d6ba" stroke-width="21" stroke-linejoin="round" stroke-linecap="round"/>'
  +cabins+'<path d="M0 260q30-93 69 0m670-34q29-95 61 0" fill="#455765" stroke="#e5f2f4" stroke-width="10"/>'
  +Array.from({length:33},(_,i)=>'<circle cx="'+(i*227+19)%799+'" cy="'+(i*131+5)%450+'" r="'+(1+i%3)+'" fill="#fff9f3" opacity=".86"/>').join('')
  +'</svg>';
}
// Four unique holiday buildings and premium festive character cosmetics.
export function christmasTowerPortrait(id,skin='default'){
 const isTower=['cookiehouse','christmastree','snowman','stocking'].includes(id);
 const candy=id==='blade'&&skin==='candyblade';
 const cosmetic=(id==='scout'&&skin==='snowglobe')||(id==='icewitch'&&skin==='candycane')||
   (id==='knight'&&skin==='hollyknight');
 if(!isTower&&!candy&&!cosmetic)return null;
 const s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 210" data-design="christmas" data-art-tier="limited" data-base="'+id+'" data-costume="'+skin+'">';
 const shadow='<ellipse cx="91" cy="191" rx="71" ry="13" fill="#223b5280"/>';
 const star='<path d="M90 8l9 17 19 2-14 13 4 19-18-9-17 9 4-19-15-13 20-2Z" fill="#fff3b1" stroke="#e1aa73" stroke-width="3"/>';
 const icing='<path d="M23 90q9 15 19 0t18 0t18 0t18 0t18 0t19 0t19 0" fill="none" stroke="#fff8ee" stroke-width="11" stroke-linecap="round"/>';
 let art='';
 if(id==='cookiehouse'){
  art='<path d="M24 92l68-66 65 67v93H24Z" fill="#995d40" stroke="#6d3f43" stroke-width="7"/>'
    +'<path d="M15 96L90 16l78 80-15 19-63-67-60 66Z" fill="#fff8ef" stroke="#d6e5f3" stroke-width="5"/>'
    +icing+'<path d="M72 187v-57q18-24 37 0v57" fill="#573d3d" stroke="#ffeecc" stroke-width="6"/>'
    +'<rect x="39" y="125" width="25" height="25" rx="6" fill="#ffe39a" stroke="#fff4dc" stroke-width="5"/>'
    +'<rect x="116" y="125" width="25" height="25" rx="6" fill="#ffe39a" stroke="#fff4dc" stroke-width="5"/>'
    +'<path d="M88 122v56m-14-31h28" stroke="#ffffff" stroke-width="3"/>';
  for(let i=0;i<13;i++){
   const x=22+i*11,y=93-Math.sin(i/12*Math.PI)*54;
   art+='<circle cx="'+x+'" cy="'+y+'" r="'+(i%3+5)+'" fill="'+['#fb819e','#9ff0a0','#fddd80','#a6dfff'][i%4]+'" stroke="#fff5d9" stroke-width="2"/>';
  }
  art+='<path d="M30 192q30-13 55 0t55 0h25" fill="none" stroke="#fef7e5" stroke-width="10"/>';
 }else if(id==='christmastree'){
  art='<path d="M84 146h18v47H84Z" fill="#845c58" stroke="#52424b" stroke-width="4"/>'
   +'<path d="M93 29L38 103h20L25 154h130l-35-51h22Z" fill="#288777" stroke="#19555d" stroke-width="7"/>'
   +'<path d="M93 29v125h62l-35-51h22Z" fill="#1d6869" opacity=".6"/>'
   +star+'<path d="M50 120q45 22 88-10m-98 30q58 27 103-1M69 88q27 14 52-3" fill="none" stroke="#fbe7a4" stroke-width="5"/>';
  for(let i=0;i<16;i++){let x=48+(i*41)%89,y=74+(i*57)%78;art+='<circle cx="'+x+'" cy="'+y+'" r="5" fill="'+['#f87286','#9ef5ed','#ffe6ab','#ff9cc2'][i%4]+'" stroke="#fff8e6" stroke-width="1.5"/>';}
  art+='<rect x="35" y="169" width="31" height="27" rx="3" fill="#c35f70" stroke="#ffe1bb" stroke-width="4"/><path d="M49 168v28m-13-13h30" stroke="#ffe1bb" stroke-width="4"/>';
 }else if(id==='snowman'){
  art='<circle cx="91" cy="147" r="48" fill="#e8f6fb" stroke="#9ec9db" stroke-width="6"/>'
   +'<circle cx="91" cy="91" r="35" fill="#f6fcff" stroke="#9ec9db" stroke-width="6"/>'
   +'<path d="M51 54l9-21h67l12 21Z" fill="#273c54"/><rect x="72" y="6" width="41" height="35" rx="5" fill="#324b61"/>'
   +'<path d="M59 52h66v13H59Z" fill="#f17b8b"/>'
   +'<circle cx="78" cy="82" r="5" fill="#263c51"/><circle cx="104" cy="82" r="5" fill="#263c51"/>'
   +'<path d="M89 88l35 10-35 8Z" fill="#f4a361" stroke="#bd7757" stroke-width="2"/>'
   +'<path d="M61 110q34 22 66 0" fill="none" stroke="#ee6677" stroke-width="11"/>'
   +'<path d="M62 114l-6 32" stroke="#ee6677" stroke-width="10"/>'
   +'<circle cx="91" cy="140" r="5" fill="#516574"/><circle cx="91" cy="160" r="5" fill="#516574"/>';
 }else if(id==='stocking'){
  art='<path d="M48 35h87v100q0 44-48 58-57 17-71-18-5-19 15-29l32-11V35Z" fill="#da5f6b" stroke="#713e4f" stroke-width="7"/>'
    +'<path d="M44 35h98v39H44Z" fill="#f9f7eb" stroke="#bccfd6" stroke-width="5"/>'
    +'<path d="M60 35Q54 10 76 15l8 19" fill="none" stroke="#f6eab1" stroke-width="7"/>'
    +'<path d="M28 146q33 16 42 43-42 13-56-12Z" fill="#f7f0e1" stroke="#aebec1" stroke-width="4"/>'
    +'<path d="M110 127q25 1 25 25" fill="none" stroke="#ffe3af" stroke-width="7"/>';
  for(let i=0;i<7;i++)art+='<circle cx="'+(65+(i*31)%64)+'" cy="'+(89+(i*23)%67)+'" r="5" fill="'+['#ffd58f','#83e9a8','#9be7fa'][i%3]+'"/>';
 }else if(candy){
  art='<path d="M58 83l17-44 31-4 22 47-5 97H57Z" fill="#ebfbf5" stroke="#597b8b" stroke-width="7"/>'
  +'<path d="M68 44l-11-29 35 17 31-16 5 31-22-13Z" fill="#ec6b80" stroke="#fff6f4" stroke-width="4"/>'
  +'<circle cx="90" cy="64" r="29" fill="#ffe7ca" stroke="#ac7f7d" stroke-width="5"/>'
  +'<path d="M77 60h11m14 0h10" stroke="#5c4a58" stroke-width="5"/>'
  +'<path d="M83 83q11 10 21 0" fill="none" stroke="#e68a95" stroke-width="4"/>'
  +'<path d="M132 172l-12-9 33-102q14-35-7-32-14 4-12 16" fill="none" stroke="#fff8ee" stroke-width="15"/>'
  +'<path d="M132 172l-12-9 33-102q14-35-7-32-14 4-12 16" fill="none" stroke="#e85d75" stroke-width="6" stroke-dasharray="10 10"/>'
  +'<path d="M121 145l27 10" stroke="#f9d18c" stroke-width="6"/>';
 }else{
  // Three battle-pass cosmetic silhouettes carry their own seasonal gear.
  art='<path d="M53 83L79 44H113L138 81 128 185H49Z" fill="'+(id==='knight'?'#4b8e77':id==='icewitch'?'#b3e5e9':'#9cbbc8')+'" stroke="#57718b" stroke-width="7"/>'
    +'<circle cx="93" cy="62" r="27" fill="#f5e4d1" stroke="#8ba3ad" stroke-width="5"/>'
    +'<path d="M63 42q30-34 62 0l-10 11H74Z" fill="'+(id==='knight'?'#7bab78':'#f6faff')+'" stroke="#7295a7" stroke-width="5"/>'
    +'<path d="M124 162l31-103" stroke="#fff6ef" stroke-width="13"/>'
    +'<path d="M124 162l31-103" stroke="#ed697f" stroke-width="6" stroke-dasharray="11 11"/>'
    +'<circle cx="87" cy="63" r="3" fill="#36576a"/><circle cx="103" cy="63" r="3" fill="#36576a"/>';
 }
 if(isTower){
  art+='<g data-ornaments="'+id+'"><path d="M22 202h138" stroke="#e7f8fd" stroke-width="8"/>';
  for(let i=0;i<4;i++)art+='<circle cx="'+(42+i*29)+'" cy="'+(196-i%2*6)+'" r="3" fill="#eff8ff"/>';
  art+='</g>';
 }
 return s+shadow+art+'</svg>';
}
export function drawChristmasEnemyPlate(g,type){
 if(!CHRISTMAS_ENEMY_IDS.includes(type))return false;
 const ginger=/ginger|cookie|peppermint/.test(type);
 const gift=/gift|toy/.test(type);
 const snow=/snow|frost|winter/.test(type);
 const boss=/witch|conductor|king/.test(type);
 g.save();g.strokeStyle='#493a4e';g.lineWidth=3.2;g.lineJoin='round';g.lineCap='round';
 ellipse(g,2,17,boss?47:32,9,'#192d4359');
 if(ginger){
  // Cookies are iced gingerbread shapes, not recolored zombie sprites.
  g.fillStyle=type==='peppermint_wraith'?'#f2bdc3':'#bd8057';
  g.beginPath();g.arc(0,-61,20,0,7);g.fill();g.stroke();
  xm(g,[[-20,-43],[-37,-30],[-42,-17],[-27,-9],[-20,-18],[-14,15],[15,15],[20,-18],[31,-6],[44,-18],[31,-33],[20,-45]],'#b87d58','#5e4250',3);
  ellipse(g,-7,-65,3.2,3.2,'#fff8ed');ellipse(g,8,-65,3.2,3.2,'#fff8ed');
  line(g,[[-11,-53],[-3,-50],[7,-50],[14,-53]],'#fff6e9',3);
  for(const y of [-25,-9])ellipse(g,0,y,3.5,3.5,y===-25?'#f17b8c':'#a6efb2');
  line(g,[[-21,-31],[-27,-22],[-31,-29]],'#fff6e9',4);
  line(g,[[20,-31],[25,-20],[33,-27]],'#fff6e9',4);
  if(type==='cookie_knight'||type==='ginger_general'||boss){
   xm(g,[[-19,-47],[0,-61],[20,-47],[13,-29],[-14,-29]],'#e5ecef','#fcffff',3);
   line(g,[[31,-28],[45,-72]],'#e5d1a4',6);
  }
  if(boss){
   xm(g,[[-24,-79],[-25,-99],[-10,-92],[0,-107],[11,-92],[27,-99],[24,-79]],'#f6d37b','#e8e9b6',4);
   ellipse(g,0,-97,4,6,'#fb8c98');
  }
 }else if(gift){
  xm(g,[[-31,-53],[30,-54],[36,1],[-34,1]],'#c45e67','#753e51',4);
  xm(g,[[-36,-59],[34,-60],[39,-42],[-39,-40]],'#efb58b','#f8dfb9',4);
  g.fillStyle='#f1d386';g.fillRect(-8,-54,15,55);
  g.fillRect(-34,-29,65,12);
  ellipse(g,-15,-36,3,3,'#ffeccc');ellipse(g,17,-36,3,3,'#ffeccc');
  if(type==='toy_soldier'){g.fillStyle='#2f4860';g.fillRect(-23,-94,47,34);ellipse(g,0,-94,23,7,'#e8d39b');}
  if(boss){line(g,[[-37,-93],[0,-116],[37,-93]],'#ffe9ab',8);ellipse(g,0,-108,9,9,'#fff0b8');}
 }else if(snow){
  ellipse(g,0,-14,boss?37:27,boss?40:31,'#d7f5fa');
  ellipse(g,0,-65,boss?31:22,boss?30:22,'#f8fdff');
  ellipse(g,-8,-67,3,4,'#344c61');ellipse(g,9,-67,3,4,'#344c61');
  xm(g,[[0,-58],[25,-55],[0,-52]],'#eea475','#c98566',1);
  g.fillStyle='#39516a';g.fillRect(-26,-94,52,13);
  g.fillRect(-17,-110,34,22);
  line(g,[[-27,-33],[25,-29]],'#e97c93',7);
  if(boss)xm(g,[[-28,-97],[-18,-120],[0,-108],[18,-120],[28,-97]],'#cde6fc','#a6d4e9',3);
 }else{
  ellipse(g,0,-48,25,35,'#a9e8ca');
  line(g,[[-16,-75],[0,-104],[17,-75]],'#b9f4e6',6);
  ellipse(g,-9,-55,3,4,'#395468');ellipse(g,10,-55,3,4,'#395468');
  ellipse(g,0,-28,12,12,'#f1b7ad');
 }
 g.restore();return true;
}
export function christmasEnemyPortrait(type){
 if(!CHRISTMAS_ENEMY_IDS.includes(type))return null;
 const ginger=/ginger|cookie|peppermint/.test(type);
 const gift=/gift|toy/.test(type);
 const body=ginger?'#b57b55':gift?'#e17c81':'#d9f5fc';
 const shape=ginger?'<circle cx="70" cy="40" r="24"/><path d="M49 60L25 79l10 21 20-12-5 41 20 9 18-1 1-47 19 10 12-20L90 60Z"/>':
 gift?'<path d="M36 35H102V124H36Z"/><path d="M29 27H110V50H29Z"/>':
 '<circle cx="70" cy="93" r="38"/><circle cx="70" cy="40" r="27"/>';
 return '<svg viewBox="0 0 140 160" xmlns="http://www.w3.org/2000/svg" data-christmas-enemy="'+type+'">'
  +'<ellipse cx="71" cy="144" rx="50" ry="9" fill="#24384d55"/>'
  +'<g fill="'+body+'" stroke="#7c6472" stroke-width="4">'+shape+'</g>'
  +(gift?'<path d="M66 28v95M38 70h65" stroke="#ffe2a0" stroke-width="10"/>':'')
  +'<circle cx="58" cy="45" r="4" fill="#4d5868"/><circle cx="81" cy="45" r="4" fill="#4d5868"/>'
  +'<path d="M58 56q13 12 25 0" fill="none" stroke="'+(ginger?'#fff7ee':'#b27c79')+'" stroke-width="5"/>'
  +'<g fill="#f57d8a"><circle cx="60" cy="84" r="5"/><circle cx="79" cy="85" r="5"/></g></svg>';
}
