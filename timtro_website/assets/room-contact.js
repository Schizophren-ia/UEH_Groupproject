function safeZalo(value){try{const url=new URL(String(value||'').trim());return url.protocol==='https:'&&url.hostname==='zalo.me'&&!url.username&&!url.password?url.href:null;}catch{return null;}}
function roomOwner(room){return {name:room.ownerName||(!room.isHostListing?['Minh Anh','Hoàng Nam','Thu Hà','Gia Bảo'][Number(room.id)-1]+' · Hồ sơ mẫu':'Chủ trọ chưa cung cấp tên'),bio:room.ownerBio||(!room.isHostListing?'Hồ sơ chủ trọ minh họa của dự án sinh viên UEH. Liên hệ thật chưa được cung cấp.':'Chủ trọ chưa thêm giới thiệu.'),zalo:safeZalo(room.is_sample?null:room.ownerZalo)};}
function ownerCard(room){
 const owner=roomOwner(room),phone=String(room.ownerPhone||'').trim(),safePhone=!room.is_sample&&/^\+?[0-9 ()-]{8,20}$/.test(phone)?phone:null;
 const checks=[['CCCD',room.is_sample?checkCount(room)>0:room.ownerIdentityVerified===true],['Địa chỉ',room.is_sample?checkLayers(room)[1]:room.ownerAddressVerified===true],['Hình ảnh/video',room.is_sample?checkLayers(room)[2]:room.ownerMediaVerified===true]];
 const verified=checks.every(([,ok])=>ok),label=room.is_sample?checkLabel(room)+' · Mô phỏng':verified?'Đã xác thực':'Chưa xác minh';
 return `<div class="owner-summary"><div><div class="landlord-person">${room.ownerAvatar?`<img class="landlord-photo" src="${hostEscape(room.ownerAvatar)}" alt="Avatar minh họa ${hostEscape(owner.name)}">`:`<span class="landlord-avatar" aria-label="Avatar chủ trọ">${hostEscape(owner.name[0])}</span>`}<div><h2>${hostEscape(owner.name)}</h2><p>Chủ trọ</p><span class="verified-pill">${label}</span></div></div><p>${hostEscape(owner.bio)}</p><p>Điện thoại: ${room.is_sample?hostEscape(room.ownerPhoneDisplay)+' · Số minh họa':safePhone?hostEscape(safePhone):'Chưa cung cấp'}</p><p>Địa chỉ phòng: ${hostEscape(room.address||'Chưa cung cấp')}</p></div><div class="owner-verification"><h3>Thông tin xác thực</h3><p class="small-label">Lần xác minh cuối: ${hostEscape(room.ownerVerifiedAt||'Chưa có dữ liệu')}</p>${checks.map(([name,ok])=>`<p>${ok?'✓':'○'} ${name}: ${ok?'Đã xác minh':'Chưa xác minh'}</p>`).join('')}<button class="back" data-page="verification">Xem thông tin chi tiết</button></div></div><div class="owner-contact-actions">${safePhone?`<a class="primary" href="tel:${hostEscape(safePhone.replace(/[ ()-]/g,''))}">Gọi điện</a>`:'<button class="primary" disabled>Chưa có số điện thoại</button>'}${owner.zalo?`<a class="secondary" data-landlord-zalo href="${hostEscape(owner.zalo)}" target="_blank" rel="noopener noreferrer">Nhắn tin qua Zalo ↗</a>`:'<button class="secondary" disabled>Chưa có liên kết Zalo</button>'}</div><button type="button" class="secondary" data-owner-map="${hostEscape(room.id)}">Xem vị trí phòng</button>`;
}
function renderRoomOwner(){for(const id of ['detailLandlord','contactLandlord'])$('#'+id).innerHTML=ownerCard(currentRoom);$('#contactRoomTitle').textContent=currentRoom.title;$('.amenities .verified-pill').textContent=currentRoom.isHostListing?'Tin do chủ trọ cung cấp · Chưa xác minh':'Phòng mẫu · Chưa xác minh';}
const originalOpenRoom=openRoom;
openRoom=function(id){$('#hostRoomDescription')?.remove();originalOpenRoom(id);renderRoomOwner();};
function roomLocation(room){
 if(room.latitude!==''&&room.latitude!=null&&room.longitude!==''&&room.longitude!=null&&Number.isFinite(Number(room.latitude))&&Number.isFinite(Number(room.longitude))&&Math.abs(Number(room.latitude))<=90&&Math.abs(Number(room.longitude))<=180)return {lat:Number(room.latitude),lon:Number(room.longitude),demo:!!room.isDemo};
 if(!room.isHostListing){const points=[[10.7734,106.6674],[10.7704,106.6682],[10.7761,106.6655],[10.7689,106.6699]];const p=points[Number(room.id)-1];if(p)return {lat:p[0],lon:p[1],demo:true};}
 return null;
}
function openRoomMap(id=currentRoom.id){
 const room=allFinderRooms().find(r=>String(r.id)===String(id));if(!room||(!authenticated()&&!(typeof RoomShare!=='undefined'&&RoomShare.canView(id))))return;
 const point=roomLocation(room),dialog=$('#roomMapDialog'),frame=$('#roomMapFrame');
 $('#roomMapTitle').textContent=room.title;$('#roomMapAddress').textContent=room.address;frame.removeAttribute('src');frame.classList.toggle('hidden',!point);$('#mapDirections').classList.toggle('hidden',!point);$('#mapExternal').classList.toggle('hidden',!point);
 $('#roomMapNote').textContent=!point?'Chưa có tọa độ của phòng này. Chủ trọ cần cung cấp vị trí để hiển thị bản đồ.':point.demo?'Vị trí minh họa cho phòng mẫu. Ghim bản đồ không xác minh phòng có thật.':'Vị trí do chủ trọ cung cấp, chưa được xác minh thực tế. Hãy đối chiếu địa chỉ và xem phòng trước khi đặt cọc.';
 if(point){const {lat,lon}=point;frame.src='https://www.openstreetmap.org/export/embed.html?'+new URLSearchParams({bbox:[lon-.012,lat-.008,lon+.012,lat+.008].join(','),layer:'mapnik',marker:[lat,lon].join(',')});$('#mapExternal').href=`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`;$('#mapDirections').href='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(lat+','+lon);}
 if(!dialog.open)dialog.showModal();
}
$('#closeRoomMap').addEventListener('click',()=>{$('#roomMapDialog').close();$('#roomMapFrame').removeAttribute('src');});
$('#roomMapDialog').addEventListener('close',()=>$('#roomMapFrame').removeAttribute('src'));
document.addEventListener('click',event=>{const button=event.target.closest('[data-owner-map]');if(button)openRoomMap(button.dataset.ownerMap);});
renderRoomOwner();


function renderRoomCheck(){
 const room=currentRoom,layers=checkLayers(room),count=checkCount(room);
 const label=checkLabel(room),note=room.is_sample?'Xác thực mô phỏng trên phòng mẫu. Không phải bằng chứng kiểm chứng phòng ngoài thực tế.':'Chỉ các lớp có bằng chứng xác minh mới được ghi nhận.';
 $('#detailPage .verify-box').innerHTML='<h3>'+label+'</h3><p>'+note+'</p>';
 $('.amenities .verified-pill').textContent=label;
 const banner=$('#verificationPage .verify-banner');banner.classList.toggle('check-complete',count===3);banner.innerHTML='<div class="shield">✓</div><div><h2>'+ (count===3?'PHÒNG HOÀN TẤT 3/3 LỚP XÁC THỰC':count?'PHÒNG ĐÃ XÁC THỰC '+count+'/3 LỚP':'PHÒNG CHƯA XÁC THỰC')+'</h2><p>'+note+'</p></div>';
 const titles=['Lớp 1 — Xác thực từ người thuê','Lớp 2 — Xác thực địa điểm & thông tin phòng','Lớp 3 — Xác thực hình ảnh 360° / video'];
 const descriptions=[
 'Trải nghiệm và đánh giá từ người từng ở hoặc đến xem phòng.',
 'Địa chỉ: <span id="verifyAddress">'+hostEscape(room.address)+'</span><br>Thông tin: '+room.area+'m² · '+hostEscape(room.floor||'Chưa có thông tin tầng'),
 'Hình ảnh / panorama 360° của đúng phòng đang xem.'
 ];
 const actions=['<button class="secondary" data-page="reviews">Xem thông tin người thuê</button>','<button class="secondary" data-owner-map="'+hostEscape(room.id)+'">Xem bản đồ & thông tin</button>','<button class="secondary" data-page="detail">Xem hình ảnh / video</button>'];
 $('#verificationPage .verify-list').innerHTML=titles.map((title,i)=>'<article class="verify-step"><div class="step-icon">'+(layers[i]?'✓':'○')+'</div><div><h3>'+title+'</h3><p class="layer-status">'+(layers[i]?'Đã hoàn tất':'Chưa hoàn tất')+(room.is_sample?' · Mô phỏng':'')+'</p><p>'+descriptions[i]+'</p></div>'+actions[i]+'</article>').join('')+'<div class="verify-box"><h3>'+label+'</h3><p>'+note+'</p></div><button class="primary" data-page="detail">Quay lại phòng</button>';
}
const baseRenderOwner=renderRoomOwner;
renderRoomOwner=function(){
 baseRenderOwner();renderRoomCheck();
 const message=$('#ownerMessage');if(message){message.value='Xin chào, mình quan tâm đến phòng trọ này. Phòng còn trống không ạ?';$('#ownerMessageCount').textContent=message.value.length+'/200';$('#ownerMessageStatus').textContent='';}
};
renderRoomOwner();
$('#ownerMessage').addEventListener('input',()=>$('#ownerMessageCount').textContent=$('#ownerMessage').value.length+'/200');
$('#ownerMessageForm').addEventListener('submit',event=>{
 event.preventDefault();const body=$('#ownerMessage').value.trim();if(!body)return;
 const key='timtro_owner_messages_'+currentUser.id;
 try{const items=JSON.parse(localStorage.getItem(key)||'[]');items.push({roomId:currentRoom.id,body,createdAt:new Date().toISOString()});localStorage.setItem(key,JSON.stringify(items));$('#ownerMessageStatus').textContent='Đã lưu lời nhắn trên trình duyệt này. Chưa gửi đến chủ trọ; dùng Gọi điện hoặc Zalo để liên hệ trực tiếp.';}catch{$('#ownerMessageStatus').textContent='Không lưu được lời nhắn. Vui lòng thử lại.';}
});
