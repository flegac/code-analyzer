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

    renderGraph(hierarchy, dependencies) {
        this.resetGraph();
        const nodes = new Set();
        for (let relation of [hierarchy, dependencies]) {
            relation.links.forEach(_ => this.links.push(_))
            relation.nodes.forEach(_ => nodes.add(_))
        }

        console.log(hierarchy.nodes);
        console.log(dependencies.nodes);
        console.log(nodes);

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

    resetGraph() {
        if (this.graph && typeof this.graph._destructor === 'function') {
            this.graph._destructor();
        }
        this.graph = ForceGraph3D()(this.container);
        this.graph.nodeLabel(node => {
            let infos = '';
            if (node.infos) {
                infos = JSON.stringify(node.infos, null, 2);
            }
            return `${node.id}<br>\n${infos}`;
        });

        this.graph.onNodeClick((node, event) => {
            const cameraPos = this.graph.cameraPosition(); // {x, y, z}
            const controls = this.graph.controls();        // OrbitControls ou TrackballControls

            const lookAt = controls.target;
            const dx = node.x - lookAt.x;
            const dy = node.y - lookAt.y;
            const dz = node.z - lookAt.z;

            const newPos = {
                x: cameraPos.x + dx, y: cameraPos.y + dy, z: cameraPos.z + dz
            };
            this.graph.cameraPosition(newPos, node, 1000); // transition vers le nœud
        });

        const resizeObserver = new ResizeObserver(() => {
            this.graph.width(this.container.clientWidth);
            this.graph.height(this.container.clientHeight);
        });
        resizeObserver.observe(this.container);
        this.nodes = [];
        this.links = [];
        this.nodesMap = {};
    }
}

