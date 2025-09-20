import {forceGroupCollide} from "/lib/custom-force.js"
import {GroupStrategy} from "/model/group.strategy.model.js"
import {LayoutService} from "/service/layout.service.js"
import {Physics} from "/model/physics.model.js";


function linkValue(label, baseValue, ratio) {
    if (label !== "relation") {
        ratio = 1 - ratio;
    }
    return baseValue * ratio;
}


export class PhysicsService {
    static singleton = new PhysicsService();

    constructor() {
        this.state = new Physics();
        console.log('initialize', this);
    }

    async apply() {
        const graph = LayoutService.singleton.graph;
        const physics = this.state;

        const links = graph.graph.d3Force('link');
        const charge = graph.graph.d3Force('charge');

        graph.graph.d3VelocityDecay(physics.friction);
        const groupStrategy = new GroupStrategy(physics.collapsingDepth);

        if (physics.isActive) {
            const repulsionStrength = Math.pow(10, 4 * physics.repulsionFactor);
            graph.graph.numDimensions(physics.dimension);
            charge.strength(-repulsionStrength);
            graph.graph.d3Force('prefixCollide', forceGroupCollide(physics));
            links.strength(link => {
                const value = linkValue(link.label, physics.link.strength, physics.link.relationStrengthFactor);
                return .01 * value;
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