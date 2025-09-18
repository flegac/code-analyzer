import {forceGroupCollide} from "/physics/custom-force.js"
import {GroupStrategy} from "/graph/group-strategy.js"


function linkValue(label, baseValue, ratio) {
    if (label === "dependencies") {
        ratio = 1 - ratio;
    }
    return baseValue * ratio;
}


export class PhysicsUpdater {
    constructor(app) {
        this.app = app;
    }

    async apply() {
        const graph = this.app.layout.graph;
        const physics = this.app.state.physics;

        const links = graph.graph.d3Force('link');
        const charge = graph.graph.d3Force('charge');

        graph.graph.d3VelocityDecay(physics.friction);
        const groupStrategy = new GroupStrategy(physics.collapsingDepth);

        if (physics.isActive) {
            const repulsionStrength = Math.pow(10, 4 * physics.repulsionFactor);
            graph.graph.numDimensions(physics.dimension);
            charge.strength(-repulsionStrength);
            graph.graph.d3Force('prefixCollide', forceGroupCollide(physics));
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

                const scaling = srcGroup === targetGroup ? .0 : 1.;
                return scaling * 10 * linkValue(link.label, physics.link.distance, physics.link.dependencyStrengthFactor);
            });
            links.strength(link => {
                return .01 * physics.link.strength;
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