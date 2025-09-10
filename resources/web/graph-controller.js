class GraphController {
    constructor(graph, tree, infos) {
        this.graph = graph;
        this.tree = tree;
        this.infos = infos;

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
            .onChange(() => this.graph.graph.nodeVal(node => node.infos[this.params.nodeSize]))
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

    async dependencies() {
        return await fetch(this.params.dependenciesPath).then(res => res.json());
    }

    async hierarchy() {
        return await fetch(this.params.hierarchyPath).then(res => res.json());
    }

    async moduleInfos() {
        return await fetch(this.params.infosPath).then(res => res.json());
    }


    async loadGraph() {
        try {
            const hierarchy = await this.hierarchy();
            await this.rebuildGraph();
            this.tree.rebuild(hierarchy);
            this.infos.rebuild(this.graph)
        } catch (err) {
            alert('Erreur lors du chargement du JSON : ' + err.message);
        }
    }

    async rebuildGraph() {
        const dependencies = await this.dependencies();
        const hierarchy = await this.hierarchy();
        const infos = await this.moduleInfos();
        this.graph.renderGraph(hierarchy, dependencies, infos, this.params);

        this.updateGraph();
    }

    updateGraph() {
        this.graph.updateGraph(this);
    }


}