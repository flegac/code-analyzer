import {createDiv} from "/core/utils.js";

const LAYOUT_TEMPLATE = `
<sl-split-panel style="height: 100vh;"  position-in-pixels="260">
  <!-- Panneau gauche -->
  <div slot="start">
    <sl-tab-group id="left-tabs">
      <sl-tab slot="nav" panel="dataset">Dataset</sl-tab>
      <sl-tab slot="nav" panel="physics">Physics</sl-tab>
      <sl-tab slot="nav" panel="display">Display</sl-tab>

      <sl-tab-panel name="dataset"></sl-tab-panel>
      <sl-tab-panel name="physics"></sl-tab-panel>
      <sl-tab-panel name="display"></sl-tab-panel>
    </sl-tab-group>
  </div>

  <!-- Panneau droit -->
  <div slot="end">
    <sl-tab-group id="right-tabs">
      <sl-tab slot="nav" panel="graph-view">Graph View</sl-tab>
      <sl-tab slot="nav" panel="table-view">Table View</sl-tab>
      <sl-tab slot="nav" panel="tree-view">Tree View</sl-tab>

      <sl-tab-panel name="graph-view"></sl-tab-panel>
      <sl-tab-panel name="table-view"></sl-tab-panel>
      <sl-tab-panel name="tree-view"></sl-tab-panel>
    </sl-tab-group>
  </div>
</sl-split-panel>
`;

export class MyLayout {
    constructor(id = 'app-layout', template = LAYOUT_TEMPLATE) {
        this.container = createDiv(id);
        this.container.innerHTML = template;
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
    }
}
