import { RenderDebug } from "render-debug"

export class GraphController extends GuiGraphController {
    constructor(updater) {
        super('controller', 'Debug');
        this.updater = updater;

        this.dataset = new DatasetController(this.updater);
        this.display = new DisplayController(this.updater)
        this.physics = new PhysicsController(this.updater)

        const debugInfos = new RenderDebug(() => this.updater.layout.graph.graph.renderer());
        debugInfos.start();
        debugInfos.loadGui(this.gui);
    }
}

