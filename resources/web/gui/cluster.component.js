import {BaseComponent} from "./core/base.component.js";
import {P} from "../project/project.service.js"
import {CC} from "../display/cluster.service.js"
import {V} from "../display/visual.service.js";
import {PP} from "../display/physics.service.js";


const STYLE = `
  .panel {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 1em;
  }

  h3 {
    margin: 0;
  }
`;

const TEMPLATE = `
    <div class="panel">
      <div class="section-header">
         <sl-switch v-model="isActive" @sl-change="apply" checked disabled></sl-switch>
        <h3>Cluster</h3>
      </div>

      <div class="slider-row">
        <label>Group by</label>
         <sl-select id="clusterAttribute" @sl-input="colorByGroup"></sl-select>
      </div>

      <div class="slider-row">
        <label>Color depth </label>
        <sl-range v-model="colorDepth" min="1" max="5" step="1" @sl-input="colorByDepth"></sl-range>
      </div>

    <div class="slider-row">
      <label>Color clusters</label>
      <sl-range v-model="collapseClusters" min="1" max="20" step="1" @sl-input="colorByWard"></sl-range>
    </div>

    <div class="slider-row">
      <label>Collapse depth</label>
      <sl-range v-model="collapseDepth" min="1" max="5" step="1" @sl-input="collapseByDepth"></sl-range>
    </div>

    </div>
`;

export class ClusterComponent extends BaseComponent {
    constructor() {
        super({
            template: TEMPLATE,
            style: STYLE,
            state: {
                isActive: true,
                collapseDepth: 5,
                collapseClusters: 5,
                colorDepth: 2,
                attribute: 'group',

                project: CC.project,
                colorByGroup: (event) => this.colorByGroup(event.target.value),
                colorByDepth: (event) => this.colorByDepth(event.target.value),
                colorByWard: (event) => this.colorByWard(event.target.value),
                collapseByDepth: (event) => this.collapseByDepth(event.target.value),
                collapseByWard: (event) => this.collapseByWard(event.target.value),
            }
        });
    }

    colorByDepth(depth) {
        CC.setGroupByDepth(depth);
        V.apply()
    }

    colorByGroup(attribute) {
        CC.setGroupByLabel(attribute);
        V.apply()
    }

    colorByWard(clusterNumber) {
        CC.setGroupByWard(clusterNumber);
        V.apply()
    }

    collapseByDepth(depth) {
        CC.setCollapseByDepth(depth)
        PP.apply();
    }

    collapseByWard(clusterNumber) {
        CC.setCollapseByWard(clusterNumber)
        PP.apply();
    }


    updateGui() {
        const categories = ['group', ...P.project.categories];
        this._populateSelect('clusterAttribute', categories);
    }

    _populateSelect(id, options) {
        const select = this.container.querySelector(`#${id}`);
        select.innerHTML = ''; // clear previous

        options.forEach(opt => {
            const value = typeof opt === 'string' ? opt : opt.value;
            const label = typeof opt === 'string' ? opt : opt.label;
            const option = document.createElement('sl-option');
            option.value = value;
            option.textContent = label;

            if (value === this.state.attribute) {
                option.setAttribute('selected', '');
            }

            select.appendChild(option);
        });
    }


}
