/* Public room links expose only published sample rooms; never serialize local records into a URL. */
const RoomShare=(()=>{
 let publicView=false,publicId=null,returnToRoom=null;
 const allowedPages={detail:'overview',verification:'checks',reviews:'checks',contact:'owner'};
 const publicRoom=id=>rooms.find(r=>String(r.id)===String(id)&&r.is_sample===true&&checkCount(r)>=1);
 const requested=()=>{const ids=new URLSearchParams(location.search).getAll('room');return ids.length===1&&/^[1-9][0-9]*$/.test(ids[0])?ids[0]:null;};
 function linkFor(id){if(!publicRoom(id))return null;const url=new URL(location.href);url.search='';url.hash='';url.searchParams.set('room',String(id));return url.href;}
 function dismissAuth(){for(const id of ['authGate','roleGate'])$('#'+id).classList.add('hidden');document.body.classList.remove('role-pending','host-mode');}
 function showPublicPage(page){
  $$('main > section').forEach(s=>s.classList.add('hidden'));
  $('#detailPage').classList.remove('hidden');selectRoomTab(allowedPages[page]||'overview');dismissAuth();
  document.body.classList.add('public-room-view');$('#publicRoomNotice').classList.remove('hidden');window.scrollTo({top:0,behavior:'instant'});
 }
 function signIn(){
  returnToRoom=publicId;publicView=false;publicId=null;document.body.classList.remove('public-room-view');$('#publicRoomNotice').classList.add('hidden');
  if($('#roomShareDialog').open)$('#roomShareDialog').close();showAuth();
 }
 function route(){
  if(!new URLSearchParams(location.search).has('room'))return;
  const id=requested(),r=id&&publicRoom(id);
  if(!r){
   publicView=!authenticated();publicId=null;document.body.classList.toggle('public-room-view',publicView);dismissAuth();
   $$('main > section').forEach(s=>s.classList.add('hidden'));$('#roomUnavailablePage').classList.remove('hidden');return;
  }
  publicView=!authenticated();publicId=String(r.id);document.body.classList.toggle('public-room-view',publicView);
  openRoom(r.id);if(publicView)showPublicPage('detail');
 }
 function openShare(id=currentRoom.id,trigger=document.activeElement){
  const r=allFinderRooms().find(r=>String(r.id)===String(id));if(!r)return;
  const link=linkFor(id);$('#roomShareTitle').textContent='Chia sẻ phòng · '+r.title;$('#roomShareLink').value=link||'';
  $('#roomShareLinkWrap').classList.toggle('hidden',!link);$('#copyRoomShare').classList.toggle('hidden',!link);$('#roomShareStatus').textContent='';
  $('#roomShareHelp').textContent=link?'Sao chép liên kết và gửi cho người thân. Người nhận có thể xem thông tin phòng mà không cần đăng nhập.':r.is_sample?'Phòng này chưa được công khai nên chưa thể chia sẻ liên kết.':'Tin này chỉ lưu trên trình duyệt của bạn. Chưa có liên kết mở được trên thiết bị khác.';
  const dialog=$('#roomShareDialog');dialog._trigger=trigger;if(!dialog.open)dialog.showModal();
 }
 async function copy(){
  const input=$('#roomShareLink'),value=input.value;if(!value)return;
  try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(value);$('#roomShareStatus').textContent='Đã sao chép liên kết phòng.';}
  catch{input.focus();input.select();input.setSelectionRange(0,value.length);$('#roomShareStatus').textContent='Chưa sao chép tự động được. Liên kết đã được chọn; hãy sao chép bằng Ctrl+C hoặc chạm giữ trên điện thoại.';}
 }
 document.querySelector('main').insertAdjacentHTML('beforeend','<section id="roomUnavailablePage" class="content hidden"><h1>Phòng không còn khả dụng</h1><p>Liên kết không hợp lệ hoặc phòng chưa được công khai. Hãy kiểm tra lại liên kết với người gửi.</p><button class="primary" id="unavailableSignIn" type="button">Về trang đăng nhập</button></section>');
 $('#detailPage > .back').insertAdjacentHTML('afterend','<div id="publicRoomNotice" class="public-room-notice hidden"><span>Bạn đang xem thông tin phòng được chia sẻ. Phòng mẫu, ảnh/360°, điểm và xác thực đều mang tính minh họa.</span><button class="secondary" id="publicRoomSignIn" type="button">Đăng nhập để sử dụng đầy đủ</button></div>');
 document.body.insertAdjacentHTML('beforeend','<dialog id="roomShareDialog" class="tool-dialog"><header><h2 id="roomShareTitle">Chia sẻ phòng</h2><button class="secondary" id="closeRoomShare" type="button" aria-label="Đóng khung chia sẻ">Đóng ×</button></header><p id="roomShareHelp"></p><div id="roomShareLinkWrap"><label for="roomShareLink">Liên kết đến phòng</label><input id="roomShareLink" type="url" readonly autocomplete="off"></div><div class="tool-actions"><button class="primary" id="copyRoomShare" type="button">Sao chép liên kết</button></div><p id="roomShareStatus" class="share-status" role="status" aria-live="polite"></p></dialog>');
 $('#closeRoomShare').addEventListener('click',()=>{$('#roomShareDialog').close();$('#roomShareDialog')._trigger?.focus();});
 $('#copyRoomShare').addEventListener('click',copy);$('#publicRoomSignIn').addEventListener('click',signIn);
 $('#unavailableSignIn').addEventListener('click',()=>{const url=new URL(location.href);url.searchParams.delete('room');history.replaceState(null,'',url);if(authenticated()){publicView=false;document.body.classList.remove('public-room-view');showPage('search');}else signIn();});
 const baseOwner=renderRoomOwner;
 renderRoomOwner=function(){baseOwner();$('#detailRoomTools .tool-actions').insertAdjacentHTML('beforeend','<button class="secondary" id="shareRoom" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/></svg>Chia sẻ phòng</button>');};
 const basePage=showPage;
 showPage=function(page){
  if(publicView&&!authenticated()){
   if(publicId&&Object.hasOwn(allowedPages,page)){showPublicPage(page);return;}
   signIn();return;
  }
  basePage(page);$('#publicRoomNotice').classList.add('hidden');
 };
 const baseAuth=showAuth;
 showAuth=function(){if(publicView&&!authenticated()){dismissAuth();return;}baseAuth();};
 const baseAfterAuth=afterAuthentication;
 afterAuthentication=function(){
  const wanted=returnToRoom;returnToRoom=null;publicView=false;document.body.classList.remove('public-room-view');baseAfterAuth();
  if(wanted&&publicRoom(wanted))openRoom(wanted);else if(new URLSearchParams(location.search).has('room'))route();
 };
 const baseOpen=openRoom;
 openRoom=function(id){
  if(publicView&&!authenticated()){
   const r=publicRoom(id);if(!r)return;publicId=String(r.id);
  }
  baseOpen(id);
  if(new URLSearchParams(location.search).has('room')){
   const link=linkFor(currentRoom.id),url=new URL(location.href);if(link)url.searchParams.set('room',String(currentRoom.id));else url.searchParams.delete('room');history.replaceState(null,'',url);
  }
 };
 // Private controls remain guarded; the public route grants no authenticated session.
 document.addEventListener('click',event=>{
  const shareButton=event.target.closest('#shareRoom');if(shareButton){openShare(currentRoom.id,shareButton);return;}
  if(!publicView||authenticated())return;
  if(event.target.closest('[data-compare-kind],[data-report-kind],[data-save],#ownerMessageForm')){event.preventDefault();event.stopImmediatePropagation();signIn();}
 },true);
 addEventListener('popstate',route);
 renderRoomOwner();route();
 return {linkFor,openShare,route,canView:id=>publicView&&!authenticated()&&publicId===String(id)&&!!publicRoom(id),ready:true};
})();
