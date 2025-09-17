import {GuiGraphController} from "/core/utils.js";

export class PhysicsController extends GuiGraphController {
    constructor(app) {
        super('graph-edge-controller', 'Physics');
        this.app = app;
        const state = this.app.state.physics;
        const dataset = this.app.state.dataset;
        const onChange = () => this.app.apply();

        this.gui.add(state, 'isActive')
            .name('running status')
            .onChange(onChange);

        this.gui.add({
            simulate: () => this.app.layout.graph.graph.d3ReheatSimulation()
        }, 'simulate')
            .name('Simulate');

        this.gui.add(state, 'dimension', {'2D': 2, '3D': 3})
            .name('Projection')
            .onChange(onChange);

        this.gui.add(state, 'collapsingDepth', 0, 5, 1)
            .name('Collapsing depth')
            .onChange(onChange);


        this.gui.add(state, 'repulsionFactor', 0, 1, 0.01)
            .name('Repulsion')
            .onChange(onChange);

        this.gui.add(state.link, 'strength', 0, 25, 0.01).name('strength').onChange(onChange);
        this.gui.add(state.link, 'distance', 0, 1000, 1).name('distance').onChange(onChange);
        this.gui.add(state.link, 'dependencyStrengthFactor', 0, 1, 0.01)
            .name('Dependency strength')
            .onChange(onChange);
    }
}