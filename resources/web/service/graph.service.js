import {DisplayService} from "/service/display.service.js"
import {PhysicsService} from "/service/physics.service.js"
import {DatasetService} from "/service/dataset.service.js"
import {LayoutService} from "/service/layout.service.js"
import {CameraService} from "/service/camera.service.js"
import {GroupStrategy} from "/model/group.strategy.model.js";


export class GraphService {
    static singleton = new GraphService()

    constructor() {

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
        console.log('initialize', this);
    }

    navigation() {
        return this._navigation;
    }

    select(node) {
        this.selected = node;
        if (this.selected === null) this._navigation = {
            selected: null,
            incoming: [],
            outgoing: []
        };
        this._navigation = {
            selected: this.selected,
            incoming: this.selected.incoming,
            outgoing: this.selected.outgoing,
        };
        this.listeners.forEach(cb => cb(this._navigation));
    }

    onNavigationChange(cb) {
        this.listeners.add(cb);
    }

    offNavigationChange(cb) {
        this.listeners.delete(cb);
    }


    updateGroup() {
        const state = DisplayService.singleton.nodes;
        const strategy = new GroupStrategy(state.mesh.colorGroupDepthRange - 1);
        this.nodes.forEach(node => {
            node.group = strategy.apply(node.id);
            node.infos.group = node.group;
        });
    }


    updateConnectivityStats() {
        this.nodes.forEach(node => {
            node.outgoing = [];
            node.incoming = [];
        });
        this.links.forEach(link => {
            this.nodeById[link.source].outgoing.push(link.target);
            this.nodeById[link.target].outgoing.push(link.source);
        });
        const centrality = DatasetService.singleton.state.computeCentrality();
        this.nodes.forEach(node => {
            node.centrality = node.infos.centrality = centrality[node.id];
        });
    }

    updateDisplayParameters() {
        this.nodes.forEach(node => {
            const value = node.infos[DisplayService.singleton.nodes.mesh.size] ?? 1;
            node.radius = Math.max(1, Math.cbrt(1 + value));
        });
    }

    async rebuildGraph() {
        this.selected = null;
        const relation = DatasetService.singleton.state.relation();
        const nodesInfos = DatasetService.singleton.state.nodes();
        const hierarchy = DatasetService.singleton.state.hierarchy();
        if (relation === null) {
            return;
        }
        const state = DisplayService.singleton.nodes;

        const nodeIds = new Set([
            ...relation.nodes(),
            ...hierarchy.nodes()
        ]);

        this.links = [
            ...hierarchy.links(),
            ...relation.links(),
        ];
        this.nodes = Array.from(nodeIds).map(id => {
            const nodeInfos = nodesInfos?.[id] ?? {};
            return {
                id,
                infos: nodeInfos,
                // better transitions with old positions
                x: this.nodeById[id]?.x,
                y: this.nodeById[id]?.y,
                z: this.nodeById[id]?.z,
            };
        });
        this.nodeById = Object.fromEntries(
            this.nodes.map(n => [n.id, n])
        );

        this.updateGroup();
        this.updateDisplayParameters();
        this.updateConnectivityStats();

        const graph = LayoutService.singleton.graph;
        graph.reload(this.nodes, this.links);
        CameraService.singleton.takeControl(graph);

        await this.apply();
    }

    async apply() {
        await PhysicsService.singleton.apply();
        await DisplayService.singleton.apply();
    }

    nodeReducer(mapping) {
        return (graph) => {

            if (graph === null) {
                return null;
            }

            const nodes = new Set();
            const reducedAdjacency = new Map();

            for (const [src, targets] of Object.entries(graph)) {
                const mappedSrc = mapping(src);
                nodes.add(mappedSrc);

                for (const tgt of targets) {
                    const mappedTgt = mapping(tgt);
                    nodes.add(mappedTgt);

                    if (mappedSrc === mappedTgt) continue;
                    if (!reducedAdjacency.has(mappedSrc)) {
                        reducedAdjacency.set(mappedSrc, new Set());
                    }
                    reducedAdjacency.get(mappedSrc).add(mappedTgt);
                }
            }
            const result = {};
            for (const node of nodes) {
                result[node] = [];
            }
            for (const [node, neighbors] of reducedAdjacency.entries()) {
                result[node] = Array.from(neighbors);
            }
            return result;
        }
    }

}


