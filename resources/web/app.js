import {DisplayUpdater} from "display-updater";

export class App {
    constructor(layout, state) {
        this.state = state;
        this.layout = layout;

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
        await this.display.apply();
        await this.physics.apply();

        //FIXME: This should not be necessary ! (link color is wrong, relative to groupHierarchyDepth)
        await this.display.apply();

    }
}


