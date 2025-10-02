import { LL } from "../layout.service.js"
import { CC } from "../camera.service.js"

import { P } from "../project/project.service.js"
import { V } from "./visual.service.js"
import { PP } from "./physics.service.js"
import { NN } from "./node.service.js"

import { ClosenessCentrality } from "./metrics/closeness.centrality.metrics.js"
import { CycleCounter } from "./metrics/cycle.count.metrics.js";


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
        CC.takeControl(container);

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

getDiameter() {
  const nodes = this.state.nodes;

  const xs = nodes.map(n => n.x).filter(x => Number.isFinite(x));
  const ys = nodes.map(n => n.y).filter(y => Number.isFinite(y));
  const zs = nodes.map(n => n.z).filter(z => Number.isFinite(z));

  if (xs.length === 0 || ys.length === 0 || zs.length === 0) return 0;

  const dx = Math.max(...xs) - Math.min(...xs);
  const dy = Math.max(...ys) - Math.min(...ys);
  const dz = Math.max(...zs) - Math.min(...zs);

  return (dx + dy + dz) / 3;
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


    rebuildGraph() {
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
                read: label => NN.read(label, id),
                readAll: () => NN.readAll(id),
                write: (label, value) => NN.write(label, id, value),
            };
            // copy project values in node
            // TODO: remove that ?
            project.labels.forEach(label => {
                const value = project.read(label, id);
                if (value !== null) {
                    NN.write(label, id, value)
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

        NN.updateMetrics();
        NN.updateGroup();
        NN.updateRadius();
        NN.updateColor();
        NN.updateNavigation();

        V.rebuildMeshes();

        PP.apply();
        V.apply();

        LL.table.rebuild();

    }

}
export const G = GraphService.singleton;

