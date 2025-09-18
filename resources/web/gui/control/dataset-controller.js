import {MyComponent} from "/core/utils.js";

const TEMPLATE = `
<div id="dataset-controller" style="display: flex; flex-direction: column; gap: 0.5em; padding: 1em;">
  <sl-button id="load-file-btn" variant="primary">📂 Charger un fichier</sl-button>
  <input type="file" id="file-browser" style="display: none;" accept=".json">

  <sl-select id="dataset-path" label="Dataset">
    <sl-option value="data/class_graph.json">class_graph.json</sl-option>
    <sl-option value="data/dependencies.json">dependencies.json</sl-option>
  </sl-select>

  <sl-range id="depth-limit" label="Depth collapse limit" min="1" max="10" step="1" value="1"></sl-range>

  <sl-button id="reload-btn" variant="default">🔄 Recharger</sl-button>
</div>
`;

export class DatasetController extends MyComponent {
    constructor(app) {
        super("dataset-gui", TEMPLATE)
        this.app = app;

        // 📂 Charger un fichier
        const fileBtn = this.container.querySelector('#load-file-btn');
        const fileInput = this.container.querySelector('#file-browser');

        fileBtn.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', async event => {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async e => {
                try {
                    app.state.dataset.dataset = JSON.parse(e.target.result);
                    await app.loadGraph();
                } catch (err) {
                    console.error('Erreur de parsing JSON :', err);
                }
            };
            reader.readAsText(file);
        });

        // 🗂️ Sélection du dataset
        const datasetSelect = this.container.querySelector('#dataset-path');
        datasetSelect.addEventListener('sl-change', async event => {
            app.state.dataset.datasetPath = event.target.value;
            app.state.dataset.dataset = null;
            await app.dataset.apply();
        });

        // 🎚️ Profondeur de collapse
        const depthSlider = this.container.querySelector('#depth-limit');
        depthSlider.addEventListener('sl-input', async event => {
            app.state.dataset.depthCollapseLimit = parseInt(event.target.value);
            await app.apply();
        });

        // 🔄 Recharger
        const reloadBtn = this.container.querySelector('#reload-btn');
        reloadBtn.addEventListener('click', async () => {
            await app.loadGraph();
        });
    }

    state() {
        return this.app.state;
    }

}