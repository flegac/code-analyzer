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
        $('#file-browser').on('change', async event => {
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
            reader.readAsText(file);
        });


        this.gui.add(this.updater.params.dataset, 'datasetPath', {
            'class_graph.json': 'data/class_graph.json',
            'dependencies.json': 'data/dependencies.json',
        }).name('Dataset')
            .onChange(async () => {
                this.updater.params.dataset.dataset = null;
                await this.updater.children.dataset.apply()
            });
        this.gui.add({ 'reload': () => this.updater.loadGraph() }, 'reload');
        this.gui.add({
            'simControl': async () => {
                this.updater.params.physics.isActive = !this.updater.params.physics.isActive;
                await this.updater.children.forces.apply(this.updater.graph);
            }
        }, 'simControl').name('pause/resume');

        this.gui.add(this.updater.params.physics, 'dimension', { '2D': 2, '3D': 3 })
            .name('Projection')
            .onChange(() => this.updater.rebuildGraph(graph));


        this.gui.add(this.updater.params.physics, 'repulsionStrength', 1, 100, 0.1)
            .name('Repulsion Strength')
            .onChange(() => this.updater.apply());

        this.gui.add(this.updater.params.physics, 'groupHierarchyDepth', 0, 5, 1)
            .name('Group hierarchy depth')
            .onChange(() => this.updater.apply())

        this.gui.add(this.updater.params.physics, 'groupDistance', 1, 100, 0.1)
            .name('Distance groupe')
            .onChange(() => this.updater.apply());


        const debugInfos = new RenderDebug(() => this.updater.graph.graph.renderer());
        debugInfos.start();
        debugInfos.loadGui(this.gui);
    }
}

class RenderDebug {
    constructor(rendererProvider) {

        this.rendererProvider = rendererProvider

        this.params = {
            drawCalls: 0,
            textures: 0,
            geometries: 0,
            triangles: 0,
            points: 0,
            lines: 0,
        };
    }

    start() {
        const renderer = this.rendererProvider();
        this.params.geometries = renderer.info.memory.geometries;
        this.params.textures = renderer.info.memory.textures;
        this.params.drawCalls = renderer.info.render.calls;
        this.params.triangles = renderer.info.render.triangles;
        this.params.points = renderer.info.render.points;
        this.params.lines = renderer.info.render.lines;
        requestAnimationFrame(() => this.start());
    }

    loadGui(gui) {

        gui.add(this.params, 'drawCalls').name('Draw Calls').listen().disable();
        gui.add(this.params, 'geometries').name('Geometries').listen().disable();
        gui.add(this.params, 'textures').name('Textures').listen().disable();
        gui.add(this.params, 'triangles').listen().disable();
        gui.add(this.params, 'points').listen().disable();
        gui.add(this.params, 'lines').listen().disable();
    }
}
