class GraphView {
    constructor() {
        this.container = createDiv('graph');
        this.graph = this._rebuild();
        this.cam = new CameraController(this);
        this.selected = null;
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


        this.graph.onEngineTick(() => {
            this.graph.graphData().nodes.forEach(n => {
                if (isNaN(n.x)) n.x = 1000 * (Math.random() - .5);
                if (isNaN(n.y)) n.y = 1000 * (Math.random() - .5);
                if (isNaN(n.z)) n.z = 1000 * (Math.random() - .5);
            });
        });


        this.graph.onNodeClick(node => {
            this.cam.focusOn(node);
            this.selected = node;
        });
        // this.graph.onNodeHover(node => {
        //     this.graph.linkDirectionalParticles(link => {
        //         return node && (link.source === node || link.target === node || link.target === this.selected || link.source === this.selected) ? 5 : 0;
        //     });
        //
        //     this.graph.linkDirectionalParticleWidth(link => {
        //         console.log(link);
        //         return node && (link.source === node || link.target === node || link.target === this.selected || link.source === this.selected) ? 10 : 0;
        //     });
        //
        //     this.graph.linkDirectionalParticleSpeed(0.01);
        // });

    }

    rebuild(dependencies) {
        // TODO: why is it needed to reallocate a new Graph object ?
        this.reset();

        const hierarchy = MyGraph.hierarchy(dependencies);
        const nodeIds = new Set([
            ...dependencies.getNodes(),
            ...hierarchy.getNodes()
        ]);
        this.graph.graphData({
            nodes: Array.from(nodeIds).map(id => ({id})),
            links: [
                ...hierarchy.getLinks(),
                ...dependencies.getLinks(),
            ]
        });
    }


    _rebuild() {
        this.selected = null;
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
