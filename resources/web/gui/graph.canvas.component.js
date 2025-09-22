import { BaseComponent } from "/gui/core/base.component.js";
import { GraphService } from "/display/graph.service.js"

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
        GraphService.singleton.initGraph(this.container)
    }

    getGraph() {
        return GraphService.singleton.state.graph;
    }

    startup() {

        const resizeObserver = new ResizeObserver(() => {
            const container = this.container.parentElement;
            const style = getComputedStyle(container);

            const width = container.clientWidth
                - parseFloat(style.paddingLeft)
                - parseFloat(style.paddingRight)
                - parseFloat(style.marginLeft)
                - parseFloat(style.marginRight)

            const height = container.clientHeight
                - parseFloat(style.paddingTop)
                - parseFloat(style.paddingBottom)
                - parseFloat(style.marginTop)
                - parseFloat(style.marginBottom)


            this.getGraph().width(width);
            this.getGraph().height(height);

        });

        const element = document.querySelector('[name="graph-view"]');
        resizeObserver.observe(element);
    }


    reload(nodes, links) {
        this.getGraph().graphData({ nodes, links });
    }

}
