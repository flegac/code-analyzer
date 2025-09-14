class GraphControllerRelation extends GuiGraphController {
    constructor(updater) {
        super('graph-edge-controller', 'Relations');
        this.updater = updater;
        this.addLinkFolder('Dependencies', this.updater.params.relations.dependencies);
        this.addLinkFolder('Hierarchy', this.updater.params.relations.hierarchy);
    }

    addLinkFolder(title, params) {
        const onChange = () => this.updater.children.edges.apply(this.updater.graph);
        const folder = this.gui.addFolder(title);
        folder.add(params, 'distance', 1, 100, 0.1).name('distance').onChange(onChange);
        folder.add(params, 'strength', 1, 100, 0.1).name('strength').onChange(onChange);
        folder.add(params, 'width', 0.1, 10, 0.1).name('width').onChange(onChange);
        folder.addColor(params, 'color').name('Color').onChange(onChange);
        return folder;
    }
}
