

class GraphNodeController {
    constructor(params) {
        this.onChange = () => null;
        this.gui = new lil.GUI();
        this.gui.domElement.id = 'graph-node-controller';
        this.container = this.gui.domElement;
        this.params = params;
    }
}
