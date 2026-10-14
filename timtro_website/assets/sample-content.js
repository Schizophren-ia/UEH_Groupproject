/* Explicitly illustrative records; never evidence of a real property verification. */
const sampleStudents=['Minh Anh','Hoàng Nam','Thu Hà','Gia Bảo','Khánh Linh','Đức Minh'].map((name,i)=>({
 user_id:'sample-student-'+(i+1),display_name:name+' · Bài mẫu',campus:i===4?'UEH - Campus A':'UEH - Campus B',study_level:'Năm '+(i%3+1),bio:'Hồ sơ minh họa của sinh viên đang tìm bạn ở chung. Không phải người đăng thật.',show_study:true,show_needs:true,needs:{sleep:i%2?'late':'early',cleaning:'weekly',pets:'no'},is_sample:true
}));
const sampleRoommateListings=sampleStudents.map((p,i)=>({
 id:'sample-slot-'+(i+1),owner_id:p.user_id,title:['Phòng gần Campus B cần thêm 1 bạn nữ','Tìm 2 bạn nam ở chung phòng 4 người','Phòng có ban công cần 1 bạn ở cùng','Cần thêm bạn chia sẻ phòng gần UEH','Phòng Quận 3 tìm bạn nữ ở ghép','Phòng 4 người còn 3 chỗ trống'][i],
 area:i===4?'Quận 3':'Quận 10',near_campus:i===4?'Campus A':'Campus B',capacity:[2,4,3,3,2,4][i],occupied:[1,2,2,1,1,1][i],price_per_person:[1800000,1500000,2200000,2000000,2600000,1700000][i],
 available_from:'2026-10-'+(15+i),gender_preference:i%2?'Male':'Female',deposit:2000000,electricity:'Theo công tơ, chia theo người',water:'80.000đ/người',shared_costs:'Wifi chia đều',guests:'Báo trước với bạn cùng phòng',shared_items:'Bếp, máy giặt',
 amenities:['kitchen','washer','parking',...(i%2?[]:['ac'])],needs:p.needs,description:'Bài đăng mẫu: phòng đang có người ở, có chỗ trống và chủ trọ đồng ý tìm người ở cùng. Dùng để trải nghiệm bộ lọc và giao diện.',landlord_consent:true,status:'open',created_at:'2026-10-14T00:00:00Z',is_sample:true,photo_index:i%4,
 verification:{tenant:i!==5,location:i<4,media:i<2},room_check_verified:i<2
}));
function checkLayers(room){
 const v=room.verification||{};
 return [v.tenant===true,v.location===true,v.media===true];
}
function checkCount(room){return checkLayers(room).filter(Boolean).length;}
function checkLabel(room){const count=checkCount(room);return count?'Room Check · Đã xác thực '+count+'/3 lớp':'Room Check · Chưa xác thực';}
function checkBadge(room){return '<span class="verified-pill check-level-'+checkCount(room)+'">'+checkLabel(room)+'</span>'+(room.is_sample?'<span class="sample-label">Xác thực mô phỏng · Dữ liệu mẫu</span>':'');}
function checkMatches(room,level){const count=checkCount(room);return level==='all'||(level==='0'?count===0:count===Number(level));}
function sampleOwnerAvatar(name,index){
 const colors=['#9381ff','#557392','#8272ba','#447f94'];
 const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><rect width="160" height="160" rx="80" fill="'+colors[index%4]+'"/><circle cx="80" cy="58" r="27" fill="#fff" opacity=".92"/><path d="M28 144c0-38 23-56 52-56s52 18 52 56" fill="#fff" opacity=".92"/></svg>';
 return 'data:image/svg+xml,'+encodeURIComponent(svg);
}
const sampleOwners=['Nguyễn Thị Hằng','Trần Hoàng Nam','Lê Thu Hà','Nguyễn Gia Bảo','Phạm Khánh Linh','Vũ Đức Minh'];
function decorateSampleRooms(list){
 list.push({...list[0],id:5,title:'Phòng gần UEH — xác thực 1/3 lớp',rent:2300000,area:22,photo:list[2].photo},{...list[0],id:6,title:'Phòng chờ xác thực — chưa công khai',rent:2100000,area:18,photo:list[3].photo});
 list.forEach((room,i)=>{
  Object.assign(room,{is_sample:true,verification:{tenant:i!==3&&i!==5,location:i<3,media:i<2},ownerName:sampleOwners[i],ownerBio:'Hồ sơ chủ trọ mẫu cho phòng '+room.title+'. Thông tin liên hệ và xác thực chỉ phục vụ minh họa.',ownerAvatar:sampleOwnerAvatar(sampleOwners[i],i),ownerPhoneDisplay:'090 ••• '+String(4500+i),ownerVerifiedAt:i!==3&&i!==5?'06/10/2026 · Mô phỏng':null});
  room.room_check_verified=checkCount(room)===3;
 });
}
