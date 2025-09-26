import {BaseComponent} from "/gui/core/base.component.js";
import {StyleService} from "/display/style.service.js"

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
        <sl-checkbox v-model="mesh.isVisible" @sl-change="meshVisibility" checked></sl-checkbox>
        <h3>Nodes</h3>
        <sl-range v-model="mesh.scaling" min="0" max="50" step="0.1" @sl-input="scaling"></sl-range>
      </div>

      <div class="section-header">
        <sl-checkbox v-model="text.isVisible" @sl-change="textVisibility" checked></sl-checkbox>
        <h3>Texts</h3>
        <sl-range v-model="text.hiddenDepthRange" min="0" max="5" step="1" @sl-input="textHiddenDepth"></sl-range>
      </div>  

    </div>
`;


export class GraphNodeComponent extends BaseComponent {
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
                textHiddenDepth: _.throttle((e) => this.textHiddenDepth(e.target.value), 100),

            }
        });
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

    textHiddenDepth(value) {
        StyleService.singleton.text.hiddenDepthRange = value;
        StyleService.singleton.apply()
    }
}
