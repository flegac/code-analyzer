
class DatasetController extends GuiGraphController {
    constructor(updater) {
        super('dataset-controller', 'Dataset');
        this.updater = updater;

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
                    this.state().dataset = JSON.parse(e.target.result);
                    await this.updater.loadGraph();
                } catch (err) {
                    console.error('Erreur de parsing JSON :', err);
                }
            };
            reader.readAsText(file);
        });

        this.gui.add(this.state(), 'datasetPath', {
            'class_graph.json': 'data/class_graph.json',
            'dependencies.json': 'data/dependencies.json',
        }).name('Dataset')
            .onChange(async () => {
                this.state().dataset = null;
                await this.updater.dataset.apply()
            });
        this.gui.add({ 'reload': () => this.updater.loadGraph() }, 'reload');
    }

    state() {
        return this.updater.state;
    }

}