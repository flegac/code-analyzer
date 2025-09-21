import {AppLayoutComponent} from "/component/app.layout.component.js"

import {GraphCanvasComponent} from "/component/graph.canvas.component.js"
import {TableComponent} from "/component/table.component.js"
import {SettingsComponent} from "/component/graph.settings.component.js";

import {DatasetComponent} from "/component/dataset.component.js"
import {NavigationComponent} from "/component/navigation.component.js"
import {RendererDebugComponent} from "/component/renderer.debug.component.js"
import {FpsComponent} from "/component/fps.component.js"

import {NodeMeshModel} from "/mesh/node.mesh.model.js"

import {GraphService} from "/service/graph.service.js"


export class LayoutService {
    static singleton = new LayoutService()

    constructor() {
        this.layout = new AppLayoutComponent();
        this.dataset = new DatasetComponent();
        this.graph = new GraphCanvasComponent();
        this.table = new TableComponent();
        this.rendererDebug = new RendererDebugComponent();
        this.fps = new FpsComponent();

        this.settings = new SettingsComponent();
        this.navigation = new NavigationComponent();

        this.layout.toolbox.newButton('📂', () => this.dataset.openBrowser());
        this.layout.toolbox.newButton('🔄', () => GraphService.singleton.rebuildGraph())
        this.layout.toolbox.newButton('⚙️', () => this.settings.toggleVisibility());
        this.layout.toolbox.newButton('🧭', () => this.navigation.toggleVisibility());

        console.log('initialize', this);
    }

    async start() {
        this.layout.startup({
            'navigation': () => [
                this.navigation,
            ],
            'debug': () => [
                //TODO: only one component is enough for that
                this.fps,
                this.rendererDebug,
            ],
            'graph-view': () => [
                this.graph
            ],
            'graph-settings': () => [
                this.settings
            ],

            'table-view': async () => [
                this.table
            ],
        });

        NodeMeshModel.startAutoOrientation(
            () => this.graph.graph.graphData().nodes,
            () => this.graph.graph.camera()
        );
        $(() => this.graph.startup());
        this.rendererDebug.start();
    }

}
