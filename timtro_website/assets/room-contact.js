function safeZalo(value){try{const url=new URL(String(value||'').trim());return url.protocol==='https:'&&url.hostname==='zalo.me'&&!url.username&&!url.password?url.href:null;}catch{return null;}}
function roomOwner(room){return {name:room.ownerName||(!room.isHostListing?['Minh Anh','Hoàng Nam','Thu Hà','Gia Bảo'][Number(room.id)-1]+' · Hồ sơ mẫu':'Chủ trọ chưa cung cấp tên'),bio:room.ownerBio||(!room.isHostListing?'Hồ sơ chủ trọ minh họa của dự án sinh viên UEH. Liên hệ thật chưa được cung cấp.':'Chủ trọ chưa thêm giới thiệu.'),zalo:safeZalo(room.ownerZalo)};}
function ownerCard(room){const owner=roomOwner(room);return `<div class="landlord-person"><span class="landlord-avatar" aria-label="Avatar chủ trọ">${hostEscape(owner.name[0])}</span><div><strong>${hostEscape(owner.name)}</strong><div class="small-label">Chủ trọ · ${room.isHostListing?'Thông tin do người đăng cung cấp':'Minh họa'}</div></div></div><p>${hostEscape(owner.bio)}</p>${owner.zalo?`<a class="primary" data-landlord-zalo href="${hostEscape(owner.zalo)}" target="_blank" rel="noopener noreferrer">Liên hệ qua Zalo ↗</a>`:'<p class="small-label">Chủ trọ chưa cung cấp liên kết Zalo.</p>'}<button type="button" class="secondary" data-owner-map="${hostEscape(room.id)}">Xem vị trí phòng</button>`;}
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
