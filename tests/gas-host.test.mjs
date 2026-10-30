import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, stat} from 'node:fs/promises';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('Official GAS host is a small permanent HTML shell with external graphics', async () => {
  const html = await read('dist/apps-script/Index.html');
  assert.match(html, /<div id="app"><\/div>/);
  assert.match(html, /<script defer src="<\?!= assetBase \?>\/game\.js"><\/script>/);
  assert.match(html, /<link rel="stylesheet" href="<\?!= assetBase \?>\/game\.css">/);
  assert.match(html, /globalThis\.__FIREBASE_CONFIG__ = <\?!= firebaseConfig \?>/);
  assert.doesNotMatch(html, /\/\/ --- main\.js ---/);
  assert.ok(html.length < 2500);
});

test('Build publishes separate JS and CSS bundles for Worker assets', async () => {
  const js = await read('dist/web/game.js');
  const css = await read('dist/web/game.css');
  assert.match(js, /class Online/);
  assert.match(js, /__CLOUDFLARE_API__/);
  assert.match(css, /\.shell\{|:root\{/);
  assert.ok(js.length > 20_000);
  assert.ok(css.length > 10_000);
});

test('Wrangler configurations serve game assets without replacing API worker', async () => {
  const nested = await read('cloudflare/wrangler.toml');
  const root = await read('wrangler.toml');
  assert.match(nested, /directory = "\.\.\/dist\/web"/);
  assert.match(root, /directory = "\.\/dist\/web"/);
  assert.match(nested, /name = "shinsung-game"/);
  assert.match(nested, /\[\[durable_objects\.bindings\]\]/);
});

test('GAS host uses public Firebase defaults and public Worker HTTPS URL only', async () => {
  const code = await read('server/Code.gs');
  assert.match(code, /shinsung-td/);
  assert.match(code, /shinsung-game\.joehw0405\.workers\.dev/);
  assert.doesNotMatch(code, /PRIVATE_KEY|CLIENT_EMAIL/);
  const distCode = await read('dist/apps-script/Code.gs');
  assert.equal(distCode, code);
});
