import { BaseComponent } from "/gui/core/base.component.js";
import { DatasetService } from "/dataset/dataset.service.js"
import { ClusterService } from "/cluster/cluster.service.js"
import { StyleService } from "/display/style.service.js";
import { PhysicsService } from "/display/physics.service.js";
import { MetadataService } from "/metadata/metadata.service.js";


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

  sl-range {
    flex: 1;
    --track-color-active: var(--sl-color-primary-600);
    --track-color-inactive: var(--sl-color-primary-100);
  }

  h3 {
    margin: 0;
  }
`;

const TEMPLATE = `
    <div class="panel">
      <div class="section-header">
         <sl-switch v-model="isActive" @sl-change="apply" checked></sl-switch>
        <h3>Cluster</h3>
      </div>

      <div class="slider-row">
        <label>Group on</label>
        <sl-select v-model="attribute" id="clusterAttribute" @sl-input="colorByGroup"></sl-select>
      </div>

      <div class="slider-row">
        <label>Color depth </label>
        <sl-range v-model="colorDepth" min="1" max="5" step="1" @sl-input="colorByDepth"></sl-range>
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
        collapseDepth: 2,
        colorDepth: 2,
        attribute: 'group',

        state: ClusterService.singleton.state,
        colorByGroup: (event) => this.colorByGroup(event.target.value),
        colorByDepth: (event) => this.colorByDepth(event.target.value),
        collapseByDepth: (event) => this.collapseByDepth(event.target.value),
      }
    });
    this.updateGui()
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
    const categories = ['group', ...DatasetService.singleton.state.categories()];
    this._populateSelect('clusterAttribute', categories);
  }

  _populateSelect(id, options) {
    const select = this.container.querySelector(`#${id}`);
    select.innerHTML = ''; // clear previous
    options.forEach(opt => {
      const option = document.createElement('sl-option');
      option.value = typeof opt === 'string' ? opt : opt.value;
      option.textContent = typeof opt === 'string' ? opt : opt.label;
      select.appendChild(option);
    });
  }

}
