import { BaseComponent } from "./core/base.component.js";
import { PP } from "../display/physics.service.js";

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
      <sl-checkbox @sl-change="state.constraints.planar = $event.target.checked; apply()">Planar</sl-checkbox>
      <sl-checkbox @sl-change="state.constraints.spherical = $event.target.checked; apply()" checked>Spherical</sl-checkbox>
      <sl-range v-model="state.constraints.sphericalDepth" min="1" max="10" step="1" @sl-input="state.constraints.sphericalDepth = $event.target.value; apply()"></sl-range>
    </div>

    <div class="slider-row">
      <label for="repulsionFactor">Repulsion</label>
      <sl-range v-model="state.repulsionFactor" min="0" max="1" step="0.001" @sl-input="apply"></sl-range>
    </div>

    <div class="slider-row">
      <label for="strength">Attraction</label>
      <sl-range v-model="state.attractionFactor" min="0" max="1" step="0.001" @sl-input="apply"></sl-range>
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
        state: PP.state,
        apply: () => PP.apply(),
      }
    });
  }

}
