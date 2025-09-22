import {BaseComponent} from "/gui/core/base.component.js";

const STYLE = `
[name=main-toolbar] {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 10;
}
`;

const TEMPLATE = `<sl-button-group name="main-toolbar"></sl-button-group>`;

export class ToolBox extends BaseComponent {
    constructor() {
        super({
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

        const container = this.getPanel('main-toolbar');

        if (tooltip) {
            const tooltipWrapper = document.createElement('sl-tooltip');
            tooltipWrapper.setAttribute('content', tooltip);
            tooltipWrapper.appendChild(button);
            container.appendChild(tooltipWrapper);
        } else {
            container.appendChild(button);
        }
        return this;
    }

}