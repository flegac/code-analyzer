import {BaseComponent} from "/gui/core/base.component.js";


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
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

/* Panneaux latéraux */
.side-panel {
  width: 300px;
  min-width: 200px;
  max-width: 400px;
  transition: width 0.3s ease, opacity 0.3s ease;
  overflow-y: auto;
}

/* Masquage fluide */
.side-panel.hidden {
  width: 0;
  min-width: 0;
  opacity: 0;
  pointer-events: none;
}

/* Canvas : prend tout l’espace restant */
[name=graph-canvas] {
  flex: 1;
  overflow: hidden;
  position: relative;
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
        <div name="graph-toolbox"></div>

        <div name="graph-canvas"></div> 
        <div name="graph-settings"></div>
        <div name="navigation"></div>
        <div name="graph-table"></div>
        <div name="debug"></div>
        <div name="graph-filter"></div> 
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
    }

}
