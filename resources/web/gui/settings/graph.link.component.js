import { BaseComponent } from "/gui/core/base.component.js";
import { GraphStyleService } from "/display/graph.style.service.js"

const STYLE = `
  .panel {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 1em;
  }

  .slider-row {
    display: flex;
    align-items: center;
    gap: 1em;
  }

  .slider-row label {
    width: 80px;
  }

  sl-range {
    flex: 1;
    --track-color-active: var(--sl-color-primary-600);
    --track-color-inactive: var(--sl-color-primary-100);
  }

  h3 {
    margin: 0;
  }
`;

const TEMPLATE = `
  <div class="panel">
    <div>
      <div class="section-header">
        <sl-color-picker id="relation-color" size="small"></sl-color-picker>
        <h3>Relation</h3>
      </div>
      <div class="slider-row">
        <label for="relation-particles">Particles</label>
        <sl-range id="relation-particles" min="0" max="10" step="1"></sl-range>
      </div>
      <div class="slider-row">
        <label for="relation-width">Width</label>
        <sl-range id="relation-width" min="0" max="30" step="0.1"></sl-range>
      </div>
    </div>

    <div>
      <div class="section-header">
        <sl-color-picker id="hierarchy-color" size="small"></sl-color-picker>
        <h3>Hierarchy</h3>
      </div>
      <div class="slider-row">
        <label for="hierarchy-particles">Particles</label>
        <sl-range id="hierarchy-particles" min="0" max="10" step="1" small></sl-range>
      </div>
      <div class="slider-row">
        <label for="hierarchy-width">Width</label>
        <sl-range id="hierarchy-width" min="0" max="30" step="0.1"></sl-range>
      </div>
    </div>
  </div>
`;


export class GraphLinkComponent extends BaseComponent {
    constructor() {
        super({
            template: TEMPLATE,
            style: STYLE,
        });
        const onChange = () => GraphStyleService.singleton.apply();

        const links = GraphStyleService.singleton.links;

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
