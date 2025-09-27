import { BaseComponent } from "/gui/core/base.component.js";
import { PhysicsService } from "/display/physics.service.js";

const STYLE = `
  .panel {
    display: flex;
    flex-direction: column;
    gap: 0.1cm;
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
    <div class="slider-row">
      <sl-switch v-model="state.isActive" @sl-change="apply" checked>Running status</sl-switch>
      <sl-button @click="apply" variant="primary">🔥 Simulate</sl-button>
    </div>

    <div class="slider-row">
      <label>Fix axes</label>
      <sl-checkbox @sl-change="state.fixX = $event.target.checked; apply()">X</sl-checkbox>
      <sl-checkbox @sl-change="state.fixY = $event.target.checked; apply()">Y</sl-checkbox>
      <sl-checkbox @sl-change="state.fixZ = $event.target.checked; apply()">Z</sl-checkbox>
    </div>

    <div class="slider-row">
      <label for="repulsionFactor">Repulsion</label>
      <sl-range v-model="state.repulsionFactor" min="0" max="1" step="0.01" @sl-input="apply"></sl-range>
    </div>

    <div class="slider-row">
      <label for="strength">Attraction</label>
      <sl-range v-model="state.link.strength" min="0" max="25" step="0.01" @sl-input="apply"></sl-range>
    </div>

    <div class="slider-row">
      <label for="relationStrengthFactor">Hierarchy ⟷ Relation</label>
      <sl-range v-model="state.link.relationStrengthFactor" min="0" max="1" step="0.01" @sl-input="apply"></sl-range>
    </div>
  </div>
`;

export class PhysicsComponent extends BaseComponent {
  constructor() {
    super({
      template: TEMPLATE,
      style: STYLE,
      state: {
        state: PhysicsService.singleton.state,
        apply: PhysicsService.singleton.apply,
      }
    });
  }

}
