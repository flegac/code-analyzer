import {GraphCanvasComponent} from "/component/graph.canvas.component.js"
import {TableComponent} from "/component/table.component.js"

import {AppLayoutComponent} from "/component/app.layout.component.js"

import {DatasetComponent} from "/component/dataset.component.js"
import {NavigationComponent} from "/component/navigation.component.js"
import {NodesComponent} from "/component/nodes.component.js"
import {LinksComponent} from "/component/links.component.js"
import {PhysicsComponent} from "/component/physics.component.js"
import {RendererDebugComponent} from "/component/renderer.debug.component.js"

import {FpsComponent} from "/component/fps.component.js"
import {Billboard} from "/mesh/billboard.mesh.model.js"


export class LayoutService {
    static singleton = new LayoutService()

    constructor() {
        this.layout = new AppLayoutComponent();

        this.graph = new GraphCanvasComponent();
        this.table = new TableComponent();

        this.dataset = new DatasetComponent();
        this.navigation = new NavigationComponent();
        this.nodes = new NodesComponent()
        this.links = new LinksComponent()
        this.physics = new PhysicsComponent()

        this.rendererDebug = new RendererDebugComponent();
        this.fps = new FpsComponent();

        console.log('initialize', this);
    }

    async start() {

        Billboard.startAutoOrientation(() => this.graph.graph.graphData().nodes, () => this.graph.graph.camera());

        this.layout.loadComponents({
            'dataset': () => [
                this.dataset.container,
            ],
            'navigation': () => [
                this.navigation.container,
            ],
            'physics': () => [
                this.physics.container,
            ],
            'nodes': () => [
                this.nodes.container,
            ],
            'links': () => [
                this.links.container,
            ],
            'debug': () => [
                this.fps.container,
                this.rendererDebug.container,
            ],

            'graph-view': () => [
                this.graph.container
            ],

            'table-view': async () => [
                this.table.container
            ],
        });


        $(() => this.graph.startup());

        this.rendererDebug.start();
    }

}
