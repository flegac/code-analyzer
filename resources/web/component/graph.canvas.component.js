import {BaseComponent} from "/component/base.component.js";

const CSS = `
#graph-canvas {
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
            id: 'graph-canvas',
            style: CSS,
        });
        this.graph = this.buildGraph()
        this._patchNaNPositions();
    }

    buildGraph() {
        return ForceGraph3D()(
            this.container,
            // {controlType: 'trackball'}
        );
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


            this.graph.width(width);
            this.graph.height(height);

        });

        const element = document.querySelector('[name="graph-view"]');
        resizeObserver.observe(element);
    }


    reload(nodes, links) {
        this.graph.graphData({nodes, links});
    }

    _patchNaNPositions(r = 200) {
        if (this.graph === null) return
        this.graph.onEngineTick(() => {
            this.graph.graphData().nodes.forEach(n => {
                if (isNaN(n.x)) n.x = r * (Math.random() - 0.5);
                if (isNaN(n.y)) n.y = r * (Math.random() - 0.5);
                if (isNaN(n.z)) n.z = r * (Math.random() - 0.5);
            });
        });
    }
}
