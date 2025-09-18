import {MyComponent} from "/core/utils.js";


const TEMPLATE = `
<sl-details summary="🧲 Physics Controller" open>
  <div style="display: flex; flex-direction: column; gap: 0.75em; padding: 1em;">
    <sl-switch id="isActive">Running status</sl-switch>

    <sl-button id="simulate" variant="primary">🔥 Simulate</sl-button>

    <sl-select id="dimension" label="Projection">
      <sl-option value="2">2D</sl-option>
      <sl-option value="3">3D</sl-option>
    </sl-select>

    <sl-range id="collapsingDepth" label="Collapsing depth" min="0" max="5" step="1"></sl-range>
    <sl-range id="repulsionFactor" label="Repulsion" min="0" max="1" step="0.01"></sl-range>

    <sl-range id="strength" label="Link strength" min="0" max="25" step="0.01"></sl-range>
    <sl-range id="distance" label="Link distance" min="0" max="1000" step="1"></sl-range>
    <sl-range id="dependencyStrengthFactor" label="Dependency strength" min="0" max="1" step="0.01"></sl-range>
  </div>
</sl-details>
`;

export class PhysicsController extends MyComponent {
    constructor(app) {
        super('graph-edge-gui', TEMPLATE);
        this.app = app;

        const state = app.state.physics;
        const onChange = () => app.apply();

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
            app.layout.graph.graph.d3ReheatSimulation();
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
            ['distance', state.link, 'distance'],
            ['dependencyStrengthFactor', state.link, 'dependencyStrengthFactor']
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
