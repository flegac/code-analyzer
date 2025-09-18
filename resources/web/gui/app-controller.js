import {DebugRendererView} from "/gui/control/debug-renderer-view.js"
import {DatasetController} from "/gui/control/dataset-controller.js"
import {LinksDisplayController} from "/gui/control/links-display-controller.js"
import {NodesDisplayController} from "/gui/control/nodes-display-controller.js"
import {PhysicsController} from "/gui/control/physics-controller.js"

export class AppController {
    constructor(updater) {
        this.app = updater;
        this.dataset = new DatasetController(updater);
        this.nodes = new NodesDisplayController(updater)
        this.links = new LinksDisplayController(updater)
        this.physics = new PhysicsController(updater)

        this.debugView = new DebugRendererView(() => this.app.layout.graph.graph.renderer());
    }
}

