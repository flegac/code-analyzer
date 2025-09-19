import { LinkDisplay } from "/model/link.display.model.js"
import { NodeDisplay } from "/model/node.display.model.js"


class GraphDisplay {
    constructor() {
        this.node = new NodeDisplay();
        this.link = new LinkDisplay();
    }

    async apply(graph, state) {
        await this.link.apply(graph);
        await this.node.apply(graph, state);
    }
}

export { LinkDisplay, NodeDisplay, GraphDisplay };
