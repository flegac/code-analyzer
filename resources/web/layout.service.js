import { AppLayout } from "./app.layout.js"
import { CC } from "./camera.service.js"

import { G } from "./display/graph.service.js"
import { V } from "./display/visual.service.js"
import { P } from "./project/project.service.js"

import { BaseComponent } from "./gui/core/base.component.js";
import { GraphCanvasComponent } from "./gui/graph.canvas.component.js"
import { TableComponent } from "./gui/table.component.js"
import { SettingsComponent } from "./gui/settings.component.js";
import { ProjectComponent } from "./gui/project.component.js"
import { NavigationComponent } from "./gui/navigation.component.js"
import { RendererDebugComponent } from "./gui/renderer.debug.component.js"
import { ToolBox } from "./gui/core/base.toolbox.component.js";
import { ConfigComponent } from "./gui/config.component.js"
import { FilterComponent } from "./gui/filter/filter.component.js"
import { StatsComponent } from "./gui/stats.component.js"

import { Billboard } from "./mesh/billboard.mesh.model.js"


export class LayoutService {
    static singleton = new LayoutService()

    constructor() {
        this.layout = new AppLayout();

        this.graph = this.layout.addComponent('graph-view', new GraphCanvasComponent());
        this.project = this.layout.addComponent('graph-view', new ProjectComponent());
        this.table = this.layout.addComponent('graph-table', new TableComponent());

        this.settings = this.layout.addComponent('graph-settings', new SettingsComponent());
        this.filter = this.layout.addComponent('graph-filter', new FilterComponent());
        this.navigation = this.layout.addComponent('navigation', new NavigationComponent());
        this.rendererDebug = this.layout.addComponent('debug', new RendererDebugComponent());
        this.config = this.layout.addComponent('graph-config', new ConfigComponent());
        this.stats = this.layout.addComponent('graph-stats', new StatsComponent());
        
        this.toolbox = this.layout.addComponent('graph-toolbox', this.createToolbar());

        this.layout.start();
        console.log('initialize', this);
    }


    showTable() {
        this.table.toggleVisibility();
//        this.closeAll(this.table);
    }
    showFilter() {
        this.closeAll(this.filter);
    }
    showSettings() {
        this.closeAll(this.settings);
    }
    showConfig() {
        this.closeAll(this.config);
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
                onClick: () => G.rebuildGraph(),
            },
            {
                label: '📊',
                tooltip: 'Node tabular data',
                onClick: ()=>this.showTable(),
            },
        ]);

        toolBox.newGroup([

            {
                label: '🔍',
                tooltip: 'Filter panel',
                onClick: ()=>this.showFilter(),
            },
            {
                label: '⚙️',
                tooltip: 'Settings panel',
                onClick: ()=>this.showSettings(),
            },
            {
                label: '🏷️',
                tooltip: 'Config panel',
                onClick: ()=>this.showConfig(),
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


    closeAll(item=null) {
        const ll = this.layout;
        const g = [
            this.table,
            this.filter,
            this.settings,
            this.config
        ];
        g
            .filter(_ => _ !== item)
            .forEach(_ => _.toggleVisibility({visible: false}));
        if( item !== null) {
            item.toggleVisibility();
        }
        ll.updateSplitPanelVisibility();
    }


    graphPanel() {
        return this.graph.container;
        // return this.layout.getPanel('graph-view');
    }

    changeProject(project) {
        P.loadProject(project);
        G.rebuildGraph();

        this.table.rebuild();
        this.config.rebuild(project.filters);


        V.state.mesh.size = null; // P.state.numerics[0];
        V.state.mesh.color = null; //P.project.categories[0];

        this.settings.updateGui();
        this.filter.updateGui();
        V.apply();
    }


    async start() {
        $(() => {
            G.initGraph(this.graphPanel());
            const renderer = G.getGraph().renderer();

            Billboard.startAutoOrientation(
                () => G.getGraph().scene(),
                () => CC.camera().position
            );

            this.rendererDebug.toggleVisibility({ visible: false });
            this.rendererDebug.start(renderer);

            const target = this.settings;
            this.closeAll(target);
            target.toggleVisibility();
        });
    }
}
export const LL = LayoutService.singleton;