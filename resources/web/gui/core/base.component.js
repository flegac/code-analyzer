import {Injector} from "/gui/core/injector.js";

//display: none;
const STYLE = `
.hidden {
  visibility: hidden;
}
`;

//common styles
Injector.injectStyle(STYLE);

export class BaseComponent {
    constructor({
                    state = {},
                    template = null,
                    style = null,
                    links = [],
                    scripts = []
                }) {
        Injector.injectAll(style, links, scripts);
        this.panelByName = {};

        const {createApp, reactive} = PetiteVue;
        this.container = document.createElement("div");
        if (template !== null) {
            this.state = reactive(state);
            this.container.innerHTML = template;
            createApp(this.state).mount(this.container.firstElementChild);
        }
    }

    async start() {
        document.body.appendChild(this.container);
    }

    getPanel(name) {
        if (!(name in this.panelByName)) {
            this.panelByName[name] = this.container.querySelector(`[name="${name}"]`);
            if (this.panelByName[name] === null) {
                throw new Error(`Cannot find a panel with name "${name}"`);
            }
        }
        return this.panelByName[name];
    }


    static toggleGroupVisibility(group, item) {
        group.filter(e => e !== item).forEach((element) => element.toggleVisibility({visible: false}));
        item.toggleVisibility();
    }

    toggleVisibility({name = null, visible = null} = {}) {
        const panel = name !== null ? this.getPanel(name) : this.container;
        if (!panel) return;

        if (visible === null) {
            panel.classList.toggle('hidden');
        } else {
            if (!visible) {
                panel.classList.add('hidden');
            } else {
                panel.classList.remove('hidden');

            }
        }
    }

    addComponent(name, component) {
        const panel = this.getPanel(name);
        panel.appendChild(component.container)
        return component;
    }

    async load(providerMap) {
        for (const [key, provider] of Object.entries(providerMap)) {
            const components = await provider();
            components.forEach(c => this.addComponent(key, c));
        }
    }
}


