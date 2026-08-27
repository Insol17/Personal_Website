/* V43 — corrected Yellowtail liquid WORLDS, direct rail controls, robust return path. */

// Keep BACKGROUND as evidence, without competing commentary/index text.
renderBackground = function(bg){
  const root=document.querySelector('#backgroundGroups');if(!root)return;
  const edu=Array.isArray(bg?.education)?bg.education:[];
  const exp=Array.isArray(bg?.experience)?bg.experience:[];
  const awards=Array.isArray(bg?.awards)?bg.awards:[];
  const eduHtml=edu.length?`<aside class="background-v43-education"><div class="background-v43-label">EDUCATION</div>${edu.map(item=>`<article class="background-v43-edu"><time>${esc(item.date||'')}</time><strong>${esc(item.title||'')}</strong>${item.detail?`<p>${esc(item.detail)}</p>`:''}</article>`).join('')}</aside>`:'<aside></aside>';
  const entries=exp.map(item=>`<article class="background-v43-entry"><time>${esc(item.date||'—')}</time><strong>${esc(item.title||'')}</strong>${item.status?`<span class="status">${esc(item.status)}</span>`:''}${item.detail?`<p>${esc(item.detail)}</p>`:''}</article>`).join('');
  const awardsHtml=awards.length?`<section class="background-v43-awards"><div class="background-v43-label">COMPETITION / AWARDS</div><div class="background-v43-awards-list">${awards.map(item=>`<article class="background-v43-edu"><time>${esc(item.date||'')}</time><strong>${esc(item.title||'')}</strong>${item.detail?`<p>${esc(item.detail)}</p>`:''}</article>`).join('')}</div></section>`:'';
  root.innerHTML=`<div class="background-v43-layout">${eduHtml}<div class="background-v43-track">${entries}</div>${awardsHtml}</div>`;
  document.querySelector('.background-head>p')?.remove();
  requestAnimationFrame(v43BindBackgroundTrack);
};

function v43BindBackgroundTrack(){
  const section=document.querySelector('#background'),track=section?.querySelector('.background-v43-track');if(!section||!track)return;
  let raf=0;const update=()=>{raf=0;const r=track.getBoundingClientRect(),vh=Math.max(1,innerHeight);const start=vh*.72,end=vh*.26;const total=Math.max(1,r.height+(start-end));const p=Math.max(0,Math.min(1,(start-r.top)/total));track.style.setProperty('--track-progress',p.toFixed(4))};
  const queue=()=>{if(!raf)raf=requestAnimationFrame(update)};addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue,{passive:true});update();
}

// WORKS — card drag, arrows and a genuinely direct scrollbar thumb.
bindDragRail = function(stage,rail,legacyProgress){
  if(!stage||!rail)return null;
  const coarse=matchMedia('(max-width:760px), (pointer:coarse)').matches;
  let nav=stage.parentElement?.querySelector('.works-nav-v42');
  if(!nav){
    nav=document.createElement('div');nav.className='works-nav-v42';
    nav.innerHTML='<span class="works-nav-label">DRAG / BAR / ARROWS</span><button class="works-arrow-v42 works-prev-v42" type="button" aria-label="이전 프로젝트">←</button><div class="works-range-v42"><button class="works-range-thumb-v42" type="button" aria-label="프로젝트 위치 조절" role="slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></button></div><button class="works-arrow-v42 works-next-v42" type="button" aria-label="다음 프로젝트">→</button>';
    stage.insertAdjacentElement('afterend',nav);
  }
  const prev=nav.querySelector('.works-prev-v42'),next=nav.querySelector('.works-next-v42'),range=nav.querySelector('.works-range-v42'),thumb=nav.querySelector('.works-range-thumb-v42');
  let locked=false,x=0,max=0,cardStep=260,pointerDown=false,dragging=false,startPointer=0,startX=0,activePointer=null,suppressClickUntil=0;
  let thumbDown=false,thumbPointer=null,thumbStartPointer=0,thumbStartLeft=0,thumbTravel=0;
  const threshold=7,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const maxScroll=()=>coarse?Math.max(0,stage.scrollWidth-stage.clientWidth):max;
  const ratio=()=>{const m=maxScroll();return m?clamp((coarse?stage.scrollLeft:Math.abs(x))/m,0,1):0};
  const thumbGeometry=()=>{const total=coarse?stage.scrollWidth:stage.clientWidth+max,viewport=stage.clientWidth,rw=Math.max(1,range.clientWidth);const frac=total?clamp(viewport/total,.12,1):1;const tw=Math.max(54,rw*frac);return{width:Math.min(rw,tw),travel:Math.max(0,rw-Math.min(rw,tw))}};
  const paintControls=()=>{const r=ratio(),g=thumbGeometry();thumb.style.width=`${g.width}px`;thumb.style.left=`${g.travel*r}px`;thumb.setAttribute('aria-valuenow',String(Math.round(r*100)));prev.classList.toggle('is-hidden',r<=.001);next.classList.toggle('is-hidden',r>=.999||maxScroll()<=1);if(legacyProgress){legacyProgress.dataset.progress=String(r)}stage.dataset.dragProgress=String(r)};
  const draw=()=>{if(!coarse)rail.style.transform=`translate3d(${x}px,0,0)`;paintControls()};
  const moveRatio=(r,animate=false)=>{r=clamp(r,0,1);if(coarse){stage.scrollTo({left:maxScroll()*r,behavior:animate?'smooth':'auto'});paintControls()}else{x=-max*r;rail.classList.toggle('is-settling',animate);draw();clearTimeout(moveRatio.t);if(animate)moveRatio.t=setTimeout(()=>rail.classList.remove('is-settling'),220)}};
  const metrics=()=>{if(locked)return;const cards=[...rail.children],gap=parseFloat(getComputedStyle(rail).gap||'12')||12,w=stage.clientWidth;if(coarse){rail.style.transform='none';rail.style.width='max-content';const first=rail.querySelector('.project-card');cardStep=(first?.getBoundingClientRect().width||260)+gap;requestAnimationFrame(paintControls);return}const visible=w>=1180?5:w>=820?3:2,cw=(w-gap*(visible-1))/visible;cards.forEach(c=>c.style.width=`${cw}px`);cardStep=cw+gap;const total=cards.length?cards.length*cw+(cards.length-1)*gap:0;rail.style.width=`${Math.max(w,total)}px`;max=Math.max(0,total-w);x=clamp(x,-max,0);draw();stage.classList.toggle('has-overflow',max>1)};
  const step=dir=>{if(coarse)stage.scrollBy({left:dir*cardStep,behavior:'smooth'});else{x=clamp(x-dir*cardStep,-max,0);rail.classList.add('is-settling');draw();setTimeout(()=>rail.classList.remove('is-settling'),220)}};
  prev.onclick=()=>step(-1);next.onclick=()=>step(1);
  range.addEventListener('pointerdown',e=>{if(e.target===thumb||locked)return;const rr=range.getBoundingClientRect(),g=thumbGeometry();const local=e.clientX-rr.left-g.width/2;moveRatio(g.travel?local/g.travel:0,false)});
  thumb.addEventListener('pointerdown',e=>{if(locked||(e.pointerType==='mouse'&&e.button!==0))return;e.preventDefault();e.stopPropagation();thumbDown=true;thumbPointer=e.pointerId;thumbStartPointer=e.clientX;const g=thumbGeometry();thumbTravel=g.travel;thumbStartLeft=parseFloat(thumb.style.left)||0;try{thumb.setPointerCapture(e.pointerId)}catch{}});
  thumb.addEventListener('pointermove',e=>{if(!thumbDown||e.pointerId!==thumbPointer)return;e.preventDefault();const left=clamp(thumbStartLeft+(e.clientX-thumbStartPointer),0,thumbTravel);thumb.style.left=`${left}px`;const r=thumbTravel?left/thumbTravel:0;if(coarse){stage.scrollLeft=maxScroll()*r}else{x=-max*r;rail.style.transform=`translate3d(${x}px,0,0)`}thumb.setAttribute('aria-valuenow',String(Math.round(r*100)));prev.classList.toggle('is-hidden',r<=.001);next.classList.toggle('is-hidden',r>=.999);stage.dataset.dragProgress=String(r)});
  const thumbUp=e=>{if(!thumbDown||e.pointerId!==thumbPointer)return;thumbDown=false;try{thumb.releasePointerCapture(e.pointerId)}catch{}paintControls()};thumb.addEventListener('pointerup',thumbUp);thumb.addEventListener('pointercancel',thumbUp);
  let scrollRaf=0;const onScroll=()=>{if(scrollRaf)return;scrollRaf=requestAnimationFrame(()=>{scrollRaf=0;if(!thumbDown)paintControls()})};if(coarse)stage.addEventListener('scroll',onScroll,{passive:true});
  const down=e=>{if(coarse||locked||(e.pointerType==='mouse'&&e.button!==0)||e.target.closest('.works-nav-v42'))return;pointerDown=true;dragging=false;activePointer=e.pointerId;startPointer=e.clientX;startX=x};
  const move=e=>{if(coarse||locked||!pointerDown||e.pointerId!==activePointer)return;const dx=e.clientX-startPointer;if(!dragging&&Math.abs(dx)>=threshold){dragging=true;stage.classList.add('is-dragging');try{stage.setPointerCapture(e.pointerId)}catch{}}if(!dragging)return;e.preventDefault();x=clamp(startX+dx,-max,0);draw()};
  const up=e=>{if(coarse||!pointerDown||e.pointerId!==activePointer)return;const was=dragging;pointerDown=false;dragging=false;activePointer=null;stage.classList.remove('is-dragging');try{stage.releasePointerCapture(e.pointerId)}catch{}if(was)suppressClickUntil=performance.now()+180};
  const clickCapture=e=>{if(performance.now()<suppressClickUntil){e.preventDefault();e.stopPropagation()}};
  stage.addEventListener('pointerdown',down);stage.addEventListener('pointermove',move,{passive:false});stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',up);stage.addEventListener('click',clickCapture,true);stage.addEventListener('dragstart',e=>e.preventDefault());
  rail.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();step(1)}else if(e.key==='ArrowLeft'){e.preventDefault();step(-1)}});
  const ro=new ResizeObserver(metrics);ro.observe(stage);ro.observe(range);requestAnimationFrame(metrics);
  return{destroy(){ro.disconnect();if(coarse)stage.removeEventListener('scroll',onScroll);nav.remove()},getIndex(){return Math.round((coarse?stage.scrollLeft:Math.abs(x))/Math.max(1,cardStep))},setIndex(i,animate=false){if(coarse)stage.scrollTo({left:Math.max(0,(Number(i)||0)*cardStep),behavior:animate?'smooth':'auto'});else{x=clamp(-(Number(i)||0)*cardStep,-max,0);draw()}},getX(){return coarse?-stage.scrollLeft:x},setX(value,animate=false){if(coarse)stage.scrollTo({left:Math.max(0,-(Number(value)||0)),behavior:animate?'smooth':'auto'});else{x=clamp(Number(value)||0,-max,0);draw()}requestAnimationFrame(paintControls)},lock(){locked=true;if(coarse)stage.style.overflowX='hidden'},unlock(){locked=false;if(coarse)stage.style.overflowX='auto';metrics()},moveRatio,refresh:metrics};
};

// Forward transition: fast, deterministic, with origin state retained for the return path.
v33NavigateWithTransition = async function(link,image){
  const rect=image.getBoundingClientRect(),src=image.currentSrc||image.src;if(!src||rect.width<2||rect.height<2){location.assign(link.href);return}
  cleanupProjectTransition({releaseBoot:false});warmProjectPage(link);
  const origin=v33OriginState(link,image);v33WriteJSON('portfolioTransitionOriginState',origin);v33WriteJSON('portfolioDetailChain',{origin,entrySlug:origin.slug,currentSlug:origin.slug,currentImage:origin.image,depth:1,at:Date.now()});
  try{sessionStorage.setItem('portfolioTransitionImage',src)}catch{}
  const clone=image.cloneNode(true);clone.removeAttribute('loading');clone.className='transition-clone transition-surface';Object.assign(clone.style,{left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`,borderRadius:getComputedStyle(image).borderRadius||'12px',objectPosition:getComputedStyle(image).objectPosition||'50% 50%'});document.documentElement.classList.add('project-transition-active');document.body.appendChild(clone);await v33NextFrame();
  try{const a=clone.animate([{left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`,borderRadius:getComputedStyle(image).borderRadius||'12px'},{left:'0px',top:'0px',width:'100vw',height:'100vh',borderRadius:'0px'}],{duration:360,easing:'cubic-bezier(.2,.78,.16,1)',fill:'forwards'});await v33WithTimeout(a.finished.catch(()=>{}),430)}catch{}
  Object.assign(clone.style,{left:'0px',top:'0px',width:'100vw',height:'100vh',borderRadius:'0px'});location.assign(link.href);
};

async function v43FindReturnTarget(data){
  document.documentElement.classList.add('is-restoring-project');
  const archive=document.querySelector('#archiveGrid');const works=document.querySelector('#worksStage');const wantsArchive=data?.surface==='archive'&&archive;
  const scope=wantsArchive?archive:(works||document);const slug=String(data?.slug||'');const safe=window.CSS?.escape?CSS.escape(slug):slug.replace(/[^a-zA-Z0-9_-]/g,'');
  let link=null;for(let i=0;i<70&&!link;i++){link=scope.querySelector?.(`.project-transition-link[data-project="${safe}"]`)||null;if(!link)await v33Wait(25)}if(!link)return null;
  const targetSection=wantsArchive?document.querySelector('.archive-main'):document.querySelector('#portfolio');
  const restoreRail=()=>{if(!wantsArchive&&Number.isFinite(data?.railX)&&data?.useOriginScroll!==false&&dragController?.setX)dragController.setX(data.railX,false)};
  restoreRail();
  let desiredY=null;if(data?.useOriginScroll!==false&&Number.isFinite(data?.scrollY))desiredY=data.scrollY;
  if(!Number.isFinite(desiredY)&&targetSection)desiredY=Math.max(0,targetSection.offsetTop+(wantsArchive?0:20));
  if(Number.isFinite(desiredY))scrollTo({top:desiredY,left:0,behavior:'auto'});
  for(let i=0;i<4;i++){restoreRail();await v33NextFrame()}
  const image=link.querySelector('.project-card-image');if(!image)return null;try{if(!image.complete)await v33WithTimeout(new Promise(r=>{image.addEventListener('load',r,{once:true});image.addEventListener('error',r,{once:true})}),700);await v33WithTimeout(image.decode?.()||Promise.resolve(),300)}catch{}
  // Current detail may differ from the entry project. Move only the horizontal rail, never the page vertically.
  if(works&&!wantsArchive){let rect=image.getBoundingClientRect(),sr=works.getBoundingClientRect();if(rect.left<sr.left&&dragController?.setX)dragController.setX((dragController.getX?.()||0)+(sr.left-rect.left),false);else if(rect.right>sr.right&&dragController?.setX)dragController.setX((dragController.getX?.()||0)-(rect.right-sr.right),false);await v33NextFrame()}
  // If exact origin was above/below the card, pin the WORKS section into view instead of ever falling back to HERO.
  let r=image.getBoundingClientRect();if(!wantsArchive&&(r.bottom<80||r.top>innerHeight-40)){const sr=works.getBoundingClientRect();scrollTo({top:Math.max(0,scrollY+sr.top-110),behavior:'auto'});await v33NextFrame();r=image.getBoundingClientRect()}
  let stable=0,prev=null;for(let i=0;i<20;i++){await v33NextFrame();const n=image.getBoundingClientRect(),cur=[n.left,n.top,n.width,n.height];if(prev&&cur.every((v,j)=>Math.abs(v-prev[j])<.5))stable++;else stable=0;prev=cur;if(stable>=2)break}
  dragController?.lock?.();return link;
}

playReverseProjectTransition = async function(){
  if(reverseTransitionRunning)return false;const data=v33ReadJSON('portfolioReturnTransition');if(!data?.slug||!data?.image)return false;
  reverseTransitionRunning=true;let failSafe=null;
  const recover=()=>{try{const target=data.surface==='archive'?document.querySelector('.archive-main'):document.querySelector('#portfolio');target?.scrollIntoView({block:'start',behavior:'auto'})}catch{}cleanupProjectTransition({releaseBoot:true});document.documentElement.classList.remove('is-restoring-project');dragController?.unlock?.();v33ClearTransitionState();reverseTransitionRunning=false};
  failSafe=setTimeout(recover,3600);
  try{
    const link=await v43FindReturnTarget(data);if(!link)throw new Error('return target unavailable');const image=link.querySelector('.project-card-image');if(!image)throw new Error('return image unavailable');const rect=image.getBoundingClientRect();if(rect.width<2||rect.height<2)throw new Error('target hidden');
    const card=link.closest('.project-card');card?.classList.add('is-return-target');
    const clone=document.createElement('img');clone.src=data.image;clone.alt='';clone.className='transition-clone transition-surface transition-return-clone';Object.assign(clone.style,{left:'0px',top:'0px',width:`${innerWidth}px`,height:`${innerHeight}px`,borderRadius:'0px',objectFit:'cover',objectPosition:getComputedStyle(image).objectPosition||'50% 50%',opacity:'1'});document.body.appendChild(clone);try{await v33WithTimeout(clone.decode?.()||Promise.resolve(),300)}catch{}
    await v33NextFrame();document.documentElement.classList.add('reverse-arrival-release');await v33Wait(18);document.documentElement.classList.remove('reverse-arrival-pending','reverse-arrival-release');document.documentElement.style.removeProperty('--transition-image');
    const a=clone.animate([{left:'0px',top:'0px',width:`${innerWidth}px`,height:`${innerHeight}px`,borderRadius:'0px'},{left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`,borderRadius:getComputedStyle(image).borderRadius||'12px'}],{duration:360,easing:'cubic-bezier(.2,.78,.16,1)',fill:'forwards'});await v33WithTimeout(a.finished.catch(()=>{}),430);clone.remove();card?.classList.remove('is-return-target');document.documentElement.classList.remove('is-restoring-project');dragController?.unlock?.();v33ClearTransitionState();clearTimeout(failSafe);reverseTransitionRunning=false;return true;
  }catch(e){clearTimeout(failSafe);recover();return false}
};
window.playReverseProjectTransition=playReverseProjectTransition;

// Correct supplied WORLDS: Yellowtail glass lettering + directional liquid displacement.
function initHeroWorldsV43(){
  const h1=document.querySelector('.hero-copy h1');if(!h1)return;let old=h1.querySelector('span:nth-child(2)');if(!old)return;
  // clone strips V42's pointer listeners and its old canvas engine.
  const line=old.cloneNode(false);line.textContent='';line.className='hero-worlds-liquid hero-worlds-liquid-v43';line.dataset.worldsText='WORLDS';line.innerHTML='<span class="hero-worlds-a11y">WORLDS</span><canvas aria-hidden="true"></canvas>';old.replaceWith(line);
  document.querySelector('.hero-interact-hint')?.remove();let hint=document.querySelector('.hero-interact-hint-v43');if(!hint){hint=document.createElement('div');hint.className='hero-interact-hint-v43';hint.textContent=matchMedia('(pointer:coarse)').matches?'DRAG THROUGH WORLDS':'MOVE THROUGH WORLDS';h1.closest('.hero-copy')?.appendChild(hint)}
  const canvas=line.querySelector('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)return;
  const W=780,H=300,DPR=Math.min(devicePixelRatio||1,2);canvas.width=W*DPR;canvas.height=H*DPR;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(DPR,0,0,DPR,0,0);
  const src=document.createElement('canvas');src.width=canvas.width;src.height=canvas.height;const sctx=src.getContext('2d');sctx.setTransform(DPR,0,0,DPR,0,0);let sourceData=null;
  const drawSource=()=>{sctx.clearRect(0,0,W,H);sctx.font="170px 'Yellowtail', cursive";sctx.textBaseline='alphabetic';const text='WORLDS',baseline=210,m=sctx.measureText(text),ascent=m.actualBoundingBoxAscent||128,descent=m.actualBoundingBoxDescent||46,top=baseline-ascent,bottom=baseline+descent,glyphH=bottom-top,X=Math.max(0,m.actualBoundingBoxLeft||0);
    sctx.save();sctx.shadowColor='rgba(150,225,232,.55)';sctx.shadowBlur=28;sctx.fillStyle='rgba(205,238,240,.6)';sctx.fillText(text,X,baseline);sctx.restore();
    const grad=sctx.createLinearGradient(0,top,0,bottom);grad.addColorStop(0,'rgba(255,255,255,.95)');grad.addColorStop(.4,'rgba(191,232,234,.82)');grad.addColorStop(1,'rgba(70,140,148,.55)');sctx.fillStyle=grad;sctx.fillText(text,X,baseline);
    sctx.save();sctx.globalCompositeOperation='source-atop';const shine=sctx.createLinearGradient(0,top,0,top+glyphH*.42);shine.addColorStop(0,'rgba(255,255,255,.65)');shine.addColorStop(1,'rgba(255,255,255,0)');sctx.fillStyle=shine;sctx.fillRect(0,0,W,H);sctx.restore();
    sctx.save();sctx.globalCompositeOperation='source-atop';const shadow=sctx.createLinearGradient(0,top+glyphH*.55,0,bottom);shadow.addColorStop(0,'rgba(6,28,32,0)');shadow.addColorStop(1,'rgba(6,28,32,.4)');sctx.fillStyle=shadow;sctx.fillRect(0,0,W,H);sctx.restore();
    sctx.save();sctx.lineWidth=1.4;sctx.strokeStyle='rgba(255,255,255,.45)';sctx.strokeText(text,X,baseline);sctx.restore();sourceData=sctx.getImageData(0,0,canvas.width,canvas.height);ctx.clearRect(0,0,W,H);ctx.drawImage(src,0,0,W,H)};
  const spacing=7,cols=Math.ceil(W/spacing)+1,rows=Math.ceil(H/spacing)+1,dx=new Float32Array(cols*rows),dy=new Float32Array(cols*rows),radius=26,strength=1.8,maxDisp=30,relax=.84,eps=.15,idx=(c,r)=>r*cols+c;let raf=0,drops=0,prevX=null,prevY=null;
  const sample=(px,py)=>{const gx=px/spacing,gy=py/spacing,c0=Math.max(0,Math.min(cols-2,Math.floor(gx))),r0=Math.max(0,Math.min(rows-2,Math.floor(gy))),c1=c0+1,r1=r0+1,tx=Math.max(0,Math.min(1,gx-c0)),ty=Math.max(0,Math.min(1,gy-r0)),i00=idx(c0,r0),i10=idx(c1,r0),i01=idx(c0,r1),i11=idx(c1,r1);return[(dx[i00]*(1-tx)+dx[i10]*tx)*(1-ty)+(dx[i01]*(1-tx)+dx[i11]*tx)*ty,(dy[i00]*(1-tx)+dy[i10]*tx)*(1-ty)+(dy[i01]*(1-tx)+dy[i11]*tx)*ty]};
  const push=(mx,my,vx,vy)=>{if(!vx&&!vy)return;for(let r=Math.max(0,Math.floor((my-radius)/spacing));r<=Math.min(rows-1,Math.ceil((my+radius)/spacing));r++)for(let c=Math.max(0,Math.floor((mx-radius)/spacing));c<=Math.min(cols-1,Math.ceil((mx+radius)/spacing));c++){const cx=c*spacing,cy=r*spacing,ddx=cx-mx,ddy=cy-my,d=Math.hypot(ddx,ddy);if(d>radius)continue;const f=(1-d/radius)**2,i=idx(c,r);dx[i]+=vx*f*strength;dy[i]+=vy*f*strength;const mag=Math.hypot(dx[i],dy[i]);if(mag>maxDisp){const q=maxDisp/mag;dx[i]*=q;dy[i]*=q}}startLoop()};
  const bounds=()=>{let minC=cols,maxC=-1,minR=rows,maxR=-1;for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const i=idx(c,r);dx[i]*=relax;dy[i]*=relax;if(Math.abs(dx[i])<eps)dx[i]=0;if(Math.abs(dy[i])<eps)dy[i]=0;if(dx[i]||dy[i]){minC=Math.min(minC,c);maxC=Math.max(maxC,c);minR=Math.min(minR,r);maxR=Math.max(maxR,r)}}return maxC<0?null:{x0:Math.max(0,(minC-1)*spacing),y0:Math.max(0,(minR-1)*spacing),x1:Math.min(W,(maxC+2)*spacing),y1:Math.min(H,(maxR+2)*spacing)}};
  const distort=b=>{if(!sourceData)return;const x0=Math.floor(b.x0*DPR),y0=Math.floor(b.y0*DPR),x1=Math.ceil(b.x1*DPR),y1=Math.ceil(b.y1*DPR),ww=x1-x0,hh=y1-y0;if(ww<=0||hh<=0)return;const reg=ctx.createImageData(ww,hh),out=reg.data,sd=sourceData.data,bw=canvas.width,bh=canvas.height;for(let y=0;y<hh;y++){const py=y0+y,cy=py/DPR;for(let x=0;x<ww;x++){const px=x0+x,cx=px/DPR,[sxD,syD]=sample(cx,cy),sx=Math.round(px-sxD*DPR),sy=Math.round(py-syD*DPR),oi=(y*ww+x)*4;if(sx>=0&&sx<bw&&sy>=0&&sy<bh){const si=(sy*bw+sx)*4;out[oi]=sd[si];out[oi+1]=sd[si+1];out[oi+2]=sd[si+2];out[oi+3]=sd[si+3]}}}ctx.putImageData(reg,x0,y0)};
  function frame(){raf=0;ctx.clearRect(0,0,W,H);ctx.drawImage(src,0,0,W,H);const b=bounds();if(b){distort(b);raf=requestAnimationFrame(frame)}}function startLoop(){if(!raf)raf=requestAnimationFrame(frame)}
  const isInk=(x,y)=>{if(!sourceData)return false;const bx=Math.round(x*DPR),by=Math.round(y*DPR);return bx>=0&&by>=0&&bx<canvas.width&&by<canvas.height&&sourceData.data[(by*canvas.width+bx)*4+3]>40};
  const drop=(clientX,clientY)=>{if(drops>=8)return;drops++;const d=document.createElement('i');d.className='hero-worlds-droplet-v43';d.style.left=clientX+'px';d.style.top=clientY+'px';document.body.appendChild(d);const a=Math.random()*Math.PI*2,dist=16+Math.random()*30,tx=Math.cos(a)*dist,ty=Math.sin(a)*dist+35;const an=d.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:.9},{transform:`translate(calc(-50% + ${tx*.5}px),calc(-50% + ${ty*.4}px)) scale(.85)`,opacity:1,offset:.4},{transform:`translate(calc(-50% + ${tx}px),calc(-50% + ${ty}px)) scale(.2)`,opacity:0}],{duration:500+Math.random()*180,easing:'cubic-bezier(.22,.68,.35,1)'});an.onfinish=()=>{drops--;d.remove()}};
  const move=e=>{const r=canvas.getBoundingClientRect(),mx=(e.clientX-r.left)*(W/r.width),my=(e.clientY-r.top)*(H/r.height);if(prevX!==null){push(mx,my,mx-prevX,my-prevY)}prevX=mx;prevY=my;hint?.classList.add('is-used');if(Math.random()<.42&&isInk(mx,my))drop(e.clientX,e.clientY)};line.addEventListener('pointermove',move,{passive:true});line.addEventListener('pointerleave',()=>{prevX=prevY=null});
  const init=()=>{drawSource();requestAnimationFrame(()=>{push(W*.43,H*.50,13,-2);setTimeout(()=>push(W*.53,H*.51,-9,3),85)})};
  if(document.fonts?.load)document.fonts.load("170px 'Yellowtail'").then(init).catch(init);else init();
}

// HERO wordmark is owned by scripts/hero-worlds.js in v47.
