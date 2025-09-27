import {BaseComponent} from "./core/base.component.js";
import {StyleService} from "../display/style.service.js"
import {ProjectService} from "../project/project.service.js";

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
    
      <!-- Nodes -->
      <div class="section-header">
        <sl-checkbox v-model="mesh.isVisible" @sl-change="meshVisibility" checked></sl-checkbox>
        <h3>Nodes</h3>
        <sl-range v-model="mesh.scaling" min="0" max="50" step="0.1" @sl-input="scaling"></sl-range>
      </div>

      <!-- Texts -->
      <div class="section-header">
        <sl-checkbox v-model="text.isVisible" @sl-change="textVisibility" checked></sl-checkbox>
        <h3>Texts</h3>
        <sl-checkbox v-model="text.showModule" help-text="module" @sl-input="textShowModule" checked></sl-checkbox>
        <sl-checkbox v-model="text.showClass" help-text="class" @sl-input="textShowClass" checked></sl-checkbox>
      </div>  

      <!-- Hierarchy -->
      <div class="section-header">
        <sl-checkbox v-model="links.hierarchy.isVisible" @sl-change="hierarchyIsVisible" checked></sl-checkbox>
        <h3>Hierarchy</h3>
        <sl-color-picker v-model="links.hierarchy.color" size="small" @sl-change="applyLinks"></sl-color-picker>
      </div>

      <!-- Relation -->
      <div class="section-header">
        <sl-checkbox v-model="links.relation.isVisible" @sl-change="relationIsVisible" checked></sl-checkbox>
        <h3>Relation</h3>
        <sl-color-picker v-model="links.relation.color" size="small" @sl-change="applyLinks"></sl-color-picker>
      </div>

      <!-- Common links parameters -->
      <div class="slider-row">
        <label>Metrics</label>
        <sl-select v-model="links.metrics" id="metrics" @sl-input="selectMetrics"></sl-select>
      </div>
      
      <div class="slider-row">
        <label>Particles</label>
        <sl-range v-model="links.particles" min="0" max="10" step="1" @sl-input="applyLinks"></sl-range>
      </div>
      <div class="slider-row">
        <label>Width</label>
        <sl-range v-model="links.width" min="0" max="30" step="0.1" @sl-input="applyLinks"></sl-range>
      </div>
      
      <div class="slider-row">
        <label>Opacity</label>
        <sl-range v-model="links.opacity" min="0" max="1" step="0.01" @sl-input="applyLinks"></sl-range>
      </div>

    </div>
`;


export class VisualsComponent extends BaseComponent {
    constructor() {
        super({
            template: TEMPLATE,
            style: STYLE,
            state: {
                mesh: StyleService.singleton.mesh,
                meshVisibility: (e) => this.meshVisibility(e.target.checked),
                scaling: _.throttle((e) => this.scaling(e.target.value), 100),

                text: StyleService.singleton.text,
                textVisibility: (e) => this.textVisibility(e.target.checked),
                textShowModule: (e) => this.textShowModule(e.target.checked),
                textShowClass: (e) => this.textShowClass(e.target.checked),

                links: StyleService.singleton.links,
                applyLinks: (e) => this.applyLinks(e.target.value),
                hierarchyIsVisible: (e) => this.hierarchyIsVisible(e.target.checked),
                relationIsVisible: (e) => this.relationIsVisible(e.target.checked),
                selectMetrics: (e) => this.selectMetrics(e.target.value),
            }
        });
        this.updateGui();
    }

    applyLinks(e) {
        StyleService.singleton.apply();
    }

    meshVisibility(value) {
        StyleService.singleton.mesh.isVisible = value;
        StyleService.singleton.apply()
    }

    scaling(value) {
        StyleService.singleton.mesh.scaling = value;
        StyleService.singleton.updateNodeSizes()
        // StyleService.singleton.apply()
    }

    textVisibility(value) {
        StyleService.singleton.text.isVisible = value;
        StyleService.singleton.apply()
    }

    textShowModule(value) {
        StyleService.singleton.text.showModule = value;
        StyleService.singleton.apply()
    }


    textShowClass(value) {
        StyleService.singleton.text.showClass = value;
        StyleService.singleton.apply()
    }


    hierarchyIsVisible(value) {
        StyleService.singleton.links.hierarchy.isVisible = value;
        console.log('hierarchy.isVisible', value)
        StyleService.singleton.apply()
    }

    relationIsVisible(value) {
        StyleService.singleton.links.relation.isVisible = value;
        StyleService.singleton.apply()
    }

    selectMetrics(value) {
        StyleService.singleton.links.metrics = value;
        StyleService.singleton.apply()

    }

    updateGui() {
        const metrics = ['cycles', 'centrality'];
        this._populateSelect('metrics', metrics);
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
