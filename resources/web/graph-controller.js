class GraphController {
    constructor(graph) {
        this.container = createDiv('controller');
        this.tree = new TreeView();
        this.container.appendChild(this.tree.container);

        this.graph = graph;
        this.table = new TableView();
        this.infos = new Infos();

        this.params = {
            dependenciesPath: 'data/dependencies.json',
            hierarchyPath: 'data/hierarchy.json',
            infosPath: 'data/modules.json',
            dimension: 3,
            groupHierarchyDepth: 2,
            nodeSize: 'lines',
            chargeStrength: 50,
            linkDistance: 10,
            groupDistance: 50,
            sourceSinkDistance: 50,
            sourceSinkDistanceActive: true,
            reload: () => this.loadGraph()
        };

        this.gui = new dat.GUI();
        this.gui.domElement.id = 'controller';

        this.gui.add(this.params, 'dependenciesPath', {
            'dependencies.json': 'data/dependencies.json',
        }).name('Dependencies');
        this.gui.add(this.params, 'hierarchyPath', {
            'hierarchy.json': 'data/hierarchy.json'
        }).name('Hierarchy');

        this.gui.add(this.params, 'dimension', {'2D': 2, '3D': 3})
            .name('Projection')
            .onChange(() => this.rebuildGraph(graph));

        this.gui.add(this.params, 'groupHierarchyDepth', 0, 5, 1)
            .name('Group hierarchy depth')
            .onChange(() => this.updateGraph())

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
            .onChange(() => this.directGraph().nodeVal(node => node.infos[this.params.nodeSize]))
        ;

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

    directGraph() {
        return this.graph.graph;
    }

    async dependencies() {
        return await fetch(this.params.dependenciesPath).then(res => res.json());
    }

    async hierarchy() {
        return await fetch(this.params.hierarchyPath).then(res => res.json());
    }

    async moduleInfos() {
        return await fetch(this.params.infosPath).then(res => res.json());
    }

    updateGraph() {
        this.graph.updateGraph(this);
    }

    async rebuildGraph() {
        const dependencies = await this.dependencies();
        const hierarchy = await this.hierarchy();
        const infos = await this.moduleInfos();
        this.graph.renderGraph(hierarchy, dependencies, infos, this.params);
        this.updateGraph();
    }


    async loadGraph() {
        try {
            const dependencies = await this.dependencies();
            const hierarchy = await this.hierarchy();
            const infos = await this.moduleInfos();
            await this.rebuildGraph();

            this.infos.render(this.graph);
            this.tree.render(dependencies);
            this.table.render(infos);

            const scene = this.graph.graph.scene();

            const axesHelper = new THREE.AxesHelper(500); // taille des axes
            axesHelper.position.set(0, 0, 0);
            scene.add(axesHelper);
        } catch (err) {
            alert('Erreur lors du chargement du JSON : ' + err.message);
        }
    }
}