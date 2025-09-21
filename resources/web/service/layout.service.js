import {AppLayoutComponent} from "/component/app.layout.component.js"
import {GraphCanvasComponent} from "/component/graph.canvas.component.js"
import {GraphTableComponent} from "/component/graph.table.component.js"
import {SettingsComponent} from "/component/graph.settings.component.js";
import {DatasetComponent} from "/component/dataset.component.js"
import {NavigationComponent} from "/component/navigation.component.js"
import {RendererDebugComponent} from "/component/renderer.debug.component.js"
import {NodeMeshModel} from "/mesh/node.mesh.model.js"
import {GraphService} from "/service/graph.service.js"
import {BaseComponent} from "/component/base.component.js";


export class LayoutService {
    static singleton = new LayoutService()

    constructor() {
        this.layout = new AppLayoutComponent();
        this.dataset = new DatasetComponent();
        this.graph = new GraphCanvasComponent();
        this.table = new GraphTableComponent();

        this.settings = new SettingsComponent();
        this.navigation = new NavigationComponent();
        this.rendererDebug = new RendererDebugComponent();

        this.layout.startup({
            'navigation': () => [
                this.navigation,
            ],
            'debug': () => [
                this.rendererDebug,
            ],
            'graph-view': () => [
                this.graph
            ],
            'graph-settings': () => [
                this.settings
            ],
            'graph-table': async () => [
                this.table
            ],
        });

        const g = [this.settings, this.navigation, this.rendererDebug,this.table];

        function groupAction(item) {
            return () => {
                BaseComponent.toggleGroupVisibility(g, item);
            }
        }

        this.layout.toolbox.newButton({
            label: '📂',
            tooltip:'Open project',
            onClick: () => this.dataset.openBrowser()
        });
        this.layout.toolbox.newButton({
            label: '🔄',
            tooltip: 'Refresh graph data',
            onClick: () => GraphService.singleton.rebuildGraph()
        })

        this.layout.toolbox.newButton({
            label: '🧭',
            tooltip: 'Navigation panel',
            onClick: groupAction(this.navigation)
        });
        this.layout.toolbox.newButton({
            label: '📊',
            tooltip: 'Node tabular data',
            onClick: groupAction(this.table)
        });
        this.layout.toolbox.newButton({
            label: '⚙️',
            tooltip: 'Settings panel',
            onClick: groupAction(this.settings)
        });
        this.layout.toolbox.newButton({
            label: '🕵️',
            tooltip: 'GL Renderer panel',
            onClick:() =>  this.rendererDebug.toggleVisibility()
        });


        console.log('initialize', this);
    }

    async start() {


        NodeMeshModel.startAutoOrientation(
            () => this.graph.graph.graphData().nodes,
            () => this.graph.graph.camera()
        );
        $(() => this.graph.startup());
        this.rendererDebug.start();
    }

}
