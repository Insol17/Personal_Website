/* V44 — exact return surfaces, direct rail thumb, white liquid WORLDS, concise ABOUT. */

(function(){
  const oldHeadline='규칙을 설계하고, 그 규칙이 플레이어의 선택과 감정으로 이어지게 만듭니다.';
  const oldParaStart='게임의 세계는 배경 설정만으로 만들어지지 않는다고 생각합니다.';
  window.v44NormalizeAbout=function(about={}){
    const a={...about};
    if(!a.headline||a.headline===oldHeadline)a.headline='규칙을 설계하고, 플레이어의 선택으로 검증합니다.';
    const ps=Array.isArray(a.paragraphs)?[...a.paragraphs]:[];
    if(!ps.length||String(ps[0]||'').startsWith(oldParaStart)||ps.join('').length>430){
      a.paragraphs=['전투·자원·상태·UI를 하나의 플레이 흐름으로 연결하고, 구현과 플레이테스트에서 드러난 마찰을 다시 설계에 반영합니다.'];
    }
    if(!a.detailIntro||a.detailIntro==='결과물보다 그 결과를 만든 판단을 설명할 수 있는 기획자가 되고자 합니다.')a.detailIntro='시스템과 전투를 설계하고, 직접 구현하며 플레이 결과로 판단을 검증합니다.';
    if(!Array.isArray(a.detailNotes)||a.detailNotes.length===0||String(a.detailNotes[0]||'').startsWith('게임을 하나의 규칙 시스템으로 보고')||a.detailNotes.join('').length>300){
      a.detailNotes=[
        '핵심 경험을 먼저 정하고, 필요한 규칙과 정보 구조를 뒤에서 설계합니다.',
        '프로토타입과 구현에서 생긴 마찰을 다시 기획에 반영합니다.',
        '범위와 우선순위를 하나의 플레이 경험 목표에 맞춰 정리합니다.'
      ];
    }
    return a;
  };

  const baseApplyAbout=applyAbout;
  applyAbout=function(about){baseApplyAbout(v44NormalizeAbout(about));v44ApplyPracticeCopy();};

  function v44ApplyPracticeCopy(){
    const head=document.querySelector('.about-practice-head h3');if(head)head.textContent='WHAT I DO';
    const rows=[
      ['SYSTEMS','규칙·자원·상태를 연결해 플레이어의 판단 구조를 설계합니다.'],
      ['COMBAT','입력·수치·위험 보상을 조합해 전투의 리듬을 만듭니다.'],
      ['UX','복잡한 정보를 빠르게 읽고 조작할 수 있게 정리합니다.'],
      ['DIRECTION','의도·제약·우선순위를 하나의 경험 목표로 정렬합니다.']
    ];
    document.querySelectorAll('.about-practice-grid article').forEach((article,i)=>{const row=rows[i];if(!row)return;const strong=article.querySelector('strong'),p=article.querySelector('p');if(strong)strong.textContent=row[0];if(p)p.textContent=row[1]});
  }
  window.v44ApplyPracticeCopy=v44ApplyPracticeCopy;
})();

// Social/contact actions are a HERO-level decision point, not a footer-only element.
function v44SocialIcon(kind){
  const map={
    mail:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.5h18v13H3z"/><path d="m4 7 8 6 8-6"/></svg>',
    github:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8a9.4 9.4 0 0 0-3 18.3c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 0 1.6 1.1 1.6 1.1.9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.7-1.4-2.3-.3-4.7-1.1-4.7-5a3.9 3.9 0 0 1 1-2.7 3.6 3.6 0 0 1 .1-2.7s.8-.3 2.8 1a9.6 9.6 0 0 1 5 0c2-1.3 2.8-1 2.8-1a3.6 3.6 0 0 1 .1 2.7 3.9 3.9 0 0 1 1 2.7c0 3.9-2.4 4.7-4.7 5 .4.3.7 1 .7 1.9v2.8c0 .3.2.6.7.5A9.4 9.4 0 0 0 12 2.8Z"/></svg>',
    linkedin:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.3" y="3.3" width="17.4" height="17.4" rx="2"/><path d="M7.4 10v7M7.4 7.2v.1M11 17v-7m0 3c.5-2.2 5-2.4 5 1.2V17"/></svg>',
    blog:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5h14v15H5z"/><path d="M8 8h8M8 11.5h8M8 15h5"/></svg>'
  };return map[kind]||'';
}
function v44MountHeroActions(c={}){
  const copy=document.querySelector('.hero-copy');if(!copy)return;
  let root=copy.querySelector('.hero-social-v44');if(!root){root=document.createElement('div');root.className='hero-social-v44';root.setAttribute('aria-label','외부 링크');copy.appendChild(root)}
  const links=[['mail','MAIL',c.email?`mailto:${c.email}`:''],['github','GITHUB',c.github],['linkedin','LINKEDIN',c.linkedin],['blog','BLOG',c.blog]].filter(x=>x[2]);
  root.innerHTML=links.map(([kind,label,href])=>`<a href="${esc(href)}" data-kind="${kind}" data-label="${label}" aria-label="${label}" ${href.startsWith('mailto:')?'':'target="_blank" rel="noreferrer"'}>${v44SocialIcon(kind)}</a>`).join('');
}
renderContact=function(c){
  const root=document.querySelector('#contactContent');if(!root)return;
  let head=Array.isArray(c.headline)?[...c.headline]:['LET’S TALK','ABOUT WORLDS.'];if(/^ABOUT\s+SYSTEMS\.?$/i.test(String(head[1]||'').trim()))head[1]='ABOUT WORLDS.';
  root.innerHTML=`<div class="contact-kicker">CONTACT / OPEN FOR CONVERSATION</div><h2><span>${esc(head[0]||'')}</span><span>${esc(head[1]||'')}</span></h2>`;
  v44MountHeroActions(c);
};

// Exact desktop scrollbar: the grabbed point stays under the pointer with no ratio lag.
bindDragRail=function(stage,rail,legacyProgress){
  if(!stage||!rail)return null;
  const coarse=matchMedia('(max-width:760px), (pointer:coarse)').matches;
  let nav=stage.parentElement?.querySelector('.works-nav-v42');
  if(nav)nav.remove();
  nav=document.createElement('div');nav.className='works-nav-v42';nav.innerHTML='<span class="works-nav-label">DRAG / BAR / ARROWS</span><button class="works-arrow-v42 works-prev-v42" type="button" aria-label="이전 프로젝트">←</button><div class="works-range-v42"><button class="works-range-thumb-v42" type="button" aria-label="프로젝트 위치 조절" role="slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></button></div><button class="works-arrow-v42 works-next-v42" type="button" aria-label="다음 프로젝트">→</button>';stage.insertAdjacentElement('afterend',nav);
  const prev=nav.querySelector('.works-prev-v42'),next=nav.querySelector('.works-next-v42'),range=nav.querySelector('.works-range-v42'),thumb=nav.querySelector('.works-range-thumb-v42');
  let locked=false,x=0,max=0,cardStep=260,pointerDown=false,dragging=false,activePointer=null,startPointer=0,startX=0,suppressClickUntil=0,thumbDown=false,thumbPointer=null,grabOffset=0;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),threshold=7;
  const scrollMax=()=>coarse?Math.max(0,stage.scrollWidth-stage.clientWidth):max;
  const getRatio=()=>{const m=scrollMax();return m?clamp((coarse?stage.scrollLeft:Math.abs(x))/m,0,1):0};
  const geom=()=>{const rw=Math.max(1,range.clientWidth),total=coarse?stage.scrollWidth:stage.clientWidth+max,frac=total?clamp(stage.clientWidth/total,.12,1):1,width=Math.min(rw,Math.max(54,rw*frac));return{rw,width,travel:Math.max(0,rw-width)}};
  const paint=()=>{const r=getRatio(),g=geom();thumb.style.width=`${g.width}px`;thumb.style.left=`${g.travel*r}px`;thumb.setAttribute('aria-valuenow',String(Math.round(r*100)));prev.classList.toggle('is-hidden',r<=.001);next.classList.toggle('is-hidden',r>=.999||scrollMax()<=1);if(legacyProgress)legacyProgress.dataset.progress=String(r);stage.dataset.dragProgress=String(r)};
  const draw=()=>{if(!coarse)rail.style.transform=`translate3d(${x}px,0,0)`;paint()};
  const setRatio=(r)=>{r=clamp(r,0,1);if(coarse)stage.scrollLeft=scrollMax()*r;else{x=-max*r;rail.style.transform=`translate3d(${x}px,0,0)`}paint()};
  const metrics=()=>{if(locked)return;const cards=[...rail.children],gap=parseFloat(getComputedStyle(rail).gap||'12')||12,w=stage.clientWidth;if(coarse){rail.style.transform='none';rail.style.width='max-content';const first=rail.querySelector('.project-card');cardStep=(first?.getBoundingClientRect().width||260)+gap;requestAnimationFrame(paint);return}const visible=w>=1180?5:w>=820?3:2,cw=(w-gap*(visible-1))/visible;cards.forEach(c=>c.style.width=`${cw}px`);cardStep=cw+gap;const total=cards.length?cards.length*cw+(cards.length-1)*gap:0;rail.style.width=`${Math.max(w,total)}px`;max=Math.max(0,total-w);x=clamp(x,-max,0);draw();stage.classList.toggle('has-overflow',max>1)};
  const step=dir=>{if(coarse)stage.scrollBy({left:dir*cardStep,behavior:'smooth'});else{x=clamp(x-dir*cardStep,-max,0);rail.style.transform=`translate3d(${x}px,0,0)`;paint()}};prev.onclick=()=>step(-1);next.onclick=()=>step(1);
  range.addEventListener('pointerdown',e=>{if(locked||e.target===thumb)return;const rr=range.getBoundingClientRect(),g=geom();setRatio(g.travel?clamp(e.clientX-rr.left-g.width/2,0,g.travel)/g.travel:0)});
  thumb.addEventListener('pointerdown',e=>{if(locked||(e.pointerType==='mouse'&&e.button!==0))return;e.preventDefault();e.stopPropagation();thumbDown=true;thumbPointer=e.pointerId;nav.classList.add('is-thumb-dragging');const rr=range.getBoundingClientRect(),tr=thumb.getBoundingClientRect();grabOffset=e.clientX-tr.left;try{thumb.setPointerCapture(e.pointerId)}catch{}});
  thumb.addEventListener('pointermove',e=>{if(!thumbDown||e.pointerId!==thumbPointer)return;e.preventDefault();const rr=range.getBoundingClientRect(),g=geom(),left=clamp(e.clientX-rr.left-grabOffset,0,g.travel);thumb.style.left=`${left}px`;setRatio(g.travel?left/g.travel:0)});
  const thumbUp=e=>{if(!thumbDown||e.pointerId!==thumbPointer)return;thumbDown=false;nav.classList.remove('is-thumb-dragging');try{thumb.releasePointerCapture(e.pointerId)}catch{}paint()};thumb.addEventListener('pointerup',thumbUp);thumb.addEventListener('pointercancel',thumbUp);
  let scrollRaf=0;const onScroll=()=>{if(scrollRaf||thumbDown)return;scrollRaf=requestAnimationFrame(()=>{scrollRaf=0;paint()})};if(coarse)stage.addEventListener('scroll',onScroll,{passive:true});
  const down=e=>{if(coarse||locked||(e.pointerType==='mouse'&&e.button!==0))return;pointerDown=true;dragging=false;activePointer=e.pointerId;startPointer=e.clientX;startX=x};
  const move=e=>{if(coarse||locked||!pointerDown||e.pointerId!==activePointer)return;const dx=e.clientX-startPointer;if(!dragging&&Math.abs(dx)>=threshold){dragging=true;stage.classList.add('is-dragging');try{stage.setPointerCapture(e.pointerId)}catch{}}if(!dragging)return;e.preventDefault();x=clamp(startX+dx,-max,0);draw()};
  const up=e=>{if(coarse||!pointerDown||e.pointerId!==activePointer)return;const was=dragging;pointerDown=false;dragging=false;activePointer=null;stage.classList.remove('is-dragging');try{stage.releasePointerCapture(e.pointerId)}catch{}if(was)suppressClickUntil=performance.now()+160};
  stage.addEventListener('pointerdown',down);stage.addEventListener('pointermove',move,{passive:false});stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',up);stage.addEventListener('click',e=>{if(performance.now()<suppressClickUntil){e.preventDefault();e.stopPropagation()}},true);stage.addEventListener('dragstart',e=>e.preventDefault());
  rail.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();step(1)}else if(e.key==='ArrowLeft'){e.preventDefault();step(-1)}});
  const ro=new ResizeObserver(metrics);ro.observe(stage);ro.observe(range);requestAnimationFrame(metrics);
  return{destroy(){ro.disconnect();if(coarse)stage.removeEventListener('scroll',onScroll);nav.remove()},getIndex(){return Math.round((coarse?stage.scrollLeft:Math.abs(x))/Math.max(1,cardStep))},setIndex(i){if(coarse)stage.scrollLeft=Math.max(0,(Number(i)||0)*cardStep);else{x=clamp(-(Number(i)||0)*cardStep,-max,0);draw()}},getX(){return coarse?-stage.scrollLeft:x},setX(value){if(coarse)stage.scrollLeft=Math.max(0,-(Number(value)||0));else{x=clamp(Number(value)||0,-max,0);draw()}requestAnimationFrame(paint)},lock(){locked=true;if(coarse)stage.style.overflowX='hidden'},unlock(){locked=false;if(coarse)stage.style.overflowX='auto';metrics()},moveRatio:setRatio,refresh:metrics};
};

// Return to the exact surface that launched the case study.
async function v44FindReturnTarget(data){
  document.documentElement.classList.add('is-restoring-project');
  const surface=data?.surface||'works';
  const featured=document.querySelector('#featuredProjects'),works=document.querySelector('#worksStage'),archive=document.querySelector('#archiveGrid');
  const scope=surface==='featured'?featured:surface==='archive'?archive:works;
  if(!scope)return null;
  const selectorFor=slug=>{const s=String(slug||''),safe=window.CSS?.escape?CSS.escape(s):s.replace(/[^a-zA-Z0-9_-]/g,'');return `.project-transition-link[data-project="${safe}"]`};
  let link=null;for(let i=0;i<70&&!link;i++){link=scope.querySelector(selectorFor(data.slug));if(!link&&surface==='featured'&&data.originSlug)link=scope.querySelector(selectorFor(data.originSlug));if(!link)await v33Wait(20)}if(!link)return null;
  if(surface==='works'&&Number.isFinite(data.railX))dragController?.setX?.(data.railX,false);
  let y=Number.isFinite(data.scrollY)?data.scrollY:null;if(!Number.isFinite(y)){const section=surface==='featured'?document.querySelector('#featured'):surface==='archive'?document.querySelector('.archive-main'):document.querySelector('#portfolio');if(section)y=Math.max(0,section.offsetTop+12)}if(Number.isFinite(y))scrollTo({top:y,left:0,behavior:'auto'});
  for(let i=0;i<4;i++){if(surface==='works'&&Number.isFinite(data.railX))dragController?.setX?.(data.railX,false);await v33NextFrame()}
  const image=link.querySelector('.project-card-image');if(!image)return null;try{if(!image.complete)await v33WithTimeout(new Promise(r=>{image.addEventListener('load',r,{once:true});image.addEventListener('error',r,{once:true})}),700);await v33WithTimeout(image.decode?.()||Promise.resolve(),320)}catch{}
  if(surface==='works'){let rect=image.getBoundingClientRect(),sr=works.getBoundingClientRect();if(rect.left<sr.left&&dragController?.setX)dragController.setX((dragController.getX?.()||0)+(sr.left-rect.left),false);else if(rect.right>sr.right&&dragController?.setX)dragController.setX((dragController.getX?.()||0)-(rect.right-sr.right),false);await v33NextFrame()}
  let r=image.getBoundingClientRect();if(r.bottom<72||r.top>innerHeight-40){const section=surface==='featured'?document.querySelector('#featured'):surface==='archive'?document.querySelector('.archive-main'):document.querySelector('#portfolio');if(section){scrollTo({top:Math.max(0,scrollY+section.getBoundingClientRect().top-86),behavior:'auto'});await v33NextFrame()}}
  dragController?.lock?.();return link;
}
playReverseProjectTransition=async function(){
  if(reverseTransitionRunning)return false;const data=v33ReadJSON('portfolioReturnTransition');if(!data?.slug||!data?.image)return false;
  reverseTransitionRunning=true;let failSafe=null;
  const recover=()=>{cleanupProjectTransition({releaseBoot:true});document.documentElement.classList.remove('is-restoring-project');dragController?.unlock?.();v33ClearTransitionState();reverseTransitionRunning=false};failSafe=setTimeout(recover,3200);
  try{
    const link=await v44FindReturnTarget(data);if(!link)throw new Error('target');const image=link.querySelector('.project-card-image');if(!image)throw new Error('image');
    const targetSlug=link.dataset.project||'';const surfaceOnly=data.surface==='featured'&&targetSlug!==data.slug;
    const card=link.closest('.project-card')||link.closest('.featured-project');
    if(surfaceOnly){await v33NextFrame();document.documentElement.classList.add('reverse-arrival-release');await v33Wait(110);document.documentElement.classList.remove('reverse-arrival-pending','reverse-arrival-release');document.documentElement.style.removeProperty('--transition-image');await v33Wait(90);}else{
      const rect=image.getBoundingClientRect();if(rect.width<2||rect.height<2)throw new Error('hidden');card?.classList.add('is-return-target');
      const clone=document.createElement('img');clone.src=data.image;clone.alt='';clone.className='transition-clone transition-surface transition-return-clone';Object.assign(clone.style,{left:'0px',top:'0px',width:`${innerWidth}px`,height:`${innerHeight}px`,borderRadius:'0px',objectFit:'cover',objectPosition:getComputedStyle(image).objectPosition||'50% 50%',opacity:'1'});document.body.appendChild(clone);try{await v33WithTimeout(clone.decode?.()||Promise.resolve(),320)}catch{}
      await v33NextFrame();document.documentElement.classList.add('reverse-arrival-release');await v33Wait(85);document.documentElement.classList.remove('reverse-arrival-pending','reverse-arrival-release');document.documentElement.style.removeProperty('--transition-image');await v33NextFrame();
      const anim=clone.animate([{left:'0px',top:'0px',width:`${innerWidth}px`,height:`${innerHeight}px`,borderRadius:'0px'},{left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`,borderRadius:getComputedStyle(image).borderRadius||'10px'}],{duration:460,easing:'cubic-bezier(.2,.78,.16,1)',fill:'forwards'});await v33WithTimeout(anim.finished.catch(()=>{}),560);card?.classList.remove('is-return-target');clone.remove();
    }
    document.documentElement.classList.remove('is-restoring-project');dragController?.unlock?.();v33ClearTransitionState();clearTimeout(failSafe);reverseTransitionRunning=false;return true;
  }catch{clearTimeout(failSafe);recover();return false}
};window.playReverseProjectTransition=playReverseProjectTransition;

// Replace the tinted V43 wordmark with the supplied Yellowtail form rendered in white.
function initHeroWorldsV44(){
  const h1=document.querySelector('.hero-copy h1');if(!h1)return;const old=h1.querySelector('span:nth-child(2)');if(!old)return;
  const line=old.cloneNode(false);line.textContent='';line.className='hero-worlds-liquid-v44';line.innerHTML='<span class="hero-worlds-a11y">WORLDS</span><canvas aria-hidden="true"></canvas>';old.replaceWith(line);
  document.querySelector('.hero-interact-hint-v43')?.remove();const hint=document.createElement('span');hint.className='hero-interact-hint-v43';hint.textContent=matchMedia('(pointer:coarse)').matches?'DRAG THROUGH WORLDS':'MOVE THROUGH WORLDS';line.insertAdjacentElement('afterend',hint);
  const canvas=line.querySelector('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)return;const W=780,H=300,DPR=Math.min(devicePixelRatio||1,2);canvas.width=W*DPR;canvas.height=H*DPR;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.scale(DPR,DPR);
  const src=document.createElement('canvas');src.width=canvas.width;src.height=canvas.height;const sctx=src.getContext('2d');sctx.scale(DPR,DPR);let sourceData=null,raf=0,prevX=null,prevY=null,drops=0;
  const drawSource=()=>{sctx.clearRect(0,0,W,H);sctx.font="170px 'Yellowtail', cursive";sctx.textBaseline='alphabetic';const text='WORLDS',m=sctx.measureText(text),x=(W-m.width)/2,base=210,asc=m.actualBoundingBoxAscent||128,desc=m.actualBoundingBoxDescent||46,top=base-asc,bottom=base+desc,gh=bottom-top;sctx.save();sctx.shadowColor='rgba(255,255,255,.28)';sctx.shadowBlur=22;sctx.fillStyle='rgba(255,255,255,.36)';sctx.fillText(text,x,base);sctx.restore();const g=sctx.createLinearGradient(0,top,0,bottom);g.addColorStop(0,'rgba(255,255,255,.98)');g.addColorStop(.48,'rgba(255,255,255,.90)');g.addColorStop(1,'rgba(255,255,255,.64)');sctx.fillStyle=g;sctx.fillText(text,x,base);sctx.save();sctx.globalCompositeOperation='source-atop';const shine=sctx.createLinearGradient(0,top,0,top+gh*.42);shine.addColorStop(0,'rgba(255,255,255,.72)');shine.addColorStop(1,'rgba(255,255,255,0)');sctx.fillStyle=shine;sctx.fillRect(0,0,W,H);sctx.restore();sctx.save();sctx.globalCompositeOperation='source-atop';const shade=sctx.createLinearGradient(0,top+gh*.55,0,bottom);shade.addColorStop(0,'rgba(6,12,13,0)');shade.addColorStop(1,'rgba(6,12,13,.22)');sctx.fillStyle=shade;sctx.fillRect(0,0,W,H);sctx.restore();sctx.lineWidth=1.1;sctx.strokeStyle='rgba(255,255,255,.68)';sctx.strokeText(text,x,base);sourceData=sctx.getImageData(0,0,canvas.width,canvas.height);ctx.clearRect(0,0,W,H);ctx.drawImage(src,0,0,W,H)};
  const spacing=7,cols=Math.ceil(W/spacing)+1,rows=Math.ceil(H/spacing)+1,dx=new Float32Array(cols*rows),dy=new Float32Array(cols*rows),radius=26,strength=1.8,maxDisp=30,relax=.84,eps=.15,idx=(c,r)=>r*cols+c;
  const sample=(px,py)=>{const gx=px/spacing,gy=py/spacing,c0=clampInt(Math.floor(gx),0,cols-2),r0=clampInt(Math.floor(gy),0,rows-2),c1=c0+1,r1=r0+1,tx=Math.max(0,Math.min(1,gx-c0)),ty=Math.max(0,Math.min(1,gy-r0)),i00=idx(c0,r0),i10=idx(c1,r0),i01=idx(c0,r1),i11=idx(c1,r1);return[(dx[i00]*(1-tx)+dx[i10]*tx)*(1-ty)+(dx[i01]*(1-tx)+dx[i11]*tx)*ty,(dy[i00]*(1-tx)+dy[i10]*tx)*(1-ty)+(dy[i01]*(1-tx)+dy[i11]*tx)*ty]};function clampInt(v,a,b){return Math.max(a,Math.min(b,v))}
  const push=(mx,my,vx,vy)=>{if(!vx&&!vy)return;for(let r=Math.max(0,Math.floor((my-radius)/spacing));r<=Math.min(rows-1,Math.ceil((my+radius)/spacing));r++)for(let c=Math.max(0,Math.floor((mx-radius)/spacing));c<=Math.min(cols-1,Math.ceil((mx+radius)/spacing));c++){const cx=c*spacing,cy=r*spacing,ddx=cx-mx,ddy=cy-my,d=Math.hypot(ddx,ddy);if(d>radius)continue;const f=(1-d/radius)**2,i=idx(c,r);dx[i]+=vx*f*strength;dy[i]+=vy*f*strength;const mag=Math.hypot(dx[i],dy[i]);if(mag>maxDisp){const q=maxDisp/mag;dx[i]*=q;dy[i]*=q}}startLoop()};
  const bounds=()=>{let minC=cols,maxC=-1,minR=rows,maxR=-1;for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const i=idx(c,r);dx[i]*=relax;dy[i]*=relax;if(Math.abs(dx[i])<eps)dx[i]=0;if(Math.abs(dy[i])<eps)dy[i]=0;if(dx[i]||dy[i]){minC=Math.min(minC,c);maxC=Math.max(maxC,c);minR=Math.min(minR,r);maxR=Math.max(maxR,r)}}return maxC<0?null:{x0:Math.max(0,(minC-1)*spacing),y0:Math.max(0,(minR-1)*spacing),x1:Math.min(W,(maxC+2)*spacing),y1:Math.min(H,(maxR+2)*spacing)}};
  const distort=b=>{if(!sourceData)return;const x0=Math.floor(b.x0*DPR),y0=Math.floor(b.y0*DPR),x1=Math.ceil(b.x1*DPR),y1=Math.ceil(b.y1*DPR),ww=x1-x0,hh=y1-y0;if(ww<=0||hh<=0)return;const reg=ctx.createImageData(ww,hh),out=reg.data,sd=sourceData.data,bw=canvas.width,bh=canvas.height;for(let y=0;y<hh;y++){const py=y0+y,cy=py/DPR;for(let x=0;x<ww;x++){const px=x0+x,cx=px/DPR,[sxD,syD]=sample(cx,cy),sx=Math.round(px-sxD*DPR),sy=Math.round(py-syD*DPR),oi=(y*ww+x)*4;if(sx>=0&&sx<bw&&sy>=0&&sy<bh){const si=(sy*bw+sx)*4;out[oi]=sd[si];out[oi+1]=sd[si+1];out[oi+2]=sd[si+2];out[oi+3]=sd[si+3]}}}ctx.putImageData(reg,x0,y0)};
  function frame(){raf=0;ctx.clearRect(0,0,W,H);ctx.drawImage(src,0,0,W,H);const b=bounds();if(b){distort(b);raf=requestAnimationFrame(frame)}}function startLoop(){if(!raf)raf=requestAnimationFrame(frame)}
  const isInk=(x,y)=>{if(!sourceData)return false;const bx=Math.round(x*DPR),by=Math.round(y*DPR);return bx>=0&&by>=0&&bx<canvas.width&&by<canvas.height&&sourceData.data[(by*canvas.width+bx)*4+3]>40};
  const drop=(clientX,clientY)=>{if(drops>=7)return;drops++;const d=document.createElement('i');d.className='hero-worlds-droplet-v44';d.style.left=clientX+'px';d.style.top=clientY+'px';document.body.appendChild(d);const a=Math.random()*Math.PI*2,dist=15+Math.random()*28,tx=Math.cos(a)*dist,ty=Math.sin(a)*dist+34;const an=d.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:.86},{transform:`translate(calc(-50% + ${tx*.5}px),calc(-50% + ${ty*.4}px)) scale(.82)`,opacity:1,offset:.42},{transform:`translate(calc(-50% + ${tx}px),calc(-50% + ${ty}px)) scale(.2)`,opacity:0}],{duration:480+Math.random()*160,easing:'cubic-bezier(.22,.68,.35,1)'});an.onfinish=()=>{drops--;d.remove()}};
  const move=e=>{const r=canvas.getBoundingClientRect(),mx=(e.clientX-r.left)*(W/r.width),my=(e.clientY-r.top)*(H/r.height);if(prevX!==null)push(mx,my,mx-prevX,my-prevY);prevX=mx;prevY=my;hint.classList.add('is-used');if(Math.random()<.4&&isInk(mx,my))drop(e.clientX,e.clientY)};line.addEventListener('pointermove',move,{passive:true});line.addEventListener('pointerleave',()=>{prevX=prevY=null});
  const init=()=>{drawSource();requestAnimationFrame(()=>{push(W*.44,H*.51,10,-1);setTimeout(()=>push(W*.53,H*.51,-7,2),75)})};if(document.fonts?.load)document.fonts.load("170px 'Yellowtail'").then(init).catch(init);else init();
}

document.addEventListener('DOMContentLoaded',()=>{requestAnimationFrame(()=>{v44ApplyPracticeCopy();v44MountHeroActions(SITE_DATA?.contact||{});renderContact(SITE_DATA?.contact||{})})});
