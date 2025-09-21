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
<sl-split-panel style="--max: 300px; height: 100vh;" position-in-pixels="300" primary="start">
  <!-- Panneau gauche -->
  <div slot="start">
    <sl-button id="toggle-popup" variant="default" size="small">
      ⚙️ Settings
    </sl-button>

    <sl-details summary="Dataset" name="dataset" open></sl-details>
    <sl-details summary="🧭 Navigation" open>
      <div name="navigation"></div>
    </sl-details>
    <sl-details summary="🛠 Debug" open>
      <div name="debug"></div>
    </sl-details>
  </div>

  <!-- Panneau droit -->
  <div slot="end">
    <sl-tab-group id="right-tabs">
      <sl-tab slot="nav" panel="graph-view">Graph View</sl-tab>
      <sl-tab slot="nav" panel="table-view">Table View</sl-tab>

      <sl-tab-panel name="graph-view"></sl-tab-panel>
      <sl-tab-panel name="table-view"></sl-tab-panel>
    </sl-tab-group>

    <!-- Popup personnalisé -->
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
  </div>
</sl-split-panel>
`;

export class AppLayoutComponent extends BaseComponent {
    constructor() {
        super('app-layout', TEMPLATE, STYLE);
    }

    async loadComponents(providerMap) {
        for (const [key, provider] of Object.entries(providerMap)) {
            const panel = this.container.querySelector(`[name="${key}"]`);
            if (panel) {
                const elements = await provider();
                elements.forEach(el => panel.appendChild(el));
            }
        }
        document.body.appendChild(this.container);


        const popup = this.container.querySelector('#graph-settings-popup');
        const toggleButton = this.container.querySelector('#toggle-popup');

        toggleButton.addEventListener('click', () => {
            popup.classList.toggle('hidden');
        });


    }
}
