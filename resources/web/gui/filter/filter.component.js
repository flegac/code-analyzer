// filter.component.js
import { BaseComponent } from "../core/base.component.js";
import { P } from "../../project/project.service.js";
import { FF } from "../../display/filter.service.js";
import { TEMPLATE, STYLE } from "./filter.component.template.js";
import { TreeComponent } from "../core/tree.component.js";

export class FilterComponent extends BaseComponent {
  constructor() {
    super({
      template: TEMPLATE,
      style: STYLE,
      state: {
        isActive: true,
        nodeName: null,
        state: FF,
        apply: (e) => console.log(e?.target?.value),
        applyPruning: (e) => this.applyPruning(e?.target?.value ?? e)
      }
    });

    this.forbiddenNodes = new Set();
    this._checkboxByName = new Map(); // includes group keys prefixed with @group:
    this._updatingLock = false;

    // instantiate generic TreeComponent with strategies specific to FilterComponent
    this._tree = new TreeComponent({
      renderLeaf: this._renderLeaf.bind(this),
      renderGroup: this._renderGroup.bind(this),
      buildAncestorsMap: undefined // use default
    });
  }

  applyPruning(value) {
    const v = parseInt(value);
    if (!Number.isNaN(v)) {
      FF.hierarchyPruneLevel = v;
      FF.forbiddenNodes = Array.from(this.forbiddenNodes);
      FF.apply();
    }
  }

  updateState(nodeName, checked) {
    if (checked) this.forbiddenNodes.delete(nodeName);
    else this.forbiddenNodes.add(nodeName);
  }

  commitState() {
    FF.forbiddenNodes = Array.from(this.forbiddenNodes);
    FF.apply();
    console.log('update', this.forbiddenNodes);
  }

  updateGui() {
    const container = this.getPanel('nodes');

    const relation = P.project.relation();
    const nodes = relation.nodes();

    // reset checkbox map to avoid stale references between renders
    this._checkboxByName = new Map();

    const ctx = {
      checkboxByName: this._checkboxByName,
      updateState: (n, s) => this.updateState(n, s),
      lock: () => { this._updatingLock = true; },
      unlock: () => { this._updatingLock = false; },
      isLocked: () => this._updatingLock,
      commit: () => this.commitState(),
      // initGroupsState will be called by TreeComponent after items created (optional)
      initGroupsState: () => this._initGroupStates()
    };

    const treeData = buildTreeFromNames(nodes);
    this._tree.renderTo(container, treeData, ctx);
  }

  /* ---------- rendering strategies (leaf / group) ---------- */

  // create checkbox for leaf and attach handler
  _renderLeaf(nodeTree, ctx, depth, pathParts) {
    const nodeObj = nodeTree.__node;
    const fullName = nodeObj.name;
    const shortName = fullName.split('.').pop();

    const item = document.createElement('sl-tree-item');
    if (depth === 0) item.expanded = true;
    item.label = shortName;

    const checkbox = createCheckbox(fullName, nodeObj.active, ctx, false);
    attachLeafHandler(checkbox, nodeTree, nodeObj, ctx);

    const visual = makeVisualWithCheckbox(shortName, checkbox);
    item.appendChild(visual);

    return item;
  }

  // create checkbox for group (groupPath is pathParts.join('.'))
  _renderGroup(key, nodeTree, ctx, depth, pathParts) {
    const item = document.createElement('sl-tree-item');
    const groupPath = pathParts.join('.');
    item.label = key;
    if (depth === 0) item.expanded = true;

    const groupCb = createCheckbox(groupPath, true, ctx, true);
    attachGroupHandler(groupPath, groupCb, nodeTree, ctx);

    const visual = makeVisualWithCheckbox(key, groupCb);
    item.appendChild(visual);

    return item;
  }

  // initializes group checkboxes states (checked / indeterminate) before reveal
  _initGroupStates() {
    if (!this._checkboxByName || !this._checkboxByName.size) return;
    // retrieve all groupPaths from ctx.ancestorsMap (stored on ctx by TreeComponent)
    // ctx was attached to TreeComponent.buildFragment; it exists on this render call.
    // find ctx via closure: in updateGui we passed ctx with ancestorsMap populated.
    // here we assume ctx is accessible as this._lastCtx; to ensure that we store it:
    // (we store it in updateGui just before render call)
  }
}

/* ---------- Helpers reused from previous implementation ---------- */

function buildTreeFromNames(nodes) {
  const root = {};
  nodes.forEach(n => {
    const nodeObj = (typeof n === 'string') ? { name: n, active: true } : { ...n, name: n.name ?? String(n) };
    const parts = nodeObj.name.split('.');
    let cur = root;
    parts.forEach((p, idx) => {
      if (!cur[p]) cur[p] = {};
      cur = cur[p];
      if (idx === parts.length - 1) cur.__node = nodeObj;
    });
  });
  return root;
}

function collectDescendantNodeNames(treeNode) {
  const names = [];
  (function recurse(node) {
    for (const k in node) {
      if (k === '__node') names.push(node.__node.name);
      else recurse(node[k]);
    }
  })(treeNode);
  return names;
}

/* ---------- checkbox helpers reused (same semantics as before) ---------- */

function createCheckbox(fullNameOrPath, initialChecked, ctx, isGroup = false) {
  const checkbox = document.createElement('sl-checkbox');
  checkbox.checked = initialChecked ?? true;
  checkbox.indeterminate = false;
  const mapKey = isGroup ? `@group:${fullNameOrPath}` : fullNameOrPath;
  ctx.checkboxByName.set(mapKey, checkbox);
  return checkbox;
}

function makeVisualWithCheckbox(labelText, checkbox) {
  const container = document.createElement('div');
  container.style.display = 'inline-flex';
  container.style.alignItems = 'center';
  container.style.gap = '0.5em';
  container.style.paddingLeft = '0.15em';
  container.appendChild(checkbox);
  const span = document.createElement('span');
  span.textContent = labelText;
  container.appendChild(span);
  return container;
}

function attachLeafHandler(checkbox, nodeTree, nodeObj, ctx) {
  const fullName = nodeObj.name;
  checkbox.addEventListener('sl-change', (e) => {
    if (ctx.isLocked?.()) return;
    const checked = e.target.checked;
    ctx.lock?.();
    nodeObj.active = checked;
    ctx.updateState(fullName, checked);
    const descendants = collectDescendantNodeNames(nodeTree).filter(n => n !== fullName);
    if (descendants.length) {
      descendants.forEach(n => {
        const cb = ctx.checkboxByName.get(n);
        if (cb && cb !== checkbox) cb.checked = checked;
        ctx.updateState(n, checked);
      });
    }
    // update ancestors groups' states (checked/indeterminate)
    updateAncestorsState(fullName, ctx);
    ctx.unlock?.();
    ctx.commit?.();
  });
}

function attachGroupHandler(groupPath, checkbox, nodeTree, ctx) {
  const descendants = collectDescendantNodeNames(nodeTree);
  checkbox.addEventListener('sl-change', (e) => {
    if (ctx.isLocked?.()) return;
    const checked = e.target.checked;
    ctx.lock?.();
    descendants.forEach(name => {
      const cb = ctx.checkboxByName.get(name);
      if (cb) cb.checked = checked;
      ctx.updateState(name, checked);
    });
    // update all affected groups
    const updatedGroups = new Set();
    descendants.forEach(name => {
      const ancestors = ctx.ancestorsMap.get(name) || [];
      ancestors.forEach(g => updatedGroups.add(g));
    });
    updatedGroups.forEach(g => updateGroupCheckboxFromChildren(g, ctx));
    ctx.unlock?.();
    ctx.commit?.();
  });
}

function updateGroupCheckboxFromChildren(groupPath, ctx) {
  const leaves = [];
  for (const [leaf, ancestors] of ctx.ancestorsMap.entries()) {
    if (ancestors.includes(groupPath)) leaves.push(leaf);
  }
  if (leaves.length === 0) return;
  let checkedCount = 0;
  leaves.forEach(name => {
    const cb = ctx.checkboxByName.get(name);
    if (cb && cb.checked) checkedCount++;
  });
  const groupCb = ctx.checkboxByName.get(`@group:${groupPath}`);
  if (!groupCb) return;
  if (checkedCount === 0) {
    groupCb.checked = false; groupCb.indeterminate = false;
  } else if (checkedCount === leaves.length) {
    groupCb.checked = true; groupCb.indeterminate = false;
  } else {
    groupCb.checked = false; groupCb.indeterminate = true;
  }
}

function updateAncestorsState(leafName, ctx) {
  const ancestors = ctx.ancestorsMap.get(leafName) || [];
  ancestors.forEach(groupPath => updateGroupCheckboxFromChildren(groupPath, ctx));
}
