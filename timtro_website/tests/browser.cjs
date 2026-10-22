/* Real Chrome rendering with a local Supabase fixture. Uses native CDP; no test dependency needed. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'.qa');fs.mkdirSync(out,{recursive:true});
const chrome=process.argv.includes('--chrome')?process.argv[process.argv.indexOf('--chrome')+1]:'C:/Program Files/Google/Chrome/Application/chrome.exe';
const shareSuite=process.argv.includes('--share'),toolsSuite=process.argv.includes('--tools'),demo=process.argv.includes('--demo')||toolsSuite;
const mock=fs.readFileSync(path.join(__dirname,'fixtures/supabase.js'),'utf8'),harness=(toolsSuite?fs.readFileSync(path.join(__dirname,'fixtures/tools-scenarios.js'),'utf8')+'\n':'')+fs.readFileSync(path.join(__dirname,shareSuite?'fixtures/share-scenarios.js':demo?'fixtures/demo-scenarios.js':'fixtures/scenarios.js'),'utf8');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg'};
const server=http.createServer((req,res)=>{
 const route=decodeURIComponent(req.url.split('?')[0]);
 if(route==='/mock-supabase.js'){res.setHeader('Content-Type',mime['.js']);return res.end(mock);}
 let target=path.resolve(root,'.'+route);
 if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 if(route.endsWith('/'))target=path.join(target,'index.html');
 fs.readFile(target,(error,bytes)=>{
  if(error){res.writeHead(404);return res.end();}
  let content=bytes;
  if(path.extname(target)==='.html')content=bytes.toString('utf8').replace('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2','/mock-supabase.js').replace('</body>','<script>'+harness+'</script></body>');
  res.setHeader('Content-Type',mime[path.extname(target)]||'application/octet-stream');res.end(content);
 });
});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let child,connection,sequence=0;const pending=new Map(),browserErrors=[];
function request(method,params={},sessionId){
 return new Promise((resolve,reject)=>{
  const id=++sequence,timeout=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout: '+method));},20000);
  pending.set(id,{resolve,reject,timeout});connection.send(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})}));
 });
}
async function evaluate(expression,sessionId){
 const result=await request('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);
 if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);
 return result.result.value;
}
async function screenshot(file,sessionId){const shot=await request('Page.captureScreenshot',{format:'png'},sessionId);fs.writeFileSync(path.join(out,file),Buffer.from(shot.data,'base64'));}
async function run(width,route){
 const {targetId}=await request('Target.createTarget',{url:'about:blank'});
 const {sessionId}=await request('Target.attachToTarget',{targetId,flatten:true});
 await request('Page.enable',{},sessionId);await request('Runtime.enable',{},sessionId);
 await request('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<600},sessionId);
 await request('Page.navigate',{url:'http://127.0.0.1:'+server.address().port+route},sessionId);
 let report;
 for(let attempts=0;attempts<(demo?900:200);attempts++){
  report=await evaluate('document.body?.dataset.testResult',sessionId);
  if(report)break;if(child.exitCode!==null)throw Error('Chrome exited during test');await sleep(100);
 }
 const html=await evaluate('document.documentElement.outerHTML',sessionId);fs.writeFileSync(path.join(out,'priority-'+width+'.html'),html);
 await screenshot('priority-'+width+'.png',sessionId);
 if(report!=='PASS')console.error(await evaluate("({errors:document.body.dataset.testErrors,auth:document.getElementById('authMessage').textContent,question:document.getElementById('botQuestion')?.textContent,answer:document.getElementById('botAnswer')?.value,checked:document.getElementById('notRobot')?.checked,invalidFields:[...document.querySelectorAll('#authForm input')].filter(e=>!e.validity.valid).map(e=>({id:e.id,value:e.value,message:e.validationMessage})),toast:document.getElementById('toast').textContent})",sessionId));
 assert.equal(report,'PASS',report||'Browser scenario did not finish');
 const count=await evaluate('document.body.dataset.testCount',sessionId);
 if(shareSuite){
  await screenshot('share-public-'+width+'.png',sessionId);
  await evaluate('document.getElementById("shareRoom").click()',sessionId);await screenshot('share-dialog-'+width+'.png',sessionId);
  const link=await evaluate('document.getElementById("roomShareLink").value',sessionId),expected=new URL(link).searchParams.get('room');
  const {browserContextId}=await request('Target.createBrowserContext');
  const recipient=await request('Target.createTarget',{url:'about:blank',browserContextId});
  const attached=await request('Target.attachToTarget',{targetId:recipient.targetId,flatten:true}),other=attached.sessionId;
  await request('Page.enable',{},other);await request('Runtime.enable',{},other);await request('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<600},other);
  await request('Page.addScriptToEvaluateOnNewDocument',{source:'window.__shareRecipient=true;'},other);
  await request('Page.navigate',{url:link},other);
  for(let i=0;i<200;i++){if(await evaluate('typeof RoomShare!=="undefined"&&RoomShare.ready',other))break;await sleep(100);}
  assert.equal(await evaluate('!authenticated()&&String(currentRoom.id)==='+JSON.stringify(expected)+'&&document.getElementById("authGate").classList.contains("hidden")',other),true,'Exact copied URL opens correct room in a separate empty browser context');
  assert.equal(await evaluate('localStorage.getItem("timtro_demo_accounts_v1")===null&&sessionStorage.getItem("timtro_demo_session_v1")===null',other),true,'Recipient needs no sender account or browser data');
  await request('Page.reload',{},other);
  for(let i=0;i<200;i++){if(await evaluate('typeof RoomShare!=="undefined"&&RoomShare.ready',other))break;await sleep(100);}
  assert.equal(await evaluate('!authenticated()&&String(currentRoom.id)==='+JSON.stringify(expected)+'&&document.getElementById("authGate").classList.contains("hidden")',other),true,'Reload preserves exact public room without login');
  await request('Target.disposeBrowserContext',{browserContextId});await request('Target.closeTarget',{targetId});
  console.log('PASS: '+count+' share checks + separate-browser recipient and reload at '+width+'px');return;
 }
 if(width===1440&&!demo){
  const full=await request('Runtime.evaluate',{expression:"(async()=>{openRoom('1');document.getElementById('tourFull').click();for(let i=0;i<50;i++){if(document.fullscreenElement)return true;await new Promise(r=>setTimeout(r,20));}return false;})()",userGesture:true,awaitPromise:true,returnByValue:true},sessionId);
  assert.equal(full.result.value,true,'360 fullscreen must open after a user gesture');
  await screenshot('priority-tour-full.png',sessionId);
  const exited=await evaluate("(async()=>{document.getElementById('tourExitFull').click();for(let i=0;i<50;i++){if(!document.fullscreenElement)return true;await new Promise(r=>setTimeout(r,20));}return false;})()",sessionId);
  assert.equal(exited,true,'360 fullscreen exit button must work');
 }
 if(demo){
  if(toolsSuite){
   await evaluate("RoomTools.clearSelection();for(const id of ['1','2','3'])RoomTools.toggleCompare('rental',id);RoomTools.openComparison()",sessionId);
   await screenshot('tools-comparison-'+width+'.png',sessionId);
   await evaluate("showPage('reportHistory');RoomTools.renderReports()",sessionId);await screenshot('tools-reports-'+width+'.png',sessionId);
  }
  await evaluate('sessionStorage.setItem("__demoTestReload","1")',sessionId);
  await request('Page.reload',{},sessionId);
  for(let i=0;i<150;i++){if(await evaluate('typeof authenticated==="function"&&authenticated()&&currentUser.is_demo'+(toolsSuite?'&&typeof RoomTools!=="undefined"&&!!document.getElementById("comparisonBar")':''),sessionId))break;await sleep(100);}
  assert.equal(await evaluate('authenticated()&&currentUser.is_demo&&document.getElementById("authGate").classList.contains("hidden")',sessionId),true,'Demo session persists across reload');
  if(toolsSuite){
   assert.equal(await evaluate('RoomTools.selection.length===3',sessionId),true,'Comparison selection persists across reload');
   assert.equal(await evaluate('(async()=>{const rows=await RoomTools.reportStore("list");return rows.length===1&&await rows[0].files[0].blob.text()==="%PDF-1.4 local-receipt";})()',sessionId),true,'IndexedDB preserves actual evidence bytes across reload');
   await evaluate("openRoom('1');document.getElementById('roomTabOverview').focus()",sessionId);
   await request('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight'},sessionId);await request('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight',code:'ArrowRight'},sessionId);
   assert.equal(await evaluate('document.activeElement.id==="roomTabChecks"&&document.getElementById("roomTabChecks").getAttribute("aria-selected")==="true"',sessionId),true,'Tabs support keyboard navigation and selection');
   await evaluate("selectRoomTab('overview');RoomTools.openReport('rental','1')",sessionId);
   await request('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'},sessionId);await request('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape'},sessionId);
   assert.equal(await evaluate('!document.getElementById("reportDialog").open',sessionId),true,'Report dialog closes with Escape');
   await evaluate("selectRoomTab('overview')",sessionId);await screenshot('tools-detail-'+width+'.png',sessionId);
  }
  await evaluate('demoLogout();document.getElementById("signupTab").click()',sessionId);
  await request('Emulation.setDeviceMetricsOverride',{width,height:500,deviceScaleFactor:1,mobile:width<600},sessionId);
  await evaluate('document.getElementById("authGate").scrollTop=0',sessionId);
  await request('Input.dispatchMouseEvent',{type:'mouseWheel',x:Math.floor(width/2),y:350,deltaX:0,deltaY:600},sessionId);await sleep(150);
  assert(await evaluate('document.getElementById("authGate").scrollTop>0',sessionId),'Mouse wheel scrolls signup on short screens');
  assert(await evaluate('document.documentElement.scrollWidth<=innerWidth+1',sessionId),'No horizontal overflow');
  await evaluate('document.getElementById("backToAuthChoice").scrollIntoView()',sessionId);await screenshot('demo-auth-'+width+'.png',sessionId);
  const back=await evaluate('(()=>{const b=document.getElementById("backToAuthChoice"),r=b.getBoundingClientRect();return {width:r.width,scroll:b.scrollWidth,height:r.height,background:getComputedStyle(b).backgroundColor};})()',sessionId);
  assert(back.width>=back.scroll-1&&back.height>=40,'Back button fits text');
  assert.equal(back.background,'rgb(243, 240, 255)','Back button has independent style');
  await request('Target.closeTarget',{targetId});console.log('PASS: '+count+' demo checks + reload, wheel scrolling and back button at '+width+'px');return;
 }
 await evaluate("showPage('roommates')",sessionId);
 const chatFits=await evaluate("(async()=>{await openRoommateChat('slot-2');const r=document.querySelector('.chat-dialog').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1;})()",sessionId);
 assert(chatFits,'Chat must fit inside the viewport at '+width+'px');
 await screenshot('priority-chat-'+width+'.png',sessionId);
 await request('Target.closeTarget',{targetId});
 console.log('PASS: '+count+' UI checks, camera panorama and chat layout at '+width+'px, '+route+(width===1440?' + fullscreen':''));
}
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const profile=fs.mkdtempSync(path.join(out,'chrome-check-'));
 child=cp.spawn(chrome,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader','--use-angle=swiftshader','--disable-gpu-sandbox','--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{windowsHide:true});
 let stderr='';child.stderr.on('data',data=>stderr+=data);child.stdout.resume();
 const portFile=path.join(profile,'DevToolsActivePort');
 for(let i=0;i<100&&!fs.existsSync(portFile);i++){if(child.exitCode!==null)throw Error(stderr.slice(-1000));await sleep(100);}
 assert(fs.existsSync(portFile),'Chrome did not open a debugging port');
 let port,endpoint;
 for(let i=0;i<100;i++){
  try{[port,endpoint]=fs.readFileSync(portFile,'utf8').trim().split(/\r?\n/);if(port&&endpoint)break;}catch(error){if(!['EBUSY','ENOENT'].includes(error.code))throw error;}
  await sleep(100);
 }
 assert(port&&endpoint,'Chrome debugging port file must be complete');
 connection=new WebSocket('ws://127.0.0.1:'+port+endpoint);
 await new Promise((resolve,reject)=>{connection.addEventListener('open',resolve,{once:true});connection.addEventListener('error',reject,{once:true});});
 connection.addEventListener('message',event=>{
  const message=JSON.parse(event.data),entry=pending.get(message.id);
  if(entry){clearTimeout(entry.timeout);pending.delete(message.id);message.error?entry.reject(Error(message.error.message)):entry.resolve(message.result);}
  if(message.method==='Runtime.exceptionThrown')browserErrors.push(message.params.exceptionDetails.text);
 });
 await run(1440,'/timtro_website/'+(shareSuite?'?room=1':demo?'':'?auth=live'));await run(390,'/'+(shareSuite?'?room=2':demo?'':'?auth=live'));
 assert.deepEqual(browserErrors,[],'No uncaught JavaScript errors');
 fs.writeFileSync(path.join(out,shareSuite?'share-results.json':toolsSuite?'tools-results.json':demo?'demo-results.json':'priority-results.json'),JSON.stringify({passed:true,widths:[1440,390],browserErrors,backend:shareSuite?'public room route and isolated anonymous recipient':demo?'actual local demo Auth, IndexedDB and storage':'in-memory Supabase fixture'},null,2));
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{
 if(connection?.readyState===WebSocket.OPEN){try{await request('Browser.close');}catch{}connection.close();}
 if(child&&child.exitCode===null)child.kill();server.close();
});
