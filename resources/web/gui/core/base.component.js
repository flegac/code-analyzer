const STYLE = `
.hidden {
  //display: none;
  visibility: hidden;
}
`;

export class BaseComponent {
    constructor({
                    id = null,
                    template = null,
                    style = null,
                    links = [],
                    scripts = []
                }) {

        //common styles
        BaseComponent.injectStyleOnce(STYLE);


        this.container = document.createElement("div");

        links.forEach(link => {
            BaseComponent.injectLinkOnce(link);
        })
        scripts.forEach(script => {
            BaseComponent.injectScriptOnce(script);
        })

        if (id !== null) {
            this.container.id = id;
        }
        if (template !== null) {
            this.container.innerHTML = template;
        }
        if (style !== null) {
            BaseComponent.injectStyleOnce(style);
        }

        this.panelByName = {};
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

    static injectScriptOnce({src, type = null}) {
        console.log(`loading <script>: ${src}`);
        const hash = BaseComponent.hash(src);
        const existing = document.head.querySelector(`script[my-hash-id="${hash}"]`);
        if (!existing) {
            const elt = document.createElement('script');
            elt.setAttribute('my-hash-id', hash);
            elt.src = src;
            if (type) {
                elt.type = type;
            }
            document.head.appendChild(elt);
        }
    }

    static injectLinkOnce(href) {
        console.log(`loading <link>: ${href}`);

        const hash = BaseComponent.hash(href);
        const existing = document.head.querySelector(`link[my-hash-id="${hash}"]`);
        if (!existing) {
            const elt = document.createElement('link');
            elt.setAttribute('my-hash-id', hash);
            elt.href = href;
            document.head.appendChild(elt);
        }
    }

    static injectStyleOnce(styleText) {
        console.log(`loading <style> [...]`);

        const hash = BaseComponent.hash(styleText);
        const existing = document.head.querySelector(`style[my-hash="${hash}"]`);
        if (!existing) {
            const elt = document.createElement('style');
            elt.textContent = styleText;
            elt.setAttribute('my-hash-id', hash);
            document.head.appendChild(elt);
        }
    }

    static hash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return `style-${Math.abs(hash)}`;
    }
}
