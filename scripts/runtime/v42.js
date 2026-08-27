/* V42 — interaction grammar: liquid WORLDS, usable rail controls, trajectory background. */

// Keep the public content loader compatible with the liquid WORLDS canvas.
const v42BaseApplyHero = applyHero;
applyHero = function(hero){
  const spans=document.querySelectorAll('.hero-copy h1 span');
  if(spans[0]&&hero.line1)spans[0].textContent=hero.line1;
  const worlds=spans[1];
  if(worlds&&hero.line2){
    if(worlds.classList.contains('hero-worlds-liquid')){
      worlds.dataset.worldsText=hero.line2;
      worlds.querySelector('.hero-worlds-a11y')?.replaceChildren(document.createTextNode(hero.line2));
      window.__heroWorldsEngine?.setText?.(hero.line2);
    }else worlds.textContent=hero.line2;
  }
  const h1=document.querySelector('.hero-copy h1');if(h1)h1.setAttribute('aria-label',`${hero.line1||''} ${hero.line2||''}`.trim());
  const sub=document.querySelector('.hero-sub');if(sub&&hero.subtitle)sub.textContent=hero.subtitle;
};

// BACKGROUND is evidence. Turn it into a chronological trajectory rather than generic rows.
renderBackground = function(bg){
  const root=document.querySelector('#backgroundGroups');if(!root)return;
  const edu=Array.isArray(bg.education)?bg.education:[];
  const exp=Array.isArray(bg.experience)?bg.experience:[];
  const awards=Array.isArray(bg.awards)?bg.awards:[];
  const eduHtml=edu.length?`<section class="background-v42-education"><div class="background-label">EDUCATION</div>${edu.map(item=>`<article class="background-v42-edu"><time>${esc(item.date||'')}</time><strong>${esc(item.title||'')}</strong><p>${esc(item.detail||'')}</p></article>`).join('')}</section>`:'';
  const indexHtml=`<div class="background-v42-index"><span><b>${String(exp.length).padStart(2,'0')}</b> PROJECT EXPERIENCES</span><span>CHRONOLOGY / OLDEST → LATEST</span><span>SCROLL / TRACE THE LINE</span></div>`;
  const entries=exp.map((item,i)=>`<article class="background-v42-entry" data-background-index="${i}"><time>${esc(item.date||'—')}</time><strong>${esc(item.title||'')}</strong>${item.status?`<span class="status">${esc(item.status)}</span>`:''}<p>${esc(item.detail||'')}</p></article>`).join('');
  const awardHtml=awards.length?`<section class="background-v42-awards"><div class="background-label">COMPETITION / AWARDS</div>${awards.map(item=>`<article class="background-v42-edu"><time>${esc(item.date||'')}</time><strong>${esc(item.title||'')}</strong><p>${esc(item.detail||'')}</p></article>`).join('')}</section>`:'';
  root.innerHTML=`<div class="background-v42-layout"><aside class="background-v42-aside">${eduHtml}${indexHtml}</aside><div class="background-v42-track">${entries}</div>${awardHtml}</div>`;
  const intro=document.querySelector('.background-head>p');if(intro&&bg.intro)intro.textContent=bg.intro;
  requestAnimationFrame(()=>v42BindBackgroundTrack());
};

// CONTACT links are decision points, so expose them before the giant closing statement.
renderContact = function(c){
  const root=document.querySelector('#contactContent');if(!root)return;
  let head=Array.isArray(c.headline)?[...c.headline]:['LET’S TALK','ABOUT WORLDS.'];
  if(/^ABOUT\s+SYSTEMS\.?$/i.test(String(head[1]||'').trim()))head[1]='ABOUT WORLDS.';
  const links=[['MAIL',`mailto:${c.email||''}`,ICONS.mail],['GITHUB',c.github,ICONS.github],['LINKEDIN',c.linkedin,ICONS.linkedin],['BLOG',c.blog,ICONS.blog]].filter(x=>x[1]&&!x[1].endsWith(':'));
  const actions=links.map(([label,href,icon])=>`<a class="contact-icon-link" href="${esc(href)}" ${href.startsWith('mailto:')?'':'target="_blank" rel="noreferrer"'}><span class="contact-icon">${icon}</span><span>${label}</span><b>↗</b></a>`).join('');
  root.innerHTML=`<div class="contact-top-v42"><div class="contact-kicker">CONTACT / OPEN FOR CONVERSATION</div><div class="contact-actions">${actions}</div></div><h2><span>${esc(head[0]||'')}</span><span>${esc(head[1]||'')}</span></h2>`;
};

// Replace the rail controller with three equivalent paths: direct drag, draggable bar, arrows.
bindDragRail = function(stage,rail,legacyProgress){
  if(!stage||!rail)return null;
  const coarse=matchMedia('(max-width:760px), (pointer:coarse)').matches;
  let nav=stage.parentElement?.querySelector('.works-nav-v42');
  if(!nav){
    nav=document.createElement('div');nav.className='works-nav-v42';
    nav.innerHTML='<span class="works-nav-label">DRAG CARDS / USE BAR</span><button class="works-arrow-v42 works-prev-v42" type="button" aria-label="이전 프로젝트">←</button><div class="works-range-v42" role="presentation"><button class="works-range-thumb-v42" type="button" aria-label="프로젝트 위치 조절" role="slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></button></div><button class="works-arrow-v42 works-next-v42" type="button" aria-label="다음 프로젝트">→</button>';
    stage.insertAdjacentElement('afterend',nav);
  }
  const prev=nav.querySelector('.works-prev-v42'),next=nav.querySelector('.works-next-v42'),range=nav.querySelector('.works-range-v42'),thumb=nav.querySelector('.works-range-thumb-v42');
  let locked=false,x=0,max=0,cardStep=260,pointerDown=false,dragging=false,startPointer=0,startX=0,activePointer=null,suppressClickUntil=0;
  let thumbDown=false,thumbPointer=null,thumbStart=0,ratioStart=0;
  const threshold=7;
  const clamp=v=>Math.max(-max,Math.min(0,Number(v)||0));
  const ratio=()=>coarse?(Math.max(0,stage.scrollWidth-stage.clientWidth)?stage.scrollLeft/Math.max(1,stage.scrollWidth-stage.clientWidth):0):(max?Math.abs(x)/max:0);
  const setControlState=()=>{
    const r=Math.max(0,Math.min(1,ratio()));
    const viewport=coarse?stage.clientWidth:stage.clientWidth;
    const total=coarse?stage.scrollWidth:(stage.clientWidth+max);
    const frac=total?Math.max(.12,Math.min(1,viewport/total)):1;
    const rangeWidth=range.clientWidth||1;const thumbWidth=Math.max(48,rangeWidth*frac);const travel=Math.max(0,rangeWidth-thumbWidth);
    thumb.style.width=`${thumbWidth}px`;thumb.style.left=`${travel*r}px`;thumb.setAttribute('aria-valuenow',String(Math.round(r*100)));
    prev.classList.toggle('is-hidden',r<=.002);next.classList.toggle('is-hidden',r>=.998||max<=1&&(!coarse||stage.scrollWidth<=stage.clientWidth+1));
    stage.dataset.dragProgress=String(r);
    if(legacyProgress){legacyProgress.dataset.progress=String(r);legacyProgress.style.left=`${r*78}%`;legacyProgress.style.transform='none'}
  };
  const draw=()=>{if(!coarse)rail.style.transform=`translate3d(${x}px,0,0)`;setControlState()};
  const metrics=()=>{
    if(locked)return;const cards=[...rail.children],gap=parseFloat(getComputedStyle(rail).gap||'12')||12,w=stage.clientWidth;
    if(coarse){rail.style.transform='none';rail.style.width='max-content';const first=rail.querySelector('.project-card');const gap=parseFloat(getComputedStyle(rail).gap||'12')||12;cardStep=(first?.getBoundingClientRect().width||260)+gap;requestAnimationFrame(setControlState);return;}
    const visible=w>=1180?5:w>=820?3:2;const cw=(w-gap*(visible-1))/visible;cards.forEach(c=>c.style.width=`${cw}px`);cardStep=cw+gap;const total=cards.length?cards.length*cw+(cards.length-1)*gap:0;rail.style.width=`${Math.max(w,total)}px`;max=Math.max(0,total-w);x=clamp(x);draw();stage.classList.toggle('has-overflow',max>1);
  };
  const moveRatio=(r,animate=true)=>{
    r=Math.max(0,Math.min(1,r));
    if(coarse){const m=Math.max(0,stage.scrollWidth-stage.clientWidth);stage.scrollTo({left:m*r,behavior:animate?'smooth':'auto'});return;}
    x=clamp(-max*r);rail.classList.toggle('is-settling',animate);draw();clearTimeout(moveRatio.t);if(animate)moveRatio.t=setTimeout(()=>rail.classList.remove('is-settling'),280);
  };
  const step=dir=>{
    if(coarse){stage.scrollBy({left:dir*cardStep,behavior:'smooth'})}else{ x=clamp(x-dir*cardStep);rail.classList.add('is-settling');draw();setTimeout(()=>rail.classList.remove('is-settling'),280); }
  };
  prev.onclick=()=>step(-1);next.onclick=()=>step(1);
  const rangeDown=e=>{if(e.target===thumb)return;const r=range.getBoundingClientRect();moveRatio((e.clientX-r.left)/Math.max(1,r.width),true)};range.addEventListener('pointerdown',rangeDown);
  thumb.addEventListener('pointerdown',e=>{if(locked)return;e.preventDefault();thumbDown=true;thumbPointer=e.pointerId;thumbStart=e.clientX;ratioStart=ratio();try{thumb.setPointerCapture(e.pointerId)}catch{}});
  thumb.addEventListener('pointermove',e=>{if(!thumbDown||e.pointerId!==thumbPointer)return;e.preventDefault();const r=range.getBoundingClientRect();moveRatio(ratioStart+(e.clientX-thumbStart)/Math.max(1,r.width),false)});
  const thumbUp=e=>{if(!thumbDown||e.pointerId!==thumbPointer)return;thumbDown=false;try{thumb.releasePointerCapture(e.pointerId)}catch{}};thumb.addEventListener('pointerup',thumbUp);thumb.addEventListener('pointercancel',thumbUp);
  let scrollRaf=0;const onScroll=()=>{if(scrollRaf)return;scrollRaf=requestAnimationFrame(()=>{scrollRaf=0;setControlState()})};if(coarse)stage.addEventListener('scroll',onScroll,{passive:true});
  const down=e=>{if(coarse||locked||(e.pointerType==='mouse'&&e.button!==0))return;pointerDown=true;dragging=false;activePointer=e.pointerId;startPointer=e.clientX;startX=x};
  const move=e=>{if(coarse||locked||!pointerDown||e.pointerId!==activePointer)return;const dx=e.clientX-startPointer;if(!dragging&&Math.abs(dx)>=threshold){dragging=true;stage.classList.add('is-dragging');try{stage.setPointerCapture(e.pointerId)}catch{}}if(!dragging)return;e.preventDefault();x=clamp(startX+dx);draw()};
  const up=e=>{if(coarse||!pointerDown||e.pointerId!==activePointer)return;const was=dragging;pointerDown=false;dragging=false;activePointer=null;stage.classList.remove('is-dragging');try{stage.releasePointerCapture(e.pointerId)}catch{}if(was)suppressClickUntil=performance.now()+180};
  const clickCapture=e=>{if(performance.now()<suppressClickUntil){e.preventDefault();e.stopPropagation()}};
  stage.addEventListener('pointerdown',down);stage.addEventListener('pointermove',move,{passive:false});stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',up);stage.addEventListener('click',clickCapture,true);stage.addEventListener('dragstart',e=>e.preventDefault());
  rail.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();step(1)}else if(e.key==='ArrowLeft'){e.preventDefault();step(-1)}});
  const ro=new ResizeObserver(metrics);ro.observe(stage);ro.observe(range);requestAnimationFrame(metrics);
  return {
    destroy(){ro.disconnect();if(coarse)stage.removeEventListener('scroll',onScroll);nav.remove();},
    getIndex(){return Math.round((coarse?stage.scrollLeft:Math.abs(x))/Math.max(1,cardStep))},
    setIndex(i,animate=false){if(coarse)stage.scrollTo({left:Math.max(0,(Number(i)||0)*cardStep),behavior:animate?'smooth':'auto'});else{x=clamp(-(Number(i)||0)*cardStep);draw()}},
    getX(){return coarse?-stage.scrollLeft:x},
    setX(value,animate=false){if(coarse)stage.scrollTo({left:Math.max(0,-(Number(value)||0)),behavior:animate?'smooth':'auto'});else{x=clamp(value);draw()}requestAnimationFrame(setControlState)},
    lock(){locked=true;if(coarse)stage.style.overflowX='hidden'},unlock(){locked=false;if(coarse)stage.style.overflowX='auto';metrics()},
    moveRatio,refresh:metrics
  };
};

// Faster object-continuity transition: 0.42s instead of a long ceremonial move.
v33NavigateWithTransition = async function(link,image){
  const rect=image.getBoundingClientRect(),src=image.currentSrc||image.src;if(!src||rect.width<2||rect.height<2){location.assign(link.href);return;}
  cleanupProjectTransition({releaseBoot:false});warmProjectPage(link);
  const origin=v33OriginState(link,image);v33WriteJSON('portfolioTransitionOriginState',origin);v33WriteJSON('portfolioDetailChain',{origin,entrySlug:origin.slug,currentSlug:origin.slug,currentImage:origin.image,depth:1,at:Date.now()});
  try{sessionStorage.setItem('portfolioTransitionImage',src);sessionStorage.setItem('portfolioTransitionTarget',origin.slug);sessionStorage.setItem('portfolioTransitionOrigin',origin.url)}catch{}
  const clone=image.cloneNode(true);clone.removeAttribute('loading');clone.className='transition-clone transition-surface';Object.assign(clone.style,{left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`,borderRadius:getComputedStyle(image).borderRadius||'12px',objectPosition:getComputedStyle(image).objectPosition||'50% 50%'});document.documentElement.classList.add('project-transition-active');link.closest('.project-card')?.classList.add('is-leaving');document.body.appendChild(clone);await v33NextFrame();
  try{const animation=clone.animate([{left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`,borderRadius:getComputedStyle(image).borderRadius||'12px'},{left:'0px',top:'0px',width:'100vw',height:'100vh',borderRadius:'0px'}],{duration:420,easing:'cubic-bezier(.2,.82,.18,1)',fill:'forwards'});await v33WithTimeout(animation.finished.catch(()=>{}),500)}catch{}
  Object.assign(clone.style,{left:'0px',top:'0px',width:'100vw',height:'100vh',borderRadius:'0px'});location.assign(link.href);
};

const v42BaseReverse=playReverseProjectTransition;
playReverseProjectTransition = async function(){
  // Use the mature return-target restoration from V41, but speed the visual contraction.
  if(reverseTransitionRunning)return false;
  let data=v33ReadJSON('portfolioReturnTransition');
  if(!data){const last=v33ReadJSON('portfolioLastDetail');if(last?.origin?.path===location.pathname&&Date.now()-(last.at||0)<25000){data={slug:last.slug,image:last.image,scrollY:last.origin.scrollY,railIndex:last.origin.railIndex,railX:last.origin.railX,surface:last.origin.surface||'works',at:Date.now(),nativeBack:true};v33WriteJSON('portfolioReturnTransition',data)}}
  if(!data?.slug||!data?.image)return false;if(Date.now()-(data.at||0)>35000){v33ClearTransitionState();cleanupProjectTransition();return false;}
  reverseTransitionRunning=true;const failSafe=setTimeout(()=>{dragController?.unlock?.();cleanupProjectTransition({releaseBoot:true});v33ClearTransitionState();document.documentElement.classList.remove('is-restoring-project');reverseTransitionRunning=false},1700);
  try{
    const link=await v33FindReturnTarget(data);if(!link)throw new Error('return target unavailable');const image=link.querySelector('.project-card-image');if(!image)throw new Error('return image unavailable');
    try{if(!image.complete)await v33WithTimeout(new Promise(r=>{image.addEventListener('load',r,{once:true});image.addEventListener('error',r,{once:true})}),550);await v33WithTimeout(image.decode?.()||Promise.resolve(),350)}catch{}
    const resolvedRailX=Number.isFinite(data.resolvedRailX)?data.resolvedRailX:data.railX;if(Number.isFinite(resolvedRailX))dragController?.setX?.(resolvedRailX,false);if(Number.isFinite(data.scrollY))scrollTo({top:data.scrollY,left:0,behavior:'auto'});await v33NextFrame();
    const rect=image.getBoundingClientRect();if(rect.width<2||rect.height<2)throw new Error('return target hidden');const card=link.closest('.project-card');card?.classList.add('is-return-target');
    const clone=document.createElement('img');clone.src=data.image;clone.alt='';clone.className='transition-clone transition-surface transition-return-clone';Object.assign(clone.style,{left:'0px',top:'0px',width:`${innerWidth}px`,height:`${innerHeight}px`,borderRadius:'0px',objectFit:'cover',objectPosition:getComputedStyle(image).objectPosition||'50% 50%',opacity:'1'});document.body.appendChild(clone);try{await v33WithTimeout(clone.decode?.()||Promise.resolve(),350)}catch{}
    await v33NextFrame();document.documentElement.classList.add('reverse-arrival-release');await v33Wait(35);document.documentElement.classList.remove('reverse-arrival-pending','reverse-arrival-release');document.documentElement.style.removeProperty('--transition-image');await v33NextFrame();
    const anim=clone.animate([{left:'0px',top:'0px',width:`${innerWidth}px`,height:`${innerHeight}px`,borderRadius:'0px'},{left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`,borderRadius:getComputedStyle(image).borderRadius||'12px'}],{duration:420,easing:'cubic-bezier(.2,.78,.16,1)',fill:'forwards'});await v33WithTimeout(anim.finished.catch(()=>{}),500);card?.classList.remove('is-return-target');clone.remove();v33ClearTransitionState();document.documentElement.classList.remove('is-restoring-project');
  }catch{cleanupProjectTransition({releaseBoot:true});v33ClearTransitionState();document.documentElement.classList.remove('is-restoring-project')}
  finally{clearTimeout(failSafe);dragController?.unlock?.();reverseTransitionRunning=false}return true;
};
window.playReverseProjectTransition=playReverseProjectTransition;

function v42BindBackgroundTrack(){
  const section=document.querySelector('#background'),track=section?.querySelector('.background-v42-track');if(!section||!track)return;
  let raf=0;const update=()=>{raf=0;const r=track.getBoundingClientRect(),vh=Math.max(1,innerHeight);const start=vh*.78,end=vh*.2;const p=Math.max(0,Math.min(1,(start-r.top)/Math.max(1,r.height-(end-start))));track.style.setProperty('--track-progress',p.toFixed(4))};const q=()=>{if(!raf)raf=requestAnimationFrame(update)};addEventListener('scroll',q,{passive:true});addEventListener('resize',q,{passive:true});update();
}

function v42InitHeroWorlds(){
  const line=document.querySelector('.hero-copy h1 span:nth-child(2)');if(!line||line.classList.contains('hero-worlds-liquid'))return;
  const text=(line.textContent||'WORLDS').trim()||'WORLDS';line.className+=' hero-worlds-liquid';line.dataset.worldsText=text;line.innerHTML='<span class="hero-worlds-a11y">'+esc(text)+'</span><canvas class="hero-worlds-canvas" aria-hidden="true"></canvas>';
  const canvas=line.querySelector('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)return;
  const W=720,H=176,DPR=Math.min(devicePixelRatio||1,matchMedia('(max-width:760px)').matches?1:1.25);canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);canvas.style.aspectRatio=`${W}/${H}`;
  const src=document.createElement('canvas');src.width=canvas.width;src.height=canvas.height;const sctx=src.getContext('2d',{willReadFrequently:true});let sourceData=null,currentText=text;
  const spacing=10,cols=Math.ceil(W/spacing)+1,rows=Math.ceil(H/spacing)+1,dx=new Float32Array(cols*rows),dy=new Float32Array(cols*rows),vx=new Float32Array(cols*rows),vy=new Float32Array(cols*rows);const idx=(c,r)=>r*cols+c;let raf=0,active=false,lastX=null,lastY=null,used=false,drops=0;
  function drawSource(){sctx.setTransform(DPR,0,0,DPR,0,0);sctx.clearRect(0,0,W,H);const fs=140;sctx.font=`900 ${fs}px Outfit, Arial, sans-serif`;sctx.textBaseline='alphabetic';const m=sctx.measureText(currentText),asc=m.actualBoundingBoxAscent||fs*.75,des=m.actualBoundingBoxDescent||fs*.04,x=(W-m.width)/2,base=(H+asc-des)/2,top=base-asc,bottom=base+des; sctx.save();sctx.shadowColor='rgba(139,132,255,.44)';sctx.shadowBlur=24;sctx.fillStyle='rgba(229,226,255,.58)';sctx.fillText(currentText,x,base);sctx.restore();const g=sctx.createLinearGradient(0,top,0,bottom);g.addColorStop(0,'rgba(255,255,255,.99)');g.addColorStop(.34,'rgba(211,223,255,.94)');g.addColorStop(.72,'rgba(177,158,255,.80)');g.addColorStop(1,'rgba(244,150,190,.62)');sctx.fillStyle=g;sctx.fillText(currentText,x,base);sctx.save();sctx.globalCompositeOperation='source-atop';const hi=sctx.createLinearGradient(0,top,0,top+(bottom-top)*.42);hi.addColorStop(0,'rgba(255,255,255,.72)');hi.addColorStop(1,'rgba(255,255,255,0)');sctx.fillStyle=hi;sctx.fillRect(0,0,W,H);sctx.restore();sctx.lineWidth=1.15;sctx.strokeStyle='rgba(255,255,255,.48)';sctx.strokeText(currentText,x,base);sourceData=sctx.getImageData(0,0,canvas.width,canvas.height);drawBase()}
  function drawBase(){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(src,0,0)}
  function sample(px,py){const gx=px/spacing,gy=py/spacing,c0=Math.max(0,Math.min(cols-2,Math.floor(gx))),r0=Math.max(0,Math.min(rows-2,Math.floor(gy))),tx=Math.max(0,Math.min(1,gx-c0)),ty=Math.max(0,Math.min(1,gy-r0)),c1=c0+1,r1=r0+1,i00=idx(c0,r0),i10=idx(c1,r0),i01=idx(c0,r1),i11=idx(c1,r1);return[(dx[i00]*(1-tx)+dx[i10]*tx)*(1-ty)+(dx[i01]*(1-tx)+dx[i11]*tx)*ty,(dy[i00]*(1-tx)+dy[i10]*tx)*(1-ty)+(dy[i01]*(1-tx)+dy[i11]*tx)*ty]}
  function push(mx,my,speed=8){const radius=44,minC=Math.max(0,Math.floor((mx-radius)/spacing)),maxC=Math.min(cols-1,Math.ceil((mx+radius)/spacing)),minR=Math.max(0,Math.floor((my-radius)/spacing)),maxR=Math.min(rows-1,Math.ceil((my+radius)/spacing));for(let r=minR;r<=maxR;r++)for(let c=minC;c<=maxC;c++){const cx=c*spacing,cy=r*spacing,ox=cx-mx,oy=cy-my,dist=Math.hypot(ox,oy);if(dist>radius||dist<.1)continue;const f=(1-dist/radius)**2*Math.min(30,speed)*1.75,i=idx(c,r);dx[i]+=ox/dist*f;dy[i]+=oy/dist*f;const mag=Math.hypot(dx[i],dy[i]);if(mag>34){dx[i]*=34/mag;dy[i]*=34/mag}}active=true;startLoop()}
  function relax(){let any=false,minC=cols,maxC=-1,minR=rows,maxR=-1;for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const i=idx(c,r);vx[i]+=-.10*dx[i]-.38*vx[i];vy[i]+=-.10*dy[i]-.38*vy[i];dx[i]+=vx[i];dy[i]+=vy[i];if(Math.abs(dx[i])<.035&&Math.abs(vx[i])<.035){dx[i]=0;vx[i]=0}if(Math.abs(dy[i])<.035&&Math.abs(vy[i])<.035){dy[i]=0;vy[i]=0}if(dx[i]||dy[i]){any=true;minC=Math.min(minC,c);maxC=Math.max(maxC,c);minR=Math.min(minR,r);maxR=Math.max(maxR,r)}}return any?{x0:Math.max(0,(minC-1)*spacing),y0:Math.max(0,(minR-1)*spacing),x1:Math.min(W,(maxC+2)*spacing),y1:Math.min(H,(maxR+2)*spacing)}:null}
  function distort(box){if(!sourceData)return;const x0=Math.floor(box.x0*DPR),y0=Math.floor(box.y0*DPR),x1=Math.ceil(box.x1*DPR),y1=Math.ceil(box.y1*DPR),w=x1-x0,h=y1-y0;if(w<=0||h<=0)return;const region=ctx.createImageData(w,h),out=region.data,srcD=sourceData.data,bw=canvas.width,bh=canvas.height;for(let yy=0;yy<h;yy++){const py=y0+yy,cy=py/DPR;for(let xx=0;xx<w;xx++){const px=x0+xx,cx=px/DPR,[sxD,syD]=sample(cx,cy),sx=Math.round(px-sxD*DPR),sy=Math.round(py-syD*DPR),oi=(yy*w+xx)*4;if(sx>=0&&sx<bw&&sy>=0&&sy<bh){const si=(sy*bw+sx)*4;out[oi]=srcD[si];out[oi+1]=srcD[si+1];out[oi+2]=srcD[si+2];out[oi+3]=srcD[si+3]}}}ctx.putImageData(region,x0,y0)}
  function frame(){raf=0;drawBase();const box=relax();if(box){distort(box);raf=requestAnimationFrame(frame)}else active=false}
  function startLoop(){if(!raf)raf=requestAnimationFrame(frame)}
  function isInk(x,y){if(!sourceData)return false;const bx=Math.round(x*DPR),by=Math.round(y*DPR);if(bx<0||by<0||bx>=canvas.width||by>=canvas.height)return false;return sourceData.data[(by*canvas.width+bx)*4+3]>38}
  function drop(clientX,clientY){if(drops>=9)return;drops++;const d=document.createElement('i');d.className='hero-worlds-droplet';d.style.left=`${clientX}px`;d.style.top=`${clientY}px`;document.body.appendChild(d);const a=Math.random()*Math.PI*2,dist=18+Math.random()*26,tx=Math.cos(a)*dist,ty=Math.sin(a)*dist+18;const an=d.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:.9},{transform:`translate(calc(-50% + ${tx}px),calc(-50% + ${ty}px)) scale(.15)`,opacity:0}],{duration:430+Math.random()*180,easing:'cubic-bezier(.2,.68,.32,1)'});an.onfinish=()=>{drops--;d.remove()}}
  const hint=document.createElement('div');hint.className='hero-interact-hint';hint.textContent=matchMedia('(pointer:coarse)').matches?'DRAG THROUGH WORLDS':'MOVE THROUGH WORLDS';line.parentElement?.appendChild(hint);
  const pointer=e=>{const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;if(lastX!==null){const speed=Math.hypot(x-lastX,y-lastY);push(x,y,speed);if(Math.random()<.22&&isInk(x,y))drop(e.clientX,e.clientY)}lastX=x;lastY=y;if(!used){used=true;hint.classList.add('is-used');line.classList.add('is-active')}};
  line.addEventListener('pointermove',pointer,{passive:true});line.addEventListener('pointerdown',e=>{lastX=null;lastY=null;pointer(e)});line.addEventListener('pointerleave',()=>{lastX=lastY=null;line.classList.remove('is-active')});
  const io=new IntersectionObserver(entries=>{if(!entries[0]?.isIntersecting&&raf){cancelAnimationFrame(raf);raf=0;drawBase()}},{threshold:0});io.observe(line);
  drawSource();
  setTimeout(()=>{if(!used&&!matchMedia('(prefers-reduced-motion: reduce)').matches){push(W*.55,H*.55,9);for(let i=0;i<3;i++)setTimeout(()=>drop(innerWidth*.5+(i-1)*14,innerHeight*.5+18),i*70)}},1150);
  window.__heroWorldsEngine={setText(value){currentText=value||'WORLDS';drawSource()},push};
}

document.addEventListener('DOMContentLoaded',()=>{
  const start=()=>{v42BindBackgroundTrack();dragController?.refresh?.()};
  if(document.fonts?.load)document.fonts.load("900 120px Outfit").finally(()=>requestAnimationFrame(start));else requestAnimationFrame(start);
});
