import { BaseComponent } from "./core/base.component.js";
import { V } from "../visuals/visual.service.js";
import { NN } from "../visuals/node.service.js";
import { P } from "../project/project.service.js";

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
        <sl-range v-model="mesh.scaling" min=".1" max="1." step="0.01" @sl-input="nodeScaling"></sl-range>
      </div>
      
      <div class="slider-row">
        <label>Radius</label>
        <sl-select v-model="mesh.size" id="nodeRadius" @sl-input="selectNodeRadius"></sl-select>
      </div>
      

      <!-- Texts -->
      <div class="section-header">
        <sl-checkbox v-model="text.isVisible" @sl-change="textVisibility" checked></sl-checkbox>
        <h3>Texts</h3>
        <sl-range v-model="text.scaling" min=".1" max="1." step="0.01" @sl-input="textScaling"></sl-range>
      </div>  

      <div class="slider-row">        
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
        mesh: V.state.mesh,
        meshVisibility: (e: any) => this.meshVisibility(e.target.checked),
        nodeScaling: _.throttle((e: any) => this.nodeScaling(e.target.value), 100),

        selectNodeRadius: (e: any) => this.selectNodeRadius(e.target.value),

        text: V.state.text,
        textVisibility: (e: any) => this.textVisibility(e.target.checked),
        textScaling: _.throttle((e: any) => this.textScaling(e.target.value), 100),
        textShowModule: (e: any) => this.textShowModule(e.target.checked),
        textShowClass: (e: any) => this.textShowClass(e.target.checked),

        links: V.state.links,
        applyLinks: (e: any) => this.applyLinks(e.target.value),
        hierarchyIsVisible: (e: any) => this.hierarchyIsVisible(e.target.checked),
        relationIsVisible: (e: any) => this.relationIsVisible(e.target.checked),
        selectMetrics: (e: any) => this.selectMetrics(e.target.value),
      }
    });
  }

  applyLinks(e: any) {
    V.apply();
  }

  meshVisibility(value:boolean) {
    V.state.mesh.isVisible = value;
    V.apply()
  }

  textVisibility(value:boolean) {
    V.state.text.isVisible = value;
    V.apply()
  }
  nodeScaling(value:number) {
    V.state.mesh.scaling = value;
    V.updateNodeSizes()
  }

  textScaling(value:number) {
    V.state.text.scaling = value;
    V.updateNodeSizes()
  }


  textShowModule(value:boolean) {
    V.state.text.showModule = value;
    V.apply()
  }


  textShowClass(value:boolean) {
    V.state.text.showClass = value;
    V.apply()
  }


  hierarchyIsVisible(value:boolean) {
    V.state.links.hierarchy.isVisible = value;
    console.log('hierarchy.isVisible', value)
    V.apply()
  }

  relationIsVisible(value:boolean) {
    V.state.links.relation.isVisible = value;
    V.apply()
  }

  selectMetrics(value:string) {
    V.state.links.metrics = value;
    NN.updateMetrics();
    V.apply();

  }

  selectNodeRadius(value:string) {
    V.state.mesh.size = value;
    V.apply();
  }

  updateGui() {
    const metrics = [
      'centrality',
      'cycles',
    ];
    this._populateSelect('metrics', metrics);

    const numerics = P.project?.numerics ?? [];
    console.log('updateGui', numerics)

    const nodeSizes = [...metrics, ...numerics];
    this._populateSelect('nodeRadius', nodeSizes);
  }

  _populateSelect(id:string, options) {
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
