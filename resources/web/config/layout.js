import {MyComponent} from "/core/utils.js";

const LAYOUT_TEMPLATE = `

<!--<div style="max-height: calc(6 * 2em); overflow-y: auto; border: 1px solid var(&#45;&#45;sl-color-neutral-300); border-radius: var(&#45;&#45;sl-border-radius-medium); padding: 0.5em;">-->
<!--  <sl-menu>-->
<!--    <sl-menu-item value="item1">Item 1</sl-menu-item>-->
<!--    <sl-menu-item value="item2">Item 2</sl-menu-item>-->
<!--    <sl-menu-item value="item3">Item 3</sl-menu-item>-->
<!--    <sl-menu-item value="item4">Item 4</sl-menu-item>-->
<!--    <sl-menu-item value="item5">Item 5</sl-menu-item>-->
<!--    <sl-menu-item value="item6">Item 6</sl-menu-item>-->
<!--    <sl-menu-item value="item7">Item 7</sl-menu-item>-->
<!--    <sl-menu-item value="item8">Item 8</sl-menu-item>-->
<!--  </sl-menu>-->
<!--</div>-->

<sl-split-panel>
  <!-- Panneau gauche -->
  <div slot="start">
    <sl-tab-group id="left-tabs">
      <sl-tab slot="nav" panel="dataset">Dataset</sl-tab>
      <sl-tab slot="nav" panel="physics">Physics</sl-tab>
      <sl-tab slot="nav" panel="links">Links</sl-tab>
      <sl-tab slot="nav" panel="nodes">Nodes</sl-tab>

      <sl-tab-panel name="dataset"></sl-tab-panel>
      <sl-tab-panel name="physics"></sl-tab-panel>
      <sl-tab-panel name="links"></sl-tab-panel>
      <sl-tab-panel name="nodes"></sl-tab-panel>
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


export class MyLayout extends MyComponent {
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
    }
}
