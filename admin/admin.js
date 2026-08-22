const $=(q,r=document)=>r.querySelector(q);
const $$=(q,r=document)=>[...r.querySelectorAll(q)];
const editor=$('#editorPane'), iframe=$('#sitePreview'), toast=$('#toast');
let site=null, details={}, currentPanel='home', currentProject='', previewMode='home';
let queuedImages=new Map(), previewImages=new Map(), coverChangedSlugs=new Set(), newProjects=new Set(), dirty=false, newProjectFormOpen=false, contentSource='defaults';
const DRAFT_KEY='portfolioAdminDraftV33';

function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function clone(v){return JSON.parse(JSON.stringify(v));}
function showToast(msg){toast.textContent=msg;toast.classList.add('is-on');clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove('is-on'),2300)}
function setDirty(value=true){dirty=value;$('#saveState').textContent=value?'UNSAVED':'SAVED';}
function getPath(obj,path){return path.split('.').reduce((a,k)=>a?.[Number.isNaN(Number(k))?k:Number(k)],obj)}
function setPath(obj,path,value){const parts=path.split('.');let cur=obj;parts.slice(0,-1).forEach(k=>{const key=Number.isNaN(Number(k))?k:Number(k);cur=cur[key]});const last=parts.at(-1),key=Number.isNaN(Number(last))?last:Number(last);cur[key]=value;}
function field(label,path,value,opts={}){
  const control=opts.textarea
    ? `<textarea data-bind="${esc(path)}" rows="${opts.rows||4}">${esc(value||'')}</textarea>`
    : `<input type="${opts.type||'text'}" data-bind="${esc(path)}" value="${esc(value||'')}" ${opts.placeholder?`placeholder="${esc(opts.placeholder)}"`:''}>`;
  return `<div class="field"><label>${esc(label)}</label>${control}${opts.note?`<div class="field-note">${esc(opts.note)}</div>`:''}</div>`;
}
function panelHead(kicker,title,desc){return `<header class="editor-head"><span class="eyebrow">${esc(kicker)}</span><h1>${esc(title)}</h1><p>${esc(desc)}</p></header>`}

async function loadJSONCascade(paths){
  for(const path of paths){
    try{const r=await fetch(path,{cache:'no-store'});if(r.ok)return {data:await r.json(),path}}catch{}
  }
  throw new Error('content unavailable');
}
async function init(){
  try{
    const loaded=await loadJSONCascade(['../user-content/site.json','../content/site.json','../defaults/site.json']);
    site=loaded.data;contentSource=loaded.path.includes('user-content')?'user-content':loaded.path.includes('/content/')?'legacy-content':'defaults';
    site.version=Math.max(Number(site.version)||0,40);for(const p of (site.projects||[])){if(p.slug==='kinosis'&&['assets/images/projects/kinosis/overview/01.jpg','assets/images/projects/kinosis/cover-v33.jpg'].includes(p.cardImage))p.cardImage='assets/images/projects/kinosis/cover.jpg';if(p.slug==='fernand'&&!p.cardImage)p.cardImage='assets/images/projects/fernand/cover.jpg';if(typeof p.featured!=='boolean')p.featured=['benedict','salgut','fernand'].includes(p.slug);if(!Number.isFinite(Number(p.featuredOrder))||Number(p.featuredOrder)===99&&p.featured)p.featuredOrder=p.slug==='benedict'?1:p.slug==='salgut'?2:p.slug==='fernand'?3:99;p.featuredRole=p.featuredRole||(p.slug==='benedict'?'LEAD GAME DESIGNER · COMBAT / SYSTEM DESIGN':p.slug==='salgut'?'GAME DIRECTOR · COMBAT DESIGN':p.slug==='fernand'?'PRODUCT DESIGN · UX · DEVELOPMENT':'');p.featuredLine=p.featuredLine||(p.slug==='benedict'?'8개의 죄를 서로 다른 전투 규칙으로 변환하고, 선택과 위험의 구조를 설계했습니다.':p.slug==='salgut'?'5속성 × 2입력의 공격 체계를 재장전 없는 하이퍼 액션 전투 리듬으로 구성했습니다.':p.slug==='fernand'?'작업 목록이 아니라 판단의 맥락을 남기는 데스크톱 작업 환경을 설계하고 구현했습니다.':'');}site.about=site.about||{};site.about.detailEyebrow=site.about.detailEyebrow||'ABOUT / FULL PROFILE';site.about.detailIntro=site.about.detailIntro||'결과물보다 그 결과를 만든 판단을 설명할 수 있는 기획자가 되고자 합니다.';site.about.detailNotes=site.about.detailNotes?.length?site.about.detailNotes:[...(site.about.paragraphs||[])];
  }catch{editor.innerHTML='<div class="editor-loading">사이트 데이터를 불러오지 못했습니다. GitHub Pages 또는 로컬 서버에서 열어주세요.</div>';return}
  currentProject=site.projects?.[0]?.slug||'';
  const draft=localStorage.getItem(DRAFT_KEY)||localStorage.getItem('portfolioAdminDraftV31')||localStorage.getItem('portfolioAdminDraftV30');
  if(draft){try{const d=JSON.parse(draft);if(d.site){site=d.site;details=d.details||{};currentProject=site.projects?.[0]?.slug||'';setDirty(true);showToast('저장된 로컬 Draft를 복원했습니다.')}}catch{}}
  setupNav(); setupPreviewControls(); renderPanel(); populateProjectSelect(); sendPreview();
}
function setupNav(){
  $$('.nav-item').forEach(btn=>btn.addEventListener('click',()=>{currentPanel=btn.dataset.panel;$$('.nav-item').forEach(x=>x.classList.toggle('is-active',x===btn));renderPanel()}));
  $('#saveDraft').addEventListener('click',saveDraft);$('#publishTop').addEventListener('click',()=>{currentPanel='publish';$$('.nav-item').forEach(x=>x.classList.toggle('is-active',x.dataset.panel==='publish'));renderPanel()});
}
function setupPreviewControls(){
  $('#previewHome').addEventListener('click',()=>showHomePreview());
  $('#previewProject').addEventListener('change',e=>{if(e.target.value)showProjectPreview(e.target.value)});
  $('#openPreview').addEventListener('click',()=>window.open(iframe.src.replace(/\?adminPreview=1/,''),'_blank','noopener'));
  iframe.addEventListener('load',()=>setTimeout(sendPreview,100));
}
function populateProjectSelect(){
  const sel=$('#previewProject');sel.innerHTML='<option value="">PROJECT DETAIL</option>'+site.projects.map(p=>`<option value="${esc(p.slug)}">${esc(p.title)}</option>`).join('');
}
function saveDraft(){localStorage.setItem(DRAFT_KEY,JSON.stringify({site,details}));setDirty(false);showToast('브라우저에 Draft를 저장했습니다.')}

function renderPanel(){
  if(!site)return;
  if(currentPanel==='home')renderHome();
  if(currentPanel==='about')renderAbout();
  if(currentPanel==='background')renderBackground();
  if(currentPanel==='projects')renderProjects();
  if(currentPanel==='journal')renderJournal();
  if(currentPanel==='contact')renderContact();
  if(currentPanel==='publish')renderPublish();
  bindPanelInputs();
}
function renderHome(){editor.innerHTML=panelHead('HOME / HERO','Hero','레이아웃과 영상은 고정하고 문구만 수정합니다.')+
  field('LINE 1','hero.line1',site.hero.line1)+field('LINE 2','hero.line2',site.hero.line2)+field('SUBTITLE','hero.subtitle',site.hero.subtitle);}
function renderAbout(){
  const a=site.about;
  editor.innerHTML=panelHead('PROFILE','About','소개 문장과 프로필 정보를 수정합니다. 디자인 배치는 잠겨 있습니다.')+
    `<div class="section-card"><div class="section-card-head"><strong>PROFILE IMAGE</strong></div><div class="image-field"><div class="image-thumb"><img id="profileThumb" src="${esc(previewImages.get('profile')||'../'+a.profileImage)}" alt=""></div><label class="file-label">REPLACE IMAGE<input type="file" id="profileUpload" accept="image/png,image/jpeg,image/webp"></label></div><div class="field-note">어깨 아래가 자연스럽게 끝나는 세로 사진을 권장합니다.</div></div>`+
    field('EYEBROW','about.eyebrow',a.eyebrow)+field('HEADLINE','about.headline',a.headline,{textarea:true,rows:3})+
    (a.paragraphs||[]).map((p,i)=>field(`INTRO ${i+1}`,`about.paragraphs.${i}`,p,{textarea:true,rows:6})).join('')+
    `<div class="section-card"><div class="section-card-head"><strong>PROFILE FACTS</strong></div>${(a.facts||[]).map((f,i)=>`<div class="array-item"><div class="field-row">${field('LABEL',`about.facts.${i}.label`,f.label)}${field('VALUE',`about.facts.${i}.value`,f.value)}</div></div>`).join('')}</div>`+
    `<div class="section-card"><div class="section-card-head"><strong>FULL ABOUT PAGE</strong></div>${field('PAGE EYEBROW','about.detailEyebrow',a.detailEyebrow||'ABOUT / FULL PROFILE')}${field('PAGE INTRO','about.detailIntro',a.detailIntro||'',{textarea:true,rows:3})}${(a.detailNotes||[]).map((n,i)=>field(`PERSPECTIVE ${i+1}`,`about.detailNotes.${i}`,n,{textarea:true,rows:4})).join('')}</div>`+
    `<div class="section-card"><div class="section-card-head"><strong>HOW I WORK</strong></div>${(a.process||[]).map((p,i)=>`<div class="array-item">${field('TITLE',`about.process.${i}.title`,p.title)}${field('DESCRIPTION',`about.process.${i}.body`,p.body,{textarea:true,rows:3})}</div>`).join('')}</div>`;
  setTimeout(()=>$('#profileUpload')?.addEventListener('change',e=>queueProfileImage(e.target.files[0])),0);
}
function renderBackground(){
  const b=site.background;
  editor.innerHTML=panelHead('PROOF / HISTORY','Background','Education과 프로젝트 경험을 분리하고, 프로젝트 경험은 과거 → 현재 순서로 보여줍니다.')+
    field('INTRO','background.intro',b.intro,{textarea:true,rows:3})+
    `<div class="section-card"><div class="section-card-head"><strong>EDUCATION</strong><button class="mini-button" data-add="education">+ ADD</button></div>${(b.education||[]).map((x,i)=>backgroundItem('education',x,i)).join('')}</div>`+
    `<div class="section-card"><div class="section-card-head"><strong>PROJECT EXPERIENCE</strong><button class="mini-button" data-add="experience">+ ADD</button></div>${(b.experience||[]).map((x,i)=>backgroundItem('experience',x,i,true)).join('')}</div>`+
    `<div class="section-card"><div class="section-card-head"><strong>COMPETITION / AWARDS</strong><button class="mini-button" data-add="awards">+ ADD</button></div>${(b.awards||[]).length?(b.awards||[]).map((x,i)=>backgroundItem('awards',x,i)).join(''):'<div class="field-note">비어 있으면 공개 사이트에서 섹션 자체가 숨겨집니다.</div>'}</div>`;
  bindArrayButtons();
}
function backgroundItem(group,x,i,hasStatus=false){return `<div class="array-item">${field('DATE',`background.${group}.${i}.date`,x.date||'')} ${field('TITLE',`background.${group}.${i}.title`,x.title||'')} ${field('DETAIL',`background.${group}.${i}.detail`,x.detail||'',{textarea:true,rows:3})}${hasStatus?field('STATUS',`background.${group}.${i}.status`,x.status||''):''}<div class="array-actions"><button class="danger" data-remove-group="${group}" data-index="${i}">REMOVE</button></div></div>`}

function emptyDetail(slug,title='NEW PROJECT',genre=''){
  return {slug,hero:{kicker:`CASE STUDY / ${genre||'PROJECT'}`,title:title.toUpperCase(),subtitle:title},overview:{heading:'프로젝트 개요',paragraphs:['프로젝트의 문제, 목표와 설계 의도를 입력하세요.']},facts:[{label:'GENRE',value:genre}],pillars:[],chapter:{kicker:'DESIGN / SYSTEM',title:'설계와 구현'},features:[],responsibility:{kicker:'ROLE / RESPONSIBILITY',heading:'담당 작업',intro:'',items:[]},reflection:{heading:'REFLECTION',paragraphs:[]}};
}
async function ensureDetail(slug){
  if(details[slug])return details[slug];
  const project=site.projects.find(p=>p.slug===slug);
  try{
    const loaded=await loadJSONCascade([`../user-content/projects/${slug}.json`,`../content/projects/${slug}.json`,`../defaults/projects/${slug}.json`]);
    details[slug]=loaded.data;
  }catch{details[slug]=emptyDetail(slug,project?.title||slug,project?.genre||'')}
  return details[slug];
}
async function renderProjects(){
  if(!site.projects.find(p=>p.slug===currentProject))currentProject=site.projects[0]?.slug||'';
  const slug=currentProject;
  const selected=site.projects.find(p=>p.slug===slug);
  const d=slug?await ensureDetail(slug):null;
  if(slug!==currentProject)return renderProjects();
  const projectOptions=site.projects.map(p=>`<option value="${esc(p.slug)}" ${p.slug===slug?'selected':''}>${esc(p.title)}</option>`).join('');
  const addForm=newProjectFormOpen?`<div class="section-card new-project-card"><div class="section-card-head"><strong>NEW PROJECT</strong><button class="mini-button" id="cancelNewProject">CANCEL</button></div><div class="field-row">${rawField('TITLE','newProjectTitle','')}${rawField('SLUG','newProjectSlug','')}</div>${rawField('GENRE','newProjectGenre','')}<div class="field-note">SLUG는 URL에 사용됩니다. 영문 소문자/숫자/하이픈만 권장합니다. 생성 즉시 Selected Works와 All Projects에 모두 추가됩니다.</div><button class="primary full-button" id="createNewProject">CREATE PROJECT</button></div>`:'';
  editor.innerHTML=panelHead('CONTENT / ORDER','Projects','프로젝트 선택, 순서, 공개 여부와 상세 내용을 관리합니다. 새 프로젝트도 코드 없이 추가할 수 있습니다.')+
    `<div class="project-editor-toolbar"><select id="editProjectSelect" class="editor-select">${projectOptions}</select><button class="mini-button" id="addProjectButton">+ NEW PROJECT</button></div>${addForm}`+
    `<div class="project-sort" id="projectSort">${site.projects.map(p=>`<div class="project-sort-row ${p.slug===currentProject?'is-selected':''}" data-slug="${esc(p.slug)}"><span class="drag-handle" draggable="true" title="드래그해서 순서 변경">⠿</span><div><strong>${esc(p.title)}</strong><small>${esc(p.genre)}</small></div><button type="button" data-select-project="${esc(p.slug)}">EDIT</button></div>`).join('')}</div>`+
    (selected&&d?`<div class="project-detail-divider"></div><div class="section-card"><div class="section-card-head"><strong>${esc(selected.title||'PROJECT')} / CARD</strong><button class="mini-button" id="previewThisProject">PREVIEW DETAIL</button></div>
      <div class="image-field"><div class="image-thumb project-image-thumb"><img id="projectThumb" src="${esc(previewImages.get(`project:${currentProject}`)||'../'+(selected.cardImage||'assets/images/projects/_placeholder.jpg'))}" alt=""></div><label class="file-label">REPLACE COVER<input type="file" id="projectUpload" accept="image/png,image/jpeg,image/webp"></label></div>
      ${field('TITLE',`projects.${site.projects.indexOf(selected)}.title`,selected.title||'')}${field('GENRE',`projects.${site.projects.indexOf(selected)}.genre`,selected.genre||'')}
      <div class="project-toggle-grid"><label class="toggle-line"><input type="checkbox" id="projectVisible" ${selected.visible!==false?'checked':''}><span>PUBLIC / WORKS</span></label><label class="toggle-line"><input type="checkbox" id="projectFeatured" ${selected.featured===true?'checked':''}><span>FEATURED PROJECT</span></label></div>${field('FEATURED ORDER',`projects.${site.projects.indexOf(selected)}.featuredOrder`,String(selected.featuredOrder??99))}${field('FEATURED ROLE',`projects.${site.projects.indexOf(selected)}.featuredRole`,selected.featuredRole||'')}${field('FEATURED ONE-LINER',`projects.${site.projects.indexOf(selected)}.featuredLine`,selected.featuredLine||'')}
    </div>`+renderDetailEditor(d):'<div class="field-note">프로젝트를 추가하거나 선택하세요.</div>');
  bindProjectSort();
  $('#editProjectSelect')?.addEventListener('change',e=>{currentProject=e.target.value;renderProjects();});
  $('#addProjectButton')?.addEventListener('click',()=>{newProjectFormOpen=!newProjectFormOpen;renderProjects()});
  $('#cancelNewProject')?.addEventListener('click',()=>{newProjectFormOpen=false;renderProjects()});
  $('#newProjectTitle')?.addEventListener('input',e=>{const slugInput=$('#newProjectSlug');if(slugInput&&!slugInput.dataset.touched)slugInput.value=slugify(e.target.value)});
  $('#newProjectSlug')?.addEventListener('input',e=>e.target.dataset.touched='1');
  $('#createNewProject')?.addEventListener('click',createProjectFromForm);
  $('#projectUpload')?.addEventListener('change',e=>queueProjectImage(e.target.files[0],selected));
  $('#projectVisible')?.addEventListener('change',e=>{selected.visible=e.target.checked;changed()});
  $('#projectFeatured')?.addEventListener('change',e=>{selected.featured=e.target.checked;changed()});
  $('#previewThisProject')?.addEventListener('click',()=>showProjectPreview(currentProject));
  if(d)bindDetailInputs(d);
  bindPanelInputs();
}
function slugify(value=''){
  const clean=String(value).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  return clean||`project-${Date.now().toString().slice(-6)}`;
}
function createProjectFromForm(){
  const title=$('#newProjectTitle')?.value.trim(),genre=$('#newProjectGenre')?.value.trim();let slug=slugify($('#newProjectSlug')?.value.trim()||title);
  if(!title){showToast('프로젝트 제목을 입력하세요.');return}
  if(site.projects.some(p=>p.slug===slug)){showToast('이미 사용 중인 SLUG입니다.');return}
  const project={slug,title,genre,cardImage:'assets/images/projects/_placeholder.jpg',href:`projects/${slug}.html`,visible:true,selected:true,featured:false,featuredOrder:99,featuredRole:'',featuredLine:''};
  site.projects.push(project);details[slug]=emptyDetail(slug,title,genre);newProjects.add(slug);currentProject=slug;newProjectFormOpen=false;setDirty();populateProjectSelect();renderProjects();sendPreview();showToast('프로젝트를 추가했습니다. 커버와 상세 내용을 입력한 뒤 Publish하세요.');
}
function renderDetailEditor(d){
  const feats=d.features||[], facts=d.facts||[], pillars=d.pillars||[], resp=d.responsibility||null, refl=d.reflection||null;
  return `<div class="project-detail-divider"></div>${panelHead('CASE STUDY','Project Detail','별도 상세 페이지의 텍스트 콘텐츠입니다. 미디어 갤러리는 기존 파일 구조를 유지합니다.')}
    <div class="section-card"><div class="section-card-head"><strong>HERO</strong></div>${detailField('KICKER','hero.kicker',d.hero?.kicker||'')}${detailField('TITLE','hero.title',d.hero?.title||'')}${detailField('SUBTITLE','hero.subtitle',d.hero?.subtitle||'')}</div>
    <div class="section-card"><div class="section-card-head"><strong>OVERVIEW</strong><button class="mini-button" data-detail-add="overview">+ PARAGRAPH</button></div>${detailField('HEADING','overview.heading',d.overview?.heading||'',true)}${(d.overview?.paragraphs||[]).map((p,i)=>`<div class="array-item">${detailField(`PARAGRAPH ${i+1}`,`overview.paragraphs.${i}`,p,true)}<div class="array-actions"><button class="danger" data-detail-remove="overview" data-index="${i}">REMOVE</button></div></div>`).join('')}</div>
    <div class="section-card"><div class="section-card-head"><strong>FACTS</strong><button class="mini-button" data-detail-add="facts">+ ADD</button></div>${facts.map((f,i)=>`<div class="array-item"><div class="field-row">${detailField('LABEL',`facts.${i}.label`,f.label)}${detailField('VALUE',`facts.${i}.value`,f.value)}</div><div class="array-actions"><button class="danger" data-detail-remove="facts" data-index="${i}">REMOVE</button></div></div>`).join('')}</div>
    <div class="section-card"><div class="section-card-head"><strong>PILLARS</strong><button class="mini-button" data-detail-add="pillars">+ ADD</button></div>${pillars.map((p,i)=>`<div class="array-item"><div class="field-row">${detailField('NO',`pillars.${i}.no`,p.no)}${detailField('TITLE',`pillars.${i}.title`,p.title)}</div>${detailField('BODY',`pillars.${i}.body`,p.body,true)}<div class="array-actions"><button class="danger" data-detail-remove="pillars" data-index="${i}">REMOVE</button></div></div>`).join('')}</div>
    <div class="section-card"><div class="section-card-head"><strong>CHAPTER</strong></div>${detailField('KICKER','chapter.kicker',d.chapter?.kicker||'')}${detailField('TITLE','chapter.title',d.chapter?.title||'')}</div>
    <div class="section-card"><div class="section-card-head"><strong>FEATURES</strong><button class="mini-button" data-detail-add="features">+ ADD</button></div>${feats.map((f,i)=>`<div class="array-item">${detailField(`FEATURE ${i+1}`,`features.${i}.title`,f.title)}${(f.paragraphs||[]).map((p,j)=>detailField(`PARAGRAPH ${j+1}`,`features.${i}.paragraphs.${j}`,p,true)).join('')}<div class="array-actions"><button class="mini-button" data-feature-add-paragraph="${i}">+ PARAGRAPH</button><button class="danger" data-detail-remove="features" data-index="${i}">REMOVE FEATURE</button></div></div>`).join('')}</div>
    ${resp?`<div class="section-card"><div class="section-card-head"><strong>RESPONSIBILITY</strong><button class="mini-button" data-detail-add="responsibility">+ ITEM</button></div>${detailField('KICKER','responsibility.kicker',resp.kicker||'')}${detailField('HEADING','responsibility.heading',resp.heading||'')}${detailField('INTRO','responsibility.intro',resp.intro||'',true)}${(resp.items||[]).map((x,i)=>`<div class="array-item"><div class="field-row">${detailField('NO',`responsibility.items.${i}.no`,x.no)}${detailField('TITLE',`responsibility.items.${i}.title`,x.title)}</div>${detailField('BODY',`responsibility.items.${i}.body`,x.body,true)}<div class="array-actions"><button class="danger" data-detail-remove="responsibility" data-index="${i}">REMOVE</button></div></div>`).join('')}</div>`:''}
    ${refl?`<div class="section-card"><div class="section-card-head"><strong>REFLECTION</strong><button class="mini-button" data-detail-add="reflection">+ PARAGRAPH</button></div>${detailField('HEADING','reflection.heading',refl.heading||'')}${(refl.paragraphs||[]).map((p,i)=>`<div class="array-item">${detailField(`PARAGRAPH ${i+1}`,`reflection.paragraphs.${i}`,p,true)}<div class="array-actions"><button class="danger" data-detail-remove="reflection" data-index="${i}">REMOVE</button></div></div>`).join('')}</div>`:''}`;
}
function detailField(label,path,value,textarea=false){return `<div class="field"><label>${esc(label)}</label>${textarea?`<textarea data-detail-bind="${esc(path)}" rows="4">${esc(value)}</textarea>`:`<input type="text" data-detail-bind="${esc(path)}" value="${esc(value)}">`}</div>`}
function bindDetailInputs(d){
  $$('[data-detail-bind]',editor).forEach(el=>el.addEventListener('input',()=>{setPath(d,el.dataset.detailBind,el.value);changed(true)}));
  $$('[data-detail-add]',editor).forEach(btn=>btn.addEventListener('click',()=>{
    const t=btn.dataset.detailAdd;
    if(t==='overview'){d.overview=d.overview||{paragraphs:[]};d.overview.paragraphs=d.overview.paragraphs||[];d.overview.paragraphs.push('')}
    if(t==='facts'){d.facts=d.facts||[];d.facts.push({label:'',value:''})}
    if(t==='pillars'){d.pillars=d.pillars||[];d.pillars.push({no:String((d.pillars.length||0)+1).padStart(2,'0'),title:'',body:''})}
    if(t==='features'){d.features=d.features||[];d.features.push({title:'',paragraphs:['']})}
    if(t==='responsibility'){d.responsibility=d.responsibility||{kicker:'ROLE / RESPONSIBILITY',heading:'담당 작업',intro:'',items:[]};d.responsibility.items=d.responsibility.items||[];d.responsibility.items.push({no:String(d.responsibility.items.length+1).padStart(2,'0'),title:'',body:''})}
    if(t==='reflection'){d.reflection=d.reflection||{heading:'REFLECTION',paragraphs:[]};d.reflection.paragraphs=d.reflection.paragraphs||[];d.reflection.paragraphs.push('')}
    setDirty();renderProjects();sendPreview();
  }));
  $$('[data-feature-add-paragraph]',editor).forEach(btn=>btn.addEventListener('click',()=>{const i=Number(btn.dataset.featureAddParagraph);d.features[i].paragraphs=d.features[i].paragraphs||[];d.features[i].paragraphs.push('');setDirty();renderProjects();sendPreview()}));
  $$('[data-detail-remove]',editor).forEach(btn=>btn.addEventListener('click',()=>{
    const t=btn.dataset.detailRemove,i=Number(btn.dataset.index);
    if(t==='overview')d.overview.paragraphs.splice(i,1);
    if(t==='facts')d.facts.splice(i,1);
    if(t==='pillars')d.pillars.splice(i,1);
    if(t==='features')d.features.splice(i,1);
    if(t==='responsibility')d.responsibility.items.splice(i,1);
    if(t==='reflection')d.reflection.paragraphs.splice(i,1);
    setDirty();renderProjects();sendPreview();
  }));
}
function bindProjectSort(){
  let dragged='';
  $$('#projectSort .project-sort-row').forEach(row=>{
    const handle=$('.drag-handle',row);
    handle?.addEventListener('dragstart',e=>{dragged=row.dataset.slug;row.classList.add('is-dragging');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',dragged)});
    handle?.addEventListener('dragend',()=>{row.classList.remove('is-dragging');dragged=''})
    row.addEventListener('dragover',e=>{if(dragged){e.preventDefault();e.dataTransfer.dropEffect='move'}});
    row.addEventListener('drop',e=>{e.preventDefault();const target=row.dataset.slug;if(!dragged||dragged===target)return;const from=site.projects.findIndex(p=>p.slug===dragged),to=site.projects.findIndex(p=>p.slug===target);if(from<0||to<0)return;const [item]=site.projects.splice(from,1);site.projects.splice(to,0,item);changed();renderProjects();populateProjectSelect()});
  });
  $$('[data-select-project]',editor).forEach(btn=>btn.addEventListener('click',()=>{currentProject=btn.dataset.selectProject;renderProjects()}));
}
function queueProjectImage(file,project){
  if(!file||!project)return;
  const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace('jpeg','jpg');
  const path=`user-content/media/projects/${project.slug}/cover-${Date.now()}.${ext}`;
  queuedImages.set(path,file);
  if(previewImages.has(`project:${project.slug}`))URL.revokeObjectURL(previewImages.get(`project:${project.slug}`));
  previewImages.set(`project:${project.slug}`,URL.createObjectURL(file));
  project.cardImage=path;coverChangedSlugs.add(project.slug);changed();renderProjects();
}
function queueProfileImage(file){
  if(!file)return;
  const ext=(file.name.split('.').pop()||'png').toLowerCase().replace('jpeg','jpg');
  const path=`user-content/media/profile/profile-${Date.now()}.${ext}`;
  queuedImages.set(path,file);
  if(previewImages.has('profile'))URL.revokeObjectURL(previewImages.get('profile'));
  previewImages.set('profile',URL.createObjectURL(file));site.about.profileImage=path;changed();renderPanel();
}

function renderJournal(){editor.innerHTML=panelHead('NAVER RSS','Journal','글 작성·수정·삭제는 네이버 블로그에서 합니다. 이 사이트는 최신 글을 읽어와 보여줍니다.')+field('BLOG URL','journal.blogUrl',site.journal.blogUrl,{type:'url'})+`<div class="publish-box"><h3>GEMEINSCHAFT → Portfolio</h3><p>BLOG URL이 GitHub Actions의 RSS 동기화 원본으로도 사용됩니다. 주소를 바꾸고 PUBLISH하면 다음 동기화부터 새 네이버 블로그를 읽습니다. 홈은 DEVLOG 3개를 주 콘텐츠로, CRITIQUE 최대 3개를 보조 콘텐츠로 표시합니다.</p></div>`;}
function renderContact(){const c=site.contact;editor.innerHTML=panelHead('LINKS','Contact','공개 사이트 하단의 4개 아이콘 링크를 수정합니다.')+field('EMAIL','contact.email',c.email)+field('GITHUB','contact.github',c.github,{type:'url'})+field('LINKEDIN','contact.linkedin',c.linkedin,{type:'url'})+field('BLOG','contact.blog',c.blog,{type:'url'});}
function renderPublish(){
  const saved=JSON.parse(sessionStorage.getItem('portfolioGithubSettings')||'{}');
  editor.innerHTML=panelHead('GITHUB / CONTENTS API','Publish','편집 내용은 코드와 분리된 user-content/에 저장됩니다. 이후 버전을 덮어써도 이 폴더를 삭제하지 않는 한 내용이 유지됩니다.')+`
  <div class="publish-box"><h3>Content storage</h3><p>현재 로드 소스: <b>${esc(contentSource)}</b><br>Publish하면 user-content/site.json과 user-content/projects/*.json으로 마이그레이션됩니다. v34 이후 업데이트 ZIP은 user-content를 포함하지 않습니다.</p></div>
  <div class="publish-box"><h3>Backup</h3><p>업데이트 전 JSON 백업을 내려받을 수 있습니다. 새 PC에서도 다시 Import할 수 있습니다.</p><div class="publish-actions"><button class="ghost" id="exportBackup">EXPORT BACKUP</button><label class="ghost import-label">IMPORT BACKUP<input type="file" id="importBackup" accept="application/json"></label></div></div>
  <div class="publish-box"><h3>1. Repository</h3><div class="field-row">${rawField('OWNER','ghOwner',saved.owner||'Insol17')}${rawField('REPOSITORY','ghRepo',saved.repo||'Personal_Website')}</div>${rawField('BRANCH','ghBranch',saved.branch||'main')}</div>
  <div class="publish-box"><h3>2. GitHub token</h3>${rawField('FINE-GRAINED PAT','ghToken',sessionStorage.getItem('portfolioGithubToken')||'','password')}<p>Fine-grained token은 이 저장소 하나만 선택하고 <b>Contents: Read and write</b> 권한만 주는 것을 권장합니다.</p></div>
  <div class="publish-box"><h3>3. Publish</h3><p>사이트 데이터, 모든 프로젝트 상세 JSON, 새 이미지와 새 프로젝트 HTML을 GitHub에 발행합니다.</p><div class="publish-actions"><button class="ghost" id="clearDraft">CLEAR DRAFT</button><button class="primary" id="publishNow">PUBLISH TO GITHUB</button></div></div>
  <div class="status-log" id="publishLog">Ready.</div>`;
  $('#clearDraft')?.addEventListener('click',()=>{localStorage.removeItem(DRAFT_KEY);showToast('로컬 Draft를 삭제했습니다.')});
  $('#publishNow')?.addEventListener('click',publishGithub);
  $('#exportBackup')?.addEventListener('click',exportBackup);
  $('#importBackup')?.addEventListener('change',e=>importBackup(e.target.files?.[0]));
}
function rawField(label,id,value,type='text'){return `<div class="field"><label>${esc(label)}</label><input type="${type}" id="${id}" value="${esc(value)}"></div>`}

function bindPanelInputs(){
  $$('[data-bind]',editor).forEach(el=>el.addEventListener('input',()=>{setPath(site,el.dataset.bind,el.value);changed()}));
}
function bindArrayButtons(){
  $$('[data-add]',editor).forEach(btn=>btn.addEventListener('click',()=>{const g=btn.dataset.add;site.background[g].push(g==='experience'?{date:'',title:'',detail:'',status:''}:{date:'',title:'',detail:''});setDirty();renderBackground();sendPreview()}));
  $$('[data-remove-group]',editor).forEach(btn=>btn.addEventListener('click',()=>{site.background[btn.dataset.removeGroup].splice(Number(btn.dataset.index),1);setDirty();renderBackground();sendPreview()}));
}
function changed(detail=false){setDirty();sendPreview();if(detail)sendProjectPreview();}
function previewSiteData(){const d=clone(site);if(previewImages.has('profile'))d.about.profileImage=previewImages.get('profile');d.projects.forEach(p=>{const u=previewImages.get(`project:${p.slug}`);if(u)p.cardImage=u});return d}
function sendPreview(){if(!iframe?.contentWindow)return;iframe.contentWindow.postMessage({type:'portfolio-preview-data',payload:previewSiteData()},'*');if(previewMode!=='home')sendProjectPreview()}
function sendProjectPreview(){if(previewMode==='home'||!details[previewMode])return;iframe.contentWindow?.postMessage({type:'project-preview-data',payload:details[previewMode],site:previewSiteData()},'*')}
function showHomePreview(){previewMode='home';$('#previewHome').classList.add('is-active');$('#previewProject').value='';iframe.src='../index.html?adminPreview=1'}
async function showProjectPreview(slug){previewMode=slug;currentProject=slug;await ensureDetail(slug);$('#previewHome').classList.remove('is-active');$('#previewProject').value=slug;iframe.src=`../projects/_preview.html?project=${encodeURIComponent(slug)}&adminPreview=1`}

function bytesToBase64(bytes){let out='';const step=0x8000;for(let i=0;i<bytes.length;i+=step)out+=String.fromCharCode(...bytes.subarray(i,i+step));return btoa(out)}
function textBase64(text){return bytesToBase64(new TextEncoder().encode(text))}
async function githubGet(owner,repo,path,branch,token){const r=await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path}?ref=${encodeURIComponent(branch)}`,{headers:{Accept:'application/vnd.github+json',Authorization:`Bearer ${token}`,'X-GitHub-Api-Version':'2022-11-28'}});if(r.status===404)return null;if(!r.ok)throw new Error(`${path}: ${r.status} ${await r.text()}`);return r.json()}
function base64Text(value=''){const clean=value.replace(/\n/g,'');const bin=atob(clean);const bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);return new TextDecoder().decode(bytes)}
async function githubPut(owner,repo,path,branch,token,content,message){const existing=await githubGet(owner,repo,path,branch,token);const body={message,content,branch};if(existing?.sha)body.sha=existing.sha;const r=await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path}`,{method:'PUT',headers:{Accept:'application/vnd.github+json',Authorization:`Bearer ${token}`,'X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw new Error(`${path}: ${r.status} ${await r.text()}`);return r.json()}
async function exportBackup(){
  await Promise.all((site.projects||[]).map(p=>ensureDetail(p.slug)));
  const payload={schema:33,exportedAt:new Date().toISOString(),site,details};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`portfolio-content-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);showToast('콘텐츠 백업을 저장했습니다.');
}
async function importBackup(file){
  if(!file)return;
  try{
    const payload=JSON.parse(await file.text());if(!payload.site||!payload.details)throw new Error('invalid');
    site=payload.site;details=payload.details;currentProject=site.projects?.[0]?.slug||'';setDirty();populateProjectSelect();renderPanel();sendPreview();showToast('백업을 불러왔습니다. Publish해야 사이트에 반영됩니다.');
  }catch{showToast('올바른 v34 콘텐츠 백업이 아닙니다.');}
}
async function projectTemplateHTML(project){
  const r=await fetch('../projects/_template.html',{cache:'no-store'});if(!r.ok)throw new Error('projects/_template.html을 읽지 못했습니다.');let html=await r.text();
  const cover='../'+(project.cardImage||'assets/images/projects/_placeholder.jpg').replace(/^\.\//,'');
  return html.replaceAll('__SLUG__',project.slug).replaceAll('__TITLE__',project.title).replaceAll('__TITLE_UPPER__',project.title.toUpperCase()).replaceAll('__GENRE__',project.genre||'PROJECT').replaceAll('__COVER__',cover);
}

function migrateProjectHTMLToV33(html,project){
  let next=html.replaceAll('../v31.css','../v35.css').replaceAll('../v32.css','../v35.css').replaceAll('../v33.css','../v35.css').replaceAll('../v34.css','../v39.css').replaceAll('../v35.css','../v39.css').replaceAll('../v36.css','../v39.css').replaceAll('../v37.css','../v39.css').replaceAll('../v38.css','../v41.css').replaceAll('../v39.css','../v41.css').replaceAll('../v31.js','../v35.js').replaceAll('../v32.js','../v35.js').replaceAll('../v33.js','../v35.js').replaceAll('../v34.js','../v39.js').replaceAll('../v35.js','../v39.js').replaceAll('../v36.js','../v39.js').replaceAll('../v37.js','../v39.js').replaceAll('../v38.js','../v41.js').replaceAll('../v39.js','../v41.js').replaceAll('project-detail-v32.css','project-detail-v35.css').replaceAll('project-detail-v33.css','project-detail-v35.css').replaceAll('project-detail-v34.css','project-detail-v39.css').replaceAll('project-detail-v35.css','project-detail-v39.css').replaceAll('project-detail-v36.css','project-detail-v39.css').replaceAll('project-detail-v37.css','project-detail-v39.css').replaceAll('project-detail-v38.css','project-detail-v41.css').replaceAll('project-detail-v39.css','project-detail-v41.css').replaceAll('project-detail-v32.js','project-detail-v35.js').replaceAll('project-detail-v33.js','project-detail-v35.js').replaceAll('project-detail-v34.js','project-detail-v39.js').replaceAll('project-detail-v35.js','project-detail-v39.js').replaceAll('project-detail-v36.js','project-detail-v39.js').replaceAll('project-detail-v37.js','project-detail-v39.js').replaceAll('project-detail-v38.js','project-detail-v41.js').replaceAll('project-detail-v39.js','project-detail-v41.js').replaceAll('project-detail.css','project-detail-v41.css').replaceAll('project-detail.js','project-detail-v41.js');
  if(!/class=["'][^"']*detail-boot/.test(next)) next=next.replace(/<html([^>]*)>/i,(m,a)=>`<html${a} class="detail-boot">`);
  if(!next.includes('transition-arrival-pending')){
    const boot=`<script>(()=>{try{const image=sessionStorage.getItem('portfolioTransitionImage');if(!image)return;document.documentElement.classList.add('transition-arrival-pending');document.documentElement.style.setProperty('--transition-image',\`url("${String(image).replace(/["\\\\]/g,'\\\\$&')}")\`);}catch{}})();<\/script><style>html,body{margin:0;background:#081113}html.transition-arrival-pending::before{content:"";position:fixed;inset:0;z-index:9997;background:#081113 var(--transition-image) center/cover no-repeat;pointer-events:none}</style>`;
    next=next.replace(/<head>/i,`<head>${boot}`);
  }
  if(project?.cardImage){const src='../'+project.cardImage.replace(/^\.\//,'');next=next.replace(/(<img(?=[^>]*class="project-detail-hero-image")[^>]*\ssrc=")[^"]*(")/,`$1${src}$2`)}
  return next;
}

async function publishGithub(){
  const owner=$('#ghOwner').value.trim(),repo=$('#ghRepo').value.trim(),branch=$('#ghBranch').value.trim()||'main',token=$('#ghToken').value.trim(),log=$('#publishLog');
  if(!owner||!repo||!token){showToast('Repository와 GitHub token을 입력하세요.');return}
  sessionStorage.setItem('portfolioGithubSettings',JSON.stringify({owner,repo,branch}));sessionStorage.setItem('portfolioGithubToken',token);
  const write=t=>{log.textContent+=`\n${t}`;log.scrollTop=log.scrollHeight};log.textContent='Publishing…';$('#publishNow').disabled=true;
  try{
    await Promise.all((site.projects||[]).map(p=>ensureDetail(p.slug)));
    // Publish dependencies first; site.json is committed last so the public site never points at half-created content.
    for(const [path,file] of queuedImages){const bytes=new Uint8Array(await file.arrayBuffer());await githubPut(owner,repo,path,branch,token,bytesToBase64(bytes),`Update portfolio image: ${path.split('/').pop()}`);write(`✓ ${path}`)}
    for(const p of site.projects){
      const d=details[p.slug]||emptyDetail(p.slug,p.title,p.genre);
      await githubPut(owner,repo,`user-content/projects/${p.slug}.json`,branch,token,textBase64(JSON.stringify(d,null,2)+'\n'),`Update ${p.title} case study`);write(`✓ user-content/projects/${p.slug}.json`);
    }
    for(const p of site.projects){
      const htmlPath=p.href||`projects/${p.slug}.html`;const existing=await githubGet(owner,repo,htmlPath,branch,token);
      if(!existing){
        const html=await projectTemplateHTML(p);await githubPut(owner,repo,htmlPath,branch,token,textBase64(html),`Create ${p.title} project page`);write(`✓ ${htmlPath} (created)`);
      }else if(existing.content){
        const before=base64Text(existing.content);const html=migrateProjectHTMLToV33(before,p);
        if(html!==before){await githubPut(owner,repo,htmlPath,branch,token,textBase64(html),`Sync ${p.title} project shell`);write(`✓ ${htmlPath} (v40 shell)`)}
      }
    }
    await githubPut(owner,repo,'user-content/site.json',branch,token,textBase64(JSON.stringify(site,null,2)+'\n'),'Update portfolio user content');write('✓ user-content/site.json (final)');
    localStorage.removeItem(DRAFT_KEY);queuedImages.clear();coverChangedSlugs.clear();newProjects.clear();contentSource='user-content';setDirty(false);write('\nDone. GitHub Pages deployment will follow.');showToast('GitHub에 발행했습니다.');
  }catch(err){write(`\nERROR: ${err.message}`);showToast('발행 실패 — 로그를 확인하세요.')}finally{$('#publishNow').disabled=false}
}

document.addEventListener('DOMContentLoaded',init);
