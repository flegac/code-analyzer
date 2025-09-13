class GraphController {
    constructor(graph, tree) {
        this.updaters = [
            new GraphGroupUpdater(this),
            new GraphVertexUpdater(this),
            new GraphEdgeUpdater(this),
            new GraphForceUpdater(this),
        ];

        this.groups = new Set();
        this.graph = graph;
        this.tree = tree;

        this.params = {
            datasetPath: 'data/dependencies.json',
            dimension: 3,
            groupHierarchyDepth: 2,
            nodeSize: 'branches',
            chargeStrength: 50,
            linkDistances: {
                hierarchy: 10.,
                dependencies: 10.
            },
            groupDistance: 50,
            sourceSinkDistance: 50,
            sourceSinkDistanceActive: true,
            reload: () => this.loadGraph()
        };

        this.gui = new dat.GUI();
        this.gui.domElement.id = 'controller';

        this.gui.add(this.params, 'datasetPath', {
            'class_graph.json': 'data/class_graph.json',
            'dependencies.json': 'data/dependencies.json',
        }).name('Dataset')
            .onChange(() => this.changeDataset());

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

        this.gui.add(this.params.linkDistances, 'hierarchy', 1, 100, 0.1)
            .name('Hierarchy link')
            .onChange(() => this.updateGraph());

        this.gui.add(this.params.linkDistances, 'dependencies', 1, 100, 0.1)
            .name('Dependency link')
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
        const raw = await fetch(this.params.datasetPath).then(res => res.json());
        return new Relation('dependencies', raw);
    }

    async hierarchy() {
        const graph = await this.dependencies();
        const nodes = graph.nodes;

        const hierarchy = {};

        for (const full of nodes) {
            const [prefix, suffix] = full.split("::");
            const parts = prefix ? prefix.split(".") : [];

            for (let i = 1; i < parts.length; i++) {
                const parent = parts.slice(0, i).join(".");
                const child = parts.slice(0, i + 1).join(".");

                if (!hierarchy[parent]) {
                    hierarchy[parent] = [];
                }
                if (!hierarchy[parent].includes(child)) {
                    hierarchy[parent].push(child);
                }
            }

            if (suffix) {
                let a = null;
                let b = null;
                [a, b] = suffix.split("/");

                if (a !== null) {
                    const base = parts.join(".");
                    const className = [base, a].join('::');
                    if (!hierarchy[base]) {
                        hierarchy[base] = [];
                    }
                    hierarchy[base].push(className);
                    if (b != null) {
                        const methodName = [className, b].join('/');
                        if (!hierarchy[className]) {
                            hierarchy[className] = [];
                        }
                        hierarchy[className].push(methodName);
                    }
                }
            }


        }
        // const raw = await fetch(this.params.hierarchyPath).then(res => res.json());
        return new Relation('hierarchy', hierarchy);
    }

    async moduleInfos() {
        return await fetch('data/modules.json').then(res => res.json());
    }


    async loadGraph() {
        await this.changeDataset()
        await this.rebuildGraph();
    }

    async changeDataset() {
        const hierarchy = await this.hierarchy();
        this.tree.rebuild(hierarchy);
    }

    async rebuildGraph() {
        const dependencies = await this.dependencies();
        const hierarchy = await this.hierarchy();

        this.graph.renderGraph(hierarchy, dependencies);
        await this.updateGraph();
    }

    async updateGraph() {
        for (let updater of this.updaters) {
            await updater.apply(this.graph);
        }
    }
}