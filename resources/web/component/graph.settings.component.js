import {BaseComponent} from "/component/base.component.js";
import {GraphNodeComponent} from "/component/graph.node.component.js"
import {GraphTextComponent} from "/component/graph.text.component.js"
import {GraphLinkComponent} from "/component/graph.link.component.js"
import {GraphPhysicsComponent} from "/component/graph.physics.component.js"
import {DatasetService} from "/service/dataset.service.js"
import {GraphService} from "/service/graph.service.js"

const STYLE = `
.graph-settings {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  width: 300px;
  height: auto;
  max-height: calc(100% - 2cm);
  
  transform: none;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(2px);
  z-index: 1000;
  padding: 0.5rem;
  box-shadow: var(--sl-shadow-large);
  border-radius: var(--sl-border-radius-medium);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: auto;
}

.drawer-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.drawer-card {
  min-width: 250px;
}

`;

const TEMPLATE = `
<div name="graph-settings" class="graph-settings">
  <div class="drawer-cards">
    <sl-range name="depth-limit" label="Depth collapse limit" min="1" max="10" step="1" value="1"></sl-range>
  
    ${['physics', 'links', 'nodes', 'texts'].map(name => `
      <sl-card class="drawer-card">
        <h3 slot="header">${name.charAt(0).toUpperCase() + name.slice(1)}</h3>
        <div name="${name}"></div>
      </sl-card>
    `).join('')}
  </div>
</div>
`;


export class SettingsComponent extends BaseComponent {
    constructor() {
        super({
            id: 'settings-component', template: TEMPLATE, style: STYLE
        });
        // initially hidden
        this.toggleVisibility();

        this.physics = this.addComponent('physics', new GraphPhysicsComponent());
        this.nodes = this.addComponent('nodes', new GraphNodeComponent());
        this.texts = this.addComponent('texts', new GraphTextComponent());
        this.links = this.addComponent('links', new GraphLinkComponent());

        // 🎚️ Profondeur de collapse
        const depthSlider =this.getPanel('depth-limit');
        depthSlider.addEventListener('sl-input', async event => {
            DatasetService.singleton.depthCollapseLimit = parseInt(event.target.value);
            await GraphService.singleton.rebuildGraph();
        });
    }

}
