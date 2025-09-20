import {BaseComponent} from "/component/base.component.js";
import {DatasetService} from "/service/dataset.service.js"
import {GraphService} from "/service/graph.service.js"

const TEMPLATE = `
<div id="dataset-controller" style="display: flex; flex-direction: column; gap: 0.5em; padding: 1em;">
  <sl-button id="load-file-btn" variant="primary">📂 Open project</sl-button>
  <input type="file" id="file-browser" style="display: none;" webkitdirectory></input>

  <sl-range id="depth-limit" label="Depth collapse limit" min="1" max="10" step="1" value="1"></sl-range>

  <sl-button id="reload-btn" variant="default">🔄 Recharger</sl-button>
</div>
`;

export class DatasetComponent extends BaseComponent {
    constructor() {
        super("dataset-gui", TEMPLATE)

        // 📂 Charger un fichier
        const fileBtn = this.container.querySelector('#load-file-btn');
        const fileInput = this.container.querySelector('#file-browser');

        fileBtn.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', async event => {
            const files = event.target.files;
            if (!files || files.length === 0) return;
            const folderName = files[0].webkitRelativePath.split('/')[0];
            await DatasetService.singleton.load(folderName, files);
        });


        // 🎚️ Profondeur de collapse
        const depthSlider = this.container.querySelector('#depth-limit');
        depthSlider.addEventListener('sl-input', async event => {
            DatasetService.singleton.depthCollapseLimit = parseInt(event.target.value);
            //TODO
        });

        // 🔄 Recharger
        const reloadBtn = this.container.querySelector('#reload-btn');
        reloadBtn.addEventListener('click', async () => {
            await GraphService.singleton.rebuildGraph();
        });
    }

    state() {
        return GraphService.singleton.state;
    }

}