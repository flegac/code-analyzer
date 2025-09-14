class GraphUpdaterPhysics {
    constructor(updater) {
        this.updater = updater;
    }

    async apply(graph) {
        const physics = this.updater.params.physics;
        const relations = this.updater.params.relations;

        const links = graph.graph.d3Force('link');
        const charge = graph.graph.d3Force('charge');

        if (physics.isActive) {
            graph.graph.numDimensions(physics.dimension);
            charge.strength(-physics.repulsionStrength);
            graph.graph.d3Force('prefixCollide', forceGroupCollide(physics));
            links.distance(link => {
                return 10 * relations[link.label]?.distance ?? 10;
            });
            links.strength(link => {
                return .01 * relations[link.label]?.strength ?? .1;
            });

        } else {
            links.strength(0);
            charge.strength(0);
        }

        // graph.graph.d3ReheatSimulation();
        // graph.graph.cooldownTicks(Infinity);
    }
}