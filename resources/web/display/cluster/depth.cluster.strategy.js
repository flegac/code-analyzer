import { ClusterStrategy } from "./cluster.strategy.js";


export class DepthClusterStrategy extends ClusterStrategy {
    constructor(collapsingDepth = 0) {
        super();
        this.collapsingDepth = collapsingDepth;
    }

    apply(node) {
        const label = node.id;
        const parts = label.split('.');
        const total = parts.length;

        const limit = Math.min(this.collapsingDepth, total);
        const kept = parts.slice(0, limit).join('.');
        return kept || label;
    }

}
