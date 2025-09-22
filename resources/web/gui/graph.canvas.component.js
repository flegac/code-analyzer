import {BaseComponent} from "/gui/core/base.component.js";
import {GraphService} from "/display/graph.service.js"

const CSS = `
[name=graph-canvas] {
    position: absolute;
  top: 0;
  left: 0;
  width: 100% !important;
  height: 100% !important;
  pointer-events: auto;
  z-index: 0;
}
`;

export class GraphCanvasComponent extends BaseComponent {
    constructor() {
        super({
            style: CSS,
        });
    }

    getGraph() {
        return GraphService.singleton.state.graph;
    }

    reload(nodes, links) {
        this.getGraph().graphData({nodes, links});
    }

}
