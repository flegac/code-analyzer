import {RenderDebug} from "render-debug"

export class AppController extends GuiGraphController {
    constructor(updater) {
        super('controller', 'Debug');
        this.app = updater;

        this.dataset = new DatasetController(updater);
        this.display = new DisplayController(updater)
        this.physics = new PhysicsController(updater)

        const debugInfos = new RenderDebug(() => this.app.layout.graph.graph.renderer());
        debugInfos.start();
        debugInfos.loadGui(this.gui);
    }
}

