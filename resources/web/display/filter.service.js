import { P } from "../project/project.service.js"
import { GraphFilter } from "./filter/graph.filter.js"
import { G } from "./graph.service.js";


export class FilterService {
    static singleton = new FilterService();

    constructor() {
        this.hierarchyPruneLevel = 4;
        this.forbiddenNodes = [];
    }

    apply() {
        G.rebuildGraph();
    }

    pipeline() {
        return [
            graph => new GraphFilter(P.project.config(), this.forbiddenNodes).apply(graph),
            this.nodeReducer((node) => {
                return node.split('.').slice(0, this.hierarchyPruneLevel).join('.');
            })
        ];
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
export const FF = FilterService.singleton;