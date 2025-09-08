class GraphController {
    constructor(graph) {
        this.graph = graph;


        this.tree = new TreeView();
        this.table = new TableView();
        this.infos = new Infos();
        this.legend = new Legend();
        this.paletteGenerator = chroma
            .scale(['#f00', '#0f0', '#00f',])
            // .mode('lab')           // interpolation en CIE Lab (perceptuellement uniforme)
            // .mode('lch')
            .mode('hsl');

        // Paramètres contrôlés par dat.GUI
        this.params = {
            dataPath: 'data/dependencies.json',
            infosPath: 'data/modules.json',
            dimension: 3,
            modulePrefixDepth: 1,
            chargeStrength: 50,
            linkDistance: 10,
            groupDistance: 50,
            sourceSinkDistance: 50,
            sourceSinkDistanceActive: true,
            reload: () => this.loadGraph()
        };

        this.gui = new dat.GUI();
        this.gui.domElement.id = 'controller';
        this.gui.add(this.params, 'dataPath', {
            'dependencies.json': 'data/dependencies.json',
            'hierarchy.json': 'data/hierarchy.json'
        }).name('Fichier JSON');
        this.gui.add(this.params, 'dimension', {'2D': 2, '3D': 3})
            .name('Projection')
            .onChange(() => this.rebuildGraph(graph));
        this.gui.add(this.params, 'modulePrefixDepth', 0, 5, 1)
            .name('Profondeur')
            .onChange(() => this.loadGraph());
        this.gui.add(this.params, 'chargeStrength', 1, 100, 0.1)
            .name('Charge')
            .onChange(() => this.updateGraph());
        this.gui.add(this.params, 'linkDistance', 1, 100, 0.1)
            .name('Distance lien')
            .onChange(() => this.updateGraph());
        this.gui.add(this.params, 'groupDistance', 1, 100, 0.1)
            .name('Distance groupe')
            .onChange(() => this.updateGraph());
        this.gui.add(this.params, 'sourceSinkDistance', 1, 100, 0.1)
            .name('Distance sources - puits')
            .onChange(() => this.updateGraph());
        this.gui.add(this.params, 'sourceSinkDistanceActive')
            .name('Limit distance sources - puits')
            .onChange(() => this.updateGraph());
        this.gui.add(this.params, 'reload').name('Reload');
    }

    async loadGraphData() {
        return await fetch(this.params.dataPath).then(res => res.json());
    }

    async loadModuleInfos() {
        return await fetch(this.params.infosPath).then(res => res.json());
    }

    updateGraph() {
        this.graph.updateGraph(this);
    }

    async rebuildGraph() {
        const data = await this.loadGraphData();
        const infos = await this.loadModuleInfos();
        this.graph.renderGraph(data, infos, this.params.modulePrefixDepth, this.paletteGenerator);
        this.updateGraph();
    }


    async loadGraph() {
        try {
            const data = await this.loadGraphData();
            const infos = await this.loadModuleInfos();
            await this.rebuildGraph();

            this.infos.render(this.graph);
            this.legend.render(this.graph);
            this.tree.render(data);
            this.table.render(infos);

            const scene = this.graph.graphInstance.scene();

            const axesHelper = new THREE.AxesHelper(500); // taille des axes
            axesHelper.position.set(0, 0, 0);
            scene.add(axesHelper);
        } catch (err) {
            alert('Erreur lors du chargement du JSON : ' + err.message);
        }
    }
}