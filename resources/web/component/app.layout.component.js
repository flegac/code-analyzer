import {BaseComponent} from "/component/base.component.js";
import {ToolBox} from "/component/toolbox.component.js";


const CSS = `
html, body {
    margin: 0;
    padding: 0;
    height: 100%;
}

/* Panneau gauche : scroll indépendant */
sl-split-panel > [slot="start"] {
    height: 100%;
    overflow: auto;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
}

/* Panneau droit : scroll indépendant */
sl-split-panel > [slot="end"] {
    height: 100%;
    overflow: hidden;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
}
sl-tab-group {
  height:100%;
}

sl-tab-panel {
position: relative;
    --padding: 0;
    /* TODO: fix that calcul ! */
    height: calc(100vh - 54px);
}

#toolbox {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 10;
}
`;

const TEMPLATE = `
<sl-split-panel style="--max: 300px; height: 100vh;" position-in-pixels="300" primary="start">
  <!-- Panneau gauche -->
  <div slot="start">
        
    <div id="left-panel">
        <sl-details summary="🧭 Navigation" open>
          <div name="navigation"></div>
        </sl-details>
        <sl-details summary="🛠 Debug" open>
          <div name="debug"></div>
        </sl-details>
    </div>
  
  </div>

  <!-- Panneau droit -->
  <div slot="end">
    <sl-tab-group id="right-tabs">
      <sl-tab slot="nav" panel="graph-view">Graph View</sl-tab>
      <sl-tab slot="nav" panel="table-view">Table View</sl-tab>

        <sl-tab-panel name="graph-view">
            <div name="graph-toolbox"></div>
            <div name="graph-settings"></div>
        </sl-tab-panel>
      
      <sl-tab-panel name="table-view"></sl-tab-panel>
    </sl-tab-group>

</sl-split-panel>
`;

export class AppLayoutComponent extends BaseComponent {
    constructor() {
        super({
            id: 'app-layout',
            template: TEMPLATE,
            style: CSS,
            scripts: []
        });

        this.toolbox = this.addComponent('graph-toolbox', new ToolBox());

    }

    async startup(providerMap) {
        await this.load(providerMap);
        await this.start();
    }
}
