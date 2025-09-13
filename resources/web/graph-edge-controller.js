class GraphEdgeController extends GuiGraphController {
    constructor(params) {
        super(params, 'graph-edge-controller', 'Edges');
        this.onChange = () => null;
        this.addLinkFolder('Dependencies', this.params.dependencies);
        this.addLinkFolder('Hierarchy', this.params.hierarchy);
    }

    addLinkFolder(title, params) {
        const onChange = () => this.onChange();
        const folder = this.gui.addFolder(title);
        folder.add(params, 'distance', 1, 100, 0.1).name('distance').onChange(onChange);
        folder.add(params, 'strength', 1, 100, 0.1).name('strength').onChange(onChange);
        folder.add(params, 'width', 0.1, 10, 0.1).name('width').onChange(onChange);
        folder.addColor(params, 'color').name('Color').onChange(onChange);
        return folder;
    }
}
