class PhysicsController extends GuiGraphController {
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

        this.gui.add(state, 'repulsionStrength', 1, 100, 0.1)
            .name('Repulsion Strength')
            .onChange(onChange);

        this.gui.add(state, 'collapsingDepth', 0, 5, 1)
            .name('Collapsing depth')
            .onChange(onChange);

        this.gui.add(state, 'groupAttractionRatio', 0, 1., 0.01)
            .name('Group attraction ratio')
            .onChange(onChange);

        this.gui.add(state, 'dependencyWeightRatio', 0., 1., 0.01)
            .name('Dependency weight ratio')
            .onChange(onChange);

        this.addLinkFolder('Dependencies', this.app.state.links.dependencies);
        this.addLinkFolder('Hierarchy', this.app.state.links.hierarchy);
    }

    addLinkFolder(title, params) {
        const onChange = () => this.app.physics.apply();
        const folder = this.gui.addFolder(title);
        folder.add(params, 'distance', 1, 100, 0.1).name('distance').onChange(onChange);
        folder.add(params, 'strength', 0, 100, 0.1).name('strength').onChange(onChange);
        return folder;
    }
}