class TreeView {
    constructor(container_id = 'module-tree') {
        this.container = createDiv(container_id, 'my-box');
    }

    render(rawData) {
        // Construire l'ensemble des modules à partir des clés et des dépendances
        const moduleSet = new Set(Object.keys(rawData));
        Object.values(rawData).forEach(arr => arr.forEach(id => moduleSet.add(id)));
        const modules = Array.from(moduleSet);

        // Nettoyer le conteneur
        this.container.innerHTML = '<strong>Arborescence des modules</strong>';

        // Créer l'arborescence Shoelace
        const treeRoot = document.createElement('sl-tree');
        this._buildTreeItems(modules, treeRoot);

        this.container.appendChild(treeRoot);
    }

    _buildTreeItems(modules, treeRoot) {
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
    }
}
