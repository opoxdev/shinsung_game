import { ENEMIES, SKIN_STYLES } from './data.js';
// Original vector characters. The same silhouettes are used on cards and in battle.
import { evolutionAt } from './evolutions.js';

// Evolved equipment is baked into each instance's sprite: a new level creates a
// different SVG image instead of only increasing numbers or applying a border.
function evolvedPortrait(svg,id,level){
  if(!level)return svg;
  const stage=evolutionAt(id,level);if(!stage)return svg;
  const gold='#ffe3a1', cyan='#9bf8e4', blue='#9ed7ff', ink='#263b68';
  const looks={
    bandanna:`<path d="M59 62L129 62 119 72 67 72Z" fill="#ee6478" stroke="${ink}" stroke-width="3"/><path d="M120 66Q142 67 151 92L136 87 117 74" fill="#ff7884"/>`,
    goggles:`<rect x="61" y="65" width="29" height="17" rx="7" fill="#334d70" stroke="${gold}" stroke-width="4"/><rect x="98" y="65" width="29" height="17" rx="7" fill="#334d70" stroke="${gold}" stroke-width="4"/><path d="M90 73h8" stroke="${gold}" stroke-width="4"/><path d="M68 69h12m25 0h12" stroke="#afffea" stroke-width="3"/>`,
    shades:`<path d="M58 66h36l-4 20-24 0ZM97 66h35l-8 20-24 0Z" fill="#101e38" stroke="#d6e8ff" stroke-width="3"/><path d="M92 71h8" stroke="#fee7ba" stroke-width="4"/><path d="M70 71h12m21 0h12" stroke="#83e4ff" stroke-width="2"/>`,
    star:`<path d="M96 15l9 21 23 3-17 15 4 23-19-12-20 12 5-23-18-15 24-3Z" fill="${gold}" stroke="#ef8d5e" stroke-width="4"/><circle cx="145" cy="119" r="14" fill="${cyan}" opacity=".8"/>`,
    crown:`<path d="M56 54L50 20 76 35 95 10 113 35 139 20 132 54Z" fill="${gold}" stroke="#b77d68" stroke-width="5"/><path d="M59 51h72" stroke="#fff7db" stroke-width="8"/><circle cx="95" cy="43" r="6" fill="#a5faff"/>`,
    antenna:`<path d="M67 45L52 16M119 44l16-28" stroke="${blue}" stroke-width="7"/><circle cx="51" cy="13" r="9" fill="${gold}"/><circle cx="136" cy="14" r="9" fill="#84ecfe"/><path d="M63 63h62" stroke="#d4faff" stroke-width="4"/>`,
    gear:`<circle cx="96" cy="36" r="23" fill="${gold}" stroke="${ink}" stroke-width="5"/><circle cx="96" cy="36" r="11" fill="#608aaa"/><path d="M96 5v12m0 38v13M65 36h13m37 0h13M74 14l9 10m25 23 9 10m1-44-10 11M83 47l-9 10" stroke="${gold}" stroke-width="7"/>`,
    double:`<path d="M41 113L19 95 20 142 41 151M138 112l25-18-3 49-25 10" fill="${blue}" stroke="#5571a6" stroke-width="4"/><path d="M20 120h25m92 0h27" stroke="${gold}" stroke-width="5"/>`,
    mask:`<path d="M62 69L93 61 126 68 119 91 96 101 70 91Z" fill="#f9f7f7" stroke="#5e5b91" stroke-width="4"/><path d="M74 75l12 7m22 0 12-7" stroke="#f07588" stroke-width="5"/>`,
    aura:`<ellipse cx="94" cy="130" rx="74" ry="88" fill="none" stroke="${cyan}" stroke-width="7" stroke-dasharray="12 13" opacity=".8"/><circle cx="20" cy="108" r="8" fill="${gold}"/><circle cx="163" cy="143" r="8" fill="${blue}"/>`,
    flame:`<path d="M47 129Q16 91 44 69 40 102 66 107M143 129q34-38 6-65 5 33-25 43" fill="#ff966d" stroke="#ffdc8e" stroke-width="4"/><path d="M65 40Q73 5 93 19q18-22 27 20Z" fill="#ffca67"/>`,
    orb:`<circle cx="153" cy="117" r="23" fill="${cyan}" opacity=".88" stroke="${blue}" stroke-width="5"/><circle cx="153" cy="117" r="11" fill="#fff5ba"/><path d="M146 95l6-12 7 13" fill="#c6f8ff"/>`,
    thorns:`<path d="M50 144l-21-15 13-6-12-15 28 7m82 28 18-17-15-4 13-15-27 8" fill="#94e890" stroke="#3e9171" stroke-width="4"/><path d="M63 35l14-21 13 20m12 0 14-21 13 23" fill="#83d878"/>`,
    crystal:`<path d="M95 4L121 33 110 76 76 76 63 33Z" fill="${cyan}" stroke="#74a6ec" stroke-width="5"/><path d="M95 4L95 76 121 33Z" fill="#a2c5ff"/><path d="M95 4L63 33 95 76Z" fill="#e4ffef"/>`,
    wings:`<path d="M64 122Q18 41 12 85q-14 50 47 60m58-23q48-84 56-38 11 52-48 61" fill="${blue}" opacity=".72" stroke="${cyan}" stroke-width="6"/><path d="M22 91l36 25m108-25-36 25" stroke="#fff1a3" stroke-width="4"/>`,
    cape:`<path d="M73 104Q38 117 31 190L77 175M112 104q47 12 52 86l-46-13" fill="#9358bd" stroke="#cfb6ef" stroke-width="6"/><path d="M68 106h52" stroke="${gold}" stroke-width="5"/>`,
    halo:`<ellipse cx="95" cy="16" rx="38" ry="12" fill="none" stroke="${gold}" stroke-width="8"/><ellipse cx="95" cy="16" rx="25" ry="6" fill="none" stroke="${cyan}" stroke-width="3"/><path d="M45 96l-21-8m123 8 20-8" stroke="${cyan}" stroke-width="5"/><circle cx="38" cy="133" r="9" fill="${gold}"/><circle cx="154" cy="147" r="7" fill="${cyan}"/>`,
    gold:`<circle cx="95" cy="41" r="31" fill="${gold}" stroke="#ab8040" stroke-width="6"/><path d="M95 23v36m-12-28h23m-23 21h23" stroke="#b88b3f" stroke-width="6"/>`,
    coral:`<path d="M56 55L47 21 64 32 78 9 95 40 118 11 128 32 148 23 133 62Z" fill="#ffb5b4" stroke="#ae81a8" stroke-width="5"/><circle cx="95" cy="32" r="7" fill="${cyan}"/>`
  };
  const look=looks[stage.look]||looks.aura;
  const gems=Array.from({length:level},(_,i)=>`<path d="M${55+i*16} 179l6-7 6 7-6 8Z" fill="${level>=4?cyan:gold}" stroke="#243b5e" stroke-width="1.7"/>`).join('');
  const wings=level>=3?`<path d="M54 113q-21-27-30-8m115 9q21-29 30-8" fill="none" stroke="${level>=4?cyan:gold}" stroke-width="5" opacity=".85"/>`:'';
  const aura=level>=4?`<ellipse cx="94" cy="117" rx="79" ry="88" fill="none" stroke="${cyan}" stroke-width="3" stroke-dasharray="9 13" opacity=".7"/>`:'';
  return svg.replace('</svg>',`<g stroke-linecap="round" stroke-linejoin="round">${aura}${look}${wings}${gems}</g></svg>`);
}
// v0.4 silhouettes: lightweight original SVG art; no external image assets.
// Each roster member has a recognizable prop and headgear, not a military uniform.
function expansionPortrait(id,skin){
  const cfg={
    archer:['#72b96d','#305e55','#e4d694','leaf'],
    chef:['#f7dfc3','#e97279','#fff7e7','chef'],
    chemist:['#b2ec7c','#427c6e','#baef75','goggles'],
    icewitch:['#b6e9ff','#5981c7','#dafaff','crown'],
    firefly:['#ffad56','#ed685a','#fff0bb','wings'],
    knight:['#b9b6e8','#6661b1','#edf0ff','helmet'],
    drone:['#83e9eb','#376eaa','#eaffff','robot'],
    clockmaker:['#f2cf86','#82557d','#f8e6b5','clock'],
    mermaid:['#7ae4d5','#4d83b2','#f4c98a','coral'],
    prism:['#c5a8ff','#5d55ad','#d9ffff','prism'],
    reaper:['#d7c0ee','#8057a5','#ffebeb','rabbit']
  };
  const standalone={
    spirit:`<g><path d="M42 114Q35 46 92 48Q151 52 140 122L149 179 122 170 104 189 89 173 67 191 54 169 34 177Z" fill="#bdf4f4" stroke="#335577" stroke-width="6"/><path d="M62 94Q57 78 75 71m39 2q17 8 13 23" fill="none" stroke="#fff" stroke-width="7"/><circle cx="75" cy="115" r="6" fill="#355371"/><circle cx="111" cy="115" r="6" fill="#355371"/><path d="M80 139q12 9 24 0" fill="none" stroke="#537394" stroke-width="5"/><path d="M134 101l12 15 17-4-3 36-14 11-22-9Z" fill="#efc975" stroke="#5c6b8d" stroke-width="5"/><circle cx="146" cy="135" r="7" fill="#fffed0"/><path d="M82 42l13-30 10 30" fill="#f5e3a3"/></g>`,
    banker:`<path d="M35 132Q30 61 93 58Q151 60 150 132Q159 185 94 188Q29 187 35 132Z" fill="#f7d76b" stroke="#9d7a39" stroke-width="6"/><path d="M47 143Q50 174 85 176" stroke="#fff6b7" stroke-width="9" fill="none"/><ellipse cx="78" cy="123" rx="7" ry="9" fill="#6b6347"/><ellipse cx="111" cy="123" rx="7" ry="9" fill="#6b6347"/><path d="M85 147q10 11 21 0" stroke="#8d6944" stroke-width="5" fill="none"/><path d="M73 65L91 26 117 65" fill="#ffed92" stroke="#b18e45" stroke-width="5"/><circle cx="94" cy="92" r="12" fill="#fff1a1"/><path d="M94 82v21m-6-17h15m-15 12h16" stroke="#bb953b" stroke-width="3"/>`,
    storm:`<path d="M65 100L41 173 80 180 97 160 117 183 145 165 123 99Z" fill="#748dc6" stroke="#425381" stroke-width="5"/><path d="M52 94Q31 86 43 66q-3-21 23-23 9-28 34-17 27-5 32 22 26 1 21 31-7 28-40 22Z" fill="#d0dcff" stroke="#657eb4" stroke-width="6"/><path d="M77 86h10m27 0h10" stroke="#33466e" stroke-width="6"/><path d="M111 124l-25 34 17-3-14 32 40-44-21 3Z" fill="#ffe68c"/><path d="M38 124l-18 16 17 1-15 19" stroke="#b5e8ff" stroke-width="7" fill="none"/>`,
    phoenix:`<path d="M68 109Q14 54 17 128L52 112Q22 178 69 157 84 185 94 192 109 167 117 153q46 14 32-28L176 145Q169 58 119 109Z" fill="#ff7357" stroke="#a74760" stroke-width="6"/><path d="M91 104L62 58 92 78 111 37 122 81 143 65 128 118Z" fill="#ffe58d" stroke="#b15e47" stroke-width="5"/><ellipse cx="95" cy="116" rx="33" ry="37" fill="#ffb95b" stroke="#aa4b43" stroke-width="5"/><circle cx="84" cy="114" r="5" fill="#63465d"/><circle cx="108" cy="114" r="5" fill="#63465d"/><path d="M92 131l14 0-7 14Z" fill="#fff1ab"/><path d="M75 163l-21 32 32-14m29-18 21 32-32-14" fill="#ffc964"/>`,
    starseed:`<path d="M83 164L63 194 95 177 128 194 107 162" fill="#ab77b4"/><path d="M59 108Q39 78 65 59 90 43 118 64 143 83 125 117L140 152Q102 186 55 152Z" fill="#ffc1dd" stroke="#a55f9b" stroke-width="6"/><path d="M68 69Q59 35 94 23q38 14 25 44" fill="#f5d5ff" stroke="#d39aca" stroke-width="5"/><circle cx="79" cy="104" r="6" fill="#65375e"/><circle cx="111" cy="104" r="6" fill="#65375e"/><path d="M83 127q12 9 24 0" fill="none" stroke="#aa638b" stroke-width="4"/><path d="M94 6l12 21 24 4-17 17 4 24-23-12-22 12 4-24-19-17 25-4Z" fill="#ffe4a0" stroke="#eaa885" stroke-width="4"/><circle cx="43" cy="122" r="10" fill="#fff2b9"/><path d="M146 115l9-19 9 19-9 19Z" fill="#9ff3ff"/>`,
    hunter:`<path d="M63 116L34 188 81 183 96 170 114 185 148 181 121 117" fill="#303952" stroke="#18263c" stroke-width="6"/><path d="M58 75Q55 35 94 32q44-1 43 47l-19 40H69Z" fill="#3d527e" stroke="#1d2a47" stroke-width="7"/><path d="M60 66l34-35 40 33-15 25H74Z" fill="#26344e"/><path d="M75 82h20m9 0h17" stroke="#92d6ff" stroke-width="8"/><path d="M93 93l-7 16h17Z" fill="#ffe7b9"/><path d="M129 117L166 35 172 46 149 137Z" fill="#8fb6da" stroke="#536680" stroke-width="5"/><path d="M133 116l19 8M132 64l19-11" stroke="#fce2ae" stroke-width="9"/><path d="M152 35l-6-14 20 4 14-8-6 29" fill="#ffe6a4"/><circle cx="158" cy="63" r="8" fill="#80d5ff"/>`,
    scrap:`<path d="M45 119l-16 61 44 10 18-33 23 34 44-9-19-68" fill="#657c7d" stroke="#3a4856" stroke-width="6"/><path d="M52 60L95 23 138 60 145 125 122 164 64 164 41 122Z" fill="#a6a8a0" stroke="#435565" stroke-width="8"/><path d="M49 77l26-21 40 0 24 23-19 40-52 1Z" fill="#657f83"/><path d="M61 79h28v15H61zm36 0h28v15H97Z" fill="#f8cd8a" stroke="#374858" stroke-width="4"/><path d="M60 128h73v17H60Z" fill="#475967"/><path d="M49 115L15 86 8 112 36 146M142 114l28-29 9 32-33 30" fill="#9bafa6" stroke="#455868" stroke-width="7"/><circle cx="38" cy="45" r="20" fill="#859aa0" stroke="#3b5268" stroke-width="7"/><circle cx="38" cy="45" r="8" fill="#eaf4dd"/><path d="M38 11v12M8 45h13" stroke="#ffe3a6" stroke-width="6"/>`,
    lullaby:`<path d="M71 120Q31 142 43 184L75 170 90 192 107 169 141 187Q152 139 112 119" fill="#8a95d5" stroke="#525f9d" stroke-width="5"/><path d="M52 69Q57 33 95 34q38-3 44 38L121 121 68 120Z" fill="#e4ecff" stroke="#7d9fc9" stroke-width="6"/><path d="M65 85q12-9 22 2m17 0q12-11 20 0" fill="none" stroke="#566a96" stroke-width="5"/><path d="M79 107q16 10 29 0" fill="none" stroke="#7f97b5" stroke-width="5"/><path d="M58 77Q18 61 18 121q30 17 54-18m55-27q45-19 48 44-32 15-54-18" fill="#b0d3ff" stroke="#7aa1de" stroke-width="5"/><path d="M83 34L94 11l13 23" fill="#fff1c0"/><path d="M135 96q13-15 21 0-2 17-17 22m-5 4q-15 10-6 24" fill="none" stroke="#ffe5a9" stroke-width="5"/><circle cx="156" cy="72" r="6" fill="#d8c5ff"/>`,
    papercrane:`<path d="M65 117L36 185 75 179 91 164 112 184 147 180 121 112" fill="#f4cfa9" stroke="#9b8fa8" stroke-width="5"/><path d="M63 65Q56 28 96 26q42 4 35 48l-16 41-39-3Z" fill="#ffe3c6" stroke="#8e8399" stroke-width="6"/><path d="M79 79h10m17 0h10" stroke="#605674" stroke-width="5"/><path d="M82 101q14 9 27 0" fill="none" stroke="#ba8c86" stroke-width="4"/><path d="M56 54l23-43 43 5 15 41-36-19Z" fill="#fef7e5" stroke="#bf9aa9" stroke-width="5"/><path d="M126 112l31-45-5 28 22 17-44 19-19-17Z" fill="#fff8e7" stroke="#c5abb9" stroke-width="5"/><path d="M128 112l28-17-6 34Z" fill="#c5e4ff"/><path d="M32 135L8 93 35 108 51 80 51 134Z" fill="#fff6e8" stroke="#c6a9b2" stroke-width="5"/><path d="M35 107l-5 39 23-9" fill="#f6dba9"/><path d="M89 137l16-13 12 17" fill="none" stroke="#a38ab0" stroke-width="5"/>`,
    marker:`<path d="M67 118L38 183 80 179 95 191 112 178 154 187 123 118" fill="#6c5d96" stroke="#443f72" stroke-width="5"/><path d="M59 67Q61 35 91 31 132 35 137 76L123 119 68 119Z" fill="#b9a0e0" stroke="#6b5c9c" stroke-width="6"/><path d="M48 61L94 12 142 64 117 57 94 36 68 60Z" fill="#635389" stroke="#bba2f0" stroke-width="5"/><path d="M78 82h12m17 0h12" stroke="#e5f9ff" stroke-width="6"/><path d="M84 105q12 9 23-1" fill="none" stroke="#785d8f" stroke-width="5"/><path d="M135 102l27-39 12 14-31 43" fill="#dac5f4" stroke="#8069ad" stroke-width="5"/><circle cx="157" cy="67" r="10" fill="#f1c6ff"/><path d="M33 99q8-24 17 0-8 22-17 0Zm-4 22q11-20 18 0-8 20-18 0Z" fill="#e0b3f3"/><path d="M143 28l7-19 8 19-8 20Z" fill="#b5ddff"/>`,
    aurora:`<defs><linearGradient id="aurora-a" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#61fae3"/><stop offset=".5" stop-color="#69b9ff"/><stop offset="1" stop-color="#a2fa91"/></linearGradient></defs><path d="M94 10Q166 48 143 117L158 185 107 161 95 203 80 162 29 184 45 114Q22 42 94 10Z" fill="#283d73" stroke="url(#aurora-a)" stroke-width="7"/><path d="M73 43l22-29 22 29-7 32-16-15-16 15Z" fill="#94f9dc"/><path d="M59 82Q92 64 129 82l-9 61-25 25-26-24Z" fill="url(#aurora-a)" opacity=".85"/><path d="M77 103h12m18 0h12" stroke="#213c64" stroke-width="7"/><path d="M35 80q89 18 112 81M147 80Q58 98 35 160" fill="none" stroke="#d8ffcf" stroke-width="5" stroke-dasharray="6 9"/><circle cx="48" cy="107" r="7" fill="#b1ffe6"/><circle cx="137" cy="131" r="7" fill="#82bcff"/>`
  };
  const palette=cfg[id];
  if(!palette&&!standalone[id])return null;
  if(standalone[id])return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 210" aria-hidden="true"><ellipse cx="92" cy="196" rx="57" ry="10" fill="#19294a" opacity=".22"/>${standalone[id]}</svg>`;
  const [base,shade,trim,hat]=palette;
  const coat=skin==='arctic'?'#d0edff':base;
  const headgear={
    leaf:`<path d="M53 62Q72 8 119 39L130 65 93 52Z" fill="#3c865d"/><path d="M93 39L116 17 125 31 100 44" fill="#a3ed91"/>`,
    chef:`<path d="M61 57Q39 36 61 24q-4-24 26-18 23-17 32 8 28 0 22 27L128 56Z" fill="#fff9e7" stroke="#dbded8" stroke-width="5"/><path d="M65 52h64v17H65Z" fill="#f2ebdd"/>`,
    goggles:`<path d="M61 54Q53 22 93 22q46 0 37 38" fill="#7acb83"/><rect x="59" y="58" width="72" height="24" rx="8" fill="#3f5b62"/><path d="M64 66h25m12 0h25" stroke="#b2f5a1" stroke-width="6"/>`,
    crown:`<path d="M56 58L55 24 75 37 93 8 112 36 132 22 130 58Z" fill="#c6efff" stroke="#77a5df" stroke-width="5"/><path d="M60 45h66" stroke="#f7ffff" stroke-width="4"/>`,
    wings:`<path d="M57 113Q3 73 17 40q45 4 64 50m36 26q62-44 43-79-47 6-64 54" fill="#ffe0a3" stroke="#ffa778" stroke-width="5"/><path d="M62 56L81 26 101 47 119 23 127 57" fill="#ffc34f"/>`,
    helmet:`<path d="M58 85L52 40 86 24 125 41 130 90 116 101 75 101Z" fill="#aab4df" stroke="#515e98" stroke-width="5"/><path d="M62 69h64" stroke="#f4f0ff" stroke-width="7"/><path d="M88 25l8-17 8 17" fill="#ffeea9"/>`,
    robot:`<path d="M54 53l18-24h44l21 24v52H54Z" fill="#7dd6e2" stroke="#3b698f" stroke-width="5"/><path d="M60 67h72v25H60Z" fill="#294d76"/><path d="M70 80h18m17 0h18" stroke="#b9fff0" stroke-width="6"/><path d="M96 30V12" stroke="#37719a" stroke-width="6"/><circle cx="96" cy="12" r="7" fill="#fff4ae"/>`,
    clock:`<path d="M56 59L66 8 120 8 129 59Z" fill="#68506e" stroke="#e6bd79" stroke-width="5"/><path d="M47 55h93v13H47Z" fill="#bb896e"/><circle cx="95" cy="34" r="15" fill="#fff0c0"/><path d="M95 24v10l8 5" stroke="#6b5c68" stroke-width="4" fill="none"/>`,
    coral:`<path d="M60 52L48 21 66 34 77 14 94 36 117 13 129 38 143 22 134 64Z" fill="#ffbaab" stroke="#c4799a" stroke-width="5"/><path d="M69 45h55" stroke="#fff3d6" stroke-width="5"/>`,
    prism:`<path d="M55 59L81 22 109 24 135 56 119 85 65 86Z" fill="#9879e3"/><path d="M81 22L90 75 135 56Z" fill="#d1c8ff"/><path d="M81 22L55 59 90 75Z" fill="#73e9fb"/>`,
    rabbit:`<path d="M63 58L51 9 73 17 85 48 108 49 124 8 142 17 128 62" fill="#f0dcf6" stroke="#85629c" stroke-width="6"/><path d="M62 16l9 30m57-28-12 28" stroke="#ed9cbc" stroke-width="6"/>`
  };
  const items={
    archer:`<path d="M37 102Q14 129 37 156 54 178 65 155" fill="none" stroke="#a97343" stroke-width="9"/><path d="M38 104l0 56" stroke="#f7f0bf" stroke-width="3"/><path d="M25 111L78 135" stroke="#f8e6bc" stroke-width="5"/>`,
    chef:`<path d="M132 118l27-16 8 13-28 18Z" fill="#576176"/><ellipse cx="136" cy="121" rx="24" ry="14" fill="#fff2cb" stroke="#bb855f" stroke-width="5"/><circle cx="136" cy="121" r="9" fill="#fc9d8e"/>`,
    chemist:`<path d="M132 111l17 12-6 29-28-7-2-24Z" fill="#a4fd95" stroke="#438e89" stroke-width="5"/><path d="M119 123h20l-3 14-15-3Z" fill="#64d6e5"/>`,
    icewitch:`<path d="M139 56v120" stroke="#8cc9eb" stroke-width="8"/><path d="M139 48l-18 19 18 17 19-17Z" fill="#e4ffff" stroke="#89bde9" stroke-width="4"/>`,
    firefly:`<circle cx="144" cy="108" r="20" fill="#ffe77e"/><path d="M144 77v-10m0 77v11m-31-47h-10m72 0h-11" stroke="#ffd264" stroke-width="5"/>`,
    knight:`<path d="M133 59l13 102 20-7-16-105Z" fill="#d8e6ff" stroke="#656aa5" stroke-width="5"/><path d="M123 150h40" stroke="#ffe8a0" stroke-width="8"/>`,
    drone:`<path d="M14 121l32-24 12 30-29 19Z" fill="#6ce3dd" stroke="#426993" stroke-width="5"/><circle cx="27" cy="117" r="12" fill="#f9e59e"/><path d="M135 125l35-16-4 34-33 9Z" fill="#6ce3dd"/>`,
    clockmaker:`<circle cx="143" cy="123" r="27" fill="#ebcb88" stroke="#7e5a78" stroke-width="7"/><path d="M143 105v18l13 10" fill="none" stroke="#7e5a78" stroke-width="5"/>`,
    mermaid:`<path d="M74 148q-6 39 24 36l17-32-2 35 22 5-21-53" fill="#6fe4cd" stroke="#467eac" stroke-width="5"/><path d="M122 100l15-18 8 14 18-1-17 33-21 3Z" fill="#ffb4a8"/>`,
    prism:`<path d="M143 69l-26 35 19 47 29-32Z" fill="#a3ecfb" stroke="#8174ce" stroke-width="6"/><path d="M143 69l-7 82 29-32Z" fill="#e9d9ff"/>`,
    reaper:`<path d="M144 44L117 184" stroke="#655578" stroke-width="8"/><path d="M146 41Q177 26 169 86 150 70 133 72" fill="#d8dcff" stroke="#6c658e" stroke-width="5"/>`
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 210" aria-hidden="true"><ellipse cx="92" cy="191" rx="57" ry="11" fill="#142b4a" opacity=".25"/><g stroke-linejoin="round" stroke-linecap="round"><path d="M67 139L58 184 82 183 93 149 108 185 130 182 119 138Z" fill="${shade}" stroke="#263655" stroke-width="5"/><path d="M70 93L48 116 58 143 72 127 67 163 120 161 118 125 137 143 145 113 117 91Z" fill="${coat}" stroke="#253e60" stroke-width="5"/><path d="M78 113L108 113M87 132h18" stroke="${trim}" stroke-width="6"/><path d="M62 64Q59 30 94 29Q129 30 126 66L121 94 69 92Z" fill="${hat==='robot'?'#84cad1':'#f8d5af'}" stroke="#324568" stroke-width="5"/><path d="M77 76h8m22 0h8" stroke="#283e54" stroke-width="6"/><path d="M89 89q6 5 12 0" fill="none" stroke="#c48d83" stroke-width="3"/>${headgear[hat]}${items[id]}</g></svg>`;
}

// Cosmetic skins recolor existing character artwork without altering gameplay.
function cosmeticPortrait(svg,skin){
  const item=SKIN_STYLES[skin];
  if(!item)return svg;
  const filters={
    meadow:'hue-rotate(65deg) saturate(1.2)',arctic:'saturate(.7) brightness(1.18)',
    bloom:'hue-rotate(310deg) saturate(1.2)',circuit:'hue-rotate(115deg) saturate(1.6)',
    neon:'hue-rotate(145deg) saturate(1.5)',frostfire:'hue-rotate(190deg) saturate(1.4)',
    starlight:'hue-rotate(235deg) saturate(1.4)',royal:'sepia(.65) saturate(1.8) hue-rotate(340deg)',
    solstice:'hue-rotate(85deg) saturate(1.7)',hologram:'hue-rotate(170deg) saturate(1.7)',
    glacier:'hue-rotate(190deg) saturate(.9) brightness(1.23)',
    void:'hue-rotate(260deg) saturate(1.6) brightness(.9)',
    celestial:'hue-rotate(325deg) saturate(1.35) brightness(1.13)'
  };
  const hue=item.color,rare=['legendary','mythic'].includes(item.rarity);
  const aura=`<g fill="none" stroke="${hue}" stroke-width="${rare?4:2.5}" stroke-linecap="round">
    <ellipse cx="92" cy="107" rx="75" ry="89" stroke-dasharray="${rare?'6 7':'11 14'}" opacity=".85"/>
    <path d="M90 8l8-8 8 8-8 8Z" fill="${hue}" opacity=".9"/>
    <path d="M16 102l8-12 8 12-8 12Zm135 15 8-12 8 12-8 12Z" fill="${hue}" opacity=".74"/>
    ${rare?'<path d="M28 62L42 44M140 42l14 19M36 165l16 14M132 175l14-16" stroke-width="5"/>':''}
  </g>`;
  return svg.replace('<svg ',`<svg style="filter:${filters[skin]||'none'}" `).replace('</svg>',aura+'</svg>');
}
export function character(id,skin='default',level=0) {
  const expanded=expansionPortrait(id,skin);if(expanded)return cosmeticPortrait(evolvedPortrait(expanded,id,level),skin);
  const white=skin==='arctic';
  const ink='#192445', face='#ffdbb0';
  const head=(hair,extra='')=>`<path d="M65 67Q64 39 92 39Q120 40 118 70L113 88Q92 101 72 86Z" fill="${face}"/><path d="M65 63L61 42 78 25 105 28 123 47 115 67 104 49 91 58 83 47 72 65Z" fill="${hair}"/><path d="M79 73v5m25-5v5" stroke="${ink}" stroke-width="5"/>${extra}`;
  const legs=`<path d="M66 142L60 182 82 184 92 149 100 185 124 181 113 140" fill="#283155"/><path d="M58 177L83 181 83 191 51 191Zm42 3 25-5 8 13-32 6" fill="#f1f4ff"/>`;
  const bodies={
    scout:`${legs}<path d="M65 95L46 125 60 139 74 119 75 151 118 145 109 111 131 125 139 106 114 91Z" fill="${white?'#d9f4ff':'#ffaf38'}"/>${head('#674039')}<path d="M68 91L110 87 121 101 86 111Z" fill="#f35066"/><path d="M79 100L45 108 29 91 64 95" fill="#f35066"/><path d="M139 110V84L126 69M139 84l13-20" fill="none" stroke="#874833" stroke-width="9"/><path d="M126 69L152 64 137 103Z" fill="none" stroke="#fff1bf" stroke-width="3"/><path d="M84 128h14" stroke="#fff4da" stroke-width="8"/>`,
    soldier:`<path d="M64 143L59 172 80 182 94 151 105 180 126 170 114 141" fill="#39275a"/><circle cx="62" cy="188" r="10" fill="#ffdc57"/><circle cx="86" cy="188" r="10" fill="#ffdc57"/><circle cx="111" cy="188" r="10" fill="#ffdc57"/><circle cx="135" cy="188" r="10" fill="#ffdc57"/><path d="M60 169L91 177 88 187 51 180Zm43 2 28-11 11 20-35 6" fill="#58e3f4"/><path d="M67 94L45 111 52 134 73 124 72 151 119 149 112 122 143 123 145 102 114 92" fill="${white?'#d9f4ff':'#7970ff'}"/>${head('#54e1f2','<path d="M74 65h38v13H74Z" fill="#25204e"/><path d="M80 68h10m9 0h7" stroke="#aaffed" stroke-width="3"/>')}<path d="M61 48L45 20 60 15 77 42M106 37L118 12 130 19 121 52" fill="#55e8ff"/><path d="M43 113L20 91 12 109 38 133M139 108l24-15 6 19-28 14" fill="#54e3f2"/><path d="M86 108l14-2-6 13 12-2-22 25 5-18-10 2Z" fill="#ffef7a"/>`,
    blade:`${legs}<path d="M64 98L43 144 68 151 81 118 103 152 131 144 113 96Z" fill="${white?'#bde8ff':'#524d88'}"/><path d="M76 102L94 137 112 101 111 155 68 155Z" fill="#edf2ff"/><path d="M70 79L55 36 83 50 105 46 128 30 119 83 96 98Z" fill="#f9f3e6"/><path d="M62 47L77 56 68 65M118 44L107 58 117 62" fill="#ff657c"/><path d="M75 72l12 5m15-2 10-7" stroke="#e64d6c" stroke-width="5"/><path d="M87 88l7 5 7-6" fill="none"/><path d="M68 95L118 90 116 106 65 110Z" fill="#e94b75"/><path d="M111 98Q147 63 166 92L142 112 119 106" fill="#e94b75"/><path d="M130 147L154 50 166 29 164 63 143 153Z" fill="#baf7ff"/><path d="M123 145l29 7" stroke="#ffc865" stroke-width="8"/>`,
    cannon:`<path d="M57 165L44 189 76 190 89 168M108 168l13 23 29-8-18-23" fill="#ffb940"/><path d="M67 85Q39 94 40 141Q38 176 84 179Q133 183 142 144Q148 103 116 88Z" fill="${white?'#e4f5ff':'#ff8852'}"/><path d="M61 134Q89 121 121 137L119 163 65 162Z" fill="#ffe2ab"/><path d="M67 92L63 64Q68 39 94 42Q127 43 128 70L118 95Z" fill="#323a5a"/><path d="M63 60L77 44 74 26 101 38 123 29 119 54" fill="#ffbd45"/><rect x="65" y="62" width="63" height="24" rx="10" fill="#ed5266"/><path d="M74 69h15v9H74zm25 0h16v9H99z" fill="#ffeb88"/><circle cx="142" cy="124" r="27" fill="#293253"/><path d="M144 97q17-27 23-5" fill="none" stroke="#dba156" stroke-width="5"/><path d="M163 83l8-8-1 11 11 3-13 4" fill="#ffe15f"/>`,
    summoner:`<path d="M67 104L43 177 76 172 87 187 100 175 129 181 116 101Z" fill="${white?'#d0efff':'#8a58ce'}"/><path d="M77 110L71 173 103 176 101 107Z" fill="#44477e"/><path d="M67 65L39 49 47 82 70 88M114 67l28-19-4 34-25 9" fill="#8de966"/><path d="M66 61Q93 35 118 62L117 89 95 105 70 90Z" fill="#9ce978"/><path d="M57 65L66 32 110 11 119 47 129 64 103 54 76 61Z" fill="#aa71f5"/><path d="M76 76l10 3m15 0 10-5" stroke="#222d43" stroke-width="5"/><path d="M85 94l3-9 6 9 8-7 2 9" fill="#fff9db"/><path d="M143 66L132 183" stroke="#8b573c" stroke-width="10"/><path d="M126 56L145 24 163 56 145 76Z" fill="#a2ffbd"/><path d="M145 25v50l18-19Z" fill="#49dbaa"/><circle cx="41" cy="159" r="21" fill="#99df69"/><path d="M22 150l-6-15 20 8m19 0 15-9-5 21" fill="#99df69"/><path d="M31 159h5m13 0h5" stroke="#283452" stroke-width="4"/>`,
    workshop:`<ellipse cx="93" cy="184" rx="65" ry="17" fill="#6bca78"/><path d="M57 103L53 177Q92 195 132 177L127 99Z" fill="#fff0c4"/><path d="M91 145Q112 142 112 164v21H77v-23q0-17 14-17" fill="#80587e"/><path d="M32 110Q38 57 87 40Q133 43 157 112Q99 143 32 110Z" fill="${white?'#9bdffc':'#ff6687'}"/><path d="M33 110Q93 133 157 112" fill="none" stroke="#ffc6ad" stroke-width="10"/><ellipse cx="71" cy="77" rx="14" ry="10" fill="#fff5da"/><ellipse cx="119" cy="93" rx="12" ry="9" fill="#fff5da"/><circle cx="101" cy="56" r="8" fill="#fff5da"/><path d="M59 144h10m46 0h10" stroke="#9c715f" stroke-width="7"/><path d="M37 172Q22 135 15 164L27 177M136 177q28-48 30-12l-15 18" fill="#7be991"/><path d="M66 40q-15-24-29-3 16 15 29 3M72 40q8-29 23-19-1 19-23 19" fill="#80ee9d"/><circle cx="35" cy="148" r="5" fill="#fff6a8"/>`,
    rail:`<path d="M69 101L42 174 80 168 93 189 107 168 141 175 116 98Z" fill="${white?'#d5f1ff':'#508dce'}"/><path d="M84 110L70 170 93 181 113 171 99 110Z" fill="#bbebff"/><path d="M67 65q-6-21 26-24 32 1 28 24l-9 27H76Z" fill="#31375e"/><path d="M76 71h10m16 0h10" stroke="#c6ffff" stroke-width="5"/><path d="M43 62L72 45 95 5 120 43 143 59 97 71Z" fill="#5c97e0"/><path d="M96 8L101 49 121 44Z" fill="#a7ceff"/><path d="M77 44L124 45" stroke="#ffe193" stroke-width="8"/><path d="M141 94l7-17 7 17 18 4-15 10 2 18-15-10-16 8 5-18-14-10Z" fill="#ffeaa1"/><path d="M54 121Q12 95 30 67" fill="none" stroke="#98e9ff" stroke-width="6"/><path d="M18 57l12-9 12 12-10 13Z" fill="#c8fbff"/><circle cx="54" cy="153" r="5" fill="#ffe699"/>`,
    sonic:`<path d="M66 143L52 178 76 186 93 152 109 181 136 171 115 138" fill="#302d68"/><path d="M50 174l29 9-6 12-36-7Zm59 2 28-10 12 11-36 14" fill="#5ff4ed"/><path d="M66 96L43 116 54 132 74 122 71 150 118 145 112 118 138 127 146 109 114 95Z" fill="${white?'#e2f6ff':'#ff64c4'}"/>${head('#f1efff')}<path d="M59 65Q52 26 91 24Q129 23 127 66" fill="none" stroke="#52f5ed" stroke-width="10"/><rect x="53" y="57" width="15" height="29" rx="5" fill="#ff8bda"/><rect x="118" y="56" width="15" height="29" rx="5" fill="#ff8bda"/><path d="M78 110l14 11 18-17-15 30Z" fill="#fff393"/><circle cx="147" cy="136" r="23" fill="#303464"/><circle cx="147" cy="136" r="14" fill="#62f7e5"/><circle cx="147" cy="136" r="6" fill="#41426d"/><path d="M28 49v30m-8-22v14m16-20v25" stroke="#f893ed" stroke-width="5"/>`
  };
  return cosmeticPortrait(evolvedPortrait(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 210" aria-hidden="true"><ellipse cx="93" cy="193" rx="62" ry="12" fill="#101738" opacity=".3"/><g stroke="${ink}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">${bodies[id]||bodies.scout}</g></svg>`,id,level),skin);
}
// Pack portraits reuse battle enemy silhouettes, colors, armor, shields and features.
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
