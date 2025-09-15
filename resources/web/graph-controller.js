class GraphController extends GuiGraphController {
    constructor(updater) {
        super('controller', 'Debug');
        this.updater = updater;
        this.control = {
            dataset: new DatasetController(this.updater),
            display: new DisplayController(this.updater),
            physics: new PhysicsController(this.updater),
        }
        const debugInfos = new RenderDebug(() => this.updater.graph.graph.renderer());
        debugInfos.start();
        debugInfos.loadGui(this.gui);
    }
}

