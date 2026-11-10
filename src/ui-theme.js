// UI theme registry. To add a new holiday, add one entry and a matching
// [data-theme="..."] skin in ui-theme.css. Theme choice is CLIENT ONLY:
// it cannot alter events, rewards, simulation, room state, or account records.
export const THEME_STORAGE_KEY='shinsung.ui.theme.v1';
export const UI_THEMES=Object.freeze({
 classic:Object.freeze({
  name:'기본 테마',description:'푸른 성채와 모험의 원래 색감',icon:'✧',kind:'standard',
  colors:Object.freeze({
   background:'#1b2948',panel:'#27365a',header:'#304975',headerDeep:'#233252',
   card:'#2b4167',ink:'#f8fbff',muted:'#a1b4dc',gold:'#ffda64',accent:'#8edcfe',
   green:'#84e99d',red:'#cf6386',border:'#7597c2',deep:'#162644'
  })
 }),
 christmas:Object.freeze({
  name:'크리스마스 테마',description:'반짝이는 전구, 루비 리본과 북극 설경',icon:'❄',kind:'festival',
  colors:Object.freeze({
   background:'#122a36',panel:'#1f4b48',header:'#2b6256',headerDeep:'#173c45',
   card:'#244c51',ink:'#fff9ec',muted:'#c2dcda',gold:'#ffe3a2',accent:'#d7f6f3',
   green:'#a4ecbc',red:'#e77d88',border:'#d4b780',deep:'#102b36'
  })
 })
});
export const normalizeUiTheme=(name,fallback='christmas')=>
 typeof name==='string'&&Object.hasOwn(UI_THEMES,name)?name:
 Object.hasOwn(UI_THEMES,fallback)?fallback:'classic';
export function loadUiTheme(storage,fallback='christmas'){
 let value=null;
 try{value=storage?.getItem(THEME_STORAGE_KEY);}catch{}
 return normalizeUiTheme(value,fallback);
}
export function applyUiTheme(root,name,storage=null){
 const id=normalizeUiTheme(name),theme=UI_THEMES[id];
 if(!root||!root.dataset||!root.style?.setProperty)
  throw Error('테마를 적용할 문서 루트를 찾을 수 없습니다.');
 root.dataset.theme=id;
 root.dataset.themeKind=theme.kind;
 for(const [key,color] of Object.entries(theme.colors))
  root.style.setProperty('--ui-'+key,color);
 try{storage?.setItem(THEME_STORAGE_KEY,id);}catch{}
 return id;
}
export function nextUiTheme(current){
 const names=Object.keys(UI_THEMES);
 const index=names.indexOf(current);
 return names[(index+1)%names.length];
}
