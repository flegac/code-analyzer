import {MyComponent} from "/core/utils.js";

const TEMPLATE = `
<sl-details summary="🎨 Display Controller" open>
  <div style="display: flex; flex-direction: column; gap: 1em; padding: 1em;">

    <sl-details summary="🟢 Nodes" open>
      <sl-range id="baseRadius" label="Radius" min="0" max="1000" step="0.01"></sl-range>
      <sl-range id="colorGroupDepthRange" label="Color group depth range" min="0" max="5" step="1"></sl-range>

      <sl-select id="color" label="Color">
        <sl-option value="group">group</sl-option>
        <sl-option value="category">category</sl-option>
      </sl-select>

      <sl-select id="size" label="Size">
        <sl-option value="lines">lines</sl-option>
        <sl-option value="imported">imported</sl-option>
        <sl-option value="imports">imports</sl-option>
        <sl-option value="class_count">class_count</sl-option>
        <sl-option value="method_count">method_count</sl-option>
        <sl-option value="function_count">function_count</sl-option>
        <sl-option value="loops">loops</sl-option>
        <sl-option value="branches">branches</sl-option>
      </sl-select>

    </sl-details>
    
      <sl-details summary="🔤 Text" open>
        <sl-range id="hiddenDepthRange" label="Hidden depth range" min="0" max="5" step="1"></sl-range>
        <sl-range id="scaling" label="Scaling" min="0" max="5" step="0.01"></sl-range>
      </sl-details>

  </div>
</sl-details>
`;

export class NodesDisplayController extends MyComponent {
    constructor(app) {
        super('graph-edge-gui', TEMPLATE);
        this.app = app;

        const onChange = () => app.display.apply();
        const onChange2 = () => app.apply();

        const nodes = app.state.display.nodes;
        const text = nodes.text;
        const links = app.state.display.links;

        // 🟢 Nodes
        this._bindSlider('baseRadius', nodes, 'baseRadius', onChange);
        this._bindSlider('colorGroupDepthRange', nodes, 'colorGroupDepthRange', onChange2);
        this._bindSelect('color', nodes, 'color', onChange);
        this._bindSelect('size', nodes, 'size', onChange);

        // 🔤 Text
        this._bindSlider('hiddenDepthRange', text, 'hiddenDepthRange', onChange2);
        this._bindSlider('scaling', text, 'scaling', onChange);

    }

    _bindSlider(id, target, key, onChange) {
        const el = this.container.querySelector(`#${id}`);
        el.value = target[key];
        el.addEventListener('sl-input', () => {
            target[key] = parseFloat(el.value);
            onChange();
        });
    }

    _bindSelect(id, target, key, onChange) {
        const el = this.container.querySelector(`#${id}`);
        el.value = target[key];
        el.addEventListener('sl-change', () => {
            target[key] = el.value;
            onChange();
        });
    }

}


//TODO make that automatic (from module infos)
const SIZE_ATTRIBUTES = [
    'lines',
    'imported',
    'imports',
    'class_count',
    'method_count',
    'function_count',
    'loops',
    'branches'
];
const COLOR_ATTRIBUTES = [
    'group',
    'category',
];