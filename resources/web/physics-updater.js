class PhysicsUpdater {
    constructor(app) {
        this.app = app;
    }

    async apply() {
        const graph = this.app.layout.graph;
        const physics = this.app.state.physics;
        const relations = this.app.state.links;

        const links = graph.graph.d3Force('link');
        const charge = graph.graph.d3Force('charge');

        graph.graph.d3VelocityDecay(physics.friction);


        const graphData = graph.data()
        const groupStrategy = new GroupStrategy(
            this.app.state.physics.collapsingDepth,
        );
        const groupMap = new Map();
        for (const node of graphData.nodes) {
            const group = groupStrategy.apply(node.id);
            if (!groupMap.has(group)) groupMap.set(group, []);
            groupMap.get(group).push(node);
        }

        const dependencyWeightRatio = physics.dependencyWeightRatio;
        const groupAttractionRatio = physics.groupAttractionRatio;
        if (physics.isActive) {
            graph.graph.numDimensions(physics.dimension);
            charge.strength(-physics.repulsionStrength);
            graph.graph.d3Force('prefixCollide', forceGroupCollide(this.app.state));
            links.distance(link => {
                const src = link.source;
                const target = link.target;
                const srcGroup = groupStrategy.apply(src.id);
                const targetGroup = groupStrategy.apply(target.id);
                if ((src.infos?.imported ?? 0) + (src.infos?.imports ?? 0) === 0) {
                    return 0;
                }
                if ((target.infos?.imported ?? 0) + (target.infos?.imports ?? 0) === 0) {
                    return 0;
                }
                const scaling = srcGroup === targetGroup ? .01 : 1.;
                return scaling * 10 * relations[link.label]?.distance;
            });
            links.strength(link => {
                const kk = 1. - groupAttractionRatio;
                const k = link.label === 'hierarchy' ? 1 - dependencyWeightRatio : dependencyWeightRatio;
                return kk * k * .05 * relations[link.label]?.strength ?? .1;
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