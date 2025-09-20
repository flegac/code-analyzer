import {DisplayService} from "/service/display.service.js"
import {PhysicsService} from "/service/physics.service.js"
import {DatasetService} from "/service/dataset.service.js"
import {LayoutService} from "/service/layout.service.js"
import {CameraService} from "/service/camera.service.js"
import {GroupStrategy} from "/model/group.strategy.model.js";

export class GraphService {
    static singleton = new GraphService()

    constructor() {
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

    async rebuildGraph() {
        this.selected = null;

        const relation = DatasetService.singleton.state.relation();

        const centrality = DatasetService.singleton.state.computeCentrality();

        const moduleInfos = DatasetService.singleton.state.moduleInfos();
        const hierarchy = DatasetService.singleton.state.hierarchy();
        if (relation === null) {
            return;
        }

        const state = DisplayService.singleton.nodes;

        const nodeIds = new Set([
            ...relation.nodes(),
            ...hierarchy.nodes()
        ]);
        const strategy = new GroupStrategy(state.mesh.colorGroupDepthRange - 1);
        const links = [
            ...hierarchy.links(),
            ...relation.links(),
        ];
        const nodes = Array.from(nodeIds).map(id => {
            const nodeInfos = {...(moduleInfos?.[id] ?? {}), group: strategy.apply(id)};
            nodeInfos['centrality'] = centrality[id];
            const value = nodeInfos[state.mesh.size] ?? 1;
            return {
                id,
                centrality: centrality[id],
                group: nodeInfos.group,
                infos: nodeInfos,
                radius: Math.max(1, Math.cbrt(1 + value)),
                outgoing: links.filter(e => e.source === id).map(e => e.target),
                incoming: links.filter(e => e.target === id).map(e => e.source),
            };
        });

        const graph = LayoutService.singleton.graph;

        graph.reload(nodes, links);
        CameraService.singleton.takeControl(graph);

        await this.apply();
    }

    async apply() {
        LayoutService.singleton.tree.rebuild(await DatasetService.singleton.state.hierarchy());
        await DisplayService.singleton.apply();
        await PhysicsService.singleton.apply();
        //FIXME: This should not be necessary ! (link color is wrong, relative to groupHierarchyDepth)
        await DisplayService.singleton.apply();
        await PhysicsService.singleton.apply();
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


