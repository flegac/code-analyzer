import {LayoutService} from "/core/layout.service.js"

import {DatasetService} from "/dataset/dataset.service.js"

import {GraphStyleService} from "/display/graph.style.service.js"
import {PhysicsService} from "/display/physics.service.js"
import {CameraService} from "/display/camera.service.js"
import {NodeService} from "/graph/node.service.js"


class GraphState {
    constructor() {
        this.graph = null;
        this.nodeById = {};
        this.nodes = [];
        this.links = [];
        this.selected = null
        this._navigation = {
            node: null,
            incoming: [],
            outgoing: []
        };
        this.listeners = new Set();
    }

    select(node) {
        this.selected = node;
        if (node === null) this._navigation = {
            selected: null,
            incoming: [],
            outgoing: []
        };
        this._navigation = {
            selected: node,
            incoming: node.incoming,
            outgoing: node.outgoing,
        };
        this.listeners.forEach(cb => cb(this._navigation));
    }
}

export class GraphService {
    static singleton = new GraphService()

    constructor() {
        this.state = new GraphState()
        console.log('initialize', this);
    }

    initGraph(container) {
        this.state.graph = ForceGraph3D()(
            container,
            // {controlType: 'trackball'}
        );
        this.state.graph.onEngineStop(() => {
            console.log('D3 simulation stopped !');
            PhysicsService.singleton.isActive = false;
        });

        this._patchNaNPositions();
        this._autoResize(container);

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

    navigation() {
        return this.state._navigation;
    }

    select(node) {
        this.state.select(node);
    }

    onNavigationChange(cb) {
        this.state.listeners.add(cb);
    }

    offNavigationChange(cb) {
        this.state.listeners.delete(cb);
    }

    updateGroup() {
        const tagger = NodeService.singleton.hierarchicDepthTagger(
            GraphStyleService.singleton.nodes.mesh.colorGroupDepthRange - 1
        );
        this.state.nodes.forEach(node => {
            node.group = node.infos.group = tagger(node);
        });
    }


    updateConnectivityStats() {

        // connectivity stats
        this.state.nodes.forEach(node => {
            node.outgoing = [];
            node.incoming = [];
        });
        this.state.links.forEach(link => {
            this.findNodeById(link.source).outgoing.push(link.target);
            this.findNodeById(link.target).outgoing.push(link.source);
        });

        // centrality
        const relation = DatasetService.singleton.state.relation();
        const centrality = NodeService.singleton.computeClosenessCentrality(relation);

        // node update
        this.state.nodes.forEach(node => {
            node.centrality = node.infos.centrality = centrality[node.id];
        });
    }

    updateDisplayParameters() {
        this.state.nodes.forEach(node => {
            const value = node.infos[GraphStyleService.singleton.nodes.mesh.size] ?? 1;
            node.radius = Math.max(1, Math.cbrt(1 + value));
        });
    }

    async rebuildGraph() {
        this.state.selected = null;

        const relation = DatasetService.singleton.state.relation();
        const nodesInfos = DatasetService.singleton.state.nodes();
        const hierarchy = DatasetService.singleton.state.hierarchy();
        if (relation === null) {
            return;
        }

        const nodeIds = new Set([
            ...relation.nodes(),
            ...hierarchy.nodes()
        ]);

        this.state.links = [
            ...hierarchy.links(),
            ...relation.links(),
        ];
        this.state.nodes = Array.from(nodeIds).map(id => {
            const nodeInfos = nodesInfos?.[id] ?? {};

            const old = this.findNodeById(id);
            return {
                id,
                infos: nodeInfos,
                // better transitions with old positions
                x: old?.x,
                y: old?.y,
                z: old?.z,
            };
        });
        this.state.nodeById = Object.fromEntries(
            this.state.nodes.map(n => [n.id, n])
        );

        this.updateGroup();
        this.updateDisplayParameters();
        this.updateConnectivityStats();

        // TODO: remove this dependency (LayoutService / graphComponent)
        const graphComponent = LayoutService.singleton.graph;
        graphComponent.reload(this.state.nodes, this.state.links);
        CameraService.singleton.takeControl(graphComponent);

        await this.apply();
    }

    async apply() {
        await PhysicsService.singleton.apply();
        await GraphStyleService.singleton.apply();
    }


}


