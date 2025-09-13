class GraphController extends GuiGraphController {
    constructor(updater) {
        super(updater.params, 'controller', 'General');

        this.updater = updater;

        this.gui.add({
            fileBrowser: () => {
                document.getElementById('file-browser').click();
            }
        }, 'fileBrowser').name('📂 Charger un fichier');

        // file handler
        document.getElementById('file-browser').addEventListener('change', async (event) => {
            const file = event.target.files[0];
            console.log(file);
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async e => {
                try {
                    this.params.dataset = JSON.parse(e.target.result);
                    console.log(this.params.dataset);
                    await this.updater.loadGraph();
                } catch (err) {
                    console.error('Erreur de parsing JSON :', err);
                }
            };
            await reader.readAsText(file);
        });

        this.gui.add(this.params, 'datasetPath', {
            'class_graph.json': 'data/class_graph.json',
            'dependencies.json': 'data/dependencies.json',
        }).name('Dataset')
            .onChange(() => this.updater.changeDataset());
        this.gui.add({'reload': () => this.updater.loadGraph()}, 'reload');

        this.gui.add(this.params, 'dimension', {'2D': 2, '3D': 3})
            .name('Projection')
            .onChange(() => this.updater.rebuildGraph(graph));

        this.gui.add(this.params, 'groupHierarchyDepth', 0, 5, 1)
            .name('Group hierarchy depth')
            .onChange(() => this.updater.updateGraph())

        this.gui.add(this.params, 'nodeSize', [
            'lines',
            'imported',
            'imports',
            'class_count',
            'method_count',
            'function_count',
            'loops',
            'branches'
        ])
            .name('nodeSize')
            .onChange(() => this.updater.graph.graph.nodeVal(node => node.infos[this.updater.params.nodeSize]))
        ;

        this.gui.add(this.params, 'chargeStrength', 1, 100, 0.1)
            .name('Charge')
            .onChange(() => this.updater.updateGraph());

        this.gui.add(this.params, 'groupDistance', 1, 100, 0.1)
            .name('Distance groupe')
            .onChange(() => this.updater.updateGraph());

    }

}