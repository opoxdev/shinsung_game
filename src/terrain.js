import { WORLD } from './data.js';
import { pathDistance } from './engine.js';
import { TERRAIN_MARGIN } from './presentation.js';
const noise=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
const poly=(g,p,c)=>{g.beginPath();p.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fillStyle=c;g.fill();};
const oval=(g,x,y,rx,ry,c)=>{g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,0,0,7);g.fill();};
function prop(g,x,y,s,biome){g.save();g.translate(x,y);g.scale(s,s);oval(g,8,18,37,13,'#19274244');
  if(biome==='temple'){
    poly(g,[[-31,17],[-31,-8],[-13,-14],[16,-14],[32,-7],[32,18]],'#63536b');
    g.fillStyle='#c5a577';g.fillRect(-29,-19,58,9);
    g.fillStyle='#e8c48b';g.fillRect(-20,-65,40,10);
    g.fillStyle='#9f8491';g.fillRect(-15,-58,30,41);
    g.strokeStyle='#e8bf78';g.lineWidth=3;g.strokeRect(-17,-58,34,42);
    g.fillStyle='#dc536c';g.beginPath();g.arc(0,-69,6,0,7);g.fill();
    g.fillStyle='#402d4b';g.fillRect(-29,6,58,12);
  }
  else if(biome==='crystal'){poly(g,[[-22,5],[-13,-48],[5,-68],[25,-4],[8,24]],'#b08aff');poly(g,[[5,-68],[8,24],[25,-4]],'#6ee4f2');poly(g,[[-13,-48],[5,-68],[8,24]],'#dfbfff');poly(g,[[15,14],[35,-27],[45,-30],[43,18],[28,28]],'#7cc9ef');}
  else if(biome==='volcano'||biome==='rock'){const dark=biome==='volcano';poly(g,[[-35,9],[-25,-22],[5,-37],[33,-14],[39,13],[2,28]],dark?'#654459':'#a1aeb3');poly(g,[[-25,-22],[5,-37],[33,-14],[2,-3]],dark?'#bc756f':'#d5d8d3');poly(g,[[2,-3],[33,-14],[39,13],[2,28]],dark?'#413447':'#798b99');}
  else{const snow=biome==='snow',dark=biome==='mountains';g.fillStyle='#81535c';g.fillRect(-7,-2,14,29);poly(g,[[0,-84],[-33,-32],[-20,-32],[-47,8],[0,24],[46,8],[21,-31],[34,-31]],snow?'#edfaff':dark?'#6f6897':'#3ca575');poly(g,[[0,-84],[0,24],[46,8],[21,-31],[34,-31]],snow?'#b4ddea':dark?'#4f507c':'#287d62');poly(g,[[0,-84],[-33,-32],[0,-44]],snow?'#fff':dark?'#8c80b6':'#64ca8e');}g.restore();}
export function makeTerrain(map){
  const c=document.createElement('canvas');c.width=WORLD.width+2*TERRAIN_MARGIN;c.height=WORLD.height+2*TERRAIN_MARGIN;const g=c.getContext('2d');g.fillStyle=map.ground;g.fillRect(0,0,c.width,c.height);g.translate(TERRAIN_MARGIN,TERRAIN_MARGIN);
  // Bake the surrounding biome once; no rectangular void at maximum zoom-out.
  for(let i=0;i<420;i++){
    const x=noise(i+8100)*c.width-TERRAIN_MARGIN,y=noise(i+9100)*c.height-TERRAIN_MARGIN;
    if(x>40&&x<WORLD.width-40&&y>50&&y<WORLD.height-50)continue;
    if(pathDistance(map.path,x,y)<100)continue;
    if(i%3===0)poly(g,[[x-60,y],[x-15,y-45],[x+80,y],[x+45,y+50]],i%2?'#ffffff09':'#142b3510');
    else prop(g,x,y,.55+noise(i+99)*.65,map.id);
  }
  for(let i=0;i<65;i++){const x=noise(i)*1800,y=noise(i+300)*1100;poly(g,[[x-100,y],[x-30,y-60],[x+100,y-20],[x+90,y+50],[x-40,y+70]],i%2?'#ffffff09':'#142b3510');}
  for(let i=0;i<500;i++){const x=noise(i+90)*1800,y=noise(i+500)*1100;if(pathDistance(map.path,x,y)<70)continue;g.strokeStyle=map.id==='plains'?'#a4e27899':'#ffffff20';g.lineWidth=2;g.beginPath();g.moveTo(x-4,y);g.lineTo(x-7,y-7);g.moveTo(x,y);g.lineTo(x,y-10);g.moveTo(x+4,y);g.lineTo(x+7,y-5);g.stroke();if(i%9===0&&map.id==='plains')oval(g,x,y-8,3,3,i%2?'#fff0ad':'#ffacd1');}
  if(map.biome==='temple'){
    // Deterministic carved-obsidian floor and altar ruins baked once per map.
    // There are no animated terrain draw calls or image/network dependencies.
    g.fillStyle='#272130';
    for(let row=0;row<26;row++)for(let col=0;col<37;col++){
      const x=col*50-25+(row%2)*25,y=row*45-17;
      const n=noise(row*67+col*13+670);
      g.fillStyle=n>.7?'#3d3240':n>.3?'#352c39':'#2d2635';
      g.fillRect(x+1,y+1,47,42);
      g.strokeStyle='#80636a29';g.lineWidth=1;
      g.strokeRect(x+1.5,y+1.5,46,41);
      if(n>.94){g.strokeStyle='#dd98645c';g.beginPath();
        g.moveTo(x+7,y+4);g.lineTo(x+27,y+20);g.lineTo(x+20,y+35);g.stroke();}
    }
    // A monumental sealed shrine between the switchbacks.
    g.save();g.translate(910,472);
    g.shadowColor='#ff9f5b';g.shadowBlur=27;
    oval(g,0,0,188,140,'#8c47413f');
    for(let k=0;k<4;k++){
      g.strokeStyle=k%2?'#e9806799':'#efbc7799';g.lineWidth=k===0?9:4;
      g.beginPath();g.arc(0,0,48+k*29,0,7);g.stroke();
    }
    g.shadowBlur=0;
    g.fillStyle='#4c3342';g.beginPath();g.moveTo(-60,-10);g.lineTo(-39,-67);
    g.lineTo(38,-67);g.lineTo(62,-10);g.lineTo(45,63);g.lineTo(-42,63);g.closePath();g.fill();
    g.strokeStyle='#c99b6c';g.lineWidth=7;g.stroke();
    g.fillStyle='#141321';g.beginPath();g.arc(0,0,37,0,7);g.fill();
    g.strokeStyle='#ffdca1';g.lineWidth=4;g.stroke();
    g.fillStyle='#fe8764';g.beginPath();g.moveTo(0,-29);g.lineTo(24,0);
    g.lineTo(0,30);g.lineTo(-24,0);g.closePath();g.fill();
    g.fillStyle='#ffe0a2';g.beginPath();g.arc(0,0,9,0,7);g.fill();
    g.restore();
    // Raised gold-bronze obelisks and sacrificial braziers off the road.
    for(let k=0;k<30;k++){
      const x=65+noise(k+118)*1660,y=55+noise(k+241)*975;
      if(pathDistance(map.path,x,y)<125||Math.hypot(x-910,y-472)<155)continue;
      const height=35+noise(k+713)*52;
      g.fillStyle='#15132066';g.beginPath();g.ellipse(x+12,y+14,33,12,0,0,7);g.fill();
      g.fillStyle=k%3===0?'#725267':'#716072';
      g.beginPath();g.moveTo(x-19,y+12);g.lineTo(x-15,y-height);
      g.lineTo(x,y-height-20);g.lineTo(x+15,y-height);
      g.lineTo(x+19,y+12);g.closePath();g.fill();
      g.fillStyle='#d7b676';g.fillRect(x-20,y+2,40,9);
      g.strokeStyle='#d4aa78';g.lineWidth=2;
      g.beginPath();g.moveTo(x,y-height-17);g.lineTo(x,y-4);g.stroke();
      g.shadowColor='#ff845b';g.shadowBlur=12;oval(g,x,y-height*.6,5,12,'#fb8d58');
      g.shadowBlur=0;
    }
    for(let k=0;k<12;k++){const x=120+(k%6)*270,y=95+Math.floor(k/6)*780;
      if(pathDistance(map.path,x,y)<122)continue;g.fillStyle='#55425a';g.fillRect(x-42,y-32,84,65);
      g.fillStyle='#947b77';g.fillRect(x-35,y-42,70,20);g.fillStyle='#ffc16f';
      g.beginPath();g.arc(x,y-44,7,0,7);g.fill();g.strokeStyle='#e7bd70';g.strokeRect(x-34,y-28,68,50);}
    g.shadowColor='#fa5d74';g.shadowBlur=14;g.strokeStyle='#b43a58';g.lineWidth=6;
    for(let k=0;k<16;k++){const x=50+noise(k+420)*1700,y=65+noise(k+620)*960;
      if(pathDistance(map.path,x,y)<95)continue;g.beginPath();g.moveTo(x-27,y-12);
      g.lineTo(x,y+7);g.lineTo(x+20,y-17);g.lineTo(x+40,y+12);g.stroke();}
    g.shadowBlur=0;g.save();g.translate(900,450);g.strokeStyle='#f6cb7966';g.lineWidth=8;
    for(let k=0;k<3;k++){g.beginPath();g.arc(0,0,40+k*25,0,7);g.stroke();}
    for(let k=0;k<8;k++){const p=k*Math.PI/4;g.beginPath();g.moveTo(Math.cos(p)*50,Math.sin(p)*50);
      g.lineTo(Math.cos(p)*112,Math.sin(p)*112);g.stroke();}g.restore();
  }
  if(map.id==='plains'){oval(g,940,500,130,90,'#4a9d92');oval(g,940,488,115,72,'#63cbd7');oval(g,935,477,95,52,'#7ee4e0');g.strokeStyle='#d9ffff88';g.lineWidth=4;g.beginPath();g.ellipse(940,482,70,35,0,.2,2.5);g.stroke();}
  if(map.id==='volcano'){g.shadowColor='#ff733b';g.shadowBlur=24;g.strokeStyle='#ff8550';g.lineWidth=12;g.beginPath();g.moveTo(80,100);g.lineTo(240,160);g.lineTo(360,80);g.moveTo(1200,720);g.lineTo(1280,640);g.lineTo(1300,940);g.stroke();g.shadowBlur=0;g.strokeStyle='#ffdc78';g.lineWidth=4;g.stroke();}
  if(map.id==='mountains'){for(let i=0;i<6;i++){const x=130+i*300;poly(g,[[x-110,90],[x,5],[x+125,95],[x+60,140]],'#303147');poly(g,[[x,5],[x+125,95],[x+60,140]],'#242b40');poly(g,[[x-40,38],[x,5],[x+40,34],[x+6,26]],'#9e8eaf');}}
  g.lineJoin='round';g.lineCap='round';g.beginPath();map.path.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.lineWidth=95;g.strokeStyle='#263a4544';g.stroke();g.lineWidth=82;g.strokeStyle=map.id==='plains'?'#b49b6c':'#d3c5e088';g.stroke();g.lineWidth=76;g.strokeStyle=map.roadColor;g.stroke();
  if(map.biome==='temple'){
    // Inlaid luminous rails emphasize the exact playable path.
    g.save();g.beginPath();map.path.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));
    g.lineCap='round';g.lineJoin='round';
    g.strokeStyle='#2d2638';g.lineWidth=62;g.stroke();
    g.strokeStyle='#706075';g.lineWidth=54;g.stroke();
    g.strokeStyle='#af8a73';g.lineWidth=46;g.stroke();
    g.strokeStyle='#dfbd80a3';g.lineWidth=3;g.setLineDash([21,22]);g.stroke();
    g.setLineDash([]);g.restore();
    // Temple stepping seals along vertical turns and major straightaways.
    for(let segment=1;segment<map.path.length;segment++){
      const a=map.path[segment-1],b=map.path[segment],len=Math.hypot(b[0]-a[0],b[1]-a[1]);
      const dx=(b[0]-a[0])/len,dy=(b[1]-a[1])/len;
      for(let distance=72;distance<len-40;distance+=146){
        const x=a[0]+dx*distance,y=a[1]+dy*distance;
        g.save();g.translate(x,y);g.rotate(Math.atan2(dy,dx));
        g.strokeStyle='#f4cd8966';g.lineWidth=2;
        g.strokeRect(-10,-24,20,48);
        g.beginPath();g.moveTo(-7,0);g.lineTo(0,-10);g.lineTo(7,0);g.lineTo(0,10);g.closePath();g.stroke();
        g.restore();
      }
    }
  }

  for(let i=0;i<150;i++){const x=noise(i+1900)*1800,y=noise(i+2900)*1100;if(pathDistance(map.path,x,y)>27)continue;oval(g,x,y,5+i%4,2,'#ffffff26');}
  for(let i=0;i<90;i++){const x=60+noise(i+4000)*1680,y=90+noise(i+5000)*940;if(pathDistance(map.path,x,y)<125)continue;if(map.id==='plains'&&Math.hypot((x-940)/1.4,y-488)<100)continue;prop(g,x,y,.65+noise(i+90)*.7,i%5===0&&!['crystal','volcano'].includes(map.id)?'rock':map.id);}
  const inset=(end,near,d)=>{const length=Math.hypot(near[0]-end[0],near[1]-end[1]);return [end[0]+(near[0]-end[0])*d/length,end[1]+(near[1]-end[1])*d/length];};
  const [sx,sy]=inset(map.path[0],map.path[1],35),[ex,ey]=inset(map.path.at(-1),map.path.at(-2),45);
  for(const [x,y,color]of [[sx,sy,'#ff7197'],[ex,ey,'#84f4ff']]){g.shadowColor=color;g.shadowBlur=22;g.strokeStyle=color;g.lineWidth=9;g.beginPath();g.ellipse(x,y-16,23,52,0,0,7);g.stroke();g.shadowBlur=0;oval(g,x,y+31,34,10,'#222d4644');}
  return c;
}
