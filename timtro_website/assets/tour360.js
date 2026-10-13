/* A furnished virtual room rendered from a stationary camera, plus a spherical-photo viewer. */
(function(){
 'use strict';
 const panel=document.createElement('section');panel.className='tour-panel';panel.setAttribute('aria-label','Xem phòng 360 độ');
 panel.innerHTML=`<div class="tour-header"><div><div class="eyebrow">Khám phá không gian</div><h3>Xem phòng 360°</h3></div><span class="person-tag" id="tourMode">Phòng giả tưởng</span></div><div class="tour-stage" id="tourStage"><canvas id="tourCanvas" tabindex="0" aria-label="Phòng 360 độ. Dùng phím mũi tên để xoay, dấu cộng và trừ để thu phóng."></canvas><span class="tour-caption" id="tourCaption">Phòng giả tưởng · kéo để nhìn xung quanh</span></div><div class="tour-controls"><button type="button" id="tourLeft" aria-label="Xoay sang trái">←</button><button type="button" id="tourRight" aria-label="Xoay sang phải">→</button><button type="button" id="tourZoomIn" aria-label="Phóng to">+</button><button type="button" id="tourZoomOut" aria-label="Thu nhỏ">−</button><button type="button" id="tourReset">Đặt lại</button><button type="button" id="tourFull">Toàn màn hình</button><button type="button" id="tourVirtual">Phòng giả tưởng</button><button type="button" id="tourExport">Tải ảnh 360°</button><label for="tourUpload" tabindex="0" id="tourUploadLabel">Mở ảnh camera 360°<input type="file" id="tourUpload" accept="image/jpeg,image/png,image/webp"></label></div><p class="tour-note" id="tourNote" role="status">Phòng giả tưởng có giường, bàn học, tủ đồ, cửa sổ và cửa ra vào. Đây là minh họa, không phải ảnh thực tế của phòng đang xem. Bạn có thể mở ảnh panorama từ camera 360° (tỷ lệ 2:1); ảnh chỉ được xử lý trên thiết bị của bạn.</p>`;
 const gallery=document.querySelector('#detailPage .detail-grid>div');gallery.appendChild(panel);
 const exitFull=document.createElement('button');exitFull.type='button';exitFull.id='tourExitFull';exitFull.className='tour-exit-full';exitFull.textContent='Thoát toàn màn hình';exitFull.addEventListener('click',()=>document.exitFullscreen());panel.querySelector('.tour-stage').appendChild(exitFull);
 const el=id=>document.getElementById(id),canvas=el('tourCanvas');
 const gl=canvas.getContext('webgl',{preserveDrawingBuffer:true,antialias:false});
 if(!gl){el('tourNote').textContent='Trình duyệt chưa hỗ trợ WebGL để xem 360°. Thử Chrome/Edge hoặc bật tăng tốc đồ họa.';canvas.classList.add('hidden');panel.querySelector('.tour-controls').classList.add('hidden');return;}
 const vertex=`attribute vec2 position;varying vec2 uv;void main(){uv=position*0.5+0.5;gl_Position=vec4(position,0.0,1.0);}`;
 const fragment=`precision highp float;
 varying vec2 uv;uniform vec2 size;uniform float yaw;uniform float pitch;uniform float fov;uniform int photoMode;uniform int panorama;uniform sampler2D photo;
 const float PI=3.14159265359;
 float nearest=1000.0;vec3 surface=vec3(0.0);vec3 normal=vec3(0.0);vec3 point=vec3(0.0);
 void box(vec3 origin,vec3 ray,vec3 low,vec3 high,vec3 color){
 vec3 inv=1.0/(ray+vec3(0.000001));vec3 a=(low-origin)*inv;vec3 b=(high-origin)*inv;vec3 near=min(a,b);vec3 far=max(a,b);float enter=max(max(near.x,near.y),near.z);float leave=min(min(far.x,far.y),far.z);
 if(enter>0.001&&enter<leave&&enter<nearest){nearest=enter;surface=color;point=origin+ray*enter;normal=vec3(0.0);if(enter==near.x)normal.x=-sign(ray.x);else if(enter==near.y)normal.y=-sign(ray.y);else normal.z=-sign(ray.z);}}
 void main(){
 vec3 ray;if(panorama==1){float angle=(uv.x-0.5)*2.0*PI;float elevation=(uv.y-0.5)*PI;ray=vec3(sin(angle)*cos(elevation),sin(elevation),-cos(angle)*cos(elevation));}
 else{vec2 p=(uv*2.0-1.0)*vec2(size.x/size.y,1.0)*tan(fov*0.5);ray=normalize(vec3(p,-1.0));float cp=cos(pitch),sp=sin(pitch);ray=vec3(ray.x,ray.y*cp-ray.z*sp,ray.y*sp+ray.z*cp);float cy=cos(yaw),sy=sin(yaw);ray=vec3(ray.x*cy-ray.z*sy,ray.y,ray.x*sy+ray.z*cy);}
 if(photoMode==1){vec2 coord=vec2(atan(ray.x,-ray.z)/(2.0*PI)+0.5,0.5+asin(clamp(ray.y,-1.0,1.0))/PI);gl_FragColor=texture2D(photo,coord);return;}
 vec3 origin=vec3(0.0,1.55,0.4);
 box(origin,ray,vec3(-2.45,-0.06,-3.1),vec3(2.45,0.0,3.1),vec3(0.78,0.66,0.51));
 box(origin,ray,vec3(-2.45,3.0,-3.1),vec3(2.45,3.07,3.1),vec3(0.97,0.96,0.94));
 box(origin,ray,vec3(-2.45,0.0,-3.1),vec3(-2.4,3.0,3.1),vec3(0.91,0.87,0.98));
 box(origin,ray,vec3(2.4,0.0,-3.1),vec3(2.45,3.0,3.1),vec3(0.98,0.91,0.83));
 box(origin,ray,vec3(-2.4,0.0,-3.1),vec3(2.4,3.0,-3.04),vec3(0.96,0.95,0.99));
 box(origin,ray,vec3(-2.4,0.0,3.04),vec3(2.4,3.0,3.1),vec3(0.94,0.93,0.96));
 // Two beds: wooden bases, mattresses, duvets, pillows and headboards.
 box(origin,ray,vec3(-2.2,0.12,-2.6),vec3(-0.85,0.42,-0.4),vec3(0.58,0.44,0.34));
 box(origin,ray,vec3(-2.22,0.42,-2.62),vec3(-0.83,0.6,-0.38),vec3(0.98,0.96,0.92));
 box(origin,ray,vec3(-2.24,0.6,-2.15),vec3(-0.81,0.66,-0.36),vec3(0.65,0.61,0.88));
 box(origin,ray,vec3(-2.22,0.1,-2.75),vec3(-0.83,1.1,-2.63),vec3(0.62,0.47,0.37));
 box(origin,ray,vec3(-2.05,0.6,-2.48),vec3(-1.02,0.73,-2.19),vec3(0.99,0.96,0.89));
 box(origin,ray,vec3(0.85,0.12,-2.6),vec3(2.2,0.42,-0.4),vec3(0.58,0.44,0.34));
 box(origin,ray,vec3(0.83,0.42,-2.62),vec3(2.22,0.6,-0.38),vec3(0.98,0.96,0.92));
 box(origin,ray,vec3(0.81,0.6,-2.15),vec3(2.24,0.66,-0.36),vec3(0.97,0.77,0.62));
 box(origin,ray,vec3(0.83,0.1,-2.75),vec3(2.22,1.1,-2.63),vec3(0.62,0.47,0.37));
 box(origin,ray,vec3(1.02,0.6,-2.48),vec3(2.05,0.73,-2.19),vec3(0.99,0.96,0.89));
 // Window, frame, outside view.
 box(origin,ray,vec3(-0.6,1.3,-3.04),vec3(0.65,2.65,-2.92),vec3(0.53,0.42,0.34));
 box(origin,ray,vec3(-0.51,1.4,-2.92),vec3(0.56,2.56,-2.91),vec3(0.67,0.83,0.91));
 box(origin,ray,vec3(-0.02,1.4,-2.91),vec3(0.05,2.56,-2.89),vec3(0.97,0.96,0.94));
 box(origin,ray,vec3(-0.6,1.29,-3.0),vec3(0.65,1.35,-2.77),vec3(0.97,0.96,0.94));
 // Desk, chair, laptop, books, lamp.
 box(origin,ray,vec3(1.5,0.77,0.7),vec3(2.38,0.84,2.5),vec3(0.77,0.6,0.45));
 box(origin,ray,vec3(1.54,0.0,0.75),vec3(1.62,0.77,0.83),vec3(0.45,0.39,0.34));
 box(origin,ray,vec3(1.54,0.0,2.3),vec3(1.62,0.77,2.4),vec3(0.45,0.39,0.34));
 box(origin,ray,vec3(2.25,0.0,0.75),vec3(2.34,0.77,0.83),vec3(0.45,0.39,0.34));
 box(origin,ray,vec3(2.25,0.0,2.3),vec3(2.34,0.77,2.4),vec3(0.45,0.39,0.34));
 box(origin,ray,vec3(1.05,0.43,1.25),vec3(1.48,0.5,1.8),vec3(0.5,0.48,0.64));
 box(origin,ray,vec3(1.02,0.48,1.25),vec3(1.1,1.12,1.8),vec3(0.5,0.48,0.64));
 box(origin,ray,vec3(1.07,0.0,1.29),vec3(1.15,0.44,1.37),vec3(0.3,0.28,0.35));
 box(origin,ray,vec3(1.36,0.0,1.67),vec3(1.44,0.44,1.75),vec3(0.3,0.28,0.35));
 box(origin,ray,vec3(1.9,0.84,1.12),vec3(2.0,1.25,1.78),vec3(0.17,0.19,0.27));
 box(origin,ray,vec3(1.89,0.88,1.17),vec3(1.9,1.2,1.73),vec3(0.58,0.7,0.93));
 box(origin,ray,vec3(1.63,0.84,1.1),vec3(1.9,0.87,1.8),vec3(0.38,0.37,0.43));
 box(origin,ray,vec3(1.8,0.84,2.0),vec3(2.2,0.98,2.28),vec3(0.64,0.59,0.88));
 box(origin,ray,vec3(1.84,0.98,2.02),vec3(2.22,1.03,2.25),vec3(0.94,0.76,0.58));
 // Wardrobe, room entrance, rug and wall artwork.
 box(origin,ray,vec3(-2.33,0.0,1.8),vec3(-1.58,2.35,2.97),vec3(0.79,0.66,0.53));
 box(origin,ray,vec3(-1.57,1.0,2.34),vec3(-1.54,1.17,2.37),vec3(0.35,0.3,0.3));
 box(origin,ray,vec3(-1.57,1.0,2.42),vec3(-1.54,1.17,2.45),vec3(0.35,0.3,0.3));
 box(origin,ray,vec3(0.1,0.0,3.0),vec3(1.1,2.3,3.03),vec3(0.64,0.49,0.36));
 box(origin,ray,vec3(0.93,1.05,2.97),vec3(1.02,1.1,3.0),vec3(0.83,0.78,0.61));
 box(origin,ray,vec3(-0.8,0.003,-0.1),vec3(0.75,0.012,1.65),vec3(0.79,0.77,0.92));
 box(origin,ray,vec3(-2.39,1.5,-1.4),vec3(-2.35,2.2,-0.7),vec3(0.56,0.43,0.35));
 box(origin,ray,vec3(-2.35,1.55,-1.35),vec3(-2.34,2.15,-0.75),vec3(0.98,0.82,0.72));
 if(nearest>100.0){gl_FragColor=vec4(0.95,0.93,0.98,1.0);return;}
 float light=0.86+0.14*max(dot(normal,normalize(vec3(0.4,0.9,-0.4))),0.0);float shade=1.0-0.012*nearest;
 if(point.y<0.001){float seam=step(0.025,fract(point.x*2.5))*step(0.015,fract(point.z*0.8));surface*=0.86+0.14*seam;}
 gl_FragColor=vec4(surface*light*shade,1.0);
 }`;
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;}
 let program;try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Không khởi tạo được trình xem.');}catch(err){el('tourNote').textContent='Không mở được đồ họa 360°. Hãy thử trình duyệt khác.';console.error(err);return;}
 gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const location=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,2,gl.FLOAT,false,0,0);
 const uniforms=Object.fromEntries(['size','yaw','pitch','fov','photoMode','panorama','photo'].map(k=>[k,gl.getUniformLocation(program,k)]));
 let yaw=0,pitch=0,fov=75,photoMode=0,drag=null,frame=null;const roomPhotos=new Map();let roomKey=String(currentRoom.id);
 const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([240,240,240,255]));gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
 function render(panoramic=false){gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(uniforms.size,canvas.width,canvas.height);gl.uniform1f(uniforms.yaw,yaw);gl.uniform1f(uniforms.pitch,pitch);gl.uniform1f(uniforms.fov,fov*Math.PI/180);gl.uniform1i(uniforms.photoMode,photoMode);gl.uniform1i(uniforms.panorama,panoramic?1:0);gl.uniform1i(uniforms.photo,0);gl.drawArrays(gl.TRIANGLES,0,6);}
 function schedule(){if(frame)return;frame=requestAnimationFrame(()=>{frame=null;const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;const dpr=Math.min(devicePixelRatio||1,1.75);canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);render();});}
 function rotate(dx,dy=0){yaw+=dx;pitch=Math.max(-1.45,Math.min(1.45,pitch+dy));schedule();}
 function zoom(amount){fov=Math.max(35,Math.min(110,fov+amount));schedule();}
 function setMode(value){photoMode=value;el('tourMode').textContent=value?'Ảnh camera 360° · cục bộ':'Phòng giả tưởng';el('tourCaption').textContent=value?'Ảnh panorama bạn mở · kéo để xoay':'Phòng giả tưởng · kéo để nhìn xung quanh';yaw=0;pitch=0;fov=75;schedule();}
 function useImage(image){gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);setMode(1);}
 el('tourLeft').addEventListener('click',()=>rotate(-.3));el('tourRight').addEventListener('click',()=>rotate(.3));el('tourZoomIn').addEventListener('click',()=>zoom(-10));el('tourZoomOut').addEventListener('click',()=>zoom(10));el('tourReset').addEventListener('click',()=>{yaw=0;pitch=0;fov=75;schedule();});el('tourVirtual').addEventListener('click',()=>{setMode(0);el('tourNote').textContent='Đang xem phòng giả tưởng minh họa, không phải ảnh thực tế của phòng đang chọn.';});
 el('tourFull').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await el('tourStage').requestFullscreen();}catch{el('tourNote').textContent='Toàn màn hình không khả dụng trên trình duyệt này; bạn vẫn có thể kéo và thu phóng.';}});document.addEventListener('fullscreenchange',()=>{el('tourFull').textContent=document.fullscreenElement?'Thoát toàn màn hình':'Toàn màn hình';schedule();});
 canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);canvas.focus();});canvas.addEventListener('pointermove',e=>{if(!drag)return;rotate((e.clientX-drag.x)*-.005,(e.clientY-drag.y)*.005);drag={x:e.clientX,y:e.clientY};});canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
 canvas.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY*.035);},{passive:false});canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'].includes(e.key))e.preventDefault();if(e.key==='ArrowLeft')rotate(-.15);if(e.key==='ArrowRight')rotate(.15);if(e.key==='ArrowUp')rotate(0,.12);if(e.key==='ArrowDown')rotate(0,-.12);if(e.key==='+'||e.key==='=')zoom(-5);if(e.key==='-')zoom(5);});
 el('tourUploadLabel').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el('tourUpload').click();}});
 el('tourUpload').addEventListener('change',e=>{const file=e.target.files[0];if(!file)return;const selectedRoom=roomKey;el('tourUpload').value='';if(!/^image\/(jpeg|png|webp)$/.test(file.type)||file.size>12*1024*1024){el('tourNote').textContent='Chọn ảnh JPG, PNG hoặc WebP tối đa 12 MB.';return;}const reader=new FileReader();reader.onerror=()=>el('tourNote').textContent='Không đọc được ảnh. Hãy chọn lại.';reader.onload=()=>{const image=new Image();image.onerror=()=>el('tourNote').textContent='Tệp không phải ảnh hợp lệ.';image.onload=()=>{if(Math.abs(image.width/image.height-2)>.1){el('tourNote').textContent='Cần ảnh panorama equirectangular tỷ lệ 2:1 để xem đủ 360°.';return;}const limit=gl.getParameter(gl.MAX_TEXTURE_SIZE);let source=image;if(image.width>Math.min(limit,4096)){source=document.createElement('canvas');source.width=Math.min(limit,4096);source.height=source.width/2;source.getContext('2d').drawImage(image,0,0,source.width,source.height);}roomPhotos.set(selectedRoom,source);if(roomKey!==selectedRoom)return;try{useImage(source);el('tourNote').textContent='Đang xem ảnh panorama bạn vừa mở. Ảnh chỉ tồn tại trong phiên này; tải lại trang sẽ xóa ảnh đã mở.';}catch{el('tourNote').textContent='Không nạp được ảnh panorama. Thử ảnh nhỏ hơn.';}};image.src=reader.result;};reader.readAsDataURL(file);});
 el('tourExport').addEventListener('click',()=>{canvas.width=2048;canvas.height=1024;render(true);const a=document.createElement('a');a.download=photoMode?'panorama-360.png':'timtro-phong-gia-tuong-360.png';a.href=canvas.toDataURL('image/png');a.click();schedule();});
 new ResizeObserver(schedule).observe(canvas);window.addEventListener('resize',schedule);
 const baseOpenRoom=openRoom;openRoom=function(id){baseOpenRoom(id);roomKey=String(currentRoom.id);if(roomPhotos.has(roomKey)){useImage(roomPhotos.get(roomKey));el('tourNote').textContent='Ảnh panorama cục bộ của phòng này, chỉ lưu trong phiên hiện tại.';}else{setMode(0);el('tourNote').textContent='Phòng giả tưởng minh họa, không phải ảnh thực tế của '+currentRoom.title+'. Mở ảnh panorama tỷ lệ 2:1 từ camera 360° để xem ảnh của bạn.';}schedule();};
 window.TimTroTour={render:schedule,getState:()=>({yaw,pitch,fov,photoMode,roomKey}),canvas};schedule();
})();
