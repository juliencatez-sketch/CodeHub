const grid = document.getElementById('script-grid');
const search = document.getElementById('search');
const filter = document.getElementById('language-filter');
const empty = document.getElementById('empty');
const countLabel = document.getElementById('count-label');
const languageList = document.getElementById('language-list');

let scripts = [];

const languageInfo = {
  lua: { label: 'Lua / Luau', hl: 'lua' },
  luau: { label: 'Lua / Luau', hl: 'lua' },
  javascript: { label: 'JavaScript', hl: 'javascript' },
  js: { label: 'JavaScript', hl: 'javascript' },
  python: { label: 'Python', hl: 'python' },
  html: { label: 'HTML', hl: 'xml' },
  css: { label: 'CSS', hl: 'css' },
  typescript: { label: 'TypeScript', hl: 'typescript' },
  ts: { label: 'TypeScript', hl: 'typescript' },
  csharp: { label: 'C#', hl: 'csharp' },
  'c++': { label: 'C++', hl: 'cpp' },
  cpp: { label: 'C++', hl: 'cpp' },
  json: { label: 'JSON', hl: 'json' }
};

function info(language) {
  return languageInfo[String(language || 'text').toLowerCase()] || {
    label: language || 'Code',
    hl: 'plaintext'
  };
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[c]));
}

/* =========================
   CHARGEMENT GITHUB PAGES
========================= */

async function loadScripts() {
  try {
    const response = await fetch('./scripts/manifest.json', {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Manifest HTTP ' + response.status);
    }

    const list = await response.json();

    if (!Array.isArray(list)) {
      throw new Error('manifest.json doit contenir un tableau');
    }

    scripts = list.map((script, index) => ({
      ...script,
      _path: script.path || `scripts/script-${index}.json`
    }));

    document.getElementById('stat-scripts').textContent = scripts.length;

    buildFilters();
    render();

  } catch (error) {
    console.error('Erreur CodeHub:', error);

    document.getElementById('stat-scripts').textContent = '0';
    countLabel.textContent = '0 available';

    grid.innerHTML = `
      <div class="empty" style="grid-column:1/-1">
        <div class="empty-icon">!</div>
        <h3>Unable to load scripts</h3>
        <p>
          Vérifie que <code>scripts/manifest.json</code>
          existe bien dans ton dépôt GitHub.
        </p>
      </div>
    `;
  }
}

/* =========================
   FILTRES
========================= */

function buildFilters() {

  const languages = [
    ...new Set(
      scripts.map(s =>
        String(s.language || 'Code').toLowerCase()
      )
    )
  ].sort();

  filter.innerHTML =
    '<option value="all">All languages</option>' +
    languages.map(language =>
      `<option value="${esc(language)}">
        ${esc(info(language).label)}
      </option>`
    ).join('');

  languageList.innerHTML = languages.map(language =>
    `<span class="language-item">
      ${esc(info(language).label)}
    </span>`
  ).join('');

  document.getElementById('stat-languages').textContent =
    languages.length;
}

/* =========================
   AFFICHAGE DES SCRIPTS
========================= */

function render() {

  const query = search.value.trim().toLowerCase();
  const language = filter.value;

  const shown = scripts.filter(script => {

    const haystack = [
      script.title,
      script.description,
      script.language,
      script.path,
      ...(script.tags || [])
    ]
      .join(' ')
      .toLowerCase();

    const matchesSearch =
      !query || haystack.includes(query);

    const matchesLanguage =
      language === 'all' ||
      String(script.language || '').toLowerCase() === language;

    return matchesSearch && matchesLanguage;
  });

  countLabel.textContent =
    `${shown.length} available`;

  empty.classList.toggle(
    'hidden',
    shown.length > 0
  );

  grid.innerHTML = shown.map(script => {

    const languageData = info(script.language);

    const tags = (script.tags || [])
      .slice(0, 4);

    return `
      <article
        class="card"
        data-path="${esc(script._path)}"
      >

        <div class="card-top">

          <div>
            <h3>
              ${esc(script.title || 'Untitled')}
            </h3>
          </div>

          ${
            script.new
              ? '<span class="new">NEW</span>'
              : ''
          }

        </div>

        <p class="desc">
          ${esc(
            script.description ||
            'No description.'
          )}
        </p>

        <div class="meta">

          <span class="pill">
            ${esc(languageData.label)}
          </span>

          ${tags.map(tag =>
            `<span class="pill">
              ${esc(tag)}
            </span>`
          ).join('')}

        </div>

        <div class="card-footer">

          <span>
            ${esc(
              script.path ||
              script._path
            )}
          </span>

          <span class="view">
            View code →
          </span>

        </div>

      </article>
    `;

  }).join('');

  document
    .querySelectorAll('.card')
    .forEach(card => {

      card.onclick = () => {

        const script = scripts.find(
          s => s._path === card.dataset.path
        );

        openModal(script);
      };

    });
}

/* =========================
   MODAL CODE
========================= */

function openModal(script) {

  if (!script) return;

  const languageData = info(
    script.language
  );

  const code =
    document.getElementById('modal-code');

  document.getElementById(
    'modal-title'
  ).textContent =
    script.title || 'Untitled';

  document.getElementById(
    'modal-description'
  ).textContent =
    script.description || '';

  document.getElementById(
    'modal-language'
  ).textContent =
    languageData.label;

  document.getElementById(
    'modal-file'
  ).textContent =
    script.path || script._path;

  document.getElementById(
    'modal-file'
  ).dataset.file =
    script._path;

  code.className =
    'language-' + languageData.hl;

  code.textContent =
    script.code || '';

  document
    .getElementById('modal')
    .classList.remove('hidden');

  if (window.hljs) {
    hljs.highlightElement(code);
  }
}

function closeModal() {

  document
    .getElementById('modal')
    .classList.add('hidden');
}

/* =========================
   BOUTONS
========================= */

document
  .getElementById('close-modal')
  .onclick = closeModal;

document
  .querySelector('.modal-backdrop')
  .onclick = closeModal;

document
  .getElementById('refresh')
  .onclick = loadScripts;

/* =========================
   COPIER LE CODE
========================= */

document
  .getElementById('copy-btn')
  .onclick = async () => {

    const path =
      document.getElementById(
        'modal-file'
      ).dataset.file;

    const script =
      scripts.find(
        s => s._path === path
      );

    if (!script) return;

    try {

      await navigator.clipboard.writeText(
        script.code || ''
      );

    } catch {

      const textarea =
        document.createElement('textarea');

      textarea.value =
        script.code || '';

      document.body.appendChild(
        textarea
      );

      textarea.select();

      document.execCommand(
        'copy'
      );

      textarea.remove();
    }

    const toast =
      document.getElementById('toast');

    toast.classList.add('show');

    setTimeout(
      () => toast.classList.remove('show'),
      1400
    );
  };

/* =========================
   RECHERCHE
========================= */

search.oninput = render;

filter.onchange = render;

/* =========================
   RACCOURCIS
========================= */

document.addEventListener(
  'keydown',
  event => {

    if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === 'k'
    ) {

      event.preventDefault();

      search.focus();
    }

    if (event.key === 'Escape') {
      closeModal();
    }

  }
);

/* =========================
   ANNÉE
========================= */

document.getElementById(
  'year'
).textContent =
  new Date().getFullYear();

/* =========================
   START
========================= */

loadScripts();
