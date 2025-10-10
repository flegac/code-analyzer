import { ClusterStrategy } from "./cluster.strategy.js";


export class AttributeClusterStrategy extends ClusterStrategy {
    nodeAttribute: any;
    constructor(nodeAttribute: string) {
        super();
        this.nodeAttribute = nodeAttribute;
    }

    apply(node) {
        return node.read(this.nodeAttribute);
    }
}
