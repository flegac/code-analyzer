
class DatasetController extends GuiGraphController {
    constructor(app) {
        super('dataset-controller', 'Dataset');
        this.app = app;

        this.gui.add({
            fileBrowser: () => {
                document.getElementById('file-browser').click();
            }
        }, 'fileBrowser').name('📂 Charger un fichier');

        // file handler
        $('#file-browser').on('change', async event => {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async e => {
                try {
                    app.state.dataset.dataset = JSON.parse(e.target.result);
                    console.log(`${app}`)
                    await app.loadGraph();
                } catch (err) {
                    console.error('Erreur de parsing JSON :', err);
                }
            };
            reader.readAsText(file);
        });

        this.gui.add(this.app.state.dataset, 'datasetPath', {
            'class_graph.json': 'data/class_graph.json',
            'dependencies.json': 'data/dependencies.json',
        }).name('Dataset')
            .onChange(async () => {
                this.state().dataset = null;
                await this.app.dataset.apply()
            });
        this.gui.add({ 'reload': () => this.app.loadGraph() }, 'reload');
    }

    state() {
        return this.app.state;
    }

}