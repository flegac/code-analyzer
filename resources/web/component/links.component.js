import { BaseComponent } from "/component/base.component.js";
import { DisplayService } from "/service/display.service.js"
import { GraphService } from "/service/graph.service.js"

const TEMPLATE = `
  <div style="display: flex; flex-direction: column; gap: 1em; padding: 1em;">

    <div>
      <h3>Relation</h3>
      <sl-color-picker id="relation-color" size="small" label="Color"></sl-color-picker>
      <sl-range id="relation-particles" label="Particles" min="0" max="10" step="1"></sl-range>
      <sl-range id="relation-width" label="Width" min="0" max="30" step="0.1"></sl-range>
    </div>

    <div>
      <h3>Hierarchy</h3>
      <sl-color-picker id="hierarchy-color" size="small" label="Color"></sl-color-picker>
      <sl-range id="hierarchy-particles" label="Particles" min="0" max="10" step="1"></sl-range>
      <sl-range id="hierarchy-width" label="Width" min="0" max="30" step="0.1"></sl-range>
    </div>

  </div>
`;

export class LinksComponent extends BaseComponent {
  constructor() {
    super('graph-edge-gui', TEMPLATE);
    const onChange = () => DisplayService.singleton.apply();

    const nodes = DisplayService.singleton.nodes;
    const text = nodes.text;
    const links = DisplayService.singleton.links;

    // 🔗 Links
    this._bindLinkControls('hierarchy', links.hierarchy, onChange);
    this._bindLinkControls('relation', links.relation, onChange);
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