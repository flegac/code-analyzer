class PhysicsUpdater {
    constructor(updater) {
        this.updater = updater;
    }

    async apply() {
        const graph = this.updater.graph;
        const physics = this.updater.params.physics;
        const relations = this.updater.params.links;

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
            graph.graph.cooldownTicks(Infinity);

        } else {
            links.strength(0);
            charge.strength(0);
            graph.graph.cooldownTicks(0);
        }
        graph.graph.d3ReheatSimulation();
    }
}