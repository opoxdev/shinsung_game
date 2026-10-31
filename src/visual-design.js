// Original Shinsung Defense silhouettes. No recolor filters or reused event costumes.
// All default shapes share a readable tactical language; high tiers use richer equipment.
const DESIGNS={
  scout:{main:'#697e75',dark:'#293d4c',trim:'#d1b87a',helmet:'cap',weapon:'carbine',rig:'light'},
  archer:{main:'#6d7a6b',dark:'#273745',trim:'#b2a982',helmet:'hood',weapon:'crossbow',rig:'light'},
  chef:{main:'#7d8a7e',dark:'#2d3b4d',trim:'#cbaa73',helmet:'helmet',weapon:'grenade',rig:'light'},
  scrap:{main:'#737e84',dark:'#263b48',trim:'#c4a66d',helmet:'heavy',weapon:'cannon',rig:'heavy'},
  soldier:{main:'#516d7d',dark:'#263b52',trim:'#76bfc5',helmet:'visor',weapon:'dual',rig:'medium'},
  blade:{main:'#637486',dark:'#24394b',trim:'#d3c39c',helmet:'band',weapon:'sword',rig:'light'},
  chemist:{main:'#607c72',dark:'#293b44',trim:'#91c3a2',helmet:'gasmask',weapon:'vial',rig:'medium'},
  icewitch:{main:'#617c90',dark:'#2a3e52',trim:'#99d5dd',helmet:'breather',weapon:'cryo',rig:'medium'},
  spirit:{main:'#57727b',dark:'#2c3a51',trim:'#88c0c5',helmet:'headset',weapon:'controller',rig:'medium'},
  hunter:{main:'#5b6778',dark:'#252d42',trim:'#c7c6a9',helmet:'hood',weapon:'sniper',rig:'medium'},
  marker:{main:'#686d88',dark:'#30394c',trim:'#ad9ec8',helmet:'visor',weapon:'marker',rig:'medium'},
  cannon:{main:'#9a7257',dark:'#382f42',trim:'#e5a272',helmet:'heavy',weapon:'launcher',rig:'heavy'},
  summoner:{main:'#5e7974',dark:'#313c4d',trim:'#b4ca91',helmet:'hood',weapon:'summon',rig:'cape'},
  firefly:{main:'#8a6458',dark:'#3b333e',trim:'#efbb7e',helmet:'breather',weapon:'flame',rig:'heavy'},
  knight:{main:'#65748e',dark:'#2a3655',trim:'#c5bfe7',helmet:'knight',weapon:'greatsword',rig:'cape'},
  drone:{main:'#547985',dark:'#263e57',trim:'#8ccfe4',helmet:'visor',weapon:'tesla',rig:'heavy'},
  clockmaker:{main:'#787683',dark:'#343d59',trim:'#d0b88e',helmet:'officer',weapon:'clock',rig:'cape'},
  mermaid:{main:'#518b89',dark:'#2a4859',trim:'#b7d9c9',helmet:'coral',weapon:'harp',rig:'cape'},
  prism:{main:'#626b9b',dark:'#2b3260',trim:'#c6b7fa',helmet:'spire',weapon:'prism',rig:'cape'},
  reaper:{main:'#73718d',dark:'#29253f',trim:'#e5d9eb',helmet:'rabbit',weapon:'scythe',rig:'cape'},
  storm:{main:'#526984',dark:'#252e49',trim:'#a8c5ed',helmet:'cleric',weapon:'storm',rig:'cape'},
  rail:{main:'#5f7395',dark:'#283c57',trim:'#b4d4f7',helmet:'star',weapon:'rail',rig:'cape'},
  sonic:{main:'#617e91',dark:'#283852',trim:'#99dce6',helmet:'sound',weapon:'sonic',rig:'heavy'},
  phoenix:{main:'#a1645b',dark:'#42344a',trim:'#fbc88f',helmet:'flame',weapon:'phoenix',rig:'cape'},
  aurora:{main:'#4e7480',dark:'#223852',trim:'#75e9d5',helmet:'aurora',weapon:'aurora',rig:'cape'},
  lullaby:{main:'#6b768c',dark:'#2e3850',trim:'#bac9db',helmet:'headset',weapon:'radio',rig:'light'},
  papercrane:{main:'#8e7d71',dark:'#39384b',trim:'#e4d2a9',helmet:'origami',weapon:'crane',rig:'cape'},
  banker:{main:'#81836c',dark:'#2e4652',trim:'#e9c67c',helmet:'none',weapon:'supply',rig:'structure'},
  workshop:{main:'#587a74',dark:'#2b4a4c',trim:'#b0d3a1',helmet:'none',weapon:'mushroom',rig:'structure'},
  starseed:{main:'#86748f',dark:'#323453',trim:'#e5c4da',helmet:'none',weapon:'starseed',rig:'relic'}
};
export const CHARACTER_DESIGNS=DESIGNS;
const SCHEMES={
 meadow:{main:'#566b59',dark:'#233c38',trim:'#9fbc8b',helmet:'hood',rig:'cape',emblem:'leaf'},
 arctic:{main:'#d9e3e7',dark:'#657a8b',trim:'#d1f6f7',helmet:'breather',rig:'heavy',emblem:'snow'},
 bloom:{main:'#c47e8e',dark:'#553f68',trim:'#ffd4dc',helmet:'band',rig:'cape',emblem:'petal'},
 circuit:{main:'#49798b',dark:'#18364c',trim:'#69e5c5',helmet:'visor',rig:'heavy',emblem:'circuit'},
 neon:{main:'#774d94',dark:'#283052',trim:'#e989d4',helmet:'sound',rig:'cape',emblem:'pulse'},
 frostfire:{main:'#698ba7',dark:'#29334f',trim:'#eeae9a',helmet:'breather',rig:'heavy',emblem:'snow'},
 starlight:{main:'#7a70ac',dark:'#31385a',trim:'#e7d2ff',helmet:'star',rig:'cape',emblem:'star'},
 royal:{main:'#7e567c',dark:'#332e50',trim:'#e6c88e',helmet:'knight',rig:'cape',emblem:'crown'},
 solstice:{main:'#537962',dark:'#2b403e',trim:'#c5ce88',helmet:'hood',rig:'cape',emblem:'leaf'},
 hologram:{main:'#4b9ca0',dark:'#274b67',trim:'#a4fff0',helmet:'visor',rig:'heavy',emblem:'hologram'},
 glacier:{main:'#91b7ce',dark:'#3d5373',trim:'#d6f4ff',helmet:'knight',rig:'cape',emblem:'snow'},
 void:{main:'#50446b',dark:'#201d35',trim:'#bf87ec',helmet:'spire',rig:'cape',emblem:'void'},
 celestial:{main:'#ad85ae',dark:'#353758',trim:'#f7d9b6',helmet:'aurora',rig:'cape',emblem:'star'},
 donut:{main:'#f3d8bd',dark:'#744f65',trim:'#f6a6ae',helmet:'chef',rig:'apron',weapon:'donut',emblem:'donut'},
 kitsune:{main:'#d2cad2',dark:'#553350',trim:'#ef7795',helmet:'fox',rig:'haori',weapon:'katana',emblem:'kitsune'}
};
export const COSTUME_SCHEMES=SCHEMES;

const path=(d,fill,stroke='#243b4a',sw=3)=>'<path d="'+d+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'" stroke-linejoin="round"/>';
const rect=(x,y,w,h,fill,r=0)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+r+'" fill="'+fill+'"/>';
const ellipse=(cx,cy,rx,ry,fill)=>'<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="'+fill+'"/>';
const line=(d,color,width=4)=>'<path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="'+width+'" stroke-linecap="round" stroke-linejoin="round"/>';
const circle=(x,y,r,fill)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+fill+'"/>';
function insignia(style,c){
 const emblem=style&&SCHEMES[style]?.emblem;
 if(emblem==='snow')return '<path d="M93 111v22m-11-17 22 12m-22 0 22-12" stroke="'+c.trim+'" stroke-width="3"/>';
 if(emblem==='leaf')return path('M93 113Q105 117 91 131Q79 116 93 113Z',c.trim,'none',0)+line('M93 127l5-10',c.dark,2);
 if(emblem==='star')return path('M94 111l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1Z',c.trim,'none',0);
 if(emblem==='crown')return path('M83 118l3 8 8-6 8 6 4-8-2 15H85Z',c.trim,'none',0);
 if(emblem==='petal')return circle(94,119,6,c.trim)+circle(84,125,4,'#ffdce4')+circle(104,125,4,'#ffdce4');
 if(emblem==='circuit'||emblem==='hologram')return line('M84 113v16h19v-16m-9 0v8',c.trim,3);
 if(emblem==='void')return circle(94,123,8,c.trim)+circle(94,123,4,c.dark);
 if(emblem==='donut')return '<circle cx="94" cy="123" r="9" fill="'+c.trim+'" stroke="'+c.dark+'" stroke-width="3"/>'+circle(94,123,3,c.dark);
 if(emblem==='kitsune')return path('M86 114l9 7 9-7-4 16-5 5-5-5Z',c.trim,'none',0);
 if(emblem==='pulse')return line('M82 122h7l4-8 5 16 5-8h6',c.trim,3);
 return path('M87 117h14v14H87Z',c.trim,'none',0);
}
function backRig(cfg,c,id,style){
 const p=c.dark,a=c.trim;let out='';
 if(cfg.rig==='heavy')out+=rect(59,89,70,63,p,12)+rect(65,102,60,36,c.main,6)+line('M70 110h50M70 120h50',a,3);
 if(cfg.rig==='medium')out+=rect(66,95,60,45,p,6)+line('M75 110h42M75 119h42',a,3);
 if(cfg.rig==='light')out+=rect(69,99,50,30,p,6);
 if(cfg.rig==='cape'||cfg.rig==='haori')out+=path('M67 104Q41 104 27 185L65 170 92 190 113 170 158 184Q140 109 117 104Z',p,c.trim,4);
 if(cfg.rig==='haori')out+=path('M55 114L31 184 63 165M134 112l27 72-34-18',a,'none',0);
 if(cfg.rig==='apron')out+=path('M72 102L61 177 128 177 118 102Z',c.main,c.dark,4);
 if(style==='kitsune')out+=path('M49 118Q9 88 17 140q-14 16 3 43 4-24 28-29M131 119q40-39 44 8 13 22-4 48-4-22-28-30',a,c.dark,4);
 if(id==='summoner')out+=path('M52 112L23 170l27-9M140 112l28 60-30-10',c.trim,'none',0);
 if(id==='phoenix')out+=path('M62 121Q21 79 29 147l39 4M126 120q41-45 27 29l-35 4',a,c.dark,4);
 if(id==='papercrane')out+=path('M31 116L10 86 49 104 60 89 57 125Z',a,c.dark,3);
 if(style==='celestial'||style==='void')out+=line('M24 87l9-10m117 1 8 11M37 162l-10 9m129-7 7 10',a,5);
 return out;
}
function legs(c,id,style){
 let result=path('M67 147L56 183 80 189 91 157 102 190 130 182 116 145Z',c.dark,'#202e3a',4);
 result+=path('M55 180L81 183 80 196 46 195ZM104 186L133 180 142 194 105 199Z','#243441','#1a2938',3);
 if(style==='arctic'||style==='glacier')result+=rect(57,175,24,8,c.trim,2)+rect(107,177,24,8,c.trim,2);
 else result+=rect(66,179,13,5,c.main,1)+rect(107,178,13,5,c.main,1);
 return result;
}
function helm(type,c){
 const p=c.dark,a=c.trim,m=c.main;
 switch(type){
 case 'cap':return path('M62 58Q64 24 94 25Q127 26 128 62L62 63Z',m,p,4)+path('M51 63L134 58 145 67 59 72Z',p,p,3)+rect(88,43,13,5,a,1);
 case 'band':return path('M65 61Q72 28 94 29 119 29 125 62Z',m,p,4)+rect(64,56,63,10,p,2)+line('M115 62l23 4',a,3);
 case 'hood':return path('M51 78Q43 32 93 20 142 31 140 81l-18-14-15-17-25 3-17 19Z',p,c.trim,3)+rect(62,70,64,10,m,2);
 case 'helmet':return path('M53 60Q56 16 94 19q39 1 43 41L121 76 67 76Z',m,p,5)+rect(52,60,84,9,p,2)+line('M68 46h51',a,3);
 case 'heavy':return path('M47 75Q46 16 94 16 144 16 142 73L127 89H60Z',m,p,5)+path('M59 66h72l-8 20H66Z',p,'none',0)+rect(69,69,49,8,a,2);
 case 'visor':return path('M56 66Q52 24 95 23q42 1 40 43l-12 15H67Z',m,p,5)+rect(61,61,67,18,p,6)+line('M71 70h45',a,5);
 case 'breather':return path('M53 69Q50 21 94 22q45 3 42 46l-16 16H66Z',m,p,4)+rect(60,62,70,17,p,5)+rect(80,76,29,14,a,4)+line('M87 82h16',p,3);
 case 'gasmask':return path('M55 67Q53 24 94 21q39 0 42 49l-15 29H68Z',m,p,5)+rect(64,61,61,16,p,4)+circle(76,70,7,a)+circle(110,70,7,a)+rect(84,83,21,13,p,4);
 case 'headset':return path('M60 66Q59 27 95 26q34 0 34 40Z',m,p,4)+line('M59 67Q52 13 95 17q43 0 40 52',a,6)+rect(52,61,13,24,p,4)+rect(125,61,13,24,p,4);
 case 'officer':return path('M58 52Q63 25 95 25q33 0 34 28L58 58Z',m,p,4)+rect(52,55,84,10,p,2)+rect(78,48,31,5,a,1);
 case 'knight':return path('M53 61Q48 18 95 15q47 1 43 47l-7 35H61Z',m,p,5)+rect(64,64,61,14,p,3)+line('M69 69h51',a,4);
 case 'coral':return path('M60 66Q51 38 76 19l19 17 21-21 19 47Z',m,p,4)+path('M71 29l-6-21 20 13M111 24l18-20-3 27',a,c.dark,3);
 case 'spire':return path('M59 62L92 4l37 57-19-10-34 1Z',m,p,4)+rect(62,59,66,12,p,4)+circle(94,30,7,a);
 case 'rabbit':return path('M69 61L61 9 84 31 108 27 127 7 120 61Z',m,p,4)+rect(66,63,60,17,p,4)+line('M71 69h50',a,4);
 case 'cleric':return path('M54 64Q64 21 94 18q37 3 42 46L120 85H65Z',p,m,4)+path('M94 19L94 69M83 51h22',a,'none',3);
 case 'star':return path('M44 69l28-32L95 6l25 31 31 32-50-9-47 9Z',m,p,5)+circle(95,38,7,a);
 case 'sound':return path('M54 65Q57 23 95 23q42 0 40 42Z',m,p,4)+rect(51,59,15,29,p,4)+rect(123,59,15,29,p,4)+line('M64 55q27-24 59 0',a,5);
 case 'flame':return path('M61 63Q40 31 70 7l16 28q19-31 36-28 21 27 3 56Z',m,p,4)+path('M79 31l15-22 10 22',a,'none',0);
 case 'aurora':return path('M49 66Q62 10 95 11q38 8 46 55l-24-17-23-23-24 24Z',m,a,4)+line('M68 52h56',a,3);
 case 'origami':return path('M51 64L94 16 139 62 112 52 94 38 75 54Z',m,p,4)+line('M94 16v40',a,3);
 case 'chef':return path('M54 61Q44 40 65 26q-1-26 24-18 14-18 26 2 33-3 24 29 18 12-5 27Z',m,p,4)+rect(58,59,77,13,a,3);
 case 'fox':return path('M59 46L53 10 79 24 94 18 113 24 137 8 131 48 130 84 96 104 61 84Z','#f4e9e5',p,5)+line('M71 62l16 8m19 0 17-9',a,6)+circle(96,83,4,a);
 default:return '';
 }
}
function weapon(type,c,style){
 const a=c.trim,p=c.dark,m=c.main;
 // Front props are intentionally asymmetric and silhouette-changing.
 if(type==='carbine'||type==='sniper'||type==='rifle'||type==='crossbow'||type==='marker'){
  const sniper=type==='sniper',cross=type==='crossbow',mark=type==='marker';
  let out=line('M116 119L157 90',p,sniper?12:9)+line('M122 113L161 86',a,3);
  out+=rect(130,93,sniper?39:28,sniper?8:6,p,2);
  out+=line('M140 86h16',a,3);
  if(cross)out+=line('M144 70q28 12 0 40M144 90l26-22',a,4);
  if(sniper)out+=rect(125,82,25,8,m,2)+rect(151,92,22,4,a,1);
  if(mark)out+=circle(165,91,11,a)+line('M156 91h18m-9-9v18',p,2);
  return out;
 }
 if(type==='dual')return line('M56 120L21 97m108 25 35-26',p,12)+line('M28 96h20m88 0h21',a,5)+circle(24,96,6,a)+circle(161,94,6,a);
 if(type==='sword'||type==='katana'||type==='greatsword'||type==='scythe'){
  let out=line('M116 148L159 46',p,9)+line('M124 121L161 43',a,type==='greatsword'?11:5)+line('M123 120l24 12',m,7);
  if(type==='scythe')out+=path('M153 42Q178 18 167 11q-40 14-30 46Z',a,p,4);
  if(type==='greatsword')out+=path('M157 45l17-21-4 39-23 11Z','#d8e2f9',p,3);
  if(type==='katana')out+=path('M148 63Q180 39 171 21l-21 8Z','#eee9ef',a,3);
  return out;
 }
 if(type==='grenade')return line('M122 118l23-20',p,10)+circle(146,93,16,m)+rect(139,76,16,8,a,3)+line('M143 75l9-13',p,4);
 if(type==='donut')return line('M118 125L151 88',p,9)+'<circle cx="150" cy="84" r="17" fill="#bc7963" stroke="#704651" stroke-width="4"/>'+circle(150,84,8,'#ffb0cb')+circle(150,84,4,c.dark)+circle(159,79,2,'#fff7ce');
 if(type==='cannon'||type==='launcher')return rect(121,87,45,32,p,8)+rect(134,91,37,18,m,4)+rect(159,92,18,15,a,4)+line('M124 121l-16 20',p,8);
 if(type==='vial')return line('M112 121l24-32',p,8)+path('M136 85l-5-15 18-15 16 16-16 23Z',a,p,4)+circle(151,71,5,'#e4f7c6');
 if(type==='cryo'||type==='flame'||type==='tesla'){
   let body=rect(126,87,40,33,p,7)+rect(137,92,28,21,m,2)+rect(158,94,16,14,a,4)+line('M126 125l-13 18',p,7)+line('M149 88l-7-20',a,5);
   if(type==='cryo')body+=path('M163 96L178 77 178 110 163 106Z','#a8d8e5',p,3)+path('M134 85l-8-16 18-9 7 23Z',a,p,2);
   if(type==='flame')body+=path('M165 96Q184 80 178 68q22 23-7 42l-6-5Z','#f7b177',p,3)+path('M135 90l-9-22 9-17 8 36Z',a,p,2);
   if(type==='tesla')body+=path('M165 91l9-22 7 29-14 15Z',a,p,3)+line('M166 76l-12-18 14-5',a,4);
   return body;
 }
 if(type==='controller'||type==='radio'||type==='clock')return rect(119,93,46,49,p,7)+rect(125,99,34,29,m,3)+circle(135,110,6,a)+circle(151,110,6,a)+line('M141 92V76',a,4);
 if(type==='summon'||type==='phoenix'||type==='storm'||type==='rail'||type==='aurora')return line('M138 158L153 41',p,9)+path('M151 22l17 18-16 22-16-22Z',a,p,4)+circle(152,42,8,'#f6f4d8');
 if(type==='prism')return line('M138 158l10-81',p,9)+path('M145 34L170 67 147 99 128 68Z',a,p,5)+path('M145 34l2 65 23-32Z','#d7ebf5','none',0);
 if(type==='sonic')return circle(146,115,25,p)+circle(146,115,17,a)+circle(146,115,10,m)+line('M121 118l-15 15',p,9);
 if(type==='harp')return path('M130 55Q177 75 161 147l-39-10Z',a,p,5)+line('M134 79v54m10-55v57m10-50v50',p,2);
 if(type==='crane')return path('M123 99l29-42-5 30 26 12-42 21-18-18Z','#e9e0c7',p,4)+line('M137 102l27-12',a,2);
 return line('M118 129l40-43',p,8)+circle(158,88,13,a);
}
function fighterPortrait(id,c,skin){
  let out=ellipse(93,193,60,11,'#0e213944');
  out+=backRig(c,c,id,skin)+legs(c,id,skin);
  out+=path('M68 95L47 111 49 136 67 129 67 153 121 153 121 129 141 137 145 111 120 95Z',c.main,c.dark,5);
  out+=path('M76 102L76 145 112 145 112 102Z',c.dark,'none',0);
  out+=path('M83 110h22v24H83Z',c.main,'none',0)+insignia(skin,c);
  out+=path('M64 110l-19 5 11 27 15-11M124 109l18 7-9 26-14-10',c.main,c.dark,4);
  out+=rect(56,126,17,10,c.dark,2)+rect(120,126,17,10,c.dark,2);
  out+=path('M68 61Q70 36 96 36q24 2 25 26l-7 32-18 11-20-11Z','#baaea0',c.dark,4);
  out+=helm(c.helmet,c);
  // Dark visor or eyes: no childish mouth or oversize facial expression.
  if(!['gasmask','fox','heavy','visor','breather','knight'].includes(c.helmet))
    out+=line('M78 79h12m11 0h12',c.dark,5);
  out+=weapon(c.weapon,c,skin);
  if(skin==='hologram')out+=line('M45 153h96M52 70h87M62 179h59',c.trim,2);
  if(skin==='glacier')out+=path('M64 108l-23-23 27 7m59 17 24-25-25 8',c.trim,c.dark,3);
  if(skin==='frostfire')out+=circle(40,143,10,'#f1a68e')+circle(148,153,9,'#a9e9fc');
  if(skin==='neon')out+=line('M49 145l16 10m63-9 17 11M68 162h52',c.trim,4);
  if(skin==='royal')out+=path('M88 103l8-11 8 11-8 14Z',c.trim,c.dark,2);
  if(skin==='donut')out+=path('M69 111L69 161 119 161 119 111Z','#fff1dc',c.dark,4)+circle(93,135,10,'#cc8093')+circle(93,135,5,'#fff3d9');
  return out;
}
function buildingPortrait(id,c,skin){
  const p=c.dark,a=c.trim,m=c.main;
  let out=ellipse(94,195,65,11,'#0e21393c');
  if(id==='banker'){
    out+=rect(36,125,116,59,p,8)+rect(47,109,94,41,m,6)+rect(57,118,75,25,p,4);
    out+=line('M66 131h55',a,6)+rect(39,170,28,20,p,4)+rect(121,170,28,20,p,4);
    out+=path('M45 97L72 54 122 54 147 97Z',m,p,5)+rect(81,75,27,24,a,5);
    out+=rect(105,63,25,9,p,2)+line('M95 52V29',a,5)+circle(95,25,7,a);
    out+=circle(145,156,13,a)+line('M139 156h12',p,4);
  }else if(id==='workshop'){
    out+=rect(40,119,108,66,p,10)+rect(53,131,83,41,m,8);
    out+=path('M28 116Q47 43 95 39q55 1 71 77L120 133 55 132Z',m,p,6);
    out+=ellipse(94,114,72,14,a)+rect(83,129,23,33,p,5);
    out+=circle(66,88,12,a)+circle(121,77,8,a);
    out+=line('M56 153h23m31 0h25',a,5);
    if(skin==='solstice')out+=path('M28 106L13 64l29 25m96 0 27-28-7 48',a,p,3);
  }
  return out;
}
function relicPortrait(id,c,skin){
  const p=c.dark,a=c.trim,m=c.main;
  let out=ellipse(93,193,53,10,'#14213a50');
  out+=path('M94 31L150 92 129 163 94 190 58 164 36 95Z',p,a,5);
  out+=path('M94 42l41 51-25 61-16 20-19-21-26-59Z',m,p,3);
  out+=path('M94 26L118 80 95 126 70 80Z',a,p,5);
  out+=path('M94 26l1 100 23-46Z','#e6f4ef','none',0);
  out+=circle(95,96,11,p)+circle(95,96,5,a);
  for(let i=0;i<4;i++){const x=24+i*37;out+=path('M'+x+' '+(90+i%2*26)+'l8-15 8 15-8 15Z',i%2?a:m,p,2);}
  if(skin==='starlight'||skin==='celestial')out+=path('M93 5l5 13 15 2-11 10 3 14-12-7-12 7 2-14-10-10 14-2Z',a,'none',0);
  return out;
}
export function redesignedPortrait(id,skin='default'){
 const base=DESIGNS[id];if(!base)return null;
 const suit=SCHEMES[skin];
 const c=suit?{...base,...suit}:base;
 const rid='shinsung-'+id+'-'+skin;
 let art=base.rig==='structure'?buildingPortrait(id,c,skin):base.rig==='relic'?relicPortrait(id,c,skin):fighterPortrait(id,c,skin);
 // Every model is standalone and stays recognizable at the 75px battle scale.
 const border=(suit&&['mythic','legendary'].includes(skin))?'': '';
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 210" aria-label="'+id+(skin==='default'?'':' '+skin)+'" data-design="v2" data-base="'+id+'" data-costume="'+skin+'">'
  +'<defs><linearGradient id="'+rid+'" x1="0" x2="1" y1="0" y2="1"><stop stop-color="'+c.main+'"/><stop offset="1" stop-color="'+c.dark+'"/></linearGradient></defs>'
  +art+'</svg>';
}
