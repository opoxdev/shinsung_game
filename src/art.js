import { ENEMIES, TOWERS } from './data.js';
import { evolutionAt } from './evolutions.js';
import { redesignedPortrait } from './visual-design.js';
// v0.9.1: everyday common/rare equipment evolves through class-specific tools.
// Epic and above may use distinctive magical and mechanical set pieces.
// Gameplay stats, IDs and owned cosmetics remain unchanged.
function evolvedPortrait(svg,id,level){
  if(!level)return svg;
  const stage=evolutionAt(id,level);
  if(!stage)return svg;
  const rarity=TOWERS[id]?.rarity;
  if(rarity==='common'||rarity==='rare'){
    // Profession upgrades, not generic helmets/crowns/ballistic suits:
    // these small changes are read as skill and equipment, not new heroes.
    const muted=rarity==='rare'?'#b6c9c0':'#b5a28b',ink='#514f49';
    const pieces={
      scout:[
        '<path d="M55 142l13-12 14 11-11 20Z" fill="#8c7759" stroke="'+ink+'" stroke-width="3"/>',
        '<path d="M132 134l19-37m-12 4 21 32" stroke="'+muted+'" stroke-width="4" fill="none"/>',
        '<path d="M66 111l-13 9 14 9" stroke="'+muted+'" stroke-width="3" fill="none"/>',
        '<rect x="63" y="140" width="20" height="14" rx="3" fill="'+muted+'"/>',
        '<path d="M132 86l13 10 17-9" stroke="'+muted+'" stroke-width="3" fill="none"/>'
      ],
      archer:[
        '<path d="M42 109l-10 29 15 12 10-36Z" fill="'+ink+'" stroke="'+muted+'" stroke-width="2"/>',
        '<path d="M36 112l6-22 3 22m-8 0 6-16" stroke="'+muted+'" stroke-width="2" fill="none"/>',
        '<path d="M151 40q39 59-2 123" stroke="'+muted+'" stroke-width="3" fill="none"/>'
      ],
      chef:[
        '<rect x="51" y="131" width="18" height="23" rx="3" fill="'+ink+'"/>',
        '<circle cx="75" cy="140" r="7" fill="#7b875f" stroke="'+ink+'" stroke-width="2"/>'
      ],
      scrap:[
        '<path d="M115 103l44-10 11 10-49 9Z" fill="'+muted+'" stroke="'+ink+'" stroke-width="3"/>',
        '<rect x="20" y="132" width="28" height="21" rx="3" fill="'+muted+'" stroke="'+ink+'"/>',
        '<circle cx="37" cy="172" r="9" fill="#7a7c72" stroke="'+ink+'" stroke-width="3"/>'
      ],
      soldier:[
        '<path d="M51 120l-11 16 13 12 11-17Z" fill="'+muted+'" stroke="'+ink+'" stroke-width="3"/>',
        '<circle cx="143" cy="123" r="11" fill="none" stroke="'+muted+'" stroke-width="4"/>',
        '<rect x="55" y="111" width="11" height="21" rx="3" fill="'+ink+'"/>',
        '<path d="M136 100l10-13 10 13" stroke="'+muted+'" stroke-width="3" fill="none"/>'
      ],
      blade:[
        '<path d="M71 117l41 28" stroke="'+muted+'" stroke-width="4" fill="none"/>',
        '<path d="M131 137l38-66" stroke="'+muted+'" stroke-width="4" fill="none"/>',
        '<path d="M58 154l-9 26" stroke="'+ink+'" stroke-width="5" fill="none"/>',
        '<path d="M70 155l44 0" stroke="'+muted+'" stroke-width="3" fill="none"/>'
      ],
      chemist:[
        '<rect x="46" y="122" width="16" height="25" rx="2" fill="'+ink+'"/>',
        '<circle cx="54" cy="137" r="7" fill="#bdd3a3"/>',
        '<rect x="64" y="130" width="10" height="25" rx="2" fill="'+muted+'"/>',
        '<path d="M150 107l9-14 9 13" stroke="'+muted+'" stroke-width="3" fill="none"/>'
      ],
      icewitch:[
        '<path d="M60 98l-10 29 17-11" fill="'+muted+'" stroke="'+ink+'" stroke-width="2"/>',
        '<path d="M148 92l-9-9 10-14" stroke="'+muted+'" stroke-width="3" fill="none"/>',
        '<path d="M148 64l-10-7m12 7 8-9" stroke="'+muted+'" stroke-width="2" fill="none"/>'
      ],
      spirit:[
        '<rect x="58" y="114" width="20" height="25" rx="4" fill="'+ink+'"/>',
        '<path d="M132 60l-11-9 24-5" stroke="'+muted+'" stroke-width="3" fill="none"/>',
        '<circle cx="154" cy="65" r="5" fill="'+muted+'"/>',
        '<rect x="130" y="126" width="27" height="13" rx="3" fill="'+muted+'"/>'
      ],
      hunter:[
        '<path d="M47 145l13-8 13 12-15 13Z" fill="'+muted+'" stroke="'+ink+'" stroke-width="3"/>',
        '<rect x="131" y="91" width="27" height="8" rx="2" fill="'+ink+'"/>',
        '<path d="M120 117l46-22" stroke="'+muted+'" stroke-width="3" fill="none"/>'
      ],
      marker:[
        '<rect x="49" y="129" width="16" height="22" rx="3" fill="'+muted+'"/>',
        '<path d="M164 67l15 10-15 11" fill="'+muted+'" stroke="'+ink+'" stroke-width="2"/>',
        '<rect x="121" y="106" width="34" height="11" rx="3" fill="'+ink+'"/>',
        '<path d="M141 123l12 30" stroke="'+muted+'" stroke-width="3" fill="none"/>'
      ]
    };
    const steps=pieces[id]||[];
    let kit='<g data-upgrade="practical" stroke-linejoin="round" stroke-linecap="round">';
    for(let i=0;i<Math.min(level,steps.length);i++)kit+=steps[i];
    // An unobtrusive rank stitched onto the trouser cuff rather than a crown.
    for(let i=0;i<level;i++)kit+='<path d="M'+(66+i*8)+' 175v5" stroke="'+muted+'" stroke-width="3"/>';
    kit+='</g>';
    return svg.replace('</svg>',kit+'</svg>');
  }
  // Higher rarities receive distinct accessories drawn over their tier baseline.
  const ink='#263b68',gold='#ffe3a1',cyan='#9bf8e4';
  const looks={
    bandanna:'<path d="M59 62L129 62 119 72 67 72Z" fill="#ee6478" stroke="'+ink+'" stroke-width="3"/>',
    goggles:'<rect x="61" y="65" width="29" height="17" rx="7" fill="#334d70" stroke="'+gold+'" stroke-width="4"/><rect x="98" y="65" width="29" height="17" rx="7" fill="#334d70" stroke="'+gold+'" stroke-width="4"/>',
    shades:'<path d="M58 66h36l-4 20-24 0ZM97 66h35l-8 20-24 0Z" fill="#101e38" stroke="#d6e8ff" stroke-width="3"/>',
    star:'<path d="M96 15l9 21 23 3-17 15 4 23-19-12-20 12 5-23-18-15 24-3Z" fill="'+gold+'" stroke="#ef8d5e" stroke-width="4"/>',
    crown:'<path d="M56 54L50 20 76 35 95 10 113 35 139 20 132 54Z" fill="'+gold+'" stroke="#b77d68" stroke-width="5"/>',
    antenna:'<path d="M67 45L52 16M119 44l16-28" stroke="#9ed7ff" stroke-width="7"/><circle cx="51" cy="13" r="9" fill="'+gold+'"/>',
    gear:'<circle cx="96" cy="36" r="23" fill="'+gold+'" stroke="'+ink+'" stroke-width="5"/><circle cx="96" cy="36" r="11" fill="#608aaa"/>',
    double:'<path d="M41 113L19 95 20 142 41 151M138 112l25-18-3 49-25 10" fill="#9ed7ff" stroke="#5571a6" stroke-width="4"/>',
    mask:'<path d="M62 69L93 61 126 68 119 91 96 101 70 91Z" fill="#d4dce9" stroke="#5e5b91" stroke-width="4"/>',
    aura:'<ellipse cx="94" cy="130" rx="74" ry="88" fill="none" stroke="'+cyan+'" stroke-width="4" stroke-dasharray="12 13" opacity=".7"/>',
    flame:'<path d="M47 129Q16 91 44 69 40 102 66 107M143 129q34-38 6-65 5 33-25 43" fill="#ff966d" stroke="#ffdc8e" stroke-width="4"/>',
    orb:'<circle cx="153" cy="117" r="23" fill="'+cyan+'" stroke="#9ed7ff" stroke-width="5"/>',
    thorns:'<path d="M50 144l-21-15 13-6-12-15 28 7m82 28 18-17-15-4 13-15-27 8" fill="#94e890" stroke="#3e9171" stroke-width="4"/>',
    crystal:'<path d="M95 4L121 33 110 76 76 76 63 33Z" fill="'+cyan+'" stroke="#74a6ec" stroke-width="5"/>',
    wings:'<path d="M64 122Q18 41 12 85q-14 50 47 60m58-23q48-84 56-38 11 52-48 61" fill="#9ed7ff" opacity=".72" stroke="'+cyan+'" stroke-width="6"/>',
    cape:'<path d="M73 104Q38 117 31 190L77 175M112 104q47 12 52 86l-46-13" fill="#9358bd" stroke="#cfb6ef" stroke-width="6"/>',
    halo:'<ellipse cx="95" cy="16" rx="38" ry="12" fill="none" stroke="'+gold+'" stroke-width="8"/>',
    gold:'<circle cx="95" cy="41" r="31" fill="'+gold+'" stroke="#ab8040" stroke-width="6"/>',
    coral:'<path d="M56 55L47 21 64 32 78 9 95 40 118 11 128 32 148 23 133 62Z" fill="#ffb5b4" stroke="#ae81a8" stroke-width="5"/>'
  };
  const look=looks[stage.look]||looks.aura;
  const trim=Array.from({length:level},(_,i)=>'<rect x="'+(70+i*10)+'" y="176" width="6" height="6" fill="'+(level>=4?cyan:gold)+'"/>').join('');
  return svg.replace('</svg>','<g stroke-linejoin="round">'+look+trim+'</g></svg>');
}
export function character(id,skin='default',level=0){
  const svg=redesignedPortrait(id,skin);
  return svg?evolvedPortrait(svg,id,level):'';
}

export function monsterPortrait(type){
  const d=ENEMIES[type];if(!d)return '';
  const robotic=['mk1','mk2','chain','mecha','sentinel','overload'].includes(type);
  const armored=(d.armor||0)>.1||d.shield>0;
  const giant=d.size>=25;
  const wings=['harpy','ghost','phantom'].includes(type);
  const ear=giant?'<path d="M38 42L22 11 53 33M100 42l18-31-32 22" fill="#5b617d"/>':'';
  const shield=d.shield?'<ellipse cx="70" cy="77" rx="58" ry="67" fill="none" stroke="#a4f3ff" stroke-width="5" stroke-dasharray="11 7"/>':'';
  const extra=d.heal?'<path d="M115 40v37m-18-18h36" stroke="#c9ffbc" stroke-width="7"/>':d.regen?'<path d="M111 55q27-25 16 13" stroke="#9dffc1" stroke-width="5" fill="none"/>':d.onDeath?'<circle cx="70" cy="92" r="13" fill="#ffe89b"/>':'';
  const eyes=robotic?'#8df8ff':giant?'#ff8a87':'#344559';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 160" aria-label="${d.name}"><ellipse cx="70" cy="146" rx="48" ry="8" fill="#122445" opacity=".32"/>${wings?'<path d="M49 64Q7 9 9 85L42 100M91 64Q133 9 131 85L99 100" fill="'+d.color+'" opacity=".75"/>':''}
  <path d="M48 111l-6 29h20l8-27 8 27h20l-7-29Z" fill="#3d5067"/>
  <path d="M37 61L21 96 38 106 50 90 45 123 95 123 90 91 105 106 119 96 103 61Z" fill="${d.color}" stroke="#2c405c" stroke-width="4"/>
  ${armored?'<path d="M40 84h60v16H40Z" fill="#30475f" opacity=".85"/>':''}
  ${ear}<path d="${robotic?'M36 33L104 33 111 76 29 76Z':'M40 34Q70 6 100 34L105 72 35 72Z'}" fill="${robotic?'#b3c7d9':'#b6d6ae'}" stroke="#34445d" stroke-width="5"/>
  <path d="M45 52h17m16 0h17" stroke="${eyes}" stroke-width="8"/>${extra}${shield}</svg>`;
}

export function landscape(map){
  const palettes={plains:['#65baf4','#bdedff','#6ec963','#2e9260','#a9eb71'],mountains:['#303466','#8d7bb7','#524a77','#292b51','#9380b6'],crystal:['#252253','#6a58b8','#54448b','#302955','#a183f6'],volcano:['#5a2349','#f57d67','#6e4254','#362a42','#bb5861'],snow:['#69bde7','#e9faff','#b4e3f3','#6399bc','#edfaff']};
  const [sky,light,ground,shadow,high]=palettes[map.id]||palettes.plains;
  const route=map.path.map(([x,y],i)=>`${i?'L':'M'}${(x/1800*800).toFixed(1)} ${(205+y/1100*245).toFixed(1)}`).join(' ');
  const trees=Array.from({length:13},(_,i)=>{const x=30+(i*131)%730,y=185+(i*71)%230,s=.5+(i%3)*.2;return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cy="28" rx="31" ry="10" fill="${shadow}" opacity=".35"/>${map.id==='crystal'?`<path d="M-24 12L-13-42 7-58 24 7 0 29Z" fill="#b28aff"/><path d="M7-58L0 29 24 7Z" fill="#65e6f2"/><path d="M-13-42L0 29-24 12Z" fill="#7655cb"/>`:map.id==='volcano'?`<path d="M-34 20L-16-28 17-39 40 19 10 33Z" fill="#58405d"/><path d="M-16-28L5 11 17-39" fill="#f28e68"/>`:`<path d="M-6 0h12v32H-6Z" fill="#77505b"/><path d="M0-69L-36-8H-22L-44 14Q0 40 43 14L23-8H36Z" fill="${map.id==='snow'?'#e3f9ff':map.id==='mountains'?'#5f6084':'#3cae78'}"/><path d="M0-69L0 22Q25 26 43 14L23-8H36Z" fill="${map.id==='snow'?'#add8ec':map.id==='mountains'?'#454c74':'#268369'}"/>`}</g>`;}).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" aria-hidden="true"><defs><linearGradient id="sky-${map.id}" x2="0" y2="1"><stop stop-color="${sky}"/><stop offset="1" stop-color="${light}"/></linearGradient></defs><path fill="url(#sky-${map.id})" d="M0 0h800v480H0Z"/><circle cx="635" cy="85" r="43" fill="${light}" opacity=".8"/><path d="M0 240L100 80 185 180 297 45 420 208 540 90 674 206 735 117 800 195V480H0Z" fill="${shadow}" opacity=".5"/><path d="M233 128L297 45 353 125 316 109 292 127 276 108Z" fill="${light}" opacity=".65"/><path d="M0 266L156 181 310 247 475 184 650 237 800 181V480H0Z" fill="${ground}"/><path d="M0 353L130 298 280 336 448 277 620 319 800 263V480H0Z" fill="${high}"/><path d="${route}" transform="translate(0 7)" fill="none" stroke="${shadow}" stroke-width="26" stroke-linejoin="round"/><path d="${route}" fill="none" stroke="${map.id==='volcano'?'#ff9d49':map.id==='crystal'?'#bc97ea':'#f4ddab'}" stroke-width="20" stroke-linejoin="round"/>${trees}<g fill="${light}" opacity=".7">${Array.from({length:17},(_,i)=>`<circle cx="${(i*131)%800}" cy="${80+(i*79)%360}" r="${2+i%3}"/>`).join('')}</g></svg>`;
}
