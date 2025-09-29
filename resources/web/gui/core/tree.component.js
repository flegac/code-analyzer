export class TreeComponent {
  /**
   * options:
   *  - renderLeaf(nodeTree, ctx, depth, pathParts) => HTMLElement (sl-tree-item)
   *  - renderGroup(key, nodeTree, ctx, depth, pathParts) => HTMLElement (sl-tree-item)
   *  - buildAncestorsMap(treeData, map) optional (default provided)
   */
  constructor(options = {}) {
    this.renderLeaf = options.renderLeaf;
    this.renderGroup = options.renderGroup;
    this.buildAncestorsMap = options.buildAncestorsMap || defaultBuildAncestorsMap;
  }

  // build fragment off-DOM and return it (sl-tree with items)
  buildFragment(treeData, ctx) {
    const fragment = document.createDocumentFragment();
    const tree = document.createElement('sl-tree');

    // hide while building to avoid flicker
    tree.style.visibility = 'hidden';
    tree.setAttribute('data-building', 'true');

    // build ancestors map and attach to ctx if needed
    const ancestorsMap = new Map();
    this.buildAncestorsMap(treeData, [], ancestorsMap);
    ctx.ancestorsMap = ancestorsMap;

    const items = this._buildItemsRecursive(treeData, ctx, 0, []);
    items.forEach(it => tree.appendChild(it));

    // optional init step if provided on ctx
    if (typeof ctx.initGroupsState === 'function') ctx.initGroupsState();

    fragment.appendChild(tree);
    return fragment;
  }

  // render directly into container (replaces content)
  renderTo(container, treeData, ctx) {
    const fragment = this.buildFragment(treeData, ctx);
    requestAnimationFrame(() => {
      container.innerHTML = '';
      container.appendChild(fragment);
      requestAnimationFrame(() => {
        const tree = container.querySelector('sl-tree[data-building="true"]');
        if (tree) {
          tree.style.visibility = '';
          tree.removeAttribute('data-building');
        }
      });
    });
  }

  // recursive builder that delegates to renderLeaf / renderGroup
  _buildItemsRecursive(tree, ctx, depth = 0, pathParts = []) {
    const items = [];
    for (const key in tree) {
      if (key === '__node') continue;
      const nodeTree = tree[key];
      let item;
      if (nodeTree.__node) {
        item = this.renderLeaf(nodeTree, ctx, depth, pathParts.concat(key));
      } else {
        item = this.renderGroup(key, nodeTree, ctx, depth, pathParts.concat(key));
      }
      const children = this._buildItemsRecursive(nodeTree, ctx, depth + 1, pathParts.concat(key));
      children.forEach(c => item.appendChild(c));
      items.push(item);
    }
    return items;
  }
}

/* Default ancestors builder (leafName -> array of groupPaths) */
function defaultBuildAncestorsMap(treeNode, pathParts, map) {
  for (const key in treeNode) {
    if (key === '__node') {
      const groupPaths = pathParts.map((_, i) => pathParts.slice(0, i + 1).join('.'));
      map.set(treeNode.__node.name, groupPaths);
      continue;
    }
    defaultBuildAncestorsMap(treeNode[key], pathParts.concat(key), map);
  }
}
