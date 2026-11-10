import { TOWERS } from './data.js';
import { christmasTowerPortrait } from './christmas-art.js';
// Original Shinsung Defense silhouettes. No recolor filters or reused event costumes.
// Everyday/common and craft/rare portraits use modest civilian jobs.
// Epic/legendary/mythic gain progressively unique silhouettes; no military-uniform template.
const DESIGNS={
  sunlancer:{main:'#bd8757',dark:'#54465b',trim:'#ffeab1',helmet:'knight',weapon:'greatsword',rig:'cape'},
  graviturge:{main:'#7766ba',dark:'#33285e',trim:'#dcbbff',helmet:'spire',weapon:'aurora',rig:'cape'},
  thornkeeper:{main:'#6d9c7d',dark:'#315b53',trim:'#d9ffd0',helmet:'hood',weapon:'vial',rig:'cape'},
  pulsekeeper:{main:'#985ac4',dark:'#34304e',trim:'#f1d5ff',helmet:'hood',weapon:'drum',rig:'cape'},
  duskarcher:{main:'#5b5379',dark:'#252741',trim:'#c7a6f2',helmet:'hood',weapon:'bow',rig:'cape'},
  crystalspider:{main:'#49beb4',dark:'#273b65',trim:'#bbf9ed',helmet:'spire',weapon:'crystal',rig:'heavy'},
  voidwalker:{main:'#9d469c',dark:'#242441',trim:'#83c9e9',helmet:'hood',weapon:'dark',rig:'cape'},
  oldgod:{main:'#fff7e9',dark:'#683647',trim:'#ffd764',helmet:'halo',weapon:'judgement',rig:'titan'},
  scout:{"main":"#628ec4","dark":"#334e71","trim":"#f3d184","helmet":"none","weapon":"slingshot","rig":"casual"},
  archer:{"main":"#53a18a","dark":"#2e5b53","trim":"#d7e6a5","helmet":"none","weapon":"bow","rig":"casual"},
  chef:{"main":"#dc835b","dark":"#644760","trim":"#ffdc9a","helmet":"none","weapon":"grenade","rig":"casual"},
  scrap:{"main":"#7895b5","dark":"#36516a","trim":"#f4c77d","helmet":"none","weapon":"cannon","rig":"porter"},
  soldier:{"main":"#52b6ae","dark":"#295d6c","trim":"#b2eee0","helmet":"none","weapon":"coil","rig":"casual"},
  blade:{"main":"#8185b2","dark":"#3c456c","trim":"#ee9493","helmet":"none","weapon":"sword","rig":"casual"},
  chemist:{"main":"#79b995","dark":"#37695b","trim":"#e2edbb","helmet":"none","weapon":"vial","rig":"apron"},
  icewitch:{"main":"#87bfdf","dark":"#466d96","trim":"#e5f6fd","helmet":"none","weapon":"staff","rig":"robe"},
  spirit:{"main":"#6cafc4","dark":"#365e77","trim":"#c4ecf1","helmet":"none","weapon":"controller","rig":"casual"},
  hunter:{"main":"#78a089","dark":"#3d5c55","trim":"#eacb91","helmet":"none","weapon":"sniper","rig":"coat"},
  marker:{"main":"#9b90be","dark":"#4e5376","trim":"#e5d8fb","helmet":"none","weapon":"telescope","rig":"casual"},
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
 if(type==='cannon'||type==='launcher'){
   let body=rect(121,87,45,32,p,8)+rect(134,91,37,18,m,4)+rect(159,92,18,15,a,4)+line('M124 121l-16 20',p,8);
   if(type==='cannon')body+=path('M129 112L109 140 143 151 154 122Z',m,p,4)+line('M164 92l14-9m-11 29 12 8',a,5);
   else body+=path('M130 87l-19-18 12-14 27 29Z',a,p,3)+line('M160 89L166 70',a,4);
   return body;
 }
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
// BASE COMMON + RARE: civilian professions. The same military helmet and
// tactical armor must NOT appear on every starter unit. These are quiet,
// recognizable 75px silhouettes: wood, cloth, leather, modest hand tools.
export const BASE_ART_TIERS={common:'everyday',rare:'craft',epic:'specialist',legendary:'iconic',mythic:'myth'};
function everydayPortrait(id,c,rare=false){
  const a=c.trim,p=c.dark,m=c.main;
  const skin='#ddbca6';
  const hairColors={scout:'#384958',archer:'#405b55',chef:'#5e4455',scrap:'#455162',
    soldier:'#34596a',blade:'#43435c',chemist:'#496354',icewitch:'#687b9b',
    spirit:'#426078',hunter:'#4d534e',marker:'#55506f'};
  const hair=hairColors[id]||'#4c5566';
  let out=ellipse(94,194,44,7,'#25384d32');
  // Everyday footwear and unarmored cloth are consistent, but jobs differ.
  out+=path('M72 144L63 179 76 186 91 154 107 184 127 179 115 144Z',p,'#3e4447',3);
  out+=path('M58 181l21-3 3 12-27 2ZM106 179l23 0 6 12-30 1Z','#36485d',p,2);
  if(id==='hunter')out+=path('M61 97Q41 124 46 181L75 167 93 179 124 166 150 185Q141 117 123 97Z',m,p,4);
  if(id==='icewitch')out+=path('M68 104L47 170Q90 188 141 171L120 103Z',m,p,3);
  if(id==='scrap')out+=path('M19 120L22 178 46 180 40 111Z',p,p,3)+circle(32,173,11,a);
  if(id==='archer')out+=path('M69 113L46 168 64 177 88 149Z',p,a,2);
  if(id==='spirit')out+=rect(56,101,17,32,p,4);
  if(id==='chemist')out+=path('M69 118l-20 52 34 11 24-15 25 12-15-56Z','#dce9e6',p,3);
  // Different tunic construction, not identical bulletproof vests.
  const front=id==='blade'?'M65 101L107 103 121 149 66 151 75 124Z':
    id==='hunter'?'M69 103L112 103 123 148 64 148Z':
    id==='icewitch'?'M69 96L117 97 133 155 55 155Z':
    id==='scrap'?'M62 105L127 105 127 153 58 153Z':
    'M66 106L119 106 125 152 62 152Z';
  out+=path(front,m,p,4);
  if(id==='blade')out+=line('M70 115l41 29M67 145h54',a,4);
  else if(id==='archer')out+=line('M72 115l35 0M81 121v22',p,3);
  else if(id==='scout')out+=path('M66 114L121 147M85 105L101 150',a,'none',2);
  else if(id==='chef')out+=rect(79,123,40,16,p,3)+circle(89,131,4,a)+circle(107,131,4,a);
  else if(id==='scrap')out+=rect(73,120,43,17,a,3)+line('M78 129h32',p,3);
  else if(id==='chemist')out+=rect(84,120,27,12,p,2)+line('M98 126v10',a,2);
  else if(id==='hunter')out+=line('M92 106l-15 41M98 106l19 41',a,3);
  else if(id==='marker')out+=rect(82,118,28,17,p,2)+line('M87 124h17',a,3);
  else if(id==='soldier')out+=path('M76 119l15 0 0 24-15 0ZM105 119h12v24h-12Z',a,p,2);
  else if(id==='icewitch')out+=line('M78 120l31 0M77 132h33',a,3);
  else if(id==='spirit')out+=rect(84,114,34,24,p,3)+line('M91 121h20',a,2);
  // Two different arm poses and rolled sleeves, no bulky shoulder armor.
  out+=path('M68 111L50 118 44 144 55 151 73 132M119 110l22 8 6 26-11 8-20-20',m,p,3);
  out+=circle(49,149,7,skin)+circle(141,148,7,skin);
  // Simulation-style rounded / soft-square heads. Flat or curved hair caps
  // replace sharp triangular hair spikes; separate haircuts keep jobs readable.
  out+='<g data-head-shape="rounded">';
  const square=['scrap','soldier','chemist','spirit','hunter','marker'].includes(id);
  out+=square
    ?path('M74 57Q74 43 87 42H104Q117 43 118 57L118 86Q115 102 99 104H89Q73 101 72 85Z',skin,p,3)
    :path('M72 65Q72 43 94 41Q118 42 118 65V82Q117 99 99 104H89Q72 99 72 82Z',skin,p,3);
  // Hair must remain low and rounded, without a pointed fringe or helmet.
  const fringe={
    scout:'M70 65Q70 41 94 40Q117 39 123 62L114 59Q98 55 85 61L72 69Z',
    archer:'M69 63Q70 38 96 37Q120 39 123 63Q107 51 94 57Q80 55 69 65Z',
    chef:'M70 62Q73 40 92 41H105Q119 44 121 62L105 58Q87 57 70 66Z',
    scrap:'M68 62Q70 42 88 41H105Q123 44 123 62H68Z',
    soldier:'M70 62Q71 39 94 40Q118 41 123 63L108 57Q90 61 70 67Z',
    blade:'M68 63Q70 40 96 40Q121 41 122 61Q107 54 96 57Q80 59 68 65Z',
    chemist:'M70 64Q69 41 90 39H104Q123 44 122 64L111 58Q90 55 70 66Z',
    icewitch:'M65 70Q66 37 95 38Q124 39 127 71L114 60Q94 52 76 63Z',
    spirit:'M70 63Q70 40 91 39H103Q121 44 123 64L105 57Q85 55 70 66Z',
    hunter:'M69 63Q70 39 94 39Q118 39 123 65L110 58Q86 55 69 66Z',
    marker:'M70 64Q72 41 91 40H102Q121 42 123 65L110 59Q87 55 70 66Z'
  };
  out+=path(fringe[id]||fringe.scout,hair,p,3);
  if(id==='archer'||id==='hunter')out+=path('M70 63Q62 75 66 94L74 93 78 65Z',hair,p,2);
  if(id==='blade')out+=path('M115 49Q134 49 136 61Q129 68 115 63Z',hair,p,2)+line('M72 108h39',a,3);
  if(id==='icewitch')out+=path('M69 61Q62 80 66 109L78 106 76 65Z',hair,p,2)
    +path('M120 61Q127 85 122 108L111 104 115 64Z',hair,p,2)
    +path('M70 96Q94 103 119 96L117 108Q94 115 72 108Z','#dcecf6',p,2);
  if(id==='scrap')out+=rect(68,56,52,8,p,3); // simple worker's hair band, not a combat helmet
  if(id==='chemist')out+=rect(79,71,14,9,'#cce5db',3)+rect(100,71,14,9,'#cce5db',3);
  if(id==='spirit')out+=line('M72 65Q61 59 59 79',a,3); // consumer headset
  if(id==='marker')out+=rect(76,54,38,5,a,2);
  if(id==='soldier')out+=rect(79,59,31,4,a,2);
  out+=line('M82 82h8m10 0h8','#394451',3);
  out+='</g>';
  // Small profession-specific weapons, not mythical or giant firearms.
  if(id==='scout')out+=line('M131 129l14-45m0 0 20 45', '#8b644b',6)+line('M145 84l10 15 10-15','#624b45',3)+rect(65,140,17,17,a,3);
  else if(id==='archer')out+=line('M151 40Q184 91 149 163','#8f7150',5)+line('M151 42L149 162','#ddd4b8',2)
    +line('M111 105l56-22',p,3)+path('M166 83l-9-1 4 9Z',a,p,2)+rect(42,107,18,39,p,4);
  else if(id==='chef')out+=circle(145,124,12,'#687b60')+rect(140,109,10,7,a,2)
    +line('M145 109q8-10 1-15',p,3)+rect(69,137,13,17,p,2);
  else if(id==='scrap')out+=path('M119 115L168 104 171 129 121 143Z','#6b6d68',p,5)+circle(164,117,10,'#3e4647')+
    line('M121 128l-20 27',a,5)+rect(70,109,19,13,p,2);
  else if(id==='soldier')out+=rect(132,112,30,24,p,5)+circle(148,122,8,a)+circle(148,122,3,m)
    +line('M138 101q-8-22 11-19',p,4)+rect(49,117,15,21,a,3);
  else if(id==='blade')out+=line('M132 154L163 51',p,7)+line('M136 135l28-82','#d6d8d2',4)
    +line('M127 131l20 7',a,5)+path('M65 143l-6 37',p,p,3);
  else if(id==='chemist')out+=path('M135 106h22l9 28q-15 19-39 0Z','#aed3a2',p,3)+rect(137,99,17,7,a,2)
    +rect(53,120,20,28,p,3)+circle(62,131,5,a);
  else if(id==='icewitch')out+=line('M148 169L151 47','#856c63',6)
    +path('M150 43l9-17 8 17-8 18Z','#c8e3e7',p,2)+line('M132 115l-14-5',a,3);
  else if(id==='spirit')out+=rect(122,126,39,25,p,5)+circle(133,139,4,a)+circle(149,139,4,a)
    +rect(139,58,22,14,a,4)+line('M137 57l-19-7m24 6 16-6',p,3)+line('M117 47h46','#8eaead',4);
  else if(id==='hunter')out+=line('M122 122L174 99',p,10)+line('M123 118l47-22',a,3)
    +rect(136,91,20,5,p,1)+path('M120 121l-14 27',a,p,2);
  else if(id==='marker')out+=rect(120,109,31,16,p,4)+circle(128,116,6,a)+circle(143,116,6,a)
    +line('M163 157V68',p,4)+path('M163 70L175 81 163 89Z',a,p,2);
  if(rare)out+=rect(89,149,12,5,a,1); // one small clasp, not a glowing badge
  return out;
}
function prestigeBack(id,c,rarity){
  const a=c.trim,p=c.dark;
  if(rarity==='epic'){
    const motifs={
      cannon:()=>path('M36 112l-15-27 28-8M137 103l27-23 7 37',a,p,4)+circle(40,92,10,'#bc744a'),
      summoner:()=>path('M32 118l-17-32 28-6M139 112l22-33 15 39',a,p,3)+circle(23,79,7,a),
      firefly:()=>path('M45 118Q10 76 31 55q-1 34 21 39M138 118q38-47 19-62 5 32-25 37','#e6a06a',p,3),
      knight:()=>line('M35 34Q95 -9 155 34',a,5)+path('M145 20l9 16-9 12-9-12Z',a,p,3),
      drone:()=>line('M34 96L14 60M147 95l19-35',a,6)+circle(14,59,11,p)+circle(165,60,11,p),
      clockmaker:()=>circle(96,95,77,p)+circle(96,95,65,a)+circle(96,95,54,p),
      mermaid:()=>path('M43 114Q9 62 41 30l13 53M142 119Q180 70 155 28l-18 59',a,p,3),
      lullaby:()=>circle(96,111,74,p)+line('M20 108h19M149 108h18',a,6)
    };
    return motifs[id]?.()||'';
  }
  if(rarity==='legendary'){
    const motifs={
      rail:()=>line('M25 155Q31 31 96 18 156 30 163 151',a,5)+circle(24,73,6,a)+circle(159,61,6,a),
      prism:()=>path('M17 82l19-41 26 44-19 40Z',a,p,3)+path('M146 110l13-64 20 61-17 29Z','#c8e5f1',p,3),
      reaper:()=>path('M21 163Q-4 89 43 30L61 16 43 79 54 130M134 128l29-60-6-44q41 57 14 147',p,a,4),
      storm:()=>path('M15 129q-24-52 23-70 8-40 48-29 41-38 70 14 40 11 24 70Z',p,a,5),
      papercrane:()=>path('M12 72L37 30 52 55 22 101Z','#f6e8cb',p,3)+path('M136 74l22-53 19 60-30 20Z','#f6e8cb',p,3)
    };
    return motifs[id]?.()||'';
  }
  if(rarity==='mythic'){
    const motifs={
      sonic:()=>line('M22 130Q0 49 95 18q94 30 74 111',a,7)+line('M15 150Q-9 35 96 5q109 34 87 149',p,5),
      phoenix:()=>path('M65 131Q-8 64 26 14L70 88M123 131q73-68 33-117l-34 75','#ef8e60','#8c4d5f',6),
      aurora:()=>path('M30 15Q-2 78 47 159Q26 96 103 19q42 87 29 145 53-46 29-144',a,p,5),
      starseed:()=>line('M22 57q71-92 143 0M13 160q82 87 164-2',a,5)
    };
    return motifs[id]?.()||'';
  }
  return '';
}
function prestigeFront(id,c,rarity){
  const a=c.trim,p=c.dark;
  const motifs={
    cannon:()=>rect(119,101,35,35,p,5)+circle(137,114,9,a),
    summoner:()=>path('M40 118L12 138 43 151 62 140Z','#7db878',p,3)+circle(31,137,3,'#e6ffc5'),
    firefly:()=>circle(151,84,8,'#fbd18a')+path('M164 103l13-28 3 30Z','#fba87b',p,3),
    knight:()=>path('M83 103l11-17 14 17-14 12Z',a,p,3),
    drone:()=>circle(34,60,9,'#8ff4e1')+circle(165,60,9,'#8ff4e1'),
    clockmaker:()=>line('M96 45v50l21 17',p,7)+circle(96,95,10,a),
    mermaid:()=>path('M58 117l-19-40 13-28 13 42Z',a,p,3),
    lullaby:()=>path('M26 106L14 95 14 124 26 115ZM166 106l12-12v29l-12-9Z',a,p,3),
    rail:()=>path('M31 51l12-16 12 16-12 16Z',a,p,3)+path('M141 51l12-16 12 16-12 16Z',a,p,3),
    prism:()=>path('M83 22l14-18 14 18-14 18Z','#ebdcfb',p,3),
    reaper:()=>line('M135 154l32-94',a,7)+path('M166 61q-30-32-26-48 36 13 42 44Z',a,p,3),
    storm:()=>path('M25 121l30-41-13 44 30-12-35 47Z',a,p,3)+path('M144 101l28-39-9 42 22-9-31 40Z',a,p,3),
    papercrane:()=>path('M55 25L90 42 72 56 58 91 41 56Z','#f5dfbb',p,3),
    sonic:()=>line('M26 114h15m119 0h15',a,6),
    phoenix:()=>path('M94 5l15 35-15-10-16 10Z','#ffe5ac',p,3),
    aurora:()=>circle(33,58,6,'#dafaf2')+circle(155,66,6,'#dafaf2'),
    starseed:()=>circle(30,69,7,a)+circle(160,117,7,a)
  };
  return motifs[id]?.()||'';
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

// Monumental Ancient God — pure inline SVG, no external image/network request.
// Smooth human-like god head (NO cat ears), ceremonial forehead seal, muscular
// ivory/porcelain torso, left solar gauntlet and right corrupt bio-organic arm.
// The same high-resolution illustration is reused by the battle, shop and event.
function oldGodPortrait(){
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 280"
    aria-label="고대의 신" data-design="v2" data-art-tier="myth" data-base="oldgod"
    data-costume="default" data-god-form="monumental" data-ear-shape="none">
    <defs>
      <linearGradient id="god-ivory" x1=".08" y1="0" x2=".92" y2="1">
        <stop stop-color="#fffef9"/><stop offset=".25" stop-color="#f7f3e7"/>
        <stop offset=".56" stop-color="#d9d4ca"/><stop offset=".78" stop-color="#b7aeb4"/>
        <stop offset="1" stop-color="#79727e"/>
      </linearGradient>
      <linearGradient id="god-gold" x1="0" y1="0" x2=".95" y2=".85">
        <stop stop-color="#fff9be"/><stop offset=".22" stop-color="#ffe96b"/>
        <stop offset=".55" stop-color="#f6b82d"/><stop offset=".8" stop-color="#dd7a1d"/>
        <stop offset="1" stop-color="#a94318"/>
      </linearGradient>
      <linearGradient id="god-flesh" x1="0" y1="0" x2="1" y2=".9">
        <stop stop-color="#dba6a0"/><stop offset=".24" stop-color="#a45169"/>
        <stop offset=".52" stop-color="#6e304b"/><stop offset=".8" stop-color="#462038"/>
        <stop offset="1" stop-color="#210f29"/>
      </linearGradient>
      <linearGradient id="god-cloth" x1="0" y1="0" x2=".9" y2="1">
        <stop stop-color="#a96558"/><stop offset=".45" stop-color="#713c3d"/>
        <stop offset="1" stop-color="#301c33"/>
      </linearGradient>
      <radialGradient id="god-core" cx=".38" cy=".34" r=".68">
        <stop stop-color="#fffbd9"/><stop offset=".22" stop-color="#ffe77e"/>
        <stop offset=".49" stop-color="#ffab26"/><stop offset=".72" stop-color="#ff5a1f"/>
        <stop offset=".9" stop-color="#cc2632"/><stop offset="1" stop-color="#62253f"/>
      </radialGradient>
      <radialGradient id="god-aura">
        <stop stop-color="#ffe4a6" stop-opacity=".42"/>
        <stop offset=".62" stop-color="#fba840" stop-opacity=".12"/>
        <stop offset="1" stop-color="#e04d56" stop-opacity="0"/>
      </radialGradient>
      <filter id="god-glow" x="-70%" y="-70%" width="240%" height="240%">
        <feGaussianBlur stdDeviation="4"/>
      </filter>
    </defs>
    <!-- Aura + ceremonial solar halo, suspended ABOVE a smooth skull. -->
    <ellipse cx="120" cy="98" rx="113" ry="145" fill="url(#god-aura)" opacity=".52"/>
    <ellipse id="god-halo" cx="116" cy="19" rx="68" ry="11" fill="none"
      stroke="#ffd55d" stroke-width="9" opacity=".85" filter="url(#god-glow)"/>
    <ellipse cx="116" cy="19" rx="68" ry="11" fill="none" stroke="#fff6b4" stroke-width="4"/>
    <ellipse cx="116" cy="19" rx="55" ry="7" fill="none" stroke="#ffe48a" stroke-width="1.6"/>
    <g fill="#ffe59c" stroke="#fff4ca" stroke-width=".5" opacity=".92">
      <path d="M34 18l4-8 4 8-4 8z M191 18l4-8 4 8-4 8z"/>
      <path d="M109 8l7-7 7 7-7 6z"/>
      <circle cx="48" cy="18" r="2"/><circle cx="184" cy="18" r="2"/>
    </g>
    <!-- Black-red organic arm and coiling muscle tendrils sit BEHIND torso. -->
    <path d="M161 83Q204 64 213 115Q225 139 213 165Q227 188 234 210
      Q236 235 221 240Q212 222 199 219Q223 257 207 268
      Q191 264 183 239Q178 256 166 270L157 216 149 133Z"
      fill="url(#god-flesh)" stroke="#30192e" stroke-width="4.5"/>
    <path d="M174 96Q203 104 203 139Q189 160 209 176Q198 184 180 170
      Q173 190 202 216Q186 228 169 210L166 133Z"
      fill="#e89b94" stroke="#6c3544" stroke-width="2.8" opacity=".8"/>
    <path d="M196 127Q220 153 211 185Q200 197 188 195Q205 178 196 169
      Q183 155 196 127Z" fill="#532337" stroke="#be7170" stroke-width="2"/>
    <path d="M194 176Q211 166 219 179Q222 196 209 205Q191 199 193 185Z"
      fill="#0b0a20" stroke="#d99090" stroke-width="5"/>
    <ellipse cx="209" cy="187" rx="9" ry="12" fill="#160c1d" stroke="#963b55" stroke-width="2"/>
    <g fill="none" stroke-linecap="round">
      <path d="M189 105Q205 120 190 143Q185 165 202 167" stroke="#f3b2a7" stroke-width="4"/>
      <path d="M210 204Q232 215 225 247" stroke="#9d5363" stroke-width="7"/>
      <path d="M173 196Q189 228 181 261" stroke="#d18176" stroke-width="6"/>
      <path d="M210 150Q231 145 236 161" stroke="#6d3450" stroke-width="5"/>
      <path d="M169 111Q193 121 183 149" stroke="#4d243e" stroke-width="4"/>
    </g>
    <!-- Legs and heavy ivory boots, much wider than ordinary towers. -->
    <path d="M79 204Q92 198 112 208L108 262Q96 272 78 262L74 223Z"
      fill="url(#god-ivory)" stroke="#4b404b" stroke-width="4"/>
    <path d="M129 206Q149 198 161 212L170 262Q158 273 138 264L127 229Z"
      fill="url(#god-ivory)" stroke="#4b404b" stroke-width="4"/>
    <path d="M77 255Q94 262 108 254L108 269Q93 278 67 272L65 266Z"
      fill="#f2eee0" stroke="#49434d" stroke-width="3"/>
    <path d="M138 256Q153 262 170 252L181 270Q157 279 139 272Z"
      fill="#e7e2da" stroke="#49434d" stroke-width="3"/>
    <g fill="none" stroke="#c99845" stroke-width="3">
      <path d="M77 244Q94 250 109 245M70 265Q91 269 108 264"/>
      <path d="M136 245Q155 252 167 243M143 263Q163 267 177 263"/>
    </g>
    <!-- Sacred muscular ivory chest with asymmetrical ceremonial armor. -->
    <path d="M58 90Q68 70 92 68L146 67Q165 71 178 91
      L183 151Q182 181 174 209Q140 225 103 221Q65 217 55 192
      L49 128Z" fill="url(#god-ivory)" stroke="#443c48" stroke-width="5"/>
    <path d="M63 99Q80 83 108 91Q120 100 120 113Q106 123 79 122
      L65 114Z" fill="#fffef6" stroke="#beb4ae" stroke-width="1.8"/>
    <path d="M126 93Q150 84 166 100L174 123Q159 135 129 121Z"
      fill="#e9dfd7" stroke="#ab9b9a" stroke-width="2"/>
    <path d="M71 128Q93 131 119 135Q144 132 173 128
      M72 158Q91 165 119 163Q144 162 175 157
      M77 187Q100 194 129 190Q154 188 171 183"
      fill="none" stroke="#baaca7" stroke-width="4" opacity=".78"/>
    <path d="M120 83Q119 112 117 137Q121 159 120 192"
      fill="none" stroke="#d3b56d" stroke-width="3.5" opacity=".8"/>
    <g fill="none" stroke="#e7b74e" stroke-width="3.7" stroke-linecap="round">
      <path d="M55 126Q59 157 74 179L95 182"/>
      <path d="M169 103Q184 137 175 162L156 183"/>
      <path d="M84 214L80 193 95 181 95 150"/>
      <path d="M164 206L160 184 147 167 151 138"/>
      <path d="M69 119Q86 110 103 118M133 120Q150 110 170 112"/>
    </g>
    <!-- Shoulder tusks grow outward from armor, never from the head. -->
    <path d="M59 102Q31 94 24 66Q20 93 32 117Q44 131 64 122Z"
      fill="#f9f7ee" stroke="#4c454f" stroke-width="3.4"/>
    <path d="M171 101Q194 93 198 67Q205 88 197 110Q189 127 173 122Z"
      fill="#f9f7ee" stroke="#4c454f" stroke-width="3.4"/>
    <!-- Solar left shoulder plate. -->
    <path d="M61 105Q40 85 20 107Q9 125 21 157L53 163 67 121Z"
      fill="url(#god-ivory)" stroke="#514449" stroke-width="4"/>
    <ellipse cx="36" cy="126" rx="17" ry="25" fill="#fffdf2"
      stroke="#ffdf46" stroke-width="6"/>
    <ellipse cx="36" cy="126" rx="12" ry="20" fill="#fdfbf5" stroke="#c7a26b" stroke-width="1.7"/>
    <!-- Monumental solar gauntlet, bigger than the opposite arm. -->
    <path d="M24 156Q44 153 58 164L57 224Q55 241 50 255Q47 272 29 276
      Q7 273 8 250L11 195Q11 169 24 156Z"
      fill="url(#god-gold)" stroke="#bf6c16" stroke-width="4.5"/>
    <path d="M16 180Q31 171 54 182L51 198Q31 194 12 201"
      fill="#fff29f" opacity=".65"/>
    <g fill="none" stroke="#ffe997" stroke-width="3" opacity=".9">
      <path d="M17 201Q32 196 53 209"/>
      <path d="M13 220Q28 215 52 224"/>
      <path d="M11 247Q28 237 50 243"/>
      <path d="M22 267Q27 255 27 244"/>
      <path d="M39 269Q40 255 43 250"/>
    </g>
    <path d="M17 167Q26 153 52 164" fill="none" stroke="#ffed90" stroke-width="6"/>
    <g fill="#fff8c7" opacity=".9">
      <circle cx="22" cy="187" r="2.4"/><circle cx="44" cy="214" r="2.1"/>
      <path d="M20 239l4-8 4 8-4 7z"/>
    </g>
    <!-- Corrupted shoulder plating, ribs and blood vessels crossing the chest. -->
    <path d="M151 80Q180 83 190 115Q180 129 166 134L151 116Z"
      fill="#9a5a66" stroke="#5c3446" stroke-width="3"/>
    <path d="M176 125Q187 146 174 166L167 196Q186 177 188 160L182 139Z"
      fill="url(#god-flesh)" stroke="#5c2d41" stroke-width="2.5"/>
    <g fill="none" stroke="#b56c69" stroke-width="3" opacity=".9">
      <path d="M163 98L149 116 165 138 146 161 155 182 139 198"/>
      <path d="M177 112L167 135 175 152 162 171"/>
      <path d="M142 100Q133 116 149 130L138 142Q133 162 143 174"/>
      <path d="M110 109Q99 124 103 138L88 150 95 175"/>
    </g>
    <g fill="none" stroke="#ffb755" stroke-width="1.6" opacity=".95">
      <path d="M166 94l-25 17-6 22-21 11-5 35"/>
      <path d="M175 143l-20 14 3 26-20 16"/>
      <path d="M106 102l13 25-15 19 14 26-17 18"/>
    </g>
    <!-- Six red/amber living cores, faceted outer rings and highlights. -->
    <g fill="#552239" stroke="#b3693d" stroke-width="3">
      <circle cx="116" cy="107" r="15"/><circle cx="171" cy="127" r="17"/>
      <circle cx="91" cy="163" r="12"/><circle cx="155" cy="173" r="11"/>
      <circle cx="126" cy="195" r="10"/><circle cx="166" cy="205" r="8"/>
    </g>
    <g fill="url(#god-core)" stroke="#ffb04c" stroke-width="2.6">
      <circle cx="116" cy="107" r="10.8"/><circle cx="171" cy="127" r="12.5"/>
      <circle cx="91" cy="163" r="8"/><circle cx="155" cy="173" r="7"/>
      <circle cx="126" cy="195" r="6.4"/><circle cx="166" cy="205" r="4.5"/>
    </g>
    <g fill="#fffbd6" opacity=".95">
      <circle cx="112" cy="103" r="3.5"/><circle cx="167" cy="123" r="4"/>
      <circle cx="88" cy="159" r="2.5"/><circle cx="152" cy="170" r="2"/>
    </g>
    <!-- Ragged ritual waistcloth, engraved clasp and layered cloth threads. -->
    <path d="M77 214Q115 228 171 210L169 230 146 240 129 261 115 241
      101 278 86 249 68 263 64 233Z"
      fill="url(#god-cloth)" stroke="#3d2736" stroke-width="4"/>
    <path d="M77 222Q103 239 127 226L147 217M86 239l15 31 18-41
      M126 232l18 20 18-27" fill="none" stroke="#d7946a" stroke-width="2.5"/>
    <path d="M77 218Q115 233 169 218" fill="none" stroke="#ecc879" stroke-width="4"/>
    <path d="M112 222l8-7 8 7-8 9z" fill="#fff1a5" stroke="#b67c33" stroke-width="2"/>
    <g fill="#f7d696" opacity=".8"><circle cx="81" cy="226" r="1.6"/>
      <circle cx="157" cy="228" r="1.6"/><circle cx="95" cy="236" r="1.6"/></g>
    <!-- Smooth divine cranium with an engraved golden forehead seal. -->
    <path data-anatomy="smooth-head" d="M84 49Q86 34 103 31Q119 27 137 32Q154 37 157 53
      Q162 73 152 91Q143 104 120 105Q96 104 86 89Q78 75 84 49Z"
      fill="url(#god-ivory)" stroke="#403a47" stroke-width="4.6"/>
    <path d="M95 42Q118 34 145 42" fill="none" stroke="#fffdf5" stroke-width="4" opacity=".8"/>
    <path d="M105 34L120 30 133 35 129 49 119 54 110 47Z"
      fill="#e4c782" stroke="#875833" stroke-width="2.6"/>
    <path d="M120 36l5 8-5 6-5-6z" fill="url(#god-core)"/>
    <g fill="#ff6228" stroke="#382331" stroke-width="3.2">
      <ellipse cx="102" cy="66" rx="5.8" ry="7.6"/>
      <ellipse cx="139" cy="66" rx="5.8" ry="7.6"/>
    </g>
    <g fill="#fff1b5"><circle cx="100" cy="63.5" r="1.9"/><circle cx="137" cy="63.5" r="1.9"/></g>
    <path d="M109 87Q120 74 131 87L124 86 118 94 112 89"
      fill="#f8f3e8" stroke="#4d444e" stroke-width="3.6" stroke-linejoin="round"/>
    <path d="M94 84l6 3M140 86l6-3" stroke="#8f797b" stroke-width="1.8" opacity=".9"/>
    <!-- Final enchanted gold collar and symmetrical decorative throat ribs. -->
    <path d="M91 98Q105 108 120 111Q137 107 153 98L155 107
      Q135 121 120 122Q105 121 89 106Z"
      fill="#e9bd4d" stroke="#a87531" stroke-width="2.6"/>
    <path d="M100 108L120 115 143 107" fill="none" stroke="#fff2af" stroke-width="2"/>
  </svg>`;
}

// Hand-authored scalable figure based on the supplied character reference.
// All artwork is self-contained SVG; no requests during gameplay.
function voidWalkerPortrait(){return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 180 210\" aria-label=\"심연의 방랑자\" data-design=\"v2\" data-art-tier=\"myth\" data-base=\"voidwalker\" data-costume=\"default\">\n<defs>\n<linearGradient id=\"vw-pants\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop stop-color=\"#40577a\"/><stop offset=\".53\" stop-color=\"#242d4d\"/><stop offset=\"1\" stop-color=\"#151629\"/></linearGradient>\n<linearGradient id=\"vw-sash\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop stop-color=\"#84d4fd\"/><stop offset=\".45\" stop-color=\"#237dc1\"/><stop offset=\"1\" stop-color=\"#1d315f\"/></linearGradient>\n<linearGradient id=\"vw-cloth\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop stop-color=\"#e85bd2\"/><stop offset=\".6\" stop-color=\"#8c368c\"/><stop offset=\"1\" stop-color=\"#432047\"/></linearGradient>\n<radialGradient id=\"vw-flame\"><stop stop-color=\"#ffeafa\"/><stop offset=\".24\" stop-color=\"#c995ff\"/><stop offset=\".62\" stop-color=\"#994afa\"/><stop offset=\"1\" stop-color=\"#6732e8\" stop-opacity=\"0\"/></radialGradient>\n</defs>\n<ellipse cx=\"90\" cy=\"194\" rx=\"68\" ry=\"11\" fill=\"#ee2464\" opacity=\".25\"/>\n<g stroke=\"#b85af1\" stroke-linecap=\"round\" fill=\"none\">\n <path d=\"M38 135Q17 125 20 111Q6 95 22 78Q10 102 37 112Q27 117 38 135M142 143Q166 122 151 106Q172 83 155 64Q160 88 140 102\" stroke-width=\"6\" opacity=\".58\"/>\n <path d=\"M31 127Q5 118 11 97M152 136Q173 119 171 95M47 148Q28 136 32 118M143 151Q159 135 149 122\" stroke-width=\"2.7\" opacity=\".9\"/>\n</g>\n<g stroke=\"#271a38\" stroke-width=\"2.4\" stroke-linejoin=\"round\">\n <!-- Flowing blue cape, split dark trousers and sandal feet -->\n <path d=\"M75 99Q56 115 56 155L48 184Q70 196 86 177L100 117Z\" fill=\"#2377a7\"/>\n <path d=\"M98 103Q118 124 126 172L138 188Q115 199 99 179L85 122Z\" fill=\"url(#vw-pants)\"/>\n <path d=\"M62 129Q64 159 58 184L81 185L93 143L103 185L123 182Q119 149 113 124Z\" fill=\"url(#vw-pants)\"/>\n <path d=\"M60 183L57 197Q66 204 79 198L82 186Z M105 185L103 199Q118 205 130 198L123 182Z\" fill=\"#b99082\"/>\n <path d=\"M56 196Q63 200 81 198M103 198Q119 203 131 198\" stroke=\"#763647\" fill=\"none\"/>\n <path d=\"M62 190L80 189M108 190L124 189\" stroke=\"#78425a\" fill=\"none\" stroke-width=\"3\"/>\n <!-- body and exposed tattooed chest -->\n <path d=\"M73 76Q90 69 108 78L118 111L110 131L67 126L62 101Z\" fill=\"#ae837e\"/>\n <path d=\"M80 81Q89 95 98 81Q106 91 103 111Q94 116 90 122Q79 108 76 101Z\" fill=\"#93626e\" opacity=\".68\"/>\n <path d=\"M85 89q21-7 14 11q-8 15-18-1q-3-15 16-13M84 96q18 0 8 11M89 91l-8-12M93 91l11-11M91 102l-9 16M95 101l10 14\" fill=\"none\" stroke=\"#4c253d\" stroke-width=\"3.2\"/>\n <!-- wide royal-blue sash and magenta drape -->\n <path d=\"M109 91Q91 105 66 120L70 133Q96 125 120 106Z\" fill=\"url(#vw-sash)\"/>\n <path d=\"M111 105Q94 117 74 120L65 138Q100 136 116 121Z\" fill=\"#34538a\"/>\n <path d=\"M81 131Q92 130 105 126L100 190L82 182Z\" fill=\"url(#vw-cloth)\"/>\n <path d=\"M94 137Q93 170 91 186\" fill=\"none\" stroke=\"#f285e5\" stroke-width=\"2\"/>\n <path d=\"M104 121L116 115L120 126L108 132Z\" fill=\"#d09b51\"/>\n <!-- arms -->\n <path d=\"M66 87Q55 93 53 117L44 153Q48 165 58 158L70 123L79 97Z\" fill=\"#b18b88\"/>\n <path d=\"M110 89Q123 91 128 115L143 151Q142 165 132 159L115 129L103 96Z\" fill=\"#bd9993\"/>\n <path d=\"M45 151q-9 8-5 15q5 5 8-2q-2 10 5 10q5-2 3-10q6 8 9 1l-8-14M132 153q-6 12 2 17q4 2 6-8q-1 10 6 8q6-3-1-18\" fill=\"#d9aaa1\"/>\n <!-- head and silver hair -->\n <path d=\"M70 58Q65 35 83 31Q104 26 113 42L115 59L109 78Q95 90 79 76Z\" fill=\"#b98d86\"/>\n <path d=\"M66 53Q53 37 69 21Q82 11 104 24Q114 14 123 31L119 48Q110 39 107 29Q90 39 69 37Z\" fill=\"#e9ebf5\"/>\n <path d=\"M69 47Q64 64 71 87Q62 82 60 66Q53 47 61 34M113 39Q123 50 119 72Q128 65 126 49\" fill=\"#cce1f4\"/>\n <path d=\"M83 24Q99 9 114 24Q119 30 113 39Q100 26 83 34Z\" fill=\"#eeeaf5\"/>\n <!-- purple head wrap -->\n <path d=\"M63 45Q74 18 107 25L118 40L111 50Q94 40 77 54L68 60Z\" fill=\"#8f387e\"/>\n <path d=\"M60 46Q72 22 104 27L112 36M73 53Q97 38 112 48\" stroke=\"#db6ac0\" stroke-width=\"3\" fill=\"none\"/>\n <path d=\"M81 60L89 59M102 58L108 59M90 70Q100 77 107 67\" fill=\"none\" stroke=\"#402c43\" stroke-width=\"2.3\"/>\n <path d=\"M120 35Q141 20 130 10M66 25Q59 15 64 8M113 65Q132 82 118 97\" fill=\"none\" stroke=\"#e5edfa\" stroke-width=\"3\"/>\n</g>\n<!-- Distinct violet energy in each hand -->\n<g opacity=\".95\">\n<circle cx=\"49\" cy=\"156\" r=\"21\" fill=\"url(#vw-flame)\"/><circle cx=\"141\" cy=\"151\" r=\"20\" fill=\"url(#vw-flame)\"/>\n<g stroke=\"#da93ff\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\">\n<path d=\"M42 146q-10-17 4-29q-3 18 10 21q15 17-1 28M140 138q17-19 5-30q3 15-5 18q-14 12 2 29\"/>\n<path d=\"M31 149l-9-11M55 139l8-13M154 148l12-17M137 165l-4 10\"/>\n</g><circle cx=\"49\" cy=\"153\" r=\"5\" fill=\"#eddbff\"/><circle cx=\"140\" cy=\"151\" r=\"5\" fill=\"#eddbff\"/>\n</g></svg>";}

// Three bespoke tower silhouettes, rendered as self-contained vector portraits.
// Original shapes are independent of the legacy fighter portrait templates.
const NEW_TOWER_SCENES={
  pulsekeeper:'<g stroke-linejoin="round" stroke-linecap="round">'
   +'<path d="M48 118Q28 146 25 187L61 195L84 159L112 196L152 187Q143 138 122 115Z" fill="#5e3d85" stroke="#322948" stroke-width="5"/>'
   +'<path d="M68 156L62 196L82 198L92 158M107 159L119 197L141 195L127 157" fill="#28365b" stroke="#2d2949" stroke-width="5"/>'
   +'<path d="M59 74Q44 79 43 122L65 141L89 117L117 141L138 124Q134 83 110 73Z" fill="#8d55ae" stroke="#302948" stroke-width="5"/>'
   +'<path d="M62 106Q84 88 115 107L112 143L66 139Z" fill="#c080d8" stroke="#543569" stroke-width="4"/>'
   +'<path d="M65 86Q50 48 68 30Q85 15 111 27Q130 49 114 88L95 106Z" fill="#412c67" stroke="#c38ae4" stroke-width="5"/>'
   +'<path d="M66 53Q72 27 89 24Q105 29 111 50L102 76L82 78Z" fill="#e4b5a5" stroke="#45324e" stroke-width="3"/>'
   +'<path d="M66 50Q76 29 84 28L79 56L100 43L113 48Q102 15 84 23Q65 26 61 46Z" fill="#ece8ff" stroke="#6c5c9e" stroke-width="3"/>'
   +'<path d="M77 60L84 59M97 59L104 60" stroke="#432c57" stroke-width="4"/>'
   +'<path d="M59 106L36 124L27 152Q32 163 41 154L72 133M119 106L141 126L152 150Q147 163 136 153L107 134" fill="#e0ad9f" stroke="#5a3956" stroke-width="5"/>'
   +'<ellipse cx="88" cy="135" rx="45" ry="41" fill="#663969" stroke="#ffe3ad" stroke-width="6"/>'
   +'<ellipse cx="88" cy="135" rx="36" ry="33" fill="#cf83ec" stroke="#e6c4fd" stroke-width="4"/>'
   +'<ellipse cx="88" cy="135" rx="24" ry="23" fill="#3d2c68" stroke="#ffe6bc" stroke-width="3"/>'
   +'<path d="M88 109v52M62 135h52M70 117l36 36M106 117l-36 36" stroke="#e2b8ff" stroke-width="3"/>'
   +'<circle cx="88" cy="135" r="9" fill="#fff2e0"/><path d="M40 134L25 128M138 132l17-5" stroke="#c2a5ff" stroke-width="5"/>'
   +'<ellipse cx="88" cy="134" rx="58" ry="19" fill="none" stroke="#d5a1fb" stroke-width="2.5" stroke-dasharray="12 9"/>'
   +'</g>',
  duskarcher:'<g stroke-linejoin="round" stroke-linecap="round">'
   +'<path d="M44 88Q17 122 28 190L67 197L88 156L119 196L157 191Q144 116 127 85Z" fill="#2e2e4f" stroke="#4e3e70" stroke-width="5"/>'
   +'<path d="M67 142L58 198L85 198L92 161M106 155L121 199L145 198L129 140" fill="#414466" stroke="#282943" stroke-width="5"/>'
   +'<path d="M56 86Q89 73 121 87L136 132L110 152L71 149L46 130Z" fill="#625c89" stroke="#272943" stroke-width="5"/>'
   +'<path d="M75 122L121 113L123 143L91 154Z" fill="#b4a2d2" stroke="#59446b" stroke-width="4"/>'
   +'<path d="M61 96Q53 72 63 46Q76 20 103 27Q129 39 128 68L120 98Z" fill="#383653" stroke="#aa83cc" stroke-width="5"/>'
   +'<path d="M67 53Q90 34 115 52L113 81L79 95L69 78Z" fill="#caa99d" stroke="#3c344b" stroke-width="3"/>'
   +'<path d="M63 51L83 24L103 28L123 49L117 65L103 55L78 65L68 81Z" fill="#4b3d66" stroke="#af89d0" stroke-width="4"/>'
   +'<path d="M75 68l13-2m13-1 11 1" stroke="#d6fff9" stroke-width="4"/><path d="M85 81q12 6 23-1" fill="none" stroke="#584055" stroke-width="3"/>'
   +'<path d="M51 100L31 136L38 159L55 152L75 121M126 102L142 132L136 154L119 151L111 119" fill="#d2a89f" stroke="#5a3e53" stroke-width="5"/>'
   +'<path d="M143 26Q161 65 152 103Q165 145 141 187" fill="none" stroke="#dcb3e8" stroke-width="8"/>'
   +'<path d="M143 27Q113 88 143 188M143 26L132 35M143 188l-11-9" fill="none" stroke="#ffead1" stroke-width="2.8"/>'
   +'<path d="M54 135L143 107L54 143" fill="none" stroke="#a4e7eb" stroke-width="5"/>'
   +'<path d="M143 107l-20-10v20Z" fill="#f2e1ff" stroke="#a9d5ff" stroke-width="3"/>'
   +'<path d="M27 54l25 20M32 49l26 18M39 43l22 17" stroke="#d2bed2" stroke-width="4"/>'
   +'<path d="M32 44L26 91L42 94L53 54Z" fill="#4c3b5d" stroke="#e2aadd" stroke-width="3"/>'
   +'<circle cx="142" cy="107" r="6" fill="#ffecfc"/>'
   +'</g>',
  crystalspider:'<g stroke-linejoin="round" stroke-linecap="round">'
   +'<g fill="none" stroke="#65eedb" stroke-width="8">'
   +'<path d="M64 108L29 89L12 108M66 125L23 123L8 144M65 143L30 155L24 183M118 108L150 89L166 108M117 125L155 122L170 145M119 143L152 155L160 183"/>'
   +'</g><g fill="none" stroke="#b3fff1" stroke-width="3">'
   +'<path d="M62 108L29 89L12 108M64 125L23 123L8 144M64 143L30 155L24 183M120 108L150 89L166 108M119 125L155 122L170 145M121 143L152 155L160 183"/>'
   +'</g>'
   +'<path d="M64 85Q72 57 91 58Q114 56 121 86L129 143Q93 176 53 142Z" fill="#2a5470" stroke="#8bf4e8" stroke-width="6"/>'
   +'<path d="M59 104L41 144L68 169L90 146L111 169L140 143L122 105Z" fill="#42628c" stroke="#63bcb9" stroke-width="5"/>'
   +'<path d="M60 141L51 187L76 190L88 153M99 153L113 190L137 188L123 142" fill="#273f63" stroke="#65b9be" stroke-width="5"/>'
   +'<path d="M63 75Q54 47 74 28L99 17L120 35L125 75L111 92L72 91Z" fill="#3c6a85" stroke="#a2fff2" stroke-width="5"/>'
   +'<path d="M70 38L91 12L115 33L108 60L80 61Z" fill="#9fffea" stroke="#d9fff7" stroke-width="4"/>'
   +'<path d="M79 58L87 72L79 84L67 72M103 58L112 70L105 83L94 70" fill="#b6fff5" stroke="#385b6c" stroke-width="3"/>'
   +'<path d="M80 65l9 8 8-8" fill="none" stroke="#263851" stroke-width="3"/>'
   +'<path d="M60 103L46 121L41 144L58 149L74 119M122 103L137 121L142 144L127 150L111 117" fill="#b4a2a5" stroke="#407a8c" stroke-width="5"/>'
   +'<path d="M86 94L108 105L101 131L84 143L65 124L70 101Z" fill="#91ffed" stroke="#e4fffa" stroke-width="5"/>'
   +'<path d="M86 101L98 113L89 134L75 119Z" fill="#4cb5bc" stroke="#e1fff7" stroke-width="2.7"/>'
   +'<circle cx="89" cy="116" r="5" fill="#fff"/><path d="M80 172L89 187L98 172" fill="none" stroke="#8cfbe8" stroke-width="5"/>'
   +'<path d="M70 49L53 31M111 46L132 27" stroke="#cbfff3" stroke-width="5"/>'
   +'</g>'
};
function expansionPortrait(id,skin='default'){
 const scene=NEW_TOWER_SCENES[id];if(!scene)return null;
 const rarity=TOWERS[id]?.rarity||'rare';
 const tier=BASE_ART_TIERS[rarity]||'craft';
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 210" aria-label="'+id+'" data-base="'+id+'" data-design="v2" data-art-tier="'+tier+'" data-costume="'+skin+'">'
 +'<ellipse cx="91" cy="194" rx="67" ry="10" fill="#1e2034" opacity=".27"/>'
 +'<ellipse cx="91" cy="182" rx="51" ry="8" fill="none" stroke="'+(id==='crystalspider'?'#65ffdf':'#cba4fa')+'" stroke-width="3" opacity=".6"/>'
 +scene+'</svg>';
}


// Summon-rework portraits: five separately authored silhouettes. Each one has
// visible equipment tied to its actual new role, not a shared palette swap.
function redesignedSummonPortrait(id,skin='default'){
  if(!['spirit','phoenix','summoner','papercrane','crystalspider'].includes(id))return null;
  const base=DESIGNS[id],costume=SCHEMES[skin];
  const c=costume?{...base,...costume}:base;
  const tint=c.trim,main=c.main,deep=c.dark,key='summon-'+id+'-'+skin;
  const defs='<defs><linearGradient id="'+key+'-armor" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+main+'"/><stop offset=".5" stop-color="'+tint+'"/><stop offset="1" stop-color="'+deep+'"/></linearGradient><radialGradient id="'+key+'-glow"><stop stop-color="#ffffff"/><stop offset=".25" stop-color="'+tint+'"/><stop offset="1" stop-color="'+main+'" stop-opacity="0"/></radialGradient></defs>';
  const armor='url(#'+key+'-armor)',glow='url(#'+key+'-glow)';
  const foot='<ellipse cx="94" cy="198" rx="70" ry="9" fill="#111a32" opacity=".32"/>';
  let figure='';
  if(id==='spirit'){
    // Legendary air-command operator, in a gunmetal carrier exosuit.
    figure='<g stroke-linejoin="round" stroke-linecap="round">'
      +'<path d="M42 73L19 97L22 149L55 142L63 111M130 71l27 28-4 50-33-6-8-37" fill="#26344e" stroke="'+tint+'" stroke-width="5"/>'
      +'<path d="M71 141L54 193L84 196L95 156L111 195L141 191L125 136" fill="#25304c" stroke="'+deep+'" stroke-width="6"/>'
      +'<path d="M63 69L127 68L139 116L123 153L62 153L47 117Z" fill="'+armor+'" stroke="'+deep+'" stroke-width="6"/>'
      +'<path d="M76 84l19-12 22 13 9 37-32 20-33-20Z" fill="#1d3554" stroke="#a1faff" stroke-width="4"/>'
      +'<path d="M69 53L76 26L113 22L126 50L118 85L80 86Z" fill="#2c3a5c" stroke="'+deep+'" stroke-width="5"/>'
      +'<path d="M65 48Q92 30 129 47L122 65L76 67Z" fill="#1e2941" stroke="#76fffa" stroke-width="4"/>'
      +'<path d="M76 59l43-2-6 17-31 0Z" fill="#80f9ff" stroke="#e2ffff" stroke-width="3"/>'
      +'<path d="M85 66h24" stroke="#23477a" stroke-width="4"/><path d="M89 87L101 87L95 101Z" fill="#d1c5d9"/>'
      +'<path d="M54 91L29 116L36 151L52 156L67 121M134 91L155 116L147 151L132 155L119 119" fill="'+armor+'" stroke="'+deep+'" stroke-width="4"/>'
      +'<path d="M48 111L27 99l-9 9 14 15M140 110l22-11 8 11-17 16" fill="#294760" stroke="#a1ebff" stroke-width="4"/>'
      +'<rect x="39" y="121" width="31" height="22" rx="6" fill="#1d2b48" stroke="#a9ecff" stroke-width="4"/>'
      +'<circle cx="48" cy="132" r="5" fill="#72ffff"/><path d="M58 125v14m-7-7h15" stroke="#b5fff7" stroke-width="2.5"/>'
      +'<path d="M140 80l22-39m-5 8 17-18" stroke="#e6faff" stroke-width="5"/><circle cx="174" cy="32" r="8" fill="#75e8ff"/>'
      +'<path d="M20 48l-10-22 27 6 14 21ZM139 48l12-23 25 7-14 21Z" fill="#293d5b" stroke="#72f9ff" stroke-width="4"/>'
      +'<circle cx="28" cy="31" r="13" fill="'+glow+'"/><circle cx="161" cy="30" r="13" fill="'+glow+'"/>'
      +'<ellipse cx="28" cy="31" rx="23" ry="5" fill="none" stroke="#bdffff" stroke-width="4"/>'
      +'<ellipse cx="161" cy="30" rx="23" ry="5" fill="none" stroke="#bdffff" stroke-width="4"/>'
      +'</g>';
  }else if(id==='phoenix'){
    // A ritual reincarnation mage with real firebird mantle and sun furnace.
    figure='<g stroke-linejoin="round" stroke-linecap="round">'
      +'<path d="M57 98Q20 48 13 9Q51 24 70 71Q75 25 83 6Q102 31 106 66Q134 19 172 7Q161 68 129 106" fill="#d45166" stroke="#ffb07a" stroke-width="6"/>'
      +'<path d="M62 100Q-4 102 17 163L51 132L41 177L75 151M116 100q67-4 59 60l-39-30 7 48-35-29" fill="#8b3454" stroke="#ffca7d" stroke-width="6"/>'
      +'<path d="M61 121L43 195L74 199L94 169L121 200L148 195L126 118Z" fill="#582c53" stroke="#f99b65" stroke-width="5"/>'
      +'<path d="M64 73Q95 52 128 76L134 136L109 156L72 147L56 124Z" fill="'+armor+'" stroke="'+deep+'" stroke-width="6"/>'
      +'<path d="M75 104L95 88L116 106L108 135L80 135Z" fill="#ffcc79" stroke="#ffebbd" stroke-width="4"/>'
      +'<path d="M75 62L76 43Q89 23 112 36L121 64L114 87L84 88Z" fill="#d4a69d" stroke="#7d3854" stroke-width="4"/>'
      +'<path d="M72 50Q55 31 77 13L89 29Q104 -1 125 20L115 40L125 58L106 48L90 62Z" fill="#ff975c" stroke="#ffdf87" stroke-width="4"/>'
      +'<path d="M83 67l10-2m11-2 10 2" stroke="#763852" stroke-width="4"/>'
      +'<path d="M56 98L33 123L26 152L48 160L74 119M136 99l22 24 9 29-24 8-28-38" fill="#db9c91" stroke="#8d4651" stroke-width="5"/>'
      +'<path d="M22 156Q12 133 30 113Q25 138 46 148M151 151q34-17 10-43 5 23-22 33" fill="#ffd36b" stroke="#f37a5e" stroke-width="4"/>'
      +'<circle cx="97" cy="116" r="17" fill="'+glow+'"/><circle cx="97" cy="116" r="7" fill="#fff4bd"/>'
      +'<path d="M82 27Q93 2 106 26M40 56Q14 28 29 18M150 62q31-36 13-47" fill="none" stroke="#ffe99a" stroke-width="5"/>'
      +'</g>';
  }else if(id==='summoner'){
    // Expeditionary goblin marshal and shield maker.
    figure='<g stroke-linejoin="round" stroke-linecap="round">'
      +'<path d="M62 116Q34 129 28 194L73 191L95 159L115 193L151 196Q143 139 124 114Z" fill="#365744" stroke="#adc58b" stroke-width="5"/>'
      +'<path d="M71 150L62 197L86 198L95 165M108 164L117 198L139 198L128 151" fill="#314743" stroke="#263b38" stroke-width="5"/>'
      +'<path d="M67 76L119 74L136 114L122 153L68 152L51 113Z" fill="'+armor+'" stroke="'+deep+'" stroke-width="5"/>'
      +'<path d="M75 97L97 87L116 104L109 134L83 135Z" fill="#49674c" stroke="#d9e5a5" stroke-width="3"/>'
      +'<path d="M64 67Q58 31 86 25Q113 16 130 51L122 89L74 90Z" fill="#497c62" stroke="#293f42" stroke-width="5"/>'
      +'<path d="M62 56L41 37L51 72L72 77M123 52l22-22-4 42-19 8" fill="#9eda8e" stroke="#476454" stroke-width="4"/>'
      +'<path d="M75 62l12-3m22-3 11 4" stroke="#eaffad" stroke-width="5"/>'
      +'<path d="M79 80Q97 88 110 79" fill="none" stroke="#2d493e" stroke-width="4"/>'
      +'<path d="M59 96L31 121L28 159L52 163L76 122M128 94l27 25 8 39-24 6-28-41" fill="#72a57d" stroke="#3a5f54" stroke-width="4"/>'
      +'<path d="M19 190V26" stroke="#cfb782" stroke-width="9"/><path d="M19 28l24-17 8 27-30 18Z" fill="#cee8a6" stroke="#5f856c" stroke-width="5"/>'
      +'<path d="M26 73L67 86L27 105Z" fill="#87b884" stroke="#f4f2bd" stroke-width="3"/>'
      +'<path d="M123 119L160 114L168 145L141 158L114 144Z" fill="#4a7e6b" stroke="#e2f4aa" stroke-width="4"/>'
      +'<path d="M131 129L150 124L157 138L143 144Z" fill="#d7ed9e"/><circle cx="20" cy="21" r="10" fill="'+glow+'"/>'
      +'</g>';
  }else if(id==='papercrane'){
    // Fine-lined origami architect, surrounded by distinct paper birds.
    figure='<g stroke-linejoin="round" stroke-linecap="round">'
      +'<path d="M45 124L21 192L67 199L94 163L123 199L159 194L135 121Z" fill="#f5e5c9" stroke="#8d7a84" stroke-width="5"/>'
      +'<path d="M65 137L52 195L82 198L93 167M108 169l17 28 30-5-21-51" fill="#cfb3ad" stroke="#8d7883" stroke-width="4"/>'
      +'<path d="M64 76Q99 54 129 80L138 132L118 158L70 156L49 130Z" fill="'+armor+'" stroke="'+deep+'" stroke-width="5"/>'
      +'<path d="M63 96L119 90L128 123L98 150L65 130Z" fill="#f9f4dc" stroke="#baa397" stroke-width="4"/>'
      +'<path d="M73 63Q74 32 94 23L117 36L119 70L107 88L81 82Z" fill="#e1bdad" stroke="#8b7e84" stroke-width="4"/>'
      +'<path d="M63 58Q72 27 101 15Q127 25 131 52L121 63L95 50L73 79Z" fill="#e9ece7" stroke="#ae9e9f" stroke-width="4"/>'
      +'<path d="M83 66l8-2m13-3 10 2" stroke="#51435f" stroke-width="3"/>'
      +'<path d="M53 99L31 124L27 161L53 169L78 130M126 96l25 28 9 34-26 8-29-34" fill="#e1bca9" stroke="#9c7e84" stroke-width="4"/>'
      +'<path d="M35 94L5 40L64 68L83 37L70 113Z" fill="#fffef1" stroke="#baaaad" stroke-width="4"/>'
      +'<path d="M120 73L163 26L165 86L138 124Z" fill="#faf2d7" stroke="#baaaad" stroke-width="4"/>'
      +'<path d="M7 42L62 70M163 27L145 84" stroke="#c8b3bf" stroke-width="2"/>'
      +'<path d="M58 145L95 127L118 146L97 160Z" fill="#fff8e0" stroke="#c9b4b2" stroke-width="4"/>'
      +'<path d="M91 91L102 96L98 116L90 122L84 104Z" fill="#c5a7ad"/>'
      +'<circle cx="20" cy="50" r="4" fill="#f4dfcb"/><circle cx="155" cy="38" r="4" fill="#f4dfcb"/>'
      +'</g>';
  }else if(id==='crystalspider'){
    // Living armored spider foundry with a queen-like geode helm.
    figure='<g stroke-linejoin="round" stroke-linecap="round">'
      +'<path d="M52 72L13 45L10 92L59 118M127 72l40-28 10 53-46 21M54 118L14 143L11 177L58 160M128 117l43 27 5 31-48-19" fill="none" stroke="#6bfae2" stroke-width="10"/>'
      +'<path d="M52 73L13 45L10 92L59 118M127 72l40-28 10 53-46 21M54 118L14 143L11 177L58 160M128 117l43 27 5 31-48-19" fill="none" stroke="#2d5268" stroke-width="4"/>'
      +'<path d="M69 150L56 195L87 198L96 169L113 199L145 196L127 144Z" fill="#1d3e61" stroke="#60bcbf" stroke-width="5"/>'
      +'<path d="M59 73Q93 51 128 72L136 137L114 157L68 156L47 130Z" fill="'+armor+'" stroke="#31516a" stroke-width="5"/>'
      +'<path d="M73 96L94 83L116 98L108 132L88 145L68 128Z" fill="#74fbe7" stroke="#dcfff4" stroke-width="4"/>'
      +'<path d="M65 64L70 32L92 10L115 28L126 62L113 84L74 83Z" fill="#30607b" stroke="#b7ffed" stroke-width="5"/>'
      +'<path d="M72 37L91 10L115 28L107 52L80 52Z" fill="#a9ffed" stroke="#eefff9" stroke-width="3"/>'
      +'<path d="M77 66l12 5m13-5 11 5" stroke="#eafffb" stroke-width="4"/>'
      +'<path d="M53 99L35 121L26 155L50 163L74 130M130 97l20 27 8 31-24 7-25-32" fill="#80a6a8" stroke="#497d87" stroke-width="5"/>'
      +'<path d="M67 112L93 97L121 116L94 143Z" fill="#c0fff6" stroke="#378f99" stroke-width="3"/>'
      +'<circle cx="94" cy="117" r="7" fill="#ffffff"/><circle cx="94" cy="117" r="3" fill="#59dbcb"/>'
      +'<path d="M63 29l-15-17m67 17 18-17" stroke="#d4fff4" stroke-width="5"/>'
      +'</g>';
  }
  // A purchased costume adds a silhouette-defining mechanical/ritual badge,
  // not merely a palette swap; collectible variants remain recognizable.
  if(skin!=='default'){
    const emblem=skin==='hologram'?'M13 15L36 7 47 29 25 42Z':
      skin==='frostfire'?'M24 8L48 29 25 51 11 29Z':
      skin==='celestial'?'M22 13L39 6 54 31 36 45Z':
      skin==='starlight'?'M16 7L36 26 22 47 8 27Z':
      skin==='solstice'?'M26 7Q48 19 35 43Q12 35 26 7Z':
      'M21 7L46 13 41 41 16 36Z';
    figure+='<g data-costume-shape="'+skin+'"><path d="'+emblem+'" fill="'+tint+'" stroke="#f7ffff" stroke-width="3"/><circle cx="29" cy="26" r="4" fill="#fff"/></g>';
  }
  const tier=skin!=='default'?'costume':BASE_ART_TIERS[TOWERS[id]?.rarity||'rare'];
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 210" aria-label="'+id+' '+skin+'" data-design="v2" data-art-tier="'+tier+'" data-base="'+id+'" data-costume="'+skin+'" data-summon-model="rework">'
    +defs+foot+figure+'</svg>';
}

export function redesignedPortrait(id,skin='default'){
  const christmas=christmasTowerPortrait(id,skin);
  if(christmas)return christmas;
  const summonArtwork=redesignedSummonPortrait(id,skin);
  if(summonArtwork)return summonArtwork;
  const expansion=expansionPortrait(id,skin);
  if(expansion)return expansion;
  if(id==='voidwalker')return voidWalkerPortrait();
  if(id==='oldgod')return oldGodPortrait();
 const base=DESIGNS[id];if(!base)return null;
 const suit=SCHEMES[skin];
 const c=suit?{...base,...suit}:base;
 const rid='shinsung-'+id+'-'+skin;
 const rarity=TOWERS[id]?.rarity||'common';
 // A limited costume is allowed to transform a humble unit into a prestige
 // look. Its ordinary base must not inherit the costume's visual complexity.
 const plain=skin==='default';
 let art;
 if(plain&&(rarity==='common'||rarity==='rare'))
   art=everydayPortrait(id,c,rarity==='rare');
 else{
   const back=plain?prestigeBack(id,c,rarity):'';
   const front=plain?prestigeFront(id,c,rarity):'';
   art=back+(base.rig==='structure'?buildingPortrait(id,c,skin):base.rig==='relic'?relicPortrait(id,c,skin):fighterPortrait(id,c,skin))+front;
 }
 // Signature extras distinguish the new three from generic fighters:
 // the sun knight's radiant lance, gravity rings and living thorn crown.
 if(id==='sunlancer')art+=
   '<circle cx="94" cy="64" r="37" stroke="#ffe7a5" stroke-width="4" stroke-dasharray="9 7" fill="none" opacity=".75"/>'
  +'<path d="M140 28l8-19 9 19 19 10-19 9-9 19-8-19-19-9Z" fill="#fff1c1" stroke="#e4ae5f" stroke-width="3"/>'
  +'<path d="M161 41l15-27m-4 43 15 11" stroke="#ffe9ad" stroke-width="4"/>';
 else if(id==='graviturge')art+=
   '<ellipse cx="94" cy="104" rx="68" ry="24" fill="none" stroke="#cda5ff" stroke-width="4" transform="rotate(-22 94 104)"/>'
  +'<ellipse cx="94" cy="104" rx="56" ry="40" fill="none" stroke="#a28cff" stroke-width="2" transform="rotate(26 94 104)"/>'
  +'<circle cx="153" cy="41" r="9" fill="#e9d8ff" stroke="#9b72e4" stroke-width="4"/>';
 else if(id==='thornkeeper')art+=
   '<path d="M54 50Q44 27 33 30l8 15-20 5 29 15m76-10q13-25 26-25l-4 18 17 4-34 15" fill="#a5dfa2" stroke="#416f55" stroke-width="3"/>'
  +'<path d="M33 146q15-14 25-7m-24 17q18-12 28-7" stroke="#8ad99c" stroke-width="4" fill="none"/>'
  +'<circle cx="151" cy="71" r="9" fill="#baffbe"/>';
 // Every model is standalone and stays recognizable at the 75px battle scale.
 const border=(suit&&['mythic','legendary'].includes(skin))?'': '';
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 210" aria-label="'+id+(skin==='default'?'':' '+skin)+'" data-design="v2" data-art-tier="'+(skin==='default'?BASE_ART_TIERS[rarity]:'costume')+'" data-base="'+id+'" data-costume="'+skin+'">'
  +'<defs><linearGradient id="'+rid+'" x1="0" x2="1" y1="0" y2="1"><stop stop-color="'+c.main+'"/><stop offset="1" stop-color="'+c.dark+'"/></linearGradient></defs>'
  +art+'</svg>';
}
