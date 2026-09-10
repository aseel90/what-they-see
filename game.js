(() => {
'use strict';
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const photo = document.getElementById('photo');
const pctx = photo.getContext('2d');
const captureBtn = document.getElementById('captureBtn');
const editor = document.getElementById('editor');
const optionsEl = document.getElementById('headlineOptions');
const eventSummary = document.getElementById('eventSummary');
const skipBtn = document.getElementById('skipBtn');
const flash = document.getElementById('flash');
const hint = document.getElementById('hint');
const toast = document.getElementById('toast');
const shotCountEl = document.getElementById('shotCount');
const trendText = document.getElementById('trendText');
const calmValue = document.getElementById('calmValue');
const trustValue = document.getElementById('trustValue');
const hypeValue = document.getElementById('hypeValue');

const W = 390, H = 650;
const world = {calm:68, trust:62, hype:22, shots:0, time:0, paused:false, trend:'ordinary life'};
const pointer = {x:W*.5,y:H*.45,active:false};
const lens = {x:W*.5,y:H*.45,w:145,h:112};
const palette = ['#e56b5d','#eba94f','#65a58c','#6e8fc7','#9a78b7','#d68aa4','#8d9d68','#bf7a55'];
const accessories = ['none','cap','glasses','hair','phone','tie'];
const names = ['Milo','Nia','Sam','Zoe','Ari','Leo','Mina','Noah','Ivy','Omar','Lina','Max','Aya','Ben','Eva','Kai'];
const agents = [];
const particles = [];
const stories = {
  kindness:{label:'a small act of kindness', icon:'♥', tone:'#5e9c79', summary:'Someone stopped to help a stranger.', headlines:[
    {text:'A stranger helps for no reason', sub:'calm +8  •  trust +10', calm:8, trust:10, hype:-2, fame:1},
    {text:'You won’t BELIEVE what happened next', sub:'hype +8  •  trust -2', calm:1, trust:-2, hype:8, fame:4},
    {text:'Nobody else would help them', sub:'anger +4  •  hype +5', calm:-4, trust:-3, hype:5, fame:3}
  ]},
  argument:{label:'a public argument', icon:'!', tone:'#d85b4e', summary:'Two people are arguing in the square.', headlines:[
    {text:'Two neighbors disagree in public', sub:'trust +2  •  hype +1', calm:-1, trust:2, hype:1, fame:1},
    {text:'CITY ERUPTS IN FURY', sub:'hype +14  •  calm -10', calm:-10, trust:-6, hype:14, fame:5},
    {text:'Who is really to blame?', sub:'hype +8  •  division rises', calm:-6, trust:-4, hype:8, fame:4}
  ]},
  prank:{label:'a risky prank', icon:'★', tone:'#d8913e', summary:'Someone is performing a prank for attention.', headlines:[
    {text:'A silly stunt gets a few laughs', sub:'calm +2  •  hype +2', calm:2, trust:0, hype:2, fame:2},
    {text:'THIS PRANK IS TAKING OVER', sub:'hype +13  •  fame spreads', calm:-3, trust:-2, hype:13, fame:7},
    {text:'People are going too far for views', sub:'trust +5  •  hype +5', calm:1, trust:5, hype:5, fame:3}
  ]},
  lonely:{label:'someone left out', icon:'…', tone:'#6c80a8', summary:'One person is sitting alone while everyone passes.', headlines:[
    {text:'Maybe someone should sit with them', sub:'trust +8  •  calm +5', calm:5, trust:8, hype:-1, fame:1},
    {text:'The saddest person in the city?', sub:'hype +7  •  trust -2', calm:-2, trust:-2, hype:7, fame:4},
    {text:'Everyone ignored this person', sub:'anger +5  •  hype +6', calm:-5, trust:-4, hype:6, fame:3}
  ]}
};

function rand(a,b){return a+Math.random()*(b-a)}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function resize(){
  const r=canvas.getBoundingClientRect(), d=Math.min(devicePixelRatio||1,2);
  canvas.width=Math.max(1,Math.round(r.width*d)); canvas.height=Math.max(1,Math.round(r.height*d));
  ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);
}
function makeAgent(i){
  const a={id:i,name:names[i%names.length],x:rand(30,W-30),y:rand(160,H-80),vx:rand(-18,18),vy:rand(-8,8),speed:rand(10,25),color:palette[i%palette.length],acc:accessories[i%accessories.length],mood:'calm',fame:rand(0,8),attention:rand(0,1),event:null,eventT:rand(2,12),bob:rand(0,6.28),targetX:rand(20,W-20),targetY:rand(160,H-80)};
  return a;
}
for(let i=0;i<26;i++) agents.push(makeAgent(i));

function chooseEvent(a){
  const r=Math.random(); let type;
  const bias=world.hype/100;
  if(r<.25+bias*.18) type='argument'; else if(r<.48+bias*.14) type='prank'; else if(r<.73) type='kindness'; else type='lonely';
  a.event={type,life:rand(5,9)};
  if(type==='argument') a.mood='angry';
  if(type==='kindness') a.mood='happy';
  if(type==='prank') a.mood='hype';
  if(type==='lonely') a.mood='sad';
}
function update(dt){
  if(world.paused) return;
  world.time+=dt;
  for(const a of agents){
    a.bob+=dt*(3+a.speed*.03);
    if(a.event){
      a.event.life-=dt;
      if(a.event.life<=0){a.event=null;a.mood='calm';a.eventT=rand(4,12)}
    }else{
      a.eventT-=dt;
      if(a.eventT<=0 && Math.random()<.02) chooseEvent(a);
    }
    let dx=a.targetX-a.x,dy=a.targetY-a.y,d=Math.hypot(dx,dy);
    if(d<8||Math.random()<.003){a.targetX=rand(18,W-18);a.targetY=rand(150,H-60)}
    if(!a.event || a.event.type==='kindness'){
      d=Math.max(1,Math.hypot(dx,dy)); a.vx+=(dx/d*a.speed-a.vx)*dt*1.4; a.vy+=(dy/d*a.speed*.45-a.vy)*dt*1.2;
      a.x+=a.vx*dt; a.y+=a.vy*dt;
    }else {a.x+=Math.sin(a.bob*1.9)*2*dt;}
    a.x=clamp(a.x,15,W-15); a.y=clamp(a.y,145,H-52);
  }
  for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=18*dt;if(p.life<=0)particles.splice(i,1)}
}
function roundRect(c,x,y,w,h,r,fill,stroke){c.beginPath();c.roundRect(x,y,w,h,r);if(fill)c.fill();if(stroke)c.stroke()}
function drawWorld(c, forPhoto=false){
  c.save();
  c.fillStyle='#cdd9cf';c.fillRect(0,0,W,H);
  c.fillStyle='#dce6df';c.fillRect(0,0,W,125);
  c.fillStyle='#e8dfca';c.fillRect(0,95,W,55);
  const blocks=[[0,50,70,100],[74,72,64,78],[145,42,88,108],[240,62,66,88],[312,35,78,115]];
  blocks.forEach((b,i)=>{c.fillStyle=i%2?'#b8a98c':'#c5b79c';c.fillRect(...b);c.fillStyle='#4e5750';for(let wx=b[0]+12;wx<b[0]+b[2]-8;wx+=22)for(let wy=b[1]+14;wy<b[1]+b[3]-10;wy+=25)c.fillRect(wx,wy,8,10)});
  c.fillStyle='#c8c0ae';c.fillRect(0,145,W,H-145);
  c.strokeStyle='#b2aa99';c.lineWidth=1;c.globalAlpha=.55;
  for(let y=165;y<H;y+=34){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}
  for(let x=12;x<W;x+=54){c.beginPath();c.moveTo(x,145);c.lineTo(x,H);c.stroke()}
  c.globalAlpha=1;
  c.fillStyle='#a8bd91';roundRect(c,15,178,95,105,18,true,false);roundRect(c,286,350,88,115,18,true,false);
  [[35,205],[88,248],[305,382],[348,438]].forEach(([x,y])=>{c.fillStyle='#735f48';c.fillRect(x-3,y,6,18);c.fillStyle='#66845c';c.beginPath();c.arc(x,y,15,0,Math.PI*2);c.fill()});
  c.fillStyle='#a65e4e';c.fillRect(126,174,72,48);c.fillStyle='#f0d58a';c.fillRect(132,184,60,13);c.fillStyle='#383c39';c.font='700 10px system-ui';c.fillText('CAFÉ',148,201);
  c.fillStyle='#765d43';c.fillRect(32,319,55,7);c.fillRect(36,326,5,12);c.fillRect(78,326,5,12);
  const sorted=[...agents].sort((a,b)=>a.y-b.y);
  sorted.forEach(a=>drawAgent(c,a));
  particles.forEach(p=>{c.globalAlpha=clamp(p.life,0,1);c.fillStyle=p.color;c.font='900 15px system-ui';c.fillText(p.char,p.x,p.y)});c.globalAlpha=1;
  if(!forPhoto) drawLens(c);
  c.restore();
}
function drawAgent(c,a){
  const bob=Math.sin(a.bob)*1.5;
  c.save();c.translate(a.x,a.y+bob);
  c.strokeStyle='#252a27';c.lineWidth=2.3;c.lineCap='round';c.lineJoin='round';
  c.beginPath();c.moveTo(-5,24);c.lineTo(-7,34);c.moveTo(5,24);c.lineTo(7,34);c.stroke();
  c.fillStyle=a.color;roundRect(c,-10,-1,20,29,8,true,true);
  c.fillStyle='#f0d7b6';c.beginPath();c.arc(0,-12,13,0,Math.PI*2);c.fill();c.stroke();
  c.fillStyle='#252a27';
  if(a.mood==='angry'){c.beginPath();c.moveTo(-7,-17);c.lineTo(-2,-15);c.moveTo(7,-17);c.lineTo(2,-15);c.stroke()}
  c.beginPath();c.arc(-4,-12,1.4,0,6.28);c.arc(4,-12,1.4,0,6.28);c.fill();
  c.beginPath();
  if(a.mood==='happy')c.arc(0,-8,4,0.15*Math.PI,.85*Math.PI);
  else if(a.mood==='sad')c.arc(0,-4,4,1.15*Math.PI,1.85*Math.PI);
  else if(a.mood==='angry'){c.moveTo(-3,-7);c.lineTo(3,-7)}
  else {c.moveTo(-2,-7);c.lineTo(2,-7)}c.stroke();
  if(a.acc==='cap'){c.fillStyle='#374f68';c.beginPath();c.arc(0,-18,10,Math.PI,2*Math.PI);c.fill();c.fillRect(0,-19,12,3)}
  if(a.acc==='glasses'){c.strokeRect(-9,-16,7,6);c.strokeRect(2,-16,7,6);c.beginPath();c.moveTo(-2,-13);c.lineTo(2,-13);c.stroke()}
  if(a.acc==='hair'){c.fillStyle='#42362f';c.beginPath();c.arc(0,-21,10,Math.PI,2*Math.PI);c.fill()}
  if(a.acc==='phone'){c.fillStyle='#303837';c.fillRect(11,4,5,9);c.beginPath();c.moveTo(9,8);c.lineTo(14,9);c.stroke()}
  if(a.acc==='tie'){c.fillStyle='#4d4b70';c.beginPath();c.moveTo(0,5);c.lineTo(-3,12);c.lineTo(0,20);c.lineTo(3,12);c.closePath();c.fill()}
  if(a.fame>18){c.fillStyle='#f4bd3c';c.font='900 10px system-ui';c.fillText('★',10,-25)}
  if(a.event){
    const s=stories[a.event.type];c.fillStyle='#faf4e7';c.strokeStyle='#252a27';c.lineWidth=2;roundRect(c,-15,-53,30,24,9,true,true);c.fillStyle=s.tone;c.font='900 14px system-ui';c.textAlign='center';c.fillText(s.icon,0,-36);c.textAlign='left';
  }
  c.restore();
}
function drawLens(c){
  const x=lens.x-lens.w/2,y=lens.y-lens.h/2,w=lens.w,h=lens.h;
  c.save();c.strokeStyle='#1f2522';c.lineWidth=3;c.setLineDash([8,5]);roundRect(c,x,y,w,h,12,false,true);c.setLineDash([]);
  c.fillStyle='#1f2522';
  const L=17,T=3;[[x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]].forEach(([cx,cy,sx,sy])=>{c.fillRect(cx+(sx<0?-L:0),cy+(sy<0?-T:0),L,T);c.fillRect(cx+(sx<0?-T:0),cy+(sy<0?-L:0),T,L)});
  c.beginPath();c.arc(lens.x,lens.y,3,0,6.28);c.fill();c.restore();
}
function render(){ctx.clearRect(0,0,W,H);drawWorld(ctx,false)}
let last=performance.now();
function loop(now){const dt=Math.min(.033,(now-last)/1000);last=now;update(dt);render();requestAnimationFrame(loop)}

function canvasPoint(e){const r=canvas.getBoundingClientRect();const t=e.touches?e.touches[0]:e;return{x:(t.clientX-r.left)/r.width*W,y:(t.clientY-r.top)/r.height*H}}
function moveLens(e){e.preventDefault();const p=canvasPoint(e);pointer.x=p.x;pointer.y=p.y;lens.x=clamp(p.x,lens.w/2+4,W-lens.w/2-4);lens.y=clamp(p.y,lens.h/2+4,H-lens.h/2-4);hint.classList.add('hide')}
canvas.addEventListener('pointerdown',e=>{pointer.active=true;moveLens(e)});canvas.addEventListener('pointermove',e=>{if(pointer.active)moveLens(e)});window.addEventListener('pointerup',()=>pointer.active=false);
canvas.addEventListener('touchstart',moveLens,{passive:false});canvas.addEventListener('touchmove',moveLens,{passive:false});

function getSubjects(){return agents.filter(a=>Math.abs(a.x-lens.x)<lens.w*.43 && Math.abs(a.y-lens.y)<lens.h*.38)}
function getStory(subjects){const events=subjects.filter(a=>a.event);if(events.length)return events.sort((a,b)=>b.event.life-a.event.life)[0].event.type;return null}
function capture(){
  if(world.paused)return;
  const subjects=getSubjects(); if(!subjects.length){showToast('Nothing interesting in frame');return}
  flash.classList.remove('go');void flash.offsetWidth;flash.classList.add('go');
  world.shots++;shotCountEl.textContent=world.shots;
  const type=getStory(subjects);
  makePhoto();
  setTimeout(()=>openEditor(type,subjects),100);
}
function makePhoto(){
  pctx.save();pctx.clearRect(0,0,photo.width,photo.height);
  const sx=lens.x-lens.w/2, sy=lens.y-lens.h/2;
  pctx.scale(photo.width/lens.w,photo.height/lens.h);pctx.translate(-sx,-sy);drawWorld(pctx,true);pctx.restore();
}
function openEditor(type,subjects){
  world.paused=true;editor.classList.remove('hidden');
  const actual=type || 'ordinary';
  eventSummary.textContent=type?stories[type].summary:'You photographed an ordinary moment. Make it a story—or leave it alone.';
  const opts=type?stories[type].headlines:[
    {text:'Just another day in the city',sub:'calm +1',calm:1,trust:1,hype:0,fame:0},
    {text:'Something feels OFF here',sub:'hype +5  •  trust -2',calm:-2,trust:-2,hype:5,fame:2},
    {text:'The photo everyone is talking about',sub:'hype +7',calm:-2,trust:-1,hype:7,fame:3}
  ];
  optionsEl.innerHTML='';
  opts.forEach(o=>{const b=document.createElement('button');b.className='headline';b.innerHTML=`<strong>${o.text}</strong><span>${o.sub}</span>`;b.onclick=()=>publish(o,subjects,actual);optionsEl.appendChild(b)});
}
function publish(o,subjects,type){
  world.calm=clamp(world.calm+o.calm,0,100);world.trust=clamp(world.trust+o.trust,0,100);world.hype=clamp(world.hype+o.hype,0,100);
  subjects.forEach(a=>{a.fame=clamp(a.fame+o.fame*3,0,100);a.attention=clamp(a.attention+o.fame*.035,0,1);if(o.calm<-5)a.mood='angry';if(o.calm>4)a.mood='happy'});
  world.trend= type==='ordinary'?'mystery':stories[type].label; trendText.textContent=world.trend;
  updateHud();spawnReaction(subjects,o);closeEditor();showToast(o.hype>=8?'It’s spreading fast…':'Posted. The city noticed.');
}
function closeEditor(){editor.classList.add('hidden');world.paused=false}
skipBtn.addEventListener('click',()=>{closeEditor();world.trust=clamp(world.trust+1,0,100);updateHud();showToast('Sometimes not posting is a choice.')});
function updateHud(){calmValue.textContent=Math.round(world.calm);trustValue.textContent=Math.round(world.trust);hypeValue.textContent=Math.round(world.hype)}
function spawnReaction(subjects,o){for(const a of subjects){for(let i=0;i<4;i++)particles.push({x:a.x+rand(-10,10),y:a.y-28,vx:rand(-13,13),vy:rand(-35,-15),life:rand(.7,1.2),char:o.hype>8?'★':o.calm>3?'♥':'!',color:o.hype>8?'#d99134':o.calm>3?'#588b70':'#d1584b'})}}
let toastTimer;function showToast(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),1500)}
captureBtn.addEventListener('click',capture);window.addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();capture()}});
document.getElementById('soundBtn').addEventListener('click',e=>{e.currentTarget.textContent=e.currentTarget.textContent==='♪'?'×':'♪';showToast('Prototype audio toggle')});
window.addEventListener('resize',resize);resize();updateHud();requestAnimationFrame(loop);
})();
