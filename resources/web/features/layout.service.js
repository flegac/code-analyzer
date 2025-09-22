import { BaseComponent } from "/gui/core/base.component.js";

import { AppLayoutComponent } from "/gui/app.layout.component.js"
import { GraphCanvasComponent } from "/gui/graph.canvas.component.js"
import { GraphTableComponent } from "/gui/graph.table.component.js"
import { SettingsComponent } from "/gui/settings/graph.settings.component.js";
import { DatasetComponent } from "/gui/dataset.component.js"
import { NavigationComponent } from "/gui/navigation.component.js"
import { RendererDebugComponent } from "/gui/renderer.debug.component.js"

import { NodeMeshModel } from "/display/mesh/node.mesh.model.js"
import { GraphService } from "/display/graph.service.js"
import { DatasetService } from "/dataset/dataset.service.js"


export class LayoutService {
    static singleton = new LayoutService()

    constructor() {
        this.graph = new GraphCanvasComponent();
        this.dataset = new DatasetComponent();

        this.layout = new AppLayoutComponent();
        this.dataset = new DatasetComponent();
        this.table = new GraphTableComponent();

        this.settings = new SettingsComponent();
        this.navigation = new NavigationComponent();
        this.rendererDebug = new RendererDebugComponent();

        //default visible panel
        this.settings.toggleVisibility({ visibility: true });


        this.layout.startup({

            'graph-view': () => [
                this.graph
            ],

            'debug': () => [
                this.rendererDebug,
            ],
            'navigation': () => [
                this.navigation,
            ],
            'graph-settings': () => [
                this.settings
            ],
            'graph-table': async () => [
                this.table
            ],
        });

        const g = [
            this.settings,
            this.navigation,
            this.rendererDebug,
            this.table
        ];

        function groupAction(item) {
            return () => {
                BaseComponent.toggleGroupVisibility(g, item);
            }
        }

        this.layout.toolbox.newButton({
            label: '📂',
            tooltip: 'Open project',
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
            onClick: () => this.rendererDebug.toggleVisibility()
        });

        console.log('initialize', this);
    }

    async start() {
        const G = GraphService.singleton;
        NodeMeshModel.startAutoOrientation(
            () => G.getGraph().graphData().nodes,
            () => G.getGraph().camera()
        );
        $(() => {
            this.graph.startup();
            const renderer = G.getGraph().renderer();
            this.rendererDebug.start(renderer);
        });

    }

    async changeDataset(dataset) {
        DatasetService.singleton.loadDataset(dataset);
        await GraphService.singleton.rebuildGraph();
        this.table.rebuild(dataset.nodes());
    }
}
