
const grid=document.getElementById('script-grid'),search=document.getElementById('search'),filter=document.getElementById('language-filter'),empty=document.getElementById('empty'),countLabel=document.getElementById('count-label'),languageList=document.getElementById('language-list');let scripts=[];

const languageInfo={lua:{label:'Lua / Luau',hl:'lua'},luau:{label:'Lua / Luau',hl:'lua'},javascript:{label:'JavaScript',hl:'javascript'},js:{label:'JavaScript',hl:'javascript'},python:{label:'Python',hl:'python'},html:{label:'HTML',hl:'xml'},css:{label:'CSS',hl:'css'},typescript:{label:'TypeScript',hl:'typescript'},ts:{label:'TypeScript',hl:'typescript'},csharp:{label:'C#',hl:'csharp'},'c++':{label:'C++',hl:'cpp'},cpp:{label:'C++',hl:'cpp'},json:{label:'JSON',hl:'json'}};

const info=l=>languageInfo[String(l||'text').toLowerCase()]||{label:l||'Code',hl:'plaintext'};

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

async function loadScripts(){
  try{
    const r=await fetch('./scripts/manifest.json',{cache:'no-store'});
    if(!r.ok) throw new Error('manifest '+r.status);
    const list=await r.json();
    await loadFromList(list);
  }catch(e){
    console.error(e);
    countLabel.textContent='0 available';
    grid.innerHTML='<div class="empty" style="grid-column:1/-1"><div class="empty-icon">!</div><h3>No scripts found</h3><p>Ajoute un fichier .json dans <code>scripts/</code>.</p></div>';
  }
}

async function loadFromList(list){
  scripts=(Array.isArray(list)?list:[]).map((d,i)=>{
    const copy={...d};
    copy._path=d.path || ('scripts/script-'+i+'.json');
    return copy;
  });

  document.getElementById('stat-scripts').textContent=scripts.length;
  buildFilters();
  render();
}

function buildFilters(){
  const langs=[...new Set(scripts.map(s=>String(s.language||'Code').toLowerCase()))].sort();

  filter.innerHTML='<option value="all">All languages</option>'+
    langs.map(l=>`<option value="${esc(l)}">${esc(info(l).label)}</option>`).join('');

  languageList.innerHTML=langs.map(l=>
    `<span class="language-item">${esc(info(l).label)}</span>`
  ).join('');

  document.getElementById('stat-languages').textContent=langs.length;
}

function render(){
  const q=search.value.trim().toLowerCase();
  const lang=filter.value;

  const shown=scripts.filter(s=>{
    const hay=[
      s.title,
      s.description,
      s.language,
      s.path,
      ...(s.tags||[])
    ].join(' ').toLowerCase();

    return (!q||hay.includes(q)) &&
      (lang==='all'||String(s.language||'').toLowerCase()===lang);
  });

  countLabel.textContent=`${shown.length} available`;

  empty.classList.toggle('hidden',shown.length>0);

  grid.innerHTML=shown.map(s=>{
    const inf=info(s.language);
    const tags=(s.tags||[]).slice(0,4);

    return `<article class="card" data-path="${esc(s._path)}">
      <div class="card-top">
        <div>
          <h3>${esc(s.title||'Untitled')}</h3>
        </div>
        ${s.new?'<span class="new">NEW</span>':''}
      </div>

      <p class="desc">${esc(s.description||'No description.')}</p>

      <div class="meta">
        <span class="pill">${esc(inf.label)}</span>
        ${tags.map(t=>`<span class="pill">${esc(t)}</span>`).join('')}
      </div>

      <div class="card-footer">
        <span>${esc(s.path||s._path)}</span>
        <span class="view">View code →</span>
      </div>
    </article>`;
  }).join('');

  document.querySelectorAll('.card').forEach(c=>{
    c.onclick=()=>openModal(
      scripts.find(s=>s._path===c.dataset.path)
    );
  });
}

function openModal(s){
  if(!s)return;

  const inf=info(s.language);
  const code=document.getElementById('modal-code');

  document.getElementById('modal-title').textContent=s.title||'Untitled';
  document.getElementById('modal-description').textContent=s.description||'';
  document.getElementById('modal-language').textContent=inf.label;
  document.getElementById('modal-file').textContent=s.path||s._path;
  document.getElementById('modal-file').dataset.file=s._path;

  code.className='language-'+inf.hl;
  code.textContent=s.code||'';

  document.getElementById('modal').classList.remove('hidden');

  if(window.hljs)hljs.highlightElement(code);
}

function closeModal(){
  document.getElementById('modal').classList.add('hidden');
}

document.getElementById('close-modal').onclick=closeModal;

document.querySelector('.modal-backdrop').onclick=closeModal;

document.getElementById('refresh').onclick=loadScripts;

document.getElementById('copy-btn').onclick=async()=>{
  const p=document.getElementById('modal-file').dataset.file;
  const s=scripts.find(x=>x._path===p);

  if(!s)return;

  try{
    await navigator.clipboard.writeText(s.code||'');
  }catch{
    const ta=document.createElement('textarea');
    ta.value=s.code||'';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }

  const t=document.getElementById('toast');
  t.classList.add('show');

  setTimeout(()=>t.classList.remove('show'),1400);
};

search.oninput=render;
filter.onchange=render;

document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){
    e.preventDefault();
    search.focus();
  }

  if(e.key==='Escape')closeModal();
});

document.getElementById('year').textContent=new Date().getFullYear();

loadScripts();
