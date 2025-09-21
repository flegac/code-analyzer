import {BaseComponent} from "/component/base.component.js";
import {DisplayService} from "/service/display.service.js"

const TEMPLATE = `
  <div style="display: flex; flex-direction: column; gap: 0.25em;">
    <sl-switch id="nodeVisibility">Visible</sl-switch>
    <sl-range id="baseRadius" label="Radius" min="0" max="200" step="0.01"></sl-range>
    <sl-range id="colorGroupDepthRange" label="Color group depth range" min="0" max="5" step="1"></sl-range>
    <sl-select id="color" label="Color"></sl-select>
    <sl-select id="size" label="Size"></sl-select>
  </div>
`;


export class GraphNodeComponent extends BaseComponent {
    constructor() {
        super({
            id: 'graph-node-gui',
            template: TEMPLATE
        });

        const onChange = () => DisplayService.singleton.apply();

        const nodes = DisplayService.singleton.nodes;
        const nodeIsVisible = nodes.mesh.isVisible;

        this._bindSlider('baseRadius', nodes.mesh, 'baseRadius', onChange);
        this._bindSlider('colorGroupDepthRange', nodes.mesh, 'colorGroupDepthRange', onChange);

        this._populateSelect('color', COLOR_ATTRIBUTES);
        this._bindSelect('color', nodes.mesh, 'color', onChange);

        this._populateSelect('size', SIZE_ATTRIBUTES);
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