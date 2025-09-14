const GENERAL_GRAPH_CONFIG = {

    physics: {
        isActive: true,
        dimension: 3,
        groupHierarchyDepth: 2,
        repulsionStrength: 50, // chargeStrength
        groupDistance: 50,
    },

    dataset: {
        datasetPath: 'data/dependencies.json',
        configPath: 'data/config.json',
        moduleInfosPath: 'data/modules.json',
        dataset: null,
    },

    nodes: {
        groupHierarchyDepth: 2,
        size: 'branches',
        color: 'group',
        fontSize: 64,
        scaleFactor: .2
    },

    relations: {
        dependencies: {
            color: '#0f0',
            distance: 10,
            strength: 1.,
            width: 1,
        },
        hierarchy: {
            color: '#ffff00',
            distance: 10,
            strength: 100.,
            width: 10,
        },
    }

};

class GraphUpdater {
    constructor(graph, tree) {
        this.params = GENERAL_GRAPH_CONFIG;

        this.graph = graph;
        this.tree = tree;

        this.children = {
            dataset: new GraphUpdaterDataset(this),
            nodes: new GraphUpdaterNode(this),
            edges: new GraphUpdaterRelation(this),
            forces: new GraphUpdaterPhysics(this),
        }
    }


    async loadGraph() {
        await this.rebuildGraph();
    }


    async rebuildGraph() {
        await this.graph.renderGraph(this.children.dataset, this.params.nodes);
        await this.updateGraph();
    }

    async updateGraph() {
        for (const [_, updater] of Object.entries(this.children)) {
            await updater.apply(this.graph);
        }
    }
}