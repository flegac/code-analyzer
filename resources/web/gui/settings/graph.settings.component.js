import {BaseComponent} from "/gui/core/base.component.js";
import {GraphNodeComponent} from "/gui/settings/graph.node.component.js"
import {GraphTextComponent} from "/gui/settings/graph.text.component.js"
import {GraphLinkComponent} from "/gui/settings/graph.link.component.js"
import {GraphPhysicsComponent} from "/gui/settings/graph.physics.component.js"
import {DatasetService} from "/dataset/dataset.service.js"
import {GraphService} from "/display/graph.service.js"

const STYLE = `
.graph-settings {
  position: absolute;
  width: 300px;
  height: 100%;
  
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(2px);
  z-index: 1000;
  box-shadow: var(--sl-shadow-large);
  border-radius: var(--sl-border-radius-medium);
  display: flex;
  flex-direction: column;
  overflow: auto;
}
.drawer-cards {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
`;

const TEMPLATE = `
<div name="graph-settings" class="graph-settings">
  <div class="drawer-cards">
    <sl-range name="prune-level" label="Hierarchy prune level" min="1" max="10" step="1" value="1"></sl-range>
  
    ${['physics', 'links', 'nodes', 'texts'].map(name => `
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
            style: STYLE
        });
        // initially hidden
        this.toggleVisibility();

        this.physics = this.addComponent('physics', new GraphPhysicsComponent());
        this.nodes = this.addComponent('nodes', new GraphNodeComponent());
        this.texts = this.addComponent('texts', new GraphTextComponent());
        this.links = this.addComponent('links', new GraphLinkComponent());

        // 🎚️ Profondeur de collapse
        const depthSlider = this.getPanel('prune-level');
        depthSlider.addEventListener('sl-input', async event => {
            DatasetService.singleton.hierarchyPruneLevel = parseInt(event.target.value);
            await GraphService.singleton.rebuildGraph();
        });
    }
}
