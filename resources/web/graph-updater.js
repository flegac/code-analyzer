class GraphUpdater {
    constructor(graph, tree) {
        this.params = GENERAL_GRAPH_CONFIG;

        this.graph = graph;
        this.tree = tree;

        this.children = {
            dataset: new DatasetUpdater(this),
            physics: new PhysicsUpdater(this),
            display: new DisplayUpdater(this),
        }
    }

    async loadGraph() {
        await this.rebuildGraph();
    }

    async rebuildGraph() {
        const dependencies = await this.children.dataset.dependencies();
        this.graph.rebuild(dependencies);
        await this.apply();
    }

    async apply() {
        for (const [_, updater] of Object.entries(this.children)) {
            await updater.apply();
        }
        //FIXME: This should not be necessary ! (link color is wring, relative to groupHierarchyDepth)
        for (const [_, updater] of Object.entries(this.children)) {
            await updater.apply();
        }
        // TODO: better handling of that
        // TODO: automatic resize ?
        const renderer = new DisplayNodeUpdater(this.params.nodes)
        renderer.apply(this.graph.graph);
    }
}
