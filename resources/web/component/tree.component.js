export class TreeComponent {
    constructor(onUpdate = null, id = 'tree-view') {
        this.container = window.document.createElement('div');
        this.container.id = id;
        this.visibleLeaves = new Set();
        this.onUpdate = onUpdate || ((groups) => {
            console.log(groups);
        });
    }

    rebuild(hierarchy) {
        const modules = hierarchy.nodes();

        this.container.innerHTML = '<strong>Arborescence des modules</strong>';
        const treeRoot = document.createElement('sl-tree');
        treeRoot.addEventListener('sl-expand', e => this.updateExpand(e.target));
        treeRoot.addEventListener('sl-collapse', e => this.updateCollapse(e.target));

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
                    item.dataset.path = path;
                    nodeMap.set(path, item);
                    parent.appendChild(item);
                }

                parent = nodeMap.get(path);
            }
        }
        this.container.appendChild(treeRoot);
    }

    updateCollapse(item) {
        const descendants = item.getChildrenItems();

        descendants.forEach(child => {
            const path = this.getFullPath(child);
            this.visibleLeaves.delete(path);
        });
        if (this.onUpdate !== null) {
            this.onUpdate(this.visibleLeaves);
        }
    }

    updateExpand(item) {
        const descendants = item.getChildrenItems();

        descendants.forEach(child => {
            const path = this.getFullPath(child);
            this.visibleLeaves.add(path);
        });
        if (this.onUpdate !== null) {
            this.onUpdate(this.visibleLeaves);
        }
    }


    getFullPath(item) {
        return item.dataset.path;
    }

}
