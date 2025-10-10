import { MyNode } from "../visuals/graph.service";

export class ClusterStrategy {
    apply(node: MyNode) {
        return node.id;
    }

    computeGroupMap(nodes: MyNode[]) {
        const groupMap: Map<string, MyNode[]> = new Map();
        for (const node of nodes) {
            const group = this.apply(node);
            if (!groupMap.has(group)) groupMap.set(group, []);
            groupMap.get(group)?.push(node);
        }
        return groupMap;
    }
}


