import { BaseComponent } from "./core/base.component.js";
import { PP } from "../display/physics.service.js";

const STYLE = `
  .panel {
    display: flex;
    flex-direction: column;
    gap: 0.1cm;
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
      <sl-checkbox @sl-change="state.constraints.spherical = $event.target.checked; apply()">Spherical</sl-checkbox>
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

  updateGui() {
    const s = this.state.state;

    // Switch: isActive
    const switchEl = this.container.querySelector('sl-switch');
    if (switchEl) switchEl.checked = s.isActive;

    // Checkbox: planar
    const planarEl = this.container.querySelectorAll('sl-checkbox')[0];
    if (planarEl) planarEl.checked = s.constraints.planar;

    // Checkbox: spherical
    const sphericalEl = this.container.querySelectorAll('sl-checkbox')[1];
    if (sphericalEl) sphericalEl.checked = s.constraints.spherical;

    // Range: sphericalDepth
    const depthEl = this.container.querySelector('sl-range[v-model="state.constraints.sphericalDepth"]');
    if (depthEl) depthEl.value = s.constraints.sphericalDepth;

    // Range: repulsionFactor
    const repulsionEl = this.container.querySelector('sl-range[v-model="state.repulsionFactor"]');
    if (repulsionEl) repulsionEl.value = s.repulsionFactor;

    // Range: attractionFactor
    const attractionEl = this.container.querySelector('sl-range[v-model="state.attractionFactor"]');
    if (attractionEl) attractionEl.value = s.attractionFactor;

    // Range: relationStrengthFactor
    const relationEl = this.container.querySelector('sl-range[v-model="state.link.relationStrengthFactor"]');
    if (relationEl) relationEl.value = s.link.relationStrengthFactor;
  }


}
