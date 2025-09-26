import { StoreService } from "/lib/store.service.js";
import { clusterForce } from "/lib/cluster-force.js"
import { GraphService } from "/display/graph.service.js";

export class PhysicsService {
    static singleton = new PhysicsService();

    constructor() {
        this.state = StoreService.singleton.store('physics', {
            "camAutoFit": false,
            "isActive": true,
            "friction": 0.1,
            "fixX": false,
            "fixY": false,
            "fixZ": false,
            "repulsionFactor": 0.5,
            "link": {
                "relationStrengthFactor": 0.15,
                "strength": 5
            }
        }
        );
        console.log('initialize', this);
    }

    async apply() {
        const G = GraphService.singleton;
        const graph = G.getGraph();
        const state = this.state;

        graph.d3VelocityDecay(state.friction);

        // projection X/Y/Z
        G.state.nodes.forEach((node) => {
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

            graph.cooldownTicks(500);
            graph.d3ReheatSimulation();
        } else {
            graph.cooldownTicks(0);
            links.strength(0);
            charge.strength(0);
            graph.d3Force('cluster');
        }
    }
}