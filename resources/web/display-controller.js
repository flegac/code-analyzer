class DisplayController extends GuiGraphController {
    constructor(updater) {
        super('graph-edge-controller', 'Display');
        this.updater = updater;
        const nodes = this.updater.state.nodes;
        const nodesFolder = this.gui.addFolder('Nodes');

        const onChange = () => this.updater.display.apply();
        const onChange2 = () => this.updater.apply();

        nodesFolder.add(nodes, 'groupHierarchyDepth', 0, 5, 1)
            .name('Group hierarchy depth').onChange(onChange2)
        nodesFolder.add(nodes, 'scaleFactor', .0, 1., 0.01)
            .name('text size').onChange(onChange);
        nodesFolder.add(nodes, 'color', COLOR_ATTRIBUTES)
            .name('color').onChange(onChange);
        nodesFolder.add(nodes, 'size', SIZE_ATTRIBUTES)
            .name('size').onChange(onChange);

        this.addLinkFolder('Dependencies', this.updater.state.links.dependencies);
        this.addLinkFolder('Hierarchy', this.updater.state.links.hierarchy);
    }

    addLinkFolder(title, params) {
        const onChange = () => this.updater.display.apply();
        const folder = this.gui.addFolder(title);
        folder.addColor(params, 'color').name('Color').onChange(onChange);
        folder.add(params, 'width', 0.1, 10, 0.1).name('width').onChange(onChange);
        folder.add(params, 'particles', 0, 5, 1).name('particles').onChange(onChange);
        return folder;
    }
}

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