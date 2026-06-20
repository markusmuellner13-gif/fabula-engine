// Game runtime generator.
//
// Produces a single self-contained HTML document for a project. 2D blueprints
// use the built-in vanilla-canvas mini-engine (no external dependencies, so a
// "Run" build works fully offline as its own window). The 3D blueprint pulls
// Three.js from a CDN.
//
// The same output is used for (a) the live preview iframe in the editor and
// (b) the standalone window opened by the Run button.

import type { BlueprintId } from "./genres";

export interface GameProject {
  id: string;
  title: string;
  blueprint: BlueprintId;
  dimension: "2D" | "3D";
  palette: { bg: string; primary: string; secondary: string; accent: string; text: string };
  // free-form tuning the AI assistant / user can set
  config: Record<string, unknown>;
}

export function buildGameHTML(p: GameProject): string {
  const cfg = JSON.stringify({
    title: p.title,
    blueprint: p.blueprint,
    dimension: p.dimension,
    palette: p.palette,
    config: p.config || {},
  });

  const engine = p.dimension === "3D" ? THREE_ENGINE : CANVAS_ENGINE;
  const head = p.dimension === "3D"
    ? `<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"}}</script>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escapeHtml(p.title)}</title>
${head}
<style>
  html,body{margin:0;height:100%;background:${p.palette.bg};overflow:hidden;font-family:system-ui,sans-serif;}
  #stage{position:fixed;inset:0;display:block;}
  #hud{position:fixed;inset:0;pointer-events:none;color:${p.palette.text};}
  .center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:14px;}
  .panel{pointer-events:auto;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);padding:28px 34px;border-radius:18px;border:1px solid ${p.palette.accent}55;max-width:520px;}
  h1{margin:0;font-size:34px;letter-spacing:.5px;text-shadow:0 4px 24px ${p.palette.primary}88;}
  p{opacity:.85;margin:6px 0;line-height:1.5;}
  button{pointer-events:auto;cursor:pointer;border:none;border-radius:12px;padding:12px 26px;font-size:16px;font-weight:700;
    background:linear-gradient(135deg,${p.palette.primary},${p.palette.accent});color:#fff;box-shadow:0 8px 30px ${p.palette.primary}66;}
  button:active{transform:translateY(1px);}
  #score{position:fixed;top:14px;left:16px;font-weight:800;font-size:18px;text-shadow:0 2px 8px #000;}
  #hint{position:fixed;bottom:12px;width:100%;text-align:center;font-size:13px;opacity:.6;}
  .hidden{display:none!important;}
</style>
</head>
<body>
<canvas id="stage"></canvas>
<div id="hud">
  <div id="score" class="hidden"></div>
  <div id="hint"></div>
  <div id="overlay" class="center">
    <div class="panel">
      <h1 id="ovTitle">${escapeHtml(p.title)}</h1>
      <p id="ovText">Made with Fabula Engine</p>
      <button id="ovBtn">▶ Play</button>
    </div>
  </div>
</div>
<script>window.GAME = ${cfg};</script>
<script type="module">${engine}</script>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
}

// ---------------------------------------------------------------------------
// 2D vanilla-canvas engine. One file, switches on GAME.blueprint.
// ---------------------------------------------------------------------------
const CANVAS_ENGINE = String.raw`
const G = window.GAME, P = G.palette, C = G.config||{};
const cv = document.getElementById('stage'), ctx = cv.getContext('2d');
const overlay = document.getElementById('overlay');
const ovTitle = document.getElementById('ovTitle'), ovText = document.getElementById('ovText'), ovBtn = document.getElementById('ovBtn');
const scoreEl = document.getElementById('score'), hintEl = document.getElementById('hint');
let W=0,H=0,DPR=Math.min(2,window.devicePixelRatio||1);
function resize(){W=cv.clientWidth=innerWidth;H=cv.clientHeight=innerHeight;cv.width=W*DPR;cv.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);}
addEventListener('resize',resize);resize();

const keys={};
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase()))e.preventDefault();});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;});
const pointer={x:0,y:0,down:false};
addEventListener('pointermove',e=>{pointer.x=e.clientX;pointer.y=e.clientY;});
addEventListener('pointerdown',e=>{pointer.down=true;pointer.x=e.clientX;pointer.y=e.clientY;});
addEventListener('pointerup',()=>pointer.down=false);

let state='menu', score=0, blueprint=G.blueprint, game=null;
function setScore(v){score=v;scoreEl.textContent='Score '+score;}
function showScore(on){scoreEl.classList.toggle('hidden',!on);}

const HINTS={
  platformer:'← → move • Space / ↑ jump • reach the glowing goal',
  topdown:'WASD / arrows move • collect the orbs • dodge the hunters',
  shooter:'← → move • Space fire • survive the waves',
  runner:'Space / ↑ to jump • how far can you go?',
  puzzle:'Click two tiles to match every pair',
  story:'Click a choice to shape your story',
  horror:'WASD move • find the 3 keys • do not let it reach you',
  racer:'↑ accelerate • ← → steer • complete 3 laps',
  scene3d:'WASD move • mouse look'
};

function start(){overlay.classList.add('hidden');state='play';showScore(blueprint!=='story');hintEl.textContent=HINTS[blueprint]||'';game.reset&&game.reset();}
function end(msg){state='over';overlay.classList.remove('hidden');ovTitle.textContent=msg;ovText.textContent='Final score: '+score;ovBtn.textContent='↻ Play again';}
function win(msg){state='over';overlay.classList.remove('hidden');ovTitle.textContent=msg||'You win!';ovText.textContent='Score: '+score;ovBtn.textContent='↻ Play again';}
ovBtn.onclick=()=>{setScore(0);start();};
ovText.textContent=G.title;

// shared helpers
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h);}
function circle(x,y,r,c){ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();}
function clamp(v,a,b){return v<a?a:v>b?b:v;}
function aabb(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}

// ======================= BLUEPRINTS =======================
function makePlatformer(){
  let plr,plat,coins,goal,vy,onGround;
  function reset(){
    plr={x:60,y:0,w:26,h:34};vy=0;onGround=false;
    plat=[{x:0,y:H-40,w:W,h:40},{x:160,y:H-150,w:140,h:18},{x:380,y:H-240,w:140,h:18},{x:600,y:H-330,w:160,h:18},{x:300,y:H-420,w:120,h:18}];
    coins=plat.slice(1).map(p=>({x:p.x+p.w/2-8,y:p.y-26,w:16,h:16,got:false}));
    goal={x:330,y:H-460,w:34,h:40};plr.y=plat[0].y-plr.h;setScore(0);
  }
  function update(){
    const sp=3.2;if(keys['arrowleft']||keys['a'])plr.x-=sp;if(keys['arrowright']||keys['d'])plr.x+=sp;
    if((keys[' ']||keys['arrowup']||keys['w'])&&onGround){vy=-11;onGround=false;}
    vy+=0.5;plr.y+=vy;onGround=false;plr.x=clamp(plr.x,0,W-plr.w);
    for(const p of plat){if(aabb(plr,p)&&vy>=0&&plr.y+plr.h-vy<=p.y+10){plr.y=p.y-plr.h;vy=0;onGround=true;}}
    if(plr.y>H+200){end('You fell!');}
    for(const c of coins){if(!c.got&&aabb(plr,c)){c.got=true;setScore(score+10);}}
    if(aabb(plr,goal)){win('Level clear!');}
  }
  function draw(){
    for(let i=0;i<6;i++)circle((i*180+80),120+(i%2)*40,40,P.secondary+'33');
    for(const p of plat)rect(p.x,p.y,p.w,p.h,P.secondary);
    for(const c of coins)if(!c.got)circle(c.x+8,c.y+8,8,P.accent);
    const t=Date.now()/200;ctx.fillStyle=P.accent;ctx.fillRect(goal.x,goal.y-Math.sin(t)*4,goal.w,goal.h);
    ctx.strokeStyle=P.text;ctx.strokeRect(goal.x,goal.y,goal.w,goal.h);
    rect(plr.x,plr.y,plr.w,plr.h,P.primary);
  }
  return {reset,update,draw};
}

function makeShooter(){
  let plr,bul,foes,t,cd;
  function reset(){plr={x:W/2-18,y:H-70,w:36,h:30};bul=[];foes=[];t=0;cd=0;setScore(0);}
  function update(){
    const sp=5;if(keys['arrowleft']||keys['a'])plr.x-=sp;if(keys['arrowright']||keys['d'])plr.x+=sp;plr.x=clamp(plr.x,0,W-plr.w);
    cd--;if((keys[' ']||pointer.down)&&cd<=0){bul.push({x:plr.x+plr.w/2-3,y:plr.y,w:6,h:14});cd=10;}
    bul.forEach(b=>b.y-=9);bul=bul.filter(b=>b.y>-20);
    t++;if(t%Math.max(22,70-Math.floor(score/50))===0)foes.push({x:Math.random()*(W-40),y:-30,w:34,h:28,vy:1.6+Math.random()*1.4});
    foes.forEach(f=>f.y+=f.vy);
    for(const f of foes){for(const b of bul){if(aabb(f,b)){f.dead=true;b.y=-99;setScore(score+10);}}if(aabb(f,plr)||f.y>H)return end('Ship down!');}
    foes=foes.filter(f=>!f.dead&&f.y<=H);
  }
  function draw(){
    for(let i=0;i<40;i++){const y=((t*2+i*60)%(H+40));circle((i*97%W),y,1.5,P.text+'66');}
    ctx.fillStyle=P.primary;ctx.beginPath();ctx.moveTo(plr.x+plr.w/2,plr.y);ctx.lineTo(plr.x,plr.y+plr.h);ctx.lineTo(plr.x+plr.w,plr.y+plr.h);ctx.fill();
    bul.forEach(b=>rect(b.x,b.y,b.w,b.h,P.accent));
    foes.forEach(f=>{ctx.fillStyle=P.secondary;ctx.fillRect(f.x,f.y,f.w,f.h);circle(f.x+f.w/2,f.y+f.h/2,5,P.accent);});
  }
  return {reset,update,draw};
}

function makeRunner(){
  let plr,obs,vy,onG,spd,t;
  function reset(){plr={x:80,y:0,w:30,h:38};vy=0;onG=true;obs=[];spd=5;t=0;setScore(0);plr.y=H-40-plr.h;}
  function update(){
    spd+=0.0015;t++;vy+=0.6;plr.y+=vy;const fl=H-40-plr.h;
    if(plr.y>=fl){plr.y=fl;vy=0;onG=true;}
    if((keys[' ']||keys['arrowup']||keys['w']||pointer.down)&&onG){vy=-12;onG=false;}
    if(t%Math.max(40,90-spd*4|0)===0)obs.push({x:W+20,y:H-40-(20+Math.random()*30),w:18+Math.random()*16,h:20+Math.random()*30});
    obs.forEach(o=>o.x-=spd);obs=obs.filter(o=>o.x>-40);
    for(const o of obs){if(aabb(plr,o))return end('Crashed!');if(!o.scored&&o.x+o.w<plr.x){o.scored=true;setScore(score+5);}}
  }
  function draw(){
    rect(0,H-40,W,40,P.secondary);
    for(let i=0;i<W/40;i++)rect(i*40+(t*spd%40)*-1+40,H-40,20,6,P.bg);
    rect(plr.x,plr.y,plr.w,plr.h,P.primary);
    obs.forEach(o=>rect(o.x,o.y,o.w,o.h,P.accent));
  }
  return {reset,update,draw};
}

function makeTopdown(){
  let plr,orbs,foes,t;
  function reset(){plr={x:W/2,y:H/2,w:26,h:26};orbs=[];foes=[];t=0;setScore(0);
    for(let i=0;i<8;i++)orbs.push({x:40+Math.random()*(W-80),y:40+Math.random()*(H-80),w:16,h:16});
    for(let i=0;i<3;i++)foes.push({x:Math.random()*W,y:Math.random()*H,w:24,h:24,vx:0,vy:0});}
  function update(){
    const sp=3.4;if(keys['a']||keys['arrowleft'])plr.x-=sp;if(keys['d']||keys['arrowright'])plr.x+=sp;
    if(keys['w']||keys['arrowup'])plr.y-=sp;if(keys['s']||keys['arrowdown'])plr.y+=sp;
    plr.x=clamp(plr.x,0,W-plr.w);plr.y=clamp(plr.y,0,H-plr.h);t++;
    foes.forEach(f=>{const dx=plr.x-f.x,dy=plr.y-f.y,d=Math.hypot(dx,dy)||1;f.x+=dx/d*1.5;f.y+=dy/d*1.5;if(aabb(plr,f))end('Caught!');});
    orbs=orbs.filter(o=>{if(aabb(plr,o)){setScore(score+10);return false;}return true;});
    if(orbs.length===0)win('All orbs collected!');
  }
  function draw(){
    ctx.fillStyle=P.bg;ctx.fillRect(0,0,W,H);
    for(let x=0;x<W;x+=44){for(let y=0;y<H;y+=44)rect(x,y,42,42,(x+y)%88?P.secondary+'18':P.secondary+'28');}
    orbs.forEach(o=>circle(o.x+8,o.y+8,8,P.accent));
    foes.forEach(f=>{rect(f.x,f.y,f.w,f.h,P.primary);});
    rect(plr.x,plr.y,plr.w,plr.h,P.accent);ctx.strokeStyle=P.text;ctx.strokeRect(plr.x,plr.y,plr.w,plr.h);
  }
  return {reset,update,draw};
}

function makeHorror(){
  let plr,keysItems,monster,t;
  function reset(){plr={x:W/2,y:H/2,w:24,h:24};t=0;setScore(0);
    keysItems=[];for(let i=0;i<3;i++)keysItems.push({x:60+Math.random()*(W-120),y:60+Math.random()*(H-120),w:18,h:18});
    monster={x:50,y:50,w:30,h:30};}
  function update(){
    const sp=3;if(keys['a']||keys['arrowleft'])plr.x-=sp;if(keys['d']||keys['arrowright'])plr.x+=sp;
    if(keys['w']||keys['arrowup'])plr.y-=sp;if(keys['s']||keys['arrowdown'])plr.y+=sp;
    plr.x=clamp(plr.x,0,W-plr.w);plr.y=clamp(plr.y,0,H-plr.h);t++;
    const dx=plr.x-monster.x,dy=plr.y-monster.y,d=Math.hypot(dx,dy)||1;const ms=1.1+score*0.04;
    monster.x+=dx/d*ms;monster.y+=dy/d*ms;if(aabb(plr,monster))return end('It found you.');
    keysItems=keysItems.filter(k=>{if(aabb(plr,k)){setScore(score+1);return false;}return true;});
    if(keysItems.length===0)win('You escaped.');
  }
  function draw(){
    ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
    const grd=ctx.createRadialGradient(plr.x+12,plr.y+12,10,plr.x+12,plr.y+12,170);
    grd.addColorStop(0,P.text+'22');grd.addColorStop(1,'#00000000');
    keysItems.forEach(k=>circle(k.x+9,k.y+9,9,P.accent));
    rect(plr.x,plr.y,plr.w,plr.h,P.primary);
    const md=Math.hypot(plr.x-monster.x,plr.y-monster.y);
    if(md<200){ctx.globalAlpha=clamp(1-md/200,0,1);rect(monster.x,monster.y,monster.w,monster.h,P.accent);ctx.globalAlpha=1;}
    ctx.fillStyle=grd;ctx.fillRect(0,0,W,H);
    scoreEl.textContent='Keys '+score+'/3';
  }
  return {reset,update,draw};
}

function makeRacer(){
  let car,ang,spd,checkpoints,lap,t;
  const track={cx:0,cy:0,rx:0,ry:0};
  function reset(){track.cx=W/2;track.cy=H/2;track.rx=Math.min(W,H)*0.32;track.ry=Math.min(W,H)*0.22;
    car={x:track.cx,y:track.cy+track.ry};ang=-Math.PI/2;spd=0;lap=0;t=0;setScore(0);}
  function update(){
    if(keys['arrowup']||keys['w'])spd+=0.15;else spd*=0.96;if(keys['arrowdown']||keys['s'])spd-=0.12;
    spd=clamp(spd,-3,6);if(keys['arrowleft']||keys['a'])ang-=0.045*(spd/6);if(keys['arrowright']||keys['d'])ang+=0.045*(spd/6);
    car.x+=Math.cos(ang)*spd;car.y+=Math.sin(ang)*spd;t++;
    const dx=(car.x-track.cx)/track.rx,dy=(car.y-track.cy)/track.ry,r=Math.hypot(dx,dy);
    if(r<0.55||r>1.45)spd*=0.8; // off track friction
    const a=Math.atan2(car.y-track.cy,car.x-track.cx);
    if(a>1.4&&a<1.7&&!car.gate){car.gate=true;lap++;setScore(lap);if(lap>=3)return win('Race won! 3 laps');}
    if(a<1.0)car.gate=false;
  }
  function draw(){
    ctx.fillStyle=P.bg;ctx.fillRect(0,0,W,H);
    ctx.lineWidth=track.rx*0.9;ctx.strokeStyle=P.secondary;ctx.beginPath();ctx.ellipse(track.cx,track.cy,track.rx,track.ry,0,0,7);ctx.stroke();
    ctx.lineWidth=4;ctx.setLineDash([14,14]);ctx.strokeStyle=P.text+'66';ctx.beginPath();ctx.ellipse(track.cx,track.cy,track.rx,track.ry,0,0,7);ctx.stroke();ctx.setLineDash([]);
    ctx.save();ctx.translate(car.x,car.y);ctx.rotate(ang);rect(-14,-9,28,18,P.primary);rect(6,-9,8,18,P.accent);ctx.restore();
    scoreEl.textContent='Lap '+Math.min(lap,3)+'/3';
  }
  return {reset,update,draw};
}

function makePuzzle(){
  let cells,first,matched,t;
  const cols=4,rows=4;const icons=['◆','★','●','▲','■','✦','♥','◐'];
  function reset(){const pairs=[];for(let i=0;i<cols*rows/2;i++){pairs.push(i,i);}pairs.sort(()=>Math.random()-0.5);
    cells=pairs.map((v,i)=>({v,i,up:false,done:false}));first=null;matched=0;t=0;setScore(0);}
  function geo(){const m=20,s=Math.min((W-m*2)/cols,(H-m*2)/rows,140);const ox=(W-s*cols)/2,oy=(H-s*rows)/2;return {s,ox,oy};}
  function update(){
    if(pointer.down&&!pointer.lock){pointer.lock=true;const {s,ox,oy}=geo();
      const cx=Math.floor((pointer.x-ox)/s),cy=Math.floor((pointer.y-oy)/s);
      if(cx>=0&&cx<cols&&cy>=0&&cy<rows){const idx=cy*cols+cx,c=cells[idx];
        if(!c.done&&!c.up){c.up=true;if(!first)first=c;else{if(first.v===c.v){first.done=c.done=true;matched+=2;setScore(score+10);first=null;
          if(matched===cells.length)win('Solved!');}else{const a=first,b=c;setTimeout(()=>{a.up=b.up=false;},500);first=null;}}}}}
    if(!pointer.down)pointer.lock=false;
  }
  function draw(){ctx.fillStyle=P.bg;ctx.fillRect(0,0,W,H);const {s,ox,oy}=geo();ctx.textAlign='center';ctx.textBaseline='middle';
    cells.forEach((c,i)=>{const x=ox+(i%cols)*s,y=oy+Math.floor(i/cols)*s;
      rect(x+4,y+4,s-8,s-8,c.done?P.secondary+'55':c.up?P.primary:P.secondary);
      if(c.up||c.done){ctx.fillStyle=P.text;ctx.font=(s*0.5)+'px sans-serif';ctx.fillText(icons[c.v],x+s/2,y+s/2);}});}
  return {reset,update,draw};
}

function makeStory(){
  const nodes=C.story||{
    start:{text:'You wake at the edge of a quiet forest. A path splits ahead.',choices:[['Take the dark trail','cave'],['Follow the sunlit road','town']]},
    cave:{text:'The cave glitters with strange crystals. Something breathes in the dark.',choices:[['Grab a crystal and run','treasure'],['Speak to the dark','voice']]},
    town:{text:'A warm village welcomes you. The mayor needs a hero.',choices:[['Accept the quest','treasure'],['Rest at the inn','end_rest']]},
    voice:{text:'"Brave one," it rumbles, "few speak to me." It grants you a gift.',choices:[['Accept','treasure']]},
    treasure:{text:'You find the legendary Ember Stone. Your tale will be sung for ages.',choices:[['The End','__win']]},
    end_rest:{text:'You sleep soundly and dream of other adventures.',choices:[['The End','__win']]}
  };
  let cur='start';
  function reset(){cur='start';render();}
  function render(){const n=nodes[cur];overlay.classList.remove('hidden');ovTitle.textContent=G.title;
    ovText.textContent=n.text;ovBtn.classList.add('hidden');
    let box=document.getElementById('choices');if(box)box.remove();
    box=document.createElement('div');box.id='choices';box.style.display='flex';box.style.flexDirection='column';box.style.gap='10px';box.style.marginTop='12px';
    n.choices.forEach(([label,to])=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>{
      if(to==='__win'){box.remove();ovBtn.classList.remove('hidden');win('Story complete');return;}cur=to;render();};box.appendChild(b);});
    overlay.querySelector('.panel').appendChild(box);}
  function update(){}function draw(){ctx.fillStyle=P.bg;ctx.fillRect(0,0,W,H);}
  return {reset,update,draw,isStory:true};
}

const FACTORY={platformer:makePlatformer,shooter:makeShooter,runner:makeRunner,topdown:makeTopdown,horror:makeHorror,racer:makeRacer,puzzle:makePuzzle,story:makeStory};
game=(FACTORY[blueprint]||makePlatformer)();

ovText.textContent=G.title;
if(game.isStory){ovBtn.textContent='▶ Begin';ovBtn.onclick=()=>{overlay.classList.add('hidden');state='play';game.reset();};}
else ovBtn.onclick=()=>{setScore(0);start();};

function loop(){
  if(state==='play'){game.update();}
  ctx.clearRect(0,0,W,H);
  if(state!=='menu'||game.isStory){game.draw();}
  else{ctx.fillStyle=P.bg;ctx.fillRect(0,0,W,H);}
  requestAnimationFrame(loop);
}
loop();
`;

// ---------------------------------------------------------------------------
// 3D walkable scene (Three.js). Minimal first-person sandbox.
// ---------------------------------------------------------------------------
const THREE_ENGINE = String.raw`
import * as THREE from 'three';
const G=window.GAME,P=G.palette;
const overlay=document.getElementById('overlay'),ovBtn=document.getElementById('ovBtn'),hintEl=document.getElementById('hint');
ovBtn.textContent='▶ Enter world';
const renderer=new THREE.WebGLRenderer({canvas:document.getElementById('stage'),antialias:true});
renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(2,devicePixelRatio));
const scene=new THREE.Scene();scene.background=new THREE.Color(P.bg);scene.fog=new THREE.Fog(P.bg,20,90);
const cam=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,0.1,500);cam.position.set(0,1.7,6);
addEventListener('resize',()=>{cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
scene.add(new THREE.HemisphereLight(0xffffff,0x223355,0.9));
const sun=new THREE.DirectionalLight(new THREE.Color(P.accent),1.1);sun.position.set(10,20,10);scene.add(sun);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:new THREE.Color(P.secondary)}));
floor.rotation.x=-Math.PI/2;scene.add(floor);
const pri=new THREE.MeshStandardMaterial({color:new THREE.Color(P.primary)});
const acc=new THREE.MeshStandardMaterial({color:new THREE.Color(P.accent)});
for(let i=0;i<60;i++){const s=1+Math.random()*4;const m=new THREE.Mesh(new THREE.BoxGeometry(s,s*2,s),Math.random()<0.5?pri:acc);
  m.position.set((Math.random()-0.5)*120,s,(Math.random()-0.5)*120);if(m.position.length()>6)scene.add(m);}
const spinner=new THREE.Mesh(new THREE.TorusKnotGeometry(1.4,0.45,120,16),acc);spinner.position.set(0,3,-10);scene.add(spinner);
let yaw=0,pitch=0,locked=false;const keys={};
addEventListener('keydown',e=>keys[e.key.toLowerCase()]=true);addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
document.addEventListener('mousemove',e=>{if(!locked)return;yaw-=e.movementX*0.0025;pitch=Math.max(-1.2,Math.min(1.2,pitch-e.movementY*0.0025));});
function enter(){overlay.classList.add('hidden');hintEl.textContent='WASD move • mouse look • Esc to release cursor';renderer.domElement.requestPointerLock();}
ovBtn.onclick=enter;document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===renderer.domElement;});
const dir=new THREE.Vector3();
function loop(){requestAnimationFrame(loop);spinner.rotation.x+=0.01;spinner.rotation.y+=0.013;
  cam.rotation.order='YXZ';cam.rotation.y=yaw;cam.rotation.x=pitch;
  const sp=0.18;dir.set(0,0,0);if(keys['w'])dir.z-=1;if(keys['s'])dir.z+=1;if(keys['a'])dir.x-=1;if(keys['d'])dir.x+=1;
  dir.normalize().applyEuler(new THREE.Euler(0,yaw,0));cam.position.addScaledVector(dir,sp);cam.position.y=1.7;
  renderer.render(scene,cam);}
loop();
`;
