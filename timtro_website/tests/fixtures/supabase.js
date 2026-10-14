/* Browser-only test fixture. These access filters are not evidence that SQL RLS is deployed. */
(() => {
 const ids={me:'10000000-0000-4000-8000-000000000001',mai:'10000000-0000-4000-8000-000000000002',an:'10000000-0000-4000-8000-000000000003'};
 const people=[
  {user_id:ids.me,display_name:'Sinh viên thử',campus:'UEH - Campus B',study_level:'Năm 1',needs:{sleep:'early'},show_study:true,show_needs:true,show_optional:false},
  {user_id:ids.mai,display_name:'Mai Anh',campus:'UEH - Campus B',study_level:'Năm 2',avatar_url:'/timtro_website/assets/ueh-logo.png',needs:{sleep:'early'},show_study:true},
  {user_id:ids.an,display_name:'Hoài An',campus:'UEH - Campus A',study_level:'Năm 3',needs:{sleep:'late'},show_study:true}
 ];
 const base={area:'Quận 10',near_campus:'Campus B',occupied:1,price_per_person:2000000,available_from:'2026-10-15',gender_preference:'Any',deposit:500000,amenities:['ac','parking'],needs:{sleep:'early',cleaning:'daily',pets:'no',smoking:'no'},landlord_consent:true,status:'open',created_at:'2026-10-14T00:00:00Z'};
 const db={student_profiles:people,student_private_profiles:[{user_id:ids.me,phone:'090-private',zalo:'private-zalo'}],student_roommate_listings:[
  {...base,id:'slot-2',owner_id:ids.mai,title:'Phòng 2 người còn một chỗ',capacity:2},
  {...base,id:'slot-3',owner_id:ids.an,title:'Phòng 3 người còn hai chỗ',capacity:3,area:'Quận 3',near_campus:'Campus A',price_per_person:1500000,needs:{sleep:'late',cleaning:'weekly',pets:'yes'},amenities:['washer']},
  {...base,id:'slot-4',owner_id:ids.mai,title:'Phòng 4 người còn ba chỗ',capacity:4,price_per_person:2500000}
 ],student_roommate_threads:[],student_roommate_messages:[]};
 let active=null,sequence=0,callback,delay;
 const user=id=>({id,email:id===ids.me?'test.123456789@st.ueh.edu.vn':'mai.987654321@st.ueh.edu.vn',email_confirmed_at:'2026-10-14T00:00:00Z',user_metadata:{username:people.find(p=>p.user_id===id)?.display_name||'Sinh viên'}});
 const copy=v=>v==null?v:JSON.parse(JSON.stringify(v));
 const publicProfile=p=>({user_id:p.user_id,display_name:p.display_name,avatar_url:p.avatar_url,bio:p.hide_profile?null:p.bio,campus:p.hide_profile||!p.show_study?null:p.campus,study_level:p.hide_profile||!p.show_study?null:p.study_level,needs:p.hide_profile||!p.show_needs?null:p.needs,...Object.fromEntries(['age','major','hometown','hobbies','cooking'].map(k=>[k,p.hide_profile||!p.show_optional?null:p[k]]))});
 function query(name){
  let action='read',payload,one=false;const filters=[];
  const builder={
   select(){return builder;},order(){return builder;},eq(k,v){filters.push(row=>row[k]===v);return builder;},in(k,v){filters.push(row=>v.includes(row[k]));return builder;},
   maybeSingle(){one=true;return builder;},single(){one=true;return builder;},
   insert(v){action='insert';payload=copy(v);return builder;},update(v){action='update';payload=copy(v);return builder;},upsert(v){action='upsert';payload=copy(v);return builder;},
   then(resolve,reject){return execute().then(resolve,reject);}
  };
  async function execute(){
   if(!active)return {data:null,error:{message:'Authentication required'}};
   let rows;
   if(name==='student_roommate_listing_cards')rows=db.student_roommate_listings.filter(row=>row.status==='open'||row.owner_id===active.id).map(row=>({...row,room_check_verified:false}));
   else if(name==='student_public_profiles')rows=db.student_profiles.map(publicProfile);
   else rows=db[name]||[];
   if(action==='read'){
    if(name==='student_profiles'||name==='student_private_profiles')rows=rows.filter(row=>row.user_id===active.id);
    if(name==='student_roommate_threads')rows=rows.filter(row=>[row.owner_id,row.interested_user_id].includes(active.id));
    if(name==='student_roommate_messages')rows=rows.filter(row=>db.student_roommate_threads.some(t=>t.id===row.thread_id&&[t.owner_id,t.interested_user_id].includes(active.id)));
    rows=copy(rows.filter(row=>filters.every(f=>f(row))));
    if(name==='student_roommate_messages'&&delay?.threadId===rows[0]?.thread_id){const pending=delay;delay=null;await pending.promise;}
   }else if(action==='insert'){
    const row={id:name+'-'+(++sequence),created_at:new Date().toISOString(),...payload};rows.push(row);rows=[row];
   }else if(action==='upsert'){
    const existing=rows.find(row=>row.user_id===payload.user_id);if(existing)Object.assign(existing,payload);else rows.push(payload);rows=[payload];
   }else {rows=rows.filter(row=>filters.every(f=>f(row)));for(const row of rows)Object.assign(row,payload);}
   return {data:one?(rows[0]||null):copy(rows),error:null};
  }
  return builder;
 }
 const fixture=window.__fixture={ids,db,signupCalls:[],signinCalls:[],uploads:[],switchUser(id){active=id?user(id):null;callback?.(id?'SIGNED_IN':'SIGNED_OUT',active?{user:active}:null);},delayMessages(threadId){let release;const promise=new Promise(r=>release=r);delay={threadId,promise};return release;}};
 window.supabase={createClient(){return {
  auth:{getSession:async()=>({data:{session:active?{user:active}:null},error:null}),onAuthStateChange(fn){callback=fn;return {data:{subscription:{unsubscribe(){}}}};},
   async signUp(input){fixture.signupCalls.push({email:input.email});return {data:{user:user(ids.me),session:null},error:null};},
   async signInWithPassword(input){fixture.signinCalls.push({email:input.email});if(input.password!=='password123')return {data:null,error:{message:'Invalid login credentials'}};fixture.switchUser(ids.me);return {data:{user:active},error:null};},
   async signOut(){fixture.switchUser(null);return {error:null};}
  },from:query,storage:{from(){return {async upload(name,file){fixture.uploads.push({name,type:file.type,size:file.size});return {error:null};},getPublicUrl(){return {data:{publicUrl:'/timtro_website/assets/ueh-logo.png'}};}};}}
 };}};
})();
