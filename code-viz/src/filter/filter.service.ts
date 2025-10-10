import { P } from "../project/project.service.js";
import { GraphFilter } from "./graph.filter.js";
import { G } from "../visuals/graph.service.js";
import { AdjacencyGraph } from "../project/graph.model.js";


export class FilterService {
    static singleton = new FilterService();
    hierarchyPruneLevel: number;
    forbiddenNodes: string[];

    constructor() {
        this.hierarchyPruneLevel = 4;
        this.forbiddenNodes = [];
    }

    apply() {
        G.rebuildGraph();
    }

    pipeline() {
        return [
            (graph: AdjacencyGraph) => new GraphFilter(P.project.filters, this.forbiddenNodes).apply(graph),
            this.nodeReducer((node: string) => {
                return node.split('.').slice(0, this.hierarchyPruneLevel).join('.');
            })
        ];
    }


    nodeReducer(mapping: (n: string) => string) {
        return (graph: AdjacencyGraph) => {

            if (graph === null) {
                return null;
            }

            const nodes = new Set<string>();
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
            const result: AdjacencyGraph = {};
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