export class GraphCanvasComponent {
    constructor() {
        this.container = window.document.createElement('div');
        this.container.id = 'graph-view';
        this.graph = ForceGraph3D()(this.container, {controlType: 'orbit'});

        this._patchNaNPositions();
    }

    startup() {
        const resizeObserver = new ResizeObserver(() => {
            const {offsetWidth, offsetHeight} = this.container.parentElement;
            this.graph.width(offsetWidth-10);
            this.graph.height(offsetHeight-35);
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
