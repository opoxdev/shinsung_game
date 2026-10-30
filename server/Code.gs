/**
 * Shinsung Defense: stable Google Apps Script entry point.
 * Game JS/CSS is served as Cloudflare Worker static assets. A regular game update
 * requires only a GitHub/Cloudflare deployment; the public GAS /exec URL stays put.
 * These values are PUBLIC client configuration, never service-account secrets.
 */
var SHINSUNG_FIREBASE = {
  apiKey: "AIzaSyCWDfeBcKvn5ph2rM8PTz6qvZyLm13Bvm8",
  authDomain: "shinsung-td.firebaseapp.com",
  projectId: "shinsung-td",
  storageBucket: "shinsung-td.firebasestorage.app",
  messagingSenderId: "1048725135250",
  appId: "1:1048725135250:web:7370a3f41310804fb56b4b"
};
var SHINSUNG_WORKER = "https://shinsung-game.joehw0405.workers.dev";

function doGet() {
  var props = PropertiesService.getScriptProperties();
  var configured = props.getProperty("FIREBASE_CONFIG");
  var cfg = configured ? JSON.parse(configured) : SHINSUNG_FIREBASE;
  var api = (props.getProperty("CLOUDFLARE_API") || SHINSUNG_WORKER).replace(/\/$/, "");
  if (!cfg.apiKey || !cfg.projectId) throw Error("Firebase 공개 웹 설정을 확인하세요.");
  if (!/^https:\/\/[a-z0-9.-]+$/.test(api)) throw Error("Cloudflare Worker HTTPS 주소를 확인하세요.");

  var page = HtmlService.createTemplateFromFile("Index");
  page.firebaseConfig = JSON.stringify(cfg).replace(/</g, "\\u003c");
  page.cloudflareApi = JSON.stringify(api).replace(/</g, "\\u003c");
  page.assetBase = api;
  return page.evaluate()
    .setTitle("신성 디펜스")
    .addMetaTag("viewport", "width=device-width,initial-scale=1");
}
