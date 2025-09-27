import {BaseComponent} from "../core/base.component.js";
import {ClusterComponent} from "./cluster.component.js"
import {VisualsComponent} from "./visuals.component.js"
import {PhysicsComponent} from "./physics.component.js"
import {FilterComponent} from "./filter.component.js"

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
  
    ${['filter', 'cluster', 'physics', 'visuals',].map(name => `
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
        this.filter = this.addComponent('filter', new FilterComponent());
        this.cluster = this.addComponent('cluster', new ClusterComponent());
        this.physics = this.addComponent('physics', new PhysicsComponent());
        this.visuals = this.addComponent('visuals', new VisualsComponent());
    }

    updateGui() {
        this.cluster.updateGui();
    }

}
