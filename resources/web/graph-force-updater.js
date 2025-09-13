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
        // graph.graph.d3ReheatSimulation();
        // graph.graph.cooldownTicks(Infinity);
    }
}