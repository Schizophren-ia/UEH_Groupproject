/* Integrate tools with the existing static app without duplicating room or account state. */
document.querySelector('main').insertAdjacentHTML('beforeend',`
<section id="comparisonPage" class="content hidden"><button class="back" type="button" id="comparisonBack">← Quay lại danh sách</button><div class="section-head"><div><h2>So sánh phòng trọ</h2><p class="muted">Đặt thông tin cạnh nhau để chọn phòng phù hợp.</p></div><button class="secondary" id="comparisonEdit" type="button">Chỉnh lựa chọn</button></div><div id="comparisonSelection" class="comparison-selection"></div><div class="tool-actions"><button class="secondary" id="comparisonClear" type="button">Xóa tất cả</button><button class="primary" id="comparisonSave" type="button">Lưu bộ so sánh</button><button class="secondary" type="button" id="openSavedComparisons">Bộ so sánh đã lưu</button></div><div id="comparisonContent"></div></section>
<section id="reportHistoryPage" class="content hidden"><div class="section-head"><div><h2>Báo cáo của tôi</h2><p class="muted">Báo cáo và bằng chứng chỉ lưu trên trình duyệt này, chưa gửi quản trị viên.</p></div><button class="secondary" data-page="account">Về tài khoản</button></div><p id="reportHistoryError" class="tool-feedback" role="status"></p><div id="reportHistoryList"></div></section>`);
document.body.insertAdjacentHTML('beforeend',`
<aside id="comparisonBar" class="comparison-bar hidden" aria-label="Phòng đã chọn so sánh"><strong id="comparisonCount" aria-live="polite"></strong><span id="comparisonNames" class="selection-names"></span><button id="openComparison" class="primary" type="button">So sánh</button><button id="barClearComparison" class="secondary" type="button">Bỏ chọn</button></aside>
<dialog id="compareSwitchDialog" class="tool-dialog"><header><h2>Đổi loại phòng so sánh?</h2><button class="secondary" data-close-tool="compareSwitchDialog">Đóng ×</button></header><p>Phòng thuê tính giá cả phòng, còn ở ghép tính giá mỗi người. Đổi loại sẽ xóa lựa chọn hiện tại.</p><div class="tool-actions"><button class="secondary" data-close-tool="compareSwitchDialog">Giữ lựa chọn cũ</button><button class="primary" id="switchComparison">Xóa lựa chọn cũ và đổi loại</button></div></dialog>
<dialog id="savedComparisonDialog" class="tool-dialog wide"><header><h2>Bộ so sánh đã lưu</h2><button class="secondary" data-close-tool="savedComparisonDialog">Đóng ×</button></header><p class="privacy-note">Các bộ so sánh được lưu riêng theo tài khoản trên trình duyệt này.</p><div id="savedComparisonList"></div></dialog>
<dialog id="trustDialog" class="tool-dialog"><header><h2 id="trustDialogTitle">Điểm tin cậy</h2><button class="secondary" data-close-tool="trustDialog">Đóng ×</button></header><div id="trustDialogBody"></div></dialog>
<dialog id="reportDialog" class="tool-dialog"><header><h2>Báo cáo tin đăng</h2><button class="secondary" data-close-tool="reportDialog">Đóng ×</button></header><p id="reportRoom"></p><p class="privacy-note">Demo cục bộ: báo cáo chưa được gửi quản trị viên. Bằng chứng chỉ lưu trên trình duyệt này.</p><form id="reportForm"><label for="reportCategory">Loại vi phạm *</label><select id="reportCategory" required><option value="">Chọn loại vi phạm</option><option>Thông tin sai</option><option>Hình ảnh sai</option><option>Nghi lừa đảo / yêu cầu chuyển tiền</option><option>Giao tiếp không phù hợp</option><option>Khác</option></select><label for="reportReason">Lý do chi tiết *</label><textarea id="reportReason" required maxlength="2000" placeholder="Mô tả sự việc bạn muốn báo cáo"></textarea><label for="reportEvidenceText">Bằng chứng tin nhắn</label><textarea id="reportEvidenceText" maxlength="10000" placeholder="Dán nội dung tin nhắn liên quan"></textarea><label for="reportFiles">Ảnh hoặc biên lai chuyển khoản</label><input id="reportFiles" type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf"><p class="small-label">Cần nội dung tin nhắn hoặc tệp bằng chứng. Tối đa 3 tệp JPG, PNG, WebP hoặc PDF; mỗi tệp không quá 5 MB.</p><ul id="reportFileList" class="evidence-list"></ul><p id="reportError" class="tool-feedback" role="alert"></p><button class="primary" id="reportSubmit" type="submit">Lưu báo cáo demo</button></form><p id="reportSuccess" class="tool-feedback success" role="status"></p><button class="back" id="viewReportHistory" type="button">Xem báo cáo của tôi →</button></dialog>
<dialog id="evidenceDialog" class="tool-dialog"><header><h2 id="evidencePreviewTitle">Bằng chứng</h2><button class="secondary" data-close-tool="evidenceDialog">Đóng ×</button></header><div id="evidencePreviewBody"></div></dialog>`);

// Preserve existing IDs and handlers while presenting room details as three tabs.
(()=>{
 const detail=$('#detailPage'),grid=detail.querySelector('.detail-grid');
 detail.querySelector('.back').insertAdjacentHTML('afterend','<div class="tool-tabs" role="tablist" aria-label="Thông tin phòng"><button id="roomTabOverview" role="tab" aria-controls="roomPanelOverview" data-room-tab="overview" aria-selected="true">Tổng quan</button><button id="roomTabChecks" role="tab" aria-controls="roomPanelChecks" data-room-tab="checks" aria-selected="false" tabindex="-1">Xác thực & đánh giá</button><button id="roomTabOwner" role="tab" aria-controls="roomPanelOwner" data-room-tab="owner" aria-selected="false" tabindex="-1">Chủ trọ</button></div>');
 const names={overview:'Overview',checks:'Checks',owner:'Owner'};
 for(const [key,suffix] of Object.entries(names)){const panel=document.createElement('div');panel.id='roomPanel'+suffix;panel.className='tool-panel'+(key==='overview'?'':' hidden');panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby','roomTab'+suffix);detail.append(panel);}
 $('#roomPanelOverview').append(grid);$('#roomPanelChecks').append($('#verificationPage'),$('#reviewsPage'));$('#roomPanelOwner').append($('#contactPage'));
 // Kept as a compatibility render target; the visible profile is on the owner tab.
 $('#detailLandlord').classList.add('hidden');
 $('#verificationPage').classList.remove('hidden');$('#reviewsPage').classList.remove('hidden');$('#contactPage').classList.remove('hidden');
 $$('#roomPanelChecks .back[data-page="detail"],#roomPanelOwner .back[data-page="detail"]').forEach(b=>b.remove());
 const cost=$('#costDetails').parentElement,rows=[...cost.querySelectorAll('.cost-row')],extra=$('#costExtra');
 extra.prepend(...rows);
 // The existing toggle now reveals the whole cost breakdown.
 function tab(key){
  for(const [k,suffix] of Object.entries(names)){$('#roomPanel'+suffix).classList.toggle('hidden',k!==key);const button=$('#roomTab'+suffix);button.setAttribute('aria-selected',String(k===key));button.tabIndex=k===key?0:-1;}
  if(key==='overview')window.TimTroTour?.render();
 }
 window.selectRoomTab=tab;
 detail.addEventListener('keydown',event=>{
  const button=event.target.closest('[data-room-tab]');if(!button||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();const keys=Object.keys(names),index=keys.indexOf(button.dataset.roomTab),next=event.key==='Home'?0:event.key==='End'?2:(index+(event.key==='ArrowRight'?1:2))%3;tab(keys[next]);$('#roomTab'+names[keys[next]]).focus();
 });
})();

// Group long forms by task and open the first group only. Native validation opens invalid groups.
function groupToolFields(formId,groups){
 const form=$('#'+formId),container=form.querySelector('.host-form-grid')||form;
 for(const [i,[title,ids]] of groups.entries()){
  const nodes=[...new Set(ids.map(id=>$('#'+id)?.closest('div,label,fieldset')).filter(Boolean))];if(!nodes.length)continue;
  const group=document.createElement('details');group.className='tool-group';group.open=i===0;
  const summary=document.createElement('summary');summary.textContent=title;const body=document.createElement('div');body.className=formId==='hostListingForm'?'host-form-grid':'roommate-form';group.append(summary,body);const submit=container.querySelector('button[type=submit]');container.insertBefore(group,submit?.closest('.wide')||submit||null);nodes.forEach(node=>body.append(node));
 }
 form.addEventListener('invalid',event=>{let p=event.target.parentElement;while(p&&p!==form){if(p.tagName==='DETAILS')p.open=true;p=p.parentElement;}},true);
}
groupToolFields('slotListingForm',[
 ['1. Thông tin phòng & chỗ trống',['slotTitle','slotArea','slotCampus','slotCapacity','slotOccupied','slotPrice','slotAvailable','slotLandlordConsent']],
 ['2. Sinh hoạt & tiện nghi',['slotGender','slotSleep','slotCleaning','slotPets','slotOtherAmenities']],
 ['3. Chi phí & mô tả',['slotDeposit','slotElectricity','slotWater','slotCosts','slotGuests','slotShared','slotDescription']]
]);
const amenityField=$('#slotListingForm fieldset');if(amenityField)$('#slotListingForm .tool-group:nth-of-type(2)>div')?.append(amenityField);
groupToolFields('hostListingForm',[
 ['1. Thông tin phòng',['listingTitle','listingRent','listingAddress','listingArea','listingType','listingAvailability']],
 ['2. Chủ trọ & vị trí',['listingOwnerName','listingOwnerZalo','listingOwnerBio','listingLatitude','listingLongitude']],
 ['3. Chi phí, mô tả & hình ảnh',['listingDeposit','listingUtilities','listingDescription','listingPhotos']]
]);
const advanced=$('.roommate-advanced-grid');for(const id of ['rfCampus','rfAvailable','rfVacancies','rfGender'])advanced.append($('#'+id).parentElement);
$('.roommate-advanced-filters summary').textContent='Bộ lọc nâng cao · Cơ sở, ngày vào, sinh hoạt & tiện nghi';

// Hooks reuse authoritative data; scores never alter verification or discovery eligibility.
const toolBaseCard=roomCard;
roomCard=function(r){return toolBaseCard(r).replace('<div class="room-actions">',()=>RoomTools.trust('rental',r)+'<div class="room-actions">'+RoomTools.compareButton('rental',r.id));};
const toolBaseSlotCard=rmCard;
rmCard=function(r){return toolBaseSlotCard(r).replace('<div class="slot-actions">',()=>RoomTools.trust('shared',r)+'<div class="slot-tools">'+RoomTools.compareButton('shared',r.id)+'</div><div class="slot-actions">');};
const toolBaseSlotDetail=openSlotDetail;
openSlotDetail=function(id){toolBaseSlotDetail(id);const r=roommateSlots.find(s=>s.id===id);if(!r)return;$('#slotDialogBody').insertAdjacentHTML('beforeend',RoomTools.trust('shared',r)+'<div class="tool-actions">'+RoomTools.compareButton('shared',id)+RoomTools.reportButton('shared',id)+'</div>');};
const toolBaseRoomOwner=renderRoomOwner;
renderRoomOwner=function(){toolBaseRoomOwner();$('#detailRoomTools')?.remove();$('#detailPrice').insertAdjacentHTML('afterend','<div id="detailRoomTools">'+RoomTools.trust('rental',currentRoom)+'<div class="tool-actions">'+RoomTools.compareButton('rental',currentRoom.id)+RoomTools.reportButton('rental',currentRoom.id)+'</div></div>');};
const toolBaseRenderSlots=renderRoommateCards;
renderRoommateCards=function(){toolBaseRenderSlots();RoomTools.syncSelection();};
const toolBaseShowPage=showPage;
showPage=function(page){
 if(!authenticated())return showAuth();
 const previousPage=activeToolPage();if(page!==previousPage&&['home','search','favorites','roommates'].includes(previousPage))RoomTools.returnState={page:previousPage,y:scrollY};
 if(page!==activeToolPage())for(const node of $$('.dialog-backdrop:not(.hidden)'))rmClose(node.id);
 const linked={verification:'checks',reviews:'checks',contact:'owner'};
 if(linked[page]){toolBaseShowPage('detail');selectRoomTab(linked[page]);}
 else{toolBaseShowPage(page);if(page==='detail')selectRoomTab('overview');}
 if(page==='comparison')RoomTools.renderComparison();
 if(page==='reportHistory')RoomTools.renderReports();
 if(page!=='reportHistory'){$('#reportHistoryList').replaceChildren();RoomTools.revokeUrls();}
 RoomTools.syncSelection();
};
function activeToolPage(){return $$('main > section').find(s=>!s.classList.contains('hidden'))?.id.replace(/Page$/,'');}
const toolBaseClear=clearRoommateData;
clearRoommateData=function(){toolBaseClear();RoomTools.reset();};
const toolBaseAuthenticated=afterAuthentication;
afterAuthentication=function(){RoomTools.hydrate();toolBaseAuthenticated();};

$('#accountPage .section-head').insertAdjacentHTML('afterend','<div class="tool-actions"><button class="secondary" data-page="reportHistory">Báo cáo của tôi</button><button class="secondary" id="accountComparisons">Bộ so sánh đã lưu</button></div>');
$('#comparisonBack').addEventListener('click',RoomTools.returnToList);$('#comparisonEdit').addEventListener('click',RoomTools.returnToList);
$('#comparisonClear').addEventListener('click',RoomTools.clearSelection);$('#barClearComparison').addEventListener('click',RoomTools.clearSelection);$('#comparisonSave').addEventListener('click',RoomTools.saveComparison);$('#openComparison').addEventListener('click',RoomTools.openComparison);
for(const id of ['openSavedComparisons','accountComparisons'])$('#'+id).addEventListener('click',()=>{RoomTools.renderSaved();RoomTools.dialog('savedComparisonDialog');});
$('#switchComparison').addEventListener('click',event=>{const {kind,roomId}=event.currentTarget.dataset;RoomTools.clearSelection();RoomTools.close('compareSwitchDialog');RoomTools.toggleCompare(kind,roomId);});
$('#reportForm').addEventListener('submit',RoomTools.submitReport);$('#reportFiles').addEventListener('change',event=>RoomTools.addFiles([...event.target.files]));
$('#viewReportHistory').addEventListener('click',()=>{RoomTools.close('reportDialog');showPage('reportHistory');});
$('#evidenceDialog').addEventListener('close',()=>{$('#evidencePreviewBody').replaceChildren();RoomTools.revokeUrls();});
document.addEventListener('click',async event=>{
 const b=event.target.closest('button');if(!b)return;
 if(b.dataset.closeTool)return RoomTools.close(b.dataset.closeTool);
 if(b.dataset.roomTab)return selectRoomTab(b.dataset.roomTab);
 if(b.dataset.compareKind)return RoomTools.toggleCompare(b.dataset.compareKind,b.dataset.compareId);
 if(b.dataset.reportKind)return RoomTools.openReport(b.dataset.reportKind,b.dataset.reportId);
 if(b.dataset.trustKind)return RoomTools.showTrust(b.dataset.trustKind,b.dataset.trustId);
 if(b.hasAttribute('data-remove-evidence'))return RoomTools.removeFile(Number(b.dataset.removeEvidence));
 if(b.dataset.removeComparison){const s=RoomTools.selection.find(s=>s.id===b.dataset.removeComparison);if(s)RoomTools.toggleCompare(s.kind,s.id);return;}
 if(b.dataset.comparisonDetail){if(b.dataset.kind==='rental')openRoom(b.dataset.comparisonDetail);else{showPage('roommates');openSlotDetail(b.dataset.comparisonDetail);}return;}
 if(b.dataset.loadComparison){
  try{
   const userId=currentUser.id;
   const sets=JSON.parse(localStorage.getItem('timtro_compare_saved_v1_'+currentUser.id)||'[]'),set=sets.find(s=>s.id===b.dataset.loadComparison);if(!set)return;
   if(set.items[0]?.kind==='shared')await loadRoommateData();
   if(currentUser?.id!==userId)return;
   const available=set.items.filter(s=>RoomTools.eligible(s.kind,RoomTools.room(s.kind,s.id)));RoomTools.selection=available;RoomTools.persistSelection();RoomTools.syncSelection();RoomTools.close('savedComparisonDialog');
   if(available.length!==set.items.length)toast('Một số phòng đã không còn khả dụng và được bỏ khỏi bộ so sánh.');
   if(available.length>=2)RoomTools.openComparison();else toast('Bộ so sánh còn dưới 2 phòng. Hãy chọn thêm phòng.');
  }catch{toast('Không mở được bộ so sánh.');}return;
 }
 if(b.dataset.deleteComparison){try{const key='timtro_compare_saved_v1_'+currentUser.id,sets=JSON.parse(localStorage.getItem(key)||'[]');localStorage.setItem(key,JSON.stringify(sets.filter(s=>s.id!==b.dataset.deleteComparison)));RoomTools.renderSaved();}catch{toast('Không xóa được bộ so sánh.');}return;}
 if(b.dataset.previewReport)return RoomTools.previewReport(b.dataset.previewReport,b.dataset.fileIndex);
 if(b.dataset.deleteReport){if(!confirm('Xóa báo cáo và các bằng chứng đã lưu?'))return;try{await RoomTools.reportStore('delete',b.dataset.deleteReport);RoomTools.renderReports();}catch{messageReportDelete();}}
});
function messageReportDelete(){$('#reportHistoryError').textContent='Không xóa được báo cáo. Vui lòng thử lại.';}
// Avoid the legacy chat focus trap intercepting native dialogs opened over a slot detail.
document.addEventListener('keydown',event=>{const top=[...document.querySelectorAll('dialog.tool-dialog[open]')].at(-1);if(!top)return;if(event.key==='Escape'){event.preventDefault();RoomTools.close(top.id);}event.stopImmediatePropagation();},true);
if(authenticated())RoomTools.hydrate();
renderRoomOwner();renderCards('#featuredRooms',allFinderRooms().filter(r=>checkCount(r)>=1&&r.type==='single').slice(0,6));renderSearch();if(authenticated())renderRoommateCards();
