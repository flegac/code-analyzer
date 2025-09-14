class Graph {
    constructor() {
        this.container = createDiv('graph');
        this.graph = ForceGraph3D()(this.container);
        this.nodes = [];
        this.links = [];
        this.nodesMap = {};
    }


    uniqueGroups() {
        return new Set(Array.from(this.nodes, node => node.group));
    }

    async renderGraph(dataset, params) {
        const dependencies = await dataset.dependencies();
        const hierarchy = await dataset.hierarchy();

        await this.resetGraph(params);
        const nodes = new Set();
        for (let relation of [hierarchy, dependencies]) {
            relation.links.forEach(_ => this.links.push(_))
            relation.nodes.forEach(_ => nodes.add(_))
        }

        for (const id of nodes) {
            const usedBy = dependencies.usedBy[id]?.length || 0;
            const dependOn = dependencies.dependOn[id]?.length || 0;
            const radius = dependencies.usedBy[id]?.length || 0;
            const node = {
                id,
                group: id,
                radius: radius,
                usedBy: usedBy,
                dependOn: dependOn,
                // x,y,z are induced by forces
            };
            this.nodesMap[id] = node;
            this.nodes.push(node);
        }

        this.graph.graphData({nodes: this.nodes, links: this.links});
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

        this.nodes = [];
        this.links = [];
        this.nodesMap = {};
    }
}


