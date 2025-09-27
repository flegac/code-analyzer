import {BaseComponent} from "../core/base.component.js";
import {ProjectService} from "../../project/project.service.js"
import {ClusterService} from "../../display/cluster/cluster.service.js"
import {StyleService} from "../../display/style.service.js";
import {PhysicsService} from "../../display/physics.service.js";
import {FilterService} from "../../display/filter/filter.service.js"


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

  .slider-row {
    display: flex;
    align-items: center;
    gap: 1em;
  }

  .slider-row label {
    width: 80px;
  }

  sl-input, sl-range {
    flex: 1;
    --track-color-active: var(--sl-color-primary-600);
    --track-color-inactive: var(--sl-color-primary-100);
  }
  .slider-row sl-input {
    flex: 1;
    min-width: 0;
    max-width: 100%;
  }

  h3 {
    margin: 0;
  }
`;

const TEMPLATE = `
    <div class="panel">
      <div class="section-header">
         <sl-switch v-model="isActive" @sl-change="apply" checked disabled></sl-switch>
        <h3>Filter</h3>
      </div>
      
      <div class="slider-row">
        <label>By depth</label>
        <sl-range v-model="filterState.hierarchyPruneLevel"  min="1" max="10" step="1" value="1" @sl-change="applyPruning"></sl-range>
      </div>

      <div class="slider-row">
        <label>Search</label>
        <sl-input v-model="nodeName" @sl-input="apply" disabled></sl-input>
      </div>
      
      
    </div>
`;

export class FilterComponent extends BaseComponent {
    constructor() {
        super({
            template: TEMPLATE,
            style: STYLE,
            state: {
                isActive: true,
                nodeName: null,
                filterState: FilterService.singleton,
                updateFilter: (event) => this.updateFilter(event.target.value),
                apply: (event) => console.log(event.target.value),
                applyPruning: (event) => this.applyPruning(event.target.value)
            }
        });
    }


    async updateFilter(value) {
        StyleService.singleton.apply();
    }

    async applyPruning(value) {
        FilterService.singleton.hierarchyPruneLevel = parseInt(value);
        await FilterService.singleton.apply();
    }

    colorByDepth(depth) {
        const C = ClusterService.singleton;
        C.setGroupByDepth(depth);
        StyleService.singleton.apply()
    }

    colorByGroup(attribute) {
        const C = ClusterService.singleton;
        C.setGroupByLabel(attribute);
        StyleService.singleton.apply()
    }

    async collapseByDepth(depth) {
        const C = ClusterService.singleton;
        C.setCollapseByDepth(depth)
        await PhysicsService.singleton.apply();
    }

    updateGui() {
        const categories = ['group', ...ProjectService.singleton.project.categories()];
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
