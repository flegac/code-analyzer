import {GraphView} from "graph-view";
import {TreeView} from "tree-view";
import {TableView} from "table-view";

export class AppLayout {
    constructor() {
        this.graph = new GraphView();
        this.tree = new TreeView();
        this.table = new TableView();
    }
}