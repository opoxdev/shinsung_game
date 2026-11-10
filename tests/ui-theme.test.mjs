import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {UI_THEMES,THEME_STORAGE_KEY,normalizeUiTheme,loadUiTheme,applyUiTheme,nextUiTheme} from '../src/ui-theme.js';

function fakeStorage(initial=null){
 const map=new Map(initial===null?[]:[[THEME_STORAGE_KEY,initial]]);
 return {getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value),dump:()=>Object.fromEntries(map)};
}
function fakeRoot(){
 const variables=new Map();
 return {dataset:{},style:{setProperty:(name,value)=>variables.set(name,value)},variables};
}
test('UI theme registry has documented, complete palettes and unique themed treatments',()=>{
 assert.ok(Object.keys(UI_THEMES).length>=2);
 for(const [id,theme] of Object.entries(UI_THEMES)){
  assert.match(id,/^[a-z][a-z0-9-]*$/);
  assert.ok(theme.name.length>3&&theme.description.length>=10);
  assert.ok(['standard','festival'].includes(theme.kind));
  assert.ok(theme.icon.length);
  const colors=theme.colors;
  assert.deepEqual(Object.keys(colors).sort(),Object.keys(UI_THEMES.classic.colors).sort());
  for(const color of Object.values(colors))assert.match(color,/^#[0-9a-fA-F]{6}$/);
 }
 assert.equal(UI_THEMES.classic.kind,'standard');
 assert.equal(UI_THEMES.christmas.kind,'festival');
 assert.notEqual(UI_THEMES.classic.colors.background,UI_THEMES.christmas.colors.background);
});
test('seasonal default, user preference, invalid values and blocked browser storage fallbacks',()=>{
 assert.equal(loadUiTheme(fakeStorage()),'christmas');
 assert.equal(loadUiTheme(fakeStorage(),'classic'),'classic');
 assert.equal(loadUiTheme(fakeStorage('classic')),'classic');
 assert.equal(loadUiTheme(fakeStorage('christmas')),'christmas');
 assert.equal(loadUiTheme(fakeStorage('invented'),'classic'),'classic');
 assert.equal(loadUiTheme({getItem(){throw Error('Storage denied');}},'christmas'),'christmas');
 assert.equal(normalizeUiTheme('not-a-theme'),'christmas');
 assert.equal(normalizeUiTheme({name:'christmas'},'classic'),'classic');
 assert.equal(normalizeUiTheme('__proto__','classic'),'classic');
});
test('one-click switching changes only root design tokens, no gameplay state or navigation',()=>{
 const storage=fakeStorage(),root=fakeRoot();
 const game={coins:12345,wave:14,christmasEnabled:false,christmasCleared:[1,2],modes:['darkenergy']};
 const before=JSON.stringify(game);
 assert.equal(applyUiTheme(root,'christmas',storage),'christmas');
 assert.equal(root.dataset.theme,'christmas');
 assert.equal(root.dataset.themeKind,'festival');
 assert.equal(root.variables.get('--ui-red'),UI_THEMES.christmas.colors.red);
 assert.equal(root.variables.get('--ui-background'),UI_THEMES.christmas.colors.background);
 assert.equal(storage.dump()[THEME_STORAGE_KEY],'christmas');
 assert.equal(nextUiTheme('christmas'),'classic');
 assert.equal(nextUiTheme('classic'),'christmas');
 assert.equal(applyUiTheme(root,'classic',storage),'classic');
 assert.equal(root.dataset.themeKind,'standard');
 assert.equal(root.variables.get('--ui-background'),UI_THEMES.classic.colors.background);
 assert.equal(storage.dump()[THEME_STORAGE_KEY],'classic');
 assert.equal(JSON.stringify(game),before);
 assert.equal(applyUiTheme(root,'bad-theme',storage),'christmas','unknown themes fail closed');
 assert.equal(root.dataset.theme,'christmas');
});
test('theme application continues if browser persistence is unavailable',()=>{
 const root=fakeRoot();
 const denied={setItem(){throw Error('Private browser mode');}};
 assert.equal(applyUiTheme(root,'classic',denied),'classic');
 assert.equal(root.dataset.theme,'classic');
 assert.equal(root.variables.size,Object.keys(UI_THEMES.classic.colors).length);
 assert.throws(()=>applyUiTheme(null,'christmas'),/문서 루트/);
});
test('separate seasonal CSS covers major game screens and scales without Canvas particle draws',()=>{
 const directory=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
 const css=readFileSync(path.join(directory,'src/ui-theme.css'),'utf8');
 for(const scope of ['.shell','.topbar','.sidebar','.content','.map-stage','.briefing',
  '.tower-card','.tower-detail','.shop-tabs','.feature-card','.pack-config-screen',
  '.battle','.battle-stats','.wave-panel','.battle-inspector','.loadout-slot',
  '.modal','#toast','.theme-cycle','.christmas-page']){
  assert.ok(css.includes(scope),'missing seasonal styling for '+scope);
 }
 assert.match(css,/data-theme="christmas"/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/body:has\(\.battle\)::before\{animation:none/);
 assert.ok(!css.includes('url(http'),'theme does not depend on external sprites or requests');
 const bundler=readFileSync(path.join(directory,'scripts/build.mjs'),'utf8');
 assert.ok(bundler.includes("'ui-theme'"),'theme JS is part of self-contained browser bundle');
 assert.ok(bundler.includes("'src/ui-theme.css'"),'global theme CSS ships in every build');
});
