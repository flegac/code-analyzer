import {GuiGraphController} from "/core/utils.js"

export class DisplayController extends GuiGraphController {
    constructor(app) {
        super('graph-edge-controller', 'Display');
        this.app = app;

        const onChange = () => this.app.display.apply();
        const onChange2 = () => this.app.apply();

        // node
        const nodesFolder = this.gui.addFolder('Nodes');
        const nodes = this.app.state.display.nodes;
        nodesFolder.add(nodes, 'baseRadius', 0., 1000., 0.01)
            .name('radius').onChange(onChange);

        nodesFolder.add(nodes, 'colorGroupDepthRange', 0, 5, 1)
            .name('Color group depth range').onChange(onChange2);
        nodesFolder.add(nodes, 'color', COLOR_ATTRIBUTES)
            .name('color').onChange(onChange);
        nodesFolder.add(nodes, 'size', SIZE_ATTRIBUTES)
            .name('size').onChange(onChange);

        // text
        const textFolder = nodesFolder.addFolder('Text');
        textFolder.add(nodes.text, 'hiddenDepthRange', 0, 5, 1)
            .name('Hidden depth range').onChange(onChange2);
        textFolder.add(nodes.text, 'scaling', 0., 5., .01)
            .name('scaling').onChange(onChange);

        //links
        const links = this.app.state.display.links;
        linkControl(this.gui, links.hierarchy, 'hierarchy', onChange);
        linkControl(this.gui, links.dependencies, 'dependencies', onChange);
    }
}

function linkControl(gui, state, name, onChange) {
    const folder = gui.addFolder(name);
    folder.addColor(state, 'color').name('color').onChange(onChange);
    folder.add(state, 'particles', 0, 10, 1).name('particles').onChange(onChange);
    folder.add(state, 'width', 0, 30, 0.1).name('width').onChange(onChange);
}

//TODO make that automatic (from module infos)
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