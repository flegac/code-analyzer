class PhysicsController extends GuiGraphController {
    constructor(updater) {
        super('graph-edge-controller', 'Physics');
        this.updater = updater;

        this.gui.add(this.updater.params.physics, 'isActive')
            .name('running status')
            .onChange(() => this.updater.apply());

        this.gui.add(this.updater.params.physics, 'dimension', {'2D': 2, '3D': 3})
            .name('Projection')
            .onChange(() => this.updater.rebuildGraph(graph));


        this.gui.add(this.updater.params.physics, 'repulsionStrength', 1, 100, 0.1)
            .name('Repulsion Strength')
            .onChange(() => this.updater.apply());

        this.gui.add(this.updater.params.physics, 'groupDistance', 1, 100, 0.1)
            .name('Group attraction')
            .onChange(() => this.updater.apply());

        this.gui.add(this.updater.params.physics, 'groupHierarchyDepth', 1, 10, 1)
            .name('Group hierarchy depth')
            .onChange(() => this.updater.apply())
        this.addLinkFolder('Dependencies', this.updater.params.links.dependencies);
        this.addLinkFolder('Hierarchy', this.updater.params.links.hierarchy);
    }

    addLinkFolder(title, params) {
        const onChange = () => this.updater.children.physics.apply();
        const folder = this.gui.addFolder(title);
        folder.add(params, 'distance', 1, 100, 0.1).name('distance').onChange(onChange);
        folder.add(params, 'strength', 0, 100, 0.1).name('strength').onChange(onChange);
        return folder;
    }
}