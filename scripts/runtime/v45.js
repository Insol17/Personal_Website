/* V45 — final HERO wordmark + URL-carried project transitions that also work under file://. */

(function(){
  const LEGACY_KEYS=['portfolioTransitionImage','portfolioTransitionTarget','portfolioTransitionOrigin','portfolioTransitionOriginState','portfolioReverseTransition','portfolioReturnTransition','portfolioLastDetail','portfolioDetailChain'];
  try{LEGACY_KEYS.forEach(k=>sessionStorage.removeItem(k))}catch{}

  const q=()=>new URLSearchParams(location.search);
  const num=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const frames=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  const safeSlug=s=>{const v=String(s||'');return window.CSS?.escape?CSS.escape(v):v.replace(/[^a-zA-Z0-9_-]/g,'')};

  function cleanTransitionParams(){
    try{
      const u=new URL(location.href);['ptr','ptrslug','ptrentry','pts','ptscroll','ptrail','ptrimg','pt'].forEach(k=>u.searchParams.delete(k));
      history.replaceState(history.state,'',u.pathname+u.search+u.hash);
    }catch{}
  }

  function surfaceOf(link){
    if(link.closest('#featured'))return'featured';
    if(link.closest('#archiveGrid'))return'archive';
    return'works';
  }

  function imageForLink(link){
    return link.querySelector('.project-card-image')||link.closest('.featured-project,.project-card')?.querySelector('.project-card-image')||null;
  }

  function sourceState(link,image){
    const surface=surfaceOf(link),slug=link.dataset.project||link.closest('[data-project]')?.dataset.project||'';
    let railX=null,railIndex=null;
    if(surface==='works'){
      try{railX=dragController?.getX?.()??null;railIndex=dragController?.getIndex?.()??null}catch{}
    }
    return{surface,slug,entry:slug,scroll:Math.round(scrollY),railX,railIndex,image:image.currentSrc||image.src||''};
  }

  function destinationWithState(href,state){
    const u=new URL(href,location.href);u.searchParams.set('pt','1');u.searchParams.set('pts',state.surface);u.searchParams.set('ptentry',state.entry);u.searchParams.set('ptscroll',String(state.scroll));
    if(Number.isFinite(state.railX))u.searchParams.set('ptrail',String(state.railX));
    if(state.image)u.searchParams.set('ptimg',state.image);
    return u.href;
  }

  async function forwardProject(link,event){
    const image=imageForLink(link);if(!image)return;
    const state=sourceState(link,image),url=destinationWithState(link.href,state);
    if(reduced()){location.assign(url);return}
    const r=image.getBoundingClientRect();if(r.width<2||r.height<2){location.assign(url);return}
    const clone=image.cloneNode(true);clone.removeAttribute('loading');clone.className='transition-v45-clone';
    Object.assign(clone.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',borderRadius:getComputedStyle(image).borderRadius||'12px',objectPosition:getComputedStyle(image).objectPosition||'50% 50%',opacity:'1'});
    document.body.appendChild(clone);link.closest('.project-card,.featured-project')?.classList.add('is-v45-return-target');
    try{await clone.decode?.()}catch{}
    await frames();
    const anim=clone.animate([
      {left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',borderRadius:getComputedStyle(image).borderRadius||'12px'},
      {left:'0px',top:'0px',width:innerWidth+'px',height:innerHeight+'px',borderRadius:'0px'}
    ],{duration:390,easing:'cubic-bezier(.2,.76,.18,1)',fill:'forwards'});
    try{await Promise.race([anim.finished,sleep(450)])}catch{}
    location.assign(url);
  }

  // Replace the legacy binder before DOMContentLoaded rendering. Stage-level drag suppression
  // still gets first refusal, so a drag release can never be mistaken for a project click.
  bindProjectTransitions=function(scope=document){
    scope.querySelectorAll('.project-transition-link').forEach(link=>{
      if(link.dataset.transitionBoundV45)return;link.dataset.transitionBoundV45='1';
      link.addEventListener('click',event=>{
        if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
        event.preventDefault();event.stopImmediatePropagation();forwardProject(link,event).catch(()=>location.assign(link.href));
      });
    });
  };
  window.bindProjectTransitions=bindProjectTransitions;

  function findTarget(surface,slug,entry){
    const root=surface==='featured'?document.querySelector('#featuredProjects'):surface==='archive'?document.querySelector('#archiveGrid'):document.querySelector('#worksStage');
    if(!root)return null;
    const current=root.querySelector(`.project-transition-link[data-project="${safeSlug(slug)}"]`);
    if(current)return current;
    if(surface==='featured'&&entry)return root.querySelector(`.project-transition-link[data-project="${safeSlug(entry)}"]`);
    return null;
  }

  async function waitTarget(surface,slug,entry){
    for(let i=0;i<90;i++){const t=findTarget(surface,slug,entry);if(t)return t;await sleep(20)}return null;
  }

  async function restoreReturn(){
    const p=q();if(p.get('ptr')!=='1')return false;
    document.documentElement.classList.add('site-boot-bypass');
    const surface=['featured','works','archive'].includes(p.get('pts'))?p.get('pts'):'works';
    const slug=p.get('ptrslug')||'',entry=p.get('ptrentry')||slug,scroll=num(p.get('ptscroll')),railX=num(p.get('ptrail')),img=p.get('ptrimg')||'';
    const target=await waitTarget(surface,slug,entry);
    const section=surface==='featured'?document.querySelector('#featured'):surface==='archive'?document.querySelector('.archive-main'):document.querySelector('#portfolio');
    if(surface==='works'&&Number.isFinite(railX))try{dragController?.setX?.(railX,false)}catch{}
    if(Number.isFinite(scroll))scrollTo({top:scroll,left:0,behavior:'auto'});else if(section)scrollTo({top:Math.max(0,section.offsetTop-20),left:0,behavior:'auto'});
    for(let i=0;i<4;i++){if(surface==='works'&&Number.isFinite(railX))try{dragController?.setX?.(railX,false)}catch{}await frames()}
    if(!target){document.documentElement.classList.add('pt-return-release');setTimeout(()=>{document.documentElement.classList.remove('pt-return-arrival','pt-return-release');document.documentElement.style.removeProperty('--pt-v45-image');cleanTransitionParams()},90);return false}
    const image=imageForLink(target);if(!image)return false;
    try{if(!image.complete)await Promise.race([new Promise(r=>{image.addEventListener('load',r,{once:true});image.addEventListener('error',r,{once:true})}),sleep(500)]);await Promise.race([image.decode?.()||Promise.resolve(),sleep(300)])}catch{}
    if(surface==='works'){
      const stage=document.querySelector('#worksStage');let r=image.getBoundingClientRect(),sr=stage?.getBoundingClientRect();
      if(stage&&sr&&dragController?.setX){if(r.left<sr.left)dragController.setX((dragController.getX?.()||0)+(sr.left-r.left),false);else if(r.right>sr.right)dragController.setX((dragController.getX?.()||0)-(r.right-sr.right),false);await frames()}
    }
    let r=image.getBoundingClientRect();
    if(r.bottom<60||r.top>innerHeight-40){target.scrollIntoView({block:'center',inline:'nearest',behavior:'auto'});await frames();r=image.getBoundingClientRect()}
    const actualSlug=target.dataset.project||'';
    // If the user entered through FEATURED and navigated to a non-featured project, return to the entry surface without a fake morph to a different cover.
    if(surface==='featured'&&actualSlug!==slug){
      document.documentElement.classList.add('pt-return-release');await sleep(90);document.documentElement.classList.remove('pt-return-arrival','pt-return-release');document.documentElement.style.removeProperty('--pt-v45-image');cleanTransitionParams();return true;
    }
    const clone=document.createElement('img');clone.src=img||image.currentSrc||image.src;clone.alt='';clone.className='transition-v45-clone';Object.assign(clone.style,{left:'0px',top:'0px',width:innerWidth+'px',height:innerHeight+'px',borderRadius:'0px',objectPosition:getComputedStyle(image).objectPosition||'50% 50%',opacity:'1'});document.body.appendChild(clone);target.closest('.project-card,.featured-project')?.classList.add('is-v45-return-target');
    try{await Promise.race([clone.decode?.()||Promise.resolve(),sleep(350)])}catch{}
    await frames();document.documentElement.classList.add('pt-return-release');await sleep(55);document.documentElement.classList.remove('pt-return-arrival','pt-return-release');document.documentElement.style.removeProperty('--pt-v45-image');
    r=image.getBoundingClientRect();
    const anim=clone.animate([
      {left:'0px',top:'0px',width:innerWidth+'px',height:innerHeight+'px',borderRadius:'0px'},
      {left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',borderRadius:getComputedStyle(image).borderRadius||'12px'}
    ],{duration:430,easing:'cubic-bezier(.2,.78,.16,1)',fill:'forwards'});
    try{await Promise.race([anim.finished,sleep(500)])}catch{}
    target.closest('.project-card,.featured-project')?.classList.remove('is-v45-return-target');clone.remove();cleanTransitionParams();return true;
  }

  window.v45RestoreProjectReturn=restoreReturn;
})();

/* Exact requested wordmark: Yellowtail calligraphy, white only, directional liquid displacement + droplets. */
function initHeroWorldsV45(){
  const h1=document.querySelector('.hero-copy h1');if(!h1)return;
  const children=[...h1.children];const old=children[1];if(!old)return;
  if(old.classList.contains('hero-worlds-liquid-v45'))return;
  document.querySelectorAll('.hero-interact-hint,.hero-interact-hint-v43').forEach(el=>el.remove());
  const line=document.createElement('span');line.className='hero-worlds-liquid-v45';line.innerHTML='<span class="hero-worlds-a11y">WORLDS</span><span class="hero-worlds-fallback-v45" aria-hidden="true">WORLDS</span><canvas aria-hidden="true"></canvas>';old.replaceWith(line);
  const canvas=line.querySelector('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx){line.classList.add('is-font-fallback');return}
  const W=780,H=300,DPR=Math.min(devicePixelRatio||1,2);canvas.width=W*DPR;canvas.height=H*DPR;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(DPR,0,0,DPR,0,0);
  const src=document.createElement('canvas');src.width=canvas.width;src.height=canvas.height;const sctx=src.getContext('2d',{willReadFrequently:true});sctx.setTransform(DPR,0,0,DPR,0,0);
  let sourceData=null,prevX=null,prevY=null,raf=0,drops=0;
  const drawSource=()=>{
    sctx.clearRect(0,0,W,H);sctx.font="170px 'Yellowtail', cursive";sctx.textBaseline='alphabetic';
    const text='WORLDS',m=sctx.measureText(text),base=210,x=(W-m.width)/2;
    sctx.save();sctx.shadowColor='rgba(255,255,255,.20)';sctx.shadowBlur=20;sctx.fillStyle='rgba(255,255,255,.98)';sctx.fillText(text,x,base);sctx.restore();
    sctx.fillStyle='rgba(255,255,255,.97)';sctx.fillText(text,x,base);
    sourceData=sctx.getImageData(0,0,canvas.width,canvas.height);ctx.clearRect(0,0,W,H);ctx.drawImage(src,0,0,W,H);line.querySelector('.hero-worlds-fallback-v45').style.opacity='0';
  };
  const spacing=7,cols=Math.ceil(W/spacing)+1,rows=Math.ceil(H/spacing)+1,dx=new Float32Array(cols*rows),dy=new Float32Array(cols*rows),radius=26,strength=1.8,maxDisp=30,relax=.84,eps=.15,idx=(c,r)=>r*cols+c;
  const sample=(px,py)=>{const gx=px/spacing,gy=py/spacing,c0=Math.max(0,Math.min(cols-2,Math.floor(gx))),r0=Math.max(0,Math.min(rows-2,Math.floor(gy))),c1=c0+1,r1=r0+1,tx=Math.max(0,Math.min(1,gx-c0)),ty=Math.max(0,Math.min(1,gy-r0)),i00=idx(c0,r0),i10=idx(c1,r0),i01=idx(c0,r1),i11=idx(c1,r1);return[(dx[i00]*(1-tx)+dx[i10]*tx)*(1-ty)+(dx[i01]*(1-tx)+dx[i11]*tx)*ty,(dy[i00]*(1-tx)+dy[i10]*tx)*(1-ty)+(dy[i01]*(1-tx)+dy[i11]*tx)*ty]};
  const push=(mx,my,vx,vy)=>{if(!vx&&!vy)return;for(let r=Math.max(0,Math.floor((my-radius)/spacing));r<=Math.min(rows-1,Math.ceil((my+radius)/spacing));r++)for(let c=Math.max(0,Math.floor((mx-radius)/spacing));c<=Math.min(cols-1,Math.ceil((mx+radius)/spacing));c++){const cx=c*spacing,cy=r*spacing,ox=cx-mx,oy=cy-my,d=Math.hypot(ox,oy);if(d>radius)continue;const f=(1-d/radius)**2,i=idx(c,r);dx[i]+=vx*f*strength;dy[i]+=vy*f*strength;const mag=Math.hypot(dx[i],dy[i]);if(mag>maxDisp){const z=maxDisp/mag;dx[i]*=z;dy[i]*=z}}startLoop()};
  const bounds=()=>{let minC=cols,maxC=-1,minR=rows,maxR=-1;for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const i=idx(c,r);dx[i]*=relax;dy[i]*=relax;if(Math.abs(dx[i])<eps)dx[i]=0;if(Math.abs(dy[i])<eps)dy[i]=0;if(dx[i]||dy[i]){minC=Math.min(minC,c);maxC=Math.max(maxC,c);minR=Math.min(minR,r);maxR=Math.max(maxR,r)}}return maxC<0?null:{x0:Math.max(0,(minC-1)*spacing),y0:Math.max(0,(minR-1)*spacing),x1:Math.min(W,(maxC+2)*spacing),y1:Math.min(H,(maxR+2)*spacing)}};
  const distort=b=>{if(!sourceData)return;const x0=Math.floor(b.x0*DPR),y0=Math.floor(b.y0*DPR),x1=Math.ceil(b.x1*DPR),y1=Math.ceil(b.y1*DPR),ww=x1-x0,hh=y1-y0;if(ww<=0||hh<=0)return;const reg=ctx.createImageData(ww,hh),out=reg.data,sd=sourceData.data,bw=canvas.width,bh=canvas.height;for(let y=0;y<hh;y++){const py=y0+y,cy=py/DPR;for(let x=0;x<ww;x++){const px=x0+x,cx=px/DPR,[sxD,syD]=sample(cx,cy),sx=Math.round(px-sxD*DPR),sy=Math.round(py-syD*DPR),oi=(y*ww+x)*4;if(sx>=0&&sx<bw&&sy>=0&&sy<bh){const si=(sy*bw+sx)*4;out[oi]=sd[si];out[oi+1]=sd[si+1];out[oi+2]=sd[si+2];out[oi+3]=sd[si+3]}}}ctx.putImageData(reg,x0,y0)};
  function frame(){raf=0;ctx.clearRect(0,0,W,H);ctx.drawImage(src,0,0,W,H);const b=bounds();if(b){distort(b);raf=requestAnimationFrame(frame)}}function startLoop(){if(!raf)raf=requestAnimationFrame(frame)}
  const ink=(x,y)=>{if(!sourceData)return false;const bx=Math.round(x*DPR),by=Math.round(y*DPR);return bx>=0&&by>=0&&bx<canvas.width&&by<canvas.height&&sourceData.data[(by*canvas.width+bx)*4+3]>40};
  const drop=(clientX,clientY)=>{if(drops>=7)return;drops++;const d=document.createElement('i');d.className='hero-worlds-droplet-v45';d.style.left=clientX+'px';d.style.top=clientY+'px';document.body.appendChild(d);const a=Math.random()*Math.PI*2,dist=16+Math.random()*30,tx=Math.cos(a)*dist,ty=Math.sin(a)*dist+38;const an=d.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:.9},{transform:`translate(calc(-50% + ${tx*.5}px),calc(-50% + ${ty*.35}px)) scale(.8)`,opacity:1,offset:.38},{transform:`translate(calc(-50% + ${tx}px),calc(-50% + ${ty}px)) scale(.18)`,opacity:0}],{duration:520+Math.random()*180,easing:'cubic-bezier(.22,.68,.35,1)'});an.onfinish=()=>{drops--;d.remove()}};
  const move=e=>{const r=canvas.getBoundingClientRect(),mx=(e.clientX-r.left)*(W/r.width),my=(e.clientY-r.top)*(H/r.height);if(prevX!==null)push(mx,my,mx-prevX,my-prevY);prevX=mx;prevY=my;if(Math.random()<.42&&ink(mx,my))drop(e.clientX,e.clientY)};
  line.addEventListener('pointermove',move,{passive:true});line.addEventListener('pointerleave',()=>{prevX=prevY=null});
  const init=()=>{drawSource();if(!reducedMotionV45())requestAnimationFrame(()=>{push(W*.47,H*.51,9,-1);setTimeout(()=>push(W*.54,H*.51,-6,2),70)})};
  if(document.fonts?.load){Promise.race([document.fonts.load("170px 'Yellowtail'"),new Promise(r=>setTimeout(r,1200))]).then(init).catch(init)}else init();
}
function reducedMotionV45(){return matchMedia('(prefers-reduced-motion: reduce)').matches}

document.addEventListener('DOMContentLoaded',()=>{
  if(window.__PROJECT_RETURN_V49__) return;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{window.v45RestoreProjectReturn?.()}));
});
// HERO wordmark is owned by scripts/hero-worlds.js in v47.
