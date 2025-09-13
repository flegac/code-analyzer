class GraphForceUpdater {
    constructor(controls) {
        this.controls = controls;
    }

    async apply(graph) {
        graph.graph.numDimensions(this.controls.params.dimension);
        graph.graph.d3Force('charge').strength(-this.controls.params.chargeStrength);
        graph.graph.d3Force('prefixCollide', forceGroupCollide(
            node => node.id.split('.').slice(0, this.controls.params.groupHierarchyDepth).join('.'),
            this.controls.params.groupDistance
        ));

        graph.graph.d3Force('link').distance(link => {
            if (link.label) {
                return .01 * this.controls.params.linkDistances[link.label];
            }
            return 1.;
        });

        // const filterNodes = graph.nodes.filter(node => {
        //     return node.group !== '__disconnected__' && node.group !== '__source__' && node.group !== '__sink__';
        // });
        // const validLinks = graph.links.filter(link =>
        //     filterNodes.has(link.source) && filterNodes.has(link.target)
        // );
        // graph.graph.graphData({nodes: filterNodes, links: validLinks});

        // graph.nodes.forEach(node => {
        //     if (node.group === '__disconnected__') {
        //         node.fx = 0;
        //         node.fy = 0;
        //         node.fz = 0;
        //     }
        // });

        const sourceSinkDistance = 5 * this.controls.params.sourceSinkDistance;
        if (this.controls.params.sourceSinkDistanceActive) {
            graph.nodes.forEach(node => {
                if (node.group === '__source__') {
                    // node.fx = node.x;
                    // node.fy = node.y; //Math.max(node.y, 100);
                    node.fz = sourceSinkDistance;
                }
            });
            graph.nodes.forEach(node => {
                if (node.group === '__sink__') {
                    node.fz = -sourceSinkDistance;
                }
            });
        } else {
            graph.nodes.forEach(node => {
                if (node.group === '__source__' || node.group === '__sink__') {
                    node.fz = null;
                }
            });
        }

        // graph.graph.d3ReheatSimulation();
        // graph.graph.cooldownTicks(Infinity);
        // graph.graph.pauseAnimation();
    }
}