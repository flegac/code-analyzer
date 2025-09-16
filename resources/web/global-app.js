import { TreeView } from "tree-view";
import { TableView } from "table-view";
import { GraphView } from "graph-view";


class AppLayout {
    constructor() {
        this.graph = new GraphView();
        this.tree = new TreeView();
        this.table = new TableView();
    }
}

export class GlobalApp {
    constructor() {
        this.state = APP_STATE;
        this.layout = new AppLayout();

        this.dataset = new DatasetUpdater(this);
        this.physics = new PhysicsUpdater(this);
        this.display = new DisplayUpdater(this);
    }

    async loadGraph() {
        await this.rebuildGraph();
    }

    async rebuildGraph() {
        const dependencies = await this.dataset.dependencies();
        this.layout.graph.rebuild(dependencies);
        await this.apply();
    }

    async apply() {

        await this.dataset.apply()
        await this.display.apply()
        await this.physics.apply()
        //FIXME: This should not be necessary ! (link color is wring, relative to groupHierarchyDepth)
        await this.display.apply()

        // TODO: better handling of that
        // TODO: automatic resize ?
        const renderer = new DisplayNodeUpdater(this.state.nodes)
        renderer.apply(this.layout.graph.graph);
    }
}
