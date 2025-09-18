import {DisplayUpdater} from "/lib/display-updater.js"
import {PhysicsUpdater} from "/lib/physics-updater.js"
import {DatasetUpdater} from "/lib/dataset-updater.js"
import {GLOBAL_STATE} from "/config/global-state.js";


export class App {
    constructor(layout) {
        this.state = GLOBAL_STATE;
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
        const infos = await this.dataset.moduleInfos();
        this.layout.graph.rebuild(dependencies, infos, this.state.display);
        await this.apply();
    }

    async apply() {
        await this.dataset.apply()
        await this.display.apply();
        await this.physics.apply();

        //FIXME: This should not be necessary ! (link color is wrong, relative to groupHierarchyDepth)
        await this.display.apply();
        await this.physics.apply();

    }
}


