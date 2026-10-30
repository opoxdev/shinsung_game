/** Lightweight GAS web host. Gameplay and profiles are served by Cloudflare. */
function doGet(){
  var props=PropertiesService.getScriptProperties();
  var cfg=JSON.parse(props.getProperty('FIREBASE_CONFIG')||'{}');
  var api=(props.getProperty('CLOUDFLARE_API')||'').replace(/\/$/,'');
  if(!cfg.apiKey||!cfg.projectId)throw Error('FIREBASE_CONFIG에 Firebase 공개 웹 설정 JSON을 등록하세요.');
  if(!/^https:\/\/[a-z0-9.-]+\.workers\.dev$/.test(api)&&!/^https:\/\/[a-z0-9.-]+$/.test(api))throw Error('CLOUDFLARE_API에 HTTPS Worker 주소를 등록하세요.');
  var view=HtmlService.createTemplateFromFile('Index');
  view.firebaseConfig=JSON.stringify(cfg).replace(/</g,'\\u003c');
  view.cloudflareApi=JSON.stringify(api).replace(/</g,'\\u003c');
  return view.evaluate().setTitle('신성 디펜스').addMetaTag('viewport','width=device-width,initial-scale=1');
}
