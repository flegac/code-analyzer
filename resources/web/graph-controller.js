class GraphController extends GuiGraphController {
    constructor(updater) {
        super('controller', 'General');
        this.updater = updater;
        this.control = {
            nodes: new GraphControllerNode(this.updater),
            edges: new GraphControllerRelation(this.updater),
        }

        this.gui.add({
            fileBrowser: () => {
                document.getElementById('file-browser').click();
            }
        }, 'fileBrowser').name('📂 Charger un fichier');

        // file handler
        document.getElementById('file-browser').addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async e => {
                try {
                    this.updater.params.dataset.dataset = JSON.parse(e.target.result);
                    await this.updater.loadGraph();
                } catch (err) {
                    console.error('Erreur de parsing JSON :', err);
                }
            };
            await reader.readAsText(file);
        });


        this.gui.add(this.updater.params.dataset, 'datasetPath', {
            'class_graph.json': 'data/class_graph.json',
            'dependencies.json': 'data/dependencies.json',
        }).name('Dataset')
            .onChange(async () => {
                this.updater.params.dataset.dataset = null;
                await this.updater.children.dataset.apply()
            });
        this.gui.add({'reload': () => this.updater.loadGraph()}, 'reload');

        this.gui.add(this.updater.params.physics, 'dimension', {'2D': 2, '3D': 3})
            .name('Projection')
            .onChange(() => this.updater.rebuildGraph(graph));


        this.gui.add(this.updater.params.physics, 'repulsionStrength', 1, 100, 0.1)
            .name('Repulsion Strength')
            .onChange(() => this.updater.updateGraph());

        this.gui.add(this.updater.params.physics, 'groupHierarchyDepth', 0, 5, 1)
            .name('Group hierarchy depth')
            .onChange(() => this.updater.updateGraph())

        this.gui.add(this.updater.params.physics, 'groupDistance', 1, 100, 0.1)
            .name('Distance groupe')
            .onChange(() => this.updater.updateGraph());

    }

}