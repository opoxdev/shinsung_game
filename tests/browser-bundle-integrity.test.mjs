import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(path.join(root,p),'utf8');

test('every local module imported by the browser build is bundled in dependency order',()=>{
 const source=read('scripts/build.mjs');
 const matches=source.match(/const sources=\[([^\]]+)\]/);
 assert.ok(matches,'Browser build source manifest must be explicit and auditable');
 const modules=[...matches[1].matchAll(/'([^']+)'/g)].map(match=>match[1]);
 assert.equal(new Set(modules).size,modules.length,'Browser bundle has duplicate modules');
 assert.ok(modules.includes('main'));
 for(const id of modules){
  const js=read('src/'+id+'.js');
  const localImports=[...js.matchAll(/^(?:import|export)\s+[^\n]*?from\s+['"]\.\/([^'"]+)\.js['"]/gm)]
   .map(match=>match[1]);
  for(const dep of localImports){
   assert.ok(modules.includes(dep),id+'.js requires missing '+dep+'.js; built browser will freeze at runtime');
   assert.ok(modules.indexOf(dep)<modules.indexOf(id),id+'.js requires '+dep+'.js before it in the concatenated browser build');
  }
 }
 assert.ok(modules.includes('combat-fx')&&modules.includes('meat-art'));
});

test('deployed browser scripts have no missing imports, duplicate declarations or syntax errors',()=>{
 const web=read('dist/web/game.js');
 const preview=read('dist/index.html');
 assert.doesNotThrow(()=>new Script(web,{filename:'dist/web/game.js'}));
 const inline=preview.match(/<script>([\s\S]*?)<\/script>/i);
 assert.ok(inline,'HTML preview must contain the actual bundled game');
 assert.doesNotThrow(()=>new Script(inline[1],{filename:'dist/index.html:inline'}));
 for(const symbol of ['drawTowerAttackEffect','drawTowerPresence','isTowerAttackEffect',
   'drawMeatPlate','meatMonsterPortrait','function frame(now)','function startLocal(']){
  assert.ok(web.includes(symbol),'built game does not include runtime symbol: '+symbol);
 }
});
