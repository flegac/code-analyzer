import { StoreService } from "../store.service.js";
import { clusterForce } from "./forces/cluster.force.js"
import { sphericalConstraint, Fixer } from "./forces/spherical.constraint.force.js"
import { G } from "./graph.service.js";

export class PhysicsService {
    static singleton = new PhysicsService();

    constructor() {
        this.state = StoreService.singleton.store('physics', {
            camAutoFit: false,
            isActive: true,
            friction: 0.1,
            constraints: {
                planar: false,
                spherical: true,
            },

            repulsionFactor: 0.25,
            attractionFactor: .5,
            link: {
                relationStrengthFactor: .1,
            }
        }
        );
        console.log('initialize', this);
    }

    async apply() {
        const graph = G.getGraph();
        const state = this.state;

        graph.d3VelocityDecay(state.friction);

        // planar constraint
        G.state.nodes.forEach((node) => {
            node.fz = state.constraints.planar ? 0 : null;
        });

        // forces
        const links = graph.d3Force('link');
        const charge = graph.d3Force('charge');

        const isActive = state.isActive;



        //repulsion
        const maxPower = 5;
        const repulsionStrength = isActive
            ? Math.pow(10, maxPower * state.repulsionFactor)
            : 0;
        charge.strength(-repulsionStrength);

        //attraction
        const curvePower = 4;
        const attractionStrength = isActive
            ? Math.pow(state.attractionFactor, curvePower)
            : 0;
        links.strength(link => {
            const k = link.label === 'relation'
                ? state.link.relationStrengthFactor
                : 1 - state.link.relationStrengthFactor;
            return k * attractionStrength;
        });

        //cluster
        const cluster = isActive ? clusterForce() : null;
        graph.d3Force('cluster', cluster);

        if (state.isActive) {

            // constraints (spherical, planar)
            if (this.state.constraints.spherical) {
                graph.d3Force('spherical', sphericalConstraint({
                    power: state.repulsionFactor,
                    // fixer: Fixer.soft,
                    fixer: Fixer.hard,
                }));
            } else {
                graph.d3Force('spherical', null);
            }

            graph.cooldownTicks(500);
            graph.d3ReheatSimulation();
        } else {
            graph.cooldownTicks(0);
            graph.d3Force('spherical');
        }
    }
}
export const PP = PhysicsService.singleton;