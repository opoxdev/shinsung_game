// Server-owned global operations. No client storage or profile overrides.
// One row is intentionally kept indefinitely, so disabling a seasonal
// campaign does NOT delete player progress, rewards, maps or item definitions.
export const DEFAULT_SITE_SETTINGS=Object.freeze({
 christmasEnabled:true,theme:'christmas',version:0,updatedAt:null
});
export const SITE_THEMES=Object.freeze(['classic','christmas']);
const tableReady=db=>db.prepare("CREATE TABLE IF NOT EXISTS site_settings (id TEXT PRIMARY KEY, json TEXT NOT NULL, updated_at INTEGER NOT NULL)").run();
export async function readSiteSettings(db){
 // Avoid executing CREATE TABLE on every anonymous settings read. Existing
 // deployments without the table are migrated on their first request.
 let row;
 try{
   row=await db.prepare("SELECT json,updated_at FROM site_settings WHERE id='global'").first();
 }catch(e){
   if(!/no such table[^\n]*site_settings/i.test(String(e.message)))throw e;
   await tableReady(db);
   row=await db.prepare("SELECT json,updated_at FROM site_settings WHERE id='global'").first();
 }
 if(!row)return {...DEFAULT_SITE_SETTINGS};
 let value;
 try{value=JSON.parse(row.json);}catch{throw Error('운영 설정 데이터가 손상되었습니다.');}
 return {christmasEnabled:value.christmasEnabled===true,
  theme:SITE_THEMES.includes(value.theme)?value.theme:DEFAULT_SITE_SETTINGS.theme,
  version:Number.isSafeInteger(value.version)?value.version:0,
  updatedAt:row.updated_at};
}
export function validateSiteSettings(payload){
 if(!payload||typeof payload!=='object'||Array.isArray(payload)||
    Object.keys(payload).sort().join(',')!=='christmasEnabled,theme,version')
  throw Error('운영 설정 요청 형식이 올바르지 않습니다.');
 if(typeof payload.christmasEnabled!=='boolean')throw Error('이벤트 활성화 값이 올바르지 않습니다.');
 if(typeof payload.theme!=='string'||!SITE_THEMES.includes(payload.theme))
  throw Error('지원하지 않는 전체 테마입니다.');
 if(!Number.isSafeInteger(payload.version)||payload.version<0)
  throw Error('운영 설정 버전이 올바르지 않습니다.');
 return payload;
}
export async function writeSiteSettings(db,request){
 const p=validateSiteSettings(request),current=await readSiteSettings(db);
 if(current.version!==p.version)throw Error('다른 관리자가 운영 설정을 변경했습니다. 최신 상태를 불러오세요.');
 const next={christmasEnabled:p.christmasEnabled,theme:p.theme,version:current.version+1};
 const changed=await db.prepare("INSERT INTO site_settings(id,json,updated_at) VALUES ('global',?,?) ON CONFLICT(id) DO UPDATE SET json=excluded.json, updated_at=excluded.updated_at WHERE json_extract(site_settings.json,'$.version')=?")
   .bind(JSON.stringify(next),Date.now(),p.version).run();
 // Do not treat a racing write as success.
 if(changed?.meta?.changes===0)throw Error('운영 설정이 동시에 변경되었습니다. 새로고침 후 다시 시도하세요.');
 return readSiteSettings(db);
}
