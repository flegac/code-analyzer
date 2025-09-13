const GENERAL_GRAPH_CONFIG = {
    datasetPath: 'data/dependencies.json',
    configPath: 'data/config.json',
    dataset: null,
    dimension: 3,
    groupHierarchyDepth: 2,
    nodeSize: 'branches',
    chargeStrength: 50,
    groupDistance: 50,
};

class GraphUpdater {
    constructor(graph, tree) {
        this.params = GENERAL_GRAPH_CONFIG;

        this.groups = new Set();
        this.graph = graph;
        this.tree = tree;

        this.nodeControl = new GraphNodeUpdater(this);
        this.edgeControl = new GraphEdgeUpdater(this);
        this.groupControl = new GraphGroupUpdater(this);

        this.updaters = [
            this.groupControl,
            this.nodeControl,
            this.edgeControl,
            new GraphForceUpdater(this),
        ];
    }

    async loadConfig() {
        return await fetch(this.params.configPath).then(res => res.json());
    }

    async dependencies() {
        let raw = this.params.dataset;
        if (raw === null) {
            raw = await fetch(this.params.datasetPath).then(res => res.json());
        }

        const config = await this.loadConfig();
        const excluded = config.excluded;

        const filtered = Object.fromEntries(
            Object.entries(raw)
                .filter(([key]) => !excluded.includes(key))
                .map(([key, values]) => [key, values.filter(v => !excluded.includes(v))])
        );

        return new Relation('dependencies', filtered);
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