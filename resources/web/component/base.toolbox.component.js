import {BaseComponent} from "/component/base.component.js";

const STYLE = ``;

const TEMPLATE = `<sl-button-group name="toolbar"></sl-button-group>`;

export class ToolBox extends BaseComponent {
    constructor() {
        super({
            id: 'toolbox',
            template: TEMPLATE,
            style: STYLE,
        });
    }

    newButton({label, onClick, tooltip = null}) {
        const button = document.createElement('sl-button');
        button.setAttribute('variant', 'default');
        button.setAttribute('size', 'small');
        button.innerHTML = label;
        button.addEventListener('click', onClick);

        const container = this.getPanel('toolbar');

        if (tooltip) {
            const tooltipWrapper = document.createElement('sl-tooltip');
            tooltipWrapper.setAttribute('content', tooltip);
            tooltipWrapper.appendChild(button);
            container.appendChild(tooltipWrapper);
        } else {
            container.appendChild(button);
        }
    }

}