(async()=>{
 if(window.__shareRecipient)return;
 const steps=[],errors=[],el=id=>document.getElementById(id),click=id=>el(id).click();
 addEventListener('error',e=>errors.push(e.message));addEventListener('unhandledrejection',e=>errors.push(String(e.reason)));
 const wait=ms=>new Promise(r=>setTimeout(r,ms)),until=async(fn,label)=>{for(let i=0;i<200;i++){if(fn())return;await wait(20);}throw Error(label);};
 const check=(ok,label)=>{if(!ok)throw Error(label);steps.push(label);};
 const navigate=query=>{history.replaceState(null,'',location.pathname+query);RoomShare.route();};
 try{
  await until(()=>typeof RoomShare!=='undefined'&&RoomShare.ready,'Sharing module not ready');
  const initial=new URLSearchParams(location.search).get('room');
  check(!authenticated()&&currentUser===null,'Recipient remains unauthenticated');
  check(el('authGate').classList.contains('hidden')&&!document.body.classList.contains('role-pending'),'Public link bypasses login screen');
  check(String(currentRoom.id)===initial&&!el('detailPage').classList.contains('hidden'),'Deep link opens exact requested room');
  check(getComputedStyle(document.querySelector('.nav')).display==='none','Private navigation hidden in public viewer');
  check(getComputedStyle(el('ownerMessageForm')).display==='none'&&!el('reportDialog').open,'Private form not available publicly');
  check(getComputedStyle(document.querySelector('#detailRoomTools [data-report-kind]')).display==='none'&&getComputedStyle(document.querySelector('#detailRoomTools [data-compare-kind]')).display==='none','Report and comparison actions stay private');
  check(el('publicRoomNotice').textContent.includes('minh họa'),'Public page labels sample imagery and verification');
  check(el('totalCost').textContent===money(currentRoom.rent+400000),'Public cost matches requested room');click('costDetails');check(!el('costExtra').classList.contains('hidden'),'Recipient can expand monthly cost breakdown');click('costDetails');
  click('roomTabChecks');check(!el('roomPanelChecks').classList.contains('hidden')&&el('verificationPage').textContent.includes(checkCount(currentRoom)+'/3'),'Verification tab accessible without login');
  click('roomTabOwner');check(el('contactLandlord').textContent.includes(currentRoom.ownerName)&&el('contactLandlord').textContent.includes('Lần xác minh cuối'),'Public landlord and illustrative verification date are visible');
  openRoomMap(initial);check(el('roomMapDialog').open&&el('roomMapFrame').src.includes('marker='),'Map accessible for current public room');click('closeRoomMap');
  openRoomMap(initial==='1'?'2':'1');check(!el('roomMapDialog').open,'Public map permission limited to current room');
  click('roomTabOverview');await until(()=>window.TimTroTour?.canvas.width>0,'360 canvas not available');const yaw=TimTroTour.getState().yaw;click('tourRight');check(TimTroTour.getState().yaw!==yaw,'Public 360 viewer can rotate');
  click('shareRoom');check(el('roomShareDialog').open&&el('roomShareLink').value===location.origin+location.pathname+'?room='+initial,'Share button creates current room URL');
  let copied;const descriptor=Object.getOwnPropertyDescriptor(navigator,'clipboard');Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>copied=value}});
  click('copyRoomShare');await until(()=>el('roomShareStatus').textContent.includes('Đã sao chép'),'Copy success not reported');check(copied===el('roomShareLink').value,'Copy action receives exact public link');
  Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied');}}});click('copyRoomShare');await until(()=>el('roomShareStatus').textContent.includes('Chưa sao chép'),'Missing manual fallback');check(document.activeElement===el('roomShareLink')&&el('roomShareLink').selectionStart===0,'Denied clipboard selects link for manual copy');
  if(descriptor)Object.defineProperty(navigator,'clipboard',descriptor);else delete navigator.clipboard;click('closeRoomShare');
  check(document.activeElement===el('shareRoom'),'Share dialog restores focus');
  history.replaceState(null,'',location.pathname+'?room='+initial+'&email=private&auth=live#secret');click('shareRoom');const clean=new URL(el('roomShareLink').value);check([...clean.searchParams.keys()].join(',')==='room'&&!clean.hash,'Share link excludes auth parameters and private query/fragment');click('closeRoomShare');
  navigate('?room=5');check(currentRoom.id===5&&el('verificationPage').textContent.includes('1/3'),'Published one-layer sample has a working deep link');
  for(const query of ['?room=999','?room=4','?room=6','?room=','?room=1&room=2','?room=%3Cimg%20src=x%3E']){const before=currentRoom.id;navigate(query);check(!el('roomUnavailablePage').classList.contains('hidden')&&el('detailPage').classList.contains('hidden')&&currentRoom.id===before,'Invalid/unpublished link gives unavailable state: '+query);}
  const local={id:'host-private-share',title:'Tin cục bộ',status:'available',rent:2900000,area:20,address:'Địa chỉ cục bộ',ownerZalo:'https://zalo.me/private'};
  const old=localStorage.getItem('timtro_host_rooms_v2');localStorage.setItem('timtro_host_rooms_v2',JSON.stringify([local]));RoomShare.openShare(local.id);check(!el('roomShareLink').value&&el('roomShareLinkWrap').classList.contains('hidden')&&el('roomShareHelp').textContent.includes('chỉ lưu trên trình duyệt'),'Local-only room displays explanation instead of unusable URL');click('closeRoomShare');if(old===null)localStorage.removeItem('timtro_host_rooms_v2');else localStorage.setItem('timtro_host_rooms_v2',old);
  navigate('?room='+initial);showPage('account');check(!authenticated()&&!el('authGate').classList.contains('hidden'),'Private route still requires sign-in');
  RoomShare.route();check(el('authGate').classList.contains('hidden'),'Returning to public link restores read-only view');
  check(!localStorage.getItem('timtro_demo_accounts_v1')&&!sessionStorage.getItem('timtro_demo_session_v1'),'Public viewing creates no demo account or session');
  click('shareRoom');check(new URL(el('roomShareLink').value).searchParams.get('room')===initial,'Sharing after room switches still targets visible room');click('closeRoomShare');
  // Exercise the real demo Auth flow from the public sign-in CTA, then return to the shared room.
  click('publicRoomSignIn');click('signupTab');el('authUsername').value='Người xem chia sẻ';el('authEmail').value='parent.123456789@st.ueh.edu.vn';el('authPassword').value='ShareDemoPass321!';el('authConfirmPassword').value='ShareDemoPass321!';el('agreeRules').checked=true;
  const solveBot=()=>{const nums=el('botQuestion').textContent.match(/(\d+) \+ (\d+)/);el('botAnswer').value=Number(nums[1])+Number(nums[2]);el('notRobot').checked=true;};solveBot();el('authForm').requestSubmit();await until(()=>!el('otpForm').classList.contains('hidden'),'Signup OTP from shared page failed');el('authOtp').value=el('demoOtpCode').textContent;el('otpForm').requestSubmit();el('authPassword').value='ShareDemoPass321!';solveBot();el('authForm').requestSubmit();await until(()=>authenticated(),'Public sign-in failed');
  check(String(currentRoom.id)===initial&&!el('detailPage').classList.contains('hidden')&&!document.body.classList.contains('public-room-view'),'Signing in returns to the originally shared room with full UI');
  demoLogout();localStorage.removeItem('timtro_demo_accounts_v1');RoomShare.route();check(!authenticated()&&el('authGate').classList.contains('hidden'),'Shared room remains readable after logging out and reopening link');
  check(document.documentElement.scrollWidth<=innerWidth+1,'Public view fits viewport');check(errors.length===0,'No browser errors');
  document.body.dataset.testCount=String(steps.length);document.body.dataset.testResult='PASS';
 }catch(error){errors.push(error.stack||error.message);document.body.dataset.testResult='FAIL';document.body.dataset.testErrors=JSON.stringify(errors);}
})();
