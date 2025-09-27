import {BaseComponent} from "/gui/core/base.component.js";

const STYLE = `
[name=main-toolbar] {
  position: relative;
  top: 0;
  left: auto;
  right: auto;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: .2cm; /* Espacement entre les groupes */
  height: 100%;
}

[name=main-toolbar] .button-group {
  display: flex;
  flex-direction: column;
  gap: 0px; /* Espacement entre les boutons dans un groupe */
}

[name=main-toolbar] sl-button {
  width: .8cm;
  height: .8cm;
  padding: 0;
  margin: 0;
  text-align: center;
}

[name=main-toolbar] sl-tooltip {
  z-index: 2000;
}
`;


const TEMPLATE = `<div name="main-toolbar"></div>`;

export class ToolBox extends BaseComponent {
    constructor() {
        super({
            template: TEMPLATE,
            style: STYLE,
        });
    }

    newGroup(buttons) {
        const group = this.addGroup();
        buttons.forEach(button => {
            this.newButton({...button, group});
        })
    }

    addGroup() {
        const group = document.createElement('div');
        group.classList.add('button-group');
        this.getPanel('main-toolbar').appendChild(group);
        return group;
    }

    newButton({label, onClick, tooltip = null, group = null}) {
        const button = document.createElement('sl-button');
        button.setAttribute('variant', 'default');
        button.setAttribute('size', 'small');
        button.innerHTML = label;
        button.addEventListener('click', onClick);

        const container = group || this.getPanel('main-toolbar');

        if (tooltip) {
            const tooltipWrapper = document.createElement('sl-tooltip');
            tooltipWrapper.setAttribute('content', tooltip);
            tooltipWrapper.setAttribute('placement', 'right');
            tooltipWrapper.appendChild(button);
            container.appendChild(tooltipWrapper);
        } else {
            container.appendChild(button);
        }
        return this;
    }

}