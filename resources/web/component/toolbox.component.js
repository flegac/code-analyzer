import {BaseComponent} from "/component/base.component.js";

export class ToolBox extends BaseComponent {
    constructor() {
        super({id: 'toolbox'});
    }

    newButton(label, onClick) {
        const button = document.createElement('sl-button');
        // button.setAttribute('name', name);
        button.setAttribute('variant', 'default');
        button.setAttribute('size', 'small');
        button.textContent = label;
        button.addEventListener('click', onClick);
        this.container.appendChild(button);
    }
}