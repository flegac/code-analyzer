export class ClusterStrategy {
    apply(node) {
        return node.id;
    }

    computeGroupMap(nodes) {
        const groupMap = new Map();
        for (const node of nodes) {
            const group = this.apply(node);
            if (!groupMap.has(group)) groupMap.set(group, []);
            groupMap.get(group).push(node);
        }
        return groupMap;
    }
}

export class ModuleDepthClusterStrategy extends ClusterStrategy {
    constructor(collapsingDepth = 0) {
        super()
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

export class AttributeClusterStrategy extends ClusterStrategy {
    constructor(nodeAttribute) {
        super()
        this.nodeAttribute = nodeAttribute;
    }

    apply(node) {
        return node.read(this.nodeAttribute);
    }
}
