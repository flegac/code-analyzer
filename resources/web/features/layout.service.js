import {BaseComponent} from "/gui/core/base.component.js";

import {AppLayoutComponent} from "/gui/app.layout.component.js"
import {GraphCanvasComponent} from "/gui/graph.canvas.component.js"
import {GraphTableComponent} from "/gui/graph.table.component.js"
import {SettingsComponent} from "/gui/settings/graph.settings.component.js";
import {DatasetComponent} from "/gui/dataset.component.js"
import {NavigationComponent} from "/gui/navigation.component.js"
import {RendererDebugComponent} from "/gui/renderer.debug.component.js"
import {ToolBox} from "/gui/core/base.toolbox.component.js";

import {Billboard} from "/display/mesh/billboard.mesh.model.js"
import {GraphService} from "/display/graph.service.js"
import {DatasetService} from "/dataset/dataset.service.js"
import {CameraService} from "/display/camera.service.js"
import {GraphFilterComponent} from "/gui/graph.filter.component.js";


export class LayoutService {
    static singleton = new LayoutService()

    constructor() {
        this.layout = new AppLayoutComponent();


        this.graph = this.layout.addComponent('graph-view', new GraphCanvasComponent());

        this.dataset = this.layout.addComponent('graph-view', new DatasetComponent());


        this.dataset = new DatasetComponent();
        this.table = this.layout.addComponent('graph-table', new GraphTableComponent());

        this.settings = this.layout.addComponent('graph-settings', new SettingsComponent());
        this.navigation = this.layout.addComponent('navigation', new NavigationComponent());
        this.rendererDebug = this.layout.addComponent('debug', new RendererDebugComponent());
        this.graphFilter = this.layout.addComponent('graph-filter', new GraphFilterComponent());


        this.toolbox = this.layout.addComponent('graph-toolbox', new ToolBox())
            .newButton({
                label: '📂',
                tooltip: 'Open project',
                onClick: () => this.dataset.openBrowser()
            })
            .newButton({
                label: '🔄',
                tooltip: 'Refresh graph data',
                onClick: () => GraphService.singleton.rebuildGraph()
            })
            .newButton({
                label: '📊',
                tooltip: 'Node tabular data',
                onClick: this.groupAction(this.table)
            })
            .newButton({
                label: '🧭',
                tooltip: 'Navigation panel',
                onClick: this.groupAction(this.navigation)
            })
            .newButton({
                label: '⚙️',
                tooltip: 'Settings panel',
                onClick: this.groupAction(this.settings)
            })
            .newButton({
                label: '🏷️',
                tooltip: 'Filter panel',
                onClick: this.groupAction(this.graphFilter)
            })
            .newButton({
                label: '🐞',
                tooltip: 'GL Renderer panel',
                onClick: () => this.rendererDebug.toggleVisibility()
            })
        ;
        this.layout.start();

        console.log('initialize', this);
    }

    groupAction(item) {
        const ll = this.layout;

        const g = [
            this.settings,
            this.navigation,
            // this.rendererDebug,
            this.table,
            this.graphFilter
        ];
        return () => {
            BaseComponent.toggleGroupVisibility(g, item);
            ll.updateSplitPanelVisibility();
        };
    }

    async start() {
        const G = GraphService.singleton;

        $(() => {
            G.initGraph(this.graph.container);
            const renderer = G.getGraph().renderer();
            this.rendererDebug.start(renderer);

            Billboard.startAutoOrientation(
                () => GraphService.singleton.getGraph().scene(),
                () => CameraService.singleton.camera().position
            );

        });

    }

    async changeDataset(dataset) {
        DatasetService.singleton.loadDataset(dataset);
        await GraphService.singleton.rebuildGraph();
        this.table.rebuild(dataset.nodes());
        this.graphFilter.rebuild(dataset.config())
    }
}
