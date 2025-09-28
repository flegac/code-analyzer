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


