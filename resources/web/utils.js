function createDiv(id, classes = null) {
    const container = document.createElement('div');
    container.id = id;
    if (classes !== null) container.className = classes;
    document.body.appendChild(container);
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

function loadScript(src, module = false, callback) {
    const s = document.createElement('script');
    s.src = src;
    if (module !== false) s.type = 'module';
    s.onload = callback;
    document.head.appendChild(s);
}

function loadCSS(href) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
}