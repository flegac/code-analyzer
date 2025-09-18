import {defaultDisplayProvider} from "/display/display-provider.js";
import {MyGraph} from "/graph/my-graph.js"
import {GroupStrategy} from "/graph/group-strategy.js";

export class GraphView {
    constructor() {
        this.container = window.document.createElement('div');
        this.container.id = 'graph-view';
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
            ...dependencies.nodes(),
            ...hierarchy.nodes()
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
                ...hierarchy.links(),
                ...dependencies.links(),
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
        const resize = () => {
            const w = this.container.offsetWidth;
            const h = this.container.offsetHeight;
            if (w > 0 && h > 0) {
                this.graph.width(w).height(h);
            }
        };

        // Resize initial
      requestAnimationFrame(resize);


        // Resize quand l'onglet devient actif
        const rightTabs = document.getElementById('right-tabs');
        if (rightTabs) {
            rightTabs.addEventListener('sl-tab-show', (event) => {
                if (event.detail.name === 'graph-view') {
                requestAnimationFrame(resize);

                }
            });
        }

        // Resize quand la fenêtre change
        window.addEventListener('resize', resize);

        // Resize quand le conteneur change (ex: split-panel)
        const resizeObserver = new ResizeObserver(resize);
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
