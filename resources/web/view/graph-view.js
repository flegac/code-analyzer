import {defaultDisplayProvider} from "/display/display-provider.js";
import {createDiv} from "/core/utils.js";
import {MyGraph} from "/graph/my-graph.js"
import {GroupStrategy} from "/graph/group-strategy.js";

export class GraphView {
    constructor() {
        this.container = createDiv('graph');
        this.displayProvider = defaultDisplayProvider;
        this.graph = this._rebuild();
        this.cam = null;
        this.selected = null;

        const graph = this;

        function updateBillboardOrientation() {
            const camera = graph.graph.camera();
            graph.graph.graphData().nodes.forEach(node => {
                if (node.mesh) {
                    node.mesh.group.lookAt(camera.position);
                }
            });
            requestAnimationFrame(updateBillboardOrientation);
        }

        updateBillboardOrientation();
        this._autoResize();
    }

    data() {
        return this.graph.graphData()
    }

    reset() {
        // TODO: why is it needed to reallocate a new Graph object ?
        if (this.graph && typeof this.graph._destructor === 'function') {
            this.graph._destructor();
        }
        this.graph = this._rebuild();

        //FIXME: this should not be necessary !
        this._autoPatch();

        if (this.cam !== null) {
            this.cam.takeControl(this);
        }

    }

    rebuild(dependencies, infos, state) {
        this.reset();

        const hierarchy = MyGraph.hierarchy(dependencies);
        const nodeIds = new Set([
            ...dependencies.getNodes(),
            ...hierarchy.getNodes()
        ]);

        const strategy = new GroupStrategy(state.nodes.colorGroupDepthRange - 1);

        this.graph.graphData({
            nodes: Array.from(nodeIds).map(id => {
                const group = strategy.apply(id);
                const nodeInfos = (infos && infos[id]) ?? {};
                nodeInfos.group = group;

                const value = nodeInfos[state.nodes.size] ?? 1;
                return {
                    id,
                    group: group,
                    infos: nodeInfos,
                    radius: Math.max(1, Math.cbrt(1 + value))
                };
            }),
            links: [
                ...hierarchy.getLinks(),
                ...dependencies.getLinks(),
            ]
        });
    }


    _rebuild() {
        this.selected = null;
        return ForceGraph3D()(this.container)
            .width(this.container.clientWidth)
            .height(this.container.clientHeight);
    }

    _autoResize() {
        const resizeObserver = new ResizeObserver(() => {
            this.graph
                .width(this.container.clientWidth)
                .height(this.container.clientHeight);
        });
        resizeObserver.observe(this.container);
    }

    _autoPatch() {
        this.graph.onEngineTick(() => {
            this.graph.graphData().nodes.forEach(n => {
                const radius = 200;
                if (isNaN(n.x)) n.x = radius * (Math.random() - .5);
                if (isNaN(n.y)) n.y = radius * (Math.random() - .5);
                if (isNaN(n.z)) n.z = radius * (Math.random() - .5);
            });
        });
    }

}
