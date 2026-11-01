import { ENEMIES } from './data.js';

// Static, outlined character plates are baked once per species, not per enemy/frame.
const enemyPlates=new Map();
export function enemyStyle(type){
  const d=ENEMIES[type];
  if(d.eventOnly)return 'temple';
  if(['mk1','mk2','chain','mecha','sentinel','overload'].includes(type))return 'machine';
  if(['ghost','phantom','harpy'].includes(type))return 'spectral';
  if(d.heal||['warlock','medic'].includes(type))return 'caster';
  if((d.size||12)>=21)return 'brute';
  if(d.speed>=90)return 'runner';
  return 'walker';
}
export function enemyPlate(type){
  if(enemyPlates.has(type))return enemyPlates.get(type);
  const d=ENEMIES[type],family=enemyStyle(type),boss=(d.size||12)>=35;
  const c=typeof OffscreenCanvas==='function'?new OffscreenCanvas(288,352):document.createElement('canvas');c.width=288;c.height=352;
  const g=c.getContext('2d');g.scale(2,2);g.translate(72,124);
  g.lineJoin='round';g.lineCap='round';g.lineWidth=2.5;g.strokeStyle='#172237';
  const polygon=(points,color)=>{g.fillStyle=color;g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();g.stroke();};
  const box=(x,y,w,h,r,color)=>{g.fillStyle=color;g.beginPath();g.roundRect(x,y,w,h,r);g.fill();g.stroke();};
  const line=(points,color='#d8e8df',width=2)=>{g.strokeStyle=color;g.lineWidth=width;g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke();g.strokeStyle='#172237';g.lineWidth=2.5;};
  const orb=(x,y,r,color)=>{g.fillStyle=color;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();g.stroke();};
  const coat=g.createLinearGradient(-25,-60,25,20);coat.addColorStop(0,d.color);coat.addColorStop(1,'#253344');
  // Ground contact is baked too; it has no expensive blurred shadow pass.
  g.fillStyle='#101d3540';g.beginPath();g.ellipse(3,16,31,10,0,0,Math.PI*2);g.fill();
  if(type==='harpy')for(const side of [-1,1])polygon([[side*15,-34],[side*61,-64],[side*48,-15],[side*26,0]],coat);
  if(family==='temple'&&boss){polygon([[-27,-46],[-44,-36],[-39,8],[-21,2]],'#b49a7c');polygon([[22,-47],[43,-38],[39,8],[22,2]],'#827388');}
  if(type==='temple_spore')for(let k=0;k<6;k++){const a=k*Math.PI/3;line([[Math.cos(a)*18,-20+Math.sin(a)*18],[Math.cos(a)*40,-20+Math.sin(a)*40]],'#c896ab',6);}
  if(family==='spectral'){
    polygon([[-12,-55],[-27,-8],[-35,17],[-14,7],[-2,22],[11,10],[28,18],[20,-42]],coat);
    line([[-17,-14],[-13,2],[-18,8]],'#b3e1ff');line([[10,-18],[14,3]],'#8eb5f3');
  }else{
    box(-20,-7,15,25,4,'#29384c');box(6,-7,15,25,4,'#29384c');
    box(-24,9,21,10,3,'#465167');box(4,9,23,10,3,'#465167');
    polygon([[-19,-44],[-27,-17],[-22,5],[-8,1],[0,7],[12,1],[25,5],[24,-31],[15,-44]],coat);
  }
  box(-35,-39,12,29,5,d.color);box(24,-36,12,28,5,d.color);
  box(-36,-14,13,10,4,family==='machine'?'#a8c3ce':'#9da987');box(24,-12,13,10,4,family==='machine'?'#a8c3ce':'#9da987');
  if(['machine','brute','temple'].includes(family)){
    polygon([[-25,-43],[-35,-38],[-32,-24],[-18,-28]],d.color);
    polygon([[19,-43],[34,-38],[32,-24],[18,-28]],d.color);
    polygon([[-18,-39],[16,-39],[20,-20],[0,-10],[-20,-21]],family==='temple'?'#e4cfa1':'#6d7d8f');
    line([[-14,-34],[12,-34],[15,-24]],'#e0edf0');
    orb(0,-25,6,family==='machine'?'#75efff':'#ffa58b');
    for(const x of [-27,27])orb(x,-33,2,'#e2edf0');
  }else{
    line([[-14,-32],[8,-14],[-4,1]],'#d9c7a5',3);
    box(4,-20,12,10,2,'#6b7767');
    line([[-14,-19],[-8,-21],[-9,-14]],'#a2bd96',1.5);
  }
  const face=g.createLinearGradient(-14,-70,15,-34);face.addColorStop(0,family==='machine'?'#d5e5ed':family==='temple'?'#f5e8ca':'#c6d6a5');face.addColorStop(1,family==='machine'?'#7387a2':'#718a7d');
  box(-18,-72,36,35,8,face);box(-23,-60,6,12,3,'#9cae92');box(17,-60,6,12,3,'#9cae92');
  if(family==='machine'){
    polygon([[-22,-68],[-17,-80],[13,-81],[23,-68],[19,-61],[-20,-61]],'#465875');
    box(-16,-61,32,11,3,'#172b46');line([[-11,-55],[11,-55]],'#92faff',3);
    line([[12,-80],[18,-92]],'#95c7d7',3);orb(19,-94,4,d.color);
    for(const y of [-47,-43])line([[-7,y],[7,y]],'#364760',2);
  }else{
    const hood=family==='caster'||family==='spectral'||['temple_acolyte','temple_priest','temple_oracle'].includes(type);
    if(hood)polygon([[-24,-60],[-23,-76],[0,-91],[22,-75],[25,-59],[15,-69],[-14,-70]],coat);
    else polygon([[-20,-68],[-19,-79],[-10,-76],[-7,-83],[1,-77],[10,-80],[20,-71],[16,-65]],family==='temple'?'#b2966b':'#3b4652');
    line([[-13,-59],[-5,-57]],'#263648',3);line([[5,-57],[13,-61]],'#263648',3);
    box(-13,-56,8,5,1,boss?'#ffb25e':'#e7f58b');box(5,-56,8,5,1,boss?'#ffb25e':'#e7f58b');
    line([[-7,-45],[0,-47],[8,-44]],'#36464a',2);
    if(family==='brute'){polygon([[-12,-45],[-10,-35],[-5,-43]],'#eee8c9');polygon([[6,-43],[11,-35],[13,-46]],'#eee8c9');}
    else {g.fillStyle='#e4e6cc';g.fillRect(-5,-46,3,4);g.fillRect(1,-46,3,3);}
    line([[-14,-68],[-9,-65],[-12,-62]],'#58726b',1.5);
  }
  if(family==='runner'){
    polygon([[-19,-40],[18,-39],[25,-46],[39,-39],[49,-20],[27,-29],[17,-32],[-16,-31]],'#d9946c');
    line([[-19,-35],[14,-34]],'#f4d397',2);
  }
  if(family==='caster'||d.heal){
    line([[34,11],[40,-74]],'#c7b99a',5);orb(40,-80,10,d.color);orb(40,-80,5,'#def8cb');
    line([[40,-96],[40,-90]],'#e7eec4',2);box(-31,-18,10,18,3,'#78bcac');
  }
  if((family==='temple'&&!['temple_acolyte','temple_priest','temple_spore'].includes(type))||boss){
    polygon([[-21,-69],[-27,-91],[-11,-82],[0,-101],[11,-82],[26,-91],[21,-69]],family==='temple'?'#ccb47c':'#706388');
    line([[-17,-75],[17,-75]],'#ffe3a6',3);orb(0,-84,4,boss?'#ff6379':'#e5c66a');
    if(boss){g.strokeStyle='#d7bb7377';g.lineWidth=3;g.beginPath();g.ellipse(0,-83,40,22,0,Math.PI,Math.PI*2);g.stroke();g.strokeStyle='#172237';}
  }
  // Species details remain readable at normal zoom: bands, cores, antlers, chain.
  if(d.shield||d.armor){box(-24,-8,48,6,2,'#455b72');line([[-18,-5],[18,-5]],'#b1d4e3',1);}
  if(['shieldling','tank','temple_knight'].includes(type)){polygon([[-38,-37],[-21,-41],[-15,-25],[-19,-7],[-30,1],[-40,-14]],'#7394aa');line([[-29,-34],[-26,-10]],'#d2e6df',3);}
  if(type==='medic'){line([[-6,-27],[6,-27]],'#e4f5d9',4);line([[0,-33],[0,-21]],'#e4f5d9',4);}
  if(d.regen||d.onDeath){orb(0,-24,10,d.onDeath?'#edb872':'#9cdd99');orb(-2,-27,3,'#f8f5cc');}
  if(type==='chain')for(let i=0;i<6;i++){g.strokeStyle='#d7d9eb';g.beginPath();g.ellipse(-20+i*8,-20+i*2,5,7,.6,0,7);g.stroke();}
  if(['frostling','warden','sentinel'].includes(type))for(const side of [-1,1])polygon([[side*14,-68],[side*32,-91],[side*23,-70]],'#cbf4ff');
  const plate=typeof c.transferToImageBitmap==='function'?c.transferToImageBitmap():c;
  enemyPlates.set(type,plate);return plate;
}
export function drawEnemy(g,e,time,clock=time,overlay=true){
  const d=ENEMIES[e.type],r=d.size||12,scale=r/22;
  const floating=enemyStyle(e.type)==='spectral',bob=Math.sin(time*(floating?3:d.speed>=90?13:7)+e.id)*(floating?3:1.3);
  g.drawImage(enemyPlate(e.type),e.x-72*scale,e.y-124*scale+bob,144*scale,176*scale);
  if(overlay)drawEnemyOverlay(g,e,clock);
}
export function drawEnemyOverlay(g,e,clock){
  const d=ENEMIES[e.type],r=d.size||12,scale=r/22;
  // Dynamic state overlays are deliberately cheap and never baked into the plate.
  const ring=(color,radius)=>{g.strokeStyle=color;g.lineWidth=2;g.beginPath();g.ellipse(e.x,e.y-15*scale,radius,radius*1.25,0,0,Math.PI*2);g.stroke();};
  if(e.shield>0)ring('#9adfffbb',r+7);
  if(e.slowUntil>clock)ring('#95e8ffa0',r+10);
  if(e.markUntil>clock)ring('#ee9bdf',r+13);
  if(e.rushUntil>clock)ring('#ffc37e',r+16);
  if(e.hp<e.maxHp||r>=21){
    const width=Math.max(24,r*2.2),x=e.x-width/2,y=e.y-105*scale;
    g.fillStyle='#122139';g.fillRect(x-1,y-1,width+2,6);
    g.fillStyle=e.hp/e.maxHp>.4?'#99e5ae':'#ff977e';g.fillRect(x,y,width*Math.max(0,Math.min(1,e.hp/e.maxHp)),4);
    if(e.shield>0){g.fillStyle='#81d4ff';g.fillRect(x,y-4,width*Math.min(1,e.shield/(e.maxShield||e.shield)),2);}
  }
}
