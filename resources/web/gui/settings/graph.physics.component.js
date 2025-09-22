import {BaseComponent} from "/gui/core/base.component.js";

import {LayoutService} from "/core/layout.service.js"

import {PhysicsService} from "/display/physics.service.js"

const STYLE = `
  .panel {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
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
`;

const TEMPLATE = `
  <div class="panel">
    <sl-switch id="isActive">Running status</sl-switch>
    <sl-button id="simulate" variant="primary">🔥 Simulate</sl-button>

    <sl-select id="dimension" label="Projection">
      <sl-option value="2">2D</sl-option>
      <sl-option value="3">3D</sl-option>
    </sl-select>

    <div class="slider-row">
      <label for="collapsingDepth">Collapsing depth</label>
      <sl-range id="collapsingDepth" min="0" max="5" step="1"></sl-range>
    </div>

    <div class="slider-row">
      <label for="repulsionFactor">Repulsion</label>
      <sl-range id="repulsionFactor" min="0" max="1" step="0.01"></sl-range>
    </div>

    <div class="slider-row">
      <label for="strength">Link strength</label>
      <sl-range id="strength" min="0" max="25" step="0.01"></sl-range>
    </div>

    <div class="slider-row">
      <label for="relationStrengthFactor">Hierarchy ⟷ Relation</label>
      <sl-range id="relationStrengthFactor" min="0" max="1" step="0.01"></sl-range>
    </div>
  </div>
`;


export class GraphPhysicsComponent extends BaseComponent {
    constructor() {
        super({
            template: TEMPLATE,
            style: STYLE,
        });

        const state = PhysicsService.singleton.state;
        const onChange = () => PhysicsService.singleton.apply();

        // 🟢 Running status
        const isActive = this.container.querySelector('#isActive');
        isActive.checked = state.isActive;
        isActive.addEventListener('sl-change', () => {
            state.isActive = isActive.checked;
            onChange();
        });

        // 🔥 Simulate
        const simulate = this.container.querySelector('#simulate');
        simulate.addEventListener('click', () => {
            LayoutService.singleton.graph.getGraph().d3ReheatSimulation();
        });

        // 🧭 Projection
        const dimension = this.container.querySelector('#dimension');
        dimension.value = String(state.dimension);
        dimension.addEventListener('sl-change', () => {
            state.dimension = parseInt(dimension.value);
            onChange();
        });

        // 🧩 Sliders
        const sliders = [
            ['collapsingDepth', state, 'collapsingDepth'],
            ['repulsionFactor', state, 'repulsionFactor'],
            ['strength', state.link, 'strength'],
            ['relationStrengthFactor', state.link, 'relationStrengthFactor']
        ];

        sliders.forEach(([id, target, key]) => {
            const el = this.container.querySelector(`#${id}`);
            el.value = target[key];
            el.addEventListener('sl-input', () => {
                target[key] = parseFloat(el.value);
                onChange();
            });
        });
    }
}
