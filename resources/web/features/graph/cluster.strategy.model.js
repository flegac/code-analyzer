export class ClusterStrategy {
    constructor(collapsingDepth = 0) {
        this.collapsingDepth = collapsingDepth;
    }

    apply(label) {
        const parts = label.split('.');
        const total = parts.length;

        const limit = Math.min(this.collapsingDepth + 1, total);
        const kept = parts.slice(0, limit).join('.');
        return kept || label;
    }

    computeGroupMap(nodes) {
        const groupMap = new Map();
        for (const node of nodes) {
            const group = this.apply(node.id);
            if (!groupMap.has(group)) groupMap.set(group, []);
            groupMap.get(group).push(node);
        }
        return groupMap;
    }
}