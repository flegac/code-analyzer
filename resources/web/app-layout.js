import { GraphView } from "/view/graph-view.js"
import { TreeView } from "/view/tree-view.js"
import { TableView } from "/view/table-view.js"
import { CameraController } from "/view/camera-controller.js"

export class AppLayout {
    constructor() {
        this.graph = new GraphView();
        this.tree = new TreeView();
        this.table = new TableView();
        this.cam = new CameraController().takeControl(this.graph);
    }
}