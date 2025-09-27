import {AppLayout} from "./app.layout.js"
import {CameraService} from "./camera.service.js"

import {GraphService} from "./display/graph.service.js"
import {StyleService} from "./display/style.service.js"
import {ProjectService} from "./project/project.service.js"

import {BaseComponent} from "./gui/core/base.component.js";
import {GraphCanvasComponent} from "./gui/graph.canvas.component.js"
import {TableComponent} from "./gui/table.component.js"
import {SettingsComponent} from "./gui/settings.component.js";
import {ProjectComponent} from "./gui/project.component.js"
import {NavigationComponent} from "./gui/navigation.component.js"
import {RendererDebugComponent} from "./gui/renderer.debug.component.js"
import {ToolBox} from "./gui/core/base.toolbox.component.js";
import {ConfigComponent} from "./gui/config.component.js"

import {Billboard} from "./mesh/billboard.mesh.model.js"


export class LayoutService {
    static singleton = new LayoutService()

    constructor() {
        this.layout = new AppLayout();

        this.graph = this.layout.addComponent('graph-view', new GraphCanvasComponent());
        this.project = this.layout.addComponent('graph-view', new ProjectComponent());
        this.table = this.layout.addComponent('graph-table', new TableComponent());

        this.settings = this.layout.addComponent('graph-settings', new SettingsComponent());
        this.navigation = this.layout.addComponent('navigation', new NavigationComponent());
        this.rendererDebug = this.layout.addComponent('debug', new RendererDebugComponent());
        this.graphFilter = this.layout.addComponent('graph-filter', new ConfigComponent());
        this.toolbox = this.layout.addComponent('graph-toolbox', this.createToolbar());

        this.layout.start();
        console.log('initialize', this);
    }


    createToolbar() {
        const toolBox = new ToolBox();

        toolBox.newGroup([
            {
                label: '📂',
                tooltip: 'Open project',
                onClick: () => this.project.openBrowser(),
            },
            {
                label: '🔄',
                tooltip: 'Refresh graph data',
                onClick: () => GraphService.singleton.rebuildGraph(),
            },
            {
                label: '📊',
                tooltip: 'Node tabular data',
                onClick: this.groupAction(this.table),
            }
        ]);

        toolBox.newGroup([
            {
                label: '🧭',
                tooltip: 'Navigation panel',
                onClick: this.groupAction(this.navigation),
            },
            {
                label: '⚙️',
                tooltip: 'Settings panel',
                onClick: this.groupAction(this.settings),
            },
            {
                label: '🏷️',
                tooltip: 'Filter panel',
                onClick: this.groupAction(this.graphFilter),
            },
        ]);

        toolBox.newGroup([
            {
                label: '🐞',
                tooltip: 'GL Renderer panel',
                onClick: () => this.rendererDebug.toggleVisibility(),
            }
        ]);

        return toolBox;
    }


    groupAction(item) {
        const ll = this.layout;

        const g = [
            this.settings,
            this.navigation,
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
        const target = this.settings;
        $(() => {
            G.initGraph(this.graphPanel());
            const renderer = G.getGraph().renderer();

            Billboard.startAutoOrientation(
                () => G.getGraph().scene(),
                () => CameraService.singleton.camera().position
            );

            this.rendererDebug.toggleVisibility({visibility: false});
            this.rendererDebug.start(renderer);
            this.groupAction(target)();

            target.toggleVisibility();

        });

    }

    graphPanel() {
        return this.graph.container;
        // return this.layout.getPanel('graph-view');
    }

    async changeProject(project) {
        ProjectService.singleton.loadProject(project);
        await GraphService.singleton.rebuildGraph();

        this.table.rebuild();
        this.graphFilter.rebuild(project.config());

        const S = StyleService.singleton;

        S.mesh.size = null;// ProjectService.singleton.state.numerics()[0];
        S.mesh.color = ProjectService.singleton.project.categories()[0];

        this.settings.updateGui();
        S.apply();
    }
}
