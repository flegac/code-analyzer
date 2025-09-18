import { GraphView } from "/gui/graph-view.js"
import { TreeView } from "/gui/tree-view.js"
import { TableView } from "/gui/table-view.js"
import { CameraController } from "/gui/camera-controller.js"

export class AppLayout {
    constructor() {
        this.graph = new GraphView();
        this.tree = new TreeView();
        this.table = new TableView();
        this.cam = new CameraController().takeControl(this.graph);
    }
}