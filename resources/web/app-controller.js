import {RenderDebug} from "/view/render-debug.js"
import {GuiGraphController} from "/core/utils.js"
import {DatasetController} from "/dataset/dataset-controller.js"
import {DisplayController} from "/display/display-controller.js"
import {PhysicsController} from "/physics/physics-controller.js"

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

