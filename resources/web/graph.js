class Graph {
    constructor() {
        this.container = createDiv('graph');
        this.graph = ForceGraph3D()(this.container);
        new GraphControllerCamera(this).start();
        const resizeObserver = new ResizeObserver(() => {
            this.graph
                .width(this.container.clientWidth)
                .height(this.container.clientHeight);
        });
        resizeObserver.observe(this.container);
    }

    data() {
        return this.graph.graphData()
    }

    async renderGraph(dataset) {
        const dependencies = await dataset.dependencies();
        const hierarchy = dependencies.hierarchy();

        this.resetGraph();
        const nodeIds = new Set();
        for (let relation of [hierarchy, dependencies]) {
            relation.nodes.forEach(_ => nodeIds.add(_))
        }
        this.graph.graphData({
            nodes: Array.from(nodeIds).map(id => {
                return {
                    id,
                    group: id,
                    radius: 1,
                    usedBy: dependencies.usedBy[id] || [],
                    dependOn: dependencies.dependOn[id] || [],
                    // x,y,z are induced by forces
                };
            }),
            links: [
                ...hierarchy.links,
                ...dependencies.links
            ]
        });
    }

    resetGraph() {
        if (this.graph && typeof this.graph._destructor === 'function') {
            this.graph._destructor();
        }
        this.graph = ForceGraph3D()(this.container)
            .nodeLabel(node => {
                let infos = '';
                if (node.infos) {
                    infos = JSON.stringify(node.infos, null, 2);
                }
                return `${node.id}<br>\n${infos}`;
            })
            .width(this.container.clientWidth)
            .height(this.container.clientHeight);

    }
}


