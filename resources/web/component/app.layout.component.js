import {BaseComponent} from "/component/base.component.js";

const LAYOUT_TEMPLATE = `
<sl-split-panel style="--max: 300px; height: 100vh;" position-in-pixels="300" primary="start">
  <!-- Panneau gauche -->
  <div slot="start">
        <sl-button id="toggle-drawer" variant="default" size="small" >
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


    <!-- Drawer en bas -->
    <sl-drawer id="graph-settings-drawer" label="Graph Settings" placement="bottom" open>
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
    </sl-drawer>
  </div>
</sl-split-panel>
`;


export class AppLayoutComponent extends BaseComponent {
    constructor() {
        super('app-layout', LAYOUT_TEMPLATE);
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

        document.addEventListener('DOMContentLoaded', () => {
            const drawer = document.getElementById('graph-settings-drawer');
            const toggleButton = document.getElementById('toggle-drawer');

            toggleButton.addEventListener('click', () => {
                drawer.open ? drawer.hide() : drawer.show();
            });
        });


    }
}
