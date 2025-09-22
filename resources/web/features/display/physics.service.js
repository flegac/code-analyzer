import {LayoutService} from "/core/layout.service.js"

import {forceGroupCollide} from "/lib/custom-force.js"


function linkValue(label, baseValue, ratio) {
    if (label !== "relation") {
        ratio = 1 - ratio;
    }
    return baseValue * ratio;
}

class Physics {
    constructor() {
        this.isActive = true;
        this.friction = 0.1;
        this.dimension = 3;
        this.collapsingDepth = 1;
        this.repulsionFactor = 0.5;
        this.link = {
            relationStrengthFactor: 0.15,
            strength: 5,
        };
    }
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

        const links = graph.getGraph().d3Force('link');
        const charge = graph.getGraph().d3Force('charge');

        graph.getGraph().d3VelocityDecay(physics.friction);

        if (physics.isActive) {
            const repulsionStrength = Math.pow(10, 4 * physics.repulsionFactor);
            graph.getGraph().numDimensions(physics.dimension);
            charge.strength(-repulsionStrength);
            graph.getGraph().d3Force('prefixCollide', forceGroupCollide(physics));
            links.strength(link => {
                const k = link.label === 'relation'
                    ? physics.link.relationStrengthFactor
                    : 1 - physics.link.relationStrengthFactor;
                return .01 * k * physics.link.strength;
            });
            graph.getGraph().cooldownTicks(Infinity);
        } else {
            links.strength(0);
            charge.strength(0);
            graph.getGraph().cooldownTicks(0);
        }
        graph.getGraph().d3ReheatSimulation();
    }
}