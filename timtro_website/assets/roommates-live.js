'use strict';
/* Shared student features. The database policies enforce ownership and chat membership. */
const rmEsc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rmVal=id=>$('#'+id).value.trim();
let appliedRoommateFilters=Object.fromEntries(Array.from(document.querySelectorAll('.roommate-filters input,.roommate-filters select')).map(el=>[el.id,el.type==='checkbox'?el.checked:el.value.trim()]));
function applyRoommateFilters(){appliedRoommateFilters=Object.fromEntries(Array.from(document.querySelectorAll('.roommate-filters input,.roommate-filters select')).map(el=>[el.id,el.type==='checkbox'?el.checked:el.value.trim()]));renderRoommateCards();}
const rmFilter=id=>appliedRoommateFilters[id]??(id==='rfVerified'||id==='onlySavedSlots'?false:rmVal(id));
const rmAvatar=p=>p?.avatar_url?`<img class="chat-avatar" src="${rmEsc(p.avatar_url)}" alt="Ảnh đại diện ${rmEsc(p.display_name)}">`:`<span class="chat-avatar" aria-label="Ảnh đại diện">${rmEsc((p?.display_name||'S')[0].toUpperCase())}</span>`;
let roommateSlots=[], roommateProfiles=new Map(), roommateThreads=[], roommateProfile=null, roommatePrivate=null, activeRoommateThread=null, savedRoommateIds=new Set();
let roommateLoadVersion=0,roommateDialogFocus=null;
const defaultAccountAvatar=$('#accountPfp').src;
function clearRoommateData(){
 roommateLoadVersion++;
 roommateSlots=[];roommateProfiles=new Map();roommateThreads=[];roommateProfile=null;roommatePrivate=null;activeRoommateThread=null;savedRoommateIds=new Set();
 for(const id of ['roommateResults','roommateInboxList','myConnectionsList','roommateChatMessages'])$('#'+id).replaceChildren();
 for(const id of ['accountProfileForm','privacySettingsForm','slotListingForm','roommateChatForm'])$('#'+id).reset();
 $('#slotEditId').value='';$('#closeSlotListing')?.classList.add('hidden');$('#accountPfp').src=defaultAccountAvatar;
 $('#connectionCount').textContent='0';$('#profilePreviewName').textContent='Sinh viên UEH';
 for(const id of ['rpPhone','rpZalo'])$('#'+id).type='password';
 rmClose('roommateChatPanel');rmClose('slotDialog');
}
function rmAuth(){return authenticated()&&!!supabaseClient;}
async function rmQuery(name,operation){const result=await operation(supabaseClient.from(name));if(result.error)throw result.error;return result.data;}
function rmError(error){toast(error?.message||'Không thể kết nối dữ liệu.');}
function rmProfile(id){return roommateProfiles.get(id)||{display_name:id===currentUser?.id?(currentUser.user_metadata?.username||'Bạn'):'Sinh viên UEH'};}
const roommateNeedLabels={capacity:'Tổng số người',moveDate:'Ngày muốn vào',sleep:'Giờ ngủ',quiet:'Không gian',cleaning:'Dọn dẹp',smoking:'Hút thuốc',pets:'Thú cưng',guests:'Khách đến',costs:'Chia chi phí'};
const roommateLabels={early:'Trước 23 giờ',late:'Sau 23 giờ',quiet:'Yên tĩnh',social:'Thích giao lưu',daily:'Mỗi ngày',weekly:'Theo tuần',no:'Không',yes:'Có thể',outside:'Chỉ bên ngoài',notice:'Báo trước',limited:'Hạn chế khách',equal:'Chia đều',usage:'Theo sử dụng',often:'Thường nấu ăn',sometimes:'Thỉnh thoảng nấu ăn',rarely:'Ít nấu ăn',ac:'Máy lạnh',washer:'Máy giặt',kitchen:'Bếp',parking:'Chỗ để xe'};
function rmPublicDetails(p){return [p.age?p.age+' tuổi':'',p.major,p.hometown,p.hobbies,roommateLabels[p.cooking]||p.cooking].filter(Boolean).map(v=>'<span class="person-tag">'+rmEsc(v)+'</span>').join('')+Object.entries(p.needs||{}).filter(([,v])=>v&&v!=='Any').map(([k,v])=>'<span class="person-tag">'+rmEsc((roommateNeedLabels[k]||k)+': '+(roommateLabels[v]||v))+'</span>').join('');}
function previewRoommateProfile(){
 const hidden=$('#rpHideProfile').checked;
 const p={display_name:rmVal('rpName'),avatar_url:roommateProfile?.avatar_url,bio:hidden?'':rmVal('rpIntro')};
 if(!hidden&&$('#rpShowOptional').checked)Object.assign(p,{age:rmVal('rpAge'),major:rmVal('rpMajor'),hometown:rmVal('rpHometown'),hobbies:rmVal('rpHobbies'),cooking:rmVal('rpCooking')});
 if(!hidden&&$('#rpShowNeeds').checked)p.needs=Object.fromEntries($$('[data-need]').map(el=>[el.dataset.need,el.value]));
 $('#slotDialogTitle').textContent='Hồ sơ công khai';
 $('#slotDialogBody').innerHTML=rmAvatar(p)+'<h3>'+rmEsc(p.display_name)+'</h3>'+(hidden?'<p>Hồ sơ đã ẩn.</p>':'<p>'+rmEsc(p.bio)+'</p>'+($('#rpShowStudy').checked?'<p>'+rmEsc(rmVal('rpCampus'))+' · '+rmEsc(rmVal('rpStudy'))+'</p>':'')+'<div class="person-tags">'+rmPublicDetails(p)+'</div>');
 rmDialog('slotDialog');
}
function rmDialog(id){roommateDialogFocus=document.activeElement;$('#'+id).classList.remove('hidden');document.body.classList.add('dialog-open');$('#'+id).querySelector('button')?.focus();}
function rmClose(id){$('#'+id).classList.add('hidden');if(id==='roommateChatPanel')activeRoommateThread=null;if(!$('.dialog-backdrop:not(.hidden)')){document.body.classList.remove('dialog-open');roommateDialogFocus?.focus();}}
function rmRestoreSaved(){try{savedRoommateIds=new Set(JSON.parse(localStorage.getItem('timtro_saved_'+currentUser.id)||'[]'));}catch{savedRoommateIds=new Set();}}
async function loadRoommateData(){
 if(!rmAuth())return;rmRestoreSaved();
 const userId=currentUser.id,version=++roommateLoadVersion;
 try{
  const [list,threads,profile,privateProfile]=await Promise.all([
   rmQuery('student_roommate_listing_cards',q=>q.select('*').order('created_at',{ascending:false})),
   rmQuery('student_roommate_threads',q=>q.select('*').order('created_at',{ascending:false})),
   rmQuery('student_profiles',q=>q.select('*').eq('user_id',userId).maybeSingle()),
   rmQuery('student_private_profiles',q=>q.select('*').eq('user_id',userId).maybeSingle())
  ]);
  const ids=[...new Set([...(list||[]).map(x=>x.owner_id),...(threads||[]).flatMap(x=>[x.owner_id,x.interested_user_id]),userId])];
  const people=ids.length?await rmQuery('student_public_profiles',q=>q.select('user_id,display_name,campus,study_level,age,major,hometown,hobbies,cooking,avatar_url,bio,needs').in('user_id',ids)):[];
  if(!rmAuth()||currentUser.id!==userId||version!==roommateLoadVersion)return;
  roommateSlots=list||[];roommateThreads=threads||[];roommateProfile=profile;roommatePrivate=privateProfile;
  roommateProfiles=new Map((people||[]).map(p=>[p.user_id,p]));rmFillProfile();renderRoommateCards();renderConnections();
  $('#roommateDataNote').textContent=currentUser.is_demo?'Demo trên trình duyệt này: hồ sơ, tin ở ghép và chat chỉ được lưu cục bộ; không chia sẻ giữa thiết bị.':'Bài đăng từ tài khoản sinh viên UEH. Nhãn Room Check chỉ xuất hiện sau khi xác minh thực tế.';
 }catch(error){if(!rmAuth()||currentUser.id!==userId||version!==roommateLoadVersion)return;$('#roommateDataNote').textContent='Chưa tải được danh sách phòng. Vui lòng thử lại sau.';rmError(error);}
}
function rmFillProfile(){const p=roommateProfile||{},priv=roommatePrivate||{},values={rpName:p.display_name||currentUser.user_metadata?.username||'',rpCampus:p.campus||'UEH - Campus B',rpGender:p.gender||'Any',rpStudy:p.study_level||'Năm 1',rpIntro:p.bio||'',rpAge:p.age||'',rpMajor:p.major||'',rpHometown:p.hometown||'',rpHobbies:p.hobbies||'',rpCooking:p.cooking||'',rpArea:p.living_area||'',rpBudgetMin:p.budget_min||2000000,rpBudgetMax:p.budget_max||3000000,rpPhone:priv.phone||'',rpZalo:priv.zalo||'',profileDisplayName:p.display_name||currentUser.user_metadata?.username||'',profileCampus:p.campus||'UEH - Campus B',profileStudy:p.study_level||'Năm 1',profilePhone:priv.phone||'',profileZalo:priv.zalo||'',profileBio:p.bio||''};for(const [id,v] of Object.entries(values))$('#'+id).value=v;for(const el of $$('[data-need]'))el.value=p.needs?.[el.dataset.need]||(el.tagName==='SELECT'?el.options[0].value:'');$('#rpShowStudy').checked=p.show_study!==false;$('#rpShowOptional').checked=!!p.show_optional;$('#rpShowNeeds').checked=p.show_needs!==false;$('#rpHideProfile').checked=!!p.hide_profile;$('#profilePreviewName').textContent=p.display_name||'Sinh viên UEH';applySavedPfp();}
function loadAccountProfile(){if(roommateProfile)rmFillProfile();else if(rmAuth())loadRoommateData();}
function applySavedPfp(){$('#accountPfp').src=roommateProfile?.avatar_url||defaultAccountAvatar;}
function rmNormalize(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase();}
function rmMatches(s){if(s.status!=='open'&&s.owner_id!==currentUser.id)return false;if(rmFilter('rfCapacity')!=='Any'&&s.capacity!==Number(rmFilter('rfCapacity')))return false;if(s.price_per_person<Number(rmFilter('rfBudgetMin'))||s.price_per_person>Number(rmFilter('rfBudget')))return false;if(rmFilter('rfArea')&&!rmNormalize(s.area+' '+s.near_campus).includes(rmNormalize(rmFilter('rfArea'))))return false;if(rmFilter('rfCampus')!=='Any'&&s.near_campus!==rmFilter('rfCampus'))return false;if(rmFilter('rfAvailable')&&s.available_from>rmFilter('rfAvailable'))return false;const free=s.capacity-s.occupied;if(rmFilter('rfVacancies')!=='Any'&&(rmFilter('rfVacancies')==='3'?free<3:free!==Number(rmFilter('rfVacancies'))))return false;if(rmFilter('rfGender')!=='Any'&&s.gender_preference!==rmFilter('rfGender'))return false;for(const [id,key] of [['rfSleep','sleep'],['rfSmoking','smoking'],['rfPets','pets'],['rfCleaning','cleaning']])if(rmFilter(id)!=='Any'&&s.needs?.[key]!==rmFilter(id))return false;if(rmFilter('rfAmenity')==='other'&&!(s.amenities||[]).some(v=>v.startsWith('other:')))return false;if(!['Any','other'].includes(rmFilter('rfAmenity'))&&!(s.amenities||[]).includes(rmFilter('rfAmenity')))return false;if(rmFilter('rfVerified')&&!s.room_check_verified)return false;if(rmFilter('onlySavedSlots')&&!savedRoommateIds.has(s.id))return false;return true;}
function rmCard(s){const p=rmProfile(s.owner_id),own=s.owner_id===currentUser.id,price=new Intl.NumberFormat('vi-VN').format(s.price_per_person);return `<article class="slot-card"><div class="slot-photo"><img src="${rmEsc(photos[0])}" alt="Ảnh minh họa phòng" loading="lazy"><span class="slot-badge">Còn ${s.capacity-s.occupied} chỗ / ${s.capacity} người</span></div><div class="slot-body"><h3 class="slot-title">${rmEsc(s.title)}</h3><div class="slot-location">${rmEsc(s.area)} · ${rmEsc(s.near_campus||'')}</div><div class="slot-price">${price}đ <small>/ người / tháng</small></div><div class="slot-poster">${rmAvatar(p)} <strong>${rmEsc(p.display_name)}</strong></div>${s.room_check_verified?'<span class="verified-pill">Room Check</span>':''}<div class="slot-actions"><button class="secondary" type="button" data-slot-detail="${rmEsc(s.id)}">Chi tiết</button><button class="primary" type="button" ${own?'data-slot-edit':'data-slot-interest'}="${rmEsc(s.id)}">${own?'Sửa / đóng tin':'Quan tâm · Chat'}</button></div><button class="back" type="button" data-slot-save="${rmEsc(s.id)}">${savedRoommateIds.has(s.id)?'Đã lưu':'Lưu phòng'}</button></div></article>`;}
function renderRoommateCards(){
 if(!rmAuth())return;
 const invalidBudget=Number(rmFilter('rfBudgetMin'))>Number(rmFilter('rfBudget'));
 $('#rfBudgetMin').setAttribute('aria-invalid',String(invalidBudget));$('#rfBudget').setAttribute('aria-invalid',String(invalidBudget));
 if(invalidBudget){$('#roommateResultsCount').textContent='Khoảng giá chưa hợp lệ';$('#roommateResults').innerHTML='<div class="empty">Giá tối thiểu phải nhỏ hơn hoặc bằng giá tối đa.</div>';return;}
 const list=roommateSlots.filter(rmMatches);$('#roommateResultsCount').textContent=list.length+' phòng phù hợp';$('#roommateResults').innerHTML=list.length?list.map(rmCard).join(''):'<div class="empty">Chưa có phòng phù hợp. Hãy thử nới bộ lọc hoặc đăng phòng còn chỗ.</div>';
}
function openSlotDetail(id){const s=roommateSlots.find(x=>x.id===id);if(!s)return;const p=rmProfile(s.owner_id),format=n=>new Intl.NumberFormat('vi-VN').format(n||0)+'đ';$('#slotDialogTitle').textContent=s.title;$('#slotDialogBody').innerHTML=`<p>${rmAvatar(p)} Người đăng: ${rmEsc(p.display_name)} · ${rmEsc(p.campus||'')}</p><div class="person-tags">${rmPublicDetails(p)}</div><p>${rmEsc(p.bio||'')}</p><p>${rmEsc(s.area)} · Còn ${s.capacity-s.occupied} chỗ · Chuyển vào từ ${rmEsc(s.available_from)}</p><p>Giá: ${format(s.price_per_person)}/người/tháng · Cọc: ${format(s.deposit)}</p><p>Điện: ${rmEsc(s.electricity||'Chưa nêu')} · Nước: ${rmEsc(s.water||'Chưa nêu')}</p><p>Chi phí chung: ${rmEsc(s.shared_costs||'Chưa nêu')}</p><p>Khách đến: ${rmEsc(s.guests||'Chưa nêu')} · Đồ dùng chung: ${rmEsc(s.shared_items||'Chưa nêu')}</p><p>Tiện nghi: ${rmEsc((s.amenities||[]).map(v=>v.startsWith('other:')?v.slice(6):(roommateLabels[v]||v)).join(', ')||'Chưa nêu')}</p><p>${rmEsc(s.description||'')}</p>${s.room_check_verified?'<span class="verified-pill">Room Check</span>':''}<button class="primary full" type="button" ${s.owner_id===currentUser.id?'data-slot-edit':'data-slot-interest'}="${rmEsc(s.id)}">${s.owner_id===currentUser.id?'Sửa / đóng tin':'Trò chuyện với người đăng'}</button>`;rmDialog('slotDialog');}
function renderConnections(){const html=roommateThreads.length?roommateThreads.map(t=>{const other=t.owner_id===currentUser.id?t.interested_user_id:t.owner_id,p=rmProfile(other),s=roommateSlots.find(x=>x.id===t.listing_id);return `<div class="chat-thread">${rmAvatar(p)}<div class="thread-info"><strong>${rmEsc(p.display_name)}</strong><div class="muted">${rmEsc(s?.title||'Bài đăng đã đóng')}</div></div><button class="secondary" type="button" data-thread="${rmEsc(t.id)}">Mở chat</button></div>`;}).join(''):'<p class="muted">Chưa có cuộc trò chuyện.</p>';$('#connectionCount').textContent=roommateThreads.length;$('#myConnectionsList').innerHTML=html;$('#roommateInboxList').innerHTML=html;}
async function openRoommateChat(id){
 if(!rmAuth())return;
 const userId=currentUser.id,s=roommateSlots.find(x=>x.id===id);if(!s||s.owner_id===userId)return;
 try{
  let thread=roommateThreads.find(x=>x.listing_id===id&&x.interested_user_id===userId);
  if(!thread){
   thread=await rmQuery('student_roommate_threads',q=>q.insert({listing_id:id,owner_id:s.owner_id,interested_user_id:userId}).select().single());
   if(!rmAuth()||currentUser.id!==userId)return;
   roommateThreads.unshift(thread);
  }
  await rmOpenThread(thread.id);
 }catch(error){if(rmAuth()&&currentUser.id===userId)rmError(error);}
}
async function rmOpenThread(id){
 if(!rmAuth())return;
 const thread=roommateThreads.find(t=>t.id===id);
 if(!thread||![thread.owner_id,thread.interested_user_id].includes(currentUser.id))return;
 const switching=activeRoommateThread?.id!==id;
 activeRoommateThread=thread;
 const other=thread.owner_id===currentUser.id?thread.interested_user_id:thread.owner_id,p=rmProfile(other),s=roommateSlots.find(x=>x.id===thread.listing_id);
 $('#roommateChatTitle').textContent=p.display_name;$('#roommateChatContext').textContent=s?.title||'Bài đăng đã đóng';
 if(switching){$('#roommateChatMessages').textContent='Đang tải tin nhắn…';$('#roommateChatInput').value='';}
 const header=$('#roommateChatTitle').parentElement;header.querySelector('.chat-avatar')?.remove();header.insertAdjacentHTML('afterbegin',rmAvatar(p));
 rmClose('slotDialog');renderConnections();rmDialog('roommateChatPanel');await refreshRoommateChat();
}
async function refreshRoommateChat(){
 if(!activeRoommateThread||!rmAuth())return;
 const threadId=activeRoommateThread.id,userId=currentUser.id;
 try{
  const rows=await rmQuery('student_roommate_messages',q=>q.select('*').eq('thread_id',threadId).order('created_at',{ascending:true}));
  if(!rmAuth()||currentUser.id!==userId||activeRoommateThread?.id!==threadId)return;
  $('#roommateChatMessages').innerHTML=rows?.length?rows.map(m=>{const me=m.sender_id===userId,p=rmProfile(m.sender_id);return `<div class="chat-message ${me?'mine':''}">${me?'':rmAvatar(p)}<div class="chat-bubble ${me?'mine':''}">${rmEsc(m.body)}<time>${rmEsc(new Date(m.created_at).toLocaleString('vi-VN'))}</time></div>${me?rmAvatar(p):''}</div>`;}).join(''):'<p class="privacy-note">Hỏi về tiền cọc, điện nước và ngày chuyển vào.</p>';
  $('#roommateChatMessages').scrollTop=$('#roommateChatMessages').scrollHeight;
 }catch(error){if(rmAuth()&&activeRoommateThread?.id===threadId)rmError(error);}
}
async function rmSaveProfile(account){if(!rmAuth())return;const p={user_id:currentUser.id,display_name:(account?rmVal('profileDisplayName'):rmVal('rpName'))||'Sinh viên UEH',campus:account?rmVal('profileCampus'):rmVal('rpCampus'),study_level:account?rmVal('profileStudy'):rmVal('rpStudy'),bio:account?rmVal('profileBio'):rmVal('rpIntro'),gender:rmVal('rpGender'),age:rmVal('rpAge')?Number(rmVal('rpAge')):null,major:rmVal('rpMajor'),hometown:rmVal('rpHometown'),hobbies:rmVal('rpHobbies'),cooking:rmVal('rpCooking'),living_area:rmVal('rpArea'),budget_min:Number(rmVal('rpBudgetMin')),budget_max:Number(rmVal('rpBudgetMax')),needs:Object.fromEntries($$('[data-need]').map(el=>[el.dataset.need,el.value])),show_study:$('#rpShowStudy').checked,show_optional:$('#rpShowOptional').checked,show_needs:$('#rpShowNeeds').checked,hide_profile:$('#rpHideProfile').checked,avatar_url:roommateProfile?.avatar_url||null};if(p.budget_max<p.budget_min){toast('Ngân sách tối đa phải lớn hơn tối thiểu.');return;}try{await rmQuery('student_profiles',q=>q.upsert(p,{onConflict:'user_id'}));await rmQuery('student_private_profiles',q=>q.upsert({user_id:currentUser.id,phone:account?rmVal('profilePhone'):rmVal('rpPhone'),zalo:account?rmVal('profileZalo'):rmVal('rpZalo')},{onConflict:'user_id'}));await loadRoommateData();toast('Đã lưu hồ sơ.');}catch(error){rmError(error);}}
async function rmSaveListing(e){e.preventDefault();if(!rmAuth())return;const capacity=Number(rmVal('slotCapacity')),occupied=Number(rmVal('slotOccupied'));if(occupied<1||occupied>=capacity){toast('Số người đang ở phải nhỏ hơn sức chứa.');return;}if(!roommateProfile?.display_name){toast('Hãy lưu hồ sơ trước khi đăng bài.');return;}const payload={owner_id:currentUser.id,title:rmVal('slotTitle'),area:rmVal('slotArea'),near_campus:rmVal('slotCampus'),capacity,occupied,price_per_person:Number(rmVal('slotPrice')),available_from:rmVal('slotAvailable'),gender_preference:rmVal('slotGender'),deposit:Number(rmVal('slotDeposit'))||0,electricity:rmVal('slotElectricity'),water:rmVal('slotWater'),shared_costs:rmVal('slotCosts'),guests:rmVal('slotGuests'),shared_items:rmVal('slotShared'),description:rmVal('slotDescription'),amenities:[...$$('input[name="slotAmenity"]:checked').map(el=>el.value),...(rmVal('slotOtherAmenities')?['other:'+rmVal('slotOtherAmenities')]:[])],needs:{sleep:rmVal('slotSleep'),cleaning:rmVal('slotCleaning'),pets:rmVal('slotPets'),smoking:roommateProfile.needs?.smoking||'Any'},landlord_consent:$('#slotLandlordConsent').checked,status:'open'};try{const id=rmVal('slotEditId');if(id)await rmQuery('student_roommate_listings',q=>q.update(payload).eq('id',id));else await rmQuery('student_roommate_listings',q=>q.insert(payload));$('#slotListingForm').reset();$('#slotEditId').value='';$('#closeSlotListing').classList.add('hidden');await loadRoommateData();toast(id?'Đã cập nhật bài đăng.':currentUser.is_demo?'Đã lưu bài đăng demo trên trình duyệt này.':'Đã đăng bài cho sinh viên UEH.');}catch(error){rmError(error);}}
function rmEditListing(id){const s=roommateSlots.find(x=>x.id===id&&x.owner_id===currentUser.id);if(!s)return;const values={slotEditId:s.id,slotTitle:s.title,slotArea:s.area,slotCampus:s.near_campus||'',slotCapacity:s.capacity,slotOccupied:s.occupied,slotPrice:s.price_per_person,slotAvailable:s.available_from,slotGender:s.gender_preference,slotSleep:s.needs?.sleep||'Any',slotCleaning:s.needs?.cleaning||'Any',slotPets:s.needs?.pets||'Any',slotDeposit:s.deposit,slotElectricity:s.electricity||'',slotWater:s.water||'',slotCosts:s.shared_costs||'',slotGuests:s.guests||'',slotShared:s.shared_items||'',slotDescription:s.description||'',slotOtherAmenities:(s.amenities||[]).filter(v=>v.startsWith('other:')).map(v=>v.slice(6)).join(', ')};for(const [id,v] of Object.entries(values))$('#'+id).value=v;$('#slotLandlordConsent').checked=!!s.landlord_consent;$$('input[name="slotAmenity"]').forEach(el=>el.checked=(s.amenities||[]).includes(el.value));$('#closeSlotListing').classList.remove('hidden');$('.roommate-publish').open=true;rmClose('slotDialog');$('#slotListingForm').scrollIntoView({behavior:'smooth'});}
$('#privacySettingsForm').addEventListener('submit',e=>{e.preventDefault();rmSaveProfile(false);});$('#accountProfileForm').addEventListener('submit',e=>{e.preventDefault();rmSaveProfile(false);});$('#slotListingForm').addEventListener('submit',rmSaveListing);
$('#roommateChatForm').addEventListener('submit',async e=>{
 e.preventDefault();if(!activeRoommateThread||!rmAuth())return;
 const body=rmVal('roommateChatInput'),threadId=activeRoommateThread.id,userId=currentUser.id,button=e.currentTarget.querySelector('button[type="submit"]');
 if(!body||body.length>1000||button.disabled)return;
 button.disabled=true;
 try{
  await rmQuery('student_roommate_messages',q=>q.insert({thread_id:threadId,sender_id:userId,body}));
  if(!rmAuth()||currentUser.id!==userId||activeRoommateThread?.id!==threadId)return;
  if(rmVal('roommateChatInput')===body)$('#roommateChatInput').value='';
  await refreshRoommateChat();
 }catch(error){if(rmAuth()&&currentUser.id===userId)rmError(error);}
 finally{button.disabled=false;}
});
$('#refreshInbox').addEventListener('click',loadRoommateData);$('#refreshRoommates').addEventListener('click',loadRoommateData);$('#myConnectionsBtn').addEventListener('click',()=>{$('#myConnectionsPanel').classList.toggle('hidden');renderConnections();});$('#closeConnections').addEventListener('click',()=>$('#myConnectionsPanel').classList.add('hidden'));$('#closeRoommateChat').addEventListener('click',()=>{rmClose('roommateChatPanel');activeRoommateThread=null;});$('#closeSlotDialog').addEventListener('click',()=>rmClose('slotDialog'));
$('#refreshRoommateChat').addEventListener('click',refreshRoommateChat);
$('#editRoommateProfile').addEventListener('click',()=>{showPage('account');$('#accountRoommateDetails').scrollIntoView({behavior:'smooth'});});$('#rpName').addEventListener('input',()=>$('#profilePreviewName').textContent=rmVal('rpName')||'Sinh viên UEH');$('#togglePrivateInputs').addEventListener('click',()=>{const reveal=$('#rpPhone').type==='password';for(const id of ['rpPhone','rpZalo'])$('#'+id).type=reveal?'text':'password';});$('#previewMyProfile').addEventListener('click',previewRoommateProfile);
$('#resetRoommateFilters').addEventListener('click',()=>{
 for(const id of ['rfCapacity','rfCampus','rfVacancies','rfGender','rfSleep','rfSmoking','rfPets','rfCleaning','rfAmenity'])$('#'+id).value='Any';
 $('#rfBudgetMin').value='0';$('#rfBudget').value='20000000';$('#rfArea').value='';$('#rfAvailable').value='';$('#rfVerified').checked=false;$('#onlySavedSlots').checked=false;applyRoommateFilters();
});
$('#searchRoommateFilters').addEventListener('click',applyRoommateFilters);
document.addEventListener('click',e=>{const detail=e.target.closest('[data-slot-detail]');if(detail){openSlotDetail(detail.dataset.slotDetail);return;}const interest=e.target.closest('[data-slot-interest]');if(interest){openRoommateChat(interest.dataset.slotInterest);return;}const thread=e.target.closest('[data-thread]');if(thread){rmOpenThread(thread.dataset.thread);return;}const edit=e.target.closest('[data-slot-edit]');if(edit){rmEditListing(edit.dataset.slotEdit);return;}const save=e.target.closest('[data-slot-save]');if(save){const id=save.dataset.slotSave;savedRoommateIds.has(id)?savedRoommateIds.delete(id):savedRoommateIds.add(id);try{localStorage.setItem('timtro_saved_'+currentUser.id,JSON.stringify([...savedRoommateIds]));}catch{}renderRoommateCards();return;}if(e.target.classList.contains('dialog-backdrop'))rmClose(e.target.id);});
$('#slotListingForm').insertAdjacentHTML('beforeend','<button type="button" id="closeSlotListing" class="secondary hidden">Đóng bài đăng này</button>');$('#closeSlotListing').addEventListener('click',async()=>{try{await rmQuery('student_roommate_listings',q=>q.update({status:'closed'}).eq('id',rmVal('slotEditId')));$('#slotListingForm').reset();$('#slotEditId').value='';$('#closeSlotListing').classList.add('hidden');await loadRoommateData();toast('Đã đóng bài đăng.');}catch(error){rmError(error);}});
$('#slotCapacity').addEventListener('change',()=>$('#slotOccupied').max=Number(rmVal('slotCapacity'))-1);
$('#choosePfp').addEventListener('click',()=>$('#pfpFile').click());$('#pfpFile').addEventListener('change',async()=>{const file=$('#pfpFile').files?.[0];if(!file||!rmAuth())return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>2*1024*1024){toast('Chọn ảnh PNG, JPEG hoặc WebP tối đa 2 MB.');return;}const path=currentUser.id+'/avatar.'+file.type.split('/')[1];try{const {error}=await supabaseClient.storage.from('student-avatars').upload(path,file,{upsert:true,contentType:file.type});if(error)throw error;const {data}=supabaseClient.storage.from('student-avatars').getPublicUrl(path);await rmQuery('student_profiles',q=>q.upsert({user_id:currentUser.id,display_name:roommateProfile?.display_name||currentUser.user_metadata?.username||'Sinh viên UEH',avatar_url:currentUser.is_demo?data.publicUrl:data.publicUrl+'?v='+Date.now()},{onConflict:'user_id'}));await loadRoommateData();toast('Đã cập nhật ảnh đại diện.');}catch(error){rmError(error);}});
document.addEventListener('keydown',e=>{
 const dialog=$('.dialog-backdrop:not(.hidden)');if(!dialog)return;
 if(e.key==='Escape'){rmClose(dialog.id);return;}
 if(e.key==='Tab'){
  const nodes=[...dialog.querySelectorAll('button,input,textarea,select,a[href]')].filter(el=>!el.disabled&&el.offsetParent!==null),first=nodes[0],last=nodes.at(-1);
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
 }
});
