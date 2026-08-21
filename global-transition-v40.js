(() => {
  const KEY='portfolioGlobalTransitionV40';
  const root=document.documentElement;
  const nested=/\/(projects|journal|admin)\//.test(location.pathname);
  const poster=(nested?'../':'')+'assets/video/liquid-poster.webp';
  const read=()=>{try{return JSON.parse(sessionStorage.getItem(KEY)||'null')}catch{return null}};
  const clear=()=>{try{sessionStorage.removeItem(KEY)}catch{}};
  function releaseArrival(){
    const data=read();
    if(!root.classList.contains('global-transition-arrival')){if(data&&Date.now()-(data.at||0)>12000)clear();return;}
    const began=performance.now();
    const done=()=>{
      const wait=Math.max(0,100-(performance.now()-began));
      setTimeout(()=>{
        root.classList.add('global-transition-arrival-release');
        setTimeout(()=>{root.classList.remove('global-transition-arrival','global-transition-arrival-release');clear()},150);
      },wait);
    };
    if(document.readyState==='complete')done(); else addEventListener('load',done,{once:true});
    setTimeout(done,900);
  }
  function eligible(a,event){
    if(!a||event.defaultPrevented||event.button>0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return false;
    if(a.target==='_blank'||a.hasAttribute('download')||a.classList.contains('project-transition-link')||a.classList.contains('project-transition-text-link'))return false;
    const raw=a.getAttribute('href')||'';
    if(!raw||raw.startsWith('#')||/^(mailto:|tel:|javascript:)/i.test(raw))return false;
    let url;try{url=new URL(raw,location.href)}catch{return false}
    if(url.origin!==location.origin)return false;
    if(url.pathname===location.pathname&&url.search===location.search)return false;
    if(/\/projects\/(?:benedict|salgut|fernand|deco|kinosis|machinator)\.html$/i.test(url.pathname))return false;
    return true;
  }
  function go(a,event){
    if(!eligible(a,event))return;
    event.preventDefault();
    const href=a.href;
    try{sessionStorage.setItem(KEY,JSON.stringify({at:Date.now(),href}))}catch{}
    const layer=document.createElement('div');layer.className='global-transition-layer';
    const img=document.createElement('img');img.src=poster;img.alt='';layer.appendChild(img);document.body.appendChild(layer);
    requestAnimationFrame(()=>requestAnimationFrame(()=>layer.classList.add('is-on')));
    let moved=false;const navigate=()=>{if(moved)return;moved=true;location.href=href};
    setTimeout(navigate,100);setTimeout(navigate,240);
  }
  document.addEventListener('click',e=>{const a=e.target.closest?.('a[href]');if(a)go(a,e)},true);
  releaseArrival();
})();
