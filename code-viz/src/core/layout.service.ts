import { AppLayout } from "../app.layout.js";
import { CC } from "./camera.service.js";

import { G } from "../visuals/graph.service.js";
import { V } from "../visuals/visual.service.js";
import { P } from "../project/project.service.js";

import { GraphCanvasComponent } from "../components/graph.canvas.component.js";
import { TableComponent } from "../components/table.component.js";
import { SettingsComponent } from "../components/settings.component.js";
import { ProjectComponent } from "../components/project.component.js";
import { NavigationComponent } from "../components/navigation.component.js";
import { RendererDebugComponent } from "../components/renderer.debug.component.js";
import { ToolBox } from "../components/core/base.toolbox.component.js";
import { ConfigComponent } from "../components/config.component.js";
import { FilterComponent } from "../components/filter/filter.component.js";
import { StatsComponent } from "../components/stats.component.js";

import { Billboard } from "./mesh/billboard.mesh.model.js";
import { BaseComponent } from "../components/core/base.component.js";
import { Project } from "../project/project.model.js";

export class LayoutService {
    static singleton = new LayoutService()
    layout: AppLayout;
    graph: GraphCanvasComponent;
    project: ProjectComponent;
    table: TableComponent;
    settings: SettingsComponent;
    filter: FilterComponent;
    navigation: NavigationComponent;
    rendererDebug: RendererDebugComponent;
    config: ConfigComponent;
    stats: StatsComponent;
    toolbox: ToolBox;

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
                onClick: () => this.showTable(),
            },
        ]);

        toolBox.newGroup([

            {
                label: '🔍',
                tooltip: 'Filter panel',
                onClick: () => this.showFilter(),
            },
            {
                label: '⚙️',
                tooltip: 'Settings panel',
                onClick: () => this.showSettings(),
            },
            {
                label: '🏷️',
                tooltip: 'Config panel',
                onClick: () => this.showConfig(),
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


    closeAll(item: BaseComponent | null = null) {
        const ll = this.layout;
        const g = [
            this.table,
            this.filter,
            this.settings,
            this.config
        ];
        g
            .filter(_ => _ !== item)
            .forEach(_ => _.toggleVisibility({ visible: false }));
        if (item !== null) {
            item.toggleVisibility();
        }
        ll.updateSplitPanelVisibility();
    }


    graphPanel() {
        return this.graph.container;
        // return this.layout.getPanel('graph-view');
    }

    changeProject(project: Project) {
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

            Billboard.startAutoOrientation(
                () => G.getGraph().scene(),
                () => CC.camera().position
            );

            this.rendererDebug.toggleVisibility({ visible: false });
            this.rendererDebug.start();

            const target = this.settings;
            this.closeAll(target);
            target.toggleVisibility();
        });
    }
}
export const LL = LayoutService.singleton;