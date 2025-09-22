import {LayoutService} from "/core/layout.service.js"

import {clusterForce} from "/lib/cluster-force.js"
import {ClusterStrategy} from "/graph/cluster.strategy.model.js"

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

    getClusterMap(nodes) {
        const strategy = new ClusterStrategy(this.state.collapsingDepth);
        return strategy.computeGroupMap(nodes);
    }


    async apply() {
        const graph = LayoutService.singleton.graph.getGraph();
        const physics = this.state;

        const links = graph.d3Force('link');
        const charge = graph.d3Force('charge');

        graph.d3VelocityDecay(physics.friction);

        if (physics.isActive) {
            const repulsionStrength = Math.pow(10, 4 * physics.repulsionFactor);
            graph.numDimensions(physics.dimension);
            charge.strength(-repulsionStrength);
            graph.d3Force('cluster', clusterForce());
            links.strength(link => {
                const k = link.label === 'relation'
                    ? physics.link.relationStrengthFactor
                    : 1 - physics.link.relationStrengthFactor;
                return .01 * k * physics.link.strength;
            });

            graph.cooldownTicks(300);
            graph.d3ReheatSimulation();
        } else {
            graph.cooldownTicks(0);
            links.strength(0);
            charge.strength(0);
            graph.d3Force('cluster');
        }
    }
}