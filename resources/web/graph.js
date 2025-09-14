class Graph {
    constructor() {
        this.container = createDiv('graph');
        this.graph = ForceGraph3D()(this.container);
        this.nodesMap = {};
    }

    data() {
        return this.graph.graphData()
    }

    async renderGraph(dataset, params) {
        const dependencies = await dataset.dependencies();
        const hierarchy = await dataset.hierarchy();

        await this.resetGraph(params);
        const nodes = new Set();
        for (let relation of [hierarchy, dependencies]) {
            relation.nodes.forEach(_ => nodes.add(_))
        }

        for (const id of nodes) {
            const usedBy = dependencies.usedBy[id] || [];
            const dependOn = dependencies.dependOn[id] || [];
            this.nodesMap[id] = {
                id,
                group: id,
                radius: 1,
                usedBy: usedBy,
                dependOn: dependOn,
                // x,y,z are induced by forces
            };
        }

        this.graph.graphData({
            nodes: Object.values(this.nodesMap),
            links: [
                ...hierarchy.links,
                ...dependencies.links
            ]
        });
    }

    async resetGraph(params) {
        if (this.graph && typeof this.graph._destructor === 'function') {
            this.graph._destructor();
        }
        this.graph = ForceGraph3D()(this.container,);
        this.graph.nodeLabel(node => {
            let infos = '';
            if (node.infos) {
                infos = JSON.stringify(node.infos, null, 2);
            }
            return `${node.id}<br>\n${infos}`;
        });

        const resizeObserver = new ResizeObserver(() => {
            this.graph.width(this.container.clientWidth);
            this.graph.height(this.container.clientHeight);
        });
        resizeObserver.observe(this.container);

        new GraphControllerCamera(this.graph).start();

        this.nodesMap = {};
    }
}


