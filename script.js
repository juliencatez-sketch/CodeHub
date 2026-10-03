/* =========================================================
   CODEHUB V9 — GITHUB PAGES
   ========================================================= */

let scripts = [];

const grid = document.getElementById("script-grid");
const search = document.getElementById("search");
const filter = document.getElementById("language-filter");
const empty = document.getElementById("empty");
const countLabel = document.getElementById("count-label");
const languageList = document.getElementById("language-list");

/* =========================================================
   LANGUAGES
   ========================================================= */

const languageInfo = {
    lua: {
        label: "Lua / Luau",
        hl: "lua"
    },

    luau: {
        label: "Lua / Luau",
        hl: "lua"
    },

    javascript: {
        label: "JavaScript",
        hl: "javascript"
    },

    js: {
        label: "JavaScript",
        hl: "javascript"
    },

    python: {
        label: "Python",
        hl: "python"
    },

    html: {
        label: "HTML",
        hl: "xml"
    },

    css: {
        label: "CSS",
        hl: "css"
    },

    typescript: {
        label: "TypeScript",
        hl: "typescript"
    },

    ts: {
        label: "TypeScript",
        hl: "typescript"
    },

    json: {
        label: "JSON",
        hl: "json"
    },

    csharp: {
        label: "C#",
        hl: "csharp"
    },

    cpp: {
        label: "C++",
        hl: "cpp"
    },

    "c++": {
        label: "C++",
        hl: "cpp"
    }
};

function getLanguageInfo(language) {

    const key = String(language || "text").toLowerCase();

    return languageInfo[key] || {
        label: language || "Code",
        hl: "plaintext"
    };
}

/* =========================================================
   SECURITY / HTML ESCAPE
   ========================================================= */

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, character => {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}

/* =========================================================
   LOAD MANIFEST
   ========================================================= */

async function loadScripts() {

    try {

        console.log("CodeHub : chargement du manifest...");

        const response = await fetch(
            "./scripts/manifest.json?cache=" + Date.now()
        );

        if (!response.ok) {

            throw new Error(
                "Impossible de charger manifest.json : HTTP " +
                response.status
            );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {

            throw new Error(
                "manifest.json doit contenir un tableau JSON."
            );
        }

        scripts = data.map((script, index) => {

            return {
                ...script,

                _path:
                    script.path ||
                    "scripts/script-" + index + ".json"
            };

        });

        console.log(
            "CodeHub :",
            scripts.length,
            "script(s) chargé(s)."
        );

        updateStatistics();

        buildLanguageFilters();

        renderScripts();

    } catch (error) {

        console.error(
            "CodeHub - erreur de chargement :",
            error
        );

        if (countLabel) {
            countLabel.textContent = "0 available";
        }

        if (grid) {

            grid.innerHTML = `
                <div
                    class="empty"
                    style="grid-column:1/-1"
                >
                    <div class="empty-icon">!</div>

                    <h3>
                        Impossible de charger les scripts
                    </h3>

                    <p>
                        Vérifie que
                        <code>scripts/manifest.json</code>
                        existe bien.
                    </p>
                </div>
            `;
        }
    }
}

/* =========================================================
   STATISTICS
   ========================================================= */

function updateStatistics() {

    const scriptsCounter =
        document.getElementById("stat-scripts");

    const languagesCounter =
        document.getElementById("stat-languages");

    if (scriptsCounter) {

        scriptsCounter.textContent =
            scripts.length;
    }

    const languages = [
        ...new Set(
            scripts.map(script =>
                String(
                    script.language || "Code"
                ).toLowerCase()
            )
        )
    ];

    if (languagesCounter) {

        languagesCounter.textContent =
            languages.length;
    }
}

/* =========================================================
   LANGUAGE FILTERS
   ========================================================= */

function buildLanguageFilters() {

    if (!filter) {
        return;
    }

    const languages = [
        ...new Set(
            scripts.map(script =>
                String(
                    script.language || "Code"
                ).toLowerCase()
            )
        )
    ].sort();

    filter.innerHTML = `
        <option value="all">
            All languages
        </option>
    `;

    languages.forEach(language => {

        const option =
            document.createElement("option");

        option.value = language;

        option.textContent =
            getLanguageInfo(language).label;

        filter.appendChild(option);
    });

    if (languageList) {

        languageList.innerHTML =
            languages
                .map(language => {

                    return `
                        <span class="language-item">
                            ${escapeHTML(
                                getLanguageInfo(language).label
                            )}
                        </span>
                    `;

                })
                .join("");
    }
}

/* =========================================================
   SEARCH + FILTER
   ========================================================= */

function renderScripts() {

    if (!grid) {
        return;
    }

    const query =
        search ?
        search.value.trim().toLowerCase() :
        "";

    const selectedLanguage =
        filter ?
        filter.value :
        "all";

    const visibleScripts =
        scripts.filter(script => {

            const searchableText = [

                script.title,

                script.description,

                script.language,

                script.path,

                ...(Array.isArray(script.tags)
                    ? script.tags
                    : [])

            ]
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                !query ||
                searchableText.includes(query);

            const matchesLanguage =
                selectedLanguage === "all" ||
                String(
                    script.language || ""
                ).toLowerCase() ===
                selectedLanguage;

            return (
                matchesSearch &&
                matchesLanguage
            );
        });

    if (countLabel) {

        countLabel.textContent =
            `${visibleScripts.length} available`;
    }

    if (empty) {

        empty.classList.toggle(
            "hidden",
            visibleScripts.length > 0
        );
    }

    grid.innerHTML =
        visibleScripts
            .map(createScriptCard)
            .join("");

    attachCardEvents();
}

/* =========================================================
   SCRIPT CARD
   ========================================================= */

function createScriptCard(script) {

    const language =
        getLanguageInfo(script.language);

    const tags =
        Array.isArray(script.tags)
            ? script.tags.slice(0, 5)
            : [];

    return `
        <article
            class="card"
            data-script-path="${escapeHTML(
                script._path
            )}"
        >

            <div class="card-top">

                <div>
                    <h3>
                        ${escapeHTML(
                            script.title ||
                            "Untitled"
                        )}
                    </h3>
                </div>

                ${
                    script.new
                        ? `
                            <span class="new">
                                NEW
                            </span>
                        `
                        : ""
                }

            </div>

            <p class="desc">
                ${escapeHTML(
                    script.description ||
                    "No description."
                )}
            </p>

            <div class="meta">

                <span class="pill">
                    ${escapeHTML(
                        language.label
                    )}
                </span>

                ${
                    tags
                        .map(tag => `
                            <span class="pill">
                                ${escapeHTML(tag)}
                            </span>
                        `)
                        .join("")
                }

            </div>

            <div class="card-footer">

                <span>
                    ${escapeHTML(
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
}

/* =========================================================
   CARD EVENTS
   ========================================================= */

function attachCardEvents() {

    document
        .querySelectorAll(".card")
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    const path =
                        card.dataset.scriptPath;

                    const script =
                        scripts.find(
                            item =>
                                item._path === path
                        );

                    if (script) {

                        openModal(script);
                    }
                }
            );
        });
}

/* =========================================================
   MODAL
   ========================================================= */

function openModal(script) {

    if (!script) {
        return;
    }

    const modal =
        document.getElementById("modal");

    const title =
        document.getElementById("modal-title");

    const description =
        document.getElementById(
            "modal-description"
        );

    const language =
        document.getElementById(
            "modal-language"
        );

    const file =
        document.getElementById(
            "modal-file"
        );

    const code =
        document.getElementById(
            "modal-code"
        );

    if (!modal || !code) {
        return;
    }

    const languageData =
        getLanguageInfo(
            script.language
        );

    if (title) {

        title.textContent =
            script.title ||
            "Untitled";
    }

    if (description) {

        description.textContent =
            script.description ||
            "";
    }

    if (language) {

        language.textContent =
            languageData.label;
    }

    if (file) {

        file.textContent =
            script.path ||
            script._path;

        file.dataset.file =
            script._path;
    }

    code.className =
        "language-" +
        languageData.hl;

    code.textContent =
        script.code ||
        "";

    modal.classList.remove(
        "hidden"
    );

    if (
        window.hljs &&
        typeof window.hljs.highlightElement ===
        "function"
    ) {

        window.hljs.highlightElement(
            code
        );
    }
}

/* =========================================================
   CLOSE MODAL
   ========================================================= */

function closeModal() {

    const modal =
        document.getElementById("modal");

    if (modal) {

        modal.classList.add(
            "hidden"
        );
    }
}

/* =========================================================
   MODAL BUTTONS
   ========================================================= */

const closeButton =
    document.getElementById(
        "close-modal"
    );

if (closeButton) {

    closeButton.addEventListener(
        "click",
        closeModal
    );
}

const modalBackdrop =
    document.querySelector(
        ".modal-backdrop"
    );

if (modalBackdrop) {

    modalBackdrop.addEventListener(
        "click",
        closeModal
    );
}

/* =========================================================
   REFRESH
   ========================================================= */

const refreshButton =
    document.getElementById(
        "refresh"
    );

if (refreshButton) {

    refreshButton.addEventListener(
        "click",
        loadScripts
    );
}

/* =========================================================
   COPY CODE
   ========================================================= */

const copyButton =
    document.getElementById(
        "copy-btn"
    );

if (copyButton) {

    copyButton.addEventListener(
        "click",
        async () => {

            const file =
                document.getElementById(
                    "modal-file"
                );

            if (!file) {
                return;
            }

            const path =
                file.dataset.file;

            const script =
                scripts.find(
                    item =>
                        item._path === path
                );

            if (!script) {
                return;
            }

            const code =
                script.code || "";

            try {

                await navigator.clipboard.writeText(
                    code
                );

            } catch {

                const textarea =
                    document.createElement(
                        "textarea"
                    );

                textarea.value =
                    code;

                document.body.appendChild(
                    textarea
                );

                textarea.select();

                document.execCommand(
                    "copy"
                );

                textarea.remove();
            }

            const toast =
                document.getElementById(
                    "toast"
                );

            if (toast) {

                toast.classList.add(
                    "show"
                );

                setTimeout(
                    () => {

                        toast.classList.remove(
                            "show"
                        );

                    },
                    1400
                );
            }
        }
    );
}

/* =========================================================
   SEARCH
   ========================================================= */

if (search) {

    search.addEventListener(
        "input",
        renderScripts
    );
}

if (filter) {

    filter.addEventListener(
        "change",
        renderScripts
    );
}

/* =========================================================
   KEYBOARD
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            (event.ctrlKey ||
             event.metaKey) &&
            event.key.toLowerCase() === "k"
        ) {

            event.preventDefault();

            if (search) {
                search.focus();
            }
        }

        if (
            event.key === "Escape"
        ) {

            closeModal();
        }
    }
);

/* =========================================================
   START CODEHUB
   ========================================================= */

console.log(
    "%cCodeHub V9",
    "color:#7aa2ff;font-weight:bold;font-size:18px"
);

loadScripts();
