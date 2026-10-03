
// CodeHub — GitHub Pages static loader
const state = {
  scripts: [],
  filtered: [],
  query: '',
  language: 'all'
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[c]));
}

function languageClass(lang) {
  return String(lang || 'text').toLowerCase().replace(/[^a-z0-9_-]/g,'');
}

function renderScripts() {
  const container = $('#script-list') || $('#scripts-list') || $('.script-grid') || $('.scripts-grid');
  if (!container) return;

  let list = state.scripts.filter(s => {
    const q = state.query.toLowerCase();
    const hay = [
      s.title, s.description, s.language, s.path,
      ...(Array.isArray(s.tags) ? s.tags : [])
    ].join(' ').toLowerCase();
    return (!q || hay.includes(q)) &&
           (state.language === 'all' || String(s.language).toLowerCase() === state.language);
  });

  state.filtered = list;

  // Preserve the site's existing card design by using common classes.
  container.innerHTML = list.map((s, i) => `
    <article class="script-card" data-index="${i}">
      <div class="script-card-top">
        <span class="language-badge">${escapeHtml(String(s.language || 'text').toUpperCase())}</span>
        ${s.new ? '<span class="new-badge">NEW</span>' : ''}
      </div>
      <h3>${escapeHtml(s.title || 'Untitled')}</h3>
      <p>${escapeHtml(s.description || '')}</p>
      ${s.path ? `<div class="script-path">${escapeHtml(s.path)}</div>` : ''}
      <div class="script-tags">${(Array.isArray(s.tags)?s.tags:[]).map(t=>`<span>${escapeHtml(t)}</span>`).join('')}</div>
      <button class="view-script" data-index="${i}">View code <span>→</span></button>
    </article>
  `).join('') || `<div class="empty-state">Aucun script trouvé.</div>`;

  $$('.view-script').forEach(btn => btn.addEventListener('click', () => openScript(state.filtered[Number(btn.dataset.index)])));
  updateStats();
}

function updateStats() {
  const count = $('#stat-scripts');
  if (count) count.textContent = state.scripts.length;
  const langs = [...new Set(state.scripts.map(s => String(s.language || '').toLowerCase()).filter(Boolean))];
  const lc = $('#stat-languages');
  if (lc) lc.textContent = langs.length;
  const bottom = $('#stat-languages-bottom');
  if (bottom) bottom.textContent = langs.length;
}

function openScript(script) {
  const modal = $('#script-modal') || $('#code-modal');
  if (!modal) return;
  const title = modal.querySelector('[data-script-title], .modal-title, h2, h3');
  const code = modal.querySelector('code');
  const path = modal.querySelector('[data-script-path], .modal-path');
  if (title) title.textContent = script.title || 'Script';
  if (path) path.textContent = script.path || '';
  if (code) {
    code.className = `language-${languageClass(script.language)}`;
    code.textContent = script.code || '';
    if (window.hljs) {
      try { hljs.highlightElement(code); } catch(e) {}
    }
  }
  modal.classList.add('open','active','show');
}

function closeModals() {
  $$('.modal.open, .modal.active, .modal.show, #script-modal, #code-modal').forEach(m => {
    m.classList.remove('open','active','show');
  });
}

async function loadScripts() {
  // The manifest is generated locally by the helper script before publishing.
  try {
    const response = await fetch('./scripts/manifest.json', {cache:'no-store'});
    if (!response.ok) throw new Error('manifest not found');
    const manifest = await response.json();
    state.scripts = manifest.map(x => typeof x === 'string' ? null : x).filter(Boolean);
  } catch (e) {
    state.scripts = [];
    console.warn('CodeHub: scripts/manifest.json is missing. Run generate-manifest.ps1.');
  }
  renderScripts();
}

document.addEventListener('DOMContentLoaded', () => {
  const search = $('#search') || $('#search-input') || $('input[type="search"]');
  if (search) search.addEventListener('input', e => { state.query=e.target.value; renderScripts(); });

  $$('.language-filter, [data-language]').forEach(el => el.addEventListener('click', () => {
    state.language = (el.dataset.language || el.textContent || 'all').trim().toLowerCase();
    $$('.language-filter, [data-language]').forEach(x => x.classList.remove('active'));
    el.classList.add('active');
    renderScripts();
  }));

  document.addEventListener('click', e => {
    if (e.target.closest('[data-close-modal], .modal-close, .close-modal')) closeModals();
  });

  loadScripts();
});
