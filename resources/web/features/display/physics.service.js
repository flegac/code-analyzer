import {LayoutService} from "/core/layout.service.js"

import {clusterForce} from "/lib/cluster-force.js"
import {ClusterStrategy} from "/graph/cluster.strategy.model.js"
import {GraphService} from "/display/graph.service.js";

class Physics {
    constructor() {
        this.remainingTicks = 0;
        this.isActive = true;
        this.friction = 0.1;
        this.fixX = false;
        this.fixY = false;
        this.fixZ = false;
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
        const state = this.state;

        graph.d3VelocityDecay(state.friction);

        // projection X/Y/Z
        GraphService.singleton.state.nodes.forEach((node) => {
            node.fx = state.fixX ? 0 : null;
            node.fy = state.fixY ? 0 : null;
            node.fz = state.fixZ ? 0 : null;
        });

        // forces
        const links = graph.d3Force('link');
        const charge = graph.d3Force('charge');

        if (state.isActive) {
            const repulsionStrength = Math.pow(10, 4 * state.repulsionFactor);
            charge.strength(-repulsionStrength);
            graph.d3Force('cluster', clusterForce());
            links.strength(link => {
                const k = link.label === 'relation'
                    ? state.link.relationStrengthFactor
                    : 1 - state.link.relationStrengthFactor;
                return .01 * k * state.link.strength;
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