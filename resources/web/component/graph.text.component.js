import {BaseComponent} from "/component/base.component.js";
import {DisplayService} from "/service/display.service.js"

const TEMPLATE = `
  <div style="display: flex; flex-direction: column; gap: 0.25em;">
    <sl-switch id="textVisibility">Visible</sl-switch>
    <sl-range id="scaling" label="Scaling" min="0" max="5" step="0.01"></sl-range>
    <sl-range id="hiddenDepthRange" label="Hidden depth range" min="0" max="5" step="1"></sl-range>
  </div>
`;


export class GraphTextComponent extends BaseComponent {
    constructor() {
        super({
            id: 'graph-text-gui',
            template: TEMPLATE
        });

        const onChange = () => DisplayService.singleton.apply();

        const params = DisplayService.singleton.nodes.text;

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
