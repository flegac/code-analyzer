import { AttributeClusterStrategy } from "./cluster/attribute.cluster.strategy.js";
import { DepthClusterStrategy } from "./cluster/depth.cluster.strategy.js";

export class ClusterService {
    static singleton = new ClusterService();

    constructor() {
        this.groupStrategy = new DepthClusterStrategy(3);
        this.collapseStrategy = new DepthClusterStrategy(3);
    }

    setGroupByDepth(depth) {
        this.groupStrategy = new DepthClusterStrategy(depth);
    }

    setGroupByLabel(label = 'group') {
        this.groupStrategy = new AttributeClusterStrategy(label);
    }

    setCollapseByDepth(depth) {
        this.collapseStrategy = new DepthClusterStrategy(depth);
    }

}
export const CC = ClusterService.singleton;
