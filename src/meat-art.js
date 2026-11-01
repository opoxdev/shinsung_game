// Original stylized horror-fantasy art for the Meat Lord challenge pack.
// Portraits are standalone SVG; battle plates are drawn once into the enemy raster cache.
export const MEAT_MONSTERS=Object.freeze(['meatling','stitched_brute','flesh_nest','gore_wagon','meat_lord']);
const DETAILS={
  meatling:{
    name:'고깃덩이',
    body:'<path d="M24 126Q9 104 30 75Q48 51 74 63Q103 55 128 82Q147 109 130 133Q116 153 78 149Q39 152 24 126Z" fill="url(#flesh)" stroke="#412737" stroke-width="5"/><path d="M27 99L12 82L31 86L43 67L49 91M111 80L132 61L129 89L148 100L128 106" fill="#ead9bf" stroke="#593947" stroke-width="4"/><path d="M39 143L34 158L57 158L67 146M101 147L104 161L128 156L126 137" fill="#865467" stroke="#432b3c" stroke-width="4"/><path d="M52 96Q79 70 110 96Q106 118 78 126Q55 121 52 96Z" fill="#753a54" stroke="#54283d" stroke-width="4"/><ellipse cx="61" cy="94" rx="8" ry="9" fill="#ffe5ac"/><ellipse cx="98" cy="97" rx="9" ry="10" fill="#ffe5ac"/><circle cx="62" cy="95" r="3" fill="#3a273b"/><circle cx="98" cy="98" r="3" fill="#3a273b"/><path d="M67 112Q80 121 94 110M69 112l6 8 7-7 6 7 5-9" fill="none" stroke="#ebd4ba" stroke-width="3"/><path d="M41 118q6 8 14 6m51-8q10 5 15-5" fill="none" stroke="#f4a7a5" stroke-width="4"/>'
  },
  stitched_brute:{
    name:'봉합 거한',
    body:'<path d="M24 67L7 107L22 143L42 140L53 104M128 68L152 118L137 149L116 139L107 104" fill="#a96a70" stroke="#40273b" stroke-width="6"/><path d="M39 66Q24 82 35 116L30 143L60 146L76 128L90 150L131 146L120 113Q136 81 111 61Z" fill="url(#flesh)" stroke="#44293b" stroke-width="6"/><path d="M55 133L48 169L69 172L79 144M95 138L99 169L125 170L117 131" fill="#754054" stroke="#44293b" stroke-width="5"/><path d="M58 55Q54 25 84 27Q113 23 116 59L109 89L69 91Z" fill="#b58186" stroke="#41273d" stroke-width="5"/><path d="M64 39L100 32L113 46L111 57L64 56Z" fill="#673649"/><path d="M47 69L114 111M109 68L53 112" fill="none" stroke="#69394d" stroke-width="4"/><path d="M49 69l10 17m3-14 9 17m2-14 7 15m1-12 7 15m2-12 7 17m5-9 7 18" stroke="#efcbad" stroke-width="3"/><path d="M63 63L77 60M94 61L108 64" stroke="#ffe1aa" stroke-width="7"/><path d="M74 78q13 6 24-3" fill="none" stroke="#492638" stroke-width="4"/><path d="M20 126l-11 9 19 11 12-10M132 131l17 8-14 16-12-9" fill="#ead5b5" stroke="#593b43" stroke-width="4"/>'
  },
  flesh_nest:{
    name:'살점 둥지',
    body:'<path d="M45 62Q34 39 48 24L68 53L92 18L101 54L122 32L122 66Q148 98 134 131L117 155L43 153Q15 129 24 92Z" fill="url(#flesh)" stroke="#43283d" stroke-width="6"/><path d="M36 121L17 146L38 137L43 160L55 144M111 140L131 163L132 137L148 145L131 115" fill="#b46b85" stroke="#503047" stroke-width="4"/><ellipse cx="79" cy="107" rx="47" ry="44" fill="#73364d" stroke="#e49a9e" stroke-width="5"/><ellipse cx="61" cy="94" rx="18" ry="22" fill="#e19b9e" stroke="#4b293e" stroke-width="4"/><ellipse cx="101" cy="99" rx="17" ry="22" fill="#cd8496" stroke="#4b293e" stroke-width="4"/><ellipse cx="82" cy="124" rx="24" ry="20" fill="#bd687b" stroke="#4b293e" stroke-width="4"/><ellipse cx="61" cy="95" rx="7" ry="9" fill="#ffe9bd"/><ellipse cx="101" cy="100" rx="6" ry="9" fill="#ffe9bd"/><ellipse cx="82" cy="123" rx="10" ry="7" fill="#f5c9ae"/><path d="M45 66Q82 48 118 69M45 145Q80 167 118 145" fill="none" stroke="#f5b2aa" stroke-width="4" stroke-dasharray="7 9"/><path d="M37 91l-13-10m109 17 17-11" stroke="#e7d5b9" stroke-width="6"/>'
  },
  gore_wagon:{
    name:'육괴 수레',
    body:'<path d="M20 88L29 48L47 52L54 35L68 54L102 37L111 59L133 55L143 109L129 137L27 137Z" fill="url(#flesh)" stroke="#40263a" stroke-width="6"/><path d="M20 96H140L133 132H27Z" fill="#5b3349" stroke="#362336" stroke-width="6"/><circle cx="38" cy="145" r="23" fill="#473047" stroke="#e1b8a7" stroke-width="5"/><circle cx="119" cy="145" r="23" fill="#473047" stroke="#e1b8a7" stroke-width="5"/><circle cx="38" cy="145" r="9" fill="#d49c97"/><circle cx="119" cy="145" r="9" fill="#d49c97"/><path d="M24 111h112M48 100V130M78 100V134M108 100V132" stroke="#d6b19f" stroke-width="6"/><path d="M54 75Q79 45 109 77L104 100L56 100Z" fill="#7b3b53" stroke="#4a2939" stroke-width="4"/><path d="M60 83l7-13 8 13 8-15 9 15 7-13 6 13" fill="none" stroke="#f4dcbf" stroke-width="5"/><path d="M67 90h10m15 0h10" stroke="#ffd9b2" stroke-width="7"/><path d="M35 82L16 63M125 78L146 62" stroke="#edcfb0" stroke-width="7"/><path d="M43 43Q29 23 16 41M110 38q22-20 32-2" fill="none" stroke="#ad5973" stroke-width="7"/>'
  },
  meat_lord:{
    name:'고기군주',
    body:'<path d="M40 49L9 109L24 151L48 133L56 95M119 48L151 109L136 157L113 129L102 94" fill="#8c455c" stroke="#41263b" stroke-width="7"/><path d="M41 77Q14 108 25 171L63 166L83 132L103 172L141 166Q145 111 119 73Z" fill="#533048" stroke="#40243a" stroke-width="6"/><path d="M43 76Q52 52 73 54L102 54Q120 59 124 83L116 132L97 140L75 125L56 138L43 116Z" fill="url(#flesh)" stroke="#3b2335" stroke-width="6"/><path d="M54 139L49 174L76 177L87 139M97 142L99 176L129 173L117 131" fill="#61334a" stroke="#3b2337" stroke-width="6"/><path d="M55 65L45 32L59 37L65 13L82 29L100 11L108 34L125 26L117 68Z" fill="#e4c7a5" stroke="#553344" stroke-width="6"/><path d="M66 47Q83 30 106 50L111 81L96 99L67 96L57 77Z" fill="#bd8082" stroke="#432639" stroke-width="5"/><path d="M64 68l14-3m15 0 13 3" stroke="#ffe0a9" stroke-width="8"/><path d="M74 85Q89 95 102 84M77 89l3 7 7-5 7 5 6-10" stroke="#49273d" stroke-width="4" fill="none"/><path d="M64 107l14-17 13 9 16-9 12 14-16 23-13-14-13 15Z" fill="#652d46" stroke="#f0aeaa" stroke-width="4"/><path d="M76 106l6 9 9-7 9 8 7-9M80 117l10 10 10-10" fill="none" stroke="#f7d7bd" stroke-width="4"/><path d="M15 137l-10 19 20 9 16-17M142 139l16 17-18 11-16-17" fill="#dec4ac" stroke="#4a293c" stroke-width="5"/><path d="M40 49L26 22M120 50L145 18" stroke="#f0d8ba" stroke-width="7"/>'
  }
};
export function meatMonsterPortrait(type){
  const d=DETAILS[type];if(!d)return null;
  const id='meat-'+type;
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 188" role="img" aria-label="'+d.name+'" data-meat-creature="'+type+'" data-silhouette="'+type+'">'+
    '<defs><linearGradient id="flesh" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e7a6a1"/><stop offset=".48" stop-color="#b76178"/><stop offset="1" stop-color="#70394f"/></linearGradient></defs>'+
    '<ellipse cx="80" cy="174" rx="61" ry="9" fill="#21142d" opacity=".35"/>'+
    '<path d="M37 150Q24 136 37 122M120 153Q143 137 131 119" fill="none" stroke="#a45f81" stroke-width="4" stroke-linecap="round"/>'+
    d.body+'</svg>';
}
// Coordinates match enemy-art.js's 144x176 static plate (-72..72, -124..52).
export function drawMeatPlate(g,type){
  if(!DETAILS[type])return false;
  const ink='#43283b',bone='#f3dbb8',flesh='#b76779',dark='#713950';
  const path=(points,fill,stroke=ink,width=3)=>{
    g.beginPath();g.moveTo(...points[0]);for(const p of points.slice(1))g.lineTo(...p);
    g.closePath();g.fillStyle=fill;g.fill();g.strokeStyle=stroke;g.lineWidth=width;g.stroke();
  };
  const oval=(x,y,rx,ry,color,stroke=ink,width=3)=>{
    g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fillStyle=color;g.fill();
    if(width){g.strokeStyle=stroke;g.lineWidth=width;g.stroke();}
  };
  const curve=(x1,y1,cx,cy,x2,y2,color=bone,width=3)=>{
    g.beginPath();g.moveTo(x1,y1);g.quadraticCurveTo(cx,cy,x2,y2);
    g.strokeStyle=color;g.lineWidth=width;g.stroke();
  };
  const stitch=(x1,y1,x2,y2,n=6)=>{
    curve(x1,y1,(x1+x2)/2+5,(y1+y2)/2-4,x2,y2,'#63334b',4);
    for(let i=0;i<=n;i++){const t=i/n,x=x1+(x2-x1)*t,y=y1+(y2-y1)*t;curve(x-5,y-4,x,y,x+5,y+4,'#f3ceb4',2.4);}
  };
  g.save();g.lineJoin='round';g.lineCap='round';
  oval(2,17,37,10,'#24162d55',ink,0);
  if(type==='meatling'){
    path([[-23,-7],[-28,15],[-9,17],[-2,2],[17,0],[21,17],[35,12],[27,-12]],'#7b455b');
    path([[-33,-44],[-49,-31],[-38,-16],[-39,1],[-17,9],[8,7],[31,-4],[38,-25],[23,-43],[4,-57],[-15,-53]],flesh);
    path([[-22,-47],[-32,-64],[-13,-56]],bone);
    path([[19,-45],[32,-64],[31,-35]],bone);
    oval(-11,-31,9,10,'#f5d4ab');oval(15,-32,10,9,'#f5d4ab');
    oval(-9,-31,3,5,'#422639',ink,0);oval(16,-32,3,5,'#422639',ink,0);
    curve(-13,-12,0,-4,17,-13,bone,4);stitch(-29,-14,-14,-2,3);
  }else if(type==='stitched_brute'){
    path([[-21,-9],[-30,19],[-5,20],[3,-3],[18,19],[39,18],[28,-11]],dark);
    path([[-29,-71],[-48,-50],[-46,-19],[-36,7],[-20,-2],[-19,-34],[20,-38],[31,0],[45,4],[52,-22],[38,-69]],'#a86a76');
    path([[-34,-72],[-19,-83],[18,-82],[36,-66],[29,-22],[18,-5],[-23,-8],[-39,-30]],flesh);
    stitch(-26,-58,25,-20,8);stitch(25,-57,-24,-20,6);
    oval(0,-84,23,20,'#b18088');path([[-21,-91],[-12,-109],[13,-107],[23,-92]],dark);
    curve(-14,-84,-6,-87,0,-84,bone,6);curve(8,-85,15,-87,19,-81,bone,6);
    path([[-44,-9],[-52,5],[-31,14],[-22,3]],bone);
    path([[45,-5],[54,8],[39,17],[30,4]],bone);
  }else if(type==='flesh_nest'){
    for(const [x,y] of [[-30,-70],[-6,-96],[21,-85],[36,-64]]){
      path([[x-10,y+14],[x,y-14],[x+12,y+14]],bone);
    }
    path([[-25,-72],[-44,-43],[-38,-3],[-12,18],[22,12],[42,-14],[34,-55],[15,-81]],flesh);
    oval(0,-34,39,42,'#813d58','#e6a0a4',4);
    oval(-17,-46,15,20,'#db929b');oval(18,-45,14,18,'#ca7d92');oval(0,-18,21,17,'#b7657e');
    oval(-18,-49,7,9,'#ffdfbb');oval(19,-47,6,9,'#ffdfbb');oval(0,-20,10,7,'#f2bfae');
    stitch(-28,-66,23,-65,7);
    path([[-31,-9],[-48,7],[-24,-1]],'#a45b75');
    path([[29,-7],[49,9],[23,6]],'#a45b75');
  }else if(type==='gore_wagon'){
    path([[-46,-57],[-31,-99],[-18,-83],[-9,-104],[4,-85],[25,-101],[39,-72],[46,-29]],flesh);
    path([[-48,-34],[44,-34],[41,4],[-45,4]],'#653b51');
    for(const x of [-35,35]){oval(x,13,21,22,'#402c40',bone,4);oval(x,13,8,8,'#c68b91',ink,2);}
    for(const x of [-30,-14,2,18,34])curve(x,-34,x+2,-16,x,2,bone,4);
    oval(1,-52,23,24,'#713b51');
    for(const x of [-13,-3,7,17])path([[x-5,-53],[x,-67],[x+5,-54]],bone);
    curve(-42,-79,-65,-98,-48,-105,'#bd6b80',6);
    curve(39,-79,61,-98,46,-105,'#bd6b80',6);
  }else if(type==='meat_lord'){
    path([[-29,-74],[-56,-32],[-49,23],[-23,15],[0,-10],[22,17],[49,23],[54,-32],[30,-76]],'#5e304b');
    path([[-35,-79],[-58,-44],[-50,-2],[-32,7],[-18,-15],[17,-19],[34,5],[52,-2],[60,-43],[32,-78]],'#a15a71');
    path([[-26,-73],[-13,-90],[18,-91],[31,-72],[27,-20],[9,-8],[-20,-16]],flesh);
    path([[-21,-9],[-27,21],[-5,24],[0,-6],[16,25],[39,23],[27,-13]],dark);
    path([[-23,-93],[-29,-116],[-12,-105],[-4,-123],[9,-106],[23,-122],[27,-96]],bone);
    oval(0,-88,21,20,'#bb7781');
    curve(-17,-88,-8,-91,-1,-87,'#ffdda6',6);curve(7,-88,13,-91,18,-85,'#ffdda6',6);
    oval(0,-37,20,23,'#6b2f4b','#f0b0a9',4);
    for(let x=-14;x<=14;x+=9)curve(x,-53,x+3,-38,x,-26,bone,4);
    stitch(-31,-54,-18,-19,5);
    path([[-48,6],[-58,20],[-35,26],[-24,8]],bone);
    path([[44,4],[60,20],[39,26],[27,7]],bone);
    curve(-37,-104,-43,-125,-55,-126,bone,6);
    curve(29,-107,43,-132,52,-128,bone,6);
  }
  g.restore();
  return true;
}
