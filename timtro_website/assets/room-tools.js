'use strict';
/* Comparison and trust examples share room IDs; reports and their evidence stay in this browser. */
const RoomTools=(()=>{
 const esc=hostEscape,missing='Chưa cung cấp';
 const shield='<svg viewBox="0 0 24 28" aria-hidden="true"><path d="M12 1 23 5v8c0 7-7 12-11 14C8 25 1 20 1 13V5Z" fill="currentColor"/><path d="m6 13 4 4 8-9" fill="none" stroke="white" stroke-width="2"/></svg>';
 const scores={rental:[92,88,75,35,55,30],shared:[92,88,75,72,55,35]};
 let selection=[],selectionOwner=null,returnState={page:'search',y:0},reportTarget=null,files=[],reportBusy=false,version=0,urls=[];
 const storageKey=name=>'timtro_'+name+'_'+currentUser.id;
 const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||'null')||fallback;}catch{return fallback;}};
 function room(kind,id){return (kind==='rental'?allFinderRooms():roommateSlots).find(r=>String(r.id)===String(id));}
 function eligible(kind,r){return !!r&&(kind!=='rental'||checkCount(r)>=1);}
 function score(kind,r){if(!r?.is_sample)return null;const index=kind==='rental'?Number(r.id)-1:Number(String(r.id).replace('sample-slot-',''))-1;return scores[kind][index]??null;}
 function tier(n){return n==null?['unknown','Chưa chấm điểm']:n>=90?['','Rất tin cậy']:n>=70?['','Tin cậy']:n>=50?['medium','Cần cân nhắc']:['low','Rủi ro cao'];}
 function trust(kind,r){const n=score(kind,r),[style,label]=tier(n);return `<button type="button" class="trust-score ${style}" data-trust-kind="${kind}" data-trust-id="${esc(r.id)}" aria-label="Điểm tin cậy ${n??'chưa chấm'} trên 100, ${n==null?label:'điểm mô phỏng'}">${shield}<strong>${n??'—'}<small>/100</small></strong><span>${label}<small>${n==null?'Chưa có dữ liệu chấm điểm':'Điểm mô phỏng'}</small></span></button>`;}
 const picked=(kind,id)=>selection.some(s=>s.kind===kind&&s.id===String(id));
 function compareButton(kind,id){return `<button class="secondary" type="button" data-compare-kind="${kind}" data-compare-id="${esc(id)}" aria-pressed="${picked(kind,id)}">${picked(kind,id)?'Đã chọn so sánh':'Chọn so sánh'}</button>`;}
 const reportButton=(kind,id)=>`<button class="secondary report-trigger" type="button" data-report-kind="${kind}" data-report-id="${esc(id)}">Báo cáo tin đăng</button>`;
 function activePage(){return $$('main > section').find(s=>!s.classList.contains('hidden'))?.id.replace(/Page$/,'')||'search';}
 function message(id,text,success=false){const node=$('#'+id);node.textContent=text;node.classList.toggle('success',success);}
 function dialog(id){const el=$('#'+id);if(!el.open){el._trigger=document.activeElement;el.showModal();}}
 function close(id){const el=$('#'+id);el.close();el._trigger?.focus();}
 function revokeUrls(){urls.forEach(URL.revokeObjectURL);urls=[];}
 function blobUrl(blob){const url=URL.createObjectURL(blob);urls.push(url);return url;}
 function persistSelection(){try{localStorage.setItem(storageKey('compare_selection_v1'),JSON.stringify(selection));return true;}catch{toast('Không lưu được lựa chọn so sánh trên trình duyệt.');return false;}}
 function hydrate(){if(!authenticated())return;selectionOwner=currentUser.id;const raw=read(storageKey('compare_selection_v1'),[]);selection=[];if(Array.isArray(raw))for(const s of raw){if(selection.length>=3)break;if(!['rental','shared'].includes(s?.kind)||selection.some(p=>p.id===String(s.id))||selection.length&&s.kind!==selection[0].kind)continue;selection.push({kind:s.kind,id:String(s.id)});}syncSelection();}
 function syncSelection(){
  if(!authenticated())return;
  if(selectionOwner!==currentUser.id){hydrate();return;}
  selection=selection.filter(s=>{const r=room(s.kind,s.id);return s.kind==='shared'&&!roommateSlots.length||eligible(s.kind,r);});
  const showBar=!!selection.length&&!['comparison','reportHistory'].includes(activePage());$('#comparisonBar').classList.toggle('hidden',!showBar);document.body.classList.toggle('has-comparison',showBar);
  $('#comparisonCount').textContent=`${selection.length}/3 phòng`;$('#comparisonNames').textContent=selection.map(s=>room(s.kind,s.id)?.title||'Đang tải bài ở ghép').join(' · ');$('#openComparison').disabled=selection.length<2;
  $$('[data-compare-kind]').forEach(b=>{const yes=picked(b.dataset.compareKind,b.dataset.compareId);b.setAttribute('aria-pressed',String(yes));b.textContent=yes?'Đã chọn so sánh':'Chọn so sánh';});
 }
 function toggleCompare(kind,id){
  if(!authenticated())return showAuth();if(selectionOwner!==currentUser.id)hydrate();
  const r=room(kind,id);if(!eligible(kind,r))return toast('Phòng này không còn trong danh sách có thể so sánh.');
  if(picked(kind,id))selection=selection.filter(s=>!(s.kind===kind&&s.id===String(id)));
  else{
   if(selection.length&&selection[0].kind!==kind){$('#switchComparison').dataset.kind=kind;$('#switchComparison').dataset.roomId=id;dialog('compareSwitchDialog');return;}
   if(selection.length>=3)return toast('Bạn chỉ có thể so sánh tối đa 3 phòng. Hãy bỏ một phòng trước.');
   selection.push({kind,id:String(id)});
  }
  persistSelection();syncSelection();if(activePage()==='comparison')renderComparison();
 }
 function clearSelection(){selection=[];persistSelection();syncSelection();if(activePage()==='comparison')renderComparison();}
 function normalized(kind,r){
  const shared=kind==='shared',validNumber=n=>typeof n==='number'&&Number.isFinite(n);
  return {r,id:r.id,title:r.title,photo:shared?photos[r.photo_index??0]:r.photo,price:shared?r.price_per_person:r.rent,unit:shared?' / người / tháng':' / phòng / tháng',
   area:shared?(validNumber(r.floor_area)?r.floor_area+' m²':missing):(validNumber(r.area)?r.area+' m²':missing),address:shared?r.area:r.address,
   amenities:Array.isArray(r.amenities)?r.amenities.map(v=>v.startsWith('other:')?v.slice(6):(typeof roommateLabels!=='undefined'?roommateLabels[v]:null)||v).join(', '):r.is_sample?'Giường, tủ, máy lạnh, WiFi, máy giặt chung, bếp chung':missing,
   deposit:validNumber(r.deposit)?money(r.deposit):missing,cost:shared?[r.electricity&&'Điện: '+r.electricity,r.water&&'Nước: '+r.water,r.shared_costs].filter(Boolean).join(' · ')||missing:validNumber(r.utilities)?money(r.utilities)+'/tháng':r.is_sample?'400.000đ/tháng · Ước tính mẫu':missing,
   distance:shared?missing:!r.isHostListing&&validNumber(r.distance)?r.distance+' km · Tham khảo':missing,rating:r.reviews>0&&validNumber(r.rating)?r.rating+'/5 ('+r.reviews+' đánh giá'+(r.is_sample?' mẫu':'')+')':missing,
   type:shared?'Ở ghép':r.type==='shared'?'Phòng ở ghép':'Phòng riêng',hours:r.hours||missing};
 }
 function renderComparison(){
  syncSelection();const items=selection.map(s=>({kind:s.kind,r:room(s.kind,s.id)})).filter(s=>eligible(s.kind,s.r));
  $('#comparisonSelection').innerHTML=items.map(({kind,r})=>`<div class="comparison-chip"><span>${esc(r.title)}</span><button type="button" data-remove-comparison="${esc(r.id)}" aria-label="Bỏ ${esc(r.title)}">×</button></div>`).join('');
  $('#comparisonSave').disabled=items.length<2;
  if(items.length<2){$('#comparisonContent').innerHTML='<div class="empty">Chọn từ 2 đến 3 phòng cùng loại để xem bảng so sánh.</div>';return;}
  const kind=items[0].kind,shared=kind==='shared',data=items.map(s=>normalized(kind,s.r));
  let rows=[['Giá thuê',d=>money(d.price)+d.unit],['Diện tích',d=>d.area],['Loại phòng',d=>d.type],['Tiện nghi',d=>d.amenities],['Địa chỉ / khu vực',d=>d.address||missing],['Cọc',d=>d.deposit],['Chi phí khác',d=>d.cost],['Giờ giấc',d=>d.hours],['Khoảng cách đến trường',d=>d.distance],['Đánh giá người thuê',d=>d.rating],['Xác thực',d=>checkLabel(d.r)+(d.r.is_sample?' · Mô phỏng':'')]];
  if(shared)rows.push(['Sức chứa',d=>d.r.capacity+' người'],['Đang ở / chỗ trống',d=>d.r.occupied+' người / '+(d.r.capacity-d.r.occupied)+' chỗ'],['Ngày chuyển vào',d=>d.r.available_from||missing],['Điều kiện sinh hoạt',d=>Object.entries(d.r.needs||{}).map(([k,v])=>(roommateLabels[k]||k)+': '+(roommateLabels[v]||v)).join(' · ')||missing]);
  $('#comparisonContent').innerHTML=`<div class="comparison-scroll" tabindex="0" role="region" aria-label="Bảng so sánh phòng, cuộn ngang để xem các cột"><table class="comparison-table"><caption class="sr-only">So sánh ${data.length} ${shared?'phòng ở ghép, giá theo người':'phòng thuê, giá cả phòng'}</caption><thead><tr><th scope="col">Tiêu chí</th>${data.map((d,i)=>`<th scope="col"><img src="${esc(d.photo)}" alt="Ảnh ${esc(d.title)}"><small>Phòng ${i+1}</small><h3>${esc(d.title)}</h3><div class="price">${money(d.price)}${esc(d.unit)}</div>${trust(kind,d.r)}<button class="secondary" type="button" data-comparison-detail="${esc(d.id)}" data-kind="${kind}">Xem phòng</button></th>`).join('')}</tr></thead><tbody>${rows.map(([label,get])=>`<tr><th scope="row">${label}</th>${data.map(d=>`<td>${esc(get(d))}</td>`).join('')}</tr>`).join('')}</tbody></table></div><div class="comparison-summary"><div><h3>Tóm tắt nhanh</h3><p>Giá thấp nhất: ${esc(data.reduce((a,b)=>a.price<=b.price?a:b).title)}.</p><p>Giá ${shared?'tính theo người':'tính cả phòng'}; chi phí ngoài tiền thuê cần đối chiếu riêng.</p></div><div><h3>Điểm tin cậy tham khảo</h3><p>Điểm số trên phòng mẫu là mô phỏng, chưa có công thức chấm thực tế.</p><p>Hãy kiểm tra phòng, chủ trọ và điều kiện thuê trước khi quyết định.</p></div></div>`;
 }
 function openComparison(){
  if(!authenticated())return showAuth();syncSelection();
  if(selection.length<2)return toast('Hãy chọn ít nhất 2 phòng.');
  const page=activePage();if(['home','search','favorites','roommates'].includes(page))returnState={page,y:scrollY};
  else if(selection[0]?.kind==='shared'&&returnState.page!=='roommates')returnState={page:'roommates',y:0};
  else if(selection[0]?.kind==='rental'&&!['home','search','favorites'].includes(returnState.page))returnState={page:'search',y:0};
  showPage('comparison');
 }
 function returnToList(){showPage(returnState.page);requestAnimationFrame(()=>window.scrollTo({top:returnState.y,behavior:'instant'}));}
 async function renderSaved(){
  const sets=read(storageKey('compare_saved_v1'),[]);$('#savedComparisonList').innerHTML=Array.isArray(sets)&&sets.length?sets.map(s=>`<div class="saved-comparison"><span><strong>${esc(s.title)}</strong><br><small>${new Date(s.createdAt).toLocaleString('vi-VN')}</small></span><button class="secondary" data-load-comparison="${esc(s.id)}">Mở</button><button class="secondary" data-delete-comparison="${esc(s.id)}">Xóa</button></div>`).join(''):'<p>Chưa có bộ so sánh đã lưu.</p>';
 }
 function saveComparison(){
  const items=selection.filter(s=>eligible(s.kind,room(s.kind,s.id)));if(items.length<2)return;
  const sets=read(storageKey('compare_saved_v1'),[]);sets.push({id:crypto.randomUUID(),createdAt:new Date().toISOString(),title:items.map(s=>room(s.kind,s.id).title).join(' · '),items});
  try{localStorage.setItem(storageKey('compare_saved_v1'),JSON.stringify(sets));toast('Đã lưu bộ so sánh trên trình duyệt này.');renderSaved();}catch{toast('Không đủ bộ nhớ để lưu bộ so sánh.');}
 }
 let database;
 function db(){return database||(database=new Promise((resolve,reject)=>{const request=indexedDB.open('timtro_local_reports_v1',1);request.onupgradeneeded=()=>{const store=request.result.createObjectStore('reports',{keyPath:'id'});store.createIndex('userId','userId');};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);request.onblocked=()=>reject(Error('Bộ nhớ báo cáo đang bận. Hãy đóng tab cũ và thử lại.'));}).catch(error=>{database=null;throw error;}));}
 async function reportStore(action,record){
  if(!authenticated())throw Error('Hãy đăng nhập để xem báo cáo của bạn.');const userId=currentUser.id,connection=await db();
  if(currentUser?.id!==userId)throw Error('Tài khoản đã thay đổi.');
  return new Promise((resolve,reject)=>{
   const tx=connection.transaction('reports',action==='list'?'readonly':'readwrite'),store=tx.objectStore('reports');let result;
   tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error||Error('Không lưu được báo cáo.'));tx.onabort=()=>reject(tx.error||Error('Thao tác đã hủy.'));
   if(action==='list'){const req=store.index('userId').getAll(userId);req.onsuccess=()=>result=req.result;}
   else if(action==='put'){if(record.userId!==userId){tx.abort();return;}store.put(record);result=record;}
   else if(action==='delete'){const req=store.get(record);req.onsuccess=()=>{if(req.result?.userId===userId)store.delete(record);};}
  });
 }
 function reportFiles(){
  $('#reportFileList').innerHTML=files.map((f,i)=>`<li><span>${esc(f.name)}<small>${(f.size/1024/1024).toFixed(2)} MB · ${esc(f.type)}</small></span><button class="secondary" type="button" data-remove-evidence="${i}" aria-label="Xóa ${esc(f.name)}">Xóa</button></li>`).join('');
 }
 function addFiles(incoming){
  message('reportError','');const types={'image/jpeg':/\.jpe?g$/i,'image/png':/\.png$/i,'image/webp':/\.webp$/i,'application/pdf':/\.pdf$/i};
  for(const file of incoming){
   if(files.length>=3){message('reportError','Chỉ được đính kèm tối đa 3 tệp.');break;}
   if(!types[file.type]?.test(file.name)){message('reportError','Chỉ nhận JPG, PNG, WebP hoặc PDF.');continue;}
   if(file.size>5*1024*1024||file.size===0){message('reportError','Mỗi tệp cần có nội dung và không vượt quá 5 MB.');continue;}
   files.push(file);
  }
  reportFiles();$('#reportFiles').value='';
 }
 function openReport(kind,id){
  if(!authenticated())return showAuth();if(reportBusy)return toast('Đang lưu báo cáo. Vui lòng chờ.');const r=room(kind,id);if(!r)return;
  reportTarget={kind,id:String(id),title:r.title,userId:currentUser.id};files=[];$('#reportForm').reset();$('#reportForm').classList.remove('hidden');$('#reportRoom').textContent=r.title;reportFiles();message('reportError','');message('reportSuccess','');dialog('reportDialog');
 }
 async function submitReport(event){
  event.preventDefault();if(reportBusy||!reportTarget)return;
  const reason=$('#reportReason').value.trim(),evidenceText=$('#reportEvidenceText').value.trim(),category=$('#reportCategory').value;
  if(!category||!reason)return message('reportError','Chọn loại vi phạm và nhập lý do chi tiết.');
  if(!evidenceText&&!files.length)return message('reportError','Bổ sung nội dung tin nhắn hoặc ít nhất một tệp bằng chứng.');
  reportBusy=true;$('#reportSubmit').disabled=true;const target={...reportTarget},requestVersion=version;
  try{
   if(currentUser?.id!==target.userId)throw Error('Tài khoản đã thay đổi. Hãy mở lại báo cáo.');
   await reportStore('put',{id:crypto.randomUUID(),userId:target.userId,kind:target.kind,roomId:target.id,roomTitle:target.title,category,reason,evidenceText,createdAt:new Date().toISOString(),files:files.map(f=>({name:f.name,type:f.type,size:f.size,blob:f}))});
   if(requestVersion!==version)return;message('reportSuccess','Đã lưu báo cáo demo, chưa gửi quản trị viên',true);$('#reportForm').reset();$('#reportForm').classList.add('hidden');files=[];reportFiles();reportTarget=null;message('reportError','');
  }catch(error){if(requestVersion===version)message('reportError',error.message||'Không đủ bộ nhớ để lưu báo cáo và bằng chứng.');}
  finally{reportBusy=false;$('#reportSubmit').disabled=false;}
 }
 async function renderReports(){
  const token=++version;revokeUrls();$('#reportHistoryList').replaceChildren();message('reportHistoryError','');
  try{
   const records=await reportStore('list');if(token!==version)return;
   $('#reportHistoryList').innerHTML=records.length?records.sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).map(r=>`<article class="report-record"><h3>${esc(r.roomTitle)}</h3><small>${new Date(r.createdAt).toLocaleString('vi-VN')} · ${r.kind==='shared'?'Bài ở ghép':'Phòng thuê'}</small><p><strong>${esc(r.category)}</strong></p><p>${esc(r.reason)}</p><p>${esc(r.evidenceText)}</p><p class="privacy-note">Đã lưu báo cáo demo, chưa gửi quản trị viên</p><ul class="evidence-list">${r.files.map((f,i)=>`<li><span>${esc(f.name)}<small>${(f.size/1024/1024).toFixed(2)} MB</small></span><button class="secondary" data-preview-report="${esc(r.id)}" data-file-index="${i}">Xem bằng chứng</button></li>`).join('')}</ul><button class="secondary report-trigger" data-delete-report="${esc(r.id)}">Xóa báo cáo</button></article>`).join(''):'<div class="empty">Bạn chưa lưu báo cáo nào trên trình duyệt này.</div>';
  }catch(error){if(token===version)message('reportHistoryError',error.message||'Không mở được bộ nhớ báo cáo.');}
 }
 async function previewReport(id,index){
  const token=version;try{
   const records=await reportStore('list'),file=records.find(r=>r.id===id)?.files[Number(index)];if(!file||token!==version)return;
   revokeUrls();$('#evidencePreviewBody').replaceChildren();$('#evidencePreviewTitle').textContent=file.name;const url=blobUrl(file.blob),download=document.createElement('a');download.href=url;download.download=file.name;download.textContent='Tải bằng chứng';download.className='secondary';
   if(file.type.startsWith('image/')){const img=document.createElement('img');img.src=url;img.alt=file.name;img.className='evidence-preview';$('#evidencePreviewBody').append(img);}
   else{const p=document.createElement('p');p.textContent='Biên lai PDF · '+(file.size/1024).toFixed(1)+' KB';const open=document.createElement('a');open.href=url;open.target='_blank';open.rel='noopener noreferrer';open.textContent='Mở PDF trong tab mới';open.className='secondary';$('#evidencePreviewBody').append(p,open,document.createElement('br'));}
   $('#evidencePreviewBody').append(download);dialog('evidenceDialog');
  }catch{message('reportHistoryError','Không mở được bằng chứng.');}
 }
 function showTrust(kind,id){const r=room(kind,id);if(!r)return;const n=score(kind,r);$('#trustDialogTitle').textContent='Độ tin cậy · '+r.title;$('#trustDialogBody').innerHTML=`${trust(kind,r)}<p>${n==null?'Tin này chưa được chấm điểm.':'Điểm '+n+'/100 là số mẫu cố định để minh họa giao diện, chưa có công thức chấm thực tế.'}</p><ul><li>Chủ trọ: danh tính và thông tin liên hệ.</li><li>Thông tin phòng: địa chỉ, giá, diện tích, hình ảnh.</li><li>Đánh giá người thuê: chất lượng phòng và trải nghiệm.</li></ul><p>Ba nhóm trên là tiêu chí tham chiếu; điểm mẫu không được tính từ số lớp Room Check và không chứng minh độ an toàn thực tế.</p><p>90–100: Rất tin cậy · 70–89: Tin cậy · 50–69: Cần cân nhắc · Dưới 50: Rủi ro cao.</p>`;dialog('trustDialog');}
 function reset(){version++;selection=[];selectionOwner=null;reportTarget=null;files=[];revokeUrls();for(const id of ['reportDialog','evidenceDialog','trustDialog','compareSwitchDialog','savedComparisonDialog']){if($('#'+id).open)close(id);}$('#reportForm').reset();for(const id of ['reportRoom','reportError','reportSuccess','reportFileList','reportHistoryList','reportHistoryError','evidencePreviewBody','evidencePreviewTitle','trustDialogBody','trustDialogTitle','savedComparisonList','comparisonContent','comparisonSelection','comparisonNames'])$('#'+id).replaceChildren();$('#comparisonBar').classList.add('hidden');document.body.classList.remove('has-comparison');}
 return {trust,score,compareButton,reportButton,toggleCompare,syncSelection,hydrate,reset,openComparison,renderComparison,returnToList,renderSaved,saveComparison,clearSelection,openReport,reportStore,renderReports,previewReport,addFiles,submitReport,showTrust,close,dialog,room,eligible,persistSelection,get selection(){return selection;},set selection(v){selection=v;},get returnState(){return returnState;},set returnState(v){returnState=v;},removeFile(i){files.splice(i,1);reportFiles();},revokeUrls};
})();
