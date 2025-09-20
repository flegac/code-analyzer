import { BaseComponent } from "/component/base.component.js";

const LAYOUT_TEMPLATE = `
<sl-split-panel style="--max: 300px; height: 100vh;" position-in-pixels="300" primary="start">
  <!-- Panneau gauche -->
  <div slot="start" >
    <div id="left-details-group">
      <sl-details summary="Dataset" name="dataset" open></sl-details>
      <sl-details summary="Physics" name="physics"></sl-details>
      <sl-details summary="Links" name="links"></sl-details>
      <sl-details summary="Nodes" name="nodes"></sl-details>
    </div>
 
    <sl-details summary="🧭 Navigation" open >
          <div name="navigation"></div>
    </sl-details>
    <sl-details summary="🛠 Debug" open >
          <div name="debug" ></div>
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

    const container = this.container.querySelector('#left-details-group');
    if (!container) {
      console.warn('Conteneur non trouvé');
      return;
    }

    container.addEventListener('sl-show', event => {
      if (event.target.tagName === 'SL-DETAILS') {
        container.querySelectorAll('sl-details').forEach(details => {
          details.open = details === event.target;
        });
      }
    });


  }
}
