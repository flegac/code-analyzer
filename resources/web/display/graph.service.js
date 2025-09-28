import {LayoutService} from "../layout.service.js"
import {CameraService} from "../camera.service.js"

import {P} from "../project/project.service.js"
import {V} from "./visual.service.js"
import {PP} from "./physics.service.js"
import {NodeService} from "./node.service.js"

import {ClosenessCentrality} from "./metrics/closeness.centrality.metrics.js"
import {CycleCounter} from "./metrics/cycle.count.metrics.js";


class GraphState {
    constructor() {
        this.graph = null;
        this.nodeById = {};
        this.nodes = [];
        this.links = [];
        this.selected = null
        this.listeners = new Set();
    }

    select(node) {
        this.selected = node;
        this.listeners.forEach(cb => cb(this.selected));
    }
}

export class GraphService {
    static singleton = new GraphService()

    constructor() {
        this.state = new GraphState()
        console.log('initialize', this);
    }

    initGraph(container) {
        console.log('G.initGraph', container);

        this.state.graph = ForceGraph3D()(
            container,
            // {controlType: 'trackball'}
        );
        this.state.graph.onEngineStop(() => {
            console.log('D3 simulation stopped !');
            PP.isActive = false;
        });

        this._patchNaNPositions();
        this._autoResize(container);
        CameraService.singleton.takeControl(container);

    }

    _autoResize(container) {
        const resizeObserver = new ResizeObserver(() => {
            const parent = container.parentElement;
            const style = getComputedStyle(container);

            const width = parent.clientWidth
                - parseFloat(style.paddingLeft)
                - parseFloat(style.paddingRight)
                - parseFloat(style.marginLeft)
                - parseFloat(style.marginRight)

            const height = parent.clientHeight
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


    _patchNaNPositions(r = 1000) {
        if (this.getGraph() === null) return
        this.getGraph().onEngineTick(() => {
            this.getGraph().graphData().nodes.forEach(n => {
                if (isNaN(n.x)) n.x = r * (Math.random() - 0.5);
                if (isNaN(n.y)) n.y = r * (Math.random() - 0.5);
                if (isNaN(n.z)) n.z = r * (Math.random() - 0.5);
            });
        });
    }

    getGraph() {
        return this.state.graph;
    }

    findNodeById(id) {
        return this.state.nodeById[id];
    }

    select(node) {
        this.state.select(node);
    }

    onSelectionChange(cb) {
        this.state.listeners.add(cb);
    }


    async rebuildGraph() {
        const N = NodeService.singleton;
        const project = P.project;

        this.state.selected = null;

        const relation = project.relation();
        if (relation === null) {
            return;
        }

        const hierarchy = project.hierarchy();

        const nodeIds = new Set([
            ...relation.nodes(),
            ...hierarchy.nodes()
        ]);

        // TODO: customize links with read/write for metadata ?
        this.state.links = [
            ...hierarchy.links(),
            ...relation.links(),
        ];
        this.state.nodes = Array.from(nodeIds).map(id => {
            const old = this.findNodeById(id);
            const node = {
                id,
                x: old?.x,
                y: old?.y,
                z: old?.z,
                read: label => N.read(label, id),
                readAll: () => N.readAll(id),
                write: (label, value) => N.write(label, id, value),
            };
            // copy project values in node
            // TODO: remove that ?
            project.labels().forEach(label => {
                const value = project.read(label, id);
                if (value !== null) {
                    N.write(label, id, value)
                }
            });

            return node;
        });
        this.state.nodeById = Object.fromEntries(
            this.state.nodes.map(n => [n.id, n])
        );

        this.getGraph().graphData({
            nodes: this.state.nodes,
            links: this.state.links
        });

        N.updateMetrics();
        N.updateGroup();
        N.updateRadius();
        N.updateColor();
        N.updateNavigation();

        V.rebuildMeshes();

        await PP.apply();
        V.apply();

        LayoutService.singleton.table.rebuild();

    }

}
export const G = GraphService.singleton;

