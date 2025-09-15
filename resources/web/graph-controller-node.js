const SIZE_ATTRIBUTES = [
    'lines',
    'imported',
    'imports',
    'class_count',
    'method_count',
    'function_count',
    'loops',
    'branches'
];
const COLOR_ATTRIBUTES = [
    'group',
    'category',
];
class GraphControllerNode extends GuiGraphController {
    constructor(updater) {
        super('graph-node-controller', 'Nodes');
        this.updater = updater;

        const params = this.updater.params.nodes;
        this.gui.add(params, 'groupHierarchyDepth', 0, 5, 1)
            .name('Group hierarchy depth')
            .onChange(() => this.updater.children.nodes.apply(this.updater.graph))

        this.gui.add(params, 'scaleFactor', .05, 1., 0.01)
            .name('text size')
            .onChange(() => this.updater.children.nodes.apply(this.updater.graph));

        this.gui.add(params, 'color', COLOR_ATTRIBUTES)
            .name('color')
            .onChange(() => this.updater.children.nodes.apply(this.updater.graph));

        this.gui.add(params, 'size', SIZE_ATTRIBUTES)
            .name('size')
            .onChange(() => this.updater.children.nodes.apply(this.updater.graph));
    }
}
