import { BaseComponent } from "/gui/core/base.component.js";
import { GraphStyleService } from "/display/graph.style.service.js"

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
    width: 160px;
    margin: 0;
  }

  sl-range {
    flex: 1;
  }
`;


const TEMPLATE = `
  <div class="panel">
    <sl-switch id="textVisibility">Visible</sl-switch>

    <div class="slider-row">
      <label for="scaling">Scaling</label>
      <sl-range id="scaling" min="0" max="5" step="0.01"></sl-range>
    </div>

    <div class="slider-row">
      <label for="hiddenDepthRange">Hidden depth range</label>
      <sl-range id="hiddenDepthRange" min="0" max="5" step="1"></sl-range>
    </div>
  </div>
`;



export class GraphTextComponent extends BaseComponent {
    constructor() {
        super({
            template: TEMPLATE,
            style: STYLE,
        });

        const onChange = () => GraphStyleService.singleton.apply();

        const params = GraphStyleService.singleton.nodes.text;

        // 🔤 Text
        const textIsVisible = params.isVisible;

        this._bindSlider('hiddenDepthRange', params, 'hiddenDepthRange', onChange);
        this._bindSlider('scaling', params, 'scaling', onChange);

        const textSwitch = this.container.querySelector('#textVisibility');
        textSwitch.checked = textIsVisible;
        textSwitch.addEventListener('sl-change', () => {
            params.isVisible = textSwitch.checked;
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


}
