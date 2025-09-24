import { BaseComponent } from "/gui/core/base.component.js";
import { GraphStyleService } from "/display/graph.style.service.js"
import { DatasetService } from "/dataset/dataset.service.js"

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
      <div class="section-header">
        <sl-switch id="nodeVisibility"></sl-switch>
        <h3>Nodes</h3>
      </div>

      <div class="slider-row">
        <label for="baseRadius">Scaling</label>
        <sl-range id="baseRadius" min="0" max="200" step="0.01"></sl-range>
      </div>

      <div class="slider-row">
        <label for="color">Color</label>
        <sl-select id="color"></sl-select>
      </div>

      <div class="slider-row">
        <label for="size">Size</label>
        <sl-select id="size"></sl-select>
      </div>

      <div class="slider-row">
        <label for="colorGroupDepthRange">Color depth</label>
        <sl-range id="colorGroupDepthRange" min="1" max="10" step="1"></sl-range>
      </div>
    </div>
`;



export class GraphNodeComponent extends BaseComponent {
  constructor() {
    super({
      template: TEMPLATE,
      style: STYLE,
    });
    this.updateGui()
  }

  updateGui() {

    const onChange = () => GraphStyleService.singleton.apply();

    const nodes = GraphStyleService.singleton.nodes;
    const nodeIsVisible = nodes.mesh.isVisible;

    this._bindSlider('baseRadius', nodes.mesh, 'baseRadius', onChange);
    this._bindSlider('colorGroupDepthRange', nodes.mesh, 'colorGroupDepthRange', onChange);

    this._populateSelect('color', ['group']);
    this._bindSelect('color', nodes.mesh, 'color', onChange);

    const labels = DatasetService.singleton.state.labels;

    this._populateSelect('size', labels);
    this._bindSelect('size', nodes.mesh, 'size', onChange);
    const nodeSwitch = this.container.querySelector('#nodeVisibility');
    nodeSwitch.checked = nodeIsVisible;
    nodeSwitch.addEventListener('sl-change', () => {
      nodes.mesh.isVisible = nodeSwitch.checked;
      onChange();
    });
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

  _populateSelect(id, options) {
    const select = this.container.querySelector(`#${id}`);
    select.innerHTML = ''; // clear previous
    options.forEach(opt => {
      const option = document.createElement('sl-option');
      option.value = typeof opt === 'string' ? opt : opt.value;
      option.textContent = typeof opt === 'string' ? opt : opt.label;
      select.appendChild(option);
    });
  }

}
