class TreeView {
    constructor() {
        this.container = window.document.createElement('div');
        loadCSS("https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.83/dist/themes/light.css");
        loadScript("https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.83/dist/shoelace.js", true);
    }

    rebuild(hierarchy) {
        const moduleSet = new Set(Object.keys(hierarchy));
        Object.values(hierarchy).forEach(arr => arr.forEach(id => moduleSet.add(id)));
        const modules = Array.from(moduleSet).map(id => {
            return id.includes('.') ? id : `others.${id}`;
        });

        this.container.innerHTML = '<strong>Arborescence des modules</strong>';
        const treeRoot = document.createElement('sl-tree');
        const nodeMap = new Map(); // Map des chemins vers leurs éléments <sl-tree-item>

        for (let fullId of modules) {
            const segments = fullId.trim().split('.');
            let path = '';
            let parent = treeRoot;
            for (const segment of segments) {
                path = path ? `${path}.${segment}` : segment;
                if (!nodeMap.has(path)) {
                    const item = document.createElement('sl-tree-item');
                    item.textContent = segment;
                    nodeMap.set(path, item);
                    parent.appendChild(item);
                }

                parent = nodeMap.get(path);
            }
        }
        this.container.appendChild(treeRoot);
    }
}
