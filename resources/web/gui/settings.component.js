import { BaseComponent } from "./core/base.component.js";
import { ClusterComponent } from "./cluster.component.js"
import { VisualsComponent } from "./visuals.component.js"
import { PhysicsComponent } from "./physics.component.js"
import { FilterComponent } from "./filter/filter.component.js"
const STYLE = `
.graph-settings {
  position: absolute;
  width: 300px;
  height: 100%;
}

sl-dialog[name="config-dialog"]::part(panel) {
  width: 80vw;
  height: 80vh;
  display: flex;
  flex-direction: column;
  padding: 0; /* Supprime les marges internes par défaut */
}

sl-dialog[name="config-dialog"]::part(body) {
  flex: 1;
  padding: 0; /* Supprime le padding du body */
  display: flex;
}

sl-dialog[name="config-dialog"] textarea {
  width: 100%;
  height: 100%;
  resize: none;
  font-family: monospace;
  font-size: 0.9em;
  padding: 1em;
  border: none;
  outline: none;
  box-sizing: border-box;
}
`;


const TEMPLATE = `
<div name="graph-settings" class="graph-settings panel-style">
  <sl-button variant="primary" @click="dumpConfig">📦 Export Config</sl-button>
<sl-dialog name="config-dialog" label="Exported Configuration">
  <textarea name="config-textarea"></textarea>
</sl-dialog>


  <div class="drawer-cards">
    ${['cluster', 'physics', 'visuals'].map(name => `
      <sl-card class="drawer-card">
        <div name="${name}"></div>
      </sl-card>
    `).join('')}
  </div>

</div>
`;



export class SettingsComponent extends BaseComponent {
  constructor() {
    super({
      template: TEMPLATE,
      style: STYLE,
      state: {
        dumpConfig: () => this.dumpConfig()
      }
    });
    this.cluster = this.addComponent('cluster', new ClusterComponent());
    this.physics = this.addComponent('physics', new PhysicsComponent());
    this.visuals = this.addComponent('visuals', new VisualsComponent());
  }

  updateGui() {
    this.cluster.updateGui();
    this.visuals.updateGui();
    this.physics.updateGui();
  }

  dumpConfig() {
    const config = {
      physics: this.physics.state,
      visuals: this.visuals.state
    };

    const dialog = this.container.querySelector('[name="config-dialog"]');
    const textarea = this.container.querySelector('[name="config-textarea"]');

    if (textarea) {
      textarea.value = JSON.stringify(config, null, 2);
    }

    if (dialog) {
      dialog.show();
    }
  }


}
