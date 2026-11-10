// Individually art-directed Christmas chapters (train yard & gingerbread
// kingdom). Pure, seeded vector scenery: one-time Canvas bake / cached SVG,
// never dynamic downloads, random seeds or animation work per frame.
export const HOLIDAY_EXTRA_MAPS=Object.freeze(['christmas_station','christmas_kingdom']);
const rand=n=>{const x=Math.sin(n*91.37+27.17)*43629.271;return x-Math.floor(x);};
const fillOval=(g,x,y,w,h,c)=>{g.beginPath();g.ellipse(x,y,w,h,0,0,Math.PI*2);g.fillStyle=c;g.fill();};
const polygon=(g,pts,fill,stroke=null,weight=2)=>{
 g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();
 g.fillStyle=fill;g.fill();if(stroke){g.strokeStyle=stroke;g.lineWidth=weight;g.stroke();}
};
const drawPath=(g,pts,color,width,dash=[])=>{
 g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));
 g.strokeStyle=color;g.lineWidth=width;g.lineJoin='round';g.lineCap='round';
 g.setLineDash(dash);g.stroke();g.setLineDash([]);
};
const rect=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
function gift(g,x,y,s=1,color='#dc707c'){
 g.save();g.translate(x,y);g.scale(s,s);
 fillOval(g,5,17,31,9,'#233e5860');
 rect(g,-25,-19,51,39,color);rect(g,-27,-25,55,11,'#f7d2a5');
 rect(g,-5,-25,10,50,'#ffe9af');rect(g,-27,-5,55,9,'#ffe9af');
 drawPath(g,[[-3,-26],[-13,-36],[-22,-34],[-9,-22],[3,-25],[13,-38],[22,-33],[11,-21]],'#fff4c5',4);
 g.restore();
}
function snowPine(g,x,y,s=1,lit=false){
 g.save();g.translate(x,y);g.scale(s,s);
 fillOval(g,4,18,38,12,'#35567750');
 rect(g,-5,-20,10,37,'#836e6c');
 for(let tier=0;tier<4;tier++){
  const h=58+tier*27,r=19+(3-tier)*10;
  polygon(g,[[-r,5-tier*28],[0,-h-31],[r,5-tier*28]],tier%2?'#397b82':'#448c88','#2c6979',2);
  drawPath(g,[[-r+6,-1-tier*28],[0,-h-30],[r-4,-1-tier*28]],'#e8fbff',5);
 }
 if(lit)for(let i=0;i<10;i++){
  const xx=Math.sin(i*17)*((i%4)+1)*5,yy=-10-i*11;
  fillOval(g,xx,yy,3,3,i%3?'#ffe0a2':'#ff8c99');
 }
 g.restore();
}
function signal(g,x,y,s=1){
 g.save();g.translate(x,y);g.scale(s,s);
 drawPath(g,[[0,5],[0,-76],[16,-83]],'#425465',6);
 rect(g,5,-109,29,39,'#39475a');
 fillOval(g,20,-96,7,7,'#a6efbb');
 fillOval(g,20,-79,5,5,'#ffeab0');
 drawPath(g,[[1,-70],[1,9]],'#d5b78d',2);
 g.restore();
}
function lantern(g,x,y,s=1,color='#ffe4ab'){
 g.save();g.translate(x,y);g.scale(s,s);
 drawPath(g,[[0,5],[0,-76],[13,-80]],'#514d56',5);
 rect(g,7,-94,23,24,'#3d4a5a');
 g.shadowBlur=11;g.shadowColor=color;rect(g,12,-89,13,15,color);g.shadowBlur=0;
 polygon(g,[[4,-95],[18,-107],[33,-95]],'#526075','#273648',2);
 g.restore();
}
function icyCliff(g,x,y,w=230){
 polygon(g,[[x-w*.5,y-30],[x-w*.22,y-77],[x+w*.16,y-69],[x+w*.5,y-12],
 [x+w*.47,y+62],[x+w*.18,y+101],[x-w*.39,y+71]],'#7999b0','#b3d3db',5);
 polygon(g,[[x-w*.5,y-30],[x-w*.22,y-77],[x+w*.16,y-69],[x+w*.26,y-15],[x-w*.12,y+4]],'#e5f4f5');
 polygon(g,[[x+w*.26,y-15],[x+w*.5,y-12],[x+w*.47,y+62],[x+w*.18,y+101]],'#4e7b9a');
 for(let i=0;i<5;i++){const dx=x-w*.39+(i*57)%w;polygon(g,[[dx,y+53],[dx+6,y+79],[dx+14,y+54]],'#a9eeff','#ceeef6',1);}
}
function railroad(g,pts,scale=1){
 g.save();g.lineJoin='round';g.lineCap='round';
 drawPath(g,pts,'#637c8a',19*scale);
 drawPath(g,pts,'#e8d1b0',13*scale);
 // Consecutive sleepers along authored rail segments; drawn once.
 for(let k=1;k<pts.length;k++){
  const [ax,ay]=pts[k-1],[bx,by]=pts[k],len=Math.hypot(bx-ax,by-ay),nx=(bx-ax)/len,ny=(by-ay)/len;
  for(let d=12;d<len;d+=21*scale){
   const x=ax+nx*d,y=ay+ny*d;
   drawPath(g,[[x-ny*13*scale,y+nx*13*scale],[x+ny*13*scale,y-nx*13*scale]],'#866655',4*scale);
  }
 }
 drawPath(g,pts,'#414d5b',3*scale);
 g.restore();
}
function steamTrain(g,x,y,s=1){
 g.save();g.translate(x,y);g.scale(s,s);
 // Locomotive, brass boilers and two red present-laden carriage cars.
 for(let c=0;c<2;c++){
  const xx=74+c*140;
  polygon(g,[[xx,-51],[xx+116,-51],[xx+126,-10],[xx,-10]],c?'#ae425a':'#b64c52','#efbd80',5);
  for(let i=0;i<3;i++)gift(g,xx+20+i*36,-67,.5,['#cf5a73','#6da98c','#9cc3d5'][i]);
  rect(g,xx+6,-42,110,7,'#f2c47e');
  for(let i=0;i<3;i++)fillOval(g,xx+23+i*39,0,13,13,'#334253');
 }
 polygon(g,[[-137,-58],[-94,-75],[20,-70],[50,-48],[53,-11],[-137,-11]],'#a9484d','#ffe1a0',5);
 fillOval(g,-49,-71,63,34,'#34445d');fillOval(g,-49,-70,60,28,'#b9424b');
 rect(g,-133,-102,56,48,'#aa3c4d');rect(g,-120,-90,30,28,'#ffe2ab');
 rect(g,12,-106,18,45,'#8e4245');fillOval(g,21,-108,17,6,'#d7ad7c');
 polygon(g,[[-145,-9],[-101,-42],[-99,-9]],'#e7b56f','#aa5a60',4);
 for(const x of [-116,-60,0,48])fillOval(g,x,0,15,15,'#344152');
 for(const x of [-116,-60,0,48])fillOval(g,x,0,7,7,'#f9d8a1');
 for(let i=0;i<6;i++)fillOval(g,21-i*19,-148-i*16,19+i*3,10+i*2,'#f5fcff9f');
 g.restore();
}
function stationHall(g,x,y,s=1){
 g.save();g.translate(x,y);g.scale(s,s);
 fillOval(g,21,44,278,32,'#17364b65');
 polygon(g,[[-220,-44],[220,-44],[220,45],[-220,45]],'#835c67','#5c505f',5);
 for(let i=0;i<11;i++){
  const px=-191+i*36;
  rect(g,px,-27,22,58,'#ffcc7f');rect(g,px+3,-23,16,53,'#fff3c5');
  drawPath(g,[[px+11,-26],[px+11,30]],'#795765',2);
 }
 polygon(g,[[-248,-52],[-197,-146],[198,-146],[247,-52]],'#c6d4dc','#e6f9fa',8);
 for(let i=0;i<8;i++)drawPath(g,[[-191+i*55,-140],[-209+i*56,-61]],'#66869b',4);
 polygon(g,[[-92,-147],[0,-220],[95,-147]],'#c5e7e9','#f9ffff',8);
 rect(g,-58,-148,118,102,'#6d6774');
 g.beginPath();g.arc(0,-123,29,0,Math.PI*2);g.fillStyle='#f9e9c9';g.fill();g.strokeStyle='#b38b67';g.lineWidth=6;g.stroke();
 drawPath(g,[[0,-123],[0,-142],[15,-117]],'#65576b',4);
 polygon(g,[[-41,-44],[-41,43],[42,43],[42,-44]],'#415264','#e4ba8b',5);
 g.beginPath();g.arc(0,-37,41,Math.PI,0);g.strokeStyle='#ffe4a5';g.lineWidth=6;g.stroke();
 for(let i=0;i<12;i++)fillOval(g,-204+i*35,-46,4,4,i%3?'#ffe2a5':'#ff9da2');
 for(const xx of [-155,155]){rect(g,xx-9,-153,18,35,'#6c5b6b');fillOval(g,xx,-153,15,6,'#fffaff');}
 // Giant wreath around the station clock.
 g.beginPath();g.arc(0,-57,17,0,7);g.strokeStyle='#75b38a';g.lineWidth=10;g.stroke();
 polygon(g,[[-8,-63],[-25,-56],[-5,-42],[8,-63],[23,-56],[8,-42]],'#e95c72');
 g.restore();
}
function giftWarehouse(g,x,y,s=1){
 g.save();g.translate(x,y);g.scale(s,s);
 fillOval(g,8,33,170,24,'#1d364a64');
 polygon(g,[[-140,-58],[141,-58],[141,34],[-140,34]],'#984e58','#6a4b58',5);
 polygon(g,[[-162,-55],[0,-147],[162,-55],[145,-40],[0,-119],[-146,-38]],'#dfeef1','#f8ffff',8);
 for(let i=0;i<4;i++){rect(g,-121+i*75,-34,41,58,'#ffe0a0');rect(g,-113+i*75,-28,26,45,'#fff1ba');}
 rect(g,34,-45,100,77,'#644b56');rect(g,42,-38,84,64,'#3d4353');
 for(let i=0;i<7;i++)gift(g,49+(i%3)*25,26-Math.floor(i/3)*35,.5,['#d66e79','#91cca4','#d4b081'][i%3]);
 for(let i=0;i<6;i++)fillOval(g,-140+i*56,-49,4,4,i%2?'#f9d596':'#f6b2b8');
 g.restore();
}
function drawGiftStationBack(g){
 g.save();
 rect(g,0,0,1800,1100,'#adc6d5');
 for(let i=0;i<11;i++){
  const x=i*204-115;
  polygon(g,[[x,130],[x+91,-44],[x+175,108],[x+218,165]],i%2?'#7792b3':'#90a9c2');
  polygon(g,[[x+35,45],[x+91,-44],[x+127,25],[x+94,18]],'#e7f9ff');
 }
 for(let k=0;k<19;k++){
  const x=(k*231+53)%1800,y=205+(k*179)%890;
  fillOval(g,x,y,95+(k%3)*35,30+(k%4)*11,k%2?'#e3f8f569':'#effbfe6b');
 }
 // Frozen canyon across the yard. Gameplay road and bridge decks paint on top.
 polygon(g,[[0,660],[190,621],[360,710],[540,650],[760,740],[1000,705],[1215,792],[1420,758],[1600,856],[1800,820],[1800,1100],[0,1100]],'#719bb4');
 polygon(g,[[0,721],[180,670],[355,760],[570,707],[788,804],[984,771],[1240,850],[1408,823],[1610,914],[1800,865],[1800,1100],[0,1100]],'#457f9c');
 drawPath(g,[[0,776],[150,731],[400,811],[570,749],[800,852],[1000,826],[1280,908],[1430,863],[1690,952],[1800,926]],'#82dff0',27);
 drawPath(g,[[0,776],[150,731],[400,811],[570,749],[800,852],[1000,826],[1280,908],[1430,863],[1690,952],[1800,926]],'#c7f9ff',7,[41,38]);
 for(let k=0;k<42;k++){
  const x=rand(k*71+3)*1800,y=625+rand(k*29+25)*470;
  if(k%3===0)polygon(g,[[x-12,y+15],[x,y-25],[x+18,y+8],[x+7,y+27]],'#90e4f7','#d4ffff',2);
  else fillOval(g,x,y,9+(k%3)*5,4,'#e5ffff72');
 }
 // Raised train yard sidings and ties are distinct from the main path.
 railroad(g,[[320,166],[790,164],[1215,160],[1800,190]],1.15);
 railroad(g,[[400,185],[720,196],[1015,165],[1410,185]],.58);
 railroad(g,[[200,572],[435,520],[660,530]],.9);
 for(let i=0;i<220;i++){
  const x=rand(i*41+9)*1800,y=rand(i*13+77)*1100;
  fillOval(g,x,y,1+i%3,1.1,'#fffdfba1');
 }
 g.restore();return true;
}
function drawGiftStationDecor(g,map,pathDistance){
 if(map.id!=='christmas_station')return false;
 const open=(x,y,clear)=>pathDistance(map.path,x,y)>clear;
 g.save();
 // Station and parked train. The station's warm copper/amber detailing is
 // unique to this chapter, entirely unlike the frozen village cabins.
 stationHall(g,1460,164,1.02);
 steamTrain(g,860,126,.67);
 giftWarehouse(g,1515,535,.75);
 giftWarehouse(g,490,150,.50);
 // Railyard water tower and rotating steel turntable.
 const cx=420,cy=610;
 if(open(cx,cy,105)){
  fillOval(g,cx,cy,103,38,'#293f5e76');
  g.beginPath();g.ellipse(cx,cy,79,31,-.2,0,7);g.strokeStyle='#ebccaa';g.lineWidth=9;g.stroke();
  drawPath(g,[[cx-72,cy+16],[cx+72,cy-16]],'#7c5b57',12);
  drawPath(g,[[cx-72,cy+16],[cx+72,cy-16]],'#a4b7bb',4);
 }
 for(let i=0;i<5;i++){
  const x=140+i*28,y=560;
  if(open(x,y,110)){rect(g,x,y-102,9,111,'#5a545b');}
 }
 fillOval(g,238,448,53,13,'#35576a74');
 rect(g,211,356,52,87,'#856856');
 fillOval(g,237,359,48,23,'#c9a980');
 fillOval(g,237,344,43,12,'#eef9ff');
 const props=[[130,535],[655,104],[850,385],[1110,670],[1430,710],[1742,510],[300,1030]];
 props.forEach(([x,y],i)=>{if(open(x,y,90))signal(g,x,y,.78+i%3*.13);});
 const lamps=[[120,380],[350,310],[660,310],[880,380],[1050,475],[1300,570],[1480,890],[650,890]];
 for(const [x,y] of lamps)if(open(x,y,55))lantern(g,x,y,.82);
 for(let i=0;i<75;i++){
  const x=35+rand(i*19+12)*1720,y=95+rand(i*37+4)*954;
  if(open(x,y,115)&&Math.hypot(x-1460,y-164)>300&&Math.hypot(x-1515,y-535)>215){
   if(i%9===0)gift(g,x,y,.38+i%3*.13,i%2?'#de6e80':'#69a98b');
   else snowPine(g,x,y,.35+i%5*.075,i%4===0);
  }
 }
 for(const [x,y] of [[170,860],[1060,910],[1590,790]])icyCliff(g,x,y,140);
 // Gilded barriers distinguish the playable stone bridge from icy water.
 for(let k=2;k<map.path.length;k++){
  const [ax,ay]=map.path[k-1],[bx,by]=map.path[k];
  if((ay+by)/2<730||(ay+by)/2>940||k%3!==0)continue;
  const dx=bx-ax,dy=by-ay,len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len;
  drawPath(g,[[ax+nx*47,ay+ny*47],[bx+nx*47,by+ny*47]],'#f2e4b6',5,[27,15]);
 }
 g.restore();return true;
}
function iceCandy(g,x,y,s=1){
 g.save();g.translate(x,y);g.scale(s,s);
 fillOval(g,5,10,34,10,'#5f35434d');
 // Candy cane poles edged with icing.
 drawPath(g,[[0,13],[0,-73],[13,-90],[29,-83],[32,-69]],'#fff5ee',17);
 drawPath(g,[[0,13],[0,-73],[13,-90],[29,-83],[32,-69]],'#ed6478',7,[14,13]);
 g.restore();
}
function gumdrop(g,x,y,r=13,c='#f4a0ac'){
 fillOval(g,x,y+5,r*1.25,r*.42,'#814a596a');
 g.beginPath();g.arc(x,y,r,Math.PI,0);g.lineTo(x+r,y+6);g.lineTo(x-r,y+6);g.closePath();
 g.fillStyle=c;g.fill();g.strokeStyle='#ffffffbf';g.lineWidth=2;g.stroke();
 fillOval(g,x-r*.25,y-r*.45,3,2,'#fff8ecaa');
}
function candyFir(g,x,y,s=1){
 g.save();g.translate(x,y);g.scale(s,s);
 fillOval(g,3,18,46,12,'#6d3e4777');
 rect(g,-8,-23,16,42,'#86604f');
 for(let i=0;i<4;i++){
  const w=45-i*7,y=5-i*28;
  polygon(g,[[-w,y],[0,-105-i*7],[w,y]],i%2?'#69a26c':'#4a925e','#3c745e',2);
  drawPath(g,[[-w+7,y-8],[0,-105-i*7],[w-6,y-8]],'#faf6e6',6);
  for(let k=0;k<3;k++)fillOval(g,-w*.65+k*w*.67,y-10,4.1,4.1,['#ffc672','#f5a8a5','#b6e6ce'][k]);
 }
 polygon(g,[[0,-149],[9,-133],[27,-130],[12,-118],[16,-101],[0,-111],[-17,-101],[-12,-118],[-27,-130],[-9,-133]],'#ffeda8','#ecc17a',2);
 g.restore();
}
function gingerHome(g,x,y,s=1){
 g.save();g.translate(x,y);g.scale(s,s);
 fillOval(g,8,21,99,24,'#58364a7a');
 polygon(g,[[-75,-46],[78,-46],[78,24],[-75,24]],'#ac714f','#714d4b',5);
 polygon(g,[[-88,-39],[0,-128],[91,-39],[72,-26],[0,-98],[-73,-26]],'#694254','#f9f3e8',9);
 polygon(g,[[-82,-42],[0,-121],[85,-42],[71,-28],[0,-101],[-69,-27]],'#b77959','#fff7e6',4);
 drawPath(g,[[-86,-40],[0,-125],[88,-39]],'#fffaf0',11);
 for(let i=0;i<5;i++)fillOval(g,-67+i*33,-43,5,4,['#f87994','#b0e5aa','#ffe1a0'][i%3]);
 for(const dx of [-51,32]){rect(g,dx,-24,30,37,'#ffe3a6');drawPath(g,[[dx+15,-24],[dx+15,13]],'#fff8e6',3);}
 rect(g,-13,-31,28,55,'#704653');drawPath(g,[[-13,3],[15,3]],'#fff8e6',4);
 drawPath(g,[[-68,6],[-48,8],[-26,4]],'#fffcf0',6);
 g.restore();
}
function waffleBridge(g,x,y,s=1){
 g.save();g.translate(x,y);g.scale(s,s);
 fillOval(g,0,12,102,20,'#5d2e3d99');
 polygon(g,[[-105,-21],[0,-52],[103,-21],[103,27],[0,-3],[-105,27]],'#ce9a5b','#fff1c8',5);
 for(let i=0;i<9;i++)drawPath(g,[[-90+i*22,-18+i%2*1],[-90+i*22,17]],'#875b45',2);
 for(let i=0;i<3;i++)drawPath(g,[[-94,-15+i*14],[96,-15+i*14]],'#f7cc88',2);
 drawPath(g,[[-103,-21],[0,-52],[105,-21]],'#fff8e7',7);
 g.restore();
}
function gingerPalace(g,x,y,s=1){
 g.save();g.translate(x,y);g.scale(s,s);
 fillOval(g,17,65,265,42,'#5b364d78');
 // Layered gingerbread castle, icing bastions and glowing peppermint windows.
 polygon(g,[[-216,-131],[213,-131],[227,62],[-222,62]],'#bf8059','#754d48',7);
 for(let k=0;k<8;k++){
  const xx=-206+k*60;
  rect(g,xx,-168,38,45,'#dba57b');rect(g,xx+3,-168,32,13,'#f8fbf3');
  fillOval(g,xx+19,-159,14,6,'#f5fbf2');
 }
 for(const xx of [-185,-102,103,185]){
  rect(g,xx-23,-222,46,276,'#bf875f');rect(g,xx-29,-68,58,120,'#dba47e');
  polygon(g,[[xx-35,-222],[xx,-283],[xx+35,-222]],'#80534f','#fff8ef',6);
  drawPath(g,[[xx-28,-217],[xx,-268],[xx+28,-217]],'#f7fffa',7);
  fillOval(g,xx,-203,10,16,'#ffdda0');
  rect(g,xx-15,-74,30,33,'#ffe6aa');
 }
 rect(g,-86,-184,173,245,'#a86c53');
 polygon(g,[[-110,-174],[0,-260],[112,-174]],'#865447','#fff7e9',8);
 polygon(g,[[-90,-174],[0,-241],[90,-174]],'#a66e54','#ffe6dd',5);
 for(const xx of [-54,54]){rect(g,xx-15,-144,30,47,'#ffe4a2');drawPath(g,[[xx,-141],[xx,-104]],'#fff1c5',3);}
 polygon(g,[[-42,61],[-42,-32],[0,-77],[42,-32],[42,61]],'#7a4d4d','#ffe1bb',7);
 polygon(g,[[-34,61],[-34,-21],[0,-59],[34,-21],[34,61]],'#ffd49b','#fff4cb',4);
 for(let k=0;k<14;k++)fillOval(g,-194+k*30,-130,5.5,5.5,['#e97587','#a4d999','#ffe2a2'][k%3]);
 polygon(g,[[-16,-285],[0,-319],[17,-285]],'#e7ba84','#fff1de',5);
 drawPath(g,[[0,-320],[0,-354]],'#654f53',6);
 polygon(g,[[0,-352],[30,-344],[0,-337]],'#e86d7e');
 for(const xx of [-180,180]){drawPath(g,[[xx,-282],[xx,-313]],'#704d53',4);polygon(g,[[xx,-313],[xx+24,-306],[xx,-300]],'#f48d97');}
 g.restore();
}
function gingerGate(g,x,y,s=1){
 g.save();g.translate(x,y);g.scale(s,s);
 fillOval(g,0,17,113,26,'#633b4d87');
 polygon(g,[[-104,32],[-98,-58],[-59,-112],[62,-112],[105,-52],[106,35]],'#c89267','#fff3d8',7);
 g.beginPath();g.arc(0,0,58,Math.PI,0);g.strokeStyle='#fff7e9';g.lineWidth=18;g.stroke();
 polygon(g,[[-70,34],[-70,-22],[0,-72],[70,-22],[70,34]],'#513641','#f9dfb5',7);
 fillOval(g,0,-5,49,63,'#3e303b');
 for(let i=0;i<9;i++)gumdrop(g,-86+i*21,-72-(i%4)*10,7,['#e98c9a','#a5d6ad','#f7d88c'][i%3]);
 g.restore();
}
function drawGingerbreadBack(g){
 g.save();rect(g,0,0,1800,1100,'#d4b89d');
 for(let k=0;k<13;k++){
  const x=k*165-130;
  polygon(g,[[x,135],[x+64,-40],[x+160,96],[x+195,151]],k%2?'#a98291':'#c1948e');
  polygon(g,[[x+30,63],[x+64,-40],[x+99,50],[x+64,22]],'#ffeadb');
 }
 for(let i=0;i<19;i++){
  const x=(i*199+30)%1850,y=240+(i*83)%830;
  fillOval(g,x,y,103+(i%4)*25,35+(i%3)*9,i%2?'#ffe7d0aa':'#f9dbc4ad');
 }
 // A real chocolate river with vanilla foam and sprinkled islands.
 polygon(g,[[0,662],[194,612],[398,699],[608,680],[847,747],[1044,704],[1320,797],[1570,754],[1800,842],[1800,1100],[0,1100]],'#875d67');
 polygon(g,[[0,715],[190,664],[412,766],[622,737],[850,818],[1050,769],[1310,859],[1570,816],[1800,897],[1800,1100],[0,1100]],'#583b4d');
 drawPath(g,[[0,762],[210,709],[410,811],[616,785],[865,860],[1062,819],[1315,908],[1570,851],[1800,932]],'#a46b60',28);
 drawPath(g,[[0,761],[210,708],[410,809],[616,784],[865,858],[1062,817],[1315,907],[1570,849],[1800,929]],'#f2c0a0',5,[34,24]);
 for(let i=0;i<90;i++){
  const x=rand(i*83+16)*1800,y=680+rand(i*37+26)*430;
  fillOval(g,x,y,8+(i%5)*6,3+(i%3)*2,i%4===0?'#ffe7c4ab':'#8c5c5e');
 }
 for(let i=0;i<250;i++){
  const x=rand(i*59+12)*1800,y=rand(i*43+23)*1100;
  fillOval(g,x,y,1+i%3,1,'#fff7ed88');
 }
 // Stacked chocolate wafer terraces on kingdom edges.
 for(let i=0;i<11;i++){
  const x=i*170-90,y=105+(i%3)*16;
  polygon(g,[[x,y],[x+85,y-55],[x+168,y-29],[x+160,y+35],[x+73,y+53]],i%2?'#aa7568':'#c69a80');
  drawPath(g,[[x+5,y],[x+85,y-54],[x+160,y-28]],'#fff3e1',9);
 }
 g.restore();return true;
}
function drawGingerbreadDecor(g,map,pathDistance){
 if(map.id!=='christmas_kingdom')return false;
 const open=(x,y,clear)=>pathDistance(map.path,x,y)>clear;
 g.save();
 // Main palace and cookie centerpiece deliberately sit within inside bends,
 // while enemies still follow their own 4.2km cookie road.
 gingerPalace(g,1505,233,.83);
 const cx=920,cy=460;
 if(open(cx,cy,110)){
  fillOval(g,cx,cy+16,103,93,'#ae6d56');
  fillOval(g,cx,cy,97,91,'#f8edcf');
  fillOval(g,cx,cy,80,76,'#c58b60');
  g.beginPath();g.arc(cx,cy,79,0,7);g.strokeStyle='#fff8ec';g.lineWidth=6;g.setLineDash([6,8]);g.stroke();g.setLineDash([]);
  // Smiling mascot cookie on the central sugar-plaza medallion.
  fillOval(g,cx,cy,31,45,'#a76d4f');
  for(const [x,y] of [[-37,-17],[37,-17],[-27,32],[27,32]])fillOval(g,cx+x,cy+y,17,12,'#a76d4f');
  for(const x of [-11,11])fillOval(g,cx+x,cy-10,5,5,'#fff2df');
  drawPath(g,[[cx-16,cy+2],[cx,cy+12],[cx+16,cy+2]],'#fff9eb',5);
  for(const y of [19,34])fillOval(g,cx,cy+y,4,4,y===19?'#e97782':'#9bdd93');
 }
 // Waffle-arched chocolate bridges; decorative (non-blocking) over the river.
 for(const [x,y,s] of [[215,720,.72],[1045,848,.75],[1600,853,.78]])
  if(open(x,y,55))waffleBridge(g,x,y,s);
 const villages=[[380,154,.7],[700,160,.7],[280,612,.67],[1285,550,.75],[1675,565,.62],[1160,1030,.65],[165,950,.61]];
 for(const [x,y,s] of villages)if(open(x,y,115))gingerHome(g,x,y,s);
 for(let i=0;i<94;i++){
  const x=40+rand(i*67+9)*1700,y=110+rand(i*23+31)*930;
  if(!open(x,y,108)||Math.hypot(x-1505,y-233)<290||Math.hypot(x-920,y-460)<130)continue;
  if(i%7===0)iceCandy(g,x,y,.45+(i%4)*.1);
  else if(i%5===0)gumdrop(g,x,y,9+(i%5)*3,['#e87894','#a4dba5','#ffe1a9'][i%3]);
  else candyFir(g,x,y,.3+(i%6)*.075);
 }
 const lights=[[190,335],[450,300],[750,470],[1100,360],[1150,585],[690,820],[1320,730],[1590,820]];
 for(const [x,y] of lights)if(open(x,y,62))lantern(g,x,y,.85,'#ffd6a3');
 // Gingerbread icing piping follows the exact play route, lightly enough
 // to retain unit silhouettes and tower placement feedback.
 g.beginPath();map.path.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));
 g.strokeStyle='#fff9ea9e';g.lineWidth=3;g.lineJoin='round';
 g.setLineDash([5,17]);g.stroke();g.setLineDash([]);
 gingerGate(g,53,290,.85);
 gingerGate(g,1730,972,.88);
 // Exaggerated festive candy and cake landmarks for high-angle readability.
 for(const [x,y,r] of [[85,950,43],[1720,460,60],[1720,1010,37]])if(open(x,y,80)){
  fillOval(g,x,y,r*1.3,r*.40,'#603a4c99');
  fillOval(g,x,y-r*.35,r,r*.6,'#eac49f');
  fillOval(g,x,y-r*.59,r*.87,r*.32,'#fff8f0');
  fillOval(g,x,y-r*.95,r*.16,r*.16,'#e96b79');
 }
 g.restore();return true;
}
export function drawHolidayMapBack(g,map){
 return map.id==='christmas_station'?drawGiftStationBack(g):
   map.id==='christmas_kingdom'?drawGingerbreadBack(g):false;
}
export function drawHolidayMapDecor(g,map,pathDistance){
 return map.id==='christmas_station'?drawGiftStationDecor(g,map,pathDistance):
   map.id==='christmas_kingdom'?drawGingerbreadDecor(g,map,pathDistance):false;
}
const svgPath=map=>map.path.map(([x,y],i)=>(i?'L':'M')+(x/1800*800).toFixed(1)+' '+(205+y/1100*245).toFixed(1)).join(' ');
const svgFir=(x,y,s)=>'<g transform="translate('+x+' '+y+') scale('+s+')"><path d="M-8 6h16v19H-8Z" fill="#876e6e"/><path d="M0-101L-27-51h12l-30 48H45L15-51h12Z" fill="#397a81" stroke="#e3f8fc" stroke-width="6"/><path d="M0-101V-4h45L15-51h12Z" fill="#376b76"/><path d="M-19-49L0-96l22 47m-49 34L0-71l29 54" fill="none" stroke="#f6faff" stroke-width="5"/></g>';
const svgGift=(x,y,s=1)=>'<g transform="translate('+x+' '+y+') scale('+s+')"><path d="M-21-22H21V23H-21Z" fill="#cb5e74" stroke="#f5d8bb" stroke-width="3"/><path d="M-25-26H25V-16H-25ZM-5-26H6V23H-5Z" fill="#ffdaa3"/><path d="M0-27q-25-26-20-8T0-27q26-24 20-7T0-27" fill="none" stroke="#fff3de" stroke-width="4"/></g>';
const svgLamp=(x,y,s=1)=>'<g transform="translate('+x+' '+y+') scale('+s+')"><path d="M0 5V-43l9-5" fill="none" stroke="#475568" stroke-width="5"/><path d="M3-60H26V-42H3Z" fill="#ffdc99" stroke="#6c6676" stroke-width="4"/><path d="M0-60l14-13 16 13" fill="#677184"/></g>';
export function holidayMapPreview(map){
 if(!HOLIDAY_EXTRA_MAPS.includes(map.id))return null;
 const station=map.id==='christmas_station',route=svgPath(map);
 const background=station
  ?'<rect width="800" height="480" fill="#9cbdd7"/><path d="M0 219L78 63 169 192 262 46 358 212 467 80 575 218 693 40 800 174V480H0Z" fill="#7894b5"/><path d="M0 219L78 63 109 119 79 110 55 169 169 192 262 46 290 119 261 102 225 155 358 212 467 80 496 145 468 127 429 182 575 218 693 40 737 132 690 116 657 164 800 174" fill="#f1f9fb"/><path d="M0 280Q135 225 270 280Q475 220 800 285V480H0Z" fill="#b5d3dc"/><path d="M0 347q88-51 178 9t157 0t176 15t156-9t133 19v99H0Z" fill="#678fab"/><path d="M0 390q88-43 177 6t155 0t184 10t164-8t120 16" fill="none" stroke="#99eefc" stroke-width="21"/>'
  :'<rect width="800" height="480" fill="#f6c9ae"/><path d="M0 211L83 93 162 188 277 73 361 213 460 91 561 209 677 65 800 181V480H0Z" fill="#b08792"/><path d="M0 212L83 93 112 144 83 122 58 163 162 188 277 73 311 143 277 124 248 166 361 213 460 91 488 146 463 133 425 174 561 209 677 65 714 137 676 119 652 167 800 181" fill="#fff2eb"/><path d="M0 269Q165 221 311 291Q488 205 800 280V480H0Z" fill="#d9b7a3"/><path d="M0 349Q134 315 245 360t186 2t179 22t190-17v113H0Z" fill="#805461"/><path d="M0 389Q155 351 290 403T569 398t231 22" fill="none" stroke="#c58d76" stroke-width="22"/><path d="M0 392Q155 357 290 404T569 400t231 21" fill="none" stroke="#f8d2ae" stroke-width="4" stroke-dasharray="15 15"/>';
 const trees=Array.from({length:station?30:17},(_,i)=>{
  const x=20+(i*133+23)%765,y=210+(i*77+11)%259,s=.38+(i%4)*.11;
  return station?svgFir(x,y,s):
   '<g transform="translate('+x+' '+y+') scale('+s+')"><path d="M0-84l-38 56h17L-48 10h96L21-28h17Z" fill="#4a936c" stroke="#fff4e8" stroke-width="7"/><circle cy="-87" r="7" fill="#f9e2a1"/><circle cx="-17" cy="-25" r="7" fill="#f88fa1"/><circle cx="17" cy="-31" r="7" fill="#ffe7ac"/></g>';
 }).join('');
 const railway=station?'<path d="M110 238L335 203 800 211M136 255L365 223 800 233" fill="none" stroke="#5d6776" stroke-width="6" stroke-dasharray="6 12"/>'
  +'<path d="M110 249L335 211 800 220" fill="none" stroke="#cfaf8c" stroke-width="5"/>':'';
 const main=station
  ?'<g transform="translate(585 174)"><ellipse cy="47" rx="163" ry="22" fill="#34506e70"/><path d="M-158-25h319v72h-319Z" fill="#9b6974" stroke="#e7b793" stroke-width="4"/><path d="M-176-25l55-78H116l62 78Z" fill="#dfedf2" stroke="#fff" stroke-width="7"/><path d="M-83-103L0-177l85 74Z" fill="#c3dbe6" stroke="#f3fdff" stroke-width="7"/><circle cy="-111" r="27" fill="#fff1ca" stroke="#c19477" stroke-width="5"/><path d="M0-111v-15m0 15 13 5" stroke="#8c6476" stroke-width="4"/><path d="M-36 2h71v45h-71Z" fill="#5b566b" stroke="#ffe2aa" stroke-width="4"/>'
   +Array.from({length:7},(_,i)=>'<rect x="'+(-149+i*45)+'" y="-15" width="25" height="47" fill="#ffe0a5" stroke="#a06e70" stroke-width="3"/>').join('')
   +'<circle cy="-39" r="17" fill="none" stroke="#7fbc95" stroke-width="9"/><path d="M-17-42L0-29l17-13" fill="#e86b7a"/></g>'
   +'<g transform="translate(275 194)"><rect x="-100" y="-39" width="125" height="42" fill="#a44c5a" stroke="#e8b57e" stroke-width="5"/><circle cx="-72" cy="6" r="10" fill="#445166"/><circle cx="-9" cy="6" r="10" fill="#445166"/><rect x="-80" y="-63" width="40" height="32" fill="#c45662"/><rect x="16" y="-29" width="147" height="31" fill="#bd5860" stroke="#efce94" stroke-width="4"/>'
   +Array.from({length:5},(_,i)=>svgGift(27+i*27,-34,.46)).join('')
   +'<path d="M-55-64q-8-23-25-36m38 28q-6-16-25-27" stroke="#fff8f3ab" stroke-width="12" fill="none"/></g>'
   +'<g transform="translate(690 335) scale(.61)"><path d="M-92-5H95v104H-92Z" fill="#a5525b" stroke="#f5dbc2" stroke-width="7"/><path d="M-108-6L0-87 112-6Z" fill="#e7f5f4" stroke="#fffdf2" stroke-width="8"/><rect x="-22" y="40" width="53" height="59" fill="#ffdaa3"/></g>'
  :'<g transform="translate(565 169)"><ellipse cy="56" rx="164" ry="22" fill="#69435366"/><path d="M-167-84h333v139h-333Z" fill="#c88c66" stroke="#fff4e2" stroke-width="7"/>'
   +Array.from({length:6},(_,i)=>'<g transform="translate('+(-150+i*59)+' -30)"><rect width="38" height="82" fill="#d69d75" stroke="#f7ede3" stroke-width="4"/><path d="M-8 0L19-63 46 0Z" fill="#8a5553" stroke="#f4f7ef" stroke-width="6"/></g>').join('')
   +'<path d="M-104-87L0-176 108-87Z" fill="#9d6c56" stroke="#f8f4e9" stroke-width="10"/><path d="M-68 54V-15q70-72 137 0v69Z" fill="#663f52" stroke="#ffe1b6" stroke-width="6"/><path d="M-45 54V-10Q0-62 45-10v64Z" fill="#ffe0a6" stroke="#fff6d4" stroke-width="6"/>'
   +'<path d="M0-174v-28m-28 0 28 9 25-9" stroke="#e87789" stroke-width="8"/></g>'
   +'<g transform="translate(366 345)"><circle r="60" fill="#f8e8cc" stroke="#c38d64" stroke-width="8"/><circle r="46" fill="#bd855b"/><circle cx="-15" cy="-13" r="5" fill="#fff0e0"/><circle cx="15" cy="-13" r="5" fill="#fff0e0"/><path d="M-20 4q20 21 40 0" stroke="#fff5e8" stroke-width="5" fill="none"/></g>';
 const routePaint=station?['#52627b','#f3d9ac','#fff2d7']:['#8d5360','#d59a68','#fff8df'];
 const path='<path d="'+route+'" fill="none" stroke="'+routePaint[0]+'" stroke-width="29" stroke-linejoin="round" stroke-linecap="round"/>'
  +'<path d="'+route+'" fill="none" stroke="'+routePaint[1]+'" stroke-width="21" stroke-linejoin="round" stroke-linecap="round"/>'
  +'<path d="'+route+'" fill="none" stroke="'+routePaint[2]+'" stroke-width="2.4" stroke-dasharray="'+(station?'11 13':'4 11')+'" opacity=".83"/>';
 const gifts=Array.from({length:station?18:13},(_,i)=>svgGift((i*137+29)%770,250+(i*51)%200,.34+(i%3)*.1)).join('');
 const glowing=Array.from({length:20},(_,i)=>'<circle cx="'+(i*127+21)%800+'" cy="'+(i*167+17)%470+'" r="'+(i%4+1)+'" fill="'+(station?'#f6fcff':'#fff5e6')+'" opacity=".8"/>').join('');
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" aria-hidden="true" data-biome-art="'+map.id+'">'
  +'<defs><linearGradient id="holiday-'+map.id+'" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+(station?'#5d7799':'#f4b8a9')+'"/><stop offset=".7" stop-color="'+(station?'#bfdce3':'#eed0aa')+'"/><stop offset="1" stop-color="'+(station?'#7eabc8':'#c68f81')+'"/></linearGradient></defs>'
  +background+railway+trees+path+main+gifts
  +Array.from({length:8},(_,i)=>svgLamp(34+(i*115)%755,272+(i*47)%160,.43)).join('')
  +glowing+'</svg>';
}
