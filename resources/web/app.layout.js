import {BaseComponent} from "./gui/core/base.component.js";

const CSS = `
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

/* Split entre panneau central et panneau principal */
sl-split-panel {
  flex: 1;
  height: 100%;
}

/* Panneau gauche du split (central) */
sl-split-panel > [slot="start"] {
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* Panneau droit du split (principal) */
sl-split-panel > [slot="end"] {
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}


/* Panneaux latéraux conditionnels */
.side-panel {
  width: 300px;
  min-width: 200px;
  max-width: 400px;
  transition: width 0.3s ease, opacity 0.3s ease;
  overflow-y: auto;
}

.side-panel.hidden {
  width: 0;
  min-width: 0;
  opacity: 0;
  pointer-events: none;
}

/****** PANEL SPECIFIC **************************/

/* Toolbox : bande verticale fixe à gauche */
[name=graph-toolbox] {
  width: .8cm;
  background: var(--sl-panel-background-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.1cm;
  box-shadow: inset -1px 0 0 rgba(0,0,0,0.1);
  z-index: 1000;
}

[name=graph-layout] {
  display: flex;
  flex-direction: row;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}


/* Vue principale */
[name=graph-view] {
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

/* Canvas */
[name=graph-canvas] {
  flex: 1;
  overflow: hidden;
  position: relative;
}
`;

const TEMPLATE = `
<div name="graph-layout">
  <!-- Toolbox fixe à gauche -->
  <div name="graph-toolbox"></div>

  <!-- Split panel à droite -->
  <sl-split-panel style="--max: 300px;" position-in-pixels="0" primary="start">
    <!-- Panneau central -->
    <div slot="start">
      <div id="left-panel">
        <div name="graph-settings"></div>
        <div name="navigation"></div>
        <div name="graph-filter"></div>       
      </div>
    </div>

    <!-- Panneau principal -->
    <div slot="end">
      <div name="graph-view">
      
        <div name="graph-canvas"></div> 
        <div name="graph-table"></div>
        <div name="debug"></div>    


      </div>
    </div>
  </sl-split-panel>
</div>
`;

export class AppLayout extends BaseComponent {
    constructor() {
        super({
            template: TEMPLATE,
            style: CSS,
            scripts: []
        });
    }

    updateSplitPanelVisibility() {
        const splitPanel = this.container.querySelector('sl-split-panel');
        const leftPanel = this.container.querySelector('#left-panel');

        const visibleChild = Array.from(leftPanel.children).find(child => {
            return !child.firstChild.classList.contains('hidden');
        });

        if (visibleChild) {
            console.log('updateSplitPanelVisibility', visibleChild);
            const width = visibleChild.scrollWidth;
            splitPanel.position = 1000;
        } else {
            splitPanel.position = 0;
        }
    }

}
