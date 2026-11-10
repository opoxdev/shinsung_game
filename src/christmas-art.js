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
export function christmasVillagePreview(map){
 const route=map.path.map(([x,y],i)=>(i?'L':'M')+(x/1800*800).toFixed(1)+' '+(205+y/1100*245).toFixed(1)).join(' ');
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
 const s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 210" data-design="v2" data-art-tier="limited" data-base="'+id+'" data-costume="'+skin+'">';
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
  // Crystal snowflakes, branching mitten arms, embroidered scarf and hat
  // ornaments create a readable premium silhouette at card and battle scale.
  art+='<path d="M53 118L24 103 12 83M130 119l29-17 12-20" fill="none" stroke="#6e7a80" stroke-width="8" stroke-linecap="round"/>'
   +'<path d="M24 103L13 112M24 103L25 86M159 102L176 112M159 102L158 87" fill="none" stroke="#8f9ea6" stroke-width="5" stroke-linecap="round"/>'
   +'<path d="M70 117q19 12 46 0m-46 9q24 13 46 1" fill="none" stroke="#fff1e6" stroke-width="3"/>'
   +'<path d="M76 15h31l-7 6H83Z" fill="#a8edcb"/><circle cx="92" cy="6" r="5" fill="#f9d6af"/>'
   +'<path d="M25 48v-24m-12 12h24M17 28l16 16M17 44l16-16" stroke="#bceeff" stroke-width="3"/>'
   +'<path d="M159 62v-25m-12 12h24m-21-9 18 18m-18 0 18-18" stroke="#d9f8ff" stroke-width="3"/>'
   +'<circle cx="62" cy="144" r="5" fill="#f3fbff"/><circle cx="121" cy="150" r="4" fill="#f7fcff"/>';
 }else if(id==='stocking'){
  art='<path d="M48 35h87v100q0 44-48 58-57 17-71-18-5-19 15-29l32-11V35Z" fill="#da5f6b" stroke="#713e4f" stroke-width="7"/>'
    +'<path d="M44 35h98v39H44Z" fill="#f9f7eb" stroke="#bccfd6" stroke-width="5"/>'
    +'<path d="M60 35Q54 10 76 15l8 19" fill="none" stroke="#f6eab1" stroke-width="7"/>'
    +'<path d="M28 146q33 16 42 43-42 13-56-12Z" fill="#f7f0e1" stroke="#aebec1" stroke-width="4"/>'
    +'<path d="M110 127q25 1 25 25" fill="none" stroke="#ffe3af" stroke-width="7"/>';
  for(let i=0;i<7;i++)art+='<circle cx="'+(65+(i*31)%64)+'" cy="'+(89+(i*23)%67)+'" r="5" fill="'+['#ffd58f','#83e9a8','#9be7fa'][i%3]+'"/>';
  // Bell ornament and stitches mark the lucky Christmas stocking as an
  // active gift dispenser rather than an ordinary decorative stocking.
  art+='<path d="M46 76h95" stroke="#b8dbd4" stroke-width="3" stroke-dasharray="6 6"/>'
   +'<path d="M81 38l-15 19 26 12 27-11-16-20" fill="none" stroke="#78beab" stroke-width="5"/>'
   +'<path d="M102 97l13-25 14 25-3 20h-21Z" fill="#ffe3a1" stroke="#dbad68" stroke-width="3"/>'
   +'<circle cx="115" cy="113" r="6" fill="#e19d56"/><circle cx="115" cy="72" r="5" fill="#fff8db"/>'
   +'<path d="M64 95l12-10 11 10-11 11Z" fill="#a0f0d0" stroke="#fef6ec" stroke-width="2"/>'
   +'<path d="M32 161q31 14 30 28m14-64q-5 24 8 33" stroke="#fff9eb" stroke-width="3" fill="none"/>'
   +'<circle cx="141" cy="151" r="6" fill="#fef1cc"/><circle cx="138" cy="139" r="3" fill="#6addaa"/>';
 }else if(candy){
  art='<path d="M58 83l17-44 31-4 22 47-5 97H57Z" fill="#ebfbf5" stroke="#597b8b" stroke-width="7"/>'
  +'<path d="M68 44l-11-29 35 17 31-16 5 31-22-13Z" fill="#ec6b80" stroke="#fff6f4" stroke-width="4"/>'
  +'<circle cx="90" cy="64" r="29" fill="#ffe7ca" stroke="#ac7f7d" stroke-width="5"/>'
  +'<path d="M77 60h11m14 0h10" stroke="#5c4a58" stroke-width="5"/>'
  +'<path d="M83 83q11 10 21 0" fill="none" stroke="#e68a95" stroke-width="4"/>'
  +'<path d="M132 172l-12-9 33-102q14-35-7-32-14 4-12 16" fill="none" stroke="#fff8ee" stroke-width="15"/>'
  +'<path d="M132 172l-12-9 33-102q14-35-7-32-14 4-12 16" fill="none" stroke="#e85d75" stroke-width="6" stroke-dasharray="10 10"/>'
  +'<path d="M121 145l27 10" stroke="#f9d18c" stroke-width="6"/>'
  // Wrapped peppermint battle coat, embroidered epaulettes and decorative candy crest.
  +'<path d="M61 108l-21 70 35 17 18-40 18 40 31-17-23-70" fill="#fff2e5" stroke="#d86b7c" stroke-width="5"/>'
  +'<path d="M46 154l25 9m43-2 18-10M62 118l58 0" stroke="#d96679" stroke-width="7" stroke-dasharray="8 8"/>'
  +'<path d="M70 111 91 133l23-22-7-22H76Z" fill="#c75e72" stroke="#ffecb1" stroke-width="4"/>'
  +'<circle cx="91" cy="122" r="10" fill="#ffecce" stroke="#ef9ea5" stroke-width="3"/>'
  +'<path d="M87 120h8m-4-4v10" stroke="#e86a7b" stroke-width="3"/>'
  +'<path d="M55 94l-13-16 23 7m50 9 13-16-23 7" fill="#ffe5a9" stroke="#e7ac7b" stroke-width="3"/>'
  +'<circle cx="52" cy="98" r="5" fill="#ffb1bd"/><circle cx="126" cy="98" r="5" fill="#ffb1bd"/>'
  +'<path d="M69 176l6-14m47 14-6-14" stroke="#ffe9b5" stroke-width="5"/>'
  +'<path d="M34 170l-12-8 7-13 15 5m116 12 9-10-9-14-15 11" fill="#f7c2b7" stroke="#fff5df" stroke-width="3"/>';
 }else if(id==='scout'){
  // Hand-blown snow globe, miniature explorer and cast-brass collector pedestal.
  art='<g data-festival-model="snowglobe"><rect x="35" y="169" width="111" height="28" rx="8" fill="#c9a16d" stroke="#fff1c4" stroke-width="5"/>'
    +'<path d="M52 155h80l13 19H37Z" fill="#5a89a5" stroke="#e3faff" stroke-width="4"/>'
    +'<circle cx="91" cy="95" r="64" fill="#d3f6ff" fill-opacity=".25" stroke="#f1ffff" stroke-width="7"/>'
    +'<circle cx="91" cy="95" r="56" fill="none" stroke="#82d7ea" stroke-width="2" stroke-dasharray="3 7"/>'
    +'<path d="M40 142q52-22 101 0v18H40Z" fill="#ecfbff"/>'
    +'<path d="M66 111 57 150h67l-10-39-17-13H82Z" fill="#4a8598" stroke="#c7f8ff" stroke-width="4"/>'
    +'<circle cx="91" cy="83" r="21" fill="#ffe2d0" stroke="#e0f5f6" stroke-width="4"/>'
    +'<path d="M70 75q21-34 44 0l-7 10H78Z" fill="#d75e77" stroke="#fff7e3" stroke-width="4"/>'
    +'<path d="M60 116l-17 13m75-12 17 12" stroke="#f5e6ba" stroke-width="6"/>'
    +'<circle cx="83" cy="85" r="3" fill="#36566a"/><circle cx="99" cy="85" r="3" fill="#36566a"/>'
    +'<path d="M68 183h48" stroke="#ffedbd" stroke-width="4"/>'
    +Array.from({length:23},(_,i)=>'<circle cx="'+(43+(i*31)%94)+'" cy="'+(37+(i*43)%111)+'" r="'+(i%3+1)+'" fill="#fff" opacity=".9"/>').join('')+'</g>';
 }else if(id==='icewitch'){
  // Peppermint sorceress with an oversized candy spire, lace-edged robe and cane-staff.
  art='<g data-festival-model="candycane"><path d="M45 181 57 95l26-14h30l22 100-43 11Z" fill="#e8f6ee" stroke="#9ac6c1" stroke-width="6"/>'
    +'<path d="M58 102 38 174l44 14 6-77Z" fill="#8ddbd5" stroke="#fff3e1" stroke-width="4"/>'
    +'<path d="M112 102 146 176l-43 12-11-76Z" fill="#db6684" stroke="#ffebda" stroke-width="4"/>'
    +'<circle cx="92" cy="73" r="25" fill="#ffe3d0" stroke="#b5d3cf" stroke-width="4"/>'
    +'<path d="M39 66 89 6l49 60-52-9Z" fill="#d95e7e" stroke="#fff3de" stroke-width="5"/>'
    +'<path d="M62 39l55 11M75 26l24 8" stroke="#fff9e6" stroke-width="10"/>'
    +'<path d="M44 67q45 11 92 0" stroke="#f8e9ae" stroke-width="9"/>'
    +'<path d="M137 176 158 45q5-28-15-25-20 2-18 25" fill="none" stroke="#fff9e4" stroke-width="15" stroke-linecap="round"/>'
    +'<path d="M137 176 158 45q5-28-15-25-20 2-18 25" fill="none" stroke="#db647c" stroke-width="7" stroke-dasharray="12 12" stroke-linecap="round"/>'
    +'<path d="M59 145q34 19 68 0" fill="none" stroke="#ffe1a5" stroke-width="5"/>'
    +'<circle cx="92" cy="52" r="8" fill="#ffe9af"/></g>';
 }else{
  // Holly knight, fully armored with fir-crest helmet and a separate wreath shield.
  art='<g data-festival-model="hollyknight"><path d="M48 181 57 98l25-16h27l25 16 8 83-48 13Z" fill="#397665" stroke="#f7dea4" stroke-width="6"/>'
    +'<path d="M70 107 93 117l23-10-6 61-17 16-17-16Z" fill="#dcebd5" stroke="#9dcba3" stroke-width="4"/>'
    +'<path d="M65 86 58 56l34-18 34 18-11 30-23 15Z" fill="#c9d7bc" stroke="#fff0be" stroke-width="5"/>'
    +'<path d="M73 56 90 11l10 13 18 32" fill="#2e765d" stroke="#e4d99a" stroke-width="5"/>'
    +'<path d="M59 69h67v15H59Z" fill="#305c57" stroke="#f9dda7" stroke-width="4"/>'
    +'<path d="M76 75h36" stroke="#fff0ac" stroke-width="3"/>'
    +'<path d="M145 187 137 72l11-22 11 22-7 115Z" fill="#f8e8c2" stroke="#c5a47c" stroke-width="5"/>'
    +'<path d="M134 112h29" stroke="#89b88a" stroke-width="6"/>'
    +'<circle cx="44" cy="132" r="37" fill="#e5edd1" stroke="#b9a46d" stroke-width="6"/>'
    +'<circle cx="44" cy="132" r="28" fill="none" stroke="#45976c" stroke-width="11" stroke-dasharray="7 6"/>'
    +'<path d="M29 131 44 109l15 22-15 24Z" fill="#ffde85" stroke="#fff5cb" stroke-width="3"/>'
    +'<circle cx="28" cy="116" r="7" fill="#d75c67"/><circle cx="59" cy="149" r="6" fill="#d75c67"/></g>';
 }
 if(isTower){
  art+='<g data-ornaments="'+id+'"><path d="M22 202h138" stroke="#e7f8fd" stroke-width="8"/>';
  for(let i=0;i<4;i++)art+='<circle cx="'+(42+i*29)+'" cy="'+(196-i%2*6)+'" r="3" fill="#eff8ff"/>';
  art+='</g>';
 }
 const aura='<g data-festival-aura="'+id+'" opacity=".7"><circle cx="90" cy="110" r="79" fill="none" stroke="#b7f6e9" stroke-width="2" stroke-dasharray="4 13"/></g>';
 const sparkle='<g data-festival-spark="true"><path d="M24 26v16m-8-8h16M155 114v16m-8-8h16M127 10v10m-5-5h10" stroke="#fff5d8" stroke-width="3" stroke-linecap="round"/>'+
   '<circle cx="36" cy="157" r="3" fill="#b6f8ff"/><circle cx="144" cy="178" r="3" fill="#ffe6a5"/></g>';
 return s+shadow+aura+art+sparkle+'</svg>';
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
