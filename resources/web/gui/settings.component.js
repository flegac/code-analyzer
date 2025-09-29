import {BaseComponent} from "./core/base.component.js";
import {ClusterComponent} from "./cluster.component.js"
import {VisualsComponent} from "./visuals.component.js"
import {PhysicsComponent} from "./physics.component.js"
import {FilterComponent} from "./filter/filter.component.js"

const STYLE = `
.graph-settings {
  position: absolute;
  width: 300px;
  height: 100%;
}
`;

const TEMPLATE = `
<div name="graph-settings" class="graph-settings panel-style">
  <div class="drawer-cards">
  
    ${[ 'cluster', 'physics', 'visuals',].map(name => `
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
        this.cluster = this.addComponent('cluster', new ClusterComponent());
        this.physics = this.addComponent('physics', new PhysicsComponent());
        this.visuals = this.addComponent('visuals', new VisualsComponent());
    }

    updateGui() {
        this.cluster.updateGui();
        this.visuals.updateGui();
        this.physics.updateGui();
    }

}
