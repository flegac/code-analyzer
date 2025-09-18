import {MyComponent} from "/core/utils.js";

const TEMPLATE = `
<sl-details summary="🎨 Display Controller" open>
  <div style="display: flex; flex-direction: column; gap: 1em; padding: 1em;">

    <sl-details summary="🔗 Links: Hierarchy" open>
      <sl-color-picker id="hierarchy-color" size="small" label="Color"></sl-color-picker>
      <sl-range id="hierarchy-particles" label="Particles" min="0" max="10" step="1"></sl-range>
      <sl-range id="hierarchy-width" label="Width" min="0" max="30" step="0.1"></sl-range>
    </sl-details>

    <sl-details summary="🔗 Links: Dependencies" open>
      <sl-color-picker id="dependencies-color" size="small" label="Color"></sl-color-picker>
      <sl-range id="dependencies-particles" label="Particles" min="0" max="10" step="1"></sl-range>
      <sl-range id="dependencies-width" label="Width" min="0" max="30" step="0.1"></sl-range>
    </sl-details>

  </div>
</sl-details>
`;

export class LinksDisplayController extends MyComponent {
    constructor(app) {
        super('graph-edge-gui', TEMPLATE);
        this.app = app;

        const onChange = () => app.display.apply();
        const onChange2 = () => app.apply();

        const nodes = app.state.display.nodes;
        const text = nodes.text;
        const links = app.state.display.links;

        // 🔗 Links
        this._bindLinkControls('hierarchy', links.hierarchy, onChange);
        this._bindLinkControls('dependencies', links.dependencies, onChange);
    }

    _bindLinkControls(prefix, state, onChange) {
        const color = this.container.querySelector(`#${prefix}-color`);
        const particles = this.container.querySelector(`#${prefix}-particles`);
        const width = this.container.querySelector(`#${prefix}-width`);

        color.value = state.color;
        particles.value = state.particles;
        width.value = state.width;

        color.addEventListener('sl-change', () => {
            state.color = color.value;
            onChange();
        });

        particles.addEventListener('sl-input', () => {
            state.particles = parseInt(particles.value);
            onChange();
        });

        width.addEventListener('sl-input', () => {
            state.width = parseFloat(width.value);
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