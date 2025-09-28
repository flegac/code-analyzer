import { BaseComponent } from "./core/base.component.js";
import { P } from "../project/project.service.js";
import { FF } from "../display/filter.service.js";

const STYLE = `...`; // coller ton CSS ici
const TEMPLATE = `
<div name="graph-settings" class="graph-filter">
  <div class="section-header">
     <sl-switch v-model="isActive" @sl-change="apply" checked disabled></sl-switch>
    <h3>Filter</h3>
  </div>
  
  <div class="slider-row">
    <label>By depth</label>
    <sl-range v-model="state.hierarchyPruneLevel" min="1" max="10" step="1" value="1" @sl-change="applyPruning"></sl-range>
  </div>

  <div class="slider-row">
    <label>Search</label>
    <sl-input v-model="nodeName" @sl-input="apply" disabled></sl-input>
  </div>

  <div name="nodes"></div>
</div>
`;

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
    this._checkboxByName = new Map();
    this._updatingLock = false;
  }

  applyPruning(value) {
    const v = parseInt(value);
    if (!Number.isNaN(v)) {
      FF.hierarchyPruneLevel = v;
      // commit local state immediately
      FF.forbiddenNodes = Array.from(this.forbiddenNodes);
      FF.apply();
    }
  }

  /* Met à jour uniquement l'état interne (forbiddenNodes) — NE lance PAS FF.apply */
  updateState(nodeName, checked) {
    if (checked) this.forbiddenNodes.delete(nodeName);
    else this.forbiddenNodes.add(nodeName);
  }

  /* Commit unique : applique l'état interne dans FF et lance FF.apply une seule fois */
  commitState() {
    FF.forbiddenNodes = Array.from(this.forbiddenNodes);
    FF.apply();
    console.log('update', this.forbiddenNodes)
  }

  updateGui() {
    const container = this.getPanel('nodes');
    container.innerHTML = "";

    const relation = P.project.relation();
    const nodes = relation.nodes();

    const treeData = buildTreeFromNames(nodes);
    const tree = document.createElement("sl-tree");

    const items = createTreeItems(treeData, {
      checkboxByName: this._checkboxByName,
      updateState: (n, s) => this.updateState(n, s),
      lock: () => { this._updatingLock = true; },
      unlock: () => { this._updatingLock = false; },
      isLocked: () => this._updatingLock,
      commit: () => this.commitState()
    });

    items.forEach(i => tree.appendChild(i));
    container.appendChild(tree);
  }
}

/* ---------- Helpers ---------- */
function buildTreeFromNames(nodes) {
  const root = {};
  nodes.forEach(n => {
    const nodeObj = (typeof n === "string") ? { name: n, active: true } : { ...n, name: n.name ?? String(n) };
    const parts = nodeObj.name.split(".");
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
      if (k === "__node") names.push(node.__node.name);
      else recurse(node[k]);
    }
  })(treeNode);
  return names;
}

/* Création d'éléments avec propagation et commit unique */
function createTreeItems(tree, ctx) {
  const items = [];

  for (const key in tree) {
    if (key === "__node") continue;

    const nodeTree = tree[key];
    const item = document.createElement("sl-tree-item");
    item.label = key;

    if (nodeTree.__node) {
      const nodeObj = nodeTree.__node;
      const fullName = nodeObj.name;

      const checkbox = document.createElement("sl-checkbox");
      checkbox.checked = nodeObj.active ?? true;
      checkbox.style.marginRight = "0.5em";

      ctx.checkboxByName.set(fullName, checkbox);

      const label = document.createElement("span");
      label.textContent = fullName.split(".").pop();

      // handler : met à jour l'état local pour chaque noeud modifié et appelle un commit unique en fin d'interaction
      checkbox.addEventListener("sl-change", (e) => {
        if (ctx.isLocked?.()) return;
        const checked = e.target.checked;

        ctx.lock?.();

        // mettre à jour le noeud actuel
        nodeObj.active = checked;
        ctx.updateState(fullName, checked);

        // propager aux descendants (mise à jour locale et checkbox UI) — NE PAS appeler FF.apply ici
        const descendants = collectDescendantNodeNames(nodeTree).filter(n => n !== fullName);
        if (descendants.length) {
          descendants.forEach(n => {
            const cb = ctx.checkboxByName.get(n);
            if (cb && cb !== checkbox) cb.checked = checked;
            // mettre à jour l'état interne pour chaque descendant
            ctx.updateState(n, checked);
          });
        }

        ctx.unlock?.();

        // commit unique après propagation
        ctx.commit?.();
      });

      item.appendChild(checkbox);
      item.appendChild(label);
    }

    const childItems = createTreeItems(nodeTree, ctx);
    childItems.forEach(ci => item.appendChild(ci));
    items.push(item);
  }

  return items;
}
