class Graph {
    constructor() {
        this.container = createDiv('graph');
        this.graph = this._rebuild();
        this.cam = new GraphControllerCamera(this);
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

    reset() {
        if (this.graph && typeof this.graph._destructor === 'function') {
            this.graph._destructor();
        }
        this.graph = this._rebuild();
        this.cam.handleClicks()

    }

    async rebuild(dataset) {
        // TODO: why is it needed to reallocate a new Graph object ?
        this.reset();

        const dependencies = await dataset.dependencies();
        const hierarchy = dependencies.hierarchy();
        const nodeIds = new Set([
            ...dependencies.nodes,
            ...hierarchy.nodes
        ]);

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


    _rebuild() {
        return ForceGraph3D()(this.container)
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
