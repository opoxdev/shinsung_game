// Dependency-free bundler for this intentionally small, single-page Apps Script game.
// Sources use static named imports plus one dynamic HTTPS Firebase import.
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'dist'),gas=path.join(out,'apps-script');
await mkdir(gas,{recursive:true});
const cf=path.join(out,'cloudflare');await mkdir(cf,{recursive:true});
const web=path.join(out,'web');await mkdir(web,{recursive:true});
const read=p=>readFile(path.join(root,p),'utf8');
function stripModules(source){
  return source.replace(/^import\s+\{[^\n]*\}\s+from\s+['"][^'"\n]+['"];?\s*$/gm,'')
    .replace(/^export\s+\{[^\n]*\}\s+from\s+['"][^'"\n]+['"];?\s*$/gm,'')
    .replace(/^export\s+(?=(const|let|var|function|class)\b)/gm,'');
}
const sources=['evolutions','data','engine','visual-design','art','presentation','terrain','render','online','matchmaking','admin-panel','main'];
const files=await Promise.all(sources.map(x=>read(`src/${x}.js`)));
const stitched=files.map((s,i)=>`// --- ${sources[i]}.js ---\n${stripModules(s)}`).join('\n');
const js=`(()=>{\n'use strict';\n${stitched}\n})();`;
const cssFiles=await Promise.all(['src/style.css','src/game.css'].map(read));
const css=cssFiles.join('\n');
const html=`<!doctype html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#151c1a"><title>신성 디펜스</title><style>${css}</style></head><body><div id="app"></div><div id="toast" role="status" aria-live="polite"></div><div id="modal-root"></div>BOOTSTRAP<script>${js.replace(/<\/script/gi,'<\\/script')}</script></body></html>`;
const coreSources=files.slice(0,3).map(stripModules).join('\n');
const exported=['EVOLUTIONS','evolutionAt','VERSION','COMBAT_SCALE','WORLD','RARITIES','TOWERS','ENEMIES','PACKS','MODES','MAPS','DIFFICULTIES','starterProfile','STEP','bounty','mapOf','pointOnPath','pathDistance','modifiers','validateConfig','createMatch','towerStats','canPlace','requiredVotes','command','tick','advance','rewardFor','applyReward','profileAction'];
const core=`var Core = (()=>{\n'use strict';\n${coreSources}\nreturn {${exported.join(',')}};\n})();\n`;
await writeFile(path.join(out,'index.html'),html.replace('BOOTSTRAP',''));
// The official Apps Script web app is a tiny permanent HTML shell.
 // Full game graphics and scripts are updated on the existing Worker via GitHub.
await writeFile(path.join(web,'game.js'),js);
await writeFile(path.join(web,'game.css'),css);
await copyFile(path.join(root,'server/Index.html'),path.join(gas,'Index.html'));
await writeFile(path.join(cf,'core.js'),core.replace('var Core =','export const Core =')); 
await copyFile(path.join(root,'server/Code.gs'),path.join(gas,'Code.gs'));
await copyFile(path.join(root,'server/appsscript.json'),path.join(gas,'appsscript.json'));
console.log('Built browser preview, permanent GAS shell, live Worker JS/CSS assets, and authoritative game core.');
