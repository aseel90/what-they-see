(()=>{
'use strict';
const $=id=>document.getElementById(id),C=$('game'),X=C.getContext('2d');
const W=1500,H=900,TAU=Math.PI*2,rand=(a,b)=>a+Math.random()*(b-a),pick=a=>a[(Math.random()*a.length)|0],clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const blend=(r,dt)=>1-Math.exp(-r*dt);
const RAW='https://raw.githubusercontent.com/ncase/wbwwb/7c68c7e44e66b5be95ebd07d22391de707090397/sprites/peeps/';
const assets={};
const sources={body:RAW+'body.png',face:RAW+'face.png',hat:RAW+'hat.png'};
function load(){return Promise.all(Object.entries(sources).map(([k,src])=>new Promise((res,rej)=>{const i=new Image();i.crossOrigin='anonymous';i.onload=()=>{assets[k]=i;res()};i.onerror=rej;i.src=src;})))}
const G={run:false,pause:true,time:0,chapter:0,hatCount:0,flowerCount:0,badgeCount:0,megaphones:0,weapons:0,division:0,warmth:0,unlocked:new Set(['hat','flower']),drag:null};
const people=[];
function makePerson(i){const type=i%2;return{id:i,type,x:rand(120,W-120),y:rand(260,H-150),tx:rand(120,W-120),ty:rand(260,H-150),vx:0,vy:0,speed:rand(34,52),phase:rand(0,TAU),face:0,faceT:0,hat:false,hatAnim:0,flower:false,badge:false,badgeSide:type,megaphone:false,baton:false,influence:rand(.7,1.25),mood:'calm',state:'walk',stateT:0,target:null,glow:0};}
for(let i=0;i<18;i++)people.push(makePerson(i));
function nearestPerson(x,y,max=78){let best=null,bd=max;for(const p of people){const d=Math.hypot(p.x-x,p.y-y);if(d<bd){best=p;bd=d}}return best}
function separate(p){let sx=0,sy=0;for(const q of people){if(q===p)continue;const dx=p.x-q.x,dy=p.y-q.y,d2=dx*dx+dy*dy;if(d2>1&&d2<2500){const d=Math.sqrt(d2),f=(50-d)/50;sx+=dx/d*f*28;sy+=dy/d*f*22}}return{x:sx,y:sy}}
function steer(p,tx,ty,speed,dt){const dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy)||1,s=separate(p),a=blend(5.8,dt),dvx=dx/d*speed+s.x,dvy=dy/d*speed+s.y;p.vx+=(dvx-p.vx)*a;p.vy+=(dvy-p.vy)*a;p.x+=p.vx*dt;p.y+=p.vy*dt;p.phase+=Math.hypot(p.vx,p.vy)*dt*.08;}
function setFace(p,f,d=1.4){p.face=f;p.faceT=d;p.glow=1;}
function nearby(p,r=230){return people.filter(q=>q!==p&&Math.hypot(q.x-p.x,q.y-p.y)<r)}
function unlock(type,msg){if(G.unlocked.has(type))return;G.unlocked.add(type);document.querySelector(`[data-object="${type}"]`)?.classList.remove('locked');toast(msg);}
function updateProgress(){
 if(G.chapter<1&&(G.hatCount>=3||G.flowerCount>=3)){G.chapter=1;unlock('badge','فُتحت الشارة — الشيء أصبح هوية.');$('chapter').textContent='الاختلاف صار هوية';}
 if(G.chapter<2&&G.badgeCount>=5){G.chapter=2;unlock('megaphone','فُتح مكبّر الصوت — الآن يمكن تضخيم ما زرعته.');$('chapter').textContent='بعض الأصوات أعلى من غيرها';}
 if(G.chapter<3&&G.division>=55){G.chapter=3;unlock('baton','فُتحت الهراوة — المجتمع وصل لمرحلة أخطر.');$('chapter').textContent='الهوية أصبحت مواجهة';}
}
function applyObject(type,p){
 p.glow=1.6;
 if(type==='hat'){
   if(p.hat){toast('هذا الشخص يرتدي القبعة بالفعل');return}
   p.hat=true;p.hatAnim=1;p.state='react';setFace(p,6,2);G.hatCount++;toast('أعطيته القبعة… راقب من يلاحظها.');
   setTimeout(()=>{nearby(p,260).slice(0,5).forEach((q,i)=>setTimeout(()=>{setFace(q,4,1.4);if(Math.random()<.42&&!q.hat){q.hat=true;q.hatAnim=15;G.hatCount++;setFace(q,6,1.6);updateProgress();}},i*280));},450);
 }
 if(type==='flower'){
   p.flower=true;p.state='react';setFace(p,6,2);G.flowerCount++;G.warmth+=10;toast('لفتة صغيرة. الناس القريبون لاحظوها.');
   nearby(p,240).slice(0,5).forEach((q,i)=>setTimeout(()=>{setFace(q,6,1.2);q.tx=p.x+rand(-120,120);q.ty=p.y+rand(-80,80);},250+i*180));
 }
 if(type==='badge'){
   if(p.badge){toast('لديه شارة بالفعل');return}
   p.badge=true;p.badgeSide=p.type;G.badgeCount++;G.division+=7;setFace(p,6,1.4);toast('العلامة أصبحت طريقة لمعرفة: من معنا ومن ليس معنا.');
   nearby(p,300).forEach((q,i)=>setTimeout(()=>{if(q.type===p.type&&Math.random()<.45&&!q.badge){q.badge=true;q.badgeSide=q.type;G.badgeCount++;setFace(q,6,1.2)}else if(q.type!==p.type){setFace(q,5,1.6);G.division+=2}updateProgress();},120+i*90));
 }
 if(type==='megaphone'){
   p.megaphone=true;G.megaphones++;p.state='speak';setFace(p,p.badge?5:6,2);toast('صوته الآن يصل أبعد من أي شخص آخر.');
   const range=nearby(p,520);range.forEach((q,i)=>setTimeout(()=>{if(p.badge){if(q.type===p.type){q.badge=true;G.badgeCount++;setFace(q,6,1)}else{setFace(q,5,1.5);G.division+=4}}else if(p.hat&&!q.hat&&Math.random()<.55){q.hat=true;q.hatAnim=15;G.hatCount++;setFace(q,6,1)}else setFace(q,4,1);updateProgress();},i*70));
 }
 if(type==='baton'){
   p.baton=true;G.weapons++;p.state='armed';setFace(p,5,2);G.division+=12;toast('أعطيته قوة. الآن سيرى المختلف كخصم محتمل.');
   const enemies=people.filter(q=>q.type!==p.type);p.target=enemies.length?enemies.reduce((a,b)=>Math.hypot(b.x-p.x,b.y-p.y)<Math.hypot(a.x-p.x,a.y-p.y)?b:a,enemies[0]):null;
 }
 updateProgress();
}
function updatePerson(p,dt){p.glow=Math.max(0,p.glow-dt);if(p.faceT>0){p.faceT-=dt;if(p.faceT<=0)p.face=0}p.stateT+=dt;
 if(p.baton&&p.target){const q=p.target;if(Math.hypot(q.x-p.x,q.y-p.y)>70){steer(p,q.x,q.y,74,dt);p.state='armed'}else{p.vx*=Math.exp(-8*dt);p.vy*=Math.exp(-8*dt);p.state='threat';setFace(q,3,.25);if(Math.random()<dt*.55){q.tx=q.x+(q.x-p.x)*4;q.ty=q.y+(q.y-p.y)*4;G.division+=.12}}}
 else{const d=Math.hypot(p.tx-p.x,p.ty-p.y);if(d<24||Math.random()<dt*.018){p.tx=rand(100,W-100);p.ty=rand(250,H-150)}steer(p,p.tx,p.ty,p.speed,dt);if(p.state!=='react'&&p.state!=='speak')p.state='walk'}
 p.x=clamp(p.x,70,W-70);p.y=clamp(p.y,220,H-125);
}
function simulate(dt){if(!G.run||G.pause)return;G.time+=dt;people.forEach(p=>updatePerson(p,dt));if(G.division>30){for(const p of people.filter(x=>x.badge)){const allies=people.filter(q=>q!==p&&q.badge&&q.type===p.type);if(allies.length&&Math.random()<dt*.08){const q=pick(allies);p.tx=q.x+rand(-90,90);p.ty=q.y+rand(-60,60)}}}updateProgress();}
function frameRect(index,cols){return{x:(index%cols)*120,y:Math.floor(index/cols)*140,w:120,h:140}}
function sprite(g,img,index,cols,x,y,scale=1,alpha=1){if(!img)return;const f=frameRect(index,cols);g.save();g.globalAlpha=alpha;g.drawImage(img,f.x,f.y,f.w,f.h,x-60*scale,y-70*scale,120*scale,140*scale);g.restore();}
function drawItem(g,p){if(p.flower){g.save();g.translate(p.x+22,p.y-10);g.fillStyle='#5b875e';g.fillRect(-2,0,4,28);g.fillStyle='#d96575';for(let i=0;i<5;i++){g.beginPath();g.arc(Math.cos(i*TAU/5)*7,Math.sin(i*TAU/5)*7,5,0,TAU);g.fill()}g.fillStyle='#e3b74e';g.beginPath();g.arc(0,0,4,0,TAU);g.fill();g.restore()}
 if(p.badge){g.save();g.translate(p.x,p.y+12);g.fillStyle=p.badgeSide?'#4d789b':'#c9574e';g.strokeStyle='#242724';g.lineWidth=2;g.beginPath();g.arc(0,0,10,0,TAU);g.fill();g.stroke();g.restore()}
 if(p.megaphone){g.save();g.translate(p.x+25,p.y-5);g.rotate(-.2);g.fillStyle='#d8b85c';g.strokeStyle='#242724';g.lineWidth=2;g.beginPath();g.moveTo(-8,-6);g.lineTo(12,-13);g.lineTo(12,13);g.lineTo(-8,6);g.closePath();g.fill();g.stroke();g.fillRect(-14,-4,7,8);g.restore()}
 if(p.baton){g.save();g.translate(p.x+28,p.y-5);g.rotate(-.55);g.strokeStyle='#3d342d';g.lineWidth=7;g.lineCap='round';g.beginPath();g.moveTo(0,18);g.lineTo(0,-25);g.stroke();g.restore()}}
function drawPerson(g,p){const moving=Math.hypot(p.vx,p.vy)>4,bob=moving?Math.abs(Math.sin(p.phase*2))*4:0,lean=clamp(p.vx/260,-.08,.08);g.save();g.translate(p.x,p.y+bob);g.rotate(lean);const scale=.78;if(p.glow>0){g.fillStyle=`rgba(240,184,78,${Math.min(.18,p.glow*.12)})`;g.beginPath();g.ellipse(0,15,54,68,0,0,TAU);g.fill()}sprite(g,assets.body,p.type,2,0,0,scale);sprite(g,assets.face,p.face,2,0,0,scale);if(p.hat){const fr=p.hatAnim<15?Math.min(15,Math.floor(p.hatAnim)):15;sprite(g,assets.hat,fr,4,0,0,scale);if(p.hatAnim<15)p.hatAnim+=.45}g.restore();drawItem(g,p)}
function drawWorld(){X.setTransform(C.map.s,0,0,C.map.s,C.map.ox,C.map.oy);X.clearRect(-C.map.ox/C.map.s,-C.map.oy/C.map.s,C.width/C.map.s,C.height/C.map.s);X.fillStyle='#dfe5df';X.fillRect(0,0,W,H);X.fillStyle='#c8c0af';X.fillRect(0,205,W,H-205);X.fillStyle='#8b918d';X.fillRect(0,150,W,72);X.strokeStyle='#f1e8d8';X.lineWidth=4;X.setLineDash([32,30]);X.beginPath();X.moveTo(0,185);X.lineTo(W,185);X.stroke();X.setLineDash([]);X.fillStyle='#9caf88';roundRect(X,50,300,300,240,26);X.fill();roundRect(X,1160,525,285,225,26);X.fill();X.fillStyle='#7f9492';X.beginPath();X.ellipse(760,510,135,50,0,0,TAU);X.fill();X.fillStyle='#bcd1ce';X.beginPath();X.ellipse(760,500,108,34,0,0,TAU);X.fill();X.strokeStyle='#aaa292';X.globalAlpha=.25;for(let y=245;y<H;y+=52){X.beginPath();X.moveTo(0,y);X.lineTo(W,y);X.stroke()}for(let x=0;x<W;x+=88){X.beginPath();X.moveTo(x,220);X.lineTo(x,H);X.stroke()}X.globalAlpha=1;[...people].sort((a,b)=>a.y-b.y).forEach(p=>drawPerson(X,p));}
function roundRect(g,x,y,w,h,r){g.beginPath();g.roundRect(x,y,w,h,r)}
function resize(){const r=C.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);C.width=Math.max(1,Math.round(r.width*d));C.height=Math.max(1,Math.round(r.height*d));const s=Math.min(C.width/W,C.height/H),ox=(C.width-W*s)/2,oy=(C.height-H*s)/2;C.map={s,ox,oy};}
function screenToWorld(clientX,clientY){const r=C.getBoundingClientRect(),m=C.map,px=(clientX-r.left)*(C.width/r.width),py=(clientY-r.top)*(C.height/r.height);return{x:(px-m.ox)/m.s,y:(py-m.oy)/m.s}}
function startDrag(e,btn){const type=btn.dataset.object;if(!G.unlocked.has(type)||!G.run||G.pause)return;e.preventDefault();G.drag={type,pointerId:e.pointerId};const ghost=$('dragGhost');ghost.textContent=type==='flower'?'✿':type==='badge'?'◆':type==='megaphone'?'◖':type==='baton'?'╱':'⌒';ghost.classList.add('on');moveGhost(e);btn.setPointerCapture?.(e.pointerId)}
function moveGhost(e){if(!G.drag)return;const g=$('dragGhost');g.style.left=e.clientX+'px';g.style.top=e.clientY+'px';const p=screenToWorld(e.clientX,e.clientY),target=nearestPerson(p.x,p.y,85);people.forEach(q=>q._hover=false);if(target)target._hover=true;}
function endDrag(e){if(!G.drag)return;const p=screenToWorld(e.clientX,e.clientY),target=nearestPerson(p.x,p.y,90),type=G.drag.type;$('dragGhost').classList.remove('on');people.forEach(q=>q._hover=false);G.drag=null;if(target){applyObject(type,target);pulse()}else toast('أسقط الشيء فوق شخص');}
function pulse(){const f=$('flash');f.classList.remove('on');void f.offsetWidth;f.classList.add('on')}
function toast(t){const e=$('toast');e.textContent=t;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),1700)}
document.querySelectorAll('.object-card').forEach(btn=>{btn.addEventListener('pointerdown',e=>startDrag(e,btn));btn.addEventListener('pointermove',moveGhost);btn.addEventListener('pointerup',endDrag);btn.addEventListener('pointercancel',()=>{$('dragGhost').classList.remove('on');G.drag=null})});
$('start').onclick=()=>{document.querySelectorAll('.modal').forEach(m=>m.classList.remove('on'));G.run=true;G.pause=false;toast('اختر شيئًا واسحبه إلى أي شخص')};$('help').onclick=()=>{if(!G.run)return;G.pause=true;$('helpModal').classList.add('on')};$('closeHelp').onclick=()=>{$('helpModal').classList.remove('on');G.pause=false};
addEventListener('resize',resize);addEventListener('orientationchange',()=>setTimeout(resize,120));resize();
load().then(()=>{let last=performance.now(),acc=0;const STEP=1/60;function loop(now){const dt=Math.min(.08,(now-last)/1000);last=now;acc+=dt;let n=0;while(acc>=STEP&&n<5){simulate(STEP);acc-=STEP;n++}drawWorld();requestAnimationFrame(loop)}requestAnimationFrame(loop)}).catch(()=>{toast('تعذر تحميل رسومات الشخصيات الأصلية');});
})();
