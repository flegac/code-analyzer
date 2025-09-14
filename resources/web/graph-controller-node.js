const NODE_ATTRIBUTES = [
    'lines',
    'imported',
    'imports',
    'class_count',
    'method_count',
    'function_count',
    'loops',
    'branches'
];

class GraphControllerNode extends GuiGraphController {
    constructor(updater) {
        super('graph-node-controller', 'Nodes');
        this.updater = updater;

        this.gui.add(this.updater.params.nodes, 'scaleFactor', .05, 1., 0.01)
            .name('text size')
            .onChange(() => this.updater.children.nodes.apply(this.updater.graph));

        this.gui.add(this.updater.params.nodes, 'color', NODE_ATTRIBUTES)
            .name('color')
            .onChange(() => this.updater.children.nodes.apply(this.updater.graph));

        this.gui.add(this.updater.params.nodes, 'size', NODE_ATTRIBUTES)
            .name('size')
            .onChange(() => this.updater.children.nodes.apply(this.updater.graph));
    }
}
