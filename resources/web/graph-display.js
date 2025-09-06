class GraphDisplay {
    constructor() {
        this.graph = new MyGraph();
        this.controls = new Controls(this.graph);

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

            await this.controls.rebuildGraph(this.graph);

            this.infos.render(this.graph);
            this.legend.render(this.graph);
            this.tree.render(this.graph.data);

            const scene = this.graph.graphInstance.scene();

            const axesHelper = new THREE.AxesHelper(500); // taille des axes
            axesHelper.position.set(0, 0, 0);
            scene.add(axesHelper);
        } catch (err) {
            alert('Erreur lors du chargement du JSON : ' + err.message);
        }
    }

}

