/* Local prototype only: no email delivery, server CAPTCHA or shared authentication. */
(() => {
 if (AUTH_LIVE) return;
 const ACCOUNTS='timtro_demo_accounts_v1',SESSION='timtro_demo_session_v1';
 let pending=null,busy=false,challenge;
 const accounts=()=>JSON.parse(localStorage.getItem(ACCOUNTS)||'[]');
 const hex=bytes=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
 const random=()=>crypto.getRandomValues(new Uint32Array(1))[0];
 async function hash(password,salt){
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
  return hex(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:120000,hash:'SHA-256'},key,256)));
 }
 function newChallenge(){const a=1+random()%9,b=1+random()%9;challenge=a+b;$('#botQuestion').textContent=`Kiểm tra demo: ${a} + ${b} = ?`;$('#botAnswer').value='';$('#notRobot').checked=false;}
 function resetPending(){pending=null;$('#otpForm').classList.add('hidden');$('#demoMailbox').classList.add('hidden');$('#demoOtpCode').textContent='';$('#authOtp').value='';}
 function mode(mode){
  if(busy)return;
  resetPending();authMode=mode;
  $('#loginTab').classList.toggle('active',mode==='login');$('#signupTab').classList.toggle('active',mode==='signup');
  $('#authForm').classList.toggle('hidden',!mode);$('#backToAuthChoice').classList.toggle('hidden',!mode);
  for(const id of ['usernameWrap','confirmPasswordWrap','communityRules'])$('#'+id).classList.toggle('hidden',mode!=='signup');
  for(const id of ['authUsername','authConfirmPassword','agreeRules'])$('#'+id).required=mode==='signup';
  $('#authPassword').autocomplete=mode==='signup'?'new-password':'current-password';
  $('#authPassword').value='';$('#authConfirmPassword').value='';$('#agreeRules').checked=false;
  $('#authTitle').textContent=mode==='signup'?'Tạo tài khoản UEH':mode==='login'?'Đăng nhập TìmTrọ':'Chào mừng bạn';
  $('#authCopy').textContent=mode==='signup'?'Đăng ký và xác nhận mã OTP trong hộp thư mô phỏng.':mode==='login'?'Dùng email và mật khẩu đã đăng ký, xác minh OTP demo.':'Chọn Đăng nhập hoặc Đăng ký để tiếp tục.';
  $('#sendAuth').textContent=mode==='signup'?'Gửi OTP demo':'Đăng nhập';newChallenge();authMessage('');
 }
 function sendCode(){const old=pending.code;do{pending.code=String(100000+random()%900000);}while(pending.code===old);pending.expires=Date.now()+5*60*1000;pending.attempts=0;$('#demoOtpCode').textContent=pending.code;$('#demoOtpEmail').textContent=pending.email;$('#authOtp').value='';$('#otpForm').classList.remove('hidden');$('#demoMailbox').classList.remove('hidden');authMessage('OTP demo có hiệu lực 5 phút. Xem mã trong hộp thư mô phỏng bên dưới.');$('#authOtp').focus();}
 function login(account){currentUser={id:account.id,email:account.email,email_confirmed_at:account.verifiedAt,user_metadata:{username:account.name},is_demo:true};sessionStorage.setItem(SESSION,account.id);supabaseClient=createDemoDataClient();updateAuthAccount();afterAuthentication();}
 window.demoLogout=()=>{sessionStorage.removeItem(SESSION);currentUser=null;supabaseClient=null;clearRoommateData();mode(null);showAuth();toast('Đã đăng xuất.');};
 $('#loginTab').addEventListener('click',()=>mode('login'));$('#signupTab').addEventListener('click',()=>mode('signup'));$('#backToAuthChoice').addEventListener('click',()=>mode(null));
 $('#refreshBot').addEventListener('click',newChallenge);
 $('#authForm').addEventListener('submit',async event=>{
  event.preventDefault();if(busy||!authMode)return;
  const email=$('#authEmail').value.trim().toLowerCase(),password=$('#authPassword').value;
  if(!validUehEmail(email))return authMessage('Email cần đúng dạng ten.123456789@st.ueh.edu.vn.','error');
  if(password.length<8)return authMessage('Mật khẩu cần ít nhất 8 ký tự.','error');
  if(!$('#notRobot').checked||Number($('#botAnswer').value)!==challenge||!$('#botAnswer').value)return authMessage('Hãy tích Tôi không phải robot và trả lời đúng câu hỏi demo.','error');
  busy=true;$('#sendAuth').disabled=true;
  try{
   const list=accounts(),existing=list.find(a=>a.email===email);
   if(authMode==='signup'){
    if(password!==$('#authConfirmPassword').value)throw Error('Hai mật khẩu chưa khớp.');
    const name=$('#authUsername').value.trim();if(name.length<2)throw Error('Tên hiển thị cần ít nhất 2 ký tự.');
    if(!$('#agreeRules').checked)throw Error('Bạn cần đồng ý với quy tắc cộng đồng.');
    if(existing)throw Error('Email này đã đăng ký. Hãy chọn Đăng nhập.');
    const salt=hex(crypto.getRandomValues(new Uint8Array(16)));
    pending={id:'demo-'+crypto.randomUUID(),email,name,salt,passwordHash:await hash(password,salt)};
    $('#authPassword').value='';$('#authConfirmPassword').value='';$('#authForm').classList.add('hidden');sendCode();
   }else{
    if(!existing||!existing.verifiedAt||await hash(password,existing.salt)!==existing.passwordHash)throw Error('Email hoặc mật khẩu không đúng.');
    $('#authPassword').value='';login(existing);
   }
  }catch(error){authMessage(error.message||'Không thể lưu tài khoản trên trình duyệt này.','error');}
  finally{busy=false;$('#sendAuth').disabled=false;}
 });
 $('#otpForm').addEventListener('submit',event=>{
  event.preventDefault();if(!pending)return;
  if(Date.now()>=pending.expires)return authMessage('OTP đã hết hạn. Hãy gửi lại mã.','error');
  if(pending.attempts>=5)return authMessage('Đã nhập sai 5 lần. Hãy gửi lại mã.','error');
  if($('#authOtp').value.trim()!==pending.code){pending.attempts++;return authMessage(`OTP không đúng (${pending.attempts}/5 lần).`,'error');}
  try{
   const list=accounts();if(list.some(a=>a.email===pending.email))throw Error('Email đã được đăng ký ở tab khác. Hãy đăng nhập.');
   const {code,expires,attempts,...account}=pending;account.verifiedAt=new Date().toISOString();account.rulesVersion='2026-10';
   localStorage.setItem(ACCOUNTS,JSON.stringify([...list,account]));const email=account.email;resetPending();mode('login');$('#authEmail').value=email;authMessage('Đăng ký thành công với OTP demo. Bạn có thể đăng nhập bằng email và mật khẩu vừa tạo.','success');
  }catch(error){authMessage(error.message,'error');}
 });
 $('#resendOtp').addEventListener('click',()=>{if(pending)sendCode();});
 $$('[data-role]').forEach(b=>b.addEventListener('click',()=>authenticated()?enterSelectedRole():showAuth()));
 $('#switchRole')?.addEventListener('click',()=>showPage('roommates'));
 mode(null);showAuth();
 try{const saved=accounts().find(a=>a.id===sessionStorage.getItem(SESSION)&&a.verifiedAt);if(saved)login(saved);}catch{authMessage('Không thể đọc bộ nhớ demo. Hãy cho phép lưu dữ liệu trên trình duyệt.','error');}
})();
