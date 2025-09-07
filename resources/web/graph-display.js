class GraphDisplay {
    constructor() {
        this.graph = new MyGraph();
        this.controls = new GraphController(this.graph);

        this.tree = new TreeView();
        this.infos = new Infos();
        this.legend = new Legend();
        this.paletteGenerator = chroma
            .scale(['#f00', '#0f0', '#00f',])
            // .mode('lab')           // interpolation en CIE Lab (perceptuellement uniforme)
            // .mode('lch')
            .mode('hsl');

    }


    async loadGraph() {
        try {
            const data = await this.controls.rawData()

            await this.controls.rebuildGraph(this.graph, data);

            this.infos.render(this.graph);
            this.legend.render(this.graph);
            this.tree.render(data);

            const scene = this.graph.graphInstance.scene();

            const axesHelper = new THREE.AxesHelper(500); // taille des axes
            axesHelper.position.set(0, 0, 0);
            scene.add(axesHelper);
        } catch (err) {
            alert('Erreur lors du chargement du JSON : ' + err.message);
        }
    }

}

