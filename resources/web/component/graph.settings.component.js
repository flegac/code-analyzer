import {BaseComponent} from "/component/base.component.js";

const STYLE = `
.settings-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 75%;
  height: 75%;
  background: var(--sl-panel-background-color, #fff);
  z-index: 1000;
  padding: 1rem;
  overflow-x: auto;
  display: flex;
  flex-direction: row;
  gap: 1rem;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.settings-popup.hidden {
  display: none;
}

.drawer-card {
  flex: 1 0 25%;
  min-width: 250px;
  overflow-y: auto;
}
`;

const TEMPLATE = `
<div id="graph-settings-popup" class="settings-popup hidden">
  <div class="drawer-cards">
    <sl-card class="drawer-card">
      <h3 slot="header">Physics</h3>
      <div name="physics"></div>
    </sl-card>
    <sl-card class="drawer-card">
      <h3 slot="header">Links</h3>
      <div name="links"></div>
    </sl-card>
    <sl-card class="drawer-card">
      <h3 slot="header">Nodes</h3>
      <div name="nodes"></div>
    </sl-card>
    <sl-card class="drawer-card">
      <h3 slot="header">Texts</h3>
      <div name="texts"></div>
    </sl-card>
  </div>
</div>
`;

export class SettingsComponent extends BaseComponent {
    constructor() {
        super('settings-component', TEMPLATE, STYLE);
    }

    toggle() {
        this.container.classList.toggle('hidden');
    }

    get panel() {
        return this.container;
    }

    async load(providerMap) {
        for (const [key, provider] of Object.entries(providerMap)) {
            const panel = this.container.querySelector(`[name="${key}"]`);
            if (panel) {
                const elements = await provider();
                elements.forEach(el => panel.appendChild(el));
            }
        }
    }
}
