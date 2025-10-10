import { SS } from "../core/store.service.js";
import { MyLink, MyNode } from "../project/graph.model.js";
import { G } from "../visuals/graph.service.js";
import { V } from "../visuals/visual.service.js";
import { clusterForce } from "./forces/cluster.force.js";
import { Fixer, sphericalConstraint } from "./forces/spherical.constraint.force.js";


export interface PhysicConfig {
    camAutoFit: boolean;
    isActive: boolean;
    friction: number;
    constraints: {
        planar: boolean;
        spherical: boolean;
        sphericalDepth: number;
    };
    clusterFactor: number;
    repulsionFactor: number;
    attractionFactor: number;
    link: {
        relationStrengthFactor: number;
    };
};

export class PhysicsService {
    static singleton = new PhysicsService();
    state: PhysicConfig;
    forcebackups: {};

    constructor() {
        this.state = SS.store('physics', {
            camAutoFit: false,
            isActive: true,
            friction: 0.25,
            constraints: {
                planar: false,
                spherical: false,
                sphericalDepth: 1
            },
            clusterFactor: .5,
            repulsionFactor: 0.5,
            attractionFactor: .5,
            link: {
                relationStrengthFactor: .1,
            }
        }
        );
        this.forcebackups = {};
        console.log('initialize', this);
    }

    apply() {
        const graph = G.getGraph();
        const state = this.state;

        graph.d3VelocityDecay(state.friction);

        const isActive = state.isActive;


        if (!isActive) {
            this.forcebackups = {
                charge: graph.d3Force('charge'),
                link: graph.d3Force('link'),
            };
            ['charge', 'link', 'spherical', 'cluster'].forEach(key => {
                graph.d3Force(key, null);
            })
        } else {

            // load backups
            Object.entries(this.forcebackups).forEach(([key, value]) => {
                graph.d3Force(key, value);
            });

            //repulsion
            const repulsionStrength = Math.pow(10, 5 * state.repulsionFactor);
            graph.d3Force('charge').strength(-repulsionStrength);


            //attraction
            const curvePower = 4;
            const attractionStrength = Math.pow(state.attractionFactor, curvePower);
            graph.d3Force('link').strength((link: MyLink) => {
                const k = link.label === 'relation'
                    ? state.link.relationStrengthFactor
                    : 1 - state.link.relationStrengthFactor;
                return k * attractionStrength;
            });

            // cluster
            graph.d3Force('cluster', clusterForce());

            const n = G.state.nodes.length
            const r = V.expectdRadius();
            const radius = Math.sqrt(n) * r;
            console.log(`n=${n} r=${r}`, radius);

            // spherical constraints
            const spherical = this.state.constraints.spherical
                ? sphericalConstraint({
                    R: regularIntervals(
                        state.constraints.sphericalDepth,
                        radius, 2 * radius,
                    ),
                    power: state.repulsionFactor,
                    // fixer: Fixer.soft,
                    fixer: Fixer.hard,
                })
                : null;
            graph.d3Force('spherical', spherical);
        }

        // planar constraint
        G.state.nodes.forEach((node: MyNode) => {
            node.fz = state.constraints.planar ? 0 : null;
        });

        if (isActive) {
            graph.cooldownTicks(500);
            graph.d3ReheatSimulation();
        } else {
            graph.cooldownTicks(0);
        }
    }
}
export const PP = PhysicsService.singleton;

function regularIntervals(k: number, a: number, b: number) {
    if (k <= 1) return [a]; // ou [b], selon ton besoin
    const step = (b - a) / (k - 1);
    return Array.from({ length: k }, (_, i) => a + i * step);
}