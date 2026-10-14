function safeZalo(value){try{const url=new URL(String(value||'').trim());return url.protocol==='https:'&&url.hostname==='zalo.me'&&!url.username&&!url.password?url.href:null;}catch{return null;}}
function roomOwner(room){return {name:room.ownerName||(!room.isHostListing?['Minh Anh','Hoàng Nam','Thu Hà','Gia Bảo'][Number(room.id)-1]+' · Hồ sơ mẫu':'Chủ trọ chưa cung cấp tên'),bio:room.ownerBio||(!room.isHostListing?'Hồ sơ chủ trọ minh họa của dự án sinh viên UEH. Liên hệ thật chưa được cung cấp.':'Chủ trọ chưa thêm giới thiệu.'),zalo:safeZalo(room.ownerZalo)};}
function ownerCard(room){
 const owner=roomOwner(room),phone=String(room.ownerPhone||'').trim(),safePhone=/^\+?[0-9 ()-]{8,20}$/.test(phone)?phone:null;
 const checks=[['CCCD',room.ownerIdentityVerified===true],['Địa chỉ',room.ownerAddressVerified===true],['Hình ảnh/video',room.ownerMediaVerified===true]];
 const verified=checks.every(([,ok])=>ok),label=verified?'Đã xác thực':'Chưa xác minh';
 return `<div class="owner-summary"><div><div class="landlord-person"><span class="landlord-avatar" aria-label="Avatar chủ trọ">${hostEscape(owner.name[0])}</span><div><h2>${hostEscape(owner.name)}</h2><p>Chủ trọ</p><span class="verified-pill">${label}</span></div></div><p>${hostEscape(owner.bio)}</p><p>Điện thoại: ${safePhone?hostEscape(safePhone):'Chưa cung cấp'}</p><p>Địa chỉ phòng: ${hostEscape(room.address||'Chưa cung cấp')}</p></div><div class="owner-verification"><h3>Thông tin xác thực</h3><p class="small-label">Lần xác minh cuối: ${hostEscape(room.ownerVerifiedAt||'Chưa có dữ liệu')}</p>${checks.map(([name,ok])=>`<p>${ok?'✓':'○'} ${name}: ${ok?'Đã xác minh':'Chưa xác minh'}</p>`).join('')}<button class="back" data-page="verification">Xem thông tin chi tiết</button></div></div><div class="owner-contact-actions">${safePhone?`<a class="primary" href="tel:${hostEscape(safePhone.replace(/[ ()-]/g,''))}">Gọi điện</a>`:'<button class="primary" disabled>Chưa có số điện thoại</button>'}${owner.zalo?`<a class="secondary" data-landlord-zalo href="${hostEscape(owner.zalo)}" target="_blank" rel="noopener noreferrer">Nhắn tin qua Zalo ↗</a>`:'<button class="secondary" disabled>Chưa có liên kết Zalo</button>'}</div><button type="button" class="secondary" data-owner-map="${hostEscape(room.id)}">Xem vị trí phòng</button>`;
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
 const room=allFinderRooms().find(r=>String(r.id)===String(id));if(!room||!authenticated())return;
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


function roomVerification(room){return room.room_check_verified===true;}
const baseRenderOwner=renderRoomOwner;
renderRoomOwner=function(){
 baseRenderOwner();
 const verified=roomVerification(currentRoom);
 const box=$('#detailPage .verify-box');
 box.innerHTML='<h3>Room Check · '+(verified?'Đã xác minh':'Chưa xác minh')+'</h3><p>'+(verified?'Phòng có dữ liệu Room Check. Xem từng lớp xác thực để đối chiếu.':'Chưa có bằng chứng xác minh thực tế. Bạn vẫn có thể xem quy trình kiểm tra phòng.')+'</p>';
 const message=$('#ownerMessage');
 if(message){message.value='Xin chào, mình quan tâm đến phòng trọ này. Phòng còn trống không ạ?';$('#ownerMessageCount').textContent=message.value.length+'/200';}
};
$('#ownerMessage').addEventListener('input',()=>$('#ownerMessageCount').textContent=$('#ownerMessage').value.length+'/200');
$('#ownerMessageForm').addEventListener('submit',event=>{
 event.preventDefault();const body=$('#ownerMessage').value.trim();if(!body)return;
 const key='timtro_owner_messages_'+currentUser.id;
 try{const items=JSON.parse(localStorage.getItem(key)||'[]');items.push({roomId:currentRoom.id,body,createdAt:new Date().toISOString()});localStorage.setItem(key,JSON.stringify(items));$('#ownerMessageStatus').textContent='Đã lưu lời nhắn trên trình duyệt này. Chưa gửi đến chủ trọ; dùng Gọi điện hoặc Zalo để liên hệ trực tiếp.';}catch{$('#ownerMessageStatus').textContent='Không lưu được lời nhắn. Vui lòng thử lại.';}
});
