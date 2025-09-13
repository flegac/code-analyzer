class GuiGraphController {
    constructor(params, id, title = null) {
        this.params = params;
        this.container = createDiv(id);
        this.gui = new lil.GUI({container: this.container});
        this.container.querySelector('.title').textContent = title;
    }
}

function createDiv(id, classes = null, parent = null) {
    if (parent === null) {
        parent = document.body;
    }
    const container = document.createElement('div');
    container.id = id;
    if (classes !== null) container.className = classes;
    parent.appendChild(container);
    return container
}

function loadCss(path) {
    fetch(path)
        .then(response => response.text())
        .then(css => {
            const styleTag = document.createElement('style');
            styleTag.textContent = css;
            document.head.appendChild(styleTag);
        })
        .catch(error => console.error('Erreur de chargement CSS :', error));
}

async function loadScript(src, module = false, callback) {
    const s = document.createElement('script');
    s.src = src;
    if (module !== false) s.type = 'module';
    s.onload = callback;
    document.head.appendChild(s);
}

function loadScriptAsync(src) {
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
}

function loadCSS(href) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
}

async function loadCSSAsync(href) {
    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`Erreur de chargement CSS : ${href}`));
        document.head.appendChild(link);
    });
}