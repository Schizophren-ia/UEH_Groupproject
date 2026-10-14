/* Browser-local prototype store. This is not a replacement for deployed Supabase RLS. */
function createDemoDataClient(){
 const key='timtro_demo_roommates_v1';
 const empty=()=>({student_profiles:[],student_private_profiles:[],student_roommate_listings:[],student_roommate_threads:[],student_roommate_messages:[]});
 const copy=v=>v==null?v:JSON.parse(JSON.stringify(v));
 const publicProfile=p=>({user_id:p.user_id,display_name:p.display_name,avatar_url:p.avatar_url,bio:p.hide_profile?null:p.bio,...Object.fromEntries(['campus','study_level'].map(k=>[k,p.hide_profile||p.show_study===false?null:p[k]])),needs:p.hide_profile||p.show_needs===false?null:p.needs,...Object.fromEntries(['age','major','hometown','hobbies','cooking'].map(k=>[k,p.hide_profile||!p.show_optional?null:p[k]]))});
 function query(name){
  let action='read',payload,one=false,sort;const filters=[];
  const q={select(){return q;},order(k,o){sort={k,ascending:o?.ascending!==false};return q;},eq(k,v){filters.push(r=>r[k]===v);return q;},in(k,v){filters.push(r=>v.includes(r[k]));return q;},maybeSingle(){one=true;return q;},single(){one=true;return q;},insert(v){action='insert';payload=copy(v);return q;},update(v){action='update';payload=copy(v);return q;},upsert(v){action='upsert';payload=copy(v);return q;},then(resolve,reject){return execute().then(resolve,reject);}};
  async function execute(){
   try{
    if(!currentUser?.is_demo)throw Error('Hãy đăng nhập tài khoản demo.');
    const user=currentUser.id,db=JSON.parse(localStorage.getItem(key)||'null')||empty();
    const member=t=>[t.owner_id,t.interested_user_id].includes(user);
    let rows;
    if(name==='student_roommate_listing_cards')rows=[...db.student_roommate_listings.filter(r=>r.status==='open'||r.owner_id===user).map(r=>({...r,room_check_verified:false})),...sampleRoommateListings];
    else if(name==='student_public_profiles')rows=[...db.student_profiles.map(publicProfile),...sampleStudents];
    else if(name in db)rows=db[name];else throw Error('Kho dữ liệu demo không hỗ trợ mục này.');
    const accessible=r=>name==='student_profiles'||name==='student_private_profiles'?r.user_id===user:name==='student_roommate_threads'?member(r):name==='student_roommate_messages'?db.student_roommate_threads.some(t=>t.id===r.thread_id&&member(t)):true;
    if(action==='read')rows=rows.filter(r=>accessible(r)&&filters.every(f=>f(r)));
    else{
     if(name.endsWith('_cards')||name==='student_public_profiles')throw Error('Mục này chỉ đọc.');
     if(name==='student_profiles'||name==='student_private_profiles'){
      if(payload.user_id!==user)throw Error('Bạn chỉ có thể sửa hồ sơ của mình.');
     }else if(name==='student_roommate_listings'){
      if(payload.owner_id&&payload.owner_id!==user)throw Error('Bạn chỉ có thể sửa bài đăng của mình.');
     }else if(name==='student_roommate_threads'){
      const listing=[...db.student_roommate_listings,...sampleRoommateListings].find(r=>r.id===payload.listing_id&&r.status==='open');
      if(action!=='insert'||!listing||payload.owner_id!==listing.owner_id||payload.interested_user_id!==user||payload.owner_id===user)throw Error('Không thể tạo cuộc trò chuyện này.');
      const existing=rows.find(t=>t.listing_id===payload.listing_id&&t.interested_user_id===user);if(existing)return {data:copy(existing),error:null};
     }else if(name==='student_roommate_messages'){
      if(action!=='insert'||payload.sender_id!==user||!db.student_roommate_threads.some(t=>t.id===payload.thread_id&&member(t)))throw Error('Bạn không tham gia cuộc trò chuyện này.');
     }
     if(action==='insert'){const row={id:crypto.randomUUID(),created_at:new Date().toISOString(),...payload};rows.push(row);rows=[row];}
     else if(action==='upsert'){const existing=rows.find(r=>r.user_id===user);if(existing)Object.assign(existing,payload);else rows.push(payload);rows=[existing||payload];}
     else{rows=rows.filter(r=>accessible(r)&&filters.every(f=>f(r))&&(name!=='student_roommate_listings'||r.owner_id===user));for(const row of rows)Object.assign(row,payload);}
     localStorage.setItem(key,JSON.stringify(db));
    }
    if(sort)rows.sort((a,b)=>String(a[sort.k]).localeCompare(String(b[sort.k]))*(sort.ascending?1:-1));
    return {data:copy(one?(rows[0]||null):rows),error:null};
   }catch(error){return {data:null,error};}
  }
  return q;
 }
 let uploaded;
 return {from:query,storage:{from(){return {async upload(path,file){uploaded=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});return {error:null};},getPublicUrl(){return {data:{publicUrl:uploaded}};}};}}};
}
