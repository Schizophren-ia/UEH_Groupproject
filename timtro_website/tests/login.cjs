// Static integrity and the intentionally retained demo-login contract.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length,'HTML IDs must be unique');
const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
for(const [,attrs,body] of scripts){const src=attrs.match(/src="([^"]+)"/);if(!src)new vm.Script(body);else if(!src[1].startsWith('https://'))new vm.Script(fs.readFileSync(path.join(root,src[1]),'utf8'));}
const demo=html.slice(html.indexOf("$('#authForm').addEventListener('submit'"),html.indexOf("$('#otpForm').addEventListener('submit'"));
assert.match(demo,/prototypeMode=true/,'Demo entry must remain enabled');
assert.match(demo,/prototype-visitor/);assert.doesNotMatch(demo,/signInWithPassword|signUp\(|validUehEmail\(/,'Do not introduce part B');
assert.match(html,/id="authForm"[^>]*novalidate/,'Keep blank/arbitrary demo inputs valid');
assert.doesNotMatch(html,/resetPasswordForEmail/,'Password recovery stays out of this scope');
const rootHtml=fs.readFileSync(path.join(root,'../index.html'),'utf8').replaceAll('href="timtro_website/assets/','href="assets/').replaceAll('src="timtro_website/assets/','src="assets/');assert.equal(rootHtml,html,'Both entry points must match after resolving asset paths');
const css=fs.readFileSync(path.join(root,'assets/aurora.css'),'utf8');for(const color of ['#f8f7ff','#ffeedd','#ffd8be','#b8b8ff','#9381ff'])assert(css.includes(color));assert(css.includes('prefers-reduced-motion'));
console.log('PASS: unique IDs, script syntax, both entry points, palette, reduced motion, and retained demo-login contract.');
