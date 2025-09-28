import { ClusterStrategy } from "./cluster.strategy.js";


export class AttributeClusterStrategy extends ClusterStrategy {
    constructor(nodeAttribute) {
        super();
        this.nodeAttribute = nodeAttribute;
    }

    apply(node) {
        return node.read(this.nodeAttribute);
    }
}
