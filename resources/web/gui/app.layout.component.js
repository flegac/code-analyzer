import {BaseComponent} from "/gui/core/base.component.js";
import {ToolBox} from "/gui/core/base.toolbox.component.js";


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

[name=graph-view] {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
}
`;

const TEMPLATE = `
<sl-split-panel style="--max: 0px; height: 100vh;" position-in-pixels="300" primary="start">
  <!-- Panneau gauche -->
  <div slot="start">
    <div id="left-panel"></div>
  </div>

  <!-- Panneau droit -->
  <div slot="end">
    <div name="graph-view">
      
        <div name="graph-canvas"></div> 
      
    <div name="graph-toolbox"></div>
      <div name="graph-settings"></div>
      <div name="navigation"></div>
      <div name="graph-table"></div>
      <div name="debug"></div>
    
    </div>
    
  </div>
</sl-split-panel>
`;

export class AppLayoutComponent extends BaseComponent {
    constructor() {
        super({
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
