const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length,'HTML IDs must be unique');
for(const [,attrs,body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
 const src=attrs.match(/src="([^"]+)"/);
 if(!src)new vm.Script(body);
 else if(!src[1].startsWith('https://'))new vm.Script(fs.readFileSync(path.join(root,src[1]),'utf8'));
}
assert.match(html,/id="authForm" class="hidden"/,'Account form must be behind first choice');
assert.match(html,/id="authConfirmPassword"/);
assert.match(html,/signUp\(/);assert.match(html,/signInWithPassword\(/);
assert.match(html,/email_confirmed_at/);
assert.doesNotMatch(html,/prototypeMode=true|prototype-visitor|Enter anything \(optional\)/);
assert.match(html,/assets\/ueh-logo\.png/);
assert.match(html,/assets\/roommates-live\.js/);
const rootHtml=fs.readFileSync(path.resolve(root,'../index.html'),'utf8').replaceAll('href="timtro_website/assets/','href="assets/').replaceAll('src="timtro_website/assets/','src="assets/');
assert.equal(rootHtml,html,'Both entry points must match');
const live=fs.readFileSync(path.join(root,'assets/roommates-live.js'),'utf8');
for(const name of ['student_roommate_listings','student_roommate_threads','student_roommate_messages','student_private_profiles','student_public_profiles'])assert(live.includes(name));
assert.doesNotMatch(live,/timtro_demo_chat|timtro_slot_listings/);
console.log('PASS: unique IDs, JavaScript syntax, auth gate, live-data wiring and synchronized entries.');
