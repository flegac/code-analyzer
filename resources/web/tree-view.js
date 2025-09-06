class TreeView {
    constructor(container_id = 'module-tree') {
        this.container = createDiv(container_id, 'my-box tree-view');
        loadCss('tree-view.css');
        this.modules = null;
    }

    _rebuild(modules) {
        const tree = {name: 'root', children: []};

        for (const fullId of modules) {
            const segments = fullId.trim().split('.');
            let cursor = tree;

            for (let key of segments) {
                let child = cursor.children.find(n => n.name === key);

                if (!child) {
                    child = {name: key, children: []};
                    cursor.children.push(child);
                }
                cursor = child;
            }
        }
        return tree;
    }


    render(rawData) {
        const moduleSet = new Set(Object.keys(rawData));
        Object.values(rawData).forEach(arr => arr.forEach(id => moduleSet.add(id)));
        const modules = Array.from(moduleSet);

        const tree = this._rebuild(modules);

        const container = this.container;
        container.innerHTML = '<strong>Arborescence des modules</strong>';
        this._renderTree(tree, container);
    }

    _renderTree(node, container) {
        const ul = document.createElement('ul');
        container.appendChild(ul);

        for (const child of node.children || []) {
            const li = document.createElement('li');
            const label = document.createElement('span');

            label.textContent = child.name;
            label.classList.add('tree-label');
            li.appendChild(label);

            if (!child.children || child.children.length === 0) {
                li.classList.add('leaf');
            }

            ul.appendChild(li);

            // Si le nœud a des enfants, on crée récursivement la sous-liste
            if (child.children && child.children.length > 0) {
                this._renderTree(child, li);

                // Au clic, on bascule la classe 'expanded' pour montrer/masquer
                label.addEventListener('click', () => {
                    li.classList.toggle('expanded');
                });
            }
        }
    }
}